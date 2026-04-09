-- AlterTable
ALTER TABLE "BranchSettings" ADD COLUMN     "requireOpenDrawer" BOOLEAN,
ADD COLUMN     "requireOpenShift" BOOLEAN;

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "requireOpenDrawer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requireOpenShift" BOOLEAN NOT NULL DEFAULT false;
