-- AlterTable
ALTER TABLE "chicken_farm_adult" ALTER COLUMN "owner_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "chicken_farm_transaction" ALTER COLUMN "amount" SET DEFAULT 0,
ALTER COLUMN "seller_id" DROP NOT NULL;
