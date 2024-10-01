-- DropIndex
DROP INDEX "pool_rate_history.date_time_unique";

-- DropIndex
DROP INDEX "pool_egg_history.date_time_unique";

-- DropIndex
DROP INDEX "pool_bbc_history.date_time_unique";

-- AlterTable
ALTER TABLE "bonus_event" ALTER COLUMN "broker_id" SET DEFAULT E'00000000-0000-0000-0000-000000000000',
ALTER COLUMN "created_id" SET DEFAULT E'00000000-0000-0000-0000-000000000000';

-- CreateIndex
CREATE INDEX "pool_egg_history.created_at_index" ON "pool_egg_history"("created_at");

-- CreateIndex
CREATE INDEX "pool_bbc_history.created_at_index" ON "pool_bbc_history"("created_at");

-- CreateIndex
CREATE INDEX "pool_rate_history.created_at_index" ON "pool_rate_history"("created_at");
