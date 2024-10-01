-- CreateTable
CREATE TABLE "currency_limit_setting" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" SMALLINT NOT NULL,
    "fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "min" DOUBLE PRECISION NOT NULL,
    "max" DOUBLE PRECISION NOT NULL,
    "min_hold" DOUBLE PRECISION,
    "max_per_day" DOUBLE PRECISION,
    "max_per_month" DOUBLE PRECISION,
    "currency_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "currency_limit_setting.type_currency_id_unique" ON "currency_limit_setting"("type", "currency_id");

-- AddForeignKey
ALTER TABLE "currency_limit_setting" ADD FOREIGN KEY ("currency_id") REFERENCES "currency_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO currency_master (code, "name", status) VALUES('BBC', 'BBC', 1) ON CONFLICT DO NOTHING;

-- Insert WITHDRAW default limit config
INSERT INTO "currency_limit_setting"
    ("type", "fee", "min", "max", "min_hold", "max_per_day", "max_per_month", "currency_id", "created_at", "updated_at")
VALUES
    (1, 0, 20000, 3000000, 10000, 10000000, 30000000, (SELECT "id" FROM "currency_master" WHERE "code" = 'SAT'), NOW(), NOW()),
    (1, 1000, 100000, 1000000, 20000, 1500000, 10000000, (SELECT "id" FROM "currency_master" WHERE "code" = 'VNDC'), NOW(), NOW()),
    (1, 0, 2000, 100000, 0, 1500000, 10000000, (SELECT "id" FROM "currency_master" WHERE "code" = 'BBC'), NOW(), NOW());

-- Insert SWAP default limit config
INSERT INTO "currency_limit_setting"
    ("type", "min", "max", "min_hold", "currency_id", "created_at", "updated_at")
VALUES
    (2, 20000, 50000000, 0, (SELECT "id" FROM "currency_master" WHERE "code" = 'SAT'), NOW(), NOW()),
    (2, 100000, 50000000, 20000, (SELECT "id" FROM "currency_master" WHERE "code" = 'VNDC'), NOW(), NOW()),
    (2, 20000, 50000000, 0, (SELECT "id" FROM "currency_master" WHERE "code" = 'BBC'), NOW(), NOW());
