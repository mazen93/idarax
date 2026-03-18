-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('STANDARD', 'COMBO', 'RAW_MATERIAL');

-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('BOGO', 'BUY_X_GET_Y_FREE', 'BUY_X_GET_Y_PERCENT_OFF', 'FIXED_AMOUNT_OFF', 'PERCENTAGE_OFF');

-- AlterTable
ALTER TABLE "Discount" ADD COLUMN     "applicableProductIds" TEXT[],
ADD COLUMN     "maxDiscountAmount" DECIMAL(65,30),
ADD COLUMN     "minOrderAmount" DECIMAL(65,30),
ADD COLUMN     "validFrom" TIMESTAMP(3),
ADD COLUMN     "validUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "productType" "ProductType" NOT NULL DEFAULT 'STANDARD';

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "PromotionType" NOT NULL,
    "buyQuantity" INTEGER,
    "getQuantity" INTEGER,
    "discountValue" DECIMAL(65,30),
    "maxDiscountAmount" DECIMAL(65,30),
    "minOrderAmount" DECIMAL(65,30),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "applicableProductIds" TEXT[],
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "maxUsages" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
