import { OrderStatus } from '@prisma/client';
import { Injectable, ForbiddenException, NotFoundException, Optional, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { CreateOrderDto, SplitBillDto, RepeatOrderDto } from './dto/order.dto';
import { OfferService } from '../retail/offer/offer.service';
import { DrawerService } from '../staff/drawer.service';
import { NumberingService } from './numbering.service';
import { AuditLogService } from '../common/audit-log/audit-log.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { CrmService } from '../crm/crm.service';
import { KdsGateway } from '../restaurant/kds/kds.gateway';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto/notifications.dto';
import { DrovoService } from '../delivery-aggregator/drovo.service';
import { ZatcaReportingService } from '../zatca/zatca-reporting.service';
import { ShiftService } from '../staff/shift.service';

@Injectable()
export class OrderService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService,
        private offerService: OfferService,
        private numberingService: NumberingService,
        private mailService: MailService,
        @InjectQueue('orders') private orderQueue: Queue,
        @InjectQueue('pre-orders') private preOrderQueue: Queue,
        @Optional() private drawerService?: DrawerService,
        @Optional() private auditLog?: AuditLogService,
        @Optional() private analyticsService?: AnalyticsService,
        @Optional() private crmService?: CrmService,
        @Optional() private kdsGateway?: KdsGateway,
        @Optional() private notificationsService?: NotificationsService,
        @Optional() private drovoService?: DrovoService,
        @Optional() private zatcaService?: ZatcaReportingService,
        @Optional() private shiftService?: ShiftService,
    ) { }

    private get db() {
        return this.prisma.client.order;
    }

    async createAsync(dto: CreateOrderDto, userId?: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');
        const branchId = this.tenantService.getBranchId();

        // VALIDATION: Check for open shift and drawer if required
        await this.validateShiftAndDrawer(tenantId, branchId, userId);

        const job = await this.orderQueue.add('create-order', {
            orderData: {
                tableId: dto.tableId,
                customerId: dto.customerId,
                userId,
                totalAmount: dto.totalAmount,
                status: 'PENDING',
                branchId,
                deliveryAddress: dto.deliveryAddress,
            },
            items: dto.items,
            tenantId,
            branchId,
        });

        return { jobId: job.id, status: 'QUEUED' };
    }

    async createDirect(dto: CreateOrderDto & { userId?: string; orderType?: string; paymentMethod?: string; note?: string; paidAmount?: number; splitPayments?: { method: string, amount: number }[] }) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');
        const branchId = this.tenantService.getBranchId() || (dto as any).branchId;

        // VALIDATION: Check for open shift and drawer if required
        await this.validateShiftAndDrawer(tenantId, branchId, dto.userId);

        let finalTotalAmount = dto.totalAmount;
        let appliedDiscount = 0;

        // Process Loyalty redemption if provided
        let pointsToDeduct = 0;
        let loyaltyCashback = 0;
        if (dto.customerId) {
            // 1. Cashback redemption
            if (dto.redeemAsCashback && dto.loyaltyPointsToRedeem) {
                pointsToDeduct += dto.loyaltyPointsToRedeem;
                const tenantSettings = await (this.prisma.client as any).settings.findUnique({
                    where: { tenantId }
                });
                const redemptionRatio = tenantSettings?.loyaltyRatioRedemption || 0.01;
                loyaltyCashback = Number(dto.loyaltyPointsToRedeem) * Number(redemptionRatio);
                finalTotalAmount -= loyaltyCashback;
            }

            // 2. Reward Catalog items
            for (const item of dto.items) {
                if (item.isReward && item.pointsCost) {
                    pointsToDeduct += (item.pointsCost * item.quantity);
                }
            }
        }


        // Run everything in a single transaction for consistency
        return (this.prisma.client as any).$transaction(async (tx: any) => {
            let order;
            const branchId = this.tenantService.getBranchId();

            // 1. Check if there's an active order for this table to append items
            const existingOrder = dto.tableId ? await tx.order.findFirst({
                where: {
                    tableId: dto.tableId,
                    status: { in: ['PENDING', 'PREPARING', 'READY', 'HELD'] }
                },
                orderBy: { createdAt: 'desc' }
            }) : null;

            const paymentsData = dto.splitPayments && dto.splitPayments.length > 0
                ? dto.splitPayments.map(p => ({
                    amount: p.amount,
                    method: p.method,
                    status: 'COMPLETED'
                }))
                : [{
                    amount: dto.paidAmount ?? finalTotalAmount,
                    method: dto.paymentMethod || 'CASH',
                    status: (dto.paidAmount !== undefined && dto.paidAmount > 0) ? 'COMPLETED' : 'PENDING'
                }];

            const totalPaidNow = paymentsData.reduce((sum, p) => sum + Number(p.amount), 0);

            // Resolve stationIds, prepTimes, and base costs
            const resolvedItemsRaw = await this.resolveStationIds(tx, dto.items);
            const resolvedItems = this.calculateFireTimes(resolvedItemsRaw);

            if (existingOrder) {
                const totalPaidAmount = Number(existingOrder.paidAmount) + totalPaidNow;
                const totalOrderAmount = Number(existingOrder.totalAmount) + finalTotalAmount;
                const isFullyPaid = Math.round(totalPaidAmount * 100) >= Math.round(totalOrderAmount * 100);

                // UPDATE EXISTING ORDER
                order = await tx.order.update({
                    where: { id: existingOrder.id },
                    data: {
                        ...(dto.customerId ? { customerId: dto.customerId } : {}),
                        totalAmount: { increment: finalTotalAmount },
                        paidAmount: { increment: totalPaidNow },
                        taxAmount: { increment: dto.taxAmount || 0 },
                        serviceFeeAmount: { increment: dto.serviceFeeAmount || 0 },
                        discountAmount: { increment: appliedDiscount + loyaltyCashback },
                        loyaltyPointsUsed: { increment: pointsToDeduct },
                        loyaltyCashback: { increment: loyaltyCashback },
                        offerCode: dto.offerCode || existingOrder.offerCode,
                        note: dto.note ? (existingOrder.note ? `${existingOrder.note}\n--- Additional ---\n${dto.note}` : dto.note) : existingOrder.note,
                        items: {
                            create: resolvedItems.map((item, idx) => ({
                                productId: item.productId,
                                variantId: item.variantId || null,
                                quantity: item.quantity,
                                price: item.price,
                                costPrice: item.costPrice || 0,
                                stationId: item.stationId || null,
                                note: item.note || null,
                                courseName: item.courseName || null,
                                fireAt: item.fireAt || null,
                                isReward: dto.items[idx].isReward || false,
                                pointsCost: dto.items[idx].pointsCost || 0,
                            })),
                        },
                        payments: {
                            create: paymentsData.filter(p => p.amount > 0)
                        },
                        status: (['PENDING', 'HELD', 'PREPARING', 'READY'].includes(existingOrder.status) && isFullyPaid) ? 'COMPLETED' : existingOrder.status,
                    },
                    include: {
                        items: {
                            include: {
                                product: { select: { name: true } },
                                variant: { select: { name: true } }
                            }
                        },
                        customer: { select: { name: true } },
                        table: { select: { number: true } },
                        payments: true
                    },
                });
            } else {
                // CREATE NEW ORDER
                const isFullyPaid = Math.round(totalPaidNow * 100) >= Math.round(finalTotalAmount * 100);

                const settings = await tx.settings.findUnique({
                    where: { tenantId },
                    select: { timezone: true },
                });
                const branchRec = branchId ? await tx.branch.findUnique({
                    where: { id: branchId },
                    select: { businessDayStartHour: true },
                }) : null;

                const timezone = settings?.timezone ?? 'UTC';
                const cutoffHour: number = branchRec?.businessDayStartHour ?? 0;

                const receiptNumber = await this.numberingService.nextReceiptNumber(
                    tx, tenantId, branchId ?? null, timezone, cutoffHour,
                );
                const invoiceNumber = await this.numberingService.nextInvoiceNumber(
                    tx, tenantId, timezone, branchId ?? null, cutoffHour,
                );
                
                order = await tx.order.create({
                    data: {
                        tenantId,
                        branchId,
                        tableId: dto.tableId || null,
                        customerId: dto.customerId || null,
                        totalAmount: finalTotalAmount,
                        paidAmount: totalPaidNow,
                        // Pre-orders hold SCHEDULED status regardless of payment
                        status: dto.isPreOrder
                            ? 'SCHEDULED'
                            : dto.status || (isFullyPaid ? 'COMPLETED' : 'PENDING'),
                        orderType: dto.orderType || (dto.tableId ? 'DINE_IN' : 'IN_STORE'),
                        paymentMethod: dto.splitPayments?.length ? 'MULTI' : (dto.paymentMethod || 'CASH'),
                        guestName: dto.guestName,
                        guestPhone: dto.guestPhone,
                        offerCode: dto.offerCode || null,
                        discountAmount: appliedDiscount || dto.discountAmount || 0,
                        loyaltyPointsUsed: pointsToDeduct,
                        loyaltyCashback: loyaltyCashback,
                        taxAmount: dto.taxAmount || 0,
                        serviceFeeAmount: dto.serviceFeeAmount || 0,
                        deliveryAddress: dto.deliveryAddress,
                        note: dto.note,
                        userId: dto.userId || null,
                        receiptNumber,
                        invoiceNumber,
                        // Pre-order tracking fields
                        isPreOrder: dto.isPreOrder || false,
                        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
                        items: {
                            create: resolvedItems.map((item, idx) => ({
                                productId: item.productId,
                                variantId: item.variantId || null,
                                quantity: item.quantity,
                                price: item.price,
                                costPrice: item.costPrice || 0,
                                stationId: item.stationId || null,
                                note: item.note || null,
                                courseName: item.courseName || null,
                                fireAt: item.fireAt || null,
                                isReward: dto.items[idx]?.isReward || false,
                                pointsCost: dto.items[idx]?.pointsCost || 0,
                                modifiers: item.modifiers ? {
                                    create: item.modifiers.map((m: any) => ({
                                        optionId: m.optionId,
                                        price: 0,
                                    }))
                                } : undefined
                            })),
                        },
                        payments: {
                            create: paymentsData.filter(p => p.amount > 0)
                        }
                    } as any,
                    include: {
                        items: {
                            include: {
                                product: {
                                    include: {
                                        category: { select: { name: true } },
                                        usedInRecipes: { include: { ingredient: { select: { name: true } } } }
                                    }
                                },
                                variant: { select: { name: true } },
                                modifiers: { include: { option: true } }
                            }
                        },
                        customer: { select: { name: true } },
                        table: { select: { number: true } },
                        user: { select: { name: true } },
                        payments: true
                    },
                });
            }

            // 2. Deduct stock for each item (recursively handling recipes)
            // For pre-orders, stock is deducted when the order fires to kitchen (not now)
            if (!dto.isPreOrder) {
                for (const item of dto.items) {
                    await this.deductStockRecursively(tx, tenantId, branchId, item.productId, item.quantity, order.id);
                }
            }

            // 3. Handle Loyalty Point Deduction
            if (dto.customerId && pointsToDeduct > 0) {
                const customer = await tx.customer.findUnique({ where: { id: dto.customerId } });
                if (!customer || Number(customer.points) < pointsToDeduct) {
                    throw new ForbiddenException('Insufficient loyalty points');
                }

                await tx.customer.update({
                    where: { id: dto.customerId },
                    data: { points: { decrement: pointsToDeduct } }
                });

                await tx.customerLoyalty.create({
                    data: {
                        customerId: dto.customerId,
                        points: -pointsToDeduct,
                        type: 'REDEEMED',
                        description: `Points redeemed for order #${order.invoiceNumber || order.id} (${loyaltyCashback > 0 ? 'Cashback' : 'Rewards'})`,
                    }
                });
            }

            // 4. Handle Loyalty Point Earning (if not already handled or after deduction)
            // Note: Loyalty earning is usually handled in the CRM service or after payment.
            // If the order is fully paid, we process earning.
            const isFullyPaid = Math.round(Number(order.paidAmount) * 100) >= Math.round(Number(order.totalAmount) * 100);
            if (dto.customerId && isFullyPaid && this.crmService) {
                await this.crmService.processLoyaltyForOrder(dto.customerId, Number(order.totalAmount), order.id, tx);
            }

            // 3. If a table is assigned, manage its status
            if (dto.tableId) {
                const isFullyPaid = Math.round(Number(order.paidAmount) * 100) >= Math.round(Number(order.totalAmount) * 100);
                // A HELD order means the table is ALWAYS occupied. 
                // Only return to AVAILABLE if it's NOT held AND is fully paid.
                const newStatus = (order.status === 'HELD') ? 'OCCUPIED' : (isFullyPaid ? 'AVAILABLE' : 'OCCUPIED');
                
                await tx.table.update({
                    where: { id: dto.tableId },
                    data: { status: newStatus },
                });
            }

            // 4. Auto-record SALE movement in open cash drawer for CASH payments
            const paymentMethod = order.paymentMethod || dto.paymentMethod || 'CASH';
            const isCash = paymentMethod === 'CASH' || paymentMethod === 'MULTI';

            if (isCash && this.drawerService) {
                let cashAmount: number;
                if (dto.splitPayments?.length) {
                    cashAmount = dto.splitPayments
                        .filter(p => p.method === 'CASH')
                        .reduce((sum, p) => sum + p.amount, 0);
                } else if (paymentMethod === 'CASH') {
                    cashAmount = Number(dto.paidAmount ?? dto.totalAmount);
                } else {
                    cashAmount = 0;
                }

                if (cashAmount > 0) {
                    const branchIdForDrawer = this.tenantService.getBranchId() ?? undefined;
                    if (cashAmount > 0) {
                        const branchIdForDrawer = this.tenantService.getBranchId() ?? undefined;
                        // Remove the catch to let errors bubble up to the POS UI for debugging
                        await this.drawerService.recordSaleByTenant(tenantId, branchIdForDrawer, cashAmount, order.id);
                    }
                }
            }

            // 5. Update modifier prices
            if (order.items) {
                for (const item of order.items) {
                    if (item.modifiers) {
                        for (const mod of item.modifiers) {
                            const option = await tx.productModifierOption.findUnique({
                                where: { id: mod.optionId },
                                select: { priceAdjust: true }
                            });
                            if (option) {
                                await tx.orderItemModifier.update({
                                    where: { id: mod.id },
                                    data: { price: option.priceAdjust }
                                });
                            }
                        }
                    }
                }
            }

            if (this.analyticsService) {
                this.analyticsService.pushStatsUpdate(tenantId, branchId).catch(() => { });
            }

            // 6. Notify KDS (skip for pre-orders — kitchen fires when scheduledAt approaches)
            if (this.kdsGateway && !dto.isPreOrder) {
                // Notify for the whole order first
                this.kdsGateway.notifyNewOrder(tenantId, order);

                // Notify each station for its items
                if (order.items) {
                    const stationItemsMap = new Map<string, any[]>();
                    for (const item of order.items) {
                        if (item.stationId) {
                            if (!stationItemsMap.has(item.stationId)) {
                                stationItemsMap.set(item.stationId, []);
                            }
                            stationItemsMap.get(item.stationId)!.push(item);
                        }
                    }

                    for (const [stationId, items] of stationItemsMap.entries()) {
                        for (const item of items) {
                            // Ensure item has the order context for KDS display
                            const itemWithOrder = {
                                ...item,
                                order: {
                                    orderNumber: (order as any).orderNumber || (order as any).receiptNumber,
                                    tableName: (order as any).table?.number || (order as any).tableId,
                                    table: (order as any).table,
                                }
                            };
                            this.kdsGateway.notifyStationOrder(tenantId, stationId, itemWithOrder);
                        }
                    }
                }
            }

            // 7. Dispatch to Drovo if applicable (skip for pre-orders)
            if (this.drovoService && order.orderType === 'DELIVERY' && !dto.isPreOrder) {
                // Fire and forget so we don't delay POS response
                this.drovoService.dispatchOrder(order.id, tenantId).catch(err => {
                    console.error('Failed to trigger Drovo dispatch background task:', err);
                });
            }

            // 8. Trigger ZATCA reporting if applicable (not for pre-orders — fire when fulfilled)
            if (this.zatcaService && isFullyPaid && !dto.isPreOrder) {
                try {
                const zatcaStatus = await this.zatcaService.reportOrder(order.id);
                (order as any).zatcaReport = zatcaStatus;
                } catch (err) {
                    console.error('Failed to trigger ZATCA reporting task:', err);
                }
            }

            // 9. Schedule pre-order Bull delayed job
            if (dto.isPreOrder && dto.scheduledAt) {
                const branchSettings = branchId
                    ? await (this.prisma.client as any).branchSettings.findUnique({ where: { branchId } })
                    : null;
                const leadMinutes: number = branchSettings?.preOrderLeadMinutes ?? 30;
                const scheduledTime = new Date(dto.scheduledAt).getTime();
                const fireAt = scheduledTime - leadMinutes * 60 * 1000;
                const delayMs = Math.max(0, fireAt - Date.now());

                await this.preOrderQueue.add(
                    'fire-pre-order',
                    { orderId: order.id, tenantId, branchId },
                    { delay: delayMs, attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
                );

                // Notify manager that a pre-order was received
                if (this.notificationsService) {
                    const receiptNum = (order as any).receiptNumber ?? '';
                    this.notificationsService.create(tenantId, {
                        type: NotificationType.PRE_ORDER_RECEIVED,
                        title: 'Pre-Order Received',
                        message: `Pre-order #${receiptNum} scheduled for ${new Date(dto.scheduledAt).toLocaleString()}.`,
                        branchId: branchId ?? undefined,
                        meta: { orderId: order.id, scheduledAt: dto.scheduledAt },
                    }).catch(() => {});
                }
            }

            return order;
        });
    }

    /**
     * Fires a SCHEDULED pre-order to the kitchen.
     * Called by the pre-order Bull processor when scheduledAt - leadMinutes is reached.
     */
    async firePreOrder(orderId: string) {
        const order = await (this.prisma.client as any).order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: { include: { category: { select: { name: true } }, usedInRecipes: { include: { ingredient: { select: { name: true } } } } } },
                        variant: { select: { name: true } },
                        modifiers: { include: { option: true } },
                    },
                },
                customer: { select: { name: true } },
                table: { select: { number: true } },
                user: { select: { name: true } },
                payments: true,
            },
        });

        if (!order || order.status !== 'SCHEDULED') {
            return null; // Already fired or cancelled
        }

        // Transition to PENDING so kitchen sees it
        const fired = await (this.prisma.client as any).order.update({
            where: { id: orderId },
            data: { status: 'PENDING' },
        });

        // Deduct stock now
        for (const item of order.items) {
            await this.deductStockRecursively(
                this.prisma.client,
                order.tenantId,
                order.branchId,
                item.productId,
                item.quantity,
                orderId,
            );
        }

        // Notify KDS
        if (this.kdsGateway) {
            this.kdsGateway.notifyNewOrder(order.tenantId, { ...order, status: 'PENDING' });

            if (order.items) {
                const stationItemsMap = new Map<string, any[]>();
                for (const item of order.items) {
                    if (item.stationId) {
                        if (!stationItemsMap.has(item.stationId)) stationItemsMap.set(item.stationId, []);
                        stationItemsMap.get(item.stationId)!.push(item);
                    }
                }
                for (const [stationId, items] of stationItemsMap.entries()) {
                    for (const item of items) {
                        this.kdsGateway.notifyStationOrder(order.tenantId, stationId, {
                            ...item,
                            order: {
                                orderNumber: order.receiptNumber,
                                tableName: order.table?.number || order.tableId,
                                table: order.table,
                            },
                        });
                    }
                }
            }
        }

        // Dispatch to Drovo if delivery
        if (this.drovoService && order.orderType === 'DELIVERY') {
            this.drovoService.dispatchOrder(orderId, order.tenantId).catch(err =>
                console.error('Pre-order Drovo dispatch failed:', err),
            );
        }

        // Notify staff
        if (this.notificationsService) {
            this.notificationsService.create(order.tenantId, {
                type: NotificationType.PRE_ORDER_FIRED,
                title: 'Pre-Order Sent to Kitchen',
                message: `Pre-order #${order.receiptNumber} has been fired to the kitchen.`,
                branchId: order.branchId ?? undefined,
                meta: { orderId },
            }).catch(() => {});
        }

        if (this.analyticsService) {
            this.analyticsService.pushStatsUpdate(order.tenantId, order.branchId).catch(() => {});
        }

        return fired;
    }

    private async resolveStationIds(tx: any, items: any[]) {
        if (!items || items.length === 0) return [];

        const productIds = items.map(item => item.productId).filter(Boolean);
        const branchId = this.tenantService.getBranchId();
        const products = await tx.product.findMany({
            where: { id: { in: productIds } },
            include: { 
                category: true,
                branchSettings: branchId ? {
                    where: { branchId }
                } : false
            }
        });

        const productMap = new Map(products.map((p: any) => [p.id, p]));

        return Promise.all(items.map(async item => {
            // If item already has a stationId from POS, keep it
            if (item.stationId) return item;

            const product = productMap.get(item.productId) as any;
            if (!product) return item;

            // Priority: Branch-Product Default -> Product Default -> Category Default -> null
            const branchOverride = product.branchSettings?.[0]?.defaultStationId;
            const stationId = branchOverride || product.defaultStationId || product.category?.defaultStationId || null;
            
            // Calculate Prep Time
            const prepTime = product.prepTime || product.category?.defaultPrepTime || 0;
            
            // Calculate Exact BOM Cost
            const costPrice = await this.calculateBOMCost(tx, product);

            return { ...item, stationId, prepTime, costPrice };
        }));
    }

    private async calculateBOMCost(tx: any, product: any) {
        if (!product) return 0;

        // Fetch recipe components
        const recipe = await tx.productRecipe.findMany({
            where: { parentId: product.id },
            include: { ingredient: { select: { costPrice: true } } }
        });

        if (!recipe || recipe.length === 0) {
            return Number(product.costPrice) || 0;
        }

        // Sum up costs: quantity * ingredient.costPrice
        const totalBOMCost = recipe.reduce((sum: number, component: any) => {
            const ingredientCost = Number(component.ingredient?.costPrice) || 0;
            return sum + (Number(component.quantity) * ingredientCost);
        }, 0);

        return totalBOMCost;
    }

    private calculateFireTimes(items: any[]) {
        if (!items || items.length === 0) return items;

        const maxPrepTime = Math.max(...items.map(i => i.prepTime || 0));
        const now = new Date();

        return items.map(item => {
            const itemPrepTime = item.prepTime || 0;
            const delayMinutes = maxPrepTime - itemPrepTime;
            const fireAt = new Date(now.getTime() + delayMinutes * 60000);
            return { ...item, fireAt };
        });
    }

    private async deductStockRecursively(tx: any, tenantId: string, branchId: string | undefined, productId: string, quantity: number, orderId: string) {
        // Fetch the product first to check its productType
        const product = await tx.product.findUnique({
            where: { id: productId },
            select: { productType: true }
        });

        // Check if the product has a recipe (applicable to STANDARD made-in-house items and COMBO items)
        const recipe = await tx.productRecipe.findMany({
            where: { parentId: productId },
        });

        if (recipe && recipe.length > 0 && (product?.productType === 'STANDARD' || product?.productType === 'COMBO')) {
            // It's a BOM product or a COMBO - deduct ingredients instead
            for (const component of recipe) {
                const componentQuantity = Number(component.quantity) * quantity;
                await this.deductStockRecursively(tx, tenantId, branchId, component.ingredientId, componentQuantity, orderId);
            }
        } else {
            // It's a base product - deduct its own stock
            const stockLevel = await tx.stockLevel.findFirst({
                where: {
                    productId: productId,
                    warehouse: {
                        ...(branchId ? { branchId } : {})
                    },
                },
                include: { warehouse: true },
            });

            if (stockLevel) {
                // Decrement stock (even if it goes negative, to track shortage)
                await tx.stockLevel.update({
                    where: { id: stockLevel.id },
                    data: { quantity: { decrement: quantity } },
                });

                // Log a SALE movement
                await tx.stockMovement.create({
                    data: {
                        productId: productId,
                        warehouseId: stockLevel.warehouseId,
                        quantity: -quantity,
                        type: 'SALE',
                        referenceId: orderId,
                    } as any,
                });
            }
        }
    }

    async findAll(startDate?: Date, endDate?: Date, status?: string, limit?: number) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const branchId = this.tenantService.getBranchId();

        const dateFilter: any = {};
        if (startDate && !isNaN(startDate.getTime())) dateFilter.gte = startDate;
        if (endDate && !isNaN(endDate.getTime())) dateFilter.lte = endDate;

        // Support multi-status: "HELD,PENDING" -> ['HELD', 'PENDING']
        const statusFilter = status
            ? status.includes(',')
                ? { in: status.split(',').map(s => s.trim()) as OrderStatus[] }
                : (status as OrderStatus)
            : undefined;

        return this.db.findMany({
            where: {
                tenantId,
                ...(branchId ? { branchId } : {}),
                ...(statusFilter ? { status: statusFilter } : {}),
                ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                category: { select: { name: true } },
                                usedInRecipes: { include: { ingredient: { select: { name: true } } } }
                            }
                        },
                        variant: { select: { name: true } },
                        modifiers: { include: { option: true } }
                    }
                },
                customer: { select: { name: true, phone: true } },
                table: { select: { number: true } },
                user: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit ?? 1000,
        });
    }

    async updateStatus(id: string, status: string, paymentMethod?: string, paidAmount?: number) {
        const order = await this.db.findUnique({ where: { id } });
        if (!order) throw new NotFoundException('Order not found');

        const data: any = { status };

        // If marking as COMPLETED, ensure it's fully paid
        if (status === 'COMPLETED' && Number(order.paidAmount) < Number(order.totalAmount)) {
            const balance = Number(order.totalAmount) - Number(order.paidAmount);
            const settlementAmount = paidAmount || balance;
            data.paidAmount = { increment: settlementAmount };
            const methodToUse = paymentMethod || order.paymentMethod || 'CASH';

            // Create a payment record for the balance
            await (this.prisma.client as any).payment.create({
                data: {
                    orderId: id,
                    amount: settlementAmount,
                    method: methodToUse,
                    status: 'COMPLETED',
                }
            });

            // Update order payment method if provide
            if (paymentMethod) data.paymentMethod = paymentMethod;

            // Auto-record in cash drawer if settled in cash
            if ((methodToUse === 'CASH') && this.drawerService) {
                const branchId = this.tenantService.getBranchId() || (order as any).branchId;
                await this.drawerService.recordSaleByTenant(order.tenantId, branchId, settlementAmount, order.id);
            }
        }

        const updated = await this.db.update({
            where: { id },
            data,
            include: {
                items: {
                    include: {
                        product: { select: { name: true } },
                        variant: { select: { name: true } }
                    }
                },
                table: { select: { number: true } },
            },
        });

        // Trigger Loyalty Processing if order is completed and has a customer
        if (status === 'COMPLETED' && updated.customerId && this.crmService) {
            try {
                await this.crmService.processLoyaltyForOrder(
                    updated.customerId,
                    Number(updated.totalAmount),
                    updated.id
                );
            } catch (error) {
                console.error('Failed to process loyalty for order:', error);
            }
        }

        // Trigger ZATCA Reporting for COMPLETED orders
        if (status === 'COMPLETED' && this.zatcaService) {
            try {
                await this.zatcaService.reportOrder(updated.id).catch(err => {
                    console.error('Failed to report order to ZATCA:', err);
                });
            } catch (error) {
                console.error('Failed to process ZATCA reporting for completed order:', error);
            }
        }

        // Auto-update table status when order finishes or is fully paid
        if (updated.tableId) {
            const isFinishing = ['COMPLETED', 'CANCELLED', 'DELIVERED'].includes(status);
            const isFullyPaid = Math.round(Number(updated.paidAmount) * 100) >= Math.round(Number(updated.totalAmount) * 100);

            if (isFinishing || isFullyPaid) {
                await (this.prisma.client as any).table.update({
                    where: { id: updated.tableId },
                    data: { status: 'AVAILABLE' },
                });
            } else {
                await (this.prisma.client as any).table.update({
                    where: { id: updated.tableId },
                    data: { status: 'OCCUPIED' },
                });
            }
        }

        if (this.analyticsService) {
            this.analyticsService.pushStatsUpdate(updated.tenantId, (updated as any).branchId).catch(() => { });
        }

        // Notifications
        if (this.notificationsService) {
            const branchId = (updated as any).branchId ?? undefined;
            const receiptNum = (updated as any).receiptNumber ?? '';
            if (status === 'READY') {
                this.notificationsService.create(updated.tenantId, {
                    type: NotificationType.ORDER_READY,
                    title: 'Order Ready',
                    message: `Order #${receiptNum} is ready for pickup / service.`,
                    branchId,
                    meta: { orderId: updated.id, receiptNumber: receiptNum },
                }).catch(() => { });
            } else if (status === 'CANCELLED') {
                this.notificationsService.create(updated.tenantId, {
                    type: NotificationType.ORDER_CANCELLED,
                    title: 'Order Cancelled',
                    message: `Order #${receiptNum} was cancelled.`,
                    branchId,
                    meta: { orderId: updated.id, receiptNumber: receiptNum },
                }).catch(() => { });
            }
        }

        return updated;
    }

    async assignTable(id: string, tableId: string) {
        const order = await this.db.findUnique({ where: { id } });
        if (!order) throw new NotFoundException('Order not found');

        // Check table is available
        const table = await (this.prisma.client as any).table.findUnique({ where: { id: tableId } });
        if (!table) throw new NotFoundException('Table not found');

        const isFullyPaid = Math.round(Number(order.paidAmount) * 100) >= Math.round(Number(order.totalAmount) * 100);
        const [updatedOrder] = await (this.prisma.client as any).$transaction([
            this.db.update({
                where: { id },
                data: { tableId, orderType: 'DINE_IN' },
                include: { table: { select: { number: true } } },
            }),
            (this.prisma.client as any).table.update({
                where: { id: tableId },
                data: { status: isFullyPaid ? 'AVAILABLE' : 'OCCUPIED' },
            }),
        ]);

        if (this.analyticsService) {
            this.analyticsService.pushStatsUpdate(updatedOrder.tenantId, (updatedOrder as any).branchId).catch(() => { });
        }

        return updatedOrder;
    }

    async splitBill(dto: SplitBillDto) {
        const order = await (this.prisma.client as any).order.findUnique({
            where: { id: dto.orderId },
            include: { items: true },
        });

        if (!order) throw new NotFoundException('Order not found');

        const results = [];
        const tenantId = this.tenantService.getTenantId();

        if (dto.splitType === 'EQUAL') {
            const splitAmount = Number(order.totalAmount) / dto.splits.length;
            for (const split of dto.splits) {
                const child = await (this.prisma.client as any).order.create({
                    data: {
                        tenantId: order.tenantId,
                        branchId: order.branchId,
                        tableId: order.tableId,
                        customerId: split.customerId || null,
                        totalAmount: splitAmount,
                        status: 'PENDING',
                        isSplit: true,
                        parentOrderId: order.id,
                        orderType: order.orderType,
                        source: order.source,
                    }
                });
                results.push(child);
            }
        } else if (dto.splitType === 'BY_ITEM') {
            for (const split of dto.splits) {
                if (!split.itemIds) continue;
                const items = order.items.filter((i: any) => split.itemIds!.includes(i.id));
                const splitTotal = items.reduce((sum: number, i: any) => sum + Number(i.price) * i.quantity, 0);

                const child = await (this.prisma.client as any).order.create({
                    data: {
                        tenantId: order.tenantId,
                        branchId: order.branchId,
                        tableId: order.tableId,
                        customerId: split.customerId || null,
                        totalAmount: splitTotal,
                        status: 'PENDING',
                        isSplit: true,
                        parentOrderId: order.id,
                        orderType: order.orderType,
                        source: order.source,
                        items: {
                            create: items.map((i: any) => ({
                                productId: i.productId,
                                quantity: i.quantity,
                                price: i.price,
                                variantId: i.variantId,
                                stationId: i.stationId,
                                note: i.note,
                            }))
                        }
                    }
                });
                results.push(child);
            }
        }

        return results;
    }

    async getOrder(id: string) {
        const order = await this.db.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                usedInRecipes: { include: { ingredient: { select: { name: true } } } }
                            }
                        },
                        variant: true,
                        modifiers: { include: { option: true } }
                    }
                },
                user: { select: { name: true } }
            },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return order;
    }

    async findActiveByTable(tableId: string) {
        const order = await this.db.findFirst({
            where: {
                tableId,
                status: { in: ['PENDING', 'PREPARING', 'READY', 'HELD'] }
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                usedInRecipes: { include: { ingredient: { select: { name: true } } } }
                            }
                        },
                        variant: true,
                        modifiers: { include: { option: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!order) {
            throw new NotFoundException('No active order found for this table');
        }

        return order;
    }
    async holdOrder(id: string) {
        return this.updateStatus(id, 'HELD');
    }

    async fireOrder(id: string) {
        return this.updateStatus(id, 'PREPARING');
    }

    async voidOrder(id: string, managerPin: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');
        const branchId = this.tenantService.getBranchId();

        // 1. Verify Manager PIN
        const manager = await (this.prisma.client as any).user.findFirst({
            where: {
                tenantId,
                pinCode: managerPin,
                isActive: true,
                role: { in: ['ADMIN', 'MANAGER'] }
            }
        });

        if (!manager) {
            throw new ForbiddenException('Invalid manager PIN or insufficient permissions');
        }

        return (this.prisma as any).$transaction(async (tx: any) => {
            const order = await tx.order.findUnique({
                where: { id },
                include: { items: true }
            });

            if (!order || order.tenantId !== tenantId) {
                throw new NotFoundException('Order not found');
            }

            if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
                throw new BadRequestException('Order is already cancelled or refunded');
            }

            const previousStatus = order.status;

            // 2. Void logic (Cancellation)
            const result = await tx.order.update({
                where: { id },
                data: { status: 'CANCELLED' }
            });

            await tx.orderItem.updateMany({
                where: { orderId: id },
                data: { status: 'CANCELLED' }
            });

            // 3. Restore Stock
            for (const item of order.items) {
                await this.restoreStockRecursively(tx, tenantId, branchId, item.productId, item.quantity, order.id);
            }

            // 4. Audit Log
            if (this.auditLog) {
                await this.auditLog.log({
                    tenantId,
                    userId: manager.id,
                    userEmail: manager.email,
                    action: 'order.void',
                    resourceType: 'Order',
                    resourceId: order.id,
                    meta: { 
                        previousStatus,
                        reason: 'Voided by manager',
                        orderNumber: order.invoiceNumber || order.receiptNumber,
                        authorizedBy: manager.name 
                    }
                });
            }

            // 5. Notifications
            if (this.notificationsService) {
                const receiptNum = (order as any).receiptNumber ?? '';
                this.notificationsService.create(order.tenantId, {
                    type: NotificationType.ORDER_VOIDED,
                    title: 'Order Voided',
                    message: `Order #${receiptNum} was voided by ${manager.name}.`,
                    branchId: (order as any).branchId ?? undefined,
                    meta: { orderId: id, actorId: manager.id, actorEmail: manager.email },
                }).catch(() => { });
            }

            // 6. Free the table
            if (order.tableId) {
                await tx.table.update({
                    where: { id: order.tableId },
                    data: { status: 'AVAILABLE' }
                });
            }

            // 7. Analytics Update
            if (this.analyticsService) {
                this.analyticsService.pushStatsUpdate(tenantId, branchId ?? undefined).catch(() => { });
            }

            return result;
        });
    }

    private async restoreStockRecursively(tx: any, tenantId: string, branchId: string | undefined, productId: string, quantity: number, orderId: string) {
        const product = await tx.product.findUnique({
            where: { id: productId },
            select: { productType: true }
        });

        const recipe = await tx.productRecipe.findMany({
            where: { parentId: productId },
        });

        if (recipe && recipe.length > 0 && (product?.productType === 'STANDARD' || product?.productType === 'COMBO')) {
            for (const component of recipe) {
                const componentQuantity = Number(component.quantity) * quantity;
                await this.restoreStockRecursively(tx, tenantId, branchId, component.ingredientId, componentQuantity, orderId);
            }
        } else {
            const stockLevel = await tx.stockLevel.findFirst({
                where: {
                    productId: productId,
                    warehouse: {
                        ...(branchId ? { branchId } : {})
                    },
                },
            });

            if (stockLevel) {
                await tx.stockLevel.update({
                    where: { id: stockLevel.id },
                    data: { quantity: { increment: quantity } },
                });

                await tx.stockMovement.create({
                    data: {
                        productId: productId,
                        warehouseId: stockLevel.warehouseId,
                        quantity: quantity,
                        type: 'RETURN',
                        referenceId: orderId,
                        tenantId,
                    } as any,
                });
            }
        }
    }

    async voidItem(orderId: string, itemId: string, actorId?: string, actorEmail?: string) {
        const order = await this.db.findUnique({ where: { id: orderId } });
        if (!order) throw new NotFoundException('Order not found');

        const item = await (this.prisma.client as any).orderItem.findUnique({ where: { id: itemId } });

        const result = await (this.prisma.client as any).orderItem.update({
            where: { id: itemId },
            data: { status: 'VOIDED' },
        });

        // Audit trail: item void
        if (this.auditLog) {
            await this.auditLog.log({
                tenantId: order.tenantId,
                userId: actorId,
                userEmail: actorEmail,
                action: 'order.item_void',
                resourceType: 'OrderItem',
                resourceId: itemId,
                meta: { orderId, productId: item?.productId, quantity: item?.quantity, price: Number(item?.price) },
            });
        }
        return result;
    }

    async repeatOrder(dto: RepeatOrderDto) {
        const oldOrder = await this.db.findUnique({
            where: { id: dto.orderId },
            include: {
                items: {
                    include: {
                        modifiers: true
                    }
                }
            }
        });

        if (!oldOrder) {
            throw new NotFoundException('Original order not found');
        }

        // Create new order as a clone
        return this.createDirect({
            tableId: oldOrder.tableId ?? undefined,
            customerId: oldOrder.customerId ?? undefined,
            orderType: (oldOrder.orderType as any) ?? undefined,
            totalAmount: Number(oldOrder.totalAmount),
            items: oldOrder.items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: Number(item.price),
                stationId: item.stationId ?? undefined,
                note: item.note ?? undefined,
                modifiers: item.modifiers.map((m: any) => ({ optionId: m.optionId }))
            }))
        });
    }

    /**
     * Find an order by its daily receipt number, business date, and optional branch.
     * `date` can be YYYYMMDD or YYYY-MM-DD.
     *
     * Acceptance criterion: "Invoice queryable by receipt number + date + terminal"
     */
    async lookupByReceipt(receiptNumber: number, date: string, branchId?: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        if (!receiptNumber || !date) {
            throw new NotFoundException('receiptNumber and date are required');
        }

        // Normalise YYYY-MM-DD → YYYYMMDD
        const normalisedDate = date.replace(/-/g, '');

        const order = await this.db.findFirst({
            where: {
                tenantId,
                receiptNumber,
                ...(branchId ? { branchId } : {}),
                invoiceNumber: { startsWith: `INV-${normalisedDate}-` },
            } as any,
            include: {
                items: {
                    include: {
                        product: { select: { name: true } },
                        variant: { select: { name: true } },
                        modifiers: { include: { option: true } },
                    },
                },
                customer: { select: { name: true, phone: true } },
                table: { select: { number: true } },
                user: { select: { name: true } },
                payments: true,
            },
        });

        if (!order) {
            throw new NotFoundException(
                `No order found with receipt #${receiptNumber} on ${normalisedDate}`,
            );
        }

        return order;
    }

    async sendReceipt(orderId: string, email: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const order = await this.getOrder(orderId);
        if (!order) throw new NotFoundException('Order not found');

        const branchId = order.branchId;

        const [globalSettings, branchSettings, tenant] = await Promise.all([
            this.prisma.client.settings.findUnique({ where: { tenantId } }),
            branchId ? (this.prisma.client as any).branchSettings.findUnique({ where: { branchId } }) : null,
            this.prisma.client.tenant.findUnique({ where: { id: tenantId } })
        ]);

        // Merge settings for receipt
        const settings = { ...globalSettings };
        if (branchSettings) {
            Object.keys(branchSettings).forEach(key => {
                if (branchSettings[key] !== null && branchSettings[key] !== undefined && key !== 'id' && key !== 'branchId' && key !== 'tenantId') {
                    (settings as any)[key] = branchSettings[key];
                }
            });
        }

        const html = this.generateReceiptHtml(tenant, order, settings);
        
        try {
            await this.mailService.sendMail(email, `Receipt for Order #${order.receiptNumber || order.id.substring(0, 8).toUpperCase()}`, html);
            return { success: true };
        } catch (error: any) {
            console.error('Failed to send receipt email:', error);
            throw new InternalServerErrorException(error.message || 'Failed to send receipt email due to server configuration issues.');
        }
    }

    private generateReceiptHtml(tenant: any, order: any, settings: any) {
        const currency = settings?.currency || 'USD';
        const itemsHtml = order.items.map((item: any) => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div style="flex: 1;">
                    <div style="font-weight: bold; text-transform: uppercase;">${item.product?.name || 'Item'}</div>
                    ${item.variant?.name ? `<div style="font-size: 10px; color: #666;">↳ ${item.variant.name}</div>` : ''}
                </div>
                <div style="width: 40px; text-align: center;">x${item.quantity}</div>
                <div style="width: 80px; text-align: right;">${(Number(item.price) * item.quantity).toFixed(2)}</div>
            </div>
        `).join('');

        const subtotal = order.items.reduce((sum: number, item: any) => sum + (Number(item.price) * item.quantity), 0);
        const tax = Number(order.taxAmount) || 0;
        const serviceFee = Number(order.serviceFeeAmount) || 0;
        const total = Number(order.totalAmount);
        const discount = Number(order.discountAmount) || 0;

        return `
            <div style="font-family: monospace; max-width: 400px; margin: auto; padding: 20px; border: 1px solid #eee;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="margin: 0; text-transform: uppercase;">${tenant?.name || 'IDARAX STORE'}</h1>
                    ${settings?.receiptHeader ? `<div style="font-size: 10px; color: #666; margin-top: 10px;">${settings.receiptHeader}</div>` : ''}
                </div>
                
                <div style="border-bottom: 1px dashed #ccc; padding-bottom: 10px; margin-bottom: 10px; font-size: 12px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span>RECEIPT NO</span>
                        <span style="font-weight: bold;">${order.receiptNumber ? `#${order.receiptNumber.toString().padStart(3, '0')}` : `#${order.id.substring(0, 8).toUpperCase()}`}</span>
                    </div>
                    ${order.invoiceNumber ? `
                    <div style="display: flex; justify-content: space-between;">
                        <span>INVOICE NO</span>
                        <span style="font-weight: bold;">${order.invoiceNumber}</span>
                    </div>` : ''}
                    <div style="display: flex; justify-content: space-between;">
                        <span>DATE</span>
                        <span>${new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                </div>

                <div style="margin-bottom: 10px;">
                    ${itemsHtml}
                </div>

                <div style="border-top: 2px solid #000; pt: 10px; font-size: 14px;">
                    <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                        <span>SUBTOTAL</span>
                        <span>${currency} ${subtotal.toFixed(2)}</span>
                    </div>
                    ${discount > 0 ? `
                    <div style="display: flex; justify-content: space-between; color: #e11d48;">
                        <span>DISCOUNT ${order.offerCode ? `(${order.offerCode})` : ''}</span>
                        <span>-${currency} ${discount.toFixed(2)}</span>
                    </div>` : ''}
                    ${tax > 0 ? `
                    <div style="display: flex; justify-content: space-between;">
                        <span>TAX</span>
                        <span>${currency} ${tax.toFixed(2)}</span>
                    </div>` : ''}
                    ${serviceFee > 0 ? `
                    <div style="display: flex; justify-content: space-between;">
                        <span>SERVICE FEE</span>
                        <span>${currency} ${serviceFee.toFixed(2)}</span>
                    </div>` : ''}
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; border-top: 1px solid #000; margin-top: 10px; padding-top: 5px;">
                        <span>TOTAL</span>
                        <span>${currency} ${total.toFixed(2)}</span>
                    </div>
                </div>

                <div style="text-align: center; margin-top: 30px; font-size: 10px; color: #999;">
                    ${settings?.receiptFooter || 'THANK YOU FOR YOUR VISIT'}
                    <div style="margin-top: 10px;">SYSTEM BY IDARAX SOLUTIONS</div>
                </div>
            </div>
        `;
    }

    private async validateShiftAndDrawer(tenantId: string, branchId: string | undefined, userId?: string) {
        if (!userId) return; // Cannot enforce for guest/system actions without a user context

        // 1. Fetch settings (both global and branch-specific if applicable)
        const settings = await this.prisma.settings.findUnique({
            where: { tenantId },
            select: { requireOpenShift: true, requireOpenDrawer: true }
        });

        const branchSettings = branchId ? await (this.prisma.client as any).branchSettings.findUnique({
            where: { branchId },
            select: { requireOpenShift: true, requireOpenDrawer: true }
        }) : null;

        const requireShift = branchSettings?.requireOpenShift ?? settings?.requireOpenShift ?? false;
        const requireDrawer = branchSettings?.requireOpenDrawer ?? settings?.requireOpenDrawer ?? false;

        // 2. Perform checks
        if (requireShift && this.shiftService) {
            const hasShift = await this.shiftService.hasOpenShift(tenantId, userId);
            if (!hasShift) {
                throw new BadRequestException('You must open a shift before you can take orders.');
            }
        }

        if (requireDrawer && this.drawerService) {
            const hasDrawer = await this.drawerService.hasOpenSession(tenantId, branchId, userId);
            if (!hasDrawer) {
                throw new BadRequestException('You must open a cash drawer before you can take orders.');
            }
        }
    }
}
