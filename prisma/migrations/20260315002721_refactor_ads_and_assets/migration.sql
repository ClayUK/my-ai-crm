/*
  Warnings:

  - You are about to drop the column `jobId` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `editedPrompt` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `referenceImageUrls` on the `Job` table. All the data in the column will be lost.
  - Added the required column `adId` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Ad" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "adNumber" INTEGER NOT NULL,
    "title" TEXT,
    "sourceBlock" TEXT,
    "editedPrompt" TEXT,
    "kieResult" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ad_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReferenceAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "adId" TEXT,
    "filePath" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReferenceAsset_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReferenceAsset_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "prompt" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Image_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Image" ("createdAt", "id", "prompt", "url") SELECT "createdAt", "id", "prompt", "url" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rawText" TEXT,
    "claudeOutput" TEXT,
    "kieResult" TEXT,
    "platform" TEXT,
    "funnelStage" TEXT,
    "formatRatio" TEXT,
    "primaryAngles" TEXT,
    "testimonialUsage" TEXT,
    "ctaStyle" TEXT,
    "visualStyle" TEXT,
    "numberOfAds" TEXT,
    "referenceImageTypes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Job" ("claudeOutput", "createdAt", "ctaStyle", "formatRatio", "funnelStage", "id", "kieResult", "numberOfAds", "platform", "primaryAngles", "rawText", "referenceImageTypes", "status", "testimonialUsage", "updatedAt", "url", "visualStyle") SELECT "claudeOutput", "createdAt", "ctaStyle", "formatRatio", "funnelStage", "id", "kieResult", "numberOfAds", "platform", "primaryAngles", "rawText", "referenceImageTypes", "status", "testimonialUsage", "updatedAt", "url", "visualStyle" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Ad_jobId_adNumber_key" ON "Ad"("jobId", "adNumber");
