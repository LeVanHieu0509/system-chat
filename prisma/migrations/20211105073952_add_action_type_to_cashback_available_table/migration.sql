-- AlterTable
ALTER TABLE "cashback_transaction" ADD COLUMN "action_type" INTEGER NOT NULL DEFAULT 1;

update
    cashback_transaction
set
    action_type = (
        case
            when "type" = 1 then + 1
            when "type" = 2 then + 1
            when "type" = 3 then - 1
            when "type" = 4 then - 1
            when "type" = 5 then - 1
            when "type" = 6 then + 1
            when "type" = 7 then + 1
            when "type" = 8 then + 1
            when "type" = 9 then + 1
            when "type" = 10 then + 1
            when "type" = 11 then + 1
            when "type" = 12 then + 1
            when "type" = 13 then - 1
            when "type" = 14 then + 1
            when "type" = 15 then + 1
            when "type" = 16 then + 1
            when "type" = 17 then - 1
            when "type" = 18 then - 1
            when "type" = 19 then + 1
            when "type" = 20 then - 1
        end
    )