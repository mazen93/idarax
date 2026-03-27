-- AlterTable
ALTER TABLE "BranchSettings" ADD COLUMN     "cdsEnabled" BOOLEAN DEFAULT false,
ADD COLUMN     "cdsIdleImages" TEXT[],
ADD COLUMN     "cdsShowPromotions" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "planId" TEXT;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
