-- CreateTable
CREATE TABLE "referral_ranking" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "time_start" BIGINT NOT NULL DEFAULT 0,
    "time_end" BIGINT NOT NULL DEFAULT 0,
    "total_prize" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "prize_rate" JSONB,
    "currency_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_ranking_account" (
    "rank" INTEGER NOT NULL,
    "referral_count" INTEGER NOT NULL DEFAULT 0,
    "prize_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "prize_rate" DOUBLE PRECISION NOT NULL,
    "awarded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "account_id" UUID NOT NULL,
    "referral_ranking_id" UUID NOT NULL,
    "cashback_transaction_id" UUID,

    PRIMARY KEY ("account_id","referral_ranking_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "referral_ranking_account_cashback_transaction_id_unique" ON "referral_ranking_account"("cashback_transaction_id");

-- AddForeignKey
ALTER TABLE "referral_ranking" ADD FOREIGN KEY ("currency_id") REFERENCES "currency_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_ranking_account" ADD FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_ranking_account" ADD FOREIGN KEY ("referral_ranking_id") REFERENCES "referral_ranking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_ranking_account" ADD FOREIGN KEY ("cashback_transaction_id") REFERENCES "cashback_transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
