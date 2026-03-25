import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { scrapeUrlToHtml } from "@/src/lib/scrape";
import {
    evaluateDonationPageFromScrape,
    evaluateDonationBackstory,
    evaluateDonationReferences,
} from "@/src/lib/anthropic";
import {
    persistDonationPageEvalAndAutoStoryEval,
    mergeDonationWizardSnapshotIntoClaudeOutput,
    resolveDonationEvaluations,
    composeBackstoryFromPageEval,
    getDonationWizardSnapshot,
} from "@/src/lib/donationWizard";

function stripHtml(html: string) {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function filterJobDataByRuntimeFields(data: Record<string, unknown>) {
    try {
        const fields = (prisma as any)?._runtimeDataModel?.models?.Job?.fields;
        if (!Array.isArray(fields)) return data;
        const allowed = new Set(
            fields.map((f: any) => (f && typeof f.name === "string" ? f.name : "")).filter(Boolean)
        );
        return Object.fromEntries(Object.entries(data).filter(([k]) => allowed.has(k)));
    } catch {
        return data;
    }
}

function authOk(req: NextRequest): boolean {
    const secret = process.env.CRM_AGENT_SECRET;
    if (!secret) return true; // No secret set = open (Railway internal only)
    const header = req.headers.get("x-crm-secret");
    return header === secret;
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!authOk(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: jobId } = await params;
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.campaignType !== "donation") {
        return NextResponse.json({ error: "Not a donation job" }, { status: 400 });
    }

    const results: Record<string, unknown> = {};

    // --- Step 1: Page evaluation ---
    const { pageEvaluation: existingPageEval } = resolveDonationEvaluations(job);
    if (Object.keys(existingPageEval).length === 0) {
        try {
            const scraped = await scrapeUrlToHtml(job.url);
            const rawText = stripHtml(scraped.html || "").slice(0, 16000);
            const pageEval = await evaluateDonationPageFromScrape({
                fundraiserUrl: job.url,
                scrapedText: rawText,
            });
            await persistDonationPageEvalAndAutoStoryEval({
                jobId,
                pageEval: pageEval as Record<string, unknown>,
                rawText,
                filterJobData: filterJobDataByRuntimeFields,
                jobRow: {
                    campaign_type: job.campaign_type,
                    subject_name: job.subject_name,
                    urgency_level: job.urgency_level,
                    emotional_hook: job.emotional_hook,
                },
            });
            results.pageEval = "done";
        } catch (err) {
            results.pageEval = `error: ${err instanceof Error ? err.message : String(err)}`;
        }
    } else {
        results.pageEval = "already_done";
    }

    // Reload job after potential page eval update
    const jobAfterPage = await prisma.job.findUnique({ where: { id: jobId } });
    if (!jobAfterPage) return NextResponse.json({ error: "Job not found after page eval" }, { status: 404 });

    // --- Step 2: Backstory evaluation ---
    const { backstoryEvaluation: existingStoryEval } = resolveDonationEvaluations(jobAfterPage);
    if (Object.keys(existingStoryEval).length === 0) {
        const dwSnap = getDonationWizardSnapshot(jobAfterPage.claudeOutput);
        const { pageEvaluation: freshPageEval } = resolveDonationEvaluations(jobAfterPage);
        const backstory = (
            String(jobAfterPage.backstory_summary || "").trim() ||
            String(dwSnap?.backstorySummary || "").trim() ||
            composeBackstoryFromPageEval(freshPageEval, (jobAfterPage.rawText || "").trim()).trim()
        );

        if (backstory) {
            try {
                const storyEval = await evaluateDonationBackstory({
                    campaignType: jobAfterPage.campaign_type || "FAMILY CRISIS",
                    subjectName: jobAfterPage.subject_name || "Fundraiser",
                    urgencyLevel: jobAfterPage.urgency_level || "general",
                    emotionalHook: jobAfterPage.emotional_hook || undefined,
                    backstorySummary: backstory,
                });
                const prevOut = await prisma.job.findUnique({
                    where: { id: jobId },
                    select: { claudeOutput: true },
                });
                const mergedClaude = mergeDonationWizardSnapshotIntoClaudeOutput(
                    prevOut?.claudeOutput,
                    { storyEvaluation: storyEval as Record<string, unknown>, backstorySummary: backstory }
                );
                await prisma.job.update({
                    where: { id: jobId },
                    data: filterJobDataByRuntimeFields({
                        backstory_summary: backstory,
                        physical_description: backstory,
                        injury_or_medical_details: backstory,
                        donationBackstoryEvaluation: JSON.stringify(storyEval),
                        claudeOutput: mergedClaude,
                        status: "donation_story_evaluated",
                    }) as any,
                });
                results.storyEval = "done";
            } catch (err) {
                results.storyEval = `error: ${err instanceof Error ? err.message : String(err)}`;
            }
        } else {
            results.storyEval = "skipped_no_backstory";
        }
    } else {
        results.storyEval = "already_done";
    }

    // Reload again
    const jobAfterStory = await prisma.job.findUnique({ where: { id: jobId } });
    if (!jobAfterStory) return NextResponse.json({ error: "Job not found after story eval" }, { status: 404 });

    // --- Step 3: Reference image evaluation ---
    const { referenceEvaluation: existingRefEval } = resolveDonationEvaluations(jobAfterStory);
    if (Object.keys(existingRefEval).length === 0) {
        const refs = await prisma.referenceAsset.findMany({
            where: { jobId, adId: null },
            orderBy: { createdAt: "asc" },
            select: { filePath: true, originalName: true },
        });

        if (refs.length > 0) {
            try {
                const evalResult = await evaluateDonationReferences({
                    campaignType: jobAfterStory.campaign_type || "FAMILY CRISIS",
                    referenceDescriptions: refs.map((r, idx) => ({
                        index: idx,
                        description: r.originalName || "",
                    })),
                    referenceImageUrls: refs.map((r) => r.filePath),
                    physicalDescription: jobAfterStory.physical_description || jobAfterStory.backstory_summary || "",
                    injuryOrMedicalDetails: jobAfterStory.injury_or_medical_details || jobAfterStory.backstory_summary || "",
                });
                const prevOut2 = await prisma.job.findUnique({
                    where: { id: jobId },
                    select: { claudeOutput: true },
                });
                const mergedClaude2 = mergeDonationWizardSnapshotIntoClaudeOutput(
                    prevOut2?.claudeOutput,
                    { referenceEvaluation: evalResult as Record<string, unknown> }
                );
                await prisma.job.update({
                    where: { id: jobId },
                    data: filterJobDataByRuntimeFields({
                        donationReferenceEvaluation: JSON.stringify(evalResult),
                        claudeOutput: mergedClaude2,
                        status: "donation_images_evaluated",
                    }) as any,
                });
                results.refEval = "done";
            } catch (err) {
                results.refEval = `error: ${err instanceof Error ? err.message : String(err)}`;
            }
        } else {
            results.refEval = "skipped_no_images";
        }
    } else {
        results.refEval = "already_done";
    }

    // Ensure job is in donation_build state
    const jobFinal = await prisma.job.findUnique({ where: { id: jobId } });
    if (jobFinal && !["donation_build"].includes(jobFinal.status || "")) {
        const { backstoryEvaluation: bEval, referenceEvaluation: rEval } = resolveDonationEvaluations(jobFinal);
        if (Object.keys(bEval).length > 0 && Object.keys(rEval).length > 0) {
            await prisma.job.update({ where: { id: jobId }, data: { status: "donation_build" } });
            results.status = "donation_build";
        }
    } else {
        results.status = jobFinal?.status;
    }

    return NextResponse.json({ ok: true, jobId, results });
}
