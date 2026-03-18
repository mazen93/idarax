-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "receiptFontSize" INTEGER NOT NULL DEFAULT 12,
ADD COLUMN     "receiptQrCodeUrl" TEXT,
ADD COLUMN     "receiptShowCustomer" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "receiptShowLogo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "receiptShowOrderNumber" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "receiptShowTable" BOOLEAN NOT NULL DEFAULT true;
