/*
  Warnings:

  - A unique constraint covering the columns `[day,month,year,status,type]` on the table `cashback_summary` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "cashback_summary.day_month_year_status_unique";

-- AlterTable
ALTER TABLE "cashback_summary" ADD COLUMN     "type" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "cashback_summary.day_month_year_status_type_unique" ON "cashback_summary"("day", "month", "year", "status", "type");
