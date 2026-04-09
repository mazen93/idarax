-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "preOrderEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "preOrderLeadMinutes" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "preOrderMaxDaysAhead" INTEGER NOT NULL DEFAULT 7;
