-- AlterTable
ALTER TABLE "chicken_farm_adult" ADD COLUMN     "chicken_no" INTEGER;

CREATE SEQUENCE IF NOT EXISTS chicken_farm_adult_id_seq;
SELECT setval('chicken_farm_adult_id_seq', (SELECT max(chicken_no)+1 FROM chicken_farm_adult), false);
ALTER TABLE chicken_farm_adult ALTER COLUMN chicken_no SET DEFAULT nextval('chicken_farm_adult_id_seq');

UPDATE chicken_farm_adult SET chicken_no = nextval('chicken_farm_adult_id_seq');

DROP SEQUENCE IF EXISTS chicken_farm_adult_id_seq CASCADE;

-- AlterTable
ALTER TABLE "chicken_farm_adult" ALTER COLUMN "chicken_no" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "chicken_farm_adult.chicken_no_unique" ON "chicken_farm_adult"("chicken_no");