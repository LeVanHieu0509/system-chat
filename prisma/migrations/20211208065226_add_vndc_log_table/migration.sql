-- CreateTable
CREATE TABLE "vndc_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_receive" TEXT,
    "amount" TEXT NOT NULL,
    "coin" TEXT,
    "response" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vndc_log.account_receive_index" ON "vndc_log"("account_receive");
