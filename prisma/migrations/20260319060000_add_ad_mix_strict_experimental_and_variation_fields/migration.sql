-- Add Ad mix + angle strictness + experimental toggle to Job
ALTER TABLE "Job"
ADD COLUMN "adMixStrategy" TEXT;

ALTER TABLE "Job"
ADD COLUMN "strictlyFollowSelectedAngles" BOOLEAN DEFAULT false;

ALTER TABLE "Job"
ADD COLUMN "includeExperimentalAds" BOOLEAN DEFAULT false;

-- Add lightweight variation/winner metadata to Ad
ALTER TABLE "Ad"
ADD COLUMN "parentAdId" TEXT;

ALTER TABLE "Ad"
ADD COLUMN "isWinner" BOOLEAN DEFAULT false;

