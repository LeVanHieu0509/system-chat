-- AlterTable
ALTER TABLE "partner_transaction" ADD COLUMN     "currency_id" UUID;

-- AddForeignKey
ALTER TABLE "partner_transaction" ADD FOREIGN KEY ("currency_id") REFERENCES "currency_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE "partner_transaction" SET "currency_id" = (SELECT "id" FROM "currency_master" WHERE "code" = 'SAT')
