-- CreateTable
CREATE TABLE "account_referral_stats" (
    "account_id" UUID NOT NULL,
    "total_referrals" INTEGER NOT NULL DEFAULT 0,
    "total_kyc" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    PRIMARY KEY ("account_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_referral_stats.account_id_unique" ON "account_referral_stats"("account_id");

-- AddForeignKey
ALTER TABLE "account_referral_stats" ADD FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
