/*
  Warnings:

  - You are about to drop the column `harvest_histories` on the `chicken_farm_adult` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chicken_farm_adult" DROP COLUMN "harvest_histories",
DROP COLUMN "level_histories";

-- CreateTable
CREATE TABLE "chicken_farm_egg_harvest" (
    "level" SMALLINT NOT NULL DEFAULT 1,
    "total" INTEGER NOT NULL DEFAULT 0,
    "time_last_harvest" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "date" VARCHAR(10) NOT NULL,
    "chicken_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,

    PRIMARY KEY ("date","chicken_id","owner_id","level")
);

-- AddForeignKey
ALTER TABLE "chicken_farm_egg_harvest" ADD FOREIGN KEY ("chicken_id") REFERENCES "chicken_farm_adult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_egg_harvest" ADD FOREIGN KEY ("owner_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
