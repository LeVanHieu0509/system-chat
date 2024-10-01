-- CreateTable
CREATE TABLE "chicken_farm_event" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT,
    "banner" TEXT NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 0,
    "link" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    PRIMARY KEY ("id")
);
