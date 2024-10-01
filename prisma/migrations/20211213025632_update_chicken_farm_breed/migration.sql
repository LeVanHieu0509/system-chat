/*
  Warnings:

  - You are about to drop the `vndc_log` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "chicken_farm_breed" ADD COLUMN     "is_completed" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "vndc_log";
