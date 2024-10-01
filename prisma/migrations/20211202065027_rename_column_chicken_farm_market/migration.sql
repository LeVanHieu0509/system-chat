-- DropForeignKey
ALTER TABLE "chicken_farm_breed" DROP CONSTRAINT IF EXISTS "chicken_farm_breed_henId_fkey";

-- DropForeignKey
ALTER TABLE "chicken_farm_breed" DROP CONSTRAINT IF EXISTS  "chicken_farm_breed_roosterId_fkey";

-- DropForeignKey
ALTER TABLE "chicken_farm_market" DROP CONSTRAINT IF EXISTS "chicken_farm_market_roosterId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "chicken_farm_breed_henId_unique";

-- DropIndex
DROP INDEX IF EXISTS "chicken_farm_market.roosterId_index";

-- DropIndex
DROP INDEX IF EXISTS "chicken_farm_breed.henId_roosterId_unique";

-- AlterTable
ALTER TABLE "chicken_farm_breed" DROP COLUMN "henId",
DROP COLUMN "roosterId",
ADD COLUMN     "hen_id" UUID NOT NULL,
ADD COLUMN     "rooster_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "chicken_farm_market" DROP COLUMN "roosterId",
ADD COLUMN     "rooster_id" UUID;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "chicken_farm_market.rooster_id_index" ON "chicken_farm_market"("rooster_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "chicken_farm_breed.hen_id_rooster_id_unique" ON "chicken_farm_breed"("hen_id", "rooster_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "chicken_farm_breed_hen_id_unique" ON "chicken_farm_breed"("hen_id");

-- AddForeignKey
ALTER TABLE "chicken_farm_breed" ADD FOREIGN KEY ("hen_id") REFERENCES "chicken_farm_adult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_breed" ADD FOREIGN KEY ("rooster_id") REFERENCES "chicken_farm_rooster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_market" ADD FOREIGN KEY ("rooster_id") REFERENCES "chicken_farm_rooster"("id") ON DELETE SET NULL ON UPDATE CASCADE;
