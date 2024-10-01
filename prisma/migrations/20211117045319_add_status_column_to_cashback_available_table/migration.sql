/*
  Warnings:

  - You are about to drop the column `type` on the `cashback_available` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cashback_available" DROP COLUMN "type",
ADD COLUMN     "status" SMALLINT NOT NULL DEFAULT 1;
