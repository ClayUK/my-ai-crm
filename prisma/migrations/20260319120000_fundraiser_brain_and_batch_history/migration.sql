-- AlterTable
ALTER TABLE "Job" ADD COLUMN "fundraiserBatchHistory" TEXT;

-- CreateTable
CREATE TABLE "CreativeBrain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scope" TEXT NOT NULL DEFAULT 'fundraiser',
    "previousWinningPrompts" TEXT NOT NULL DEFAULT '',
    "anglesList" TEXT NOT NULL DEFAULT '',
    "additionalInfo" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CreativeBrain_scope_key" ON "CreativeBrain"("scope");
