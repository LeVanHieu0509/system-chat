-- CreateTable
CREATE TABLE "chicken_farm_master" (
    "type" SMALLINT NOT NULL DEFAULT 1,
    "level" SMALLINT NOT NULL DEFAULT 1,
    "rate" SMALLINT NOT NULL DEFAULT 0,
    "price" SMALLINT NOT NULL DEFAULT 1,
    "total_egg" INTEGER NOT NULL DEFAULT 0,
    "time_harvest" SMALLINT NOT NULL DEFAULT 24,
    "egg_harvest" INTEGER NOT NULL DEFAULT 0,
    "number_harvest" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("type","level")
);

-- CreateTable
CREATE TABLE "chicken_farm_egg" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "status" INTEGER NOT NULL DEFAULT 1,
    "time_start" BIGINT NOT NULL DEFAULT 0,
    "time_end" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "histories" JSONB[],
    "owner_id" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chicken_farm_adult" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" SMALLINT NOT NULL DEFAULT 1,
    "level" SMALLINT NOT NULL DEFAULT 1,
    "status" INTEGER NOT NULL DEFAULT 1,
    "time_start" BIGINT NOT NULL DEFAULT 0,
    "time_end" BIGINT NOT NULL DEFAULT 0,
    "last_harvest" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "egg_claimed_level_1" INTEGER NOT NULL DEFAULT 0,
    "egg_claimed_level_2" INTEGER NOT NULL DEFAULT 0,
    "egg_claimed_level_3" INTEGER NOT NULL DEFAULT 0,
    "egg_claimed_level_4" INTEGER NOT NULL DEFAULT 0,
    "egg_claimed_level_5" INTEGER NOT NULL DEFAULT 0,
    "level_histories" JSONB[],
    "harvest_histories" JSONB[],
    "martket_histories" JSONB[],
    "egg_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chicken_farm_egg_event" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "price" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "total_egg" INTEGER NOT NULL,
    "total_sold" INTEGER NOT NULL,
    "number_order" INTEGER NOT NULL,
    "limit_per_buy" INTEGER NOT NULL DEFAULT 1,
    "time_start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "time_end" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chicken_farm_market" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "isChicken" BOOLEAN NOT NULL DEFAULT false,
    "price" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "egg_id" UUID,
    "chicken_id" UUID,
    "buyer_id" UUID,
    "seller_id" UUID NOT NULL,
    "currency_id" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chicken_farm_adult_egg_id_unique" ON "chicken_farm_adult"("egg_id");

-- CreateIndex
CREATE UNIQUE INDEX "chicken_farm_market_chicken_id_unique" ON "chicken_farm_market"("chicken_id");

-- AddForeignKey
ALTER TABLE "chicken_farm_egg" ADD FOREIGN KEY ("owner_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_market" ADD FOREIGN KEY ("egg_id") REFERENCES "chicken_farm_egg"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_market" ADD FOREIGN KEY ("chicken_id") REFERENCES "chicken_farm_adult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_market" ADD FOREIGN KEY ("buyer_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_market" ADD FOREIGN KEY ("seller_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_market" ADD FOREIGN KEY ("currency_id") REFERENCES "currency_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_adult" ADD FOREIGN KEY ("egg_id") REFERENCES "chicken_farm_egg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_adult" ADD FOREIGN KEY ("owner_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Default values
INSERT INTO chicken_farm_master("type", "level", "rate", "price", "total_egg", "time_harvest", "egg_harvest", "number_harvest")
values	(1, 1, 6, 1, 6442, 24, 429, 15),
		(1, 2, 9, 1, 9663, 24, 483, 20),
		(1, 3, 15, 1, 16105, 24, 537, 30),
		(1, 4, 25, 1, 26842, 24, 595, 45),
		(1, 5, 45, 1, 48316, 24, 690, 70),
		(2, 1, 6, 1, 6912, 24, 461, 15),
		(2, 2, 9, 1, 10368, 24, 518, 20),
		(2, 3, 15, 1, 17280, 24, 576, 30),
		(2, 4, 25, 1, 28800, 24, 640, 45),
		(2, 5, 45, 1, 51840, 24, 741, 70),
		(3, 1, 6, 1, 7200, 24, 480, 15),
		(3, 2, 9, 1, 10800, 24, 540, 20),
		(3, 3, 15, 1, 18000, 24, 600, 30),
		(3, 4, 25, 1, 30000, 24, 667, 45),
		(3, 5, 45, 1, 54000, 24, 771, 70),
		(4, 1, 6, 10, 8400, 24, 560, 15),
		(4, 2, 9, 10, 12600, 24, 630, 20),
		(4, 3, 15, 10, 21000, 24, 700, 30),
		(4, 4, 25, 10, 35000, 24, 778, 45),
		(4, 5, 45, 10, 63000, 24, 900, 70),
		(5, 1, 6, 10, 9360, 24, 624, 15),
		(5, 2, 9, 10, 14040, 24, 702, 20),
		(5, 3, 15, 10, 23400, 24, 780, 30),
		(5, 4, 25, 10, 39000, 24, 867, 45),
		(5, 5, 45, 10, 70200, 24, 1003, 70);
