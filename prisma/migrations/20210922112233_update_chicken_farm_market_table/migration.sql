/*
  Warnings:

  - You are about to drop the column `is_chicken` on the `chicken_farm_market` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[egg_id]` on the table `chicken_farm_market` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "chicken_farm_market" DROP COLUMN "is_chicken";

-- CreateIndex
CREATE UNIQUE INDEX "chicken_farm_market_egg_id_unique" ON "chicken_farm_market"("egg_id");
