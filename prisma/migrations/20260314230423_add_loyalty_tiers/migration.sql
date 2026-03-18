-- CreateEnum
CREATE TYPE "LoyaltyTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "loyaltyTier" "LoyaltyTier" NOT NULL DEFAULT 'BRONZE',
ADD COLUMN     "totalSpend" DECIMAL(65,30) NOT NULL DEFAULT 0;
