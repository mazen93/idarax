import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

@Injectable()
export class InvoiceService {
    constructor(private prisma: PrismaService) { }

    async generateInvoicePdf(orderId: string): Promise<Buffer> {
        const order = await (this.prisma as any).order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true,
                        modifiers: {
                            include: {
                                option: true
                            }
                        }
                    }
                },
                tenant: {
                    include: {
                        settings: true
                    }
                },
                branch: true,
                customer: true,
            }
        });

        if (!order) throw new NotFoundException('Order not found');

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);
        const { width, height } = page.getSize();
        
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const tenantName = order.tenant.name;
        const currency = order.tenant.settings?.currency || '$';

        // --- Header Section ---
        page.drawText(tenantName.toUpperCase(), {
            x: 50,
            y: height - 50,
            size: 24,
            font: fontBold,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Invoice #${order.invoiceNumber || order.receiptNumber || order.id.slice(0, 8)}`, {
            x: width - 200,
            y: height - 50,
            size: 12,
            font: fontBold,
        });

        page.drawText(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, {
            x: width - 200,
            y: height - 65,
            size: 10,
            font: fontRegular,
        });

        // --- Tenant Info ---
        let yPos = height - 100;
        if (order.branch) {
            page.drawText(`${order.branch.name}`, { x: 50, y: yPos, size: 10, font: fontRegular });
            yPos -= 15;
            if (order.branch.address) {
                page.drawText(`${order.branch.address}`, { x: 50, y: yPos, size: 10, font: fontRegular });
                yPos -= 15;
            }
        }

        // --- Customer Info ---
        yPos = height - 160;
        page.drawText('BILL TO:', { x: 50, y: yPos, size: 10, font: fontBold });
        yPos -= 15;
        page.drawText(order.customer?.name || order.guestName || 'Valued Customer', { x: 50, y: yPos, size: 12, font: fontBold });
        yPos -= 15;
        if (order.customer?.phone || order.guestPhone) {
            page.drawText(`Phone: ${order.customer?.phone || order.guestPhone}`, { x: 50, y: yPos, size: 10, font: fontRegular });
            yPos -= 15;
        }

        // --- Items Table Header ---
        yPos = height - 240;
        page.drawRectangle({
            x: 50,
            y: yPos - 5,
            width: width - 100,
            height: 25,
            color: rgb(0.95, 0.95, 0.95),
        });

        page.drawText('ITEM', { x: 60, y: yPos, size: 10, font: fontBold });
        page.drawText('QTY', { x: 350, y: yPos, size: 10, font: fontBold });
        page.drawText('PRICE', { x: 420, y: yPos, size: 10, font: fontBold });
        page.drawText('TOTAL', { x: 500, y: yPos, size: 10, font: fontBold });

        yPos -= 30;

        // --- Items List ---
        for (const item of order.items) {
            const itemName = item.variant ? `${item.product.name} (${item.variant.name})` : item.product.name;
            page.drawText(itemName, { x: 60, y: yPos, size: 10, font: fontBold });
            page.drawText(`${item.quantity}`, { x: 350, y: yPos, size: 10, font: fontRegular });
            page.drawText(`${currency} ${Number(item.price).toFixed(2)}`, { x: 420, y: yPos, size: 10, font: fontRegular });
            page.drawText(`${currency} ${(Number(item.price) * item.quantity).toFixed(2)}`, { x: 500, y: yPos, size: 10, font: fontBold });
            
            yPos -= 15;
            
            // Modifiers
            if (item.modifiers && item.modifiers.length > 0) {
                for (const mod of item.modifiers) {
                    page.drawText(`+ ${mod.option.name}`, { x: 70, y: yPos, size: 8, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
                    yPos -= 12;
                }
            }
            
            yPos -= 10;
            if (yPos < 100) break; // Simple pagination check
        }

        // --- Totals ---
        yPos = 200;
        const totalsX = width - 200;
        
        page.drawText('Subtotal:', { x: totalsX, y: yPos, size: 10, font: fontRegular });
        page.drawText(`${currency} ${Number(order.totalAmount - (order.taxAmount || 0) - (order.serviceFeeAmount || 0)).toFixed(2)}`, { x: width - 100, y: yPos, size: 10, font: fontRegular });
        yPos -= 20;

        if (Number(order.serviceFeeAmount) > 0) {
            page.drawText('Service Fee:', { x: totalsX, y: yPos, size: 10, font: fontRegular });
            page.drawText(`${currency} ${Number(order.serviceFeeAmount).toFixed(2)}`, { x: width - 100, y: yPos, size: 10, font: fontRegular });
            yPos -= 20;
        }

        if (Number(order.taxAmount) > 0) {
            page.drawText('Tax:', { x: totalsX, y: yPos, size: 10, font: fontRegular });
            page.drawText(`${currency} ${Number(order.taxAmount).toFixed(2)}`, { x: width - 100, y: yPos, size: 10, font: fontRegular });
            yPos -= 20;
        }

        page.drawRectangle({
            x: totalsX - 10,
            y: yPos - 5,
            width: 160,
            height: 25,
            color: rgb(0.1, 0.1, 0.1),
        });

        page.drawText('GRAND TOTAL:', { x: totalsX, y: yPos, size: 12, font: fontBold, color: rgb(1, 1, 1) });
        page.drawText(`${currency} ${Number(order.totalAmount).toFixed(2)}`, { x: width - 100, y: yPos, size: 12, font: fontBold, color: rgb(1, 1, 1) });

        // --- Footer ---
        page.drawText('Thank you for choosing Idarax!', {
            x: width / 2 - 80,
            y: 50,
            size: 10,
            font: fontRegular,
            color: rgb(0.5, 0.5, 0.5),
        });

        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);
    }
}
