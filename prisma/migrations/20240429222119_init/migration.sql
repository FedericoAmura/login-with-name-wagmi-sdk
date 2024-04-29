/*
  Warnings:

  - A unique constraint covering the columns `[address]` on the table `Record` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Record_address_key" ON "Record"("address");
