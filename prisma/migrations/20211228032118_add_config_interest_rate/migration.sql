/*
  Warnings:

  - You are about to drop the `bit_play_game` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bit_play_challenge_account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bit_play_challenge` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "bit_play_game" DROP CONSTRAINT "bit_play_game_created_id_fkey";

-- DropForeignKey
ALTER TABLE "bit_play_game" DROP CONSTRAINT "bit_play_game_updated_id_fkey";

-- DropForeignKey
ALTER TABLE "bit_play_challenge_account" DROP CONSTRAINT "bit_play_challenge_account_account_id_fkey";

-- DropForeignKey
ALTER TABLE "bit_play_challenge_account" DROP CONSTRAINT "bit_play_challenge_account_challenge_id_fkey";

-- DropForeignKey
ALTER TABLE "bit_play_challenge" DROP CONSTRAINT "bit_play_challenge_created_id_fkey";

-- DropForeignKey
ALTER TABLE "bit_play_challenge" DROP CONSTRAINT "bit_play_challenge_game_id_fkey";

-- DropForeignKey
ALTER TABLE "bit_play_challenge" DROP CONSTRAINT "bit_play_challenge_updated_id_fkey";

-- DropTable
DROP TABLE "bit_play_game";

-- DropTable
DROP TABLE "bit_play_challenge_account";

-- DropTable
DROP TABLE "bit_play_challenge";

-- CreateTable
CREATE TABLE "config_interest_rate" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(150) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "from_wallet_id" UUID NOT NULL,
    "wallet_receive_id" UUID NOT NULL,
    "updated_id" UUID,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "config_interest_rate" ADD FOREIGN KEY ("from_wallet_id") REFERENCES "currency_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_interest_rate" ADD FOREIGN KEY ("wallet_receive_id") REFERENCES "currency_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_interest_rate" ADD FOREIGN KEY ("updated_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
