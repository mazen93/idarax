-- CreateEnum
CREATE TYPE "DrawerStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "CashMovementType" AS ENUM ('OPENING', 'SALE', 'REFUND', 'CASH_IN', 'CASH_OUT', 'CLOSING');

-- CreateTable
CREATE TABLE "DrawerSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "branchId" TEXT,
    "openingBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "closingBalance" DECIMAL(65,30),
    "expectedBalance" DECIMAL(65,30),
    "status" "DrawerStatus" NOT NULL DEFAULT 'OPEN',
    "note" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrawerSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashMovement" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "type" "CashMovementType" NOT NULL,
    "reason" TEXT,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DrawerSession_tenantId_openedAt_idx" ON "DrawerSession"("tenantId", "openedAt");

-- AddForeignKey
ALTER TABLE "DrawerSession" ADD CONSTRAINT "DrawerSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawerSession" ADD CONSTRAINT "DrawerSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawerSession" ADD CONSTRAINT "DrawerSession_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "DrawerSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
