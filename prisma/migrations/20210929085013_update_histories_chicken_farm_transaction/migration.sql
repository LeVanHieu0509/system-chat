-- AlterTable
ALTER TABLE "chicken_farm_egg" ALTER COLUMN "egg_event_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "chicken_farm_transaction" ADD COLUMN     "histories" JSONB;
