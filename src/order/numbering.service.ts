import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NumberingService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Compute the current business date as a YYYYMMDD string.
     *
     * If `businessDayStartHour` is e.g. 3, then wall-clock times 00:00-02:59
     * are still part of *yesterday's* business day.
     *
     * @param timezone   IANA timezone string (e.g. 'Africa/Cairo', 'UTC')
     * @param startHour  Hour (0-23) at which the business day begins. Default 0.
     */
    getBusinessDate(timezone: string, startHour = 0): string {
        // Current UTC moment minus the cutoff offset
        const now = new Date();
        // Shift the clock back by startHour hours so that times before the
        // cutoff still resolve to the previous calendar day.
        const adjusted = new Date(now.getTime() - startHour * 60 * 60 * 1000);

        // Format the adjusted date in the target timezone
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
        // en-CA format is YYYY-MM-DD; strip dashes to get YYYYMMDD
        return formatter.format(adjusted).replace(/-/g, '');
    }

    /**
     * Reserve and return the next receipt number (1-999) for the given branch
     * on the current business day.
     *
     * MUST be called inside an existing Prisma transaction (`tx`).
     * Uses a PostgreSQL advisory-lock-free approach: upsert the counter row,
     * then increment it within the same serialised transaction.
     */
    async nextReceiptNumber(
        tx: any,
        tenantId: string,
        branchId: string | null,
        timezone: string,
        startHour = 0,
    ): Promise<number> {
        const date = this.getBusinessDate(timezone, startHour);

        // Upsert: create the row if it doesn't exist, then lock & increment.
        // We use raw SQL for an atomic READ-MODIFY-WRITE with row-level locking.
        const result = await tx.$queryRaw<{ sequence: number }[]>`
            INSERT INTO "ReceiptCounter" (id, "tenantId", "branchId", date, sequence)
            VALUES (gen_random_uuid()::text, ${tenantId}, ${branchId}, ${date}, 1)
            ON CONFLICT ("tenantId", "branchId", date)
            DO UPDATE SET
                sequence = CASE
                    WHEN "ReceiptCounter".sequence >= 999 THEN 1
                    ELSE "ReceiptCounter".sequence + 1
                END
            RETURNING sequence
        `;

        return Number(result[0].sequence);
    }

    /**
     * Reserve and return the next invoice number for the given tenant on the
     * current business day.  Format: INV-YYYYMMDD-NNNN (4-digit zero-padded).
     *
     * MUST be called inside an existing Prisma transaction (`tx`).
     */
    async nextInvoiceNumber(
        tx: any,
        tenantId: string,
        timezone: string,
        startHour = 0,
    ): Promise<string> {
        const date = this.getBusinessDate(timezone, startHour);

        const result = await tx.$queryRaw<{ sequence: number }[]>`
            INSERT INTO "InvoiceCounter" (id, "tenantId", date, sequence)
            VALUES (gen_random_uuid()::text, ${tenantId}, ${date}, 1)
            ON CONFLICT ("tenantId", date)
            DO UPDATE SET sequence = "InvoiceCounter".sequence + 1
            RETURNING sequence
        `;

        const seq = Number(result[0].sequence);
        return `INV-${date}-${String(seq).padStart(4, '0')}`;
    }
}
