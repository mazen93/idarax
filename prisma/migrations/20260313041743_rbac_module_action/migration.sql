/*
  Warnings:

  - The `orderType` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[name,tenantId,branchId]` on the table `KitchenStation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invoiceNumber]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[parentId,ingredientId,variantId]` on the table `ProductRecipe` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[number,tenantId,branchId]` on the table `Table` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pinCode,tenantId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,tenantId,branchId]` on the table `Warehouse` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('PENDING', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('DINE_IN', 'TAKEAWAY', 'DELIVERY', 'DRIVE_THRU', 'CURBSIDE', 'IN_STORE');

-- AlterEnum
ALTER TYPE "OrderItemStatus" ADD VALUE 'VOIDED';

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'HELD';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PromotionType" ADD VALUE 'FREE_ITEM';
ALTER TYPE "PromotionType" ADD VALUE 'TIER_DISCOUNT';
ALTER TYPE "PromotionType" ADD VALUE 'STAFF_VOUCHER';

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'CASHIER';

-- DropIndex
DROP INDEX "KitchenStation_name_tenantId_key";

-- DropIndex
DROP INDEX "ProductRecipe_parentId_ingredientId_key";

-- DropIndex
DROP INDEX "Table_number_tenantId_key";

-- DropIndex
DROP INDEX "Warehouse_name_tenantId_key";

-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "businessDayStartHour" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nameAr" TEXT;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "description" TEXT,
ADD COLUMN     "descriptionAr" TEXT,
ADD COLUMN     "nameAr" TEXT;

-- AlterTable
ALTER TABLE "KitchenStation" ADD COLUMN     "nameAr" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryAddress" TEXT,
ADD COLUMN     "discountAmount" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "invoiceNumber" TEXT,
ADD COLUMN     "offerCode" TEXT,
ADD COLUMN     "receiptNumber" INTEGER,
ADD COLUMN     "serviceFeeAmount" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "taxAmount" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "userId" TEXT,
DROP COLUMN "orderType",
ADD COLUMN     "orderType" "OrderType" NOT NULL DEFAULT 'IN_STORE';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "courseName" TEXT,
ADD COLUMN     "variantId" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "descriptionAr" TEXT,
ADD COLUMN     "nameAr" TEXT;

-- AlterTable
ALTER TABLE "ProductRecipe" ADD COLUMN     "variantId" TEXT;

-- AlterTable
ALTER TABLE "PromoCode" ADD COLUMN     "firstOrderOnly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isStackable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxUsagesPerCustomer" INTEGER,
ADD COLUMN     "staffOnly" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Promotion" ADD COLUMN     "customerSegment" TEXT,
ADD COLUMN     "freeItemProductId" TEXT,
ADD COLUMN     "happyHourDays" INTEGER[],
ADD COLUMN     "happyHourEnd" TEXT,
ADD COLUMN     "happyHourStart" TEXT,
ADD COLUMN     "isBirthdayBonus" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tierThresholds" JSONB;

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "aboutUsText" TEXT,
ADD COLUMN     "bannerImageUrl" TEXT,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "receiptLanguage" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "receiptShowBarcode" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "receiptShowDiscount" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "receiptShowItemsDescription" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "receiptShowItemsPrice" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "receiptShowItemsQty" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "receiptShowOperator" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "receiptShowOrderType" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "receiptShowPaymentMethod" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "receiptShowServiceCharge" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "receiptShowSubtotal" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "receiptShowTax" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "receiptShowTimestamp" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "receiptShowTotal" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "twitterUrl" TEXT;

-- AlterTable
ALTER TABLE "TableSection" ADD COLUMN     "nameAr" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pinCode" TEXT;

-- AlterTable
ALTER TABLE "Variant" ADD COLUMN     "costPrice" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "nameAr" TEXT;

-- AlterTable
ALTER TABLE "WaitingEntry" ADD COLUMN     "customerId" TEXT;

-- AlterTable
ALTER TABLE "Warehouse" ADD COLUMN     "nameAr" TEXT;

-- CreateTable
CREATE TABLE "UserPermission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "daysOfWeek" INTEGER[],
    "tenantId" TEXT NOT NULL,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuCategory" (
    "menuId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "MenuCategory_pkey" PRIMARY KEY ("menuId","categoryId")
);

-- CreateTable
CREATE TABLE "BranchProduct" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "priceOverride" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BranchProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerAddress" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'Home',
    "address" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoCodeRedemption" (
    "id" TEXT NOT NULL,
    "promoCodeId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "discountApplied" DOUBLE PRECISION NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "PromoCodeRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorProduct" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "costPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "branchId" TEXT,
    "warehouseId" TEXT,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "note" TEXT,
    "orderedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrderItem" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "receivedQty" INTEGER NOT NULL DEFAULT 0,
    "costPrice" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "PurchaseOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceCounter" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InvoiceCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceiptCounter" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "branchId" TEXT,
    "date" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ReceiptCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductModifier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "multiSelect" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nameAr" TEXT,

    CONSTRAINT "ProductModifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductModifierOption" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceAdjust" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "modifierId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nameAr" TEXT,

    CONSTRAINT "ProductModifierOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemModifier" (
    "id" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "optionId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItemModifier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserPermission_userId_idx" ON "UserPermission"("userId");

-- CreateIndex
CREATE INDEX "UserPermission_tenantId_idx" ON "UserPermission"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPermission_userId_action_key" ON "UserPermission"("userId", "action");

-- CreateIndex
CREATE INDEX "Menu_tenantId_branchId_idx" ON "Menu"("tenantId", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "BranchProduct_branchId_productId_key" ON "BranchProduct"("branchId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorProduct_vendorId_productId_key" ON "VendorProduct"("vendorId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_number_key" ON "PurchaseOrder"("number");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrderItem_purchaseOrderId_productId_key" ON "PurchaseOrderItem"("purchaseOrderId", "productId");

-- CreateIndex
CREATE INDEX "InvoiceCounter_tenantId_date_idx" ON "InvoiceCounter"("tenantId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceCounter_tenantId_date_key" ON "InvoiceCounter"("tenantId", "date");

-- CreateIndex
CREATE INDEX "ReceiptCounter_tenantId_branchId_date_idx" ON "ReceiptCounter"("tenantId", "branchId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ReceiptCounter_tenantId_branchId_date_key" ON "ReceiptCounter"("tenantId", "branchId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "KitchenStation_name_tenantId_branchId_key" ON "KitchenStation"("name", "tenantId", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_invoiceNumber_key" ON "Order"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Order_tenantId_branchId_receiptNumber_idx" ON "Order"("tenantId", "branchId", "receiptNumber");

-- CreateIndex
CREATE INDEX "Order_invoiceNumber_idx" ON "Order"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ProductRecipe_parentId_ingredientId_variantId_key" ON "ProductRecipe"("parentId", "ingredientId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "Table_number_tenantId_branchId_key" ON "Table"("number", "tenantId", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "User_pinCode_tenantId_key" ON "User"("pinCode", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_name_tenantId_branchId_key" ON "Warehouse"("name", "tenantId", "branchId");

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuCategory" ADD CONSTRAINT "MenuCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuCategory" ADD CONSTRAINT "MenuCategory_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchProduct" ADD CONSTRAINT "BranchProduct_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchProduct" ADD CONSTRAINT "BranchProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerAddress" ADD CONSTRAINT "CustomerAddress_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCodeRedemption" ADD CONSTRAINT "PromoCodeRedemption_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCodeRedemption" ADD CONSTRAINT "PromoCodeRedemption_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCodeRedemption" ADD CONSTRAINT "PromoCodeRedemption_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCodeRedemption" ADD CONSTRAINT "PromoCodeRedemption_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorProduct" ADD CONSTRAINT "VendorProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorProduct" ADD CONSTRAINT "VendorProduct_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorProduct" ADD CONSTRAINT "VendorProduct_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceCounter" ADD CONSTRAINT "InvoiceCounter_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptCounter" ADD CONSTRAINT "ReceiptCounter_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptCounter" ADD CONSTRAINT "ReceiptCounter_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitingEntry" ADD CONSTRAINT "WaitingEntry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRecipe" ADD CONSTRAINT "ProductRecipe_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductModifier" ADD CONSTRAINT "ProductModifier_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductModifierOption" ADD CONSTRAINT "ProductModifierOption_modifierId_fkey" FOREIGN KEY ("modifierId") REFERENCES "ProductModifier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemModifier" ADD CONSTRAINT "OrderItemModifier_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemModifier" ADD CONSTRAINT "OrderItemModifier_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "ProductModifierOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
