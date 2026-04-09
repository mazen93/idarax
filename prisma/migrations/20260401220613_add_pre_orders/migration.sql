/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customDomain]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ZatcaStatus" AS ENUM ('PENDING', 'REPORTED', 'CLEARED', 'FAILED');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'SCHEDULED';

-- AlterTable
ALTER TABLE "BranchSettings" ADD COLUMN     "preOrderEnabled" BOOLEAN DEFAULT false,
ADD COLUMN     "preOrderLeadMinutes" INTEGER DEFAULT 30,
ADD COLUMN     "preOrderMaxDaysAhead" INTEGER DEFAULT 7;

-- AlterTable
ALTER TABLE "LandingContent" ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'default';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "isPreOrder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "country" TEXT DEFAULT 'Saudi Arabia',
ADD COLUMN     "countryCode" TEXT DEFAULT 'SA',
ADD COLUMN     "zatcaEgsSerial" TEXT,
ADD COLUMN     "zatcaEgsUuid" TEXT,
ADD COLUMN     "zatcaIsOnboarded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "zatcaPhase" INTEGER DEFAULT 1,
ADD COLUMN     "zatcaSellerNameAr" TEXT,
ADD COLUMN     "zatcaSellerNameEn" TEXT,
ADD COLUMN     "zatcaVatNumber" TEXT;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "country" TEXT DEFAULT 'Saudi Arabia',
ADD COLUMN     "countryCode" TEXT DEFAULT 'SA',
ADD COLUMN     "customDomain" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "vatNumber" TEXT;

-- CreateTable
CREATE TABLE "ZatcaConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "branchId" TEXT,
    "privateKey" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "certificate" TEXT,
    "csr" TEXT,
    "secret" TEXT,
    "binaryToken" TEXT,
    "pih" TEXT,
    "environment" TEXT NOT NULL DEFAULT 'SANDBOX',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ZatcaConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZatcaInvoiceReport" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "ZatcaStatus" NOT NULL DEFAULT 'PENDING',
    "invoiceHash" TEXT,
    "qrCode" TEXT,
    "xmlBase64" TEXT,
    "responsePayload" JSONB,
    "errors" JSONB,
    "reportedAt" TIMESTAMP(3),

    CONSTRAINT "ZatcaInvoiceReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ZatcaConfig_tenantId_key" ON "ZatcaConfig"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ZatcaConfig_branchId_key" ON "ZatcaConfig"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "ZatcaInvoiceReport_orderId_key" ON "ZatcaInvoiceReport"("orderId");

-- CreateIndex
CREATE INDEX "ZatcaInvoiceReport_orderId_idx" ON "ZatcaInvoiceReport"("orderId");

-- CreateIndex
CREATE INDEX "ZatcaInvoiceReport_status_idx" ON "ZatcaInvoiceReport"("status");

-- CreateIndex
CREATE INDEX "Order_tenantId_scheduledAt_idx" ON "Order"("tenantId", "scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_customDomain_key" ON "Tenant"("customDomain");

-- AddForeignKey
ALTER TABLE "ZatcaConfig" ADD CONSTRAINT "ZatcaConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZatcaInvoiceReport" ADD CONSTRAINT "ZatcaInvoiceReport_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
