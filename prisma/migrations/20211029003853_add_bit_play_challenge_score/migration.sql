-- CreateTable
CREATE TABLE "bit_play_challenge_account" (
    "challenge_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "highest_score" INTEGER NOT NULL DEFAULT 0,
    "history" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3)
);

-- CreateIndex
CREATE UNIQUE INDEX "bit_play_challenge_account.challenge_id_account_id_unique" ON "bit_play_challenge_account"("challenge_id", "account_id");

-- AddForeignKey
ALTER TABLE "bit_play_challenge_account" ADD FOREIGN KEY ("challenge_id") REFERENCES "bit_play_challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bit_play_challenge_account" ADD FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
