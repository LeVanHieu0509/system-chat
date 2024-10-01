-- AlterTable
ALTER TABLE "chicken_farm_master" ADD COLUMN     "max_slot" SMALLINT NOT NULL DEFAULT 25,
ADD COLUMN     "min_time_on_market" SMALLINT NOT NULL DEFAULT 1,
ADD COLUMN     "time_hatching" SMALLINT NOT NULL DEFAULT 240;
