-- CreateTable
CREATE TABLE "config_daily_lucky_wheel" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(150) NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "type" SMALLINT NOT NULL DEFAULT 1,
    "reward" INTEGER NOT NULL DEFAULT 0,
    "approval" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "updated_id" UUID,
    "currency_id" UUID,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "config_daily_lucky_wheel" ADD FOREIGN KEY ("updated_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_daily_lucky_wheel" ADD FOREIGN KEY ("currency_id") REFERENCES "currency_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO config_daily_lucky_wheel("title", "rate", "type", "reward", "approval", "currency_id")
	VALUES ('Chúc bạn may mắn lần sau.',5,4,0,false, null),
	('Nhận 100 satoshi.',43,1,100,false, (select id from currency_master limit 1)),
	('Nhận 500 satoshi.',10,1,500,false, (select id from currency_master limit 1)),
	('Nhận 1000 satoshi.',6,1,1000,false, (select id from currency_master limit 1)),
	('Nhận 1.000.000 satoshi.',0.5,1,1000000,true, (select id from currency_master limit 1)),
	('Trúng thưởng 1 Bitcoin',0.00001,1,100000000,true, (select id from currency_master limit 1)),
	('Thưởng 1% cho đơn hàng tiếp theo.',7.5,2,0,false, null),
	('Thưởng 5% cho đơn hàng tiếp theo.',3.5,2,0,false, null),
	('Thưởng 10% cho đơn hàng tiếp theo.',2.5,2,0,false, null),
	('Tặng thêm 1 lượt quay.',5,2,0,false, null);

