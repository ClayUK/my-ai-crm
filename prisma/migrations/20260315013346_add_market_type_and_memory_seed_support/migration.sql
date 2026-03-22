-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AudienceInsight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "marketType" TEXT NOT NULL DEFAULT 'product',
    "segmentType" TEXT,
    "demographics" TEXT,
    "psychographics" TEXT,
    "painPoints" TEXT,
    "desires" TEXT,
    "fears" TEXT,
    "objections" TEXT,
    "buyingTriggers" TEXT,
    "languagePatterns" TEXT,
    "stylePreferences" TEXT,
    "platformBehavior" TEXT,
    "notes" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AudienceInsight" ("buyingTriggers", "createdAt", "demographics", "desires", "fears", "id", "languagePatterns", "name", "notes", "objections", "painPoints", "platformBehavior", "psychographics", "segmentType", "stylePreferences", "tags", "updatedAt") SELECT "buyingTriggers", "createdAt", "demographics", "desires", "fears", "id", "languagePatterns", "name", "notes", "objections", "painPoints", "platformBehavior", "psychographics", "segmentType", "stylePreferences", "tags", "updatedAt" FROM "AudienceInsight";
DROP TABLE "AudienceInsight";
ALTER TABLE "new_AudienceInsight" RENAME TO "AudienceInsight";
CREATE TABLE "new_ConceptFramework" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "marketType" TEXT NOT NULL DEFAULT 'product',
    "status" TEXT NOT NULL DEFAULT 'active',
    "frameworkType" TEXT,
    "summary" TEXT,
    "structure" TEXT,
    "promptInstructions" TEXT,
    "bestUseCases" TEXT,
    "badUseCases" TEXT,
    "examples" TEXT,
    "tags" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ConceptFramework" ("badUseCases", "bestUseCases", "createdAt", "examples", "frameworkType", "id", "name", "notes", "promptInstructions", "status", "structure", "summary", "tags", "updatedAt") SELECT "badUseCases", "bestUseCases", "createdAt", "examples", "frameworkType", "id", "name", "notes", "promptInstructions", "status", "structure", "summary", "tags", "updatedAt" FROM "ConceptFramework";
DROP TABLE "ConceptFramework";
ALTER TABLE "new_ConceptFramework" RENAME TO "ConceptFramework";
CREATE UNIQUE INDEX "ConceptFramework_name_marketType_key" ON "ConceptFramework"("name", "marketType");
CREATE TABLE "new_CopyFormula" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "marketType" TEXT NOT NULL DEFAULT 'product',
    "status" TEXT NOT NULL DEFAULT 'active',
    "formulaType" TEXT,
    "structure" TEXT,
    "headlineFormula" TEXT,
    "bodyFormula" TEXT,
    "ctaFormula" TEXT,
    "bestUseCases" TEXT,
    "tone" TEXT,
    "examples" TEXT,
    "tags" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CopyFormula" ("bestUseCases", "bodyFormula", "createdAt", "ctaFormula", "examples", "formulaType", "headlineFormula", "id", "name", "notes", "status", "structure", "tags", "tone", "updatedAt") SELECT "bestUseCases", "bodyFormula", "createdAt", "ctaFormula", "examples", "formulaType", "headlineFormula", "id", "name", "notes", "status", "structure", "tags", "tone", "updatedAt" FROM "CopyFormula";
DROP TABLE "CopyFormula";
ALTER TABLE "new_CopyFormula" RENAME TO "CopyFormula";
CREATE UNIQUE INDEX "CopyFormula_name_marketType_key" ON "CopyFormula"("name", "marketType");
CREATE TABLE "new_OfferAngle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "marketType" TEXT NOT NULL DEFAULT 'product',
    "status" TEXT NOT NULL DEFAULT 'active',
    "angleType" TEXT,
    "summary" TEXT,
    "hookIdeas" TEXT,
    "urgencyMechanics" TEXT,
    "bestUseCases" TEXT,
    "examples" TEXT,
    "seasonality" TEXT,
    "tags" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_OfferAngle" ("angleType", "bestUseCases", "createdAt", "examples", "hookIdeas", "id", "name", "notes", "seasonality", "status", "summary", "tags", "updatedAt", "urgencyMechanics") SELECT "angleType", "bestUseCases", "createdAt", "examples", "hookIdeas", "id", "name", "notes", "seasonality", "status", "summary", "tags", "updatedAt", "urgencyMechanics" FROM "OfferAngle";
