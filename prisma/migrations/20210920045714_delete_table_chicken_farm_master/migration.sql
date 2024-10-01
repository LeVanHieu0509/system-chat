/*
  Warnings:

  - You are about to drop the column `martket_histories` on the `chicken_farm_adult` table. All the data in the column will be lost.
  - You are about to drop the `chicken_farm_master` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "chicken_farm_adult" DROP COLUMN "martket_histories",
ADD COLUMN     "market_histories" JSONB;

-- DropTable
DROP TABLE "chicken_farm_master";
