/*
  Warnings:

  - You are about to drop the column `address` on the `Record` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Record` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Record` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Record_address_key";

-- AlterTable
ALTER TABLE "Record" DROP COLUMN "address",
ADD COLUMN     "chain" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Record_name_key" ON "Record"("name");
