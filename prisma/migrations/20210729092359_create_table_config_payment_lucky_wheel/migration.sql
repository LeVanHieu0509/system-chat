-- AlterTable
ALTER TABLE "config_daily_lucky_wheel" ALTER COLUMN "reward" SET DEFAULT 0,
ALTER COLUMN "reward" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "config_payment_lucky_wheel" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(150) NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "type" SMALLINT NOT NULL DEFAULT 1,
    "reward" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "approval" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "updated_id" UUID,
    "currency_id" UUID,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "config_payment_lucky_wheel" ADD FOREIGN KEY ("updated_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_payment_lucky_wheel" ADD FOREIGN KEY ("currency_id") REFERENCES "currency_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO config_payment_lucky_wheel("title", "rate", "type", "reward", "approval", "currency_id")
VALUES ('Thưởng thêm Satoshi đợt cashback tiếp theo 5%.',3,4,0.05,FALSE, (SELECT id FROM currency_master LIMIT 1)),
       ('Thưởng thêm Satoshi đợt cashback tiếp theo 25%.',2,4,0.25,FALSE, (SELECT id FROM currency_master LIMIT 1)),
       ('Thưởng thêm Satoshi đợt cashback tiếp theo 50%.',1,4,0.5,FALSE, (SELECT id FROM currency_master LIMIT 1)),
       ('Nhân đôi số dư satoshi đang có trong phần cashback.',2.5,1,2,TRUE, (SELECT id FROM currency_master LIMIT 1)),
       ('Nhân đôi số dư trong thẻ Trustpay Card bằng satoshi.',2.5,2,2,TRUE, (SELECT id FROM currency_master LIMIT 1)),
       ('Hoàn tiền trên đơn hàng 10%',3,3,0.1,FALSE, (SELECT id FROM currency_master LIMIT 1)),
       ('Hoàn tiền trên đơn hàng 25%.',2,3,0.25,FALSE, (SELECT id FROM currency_master LIMIT 1)),
       ('Hoàn tiền trên đơn hàng 100%.',1,3,1,FALSE, (SELECT id FROM currency_master LIMIT 1));

-- Truncate table
TRUNCATE TABLE "config_daily_lucky_wheel";

INSERT INTO config_daily_lucky_wheel("title", "rate", "type", "reward", "approval", "currency_id")
VALUES ('Chúc bạn may mắn lần sau.',5,3,0,FALSE, NULL),
       ('Nhận 100 satoshi.',43,1,0.000001,FALSE, (SELECT id FROM currency_master LIMIT 1)),
       ('Nhận 500 satoshi.',10,1,0.000005,FALSE, (SELECT id FROM currency_master LIMIT 1)),
       ('Nhận 1000 satoshi.',6,1,0.00001,FALSE, (SELECT id FROM currency_master LIMIT 1)),
       ('Nhận 1.000.000 satoshi.',0.5,1,0.01,TRUE, (SELECT id FROM currency_master LIMIT 1)),
       ('Thưởng 1% cho đơn hàng tiếp theo.',7.5,2,1,FALSE, NULL),
       ('Thưởng 5% cho đơn hàng tiếp theo.',3.5,2,5,FALSE, NULL),
       ('Thưởng 10% cho đơn hàng tiếp theo.',2.5,2,10,FALSE, NULL);
