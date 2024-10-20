/*
  Warnings:

  - A unique constraint covering the columns `[account_id,currency_id,version]` on the table `cashback_available` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "account_contact" DROP CONSTRAINT "account_contact_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "account_daily_lucky_wheel" DROP CONSTRAINT "account_daily_lucky_wheel_account_id_fkey";

-- DropForeignKey
ALTER TABLE "account_daily_lucky_wheel_history" DROP CONSTRAINT "account_daily_lucky_wheel_history_daily_reward_id_fkey";

-- DropForeignKey
ALTER TABLE "account_exchange_currency" DROP CONSTRAINT "account_exchange_currency_account_id_fkey";

-- DropForeignKey
ALTER TABLE "account_exchange_currency" DROP CONSTRAINT "account_exchange_currency_currency_id_fkey";

-- DropForeignKey
ALTER TABLE "account_history" DROP CONSTRAINT "account_history_account_id_fkey";

-- DropForeignKey
ALTER TABLE "account_history" DROP CONSTRAINT "account_history_created_by_fkey";

-- DropForeignKey
ALTER TABLE "account_kyc_ipn" DROP CONSTRAINT "account_kyc_ipn_account_id_fkey";

-- DropForeignKey
ALTER TABLE "account_partner_commission" DROP CONSTRAINT "account_partner_commission_account_id_fkey";

-- DropForeignKey
ALTER TABLE "account_partner_commission" DROP CONSTRAINT "account_partner_commission_transaction_id_fkey";

-- DropForeignKey
ALTER TABLE "account_referral" DROP CONSTRAINT "account_referral_referral_by_fkey";

-- DropForeignKey
ALTER TABLE "account_referral" DROP CONSTRAINT "account_referral_referral_from_fkey";

-- DropForeignKey
ALTER TABLE "account_referral_stats" DROP CONSTRAINT "account_referral_stats_account_id_fkey";

-- DropForeignKey
ALTER TABLE "account_setting" DROP CONSTRAINT "account_setting_account_id_fkey";

-- DropForeignKey
ALTER TABLE "bonus_event" DROP CONSTRAINT "bonus_event_broker_id_fkey";

-- DropForeignKey
ALTER TABLE "bonus_event" DROP CONSTRAINT "bonus_event_created_id_fkey";

-- DropForeignKey
ALTER TABLE "bonus_event" DROP CONSTRAINT "bonus_event_currency_id_fkey";

-- DropForeignKey
ALTER TABLE "bonus_event_account" DROP CONSTRAINT "bonus_event_account_account_id_fkey";

-- DropForeignKey
ALTER TABLE "bonus_event_account" DROP CONSTRAINT "bonus_event_account_bonus_event_id_fkey";

-- DropForeignKey
ALTER TABLE "campaign_category" DROP CONSTRAINT "campaign_category_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "cashback_available" DROP CONSTRAINT "cashback_available_account_id_fkey";

-- DropForeignKey
ALTER TABLE "cashback_available" DROP CONSTRAINT "cashback_available_currency_id_fkey";

-- DropForeignKey
ALTER TABLE "cashback_available_histories" DROP CONSTRAINT "cashback_available_histories_ca_id_fkey";

-- DropForeignKey
ALTER TABLE "cashback_transaction" DROP CONSTRAINT "cashback_transaction_currency_id_fkey";

-- DropForeignKey
ALTER TABLE "cashback_transaction_broker" DROP CONSTRAINT "cashback_transaction_broker_currency_id_fkey";

-- DropForeignKey
ALTER TABLE "chicken_farm_adult" DROP CONSTRAINT "chicken_farm_adult_egg_id_fkey";

-- DropForeignKey
ALTER TABLE "chicken_farm_adult" DROP CONSTRAINT "chicken_farm_adult_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "chicken_farm_breed" DROP CONSTRAINT "chicken_farm_breed_hen_id_fkey";

-- DropForeignKey
ALTER TABLE "chicken_farm_breed" DROP CONSTRAINT "chicken_farm_breed_rooster_id_fkey";

-- DropForeignKey
ALTER TABLE "chicken_farm_egg" DROP CONSTRAINT "chicken_farm_egg_egg_event_id_fkey";

-- DropForeignKey
ALTER TABLE "chicken_farm_egg" DROP CONSTRAINT "chicken_farm_egg_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "chicken_farm_egg_harvest" DROP CONSTRAINT "chicken_farm_egg_harvest_chicken_id_fkey";

-- DropForeignKey
ALTER TABLE "chicken_farm_egg_harvest" DROP CONSTRAINT "chicken_farm_egg_harvest_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "chicken_farm_extra_slot" DROP CONSTRAINT "chicken_farm_extra_slot_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "chicken_farm_market" DROP CONSTRAINT "chicken_farm_market_currency_id_fkey";

-- DropForeignKey
ALTER TABLE "chicken_farm_market" DROP CONSTRAINT "chicken_farm_market_seller_id_fkey";

-- DropForeignKey
ALTER TABLE "chicken_farm_rooster" DROP CONSTRAINT "chicken_farm_rooster_egg_id_fkey";

-- DropForeignKey
ALTER TABLE "chicken_farm_transaction" DROP CONSTRAINT "chicken_farm_transaction_seller_id_fkey";

-- DropForeignKey
ALTER TABLE "config" DROP CONSTRAINT "config_user_id_fkey";

-- DropForeignKey
ALTER TABLE "config_interest_rate" DROP CONSTRAINT "config_interest_rate_from_wallet_id_fkey";

-- DropForeignKey
ALTER TABLE "config_interest_rate" DROP CONSTRAINT "config_interest_rate_wallet_receive_id_fkey";

-- DropForeignKey
ALTER TABLE "config_interest_rate_history" DROP CONSTRAINT "config_interest_rate_history_config_interest_rate_id_fkey";

-- DropForeignKey
ALTER TABLE "config_interest_rate_history" DROP CONSTRAINT "config_interest_rate_history_updated_by_id_fkey";

-- DropForeignKey
ALTER TABLE "currency_limit_setting" DROP CONSTRAINT "currency_limit_setting_currency_id_fkey";

-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_created_id_fkey";

-- DropForeignKey
ALTER TABLE "golden_egg_exchange_setting" DROP CONSTRAINT "golden_egg_exchange_setting_currency_id_fkey";

-- DropForeignKey
ALTER TABLE "interest_payment" DROP CONSTRAINT "interest_payment_from_wallet_id_fkey";

-- DropForeignKey
ALTER TABLE "interest_payment" DROP CONSTRAINT "interest_payment_to_wallet_id_fkey";

-- DropForeignKey
ALTER TABLE "interest_payment_account" DROP CONSTRAINT "interest_payment_account_account_id_fkey";

-- DropForeignKey
ALTER TABLE "interest_payment_account" DROP CONSTRAINT "interest_payment_account_interest_payment_id_fkey";

-- DropForeignKey
ALTER TABLE "kai_transaction" DROP CONSTRAINT "kai_transaction_cashback_transaction_id_fkey";

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_account_id_fkey";

-- DropForeignKey
ALTER TABLE "partner_transaction" DROP CONSTRAINT "partner_transaction_account_id_fkey";

-- DropForeignKey
ALTER TABLE "pool_bbc_history" DROP CONSTRAINT "pool_bbc_history_pool_id_fkey";

-- DropForeignKey
ALTER TABLE "pool_egg_history" DROP CONSTRAINT "pool_egg_history_pool_id_fkey";

-- DropForeignKey
ALTER TABLE "pool_rate_history" DROP CONSTRAINT "pool_rate_history_pool_id_fkey";

-- DropForeignKey
ALTER TABLE "referral_ranking" DROP CONSTRAINT "referral_ranking_currency_id_fkey";

-- DropForeignKey
ALTER TABLE "referral_ranking_account" DROP CONSTRAINT "referral_ranking_account_account_id_fkey";

-- DropForeignKey
ALTER TABLE "referral_ranking_account" DROP CONSTRAINT "referral_ranking_account_referral_ranking_id_fkey";

-- DropForeignKey
ALTER TABLE "vndc_transaction" DROP CONSTRAINT "vndc_transaction_cashback_transaction_id_fkey";

-- DropIndex
DROP INDEX "cashback_available.currency_id_account_id_unique";

-- AlterTable
ALTER TABLE "bonus_event" ALTER COLUMN "broker_id" SET DEFAULT '00000000-0000-0000-0000-000000000000',
ALTER COLUMN "created_id" SET DEFAULT '00000000-0000-0000-0000-000000000000';

-- CreateIndex
CREATE UNIQUE INDEX "cashback_available_account_id_currency_id_version_key" ON "cashback_available"("account_id", "currency_id", "version");

-- AddForeignKey
ALTER TABLE "account_kyc_ipn" ADD CONSTRAINT "account_kyc_ipn_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cashback_available" ADD CONSTRAINT "cashback_available_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cashback_available" ADD CONSTRAINT "cashback_available_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cashback_available_histories" ADD CONSTRAINT "cashback_available_histories_ca_id_fkey" FOREIGN KEY ("ca_id") REFERENCES "cashback_available"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cashback_transaction" ADD CONSTRAINT "cashback_transaction_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vndc_transaction" ADD CONSTRAINT "vndc_transaction_cashback_transaction_id_fkey" FOREIGN KEY ("cashback_transaction_id") REFERENCES "cashback_transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kai_transaction" ADD CONSTRAINT "kai_transaction_cashback_transaction_id_fkey" FOREIGN KEY ("cashback_transaction_id") REFERENCES "cashback_transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cashback_transaction_broker" ADD CONSTRAINT "cashback_transaction_broker_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_category" ADD CONSTRAINT "campaign_category_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_referral" ADD CONSTRAINT "account_referral_referral_from_fkey" FOREIGN KEY ("referral_from") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_referral" ADD CONSTRAINT "account_referral_referral_by_fkey" FOREIGN KEY ("referral_by") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_referral_stats" ADD CONSTRAINT "account_referral_stats_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_contact" ADD CONSTRAINT "account_contact_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_history" ADD CONSTRAINT "account_history_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_history" ADD CONSTRAINT "account_history_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_setting" ADD CONSTRAINT "account_setting_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_exchange_currency" ADD CONSTRAINT "account_exchange_currency_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_exchange_currency" ADD CONSTRAINT "account_exchange_currency_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config" ADD CONSTRAINT "config_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_daily_lucky_wheel" ADD CONSTRAINT "account_daily_lucky_wheel_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_daily_lucky_wheel_history" ADD CONSTRAINT "account_daily_lucky_wheel_history_daily_reward_id_fkey" FOREIGN KEY ("daily_reward_id") REFERENCES "account_daily_lucky_wheel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_partner_commission" ADD CONSTRAINT "account_partner_commission_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_partner_commission" ADD CONSTRAINT "account_partner_commission_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "cashback_transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_transaction" ADD CONSTRAINT "partner_transaction_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_extra_slot" ADD CONSTRAINT "chicken_farm_extra_slot_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_egg" ADD CONSTRAINT "chicken_farm_egg_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_egg" ADD CONSTRAINT "chicken_farm_egg_egg_event_id_fkey" FOREIGN KEY ("egg_event_id") REFERENCES "chicken_farm_egg_event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_adult" ADD CONSTRAINT "chicken_farm_adult_egg_id_fkey" FOREIGN KEY ("egg_id") REFERENCES "chicken_farm_egg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_adult" ADD CONSTRAINT "chicken_farm_adult_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_rooster" ADD CONSTRAINT "chicken_farm_rooster_egg_id_fkey" FOREIGN KEY ("egg_id") REFERENCES "chicken_farm_egg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_market" ADD CONSTRAINT "chicken_farm_market_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_market" ADD CONSTRAINT "chicken_farm_market_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_egg_harvest" ADD CONSTRAINT "chicken_farm_egg_harvest_chicken_id_fkey" FOREIGN KEY ("chicken_id") REFERENCES "chicken_farm_adult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_egg_harvest" ADD CONSTRAINT "chicken_farm_egg_harvest_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_transaction" ADD CONSTRAINT "chicken_farm_transaction_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_breed" ADD CONSTRAINT "chicken_farm_breed_hen_id_fkey" FOREIGN KEY ("hen_id") REFERENCES "chicken_farm_adult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chicken_farm_breed" ADD CONSTRAINT "chicken_farm_breed_rooster_id_fkey" FOREIGN KEY ("rooster_id") REFERENCES "chicken_farm_rooster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_created_id_fkey" FOREIGN KEY ("created_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_interest_rate" ADD CONSTRAINT "config_interest_rate_from_wallet_id_fkey" FOREIGN KEY ("from_wallet_id") REFERENCES "currency_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_interest_rate" ADD CONSTRAINT "config_interest_rate_wallet_receive_id_fkey" FOREIGN KEY ("wallet_receive_id") REFERENCES "currency_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_interest_rate_history" ADD CONSTRAINT "config_interest_rate_history_config_interest_rate_id_fkey" FOREIGN KEY ("config_interest_rate_id") REFERENCES "config_interest_rate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_interest_rate_history" ADD CONSTRAINT "config_interest_rate_history_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_payment" ADD CONSTRAINT "interest_payment_from_wallet_id_fkey" FOREIGN KEY ("from_wallet_id") REFERENCES "currency_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_payment" ADD CONSTRAINT "interest_payment_to_wallet_id_fkey" FOREIGN KEY ("to_wallet_id") REFERENCES "currency_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_payment_account" ADD CONSTRAINT "interest_payment_account_interest_payment_id_fkey" FOREIGN KEY ("interest_payment_id") REFERENCES "interest_payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_payment_account" ADD CONSTRAINT "interest_payment_account_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_ranking" ADD CONSTRAINT "referral_ranking_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_ranking_account" ADD CONSTRAINT "referral_ranking_account_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_ranking_account" ADD CONSTRAINT "referral_ranking_account_referral_ranking_id_fkey" FOREIGN KEY ("referral_ranking_id") REFERENCES "referral_ranking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "golden_egg_exchange_setting" ADD CONSTRAINT "golden_egg_exchange_setting_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "currency_limit_setting" ADD CONSTRAINT "currency_limit_setting_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonus_event" ADD CONSTRAINT "bonus_event_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonus_event" ADD CONSTRAINT "bonus_event_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonus_event" ADD CONSTRAINT "bonus_event_created_id_fkey" FOREIGN KEY ("created_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonus_event_account" ADD CONSTRAINT "bonus_event_account_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonus_event_account" ADD CONSTRAINT "bonus_event_account_bonus_event_id_fkey" FOREIGN KEY ("bonus_event_id") REFERENCES "bonus_event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pool_egg_history" ADD CONSTRAINT "pool_egg_history_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "pool_value"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pool_bbc_history" ADD CONSTRAINT "pool_bbc_history_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "pool_value"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pool_rate_history" ADD CONSTRAINT "pool_rate_history_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "pool_value"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "account.email_unique" RENAME TO "account_email_key";

-- RenameIndex
ALTER INDEX "account.phone_unique" RENAME TO "account_phone_key";

-- RenameIndex
ALTER INDEX "account.referral_code_unique" RENAME TO "account_referral_code_key";

-- RenameIndex
ALTER INDEX "account_daily_lucky_wheel.account_id_index" RENAME TO "account_daily_lucky_wheel_account_id_idx";

-- RenameIndex
ALTER INDEX "account_daily_lucky_wheel.transaction_id_unique" RENAME TO "account_daily_lucky_wheel_transaction_id_key";

-- RenameIndex
ALTER INDEX "account_partner_commission.account_id_index" RENAME TO "account_partner_commission_account_id_idx";

-- RenameIndex
ALTER INDEX "account_partner_commission.transaction_id_unique" RENAME TO "account_partner_commission_transaction_id_key";

-- RenameIndex
ALTER INDEX "account_referral.referral_from_unique" RENAME TO "account_referral_referral_from_key";

-- RenameIndex
ALTER INDEX "account_referral_stats.account_id_unique" RENAME TO "account_referral_stats_account_id_key";

-- RenameIndex
ALTER INDEX "account_reward_event.account_id_index" RENAME TO "account_reward_event_account_id_idx";

-- RenameIndex
ALTER INDEX "account_reward_event.event_id_index" RENAME TO "account_reward_event_event_id_idx";

-- RenameIndex
ALTER INDEX "account_setting.account_id_unique" RENAME TO "account_setting_account_id_key";

-- RenameIndex
ALTER INDEX "account_summary.day_month_year_unique" RENAME TO "account_summary_day_month_year_key";

-- RenameIndex
ALTER INDEX "bonus_event_account.cashback_transaction_id_unique" RENAME TO "bonus_event_account_cashback_transaction_id_key";

-- RenameIndex
ALTER INDEX "cashback_available_histories.ca_id_index" RENAME TO "cashback_available_histories_ca_id_idx";

-- RenameIndex
ALTER INDEX "cashback_summary.day_month_year_status_type_unique" RENAME TO "cashback_summary_day_month_year_status_type_key";

-- RenameIndex
ALTER INDEX "cashback_transaction.currency_id_index" RENAME TO "cashback_transaction_currency_id_idx";

-- RenameIndex
ALTER INDEX "cashback_transaction.receiver_id_index" RENAME TO "cashback_transaction_receiver_id_idx";

-- RenameIndex
ALTER INDEX "cashback_transaction.sender_id_index" RENAME TO "cashback_transaction_sender_id_idx";

-- RenameIndex
ALTER INDEX "cashback_transaction_broker.currency_id_index" RENAME TO "cashback_transaction_broker_currency_id_idx";

-- RenameIndex
ALTER INDEX "cashback_transaction_broker.receiver_id_index" RENAME TO "cashback_transaction_broker_receiver_id_idx";

-- RenameIndex
ALTER INDEX "cashback_transaction_broker.sender_id_index" RENAME TO "cashback_transaction_broker_sender_id_idx";

-- RenameIndex
ALTER INDEX "chicken_farm_adult.chicken_no_unique" RENAME TO "chicken_farm_adult_chicken_no_key";

-- RenameIndex
ALTER INDEX "chicken_farm_adult.egg_id_unique" RENAME TO "chicken_farm_adult_egg_id_key";

-- RenameIndex
ALTER INDEX "chicken_farm_adult.owner_id_index" RENAME TO "chicken_farm_adult_owner_id_idx";

-- RenameIndex
ALTER INDEX "chicken_farm_breed.hen_id_rooster_id_unique" RENAME TO "chicken_farm_breed_hen_id_rooster_id_key";

-- RenameIndex
ALTER INDEX "chicken_farm_breed.hen_id_unique" RENAME TO "chicken_farm_breed_hen_id_key";

-- RenameIndex
ALTER INDEX "chicken_farm_egg.breed_id_index" RENAME TO "chicken_farm_egg_breed_id_idx";

-- RenameIndex
ALTER INDEX "chicken_farm_egg.egg_event_id_index" RENAME TO "chicken_farm_egg_egg_event_id_idx";

-- RenameIndex
ALTER INDEX "chicken_farm_egg.owner_id_index" RENAME TO "chicken_farm_egg_owner_id_idx";

-- RenameIndex
ALTER INDEX "chicken_farm_market.buyer_id_index" RENAME TO "chicken_farm_market_buyer_id_idx";

-- RenameIndex
ALTER INDEX "chicken_farm_market.chicken_id_index" RENAME TO "chicken_farm_market_chicken_id_idx";

-- RenameIndex
ALTER INDEX "chicken_farm_market.egg_id_index" RENAME TO "chicken_farm_market_egg_id_idx";

-- RenameIndex
ALTER INDEX "chicken_farm_market.rooster_id_index" RENAME TO "chicken_farm_market_rooster_id_idx";

-- RenameIndex
ALTER INDEX "chicken_farm_market.seller_id_index" RENAME TO "chicken_farm_market_seller_id_idx";

-- RenameIndex
ALTER INDEX "chicken_farm_rooster.chicken_no_unique" RENAME TO "chicken_farm_rooster_chicken_no_key";

-- RenameIndex
ALTER INDEX "chicken_farm_rooster.egg_id_unique" RENAME TO "chicken_farm_rooster_egg_id_key";

-- RenameIndex
ALTER INDEX "chicken_farm_rooster.owner_id_index" RENAME TO "chicken_farm_rooster_owner_id_idx";

-- RenameIndex
ALTER INDEX "chicken_farm_transaction.buyer_id_index" RENAME TO "chicken_farm_transaction_buyer_id_idx";

-- RenameIndex
ALTER INDEX "chicken_farm_transaction.currency_id_index" RENAME TO "chicken_farm_transaction_currency_id_idx";

-- RenameIndex
ALTER INDEX "chicken_farm_transaction.market_id_index" RENAME TO "chicken_farm_transaction_market_id_idx";

-- RenameIndex
ALTER INDEX "chicken_farm_transaction.market_id_unique" RENAME TO "chicken_farm_transaction_market_id_key";

-- RenameIndex
ALTER INDEX "chicken_farm_transaction.seller_id_index" RENAME TO "chicken_farm_transaction_seller_id_idx";

-- RenameIndex
ALTER INDEX "currency_limit_setting.type_currency_id_unique" RENAME TO "currency_limit_setting_type_currency_id_key";

-- RenameIndex
ALTER INDEX "currency_master.code_unique" RENAME TO "currency_master_code_key";

-- RenameIndex
ALTER INDEX "golden_egg_exchange_setting.currency_id_unique" RENAME TO "golden_egg_exchange_setting_currency_id_key";

-- RenameIndex
ALTER INDEX "interest_payment.date_time_from_wallet_id_to_wallet_id_index" RENAME TO "interest_payment_date_time_from_wallet_id_to_wallet_id_idx";

-- RenameIndex
ALTER INDEX "interest_payment_account.cashback_transaction_id_unique" RENAME TO "interest_payment_account_cashback_transaction_id_key";

-- RenameIndex
ALTER INDEX "interest_payment_account.interest_payment_id_account_id_cashbac" RENAME TO "interest_payment_account_interest_payment_id_account_id_cas_idx";

-- RenameIndex
ALTER INDEX "kai_transaction.cashback_transaction_id_unique" RENAME TO "kai_transaction_cashback_transaction_id_key";

-- RenameIndex
ALTER INDEX "kai_transaction.tx_hash_unique" RENAME TO "kai_transaction_tx_hash_key";

-- RenameIndex
ALTER INDEX "partner_transaction.transaction_id_unique" RENAME TO "partner_transaction_transaction_id_key";

-- RenameIndex
ALTER INDEX "pool_bbc_history.created_at_index" RENAME TO "pool_bbc_history_created_at_idx";

-- RenameIndex
ALTER INDEX "pool_bbc_history.pool_id_index" RENAME TO "pool_bbc_history_pool_id_idx";

-- RenameIndex
ALTER INDEX "pool_egg_history.created_at_index" RENAME TO "pool_egg_history_created_at_idx";

-- RenameIndex
ALTER INDEX "pool_egg_history.pool_id_index" RENAME TO "pool_egg_history_pool_id_idx";

-- RenameIndex
ALTER INDEX "pool_rate_history.created_at_index" RENAME TO "pool_rate_history_created_at_idx";

-- RenameIndex
ALTER INDEX "pool_rate_history.pool_id_index" RENAME TO "pool_rate_history_pool_id_idx";

-- RenameIndex
ALTER INDEX "referral_ranking_account.cashback_transaction_id_unique" RENAME TO "referral_ranking_account_cashback_transaction_id_key";

-- RenameIndex
ALTER INDEX "user.email_unique" RENAME TO "user_email_key";

-- RenameIndex
ALTER INDEX "user.user_name_unique" RENAME TO "user_user_name_key";

-- RenameIndex
ALTER INDEX "vndc_transaction.cashback_transaction_id_unique" RENAME TO "vndc_transaction_cashback_transaction_id_key";

-- RenameIndex
ALTER INDEX "vndc_transaction.vndc_transaction_number_unique" RENAME TO "vndc_transaction_vndc_transaction_number_key";
