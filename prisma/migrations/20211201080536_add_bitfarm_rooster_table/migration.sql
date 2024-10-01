/*
  Warnings:

  - You are about to alter the column `status` on the `chicken_farm_adult` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `status` on the `chicken_farm_egg` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `status` on the `chicken_farm_egg_event` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.

*/
-- AlterTable
ALTER TABLE "chicken_farm_adult" ALTER COLUMN "status" SET DATA TYPE SMALLINT;

-- AlterTable
ALTER TABLE "chicken_farm_egg" ADD COLUMN     "breed_id" UUID,
ADD COLUMN     "type" SMALLINT NOT NULL DEFAULT 1,
ALTER COLUMN "status" SET DATA TYPE SMALLINT;

-- AlterTable
ALTER TABLE "chicken_farm_egg_event" ADD COLUMN     "type" SMALLINT NOT NULL DEFAULT 1,
ALTER COLUMN "status" SET DATA TYPE SMALLINT;

-- AlterTable
ALTER TABLE "chicken_farm_market" ADD COLUMN     "roosterId" UUID;

-- CreateTable
CREATE TABLE "chicken_farm_rooster" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "chicken_no" INTEGER NOT NULL,
    "type" SMALLINT NOT NULL DEFAULT 1,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "time_start" BIGINT NOT NULL DEFAULT 0,
    "time_end" BIGINT NOT NULL DEFAULT 0,
    "last_bred" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "histories" JSONB,
    "egg_id" UUID NOT NULL,
    "owner_id" UUID,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chicken_farm_breed" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "henId" UUID NOT NULL,
    "roosterId" UUID NOT NULL,
    "finished_time" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chicken_farm_egg.egg_event_id_index" ON "chicken_farm_egg"("egg_event_id");

-- CreateIndex
CREATE INDEX "chicken_farm_egg.breed_id_index" ON "chicken_farm_egg"("breed_id");

-- CreateIndex
CREATE UNIQUE INDEX "chicken_farm_rooster.chicken_no_unique" ON "chicken_farm_rooster"("chicken_no");

-- CreateIndex
CREATE UNIQUE INDEX "chicken_farm_rooster.egg_id_unique" ON "chicken_farm_rooster"("egg_id");

-- CreateIndex
CREATE INDEX "chicken_farm_rooster.owner_id_index" ON "chicken_farm_rooster"("owner_id");

-- CreateIndex
CREATE INDEX "chicken_farm_market.roosterId_index" ON "chicken_farm_market"("roosterId");

-- CreateIndex
CREATE UNIQUE INDEX "chicken_farm_breed.henId_roosterId_unique" ON "chicken_farm_breed"("henId", "roosterId");

-- CreateIndex
CREATE UNIQUE INDEX "chicken_farm_breed_henId_unique" ON "chicken_farm_breed"("henId");

-- AddForeignKey
ALTER TABLE "chicken_farm_breed" ADD FOREIGN KEY ("henId") REFERENCES "chicken_farm_adult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_breed" ADD FOREIGN KEY ("roosterId") REFERENCES "chicken_farm_rooster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_rooster" ADD FOREIGN KEY ("egg_id") REFERENCES "chicken_farm_egg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_rooster" ADD FOREIGN KEY ("owner_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_egg" ADD FOREIGN KEY ("breed_id") REFERENCES "chicken_farm_breed"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_market" ADD FOREIGN KEY ("roosterId") REFERENCES "chicken_farm_rooster"("id") ON DELETE SET NULL ON UPDATE CASCADE;
