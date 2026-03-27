-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('POS', 'QR_CODE', 'DELIVERY_PARTNER', 'KIOSK', 'MOBILE_APP');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER_READY', 'LOW_STOCK', 'ORDER_CANCELLED', 'ORDER_VOIDED', 'MANAGER_ALERT');

-- AlterTable
ALTER TABLE "BranchProduct" ADD COLUMN     "defaultStationId" TEXT;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "defaultPrepTime" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "defaultStationId" TEXT;

-- AlterTable
ALTER TABLE "CustomerAddress" ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryFee" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "externalOrderId" TEXT,
ADD COLUMN     "externalPlatform" TEXT,
ADD COLUMN     "isSplit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentOrderId" TEXT,
ADD COLUMN     "source" "OrderSource" NOT NULL DEFAULT 'POS';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "costPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "fireAt" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "defaultStationId" TEXT,
ADD COLUMN     "prepTime" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "drovoApiKey" TEXT,
ADD COLUMN     "drovoTenantId" TEXT;

-- AlterTable
ALTER TABLE "Table" ADD COLUMN     "qrCodeUrl" TEXT;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "hasDeliveryIntegration" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "BranchSettings" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "taxRate" DECIMAL(65,30),
    "serviceFee" DECIMAL(65,30),
    "receiptHeader" TEXT,
    "receiptFooter" TEXT,
    "receiptLanguage" TEXT,
    "receiptShowCustomer" BOOLEAN,
    "receiptShowLogo" BOOLEAN,
    "receiptShowOrderNumber" BOOLEAN,
    "receiptShowTable" BOOLEAN,
    "receiptShowTimestamp" BOOLEAN,
    "receiptShowOrderType" BOOLEAN,
    "receiptShowOperator" BOOLEAN,
    "receiptShowItemsDescription" BOOLEAN,
    "receiptShowItemsQty" BOOLEAN,
    "receiptShowItemsPrice" BOOLEAN,
    "receiptShowSubtotal" BOOLEAN,
    "receiptShowTax" BOOLEAN,
    "receiptShowServiceCharge" BOOLEAN,
    "receiptShowDiscount" BOOLEAN,
    "receiptShowTotal" BOOLEAN,
    "receiptShowPaymentMethod" BOOLEAN,
    "receiptShowBarcode" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BranchSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "branchId" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingCampaign" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "campaignType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "MarketingCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_KitchenStationToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "BranchSettings_branchId_key" ON "BranchSettings"("branchId");

-- CreateIndex
CREATE INDEX "BranchSettings_tenantId_idx" ON "BranchSettings"("tenantId");

-- CreateIndex
CREATE INDEX "Notification_tenantId_isRead_idx" ON "Notification"("tenantId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_tenantId_createdAt_idx" ON "Notification"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "MarketingCampaign_tenantId_customerId_idx" ON "MarketingCampaign"("tenantId", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "_KitchenStationToUser_AB_unique" ON "_KitchenStationToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_KitchenStationToUser_B_index" ON "_KitchenStationToUser"("B");

-- CreateIndex
CREATE INDEX "User_pinCode_tenantId_idx" ON "User"("pinCode", "tenantId");

-- AddForeignKey
ALTER TABLE "BranchSettings" ADD CONSTRAINT "BranchSettings_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchSettings" ADD CONSTRAINT "BranchSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_defaultStationId_fkey" FOREIGN KEY ("defaultStationId") REFERENCES "KitchenStation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_defaultStationId_fkey" FOREIGN KEY ("defaultStationId") REFERENCES "KitchenStation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchProduct" ADD CONSTRAINT "BranchProduct_defaultStationId_fkey" FOREIGN KEY ("defaultStationId") REFERENCES "KitchenStation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingCampaign" ADD CONSTRAINT "MarketingCampaign_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingCampaign" ADD CONSTRAINT "MarketingCampaign_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KitchenStationToUser" ADD CONSTRAINT "_KitchenStationToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "KitchenStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KitchenStationToUser" ADD CONSTRAINT "_KitchenStationToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
