CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- CreateTable
CREATE TABLE IF NOT EXISTS "account" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "avatar" VARCHAR(150),
    "full_name" VARCHAR(255),
    "email" VARCHAR(50),
    "passcode" VARCHAR(100),
    "email_verified" BOOLEAN DEFAULT false,
    "phone" VARCHAR(20) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "kyc_status" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "referral_code" VARCHAR(8),
    "device_token" VARCHAR(255),
    "match_move_id" VARCHAR(32),
    "match_move_account" JSONB,
    "match_move_wallet" JSONB,
    "match_move_card" JSONB,
    "currency_id" UUID,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "account_balance" (
    "account_id" UUID NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "cashback_available" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reason" VARCHAR(255),
    "type" SMALLINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "currency_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "cashback_transaction" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" INTEGER NOT NULL DEFAULT 1,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fee" DOUBLE PRECISION DEFAULT 0,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "vndc_json" JSONB,
    "access_trade_id" VARCHAR(50),
    "access_trade_json" JSONB,
    "currency_id" UUID NOT NULL,
    "campaign_id" UUID,
    "sender_id" UUID,
    "receiver_id" UUID,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "cashback_transaction_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "note" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "transaction_id" UUID,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "currency_master" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_name" VARCHAR(50) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(50),
    "phone" VARCHAR(20),
    "avatar" VARCHAR(150),
    "role" SMALLINT,
    "status" SMALLINT DEFAULT 1,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "campaign" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "open_link" VARCHAR(255),
    "banner" VARCHAR(255),
    "logo" VARCHAR(255),
    "slogan" VARCHAR(255),
    "description" VARCHAR(500),
    "count_trans" INTEGER DEFAULT 0,
    "contact_email" VARCHAR(50),
    "contact_phone" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "total_commission" INTEGER DEFAULT 0,
    "position" SMALLINT DEFAULT 0,
    "category_id" UUID,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "campaign_category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255),
    "cashback_rate" DOUBLE PRECISION DEFAULT 0,
    "category_id" VARCHAR(50),
    "from_source" VARCHAR(300),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "campaign_id" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "category_master" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "icon" VARCHAR(150),
    "name" VARCHAR(100),
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "job_campaign_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "message" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "account_id" UUID,
    "campaign_id" UUID,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "account_referral" (
    "referral_from" UUID NOT NULL,
    "referral_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("referral_from","referral_by")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "account_contact" (
    "contact_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "display_name" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "account_id" UUID NOT NULL,

    PRIMARY KEY ("account_id","contact_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "account_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reason" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "account_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "account_setting" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" SMALLINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receive_notify" BOOLEAN,
    "account_id" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "withdraw_transaction" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "type" SMALLINT,
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "account_id" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "withdraw_transaction_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "note" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "transaction_id" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "config" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" SMALLINT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" SMALLINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "display_name" VARCHAR(255),
    "user_id" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "notification" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" SMALLINT NOT NULL,
    "icon" VARCHAR(255),
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "html_content" TEXT,
    "ref" UUID,
    "account_id" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "account_summary" (
    "value" INTEGER NOT NULL DEFAULT 0,
    "day" SMALLINT NOT NULL,
    "week" SMALLINT NOT NULL,
    "month" SMALLINT NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3)
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "cashback_summary" (
    "value" INTEGER NOT NULL DEFAULT 0,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL,
    "day" SMALLINT NOT NULL,
    "week" SMALLINT NOT NULL,
    "month" SMALLINT NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3)
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "config_commission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "referralFrom" INTEGER NOT NULL DEFAULT 0,
    "referralBy" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "banner" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "url_content" VARCHAR(255) NOT NULL,
    "position" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account.email_unique" ON "account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "account.phone_unique" ON "account"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "account.referral_code_unique" ON "account"("referral_code");

-- CreateIndex
CREATE UNIQUE INDEX "cashback_available.currency_id_account_id_unique" ON "cashback_available"("currency_id", "account_id");

-- CreateIndex
CREATE UNIQUE INDEX "currency_master.code_unique" ON "currency_master"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user.user_name_unique" ON "user"("user_name");

-- CreateIndex
CREATE UNIQUE INDEX "user.email_unique" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "account_referral_referral_from_unique" ON "account_referral"("referral_from");

-- CreateIndex
CREATE UNIQUE INDEX "account_summary.day_month_year_unique" ON "account_summary"("day", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "cashback_summary.day_month_year_status_unique" ON "cashback_summary"("day", "month", "year", "status");

-- AddForeignKey
ALTER TABLE "withdraw_transaction_history" ADD FOREIGN KEY ("transaction_id") REFERENCES "withdraw_transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cashback_transaction_history" ADD FOREIGN KEY ("transaction_id") REFERENCES "cashback_transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config" ADD FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_balance" ADD FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_referral" ADD FOREIGN KEY ("referral_from") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_referral" ADD FOREIGN KEY ("referral_by") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cashback_available" ADD FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cashback_available" ADD FOREIGN KEY ("currency_id") REFERENCES "currency_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_setting" ADD FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign" ADD FOREIGN KEY ("category_id") REFERENCES "category_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_category" ADD FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraw_transaction" ADD FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD FOREIGN KEY ("currency_id") REFERENCES "currency_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cashback_transaction" ADD FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cashback_transaction" ADD FOREIGN KEY ("currency_id") REFERENCES "currency_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cashback_transaction" ADD FOREIGN KEY ("sender_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cashback_transaction" ADD FOREIGN KEY ("receiver_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_campaign_history" ADD FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_campaign_history" ADD FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_contact" ADD FOREIGN KEY ("contact_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_history" ADD FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_history" ADD FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Default values
INSERT INTO "user" (user_name, "password", full_name, "role", status) VALUES('admin', '$2a$10$p9gzCze52Ki0IszgfAogMecdY1Fu0edFtTxJo620mUh7dS1BAwvti', 'Admin', 1, 1);

INSERT INTO category_master (icon, "name", description) VALUES('', 'Chợ điện tử', 'Chợ điện tử');
INSERT INTO category_master (icon, "name", description) VALUES('', 'Học trực tuyến', 'Học trực tuyến');
INSERT INTO category_master (icon, "name", description) VALUES('', 'Khách sạn', 'Khách sạn');
INSERT INTO category_master (icon, "name", description) VALUES('', 'Tour du lịch', 'Tour du lịch');
INSERT INTO category_master (icon, "name", description) VALUES('', 'Vé máy bay', 'Vé máy bay');
INSERT INTO category_master (icon, "name", description) VALUES('', 'Thời trang', 'Thời trang');
INSERT INTO category_master (icon, "name", description) VALUES('', 'Công nghệ', 'Công nghệ');
INSERT INTO category_master (icon, "name", description) VALUES('', 'Làm đẹp', 'Làm đẹp');
INSERT INTO category_master (icon, "name", description) VALUES('', 'Ăn uống', 'Ăn uống');
INSERT INTO category_master (icon, "name", description) VALUES('', 'Mua sách', 'Mua sách');
INSERT INTO category_master (icon, "name", description) VALUES('', 'Dịch vụ online', 'Dịch vụ online');

INSERT INTO currency_master (code, "name", status) VALUES('BTC', 'BITCOIN', 1);
