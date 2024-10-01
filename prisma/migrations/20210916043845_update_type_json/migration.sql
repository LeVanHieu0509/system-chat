/*
  Warnings:

  - The `level_histories` column on the `chicken_farm_adult` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `harvest_histories` column on the `chicken_farm_adult` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `martket_histories` column on the `chicken_farm_adult` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `histories` column on the `chicken_farm_egg` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `egg_id` on the `chicken_farm_egg_event` table. All the data in the column will be lost.
  - The `time_start` column on the `chicken_farm_egg_event` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `time_end` column on the `chicken_farm_egg_event` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `histories` column on the `partner_transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `egg_event_id` to the `chicken_farm_egg` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "chicken_farm_egg_event" DROP CONSTRAINT "chicken_farm_egg_event_egg_id_fkey";

-- AlterTable
ALTER TABLE "account" ADD COLUMN     "histories" JSONB;

-- AlterTable
ALTER TABLE "account_daily_lucky_wheel" ADD COLUMN     "luckyWheelHistories" JSONB;

-- AlterTable
ALTER TABLE "cashback_transaction" ADD COLUMN     "cbHistories" JSONB;

-- AlterTable
ALTER TABLE "chicken_farm_adult" ADD COLUMN     "total_egg_sold" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "level_histories",
ADD COLUMN     "level_histories" JSONB,
DROP COLUMN "harvest_histories",
ADD COLUMN     "harvest_histories" JSONB,
DROP COLUMN "martket_histories",
ADD COLUMN     "martket_histories" JSONB;

-- AlterTable
ALTER TABLE "chicken_farm_egg" ADD COLUMN     "egg_event_id" UUID NOT NULL,
DROP COLUMN "histories",
ADD COLUMN     "histories" JSONB;

-- AlterTable
ALTER TABLE "chicken_farm_egg_event" DROP COLUMN "egg_id",
DROP COLUMN "time_start",
ADD COLUMN     "time_start" BIGINT NOT NULL DEFAULT 0,
DROP COLUMN "time_end",
ADD COLUMN     "time_end" BIGINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "partner_transaction" DROP COLUMN "histories",
ADD COLUMN     "histories" JSONB;

-- AddForeignKey
ALTER TABLE "chicken_farm_egg" ADD FOREIGN KEY ("egg_event_id") REFERENCES "chicken_farm_egg_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
