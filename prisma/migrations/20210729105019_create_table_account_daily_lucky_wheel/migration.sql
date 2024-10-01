-- AlterTable
ALTER TABLE "config_daily_lucky_wheel" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "config_payment_lucky_wheel" ALTER COLUMN "id" DROP DEFAULT;

-- CreateTable
CREATE TABLE "account_daily_lucky_wheel" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "status" SMALLINT NOT NULL DEFAULT 1,
    "note" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "account_id" UUID NOT NULL,
    "reward_id" UUID,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "account_daily_lucky_wheel" ADD FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_daily_lucky_wheel" ADD FOREIGN KEY ("reward_id") REFERENCES "config_daily_lucky_wheel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
