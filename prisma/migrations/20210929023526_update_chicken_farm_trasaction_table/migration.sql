/*
  Warnings:

  - You are about to drop the column `description` on the `chicken_farm_transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chicken_farm_transaction" DROP COLUMN "description",
ADD COLUMN     "buyer_description" VARCHAR(255),
ADD COLUMN     "seller_description" VARCHAR(255);
