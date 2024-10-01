/*
  Warnings:

  - You are about to drop the `vndc_transaction` table. If the table is not empty, all the data it contains will be lost.

*/

-- AlterTable
ALTER TABLE "config_daily_lucky_wheel" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "config_payment_lucky_wheel" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- DropForeignKey
ALTER TABLE "vndc_transaction" DROP CONSTRAINT "vndc_transaction_account_id_fkey";

-- DropTable
DROP TABLE "vndc_transaction";

-- CreateTable
CREATE TABLE "partner_transaction" (
    "order_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "amount" INTEGER NOT NULL DEFAULT 0,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "vndc_receiver" VARCHAR(50) NOT NULL,
    "type" SMALLINT NOT NULL DEFAULT 1,
    "title" VARCHAR(150),
    "description" VARCHAR(255),
    "store_id" INTEGER,
    "payme_id" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "histories" JSONB[],
    "account_id" UUID NOT NULL,

    PRIMARY KEY ("order_id")
);

-- AddForeignKey
ALTER TABLE "partner_transaction" ADD FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
