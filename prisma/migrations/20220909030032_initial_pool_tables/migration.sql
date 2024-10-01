-- AlterTable
ALTER TABLE "bonus_event" ALTER COLUMN "broker_id" SET DEFAULT E'00000000-0000-0000-0000-000000000000',
ALTER COLUMN "created_id" SET DEFAULT E'00000000-0000-0000-0000-000000000000';

-- CreateTable
CREATE TABLE "pool_config" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 30,
    "min" INTEGER NOT NULL DEFAULT 10000,
    "max" INTEGER NOT NULL DEFAULT 100000,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "updated_id" UUID,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pool_value" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "egg_value" DECIMAL(65,30) NOT NULL DEFAULT 1000000000,
    "bbc_value" DECIMAL(65,30) NOT NULL DEFAULT 10000000,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "updated_id" UUID,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pool_value" ADD FOREIGN KEY ("updated_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pool_config" ADD FOREIGN KEY ("updated_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO pool_value ("egg_value", "bbc_value") VALUES(1000000000, 10000000);

INSERT INTO pool_config (revenue, min, max) VALUES(30, 10000, 100000);
