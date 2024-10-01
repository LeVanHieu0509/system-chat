/*
  Warnings:

  - You are about to drop the column `market_histories` on the `chicken_farm_adult` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chicken_farm_adult" DROP COLUMN "market_histories",
ADD COLUMN     "histories" JSONB;
