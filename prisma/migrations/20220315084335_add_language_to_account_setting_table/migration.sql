/*
  Warnings:

  - You are about to drop the column `type` on the `account_setting` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[account_id]` on the table `account_setting` will be added. If there are existing duplicate values, this will fail.
  - Made the column `receive_notify` on table `account_setting` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('VI', 'EN');

-- AlterTable
ALTER TABLE "account_setting" DROP COLUMN "type",
ADD COLUMN     "language" "Language" NOT NULL DEFAULT E'VI',
ALTER COLUMN "receive_notify" SET NOT NULL,
ALTER COLUMN "receive_notify" SET DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "account_setting_account_id_unique" ON "account_setting"("account_id");
