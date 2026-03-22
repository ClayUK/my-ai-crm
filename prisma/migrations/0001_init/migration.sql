-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
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
    "creativeMode" TEXT,
    "adMixStrategy" TEXT,
    "strictlyFollowSelectedAngles" BOOLEAN DEFAULT false,
    "includeExperimentalAds" BOOLEAN DEFAULT false,
    "campaign_type" TEXT,
    "subject_name" TEXT,
    "subject_type" TEXT,
    "species_breed_age" TEXT,
    "physical_description" TEXT,
    "injury_or_medical_details" TEXT,
    "backstory_summary" TEXT,
    "urgency_level" TEXT,
    "fundraiser_goal_amount" TEXT,
    "emotional_hook" TEXT,
    "companion_or_family_detail" TEXT,
    "before_detail" TEXT,
    "selected_templates" TEXT,
    "donationPageEvaluation" TEXT,
    "donationBackstoryEvaluation" TEXT,
    "donationReferenceEvaluation" TEXT,
    "fundraiserBatchHistory" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ad" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "adNumber" INTEGER NOT NULL,
    "title" TEXT,
    "sourceBlock" TEXT,
    "editedPrompt" TEXT,
    "kieResult" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "parentAdId" TEXT,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "prompt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferenceAsset" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "adId" TEXT,
    "filePath" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferenceAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwipeCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "marketType" TEXT NOT NULL DEFAULT 'product',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SwipeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwipeEntry" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SwipeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConceptFramework" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConceptFramework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudienceInsight" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AudienceInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisualPattern" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisualPattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CopyFormula" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CopyFormula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferAngle" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfferAngle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchNote" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "marketType" TEXT NOT NULL DEFAULT 'product',
    "noteType" TEXT,
    "body" TEXT NOT NULL,
    "source" TEXT,
    "tags" TEXT,
    "priority" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreativeBrain" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'fundraiser',
    "previousWinningPrompts" TEXT NOT NULL DEFAULT '',
    "anglesList" TEXT NOT NULL DEFAULT '',
    "additionalInfo" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreativeBrain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ad_jobId_adNumber_key" ON "Ad"("jobId", "adNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SwipeCategory_name_marketType_key" ON "SwipeCategory"("name", "marketType");

-- CreateIndex
CREATE UNIQUE INDEX "ConceptFramework_name_marketType_key" ON "ConceptFramework"("name", "marketType");

-- CreateIndex
CREATE UNIQUE INDEX "VisualPattern_name_marketType_key" ON "VisualPattern"("name", "marketType");

-- CreateIndex
CREATE UNIQUE INDEX "CopyFormula_name_marketType_key" ON "CopyFormula"("name", "marketType");

-- CreateIndex
CREATE UNIQUE INDEX "OfferAngle_name_marketType_key" ON "OfferAngle"("name", "marketType");

-- CreateIndex
CREATE UNIQUE INDEX "CreativeBrain_scope_key" ON "CreativeBrain"("scope");

-- AddForeignKey
ALTER TABLE "Ad" ADD CONSTRAINT "Ad_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenceAsset" ADD CONSTRAINT "ReferenceAsset_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenceAsset" ADD CONSTRAINT "ReferenceAsset_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwipeEntry" ADD CONSTRAINT "SwipeEntry_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SwipeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

