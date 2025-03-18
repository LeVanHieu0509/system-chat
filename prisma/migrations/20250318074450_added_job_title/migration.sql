/*
  Warnings:

  - Added the required column `jobTitle` to the `UserTest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserTest" ADD COLUMN     "jobTitle" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "bonus_event" ALTER COLUMN "broker_id" SET DEFAULT '00000000-0000-0000-0000-000000000000',
ALTER COLUMN "created_id" SET DEFAULT '00000000-0000-0000-0000-000000000000';
