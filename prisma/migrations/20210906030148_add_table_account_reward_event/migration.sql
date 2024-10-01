-- CreateTable
CREATE TABLE "account_reward_event" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "status" SMALLINT NOT NULL DEFAULT 1,
    "time_start" BIGINT NOT NULL DEFAULT 0,
    "time_end" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "account_id" UUID,
    "event_id" UUID,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "account_reward_event" ADD FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_reward_event" ADD FOREIGN KEY ("event_id") REFERENCES "config_event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
