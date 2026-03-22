-- Donation-only sequential evaluations + per-image descriptions

ALTER TABLE "Job"
ADD COLUMN "donationBackstoryEvaluation" TEXT;

ALTER TABLE "Job"
ADD COLUMN "donationReferenceEvaluation" TEXT;

ALTER TABLE "ReferenceAsset"
ADD COLUMN "description" TEXT;

