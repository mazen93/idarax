/*
  Warnings:

  - Changed the type of `number` on the `Table` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Table" DROP COLUMN "number",
ADD COLUMN     "number" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Table_number_tenantId_key" ON "Table"("number", "tenantId");
