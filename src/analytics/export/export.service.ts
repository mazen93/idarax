import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { Parser } from 'json2csv';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

@Injectable()
export class ExportService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService,
    ) { }

    async exportOrdersToCsv() {
        const tenantId = this.tenantService.getTenantId();
        const orders = await (this.prisma as any).order.findMany({
            where: { tenantId },
            include: { items: { include: { product: true } } },
        });

        const data = orders.map((order: any) => ({
            id: order.id,
            total: order.totalAmount,
            status: order.status,
            createdAt: order.createdAt,
            items: order.items.map((i: any) => i.product.name).join(', '),
        }));

        const parser = new Parser();
        return parser.parse(data);
    }

    async exportOrdersToPdf() {
        const tenantId = this.tenantService.getTenantId();
        const orders = await (this.prisma as any).order.findMany({
            where: { tenantId },
            take: 10, // Limit for mock
        });

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        page.drawText(`Sales Report - Tenant: ${tenantId}`, { x: 50, y: 750, size: 20, font });

        let y = 700;
        for (const order of orders) {
            page.drawText(`Order: ${order.id} - Total: $${order.totalAmount} - Date: ${order.createdAt}`, {
                x: 50,
                y,
                size: 12,
                font,
            });
            y -= 20;
        }

        return await pdfDoc.save();
    }
}
