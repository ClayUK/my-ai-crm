-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "campaignType" TEXT NOT NULL DEFAULT 'product',
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
