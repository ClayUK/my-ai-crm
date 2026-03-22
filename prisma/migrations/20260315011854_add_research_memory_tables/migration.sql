-- CreateTable
CREATE TABLE "SwipeCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SwipeEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "ConceptFramework" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "AudienceInsight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "VisualPattern" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "CopyFormula" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "OfferAngle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "ResearchNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "noteType" TEXT,
    "body" TEXT NOT NULL,
    "source" TEXT,
    "tags" TEXT,
    "priority" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SwipeCategory_name_key" ON "SwipeCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ConceptFramework_name_key" ON "ConceptFramework"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VisualPattern_name_key" ON "VisualPattern"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CopyFormula_name_key" ON "CopyFormula"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OfferAngle_name_key" ON "OfferAngle"("name");
