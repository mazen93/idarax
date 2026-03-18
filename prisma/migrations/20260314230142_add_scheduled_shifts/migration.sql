-- CreateEnum
CREATE TYPE "ScheduledShiftStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');

-- CreateTable
CREATE TABLE "ScheduledShift" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "status" "ScheduledShiftStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledShift_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduledShift_userId_startAt_idx" ON "ScheduledShift"("userId", "startAt");

-- CreateIndex
CREATE INDEX "ScheduledShift_tenantId_idx" ON "ScheduledShift"("tenantId");

-- AddForeignKey
ALTER TABLE "ScheduledShift" ADD CONSTRAINT "ScheduledShift_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledShift" ADD CONSTRAINT "ScheduledShift_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledShift" ADD CONSTRAINT "ScheduledShift_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
