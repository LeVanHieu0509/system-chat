-- CreateTable
CREATE TABLE "bit_play_game" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "banner" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "source" VARCHAR(255) NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "history" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "created_id" UUID NOT NULL,
    "updated_id" UUID,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bit_play_challenge" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "banner" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "time_start" BIGINT NOT NULL DEFAULT 0,
    "time_end" BIGINT NOT NULL DEFAULT 0,
    "prize_pool" INT NOT NULL DEFAULT 0,
    "prize_ranking" JSONB,
    "information" TEXT,
    "free" BOOLEAN NOT NULL DEFAULT true,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "history" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "created_id" UUID NOT NULL,
    "updated_id" UUID,
    "game_id" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bit_play_game" ADD FOREIGN KEY ("created_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bit_play_game" ADD FOREIGN KEY ("updated_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bit_play_challenge" ADD FOREIGN KEY ("created_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bit_play_challenge" ADD FOREIGN KEY ("updated_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bit_play_challenge" ADD FOREIGN KEY ("game_id") REFERENCES "bit_play_game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
