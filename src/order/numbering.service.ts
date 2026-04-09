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
        console.log(`[NumberingService] Generating receipt number for tenant: ${tenantId}, branch: ${branchId}`);
        
        // Diagnostic: Check if branch exists
        if (branchId) {
            const branch = await tx.branch.findUnique({ where: { id: branchId } });
            if (!branch) {
                console.error(`[NumberingService] CRITICAL: Branch ${branchId} NOT FOUND in Branch table!`);
            } else {
                console.log(`[NumberingService] Confirmed: Branch ${branchId} exists (Tenant: ${branch.tenantId})`);
            }
        }

        const date = this.getBusinessDate(timezone, startHour);

        // Try atomic update first. We split the query to avoid ambiguous parameter types (42P18) with NULLs.
        const updated = branchId
            ? await tx.$queryRaw<{ sequence: number }[]>`
                UPDATE "ReceiptCounter" 
                SET sequence = CASE WHEN sequence >= 999 THEN 1 ELSE sequence + 1 END
                WHERE "tenantId" = ${tenantId} AND "date" = ${date} AND "branchId" = ${branchId}
                RETURNING sequence
            `
            : await tx.$queryRaw<{ sequence: number }[]>`
                UPDATE "ReceiptCounter" 
                SET sequence = CASE WHEN sequence >= 999 THEN 1 ELSE sequence + 1 END
                WHERE "tenantId" = ${tenantId} AND "date" = ${date} AND "branchId" IS NULL
                RETURNING sequence
            `;

        if (updated.length > 0) {
            return Number(updated[0].sequence);
        }

        // If no row exists, try inserting. 
        try {
            const inserted = await tx.$queryRaw<{ sequence: number }[]>`
                INSERT INTO "ReceiptCounter" (id, "tenantId", "branchId", date, sequence)
                VALUES (gen_random_uuid()::text, ${tenantId}, ${branchId}, ${date}, 1)
                RETURNING sequence
            `;
            return Number(inserted[0].sequence);
        } catch (err) {
            // Concurrent insert happened, retry update
            const updatedRetry = branchId
                ? await tx.$queryRaw<{ sequence: number }[]>`
                    UPDATE "ReceiptCounter" 
                    SET sequence = CASE WHEN sequence >= 999 THEN 1 ELSE sequence + 1 END
                    WHERE "tenantId" = ${tenantId} AND "date" = ${date} AND "branchId" = ${branchId}
                    RETURNING sequence
                `
                : await tx.$queryRaw<{ sequence: number }[]>`
                    UPDATE "ReceiptCounter" 
                    SET sequence = CASE WHEN sequence >= 999 THEN 1 ELSE sequence + 1 END
                    WHERE "tenantId" = ${tenantId} AND "date" = ${date} AND "branchId" IS NULL
                    RETURNING sequence
                `;
            return Number(updatedRetry[0].sequence);
        }
    }

    /**
     * Reserve and return the next invoice number for the given tenant on the
     * current business day.  Format: INV-YYYYMMDD-HHMM-SUFFIX-NNNN (4-digit zero-padded).
     *
     * @param branchId  The branch or terminal ID.
     * @param timezone  User timezone.
     */
    async nextInvoiceNumber(
        tx: any,
        tenantId: string,
        timezone: string,
        branchId: string | null = null,
        startHour = 0,
    ): Promise<string> {
        const date = this.getBusinessDate(timezone, startHour);
        
        // Current time in HHMM format for better traceability
        const now = new Date();
        const timeFormatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
        const time = timeFormatter.format(now).replace(/:/g, '');

        // Branch suffix: last 4 chars of ID or "0000" if no branch
        const suffix = branchId ? branchId.slice(-4).toUpperCase() : '0000';

        const result = await tx.$queryRaw<{ sequence: number }[]>`
            INSERT INTO "InvoiceCounter" (id, "tenantId", date, sequence)
            VALUES (gen_random_uuid()::text, ${tenantId}, ${date}, 1)
            ON CONFLICT ("tenantId", date)
            DO UPDATE SET sequence = "InvoiceCounter".sequence + 1
            RETURNING sequence
        `;

        const seq = Number(result[0].sequence);
        return `INV-${date}-${time}-${suffix}-${String(seq).padStart(4, '0')}`;
    }
}
