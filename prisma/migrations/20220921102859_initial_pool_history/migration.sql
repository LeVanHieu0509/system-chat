-- AlterTable
ALTER TABLE "bonus_event" ALTER COLUMN "broker_id" SET DEFAULT E'00000000-0000-0000-0000-000000000000',
ALTER COLUMN "created_id" SET DEFAULT E'00000000-0000-0000-0000-000000000000';

-- CreateTable
CREATE TABLE "pool_egg_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "in" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "out" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "last" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "time" VARCHAR(10) NOT NULL DEFAULT E'00:00:00',
    "date" VARCHAR(10) NOT NULL DEFAULT E'01/01/1970',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "pool_id" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pool_bbc_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "in" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "out" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "last" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "time" VARCHAR(10) NOT NULL DEFAULT E'00:00:00',
    "date" VARCHAR(10) NOT NULL DEFAULT E'01/01/1970',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "pool_id" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pool_egg_history.date_time_unique" ON "pool_egg_history"("date", "time");

-- CreateIndex
CREATE INDEX "pool_egg_history.pool_id_index" ON "pool_egg_history"("pool_id");

-- CreateIndex
CREATE UNIQUE INDEX "pool_bbc_history.date_time_unique" ON "pool_bbc_history"("date", "time");

-- CreateIndex
CREATE INDEX "pool_bbc_history.pool_id_index" ON "pool_bbc_history"("pool_id");

-- AddForeignKey
ALTER TABLE "pool_egg_history" ADD FOREIGN KEY ("pool_id") REFERENCES "pool_value"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pool_bbc_history" ADD FOREIGN KEY ("pool_id") REFERENCES "pool_value"("id") ON DELETE CASCADE ON UPDATE CASCADE;
