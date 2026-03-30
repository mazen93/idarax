/*
  Warnings:

  - A unique constraint covering the columns `[referralCode]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "OrderSource" ADD VALUE 'WEB_STORE';

-- AlterEnum
ALTER TYPE "TenantType" ADD VALUE 'CAFE';

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "birthday" TIMESTAMP(3),
ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referredById" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "loyaltyCashback" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "loyaltyPointsUsed" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "isReward" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pointsCost" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "brandColor" TEXT NOT NULL DEFAULT '#10b981',
ADD COLUMN     "loyaltyRatioEarning" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
ADD COLUMN     "loyaltyRatioRedemption" DOUBLE PRECISION NOT NULL DEFAULT 0.01,
ADD COLUMN     "secondaryColor" TEXT NOT NULL DEFAULT '#1f2937';

-- AlterTable
ALTER TABLE "SubscriptionPlan" ADD COLUMN     "description" TEXT,
ADD COLUMN     "descriptionAr" TEXT,
ADD COLUMN     "featuresAr" TEXT[],
ADD COLUMN     "maxBranches" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "maxKds" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxPos" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "maxUsers" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "nameAr" TEXT;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "isTrial" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxBranches" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "maxKds" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxPos" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "maxUsers" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "subscriptionExpiresAt" TIMESTAMP(3),
ADD COLUMN     "trialExpiresAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "CustomerSegment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingCampaignRule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Win-Back Campaign',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "inactiveDays" INTEGER NOT NULL DEFAULT 30,
    "discountValue" DECIMAL(65,30) NOT NULL DEFAULT 15,
    "discountType" TEXT NOT NULL DEFAULT 'PERCENTAGE_OFF',
    "emailSubject" TEXT NOT NULL DEFAULT 'We miss you!',
    "emailContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "birthdayActive" BOOLEAN NOT NULL DEFAULT false,
    "birthdayContent" TEXT,
    "birthdayReward" DECIMAL(65,30) NOT NULL DEFAULT 10,
    "birthdayRewardType" TEXT NOT NULL DEFAULT 'PERCENTAGE_OFF',
    "birthdaySubject" TEXT NOT NULL DEFAULT 'Happy Birthday, {{customer_name}}!',
    "referralActive" BOOLEAN NOT NULL DEFAULT false,
    "referralContent" TEXT,
    "referralFriendReward" DECIMAL(65,30) NOT NULL DEFAULT 25,
    "referralReward" DECIMAL(65,30) NOT NULL DEFAULT 50,
    "referralSubject" TEXT NOT NULL DEFAULT 'Gift from {{referrer_name}}!',

    CONSTRAINT "MarketingCampaignRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardCatalogItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "pointsCost" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RewardCatalogItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CustomerToCustomerSegment" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketingCampaignRule_tenantId_key" ON "MarketingCampaignRule"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalSetting_key_key" ON "GlobalSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "RewardCatalogItem_tenantId_productId_key" ON "RewardCatalogItem"("tenantId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "_CustomerToCustomerSegment_AB_unique" ON "_CustomerToCustomerSegment"("A", "B");

-- CreateIndex
CREATE INDEX "_CustomerToCustomerSegment_B_index" ON "_CustomerToCustomerSegment"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_referralCode_key" ON "Customer"("referralCode");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerSegment" ADD CONSTRAINT "CustomerSegment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingCampaignRule" ADD CONSTRAINT "MarketingCampaignRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardCatalogItem" ADD CONSTRAINT "RewardCatalogItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardCatalogItem" ADD CONSTRAINT "RewardCatalogItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerToCustomerSegment" ADD CONSTRAINT "_CustomerToCustomerSegment_A_fkey" FOREIGN KEY ("A") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerToCustomerSegment" ADD CONSTRAINT "_CustomerToCustomerSegment_B_fkey" FOREIGN KEY ("B") REFERENCES "CustomerSegment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
