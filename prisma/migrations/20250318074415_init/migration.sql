-- AlterTable
ALTER TABLE "bonus_event" ALTER COLUMN "broker_id" SET DEFAULT '00000000-0000-0000-0000-000000000000',
ALTER COLUMN "created_id" SET DEFAULT '00000000-0000-0000-0000-000000000000';

-- CreateTable
CREATE TABLE "UserTest" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "UserTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostTest" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "PostTest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PostTest" ADD CONSTRAINT "PostTest_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "UserTest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
