-- AlterTable
ALTER TABLE "account" ADD COLUMN     "facebook_id" VARCHAR(50),
ADD COLUMN     "google_id" VARCHAR(50),
ALTER COLUMN "phone" DROP NOT NULL;

