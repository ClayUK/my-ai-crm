-- Donation-only subject + template inputs
ALTER TABLE "Job" ADD COLUMN "campaign_type" TEXT;

ALTER TABLE "Job" ADD COLUMN "subject_name" TEXT;
ALTER TABLE "Job" ADD COLUMN "subject_type" TEXT;
ALTER TABLE "Job" ADD COLUMN "species_breed_age" TEXT;
ALTER TABLE "Job" ADD COLUMN "physical_description" TEXT;
ALTER TABLE "Job" ADD COLUMN "injury_or_medical_details" TEXT;
ALTER TABLE "Job" ADD COLUMN "backstory_summary" TEXT;
ALTER TABLE "Job" ADD COLUMN "urgency_level" TEXT;
ALTER TABLE "Job" ADD COLUMN "fundraiser_goal_amount" TEXT;
ALTER TABLE "Job" ADD COLUMN "emotional_hook" TEXT;
ALTER TABLE "Job" ADD COLUMN "companion_or_family_detail" TEXT;
ALTER TABLE "Job" ADD COLUMN "before_detail" TEXT;

ALTER TABLE "Job" ADD COLUMN "selected_templates" TEXT;

