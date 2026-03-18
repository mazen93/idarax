import { NumberingService } from './numbering.service';

describe('NumberingService', () => {
    let service: NumberingService;

    beforeEach(() => {
        service = new NumberingService({} as any);
    });

    describe('getBusinessDate', () => {
        it('should return Today (YYYYMMDD) when clock is after startHour', () => {
            // Mock "Now" to 10:00 AM on 2026-03-14 Cairo
            jest.useFakeTimers().setSystemTime(new Date('2026-03-14T08:00:00Z')); // 10 AM Cairo

            const date = service.getBusinessDate('Africa/Cairo', 3); // Start at 3 AM
            expect(date).toBe('20260314');

            jest.useRealTimers();
        });

        it('should return Yesterday (YYYYMMDD) when clock is before startHour', () => {
            // Mock "Now" to 01:00 AM on 2026-03-14 Cairo
            jest.useFakeTimers().setSystemTime(new Date('2026-03-13T23:00:00Z')); // 1 AM Cairo

            const date = service.getBusinessDate('Africa/Cairo', 3); // Start at 3 AM
            expect(date).toBe('20260313');

            jest.useRealTimers();
        });

        it('should handle midnight (startHour=0) correctly', () => {
            jest.useFakeTimers().setSystemTime(new Date('2026-03-14T00:01:00Z')); // 2 AM Cairo
            const date = service.getBusinessDate('Africa/Cairo', 0);
            expect(date).toBe('20260314');
            jest.useRealTimers();
        });
    });

    describe('nextReceiptNumber (SQL Logic)', () => {
        it('should simulate atomic increment', async () => {
            const mockTx = {
                $queryRaw: jest.fn().mockResolvedValue([{ sequence: 42 }])
            };

            const seq = await service.nextReceiptNumber(mockTx, 'tenant', 'branch', 'UTC', 0);
            expect(seq).toBe(42);
            expect(mockTx.$queryRaw).toHaveBeenCalledWith(
                expect.arrayContaining([expect.stringContaining('INSERT INTO "ReceiptCounter"')]),
                'tenant', 'branch', expect.any(String)
            );
        });
    });

    describe('nextInvoiceNumber (SQL Logic)', () => {
        it('should return formatted invoice string', async () => {
            const mockTx = {
                $queryRaw: jest.fn().mockResolvedValue([{ sequence: 123 }])
            };

            jest.useFakeTimers().setSystemTime(new Date('2026-03-14T12:00:00Z'));
            const inv = await service.nextInvoiceNumber(mockTx, 'tenant', 'UTC', 0);

            expect(inv).toBe('INV-20260314-0123');
            jest.useRealTimers();
        });
    });
});
