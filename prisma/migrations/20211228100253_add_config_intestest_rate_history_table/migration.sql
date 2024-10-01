-- CreateTable
CREATE TABLE "config_interest_rate_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "changed_config" JSONB NOT NULL,
    "config_interest_rate_id" UUID NOT NULL,
    "updated_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "config_interest_rate_history" ADD FOREIGN KEY ("config_interest_rate_id") REFERENCES "config_interest_rate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_interest_rate_history" ADD FOREIGN KEY ("updated_by_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "config_interest_rate"
    ("title", "description", "updated_at", "from_wallet_id", "wallet_receive_id")
VALUES
    (
        '',
        '',
        NOW(),
        (SELECT id FROM currency_master WHERE code = 'SAT'),
        (SELECT id FROM currency_master WHERE code = 'VNDC')
    )
