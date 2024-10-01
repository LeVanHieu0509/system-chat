-- CreateTable
CREATE TABLE "config_ads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(150),
    "url" VARCHAR(300) NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stop_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "created_id" UUID,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "config_ads" ADD FOREIGN KEY ("created_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
