-- AlterTable
ALTER TABLE "currency_master" ADD COLUMN     "exchangeable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fixed_decimal" VARCHAR(10),
ADD COLUMN     "visible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "withdrawable" BOOLEAN NOT NULL DEFAULT false;
