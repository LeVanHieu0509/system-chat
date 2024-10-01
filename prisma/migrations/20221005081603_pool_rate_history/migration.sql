-- AlterTable
ALTER TABLE "bonus_event" ALTER COLUMN "broker_id" SET DEFAULT E'00000000-0000-0000-0000-000000000000',
ALTER COLUMN "created_id" SET DEFAULT E'00000000-0000-0000-0000-000000000000';

-- CreateTable
CREATE TABLE "pool_rate_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "time" VARCHAR(10) NOT NULL DEFAULT E'00:00:00',
    "date" VARCHAR(10) NOT NULL DEFAULT E'01/01/1970',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pool_id" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pool_rate_history.date_time_unique" ON "pool_rate_history"("date", "time");

-- CreateIndex
CREATE INDEX "pool_rate_history.pool_id_index" ON "pool_rate_history"("pool_id");

-- AddForeignKey
ALTER TABLE "pool_rate_history" ADD FOREIGN KEY ("pool_id") REFERENCES "pool_value"("id") ON DELETE CASCADE ON UPDATE CASCADE;