DROP TABLE "OfferAngle";
ALTER TABLE "new_OfferAngle" RENAME TO "OfferAngle";
CREATE UNIQUE INDEX "OfferAngle_name_marketType_key" ON "OfferAngle"("name", "marketType");
CREATE TABLE "new_ResearchNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "marketType" TEXT NOT NULL DEFAULT 'product',
    "noteType" TEXT,
    "body" TEXT NOT NULL,
    "source" TEXT,
    "tags" TEXT,
    "priority" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ResearchNote" ("body", "createdAt", "id", "noteType", "priority", "source", "status", "tags", "title", "updatedAt") SELECT "body", "createdAt", "id", "noteType", "priority", "source", "status", "tags", "title", "updatedAt" FROM "ResearchNote";
DROP TABLE "ResearchNote";
ALTER TABLE "new_ResearchNote" RENAME TO "ResearchNote";
CREATE TABLE "new_SwipeCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "marketType" TEXT NOT NULL DEFAULT 'product',
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SwipeCategory" ("createdAt", "description", "id", "name", "updatedAt") SELECT "createdAt", "description", "id", "name", "updatedAt" FROM "SwipeCategory";
DROP TABLE "SwipeCategory";
ALTER TABLE "new_SwipeCategory" RENAME TO "SwipeCategory";
CREATE UNIQUE INDEX "SwipeCategory_name_marketType_key" ON "SwipeCategory"("name", "marketType");
CREATE TABLE "new_SwipeEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "marketType" TEXT NOT NULL DEFAULT 'product',
    "categoryId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "hook" TEXT,
    "angle" TEXT,
    "concept" TEXT,
    "copy" TEXT,
    "cta" TEXT,
    "visualDirection" TEXT,
    "audience" TEXT,
    "platform" TEXT,
    "funnelStage" TEXT,
    "offerType" TEXT,
    "emotionalTrigger" TEXT,
    "objectionHandled" TEXT,
    "whyItWorks" TEXT,
    "source" TEXT,
    "tags" TEXT,
    "notes" TEXT,
    "performanceScore" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SwipeEntry_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SwipeCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SwipeEntry" ("angle", "audience", "categoryId", "concept", "copy", "createdAt", "cta", "emotionalTrigger", "funnelStage", "hook", "id", "notes", "objectionHandled", "offerType", "performanceScore", "platform", "source", "status", "tags", "title", "updatedAt", "usageCount", "visualDirection", "whyItWorks") SELECT "angle", "audience", "categoryId", "concept", "copy", "createdAt", "cta", "emotionalTrigger", "funnelStage", "hook", "id", "notes", "objectionHandled", "offerType", "performanceScore", "platform", "source", "status", "tags", "title", "updatedAt", "usageCount", "visualDirection", "whyItWorks" FROM "SwipeEntry";
DROP TABLE "SwipeEntry";
ALTER TABLE "new_SwipeEntry" RENAME TO "SwipeEntry";
CREATE TABLE "new_VisualPattern" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "marketType" TEXT NOT NULL DEFAULT 'product',
    "status" TEXT NOT NULL DEFAULT 'active',
    "patternType" TEXT,
    "summary" TEXT,
    "composition" TEXT,
    "lighting" TEXT,
    "colorPalette" TEXT,
    "typographyStyle" TEXT,
    "mood" TEXT,
    "backgroundStyle" TEXT,
    "productPlacement" TEXT,
    "useCase" TEXT,
    "examples" TEXT,
    "tags" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_VisualPattern" ("backgroundStyle", "colorPalette", "composition", "createdAt", "examples", "id", "lighting", "mood", "name", "notes", "patternType", "productPlacement", "status", "summary", "tags", "typographyStyle", "updatedAt", "useCase") SELECT "backgroundStyle", "colorPalette", "composition", "createdAt", "examples", "id", "lighting", "mood", "name", "notes", "patternType", "productPlacement", "status", "summary", "tags", "typographyStyle", "updatedAt", "useCase" FROM "VisualPattern";
DROP TABLE "VisualPattern";
ALTER TABLE "new_VisualPattern" RENAME TO "VisualPattern";
CREATE UNIQUE INDEX "VisualPattern_name_marketType_key" ON "VisualPattern"("name", "marketType");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
