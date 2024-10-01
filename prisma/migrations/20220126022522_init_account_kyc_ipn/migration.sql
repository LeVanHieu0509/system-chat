-- CreateTable
CREATE TABLE "account_kyc_ipn" (
    "account_id" UUID NOT NULL,
    "type" TEXT,
    "state" TEXT,
    "connected_state" TEXT,
    "full_name" TEXT,
    "phone" TEXT,
    "gender" TEXT,
    "histories" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    PRIMARY KEY ("account_id")
);

-- AddForeignKey
ALTER TABLE "account_kyc_ipn" ADD FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
