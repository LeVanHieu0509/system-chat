/*
  Warnings:

  - You are about to drop the column `isChicken` on the `chicken_farm_market` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chicken_farm_egg_event" ADD COLUMN     "created_id" UUID,
ADD COLUMN     "currency_id" UUID,
ADD COLUMN     "egg_id" UUID,
ALTER COLUMN "price" SET DEFAULT 0,
ALTER COLUMN "total_egg" SET DEFAULT 0,
ALTER COLUMN "total_sold" SET DEFAULT 0,
ALTER COLUMN "number_order" SET DEFAULT 0,
ALTER COLUMN "time_end" DROP NOT NULL;

-- AlterTable
ALTER TABLE "chicken_farm_market" DROP COLUMN "isChicken",
ADD COLUMN     "is_chicken" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "currency_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "chicken_farm_egg_event" ADD FOREIGN KEY ("egg_id") REFERENCES "chicken_farm_egg"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_egg_event" ADD FOREIGN KEY ("currency_id") REFERENCES "currency_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_egg_event" ADD FOREIGN KEY ("created_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
