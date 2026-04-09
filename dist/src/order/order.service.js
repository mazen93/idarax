"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const tenant_service_1 = require("../tenant/tenant.service");
const bull_1 = require("@nestjs/bull");
const offer_service_1 = require("../retail/offer/offer.service");
const drawer_service_1 = require("../staff/drawer.service");
const numbering_service_1 = require("./numbering.service");
const audit_log_service_1 = require("../common/audit-log/audit-log.service");
const analytics_service_1 = require("../analytics/analytics.service");
const crm_service_1 = require("../crm/crm.service");
const kds_gateway_1 = require("../restaurant/kds/kds.gateway");
const mail_service_1 = require("../mail/mail.service");
const notifications_service_1 = require("../notifications/notifications.service");
const notifications_dto_1 = require("../notifications/dto/notifications.dto");
const drovo_service_1 = require("../delivery-aggregator/drovo.service");
const zatca_reporting_service_1 = require("../zatca/zatca-reporting.service");
const shift_service_1 = require("../staff/shift.service");
let OrderService = class OrderService {
    prisma;
    tenantService;
    offerService;
    numberingService;
    mailService;
    orderQueue;
    preOrderQueue;
    drawerService;
    auditLog;
    analyticsService;
    crmService;
    kdsGateway;
    notificationsService;
    drovoService;
    zatcaService;
    shiftService;
    constructor(prisma, tenantService, offerService, numberingService, mailService, orderQueue, preOrderQueue, drawerService, auditLog, analyticsService, crmService, kdsGateway, notificationsService, drovoService, zatcaService, shiftService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
        this.offerService = offerService;
        this.numberingService = numberingService;
        this.mailService = mailService;
        this.orderQueue = orderQueue;
        this.preOrderQueue = preOrderQueue;
        this.drawerService = drawerService;
        this.auditLog = auditLog;
        this.analyticsService = analyticsService;
        this.crmService = crmService;
        this.kdsGateway = kdsGateway;
        this.notificationsService = notificationsService;
        this.drovoService = drovoService;
        this.zatcaService = zatcaService;
        this.shiftService = shiftService;
    }
    get db() {
        return this.prisma.client.order;
    }
    async createAsync(dto, userId) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const branchId = this.tenantService.getBranchId();
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
    async createDirect(dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const branchId = this.tenantService.getBranchId() || dto.branchId;
        await this.validateShiftAndDrawer(tenantId, branchId, dto.userId);
        let finalTotalAmount = dto.totalAmount;
        let appliedDiscount = 0;
        let pointsToDeduct = 0;
        let loyaltyCashback = 0;
        if (dto.customerId) {
            if (dto.redeemAsCashback && dto.loyaltyPointsToRedeem) {
                pointsToDeduct += dto.loyaltyPointsToRedeem;
                const tenantSettings = await this.prisma.client.settings.findUnique({
                    where: { tenantId }
                });
                const redemptionRatio = tenantSettings?.loyaltyRatioRedemption || 0.01;
                loyaltyCashback = Number(dto.loyaltyPointsToRedeem) * Number(redemptionRatio);
                finalTotalAmount -= loyaltyCashback;
            }
            for (const item of dto.items) {
                if (item.isReward && item.pointsCost) {
                    pointsToDeduct += (item.pointsCost * item.quantity);
                }
            }
        }
        return this.prisma.client.$transaction(async (tx) => {
            let order;
            const branchId = this.tenantService.getBranchId();
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
            const resolvedItemsRaw = await this.resolveStationIds(tx, dto.items);
            const resolvedItems = this.calculateFireTimes(resolvedItemsRaw);
            if (existingOrder) {
                const totalPaidAmount = Number(existingOrder.paidAmount) + totalPaidNow;
                const totalOrderAmount = Number(existingOrder.totalAmount) + finalTotalAmount;
                const isFullyPaid = Math.round(totalPaidAmount * 100) >= Math.round(totalOrderAmount * 100);
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
            }
            else {
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
                const cutoffHour = branchRec?.businessDayStartHour ?? 0;
                const receiptNumber = await this.numberingService.nextReceiptNumber(tx, tenantId, branchId ?? null, timezone, cutoffHour);
                const invoiceNumber = await this.numberingService.nextInvoiceNumber(tx, tenantId, timezone, branchId ?? null, cutoffHour);
                order = await tx.order.create({
                    data: {
                        tenantId,
                        branchId,
                        tableId: dto.tableId || null,
                        customerId: dto.customerId || null,
                        totalAmount: finalTotalAmount,
                        paidAmount: totalPaidNow,
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
                                    create: item.modifiers.map((m) => ({
                                        optionId: m.optionId,
                                        price: 0,
                                    }))
                                } : undefined
                            })),
                        },
                        payments: {
                            create: paymentsData.filter(p => p.amount > 0)
                        }
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
                        customer: { select: { name: true } },
                        table: { select: { number: true } },
                        user: { select: { name: true } },
                        payments: true
                    },
                });
            }
            if (!dto.isPreOrder) {
                for (const item of dto.items) {
                    await this.deductStockRecursively(tx, tenantId, branchId, item.productId, item.quantity, order.id);
                }
            }
            if (dto.customerId && pointsToDeduct > 0) {
                const customer = await tx.customer.findUnique({ where: { id: dto.customerId } });
                if (!customer || Number(customer.points) < pointsToDeduct) {
                    throw new common_1.ForbiddenException('Insufficient loyalty points');
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
            const isFullyPaid = Math.round(Number(order.paidAmount) * 100) >= Math.round(Number(order.totalAmount) * 100);
            if (dto.customerId && isFullyPaid && this.crmService) {
                await this.crmService.processLoyaltyForOrder(dto.customerId, Number(order.totalAmount), order.id, tx);
            }
            if (dto.tableId) {
                const isFullyPaid = Math.round(Number(order.paidAmount) * 100) >= Math.round(Number(order.totalAmount) * 100);
                const newStatus = (order.status === 'HELD') ? 'OCCUPIED' : (isFullyPaid ? 'AVAILABLE' : 'OCCUPIED');
                await tx.table.update({
                    where: { id: dto.tableId },
                    data: { status: newStatus },
                });
            }
            const paymentMethod = order.paymentMethod || dto.paymentMethod || 'CASH';
            const isCash = paymentMethod === 'CASH' || paymentMethod === 'MULTI';
            if (isCash && this.drawerService) {
                let cashAmount;
                if (dto.splitPayments?.length) {
                    cashAmount = dto.splitPayments
                        .filter(p => p.method === 'CASH')
                        .reduce((sum, p) => sum + p.amount, 0);
                }
                else if (paymentMethod === 'CASH') {
                    cashAmount = Number(dto.paidAmount ?? dto.totalAmount);
                }
                else {
                    cashAmount = 0;
                }
                if (cashAmount > 0) {
                    const branchIdForDrawer = this.tenantService.getBranchId() ?? undefined;
                    if (cashAmount > 0) {
                        const branchIdForDrawer = this.tenantService.getBranchId() ?? undefined;
                        await this.drawerService.recordSaleByTenant(tenantId, branchIdForDrawer, cashAmount, order.id);
                    }
                }
            }
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
            if (this.kdsGateway && !dto.isPreOrder) {
                this.kdsGateway.notifyNewOrder(tenantId, order);
                if (order.items) {
                    const stationItemsMap = new Map();
                    for (const item of order.items) {
                        if (item.stationId) {
                            if (!stationItemsMap.has(item.stationId)) {
                                stationItemsMap.set(item.stationId, []);
                            }
                            stationItemsMap.get(item.stationId).push(item);
                        }
                    }
                    for (const [stationId, items] of stationItemsMap.entries()) {
                        for (const item of items) {
                            const itemWithOrder = {
                                ...item,
                                order: {
                                    orderNumber: order.orderNumber || order.receiptNumber,
                                    tableName: order.table?.number || order.tableId,
                                    table: order.table,
                                }
                            };
                            this.kdsGateway.notifyStationOrder(tenantId, stationId, itemWithOrder);
                        }
                    }
                }
            }
            if (this.drovoService && order.orderType === 'DELIVERY' && !dto.isPreOrder) {
                this.drovoService.dispatchOrder(order.id, tenantId).catch(err => {
                    console.error('Failed to trigger Drovo dispatch background task:', err);
                });
            }
            if (this.zatcaService && isFullyPaid && !dto.isPreOrder) {
                try {
                    const zatcaStatus = await this.zatcaService.reportOrder(order.id);
                    order.zatcaReport = zatcaStatus;
                }
                catch (err) {
                    console.error('Failed to trigger ZATCA reporting task:', err);
                }
            }
            if (dto.isPreOrder && dto.scheduledAt) {
                const branchSettings = branchId
                    ? await this.prisma.client.branchSettings.findUnique({ where: { branchId } })
                    : null;
                const leadMinutes = branchSettings?.preOrderLeadMinutes ?? 30;
                const scheduledTime = new Date(dto.scheduledAt).getTime();
                const fireAt = scheduledTime - leadMinutes * 60 * 1000;
                const delayMs = Math.max(0, fireAt - Date.now());
                await this.preOrderQueue.add('fire-pre-order', { orderId: order.id, tenantId, branchId }, { delay: delayMs, attempts: 3, backoff: { type: 'exponential', delay: 5000 } });
                if (this.notificationsService) {
                    const receiptNum = order.receiptNumber ?? '';
                    this.notificationsService.create(tenantId, {
                        type: notifications_dto_1.NotificationType.PRE_ORDER_RECEIVED,
                        title: 'Pre-Order Received',
                        message: `Pre-order #${receiptNum} scheduled for ${new Date(dto.scheduledAt).toLocaleString()}.`,
                        branchId: branchId ?? undefined,
                        meta: { orderId: order.id, scheduledAt: dto.scheduledAt },
                    }).catch(() => { });
                }
            }
            return order;
        });
    }
    async firePreOrder(orderId) {
        const order = await this.prisma.client.order.findUnique({
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
            return null;
        }
        const fired = await this.prisma.client.order.update({
            where: { id: orderId },
            data: { status: 'PENDING' },
        });
        for (const item of order.items) {
            await this.deductStockRecursively(this.prisma.client, order.tenantId, order.branchId, item.productId, item.quantity, orderId);
        }
        if (this.kdsGateway) {
            this.kdsGateway.notifyNewOrder(order.tenantId, { ...order, status: 'PENDING' });
            if (order.items) {
                const stationItemsMap = new Map();
                for (const item of order.items) {
                    if (item.stationId) {
                        if (!stationItemsMap.has(item.stationId))
                            stationItemsMap.set(item.stationId, []);
                        stationItemsMap.get(item.stationId).push(item);
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
        if (this.drovoService && order.orderType === 'DELIVERY') {
            this.drovoService.dispatchOrder(orderId, order.tenantId).catch(err => console.error('Pre-order Drovo dispatch failed:', err));
        }
        if (this.notificationsService) {
            this.notificationsService.create(order.tenantId, {
                type: notifications_dto_1.NotificationType.PRE_ORDER_FIRED,
                title: 'Pre-Order Sent to Kitchen',
                message: `Pre-order #${order.receiptNumber} has been fired to the kitchen.`,
                branchId: order.branchId ?? undefined,
                meta: { orderId },
            }).catch(() => { });
        }
        if (this.analyticsService) {
            this.analyticsService.pushStatsUpdate(order.tenantId, order.branchId).catch(() => { });
        }
        return fired;
    }
    async resolveStationIds(tx, items) {
        if (!items || items.length === 0)
            return [];
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
        const productMap = new Map(products.map((p) => [p.id, p]));
        return Promise.all(items.map(async (item) => {
            if (item.stationId)
                return item;
            const product = productMap.get(item.productId);
            if (!product)
                return item;
            const branchOverride = product.branchSettings?.[0]?.defaultStationId;
            const stationId = branchOverride || product.defaultStationId || product.category?.defaultStationId || null;
            const prepTime = product.prepTime || product.category?.defaultPrepTime || 0;
            const costPrice = await this.calculateBOMCost(tx, product);
            return { ...item, stationId, prepTime, costPrice };
        }));
    }
    async calculateBOMCost(tx, product) {
        if (!product)
            return 0;
        const recipe = await tx.productRecipe.findMany({
            where: { parentId: product.id },
            include: { ingredient: { select: { costPrice: true } } }
        });
        if (!recipe || recipe.length === 0) {
            return Number(product.costPrice) || 0;
        }
        const totalBOMCost = recipe.reduce((sum, component) => {
            const ingredientCost = Number(component.ingredient?.costPrice) || 0;
            return sum + (Number(component.quantity) * ingredientCost);
        }, 0);
        return totalBOMCost;
    }
    calculateFireTimes(items) {
        if (!items || items.length === 0)
            return items;
        const maxPrepTime = Math.max(...items.map(i => i.prepTime || 0));
        const now = new Date();
        return items.map(item => {
            const itemPrepTime = item.prepTime || 0;
            const delayMinutes = maxPrepTime - itemPrepTime;
            const fireAt = new Date(now.getTime() + delayMinutes * 60000);
            return { ...item, fireAt };
        });
    }
    async deductStockRecursively(tx, tenantId, branchId, productId, quantity, orderId) {
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
                await this.deductStockRecursively(tx, tenantId, branchId, component.ingredientId, componentQuantity, orderId);
            }
        }
        else {
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
                await tx.stockLevel.update({
                    where: { id: stockLevel.id },
                    data: { quantity: { decrement: quantity } },
                });
                await tx.stockMovement.create({
                    data: {
                        productId: productId,
                        warehouseId: stockLevel.warehouseId,
                        quantity: -quantity,
                        type: 'SALE',
                        referenceId: orderId,
                    },
                });
            }
        }
    }
    async findAll(startDate, endDate, status, limit) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const branchId = this.tenantService.getBranchId();
        const dateFilter = {};
        if (startDate && !isNaN(startDate.getTime()))
            dateFilter.gte = startDate;
        if (endDate && !isNaN(endDate.getTime()))
            dateFilter.lte = endDate;
        const statusFilter = status
            ? status.includes(',')
                ? { in: status.split(',').map(s => s.trim()) }
                : status
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
    async updateStatus(id, status, paymentMethod, paidAmount) {
        const order = await this.db.findUnique({ where: { id } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const data = { status };
        if (status === 'COMPLETED' && Number(order.paidAmount) < Number(order.totalAmount)) {
            const balance = Number(order.totalAmount) - Number(order.paidAmount);
            const settlementAmount = paidAmount || balance;
            data.paidAmount = { increment: settlementAmount };
            const methodToUse = paymentMethod || order.paymentMethod || 'CASH';
            await this.prisma.client.payment.create({
                data: {
                    orderId: id,
                    amount: settlementAmount,
                    method: methodToUse,
                    status: 'COMPLETED',
                }
            });
            if (paymentMethod)
                data.paymentMethod = paymentMethod;
            if ((methodToUse === 'CASH') && this.drawerService) {
                const branchId = this.tenantService.getBranchId() || order.branchId;
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
        if (status === 'COMPLETED' && updated.customerId && this.crmService) {
            try {
                await this.crmService.processLoyaltyForOrder(updated.customerId, Number(updated.totalAmount), updated.id);
            }
            catch (error) {
                console.error('Failed to process loyalty for order:', error);
            }
        }
        if (status === 'COMPLETED' && this.zatcaService) {
            try {
                await this.zatcaService.reportOrder(updated.id).catch(err => {
                    console.error('Failed to report order to ZATCA:', err);
                });
            }
            catch (error) {
                console.error('Failed to process ZATCA reporting for completed order:', error);
            }
        }
        if (updated.tableId) {
            const isFinishing = ['COMPLETED', 'CANCELLED', 'DELIVERED'].includes(status);
            const isFullyPaid = Math.round(Number(updated.paidAmount) * 100) >= Math.round(Number(updated.totalAmount) * 100);
            if (isFinishing || isFullyPaid) {
                await this.prisma.client.table.update({
                    where: { id: updated.tableId },
                    data: { status: 'AVAILABLE' },
                });
            }
            else {
                await this.prisma.client.table.update({
                    where: { id: updated.tableId },
                    data: { status: 'OCCUPIED' },
                });
            }
        }
        if (this.analyticsService) {
            this.analyticsService.pushStatsUpdate(updated.tenantId, updated.branchId).catch(() => { });
        }
        if (this.notificationsService) {
            const branchId = updated.branchId ?? undefined;
            const receiptNum = updated.receiptNumber ?? '';
            if (status === 'READY') {
                this.notificationsService.create(updated.tenantId, {
                    type: notifications_dto_1.NotificationType.ORDER_READY,
                    title: 'Order Ready',
                    message: `Order #${receiptNum} is ready for pickup / service.`,
                    branchId,
                    meta: { orderId: updated.id, receiptNumber: receiptNum },
                }).catch(() => { });
            }
            else if (status === 'CANCELLED') {
                this.notificationsService.create(updated.tenantId, {
                    type: notifications_dto_1.NotificationType.ORDER_CANCELLED,
                    title: 'Order Cancelled',
                    message: `Order #${receiptNum} was cancelled.`,
                    branchId,
                    meta: { orderId: updated.id, receiptNumber: receiptNum },
                }).catch(() => { });
            }
        }
        return updated;
    }
    async assignTable(id, tableId) {
        const order = await this.db.findUnique({ where: { id } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const table = await this.prisma.client.table.findUnique({ where: { id: tableId } });
        if (!table)
            throw new common_1.NotFoundException('Table not found');
        const isFullyPaid = Math.round(Number(order.paidAmount) * 100) >= Math.round(Number(order.totalAmount) * 100);
        const [updatedOrder] = await this.prisma.client.$transaction([
            this.db.update({
                where: { id },
                data: { tableId, orderType: 'DINE_IN' },
                include: { table: { select: { number: true } } },
            }),
            this.prisma.client.table.update({
                where: { id: tableId },
                data: { status: isFullyPaid ? 'AVAILABLE' : 'OCCUPIED' },
            }),
        ]);
        if (this.analyticsService) {
            this.analyticsService.pushStatsUpdate(updatedOrder.tenantId, updatedOrder.branchId).catch(() => { });
        }
        return updatedOrder;
    }
    async splitBill(dto) {
        const order = await this.prisma.client.order.findUnique({
            where: { id: dto.orderId },
            include: { items: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const results = [];
        const tenantId = this.tenantService.getTenantId();
        if (dto.splitType === 'EQUAL') {
            const splitAmount = Number(order.totalAmount) / dto.splits.length;
            for (const split of dto.splits) {
                const child = await this.prisma.client.order.create({
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
        }
        else if (dto.splitType === 'BY_ITEM') {
            for (const split of dto.splits) {
                if (!split.itemIds)
                    continue;
                const items = order.items.filter((i) => split.itemIds.includes(i.id));
                const splitTotal = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
                const child = await this.prisma.client.order.create({
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
                            create: items.map((i) => ({
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
    async getOrder(id) {
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
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
    async findActiveByTable(tableId) {
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
            throw new common_1.NotFoundException('No active order found for this table');
        }
        return order;
    }
    async holdOrder(id) {
        return this.updateStatus(id, 'HELD');
    }
    async fireOrder(id) {
        return this.updateStatus(id, 'PREPARING');
    }
    async voidOrder(id, managerPin) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const branchId = this.tenantService.getBranchId();
        const manager = await this.prisma.client.user.findFirst({
            where: {
                tenantId,
                pinCode: managerPin,
                isActive: true,
                role: { in: ['ADMIN', 'MANAGER'] }
            }
        });
        if (!manager) {
            throw new common_1.ForbiddenException('Invalid manager PIN or insufficient permissions');
        }
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id },
                include: { items: true }
            });
            if (!order || order.tenantId !== tenantId) {
                throw new common_1.NotFoundException('Order not found');
            }
            if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
                throw new common_1.BadRequestException('Order is already cancelled or refunded');
            }
            const previousStatus = order.status;
            const result = await tx.order.update({
                where: { id },
                data: { status: 'CANCELLED' }
            });
            await tx.orderItem.updateMany({
                where: { orderId: id },
                data: { status: 'CANCELLED' }
            });
            for (const item of order.items) {
                await this.restoreStockRecursively(tx, tenantId, branchId, item.productId, item.quantity, order.id);
            }
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
            if (this.notificationsService) {
                const receiptNum = order.receiptNumber ?? '';
                this.notificationsService.create(order.tenantId, {
                    type: notifications_dto_1.NotificationType.ORDER_VOIDED,
                    title: 'Order Voided',
                    message: `Order #${receiptNum} was voided by ${manager.name}.`,
                    branchId: order.branchId ?? undefined,
                    meta: { orderId: id, actorId: manager.id, actorEmail: manager.email },
                }).catch(() => { });
            }
            if (order.tableId) {
                await tx.table.update({
                    where: { id: order.tableId },
                    data: { status: 'AVAILABLE' }
                });
            }
            if (this.analyticsService) {
                this.analyticsService.pushStatsUpdate(tenantId, branchId ?? undefined).catch(() => { });
            }
            return result;
        });
    }
    async restoreStockRecursively(tx, tenantId, branchId, productId, quantity, orderId) {
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
        }
        else {
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
                    },
                });
            }
        }
    }
    async voidItem(orderId, itemId, actorId, actorEmail) {
        const order = await this.db.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const item = await this.prisma.client.orderItem.findUnique({ where: { id: itemId } });
        const result = await this.prisma.client.orderItem.update({
            where: { id: itemId },
            data: { status: 'VOIDED' },
        });
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
    async repeatOrder(dto) {
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
            throw new common_1.NotFoundException('Original order not found');
        }
        return this.createDirect({
            tableId: oldOrder.tableId ?? undefined,
            customerId: oldOrder.customerId ?? undefined,
            orderType: oldOrder.orderType ?? undefined,
            totalAmount: Number(oldOrder.totalAmount),
            items: oldOrder.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: Number(item.price),
                stationId: item.stationId ?? undefined,
                note: item.note ?? undefined,
                modifiers: item.modifiers.map((m) => ({ optionId: m.optionId }))
            }))
        });
    }
    async lookupByReceipt(receiptNumber, date, branchId) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        if (!receiptNumber || !date) {
            throw new common_1.NotFoundException('receiptNumber and date are required');
        }
        const normalisedDate = date.replace(/-/g, '');
        const order = await this.db.findFirst({
            where: {
                tenantId,
                receiptNumber,
                ...(branchId ? { branchId } : {}),
                invoiceNumber: { startsWith: `INV-${normalisedDate}-` },
            },
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
            throw new common_1.NotFoundException(`No order found with receipt #${receiptNumber} on ${normalisedDate}`);
        }
        return order;
    }
    async sendReceipt(orderId, email) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const order = await this.getOrder(orderId);
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const branchId = order.branchId;
        const [globalSettings, branchSettings, tenant] = await Promise.all([
            this.prisma.client.settings.findUnique({ where: { tenantId } }),
            branchId ? this.prisma.client.branchSettings.findUnique({ where: { branchId } }) : null,
            this.prisma.client.tenant.findUnique({ where: { id: tenantId } })
        ]);
        const settings = { ...globalSettings };
        if (branchSettings) {
            Object.keys(branchSettings).forEach(key => {
                if (branchSettings[key] !== null && branchSettings[key] !== undefined && key !== 'id' && key !== 'branchId' && key !== 'tenantId') {
                    settings[key] = branchSettings[key];
                }
            });
        }
        const html = this.generateReceiptHtml(tenant, order, settings);
        try {
            await this.mailService.sendMail(email, `Receipt for Order #${order.receiptNumber || order.id.substring(0, 8).toUpperCase()}`, html);
            return { success: true };
        }
        catch (error) {
            console.error('Failed to send receipt email:', error);
            throw new common_1.InternalServerErrorException(error.message || 'Failed to send receipt email due to server configuration issues.');
        }
    }
    generateReceiptHtml(tenant, order, settings) {
        const currency = settings?.currency || 'USD';
        const itemsHtml = order.items.map((item) => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div style="flex: 1;">
                    <div style="font-weight: bold; text-transform: uppercase;">${item.product?.name || 'Item'}</div>
                    ${item.variant?.name ? `<div style="font-size: 10px; color: #666;">↳ ${item.variant.name}</div>` : ''}
                </div>
                <div style="width: 40px; text-align: center;">x${item.quantity}</div>
                <div style="width: 80px; text-align: right;">${(Number(item.price) * item.quantity).toFixed(2)}</div>
            </div>
        `).join('');
        const subtotal = order.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
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
    async validateShiftAndDrawer(tenantId, branchId, userId) {
        if (!userId)
            return;
        const settings = await this.prisma.settings.findUnique({
            where: { tenantId },
            select: { requireOpenShift: true, requireOpenDrawer: true }
        });
        const branchSettings = branchId ? await this.prisma.client.branchSettings.findUnique({
            where: { branchId },
            select: { requireOpenShift: true, requireOpenDrawer: true }
        }) : null;
        const requireShift = branchSettings?.requireOpenShift ?? settings?.requireOpenShift ?? false;
        const requireDrawer = branchSettings?.requireOpenDrawer ?? settings?.requireOpenDrawer ?? false;
        if (requireShift && this.shiftService) {
            const hasShift = await this.shiftService.hasOpenShift(tenantId, userId);
            if (!hasShift) {
                throw new common_1.BadRequestException('You must open a shift before you can take orders.');
            }
        }
        if (requireDrawer && this.drawerService) {
            const hasDrawer = await this.drawerService.hasOpenSession(tenantId, branchId, userId);
            if (!hasDrawer) {
                throw new common_1.BadRequestException('You must open a cash drawer before you can take orders.');
            }
        }
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, bull_1.InjectQueue)('orders')),
    __param(6, (0, bull_1.InjectQueue)('pre-orders')),
    __param(7, (0, common_1.Optional)()),
    __param(8, (0, common_1.Optional)()),
    __param(9, (0, common_1.Optional)()),
    __param(10, (0, common_1.Optional)()),
    __param(11, (0, common_1.Optional)()),
    __param(12, (0, common_1.Optional)()),
    __param(13, (0, common_1.Optional)()),
    __param(14, (0, common_1.Optional)()),
    __param(15, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService,
        offer_service_1.OfferService,
        numbering_service_1.NumberingService,
        mail_service_1.MailService, Object, Object, drawer_service_1.DrawerService,
        audit_log_service_1.AuditLogService,
        analytics_service_1.AnalyticsService,
        crm_service_1.CrmService,
        kds_gateway_1.KdsGateway,
        notifications_service_1.NotificationsService,
        drovo_service_1.DrovoService,
        zatca_reporting_service_1.ZatcaReportingService,
        shift_service_1.ShiftService])
], OrderService);
//# sourceMappingURL=order.service.js.map