-- CreateIndex
CREATE INDEX IF NOT EXISTS "account_daily_lucky_wheel.account_id_index" ON "account_daily_lucky_wheel"("account_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "account_partner_commission.account_id_index" ON "account_partner_commission"("account_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "account_reward_event.account_id_index" ON "account_reward_event"("account_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "account_reward_event.event_id_index" ON "account_reward_event"("event_id");
