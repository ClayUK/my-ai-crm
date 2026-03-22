export const dynamic = "force-dynamic"
import { prisma } from "@/src/lib/prisma";
import { generateImageWithKie } from "@/src/lib/kie";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
    evaluateDonationBackstory,
    evaluateDonationPageFromScrape,
    evaluateDonationReferences,
    generateDonationFundraiserBatchFive,
    rewriteDonationVisualToKlingReady,
} from "@/src/lib/anthropic";
import {
    buildKlingAngleLabel,
    extractKiePortionForImageGen,
    extractStaticVisualFromAdPrompt,
} from "@/src/lib/klingReady";
import {
    appendFundraiserBatchHistory,
    buildBrainKeyedInstructions,
    buildBrainStaticPreamble,
    collectUsedAngleMemoryKeys,
    donationStyleTemplateLabel,
    formatBatchHistoryForPrompt,
    getFundraiserCreativeBrain,
    normalizeAngleLine,
    parseAnglesList,
    parseFundraiserBatchHistory,
    pickRandomWinningPromptSeeds,
    planFundraiserBatchFreshAngles,
    planFundraiserBatchOfFive,
    resolveVarKeyPoolFromAdditionalInfo,
    type FundraiserBatchPlanSlot,
} from "@/src/lib/creativeBrain";
import { normalizeRequestedAdCount } from "@/src/lib/claudeAds";
import {
    readJobFundraiserBatchHistory,
    writeJobFundraiserBatchHistory,
} from "@/src/lib/jobFundraiserBatchHistory";
import { getDonationSwipeBatchContext } from "@/src/lib/swipeBrain";
import {
    appendAdReferenceImages,
    appendJobSharedReferenceImages,
} from "./reference-asset-actions";
import {
    MAX_AD_REFERENCE_IMAGES,
    MAX_JOB_SHARED_REFERENCE_IMAGES,
} from "./reference-asset-constants";
import { ReferenceImageChip } from "./reference-image-chip";
import { AdVariationPanel } from "./ad-variation-panel";
import { AdCollapsibleHeaderActions } from "./ad-collapsible-header-actions";
import { scrapeUrlToHtml } from "@/src/lib/scrape";
import {
    persistDonationPageEvalAndAutoStoryEval,
    mergeDonationWizardSnapshotIntoClaudeOutput,
    resolveDonationEvaluations,
    getDonationWizardSnapshot,
    composeBackstoryFromPageEval,
} from "@/src/lib/donationWizard";
import {
    parseValidateAndNormalizeClaudeAds,
    type ClaudeParseDiagnostics,
} from "@/src/lib/claude/parseClaudeJson";
import CopyToClipboardButton from "@/app/components/CopyToClipboardButton";
import SaveImageButton from "@/app/components/SaveImageButton";

function tryParseJson(value: string | null) {
    if (!value) return null;
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

function stripHtml(html: string) {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function formatDonationEvalBlock(obj: unknown): string {
    if (obj == null) return "";
    if (typeof obj === "string") return obj.trim();
    try {
        return JSON.stringify(obj, null, 2);
    } catch {
        return String(obj);
    }
}

function filterJobDataByRuntimeFields(data: Record<string, unknown>) {
    try {
        const fields = (prisma as any)?._runtimeDataModel?.models?.Job?.fields;
        if (!Array.isArray(fields)) return data;
        const allowed = new Set(
            fields
                .map((f: any) => (f && typeof f.name === "string" ? f.name : ""))
                .filter(Boolean)
        );
        return Object.fromEntries(
            Object.entries(data).filter(([k]) => allowed.has(k))
        );
    } catch {
        return data;
    }
}

function extractImageUrlsFromResult(result: unknown): string[] {
    const urls = new Set<string>();

    function walk(value: unknown) {
        if (!value) return;

        if (typeof value === "string") {
            const lower = value.toLowerCase();
            if (
                (value.startsWith("http://") || value.startsWith("https://")) &&
                (lower.includes(".png") ||
                    lower.includes(".jpg") ||
                    lower.includes(".jpeg") ||
                    lower.includes(".webp") ||
                    lower.includes("image"))
            ) {
                urls.add(value);
            }
            return;
        }

        if (Array.isArray(value)) {
            for (const item of value) walk(item);
            return;
        }

        if (typeof value === "object") {
            for (const nested of Object.values(value as Record<string, unknown>)) {
                walk(nested);
            }
        }
    }

    walk(result);
    return Array.from(urls);
}

function extractLatestClaudeDiagnostics(
    claudeOutput: string | null
): ClaudeParseDiagnostics | null {
    const text = claudeOutput || "";
    const startMarker = "__CLAUDE_PARSE_DIAGNOSTICS__";
    const endMarker = "__END_CLAUDE_PARSE_DIAGNOSTICS__";

    const start = text.lastIndexOf(startMarker);
    if (start === -1) return null;

    const afterStart = start + startMarker.length;
    const end = text.indexOf(endMarker, afterStart);
    if (end === -1) return null;

    const jsonText = text.slice(afterStart, end).trim();
    const parsed = tryParseJson(jsonText);
    return parsed && typeof parsed === "object"
        ? (parsed as ClaudeParseDiagnostics)
        : null;
}

// --- Donation step actions (donation-only) ---
async function analyzeDonationFundraiser(formData: FormData) {
    "use server";

    const jobId = formData.get("jobId")?.toString();
    if (!jobId) throw new Error("Missing jobId");

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error("Job not found");
    if (job.campaignType !== "donation") redirect(`/jobs/${jobId}`);

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
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const fallbackEval = {
            subjectName: "Fundraiser",
            whatHappened:
                "Unable to auto-extract from URL. Please provide backstory manually.",
            whyFundingIsNeeded: "User-provided details required.",
            urgencyLevel: "general",
            keyEmotionalHooks: [
                "Human impact",
                "Urgent support needed",
                "Direct call for help",
            ],
            usefulPhrases: ["Help now", "Support this fundraiser"],
            draftBackstory: "",
            warning:
                "Automatic page analysis failed in retry. Continue with manual backstory.",
        };

        const prevRow = await prisma.job.findUnique({
            where: { id: jobId },
            select: { claudeOutput: true },
        });
        const mergedClaude = mergeDonationWizardSnapshotIntoClaudeOutput(
            prevRow?.claudeOutput,
            {
                pageEvaluation: fallbackEval,
                backstorySummary: "",
                pageEvaluationRetryError: message,
            }
        );

        await prisma.job.update({
            where: { id: jobId },
            data: filterJobDataByRuntimeFields({
                donationPageEvaluation: JSON.stringify(fallbackEval),
                status: "donation_page_evaluated",
                claudeOutput: mergedClaude,
            }) as any,
        });
    }

    redirect(`/jobs/${jobId}`);
}

async function evaluateDonationStory(formData: FormData) {
    "use server";

    const jobId = formData.get("jobId")?.toString();
    const backstoryFromForm = String(formData.get("backstory") || "").trim();
    if (!jobId) throw new Error("Missing jobId");

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error("Job not found");

    const dwSnap = getDonationWizardSnapshot(job.claudeOutput);
    const { pageEvaluation } = resolveDonationEvaluations(job);
    const rawText = String(job.rawText || "").trim();
    const composedFromPage = composeBackstoryFromPageEval(
        pageEvaluation,
        rawText
    ).trim();

    const backstory =
        backstoryFromForm ||
        String(job.backstory_summary || "").trim() ||
        String(dwSnap?.backstorySummary || "").trim() ||
        composedFromPage;

    if (!backstory.trim()) {
        redirect(
            `/jobs/${jobId}?${new URLSearchParams({
                [STORY_EVAL_ERROR_QUERY_KEY]: "need_backstory",
            }).toString()}`
        );
    }

    const evalResult = await evaluateDonationBackstory({
        campaignType: job.campaign_type || "FAMILY CRISIS",
        subjectName: job.subject_name || "Fundraiser",
        urgencyLevel: job.urgency_level || "general",
        emotionalHook: job.emotional_hook || undefined,
        backstorySummary: backstory,
    });

    const prevOut = await prisma.job.findUnique({
        where: { id: jobId },
        select: { claudeOutput: true },
    });
    const mergedClaude = mergeDonationWizardSnapshotIntoClaudeOutput(
        prevOut?.claudeOutput,
        {
            storyEvaluation: evalResult as Record<string, unknown>,
            backstorySummary: backstory,
        }
    );

    await prisma.job.update({
        where: { id: jobId },
        data: filterJobDataByRuntimeFields({
            backstory_summary: backstory,
            physical_description: backstory,
            injury_or_medical_details: backstory,
            donationBackstoryEvaluation: JSON.stringify(evalResult),
            claudeOutput: mergedClaude,
            status: "donation_story_evaluated",
        }) as any,
    });

    redirect(`/jobs/${jobId}`);
}

async function evaluateDonationImages(formData: FormData) {
    "use server";

    const jobId = formData.get("jobId")?.toString();
    if (!jobId) throw new Error("Missing jobId");

    const imageDescriptions = formData
        .getAll("reference_image_descriptions[]")
        .map((v) => String(v).trim());

    async function readClaudeOutput() {
        const row = await prisma.job.findUnique({
            where: { id: jobId },
            select: { claudeOutput: true },
        });
        return row?.claudeOutput ?? null;
    }

    const refs = await prisma.referenceAsset.findMany({
        where: { jobId, adId: null },
        orderBy: { createdAt: "asc" },
        select: { filePath: true, originalName: true },
    });

    if (refs.length === 0) {
        const mergedClaude = mergeDonationWizardSnapshotIntoClaudeOutput(
            await readClaudeOutput(),
            {
                referenceEvaluationError:
                    "Add at least one reference image, then try Evaluate Images again.",
            }
        );
        await prisma.job.update({
            where: { id: jobId },
            data: filterJobDataByRuntimeFields({
                claudeOutput: mergedClaude,
            }) as any,
        });
        redirect(`/jobs/${jobId}`);
    }

    const referenceDescriptions = refs.map((r, idx) => ({
        index: idx,
        description: imageDescriptions[idx] || r.originalName || "",
    }));

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error("Job not found");

    let evalResult: Record<string, unknown>;
    let evalOk = true;
    try {
        evalResult = (await evaluateDonationReferences({
            campaignType: job.campaign_type || "FAMILY CRISIS",
            referenceDescriptions,
            referenceImageUrls: refs.map((r) => r.filePath),
            physicalDescription:
                job.physical_description || job.backstory_summary || "",
            injuryOrMedicalDetails:
                job.injury_or_medical_details || job.backstory_summary || "",
        })) as Record<string, unknown>;
    } catch (claudeErr) {
        evalOk = false;
        const msg =
            claudeErr instanceof Error
                ? claudeErr.message
                : String(claudeErr);
        evalResult = {
            imagesSummary: "Reference image evaluation failed (see error).",
            error: msg,
        };
    }

    const mergedClaude = mergeDonationWizardSnapshotIntoClaudeOutput(
        await readClaudeOutput(),
        evalOk
            ? {
                  referenceEvaluation: evalResult,
                  referenceEvaluationError: null,
                  referenceEvaluationApiFailed: null,
              }
            : {
                  referenceEvaluation: evalResult,
                  referenceEvaluationApiFailed: true,
              }
    );

    await prisma.job.update({
        where: { id: jobId },
        data: filterJobDataByRuntimeFields({
            donationReferenceEvaluation: JSON.stringify(evalResult),
            claudeOutput: mergedClaude,
            status: evalOk ? "donation_images_evaluated" : job.status,
        }) as any,
    });

    redirect(`/jobs/${jobId}`);
}

async function goToDonationAdBuilder(formData: FormData) {
    "use server";

    const jobId = formData.get("jobId")?.toString();
    if (!jobId) throw new Error("Missing jobId");

    const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: {
            campaignType: true,
            claudeOutput: true,
            donationBackstoryEvaluation: true,
            donationReferenceEvaluation: true,
            donationPageEvaluation: true,
        },
    });
    if (!job) throw new Error("Job not found");

    if (job.campaignType !== "donation") {
        redirect(`/jobs/${jobId}`);
    }

    const { backstoryEvaluation, referenceEvaluation } =
        resolveDonationEvaluations(job);
    if (
        Object.keys(backstoryEvaluation).length === 0 ||
        Object.keys(referenceEvaluation).length === 0
    ) {
        redirect(`/jobs/${jobId}`);
    }

    await prisma.job.update({
        where: { id: jobId },
        data: { status: "donation_build" },
    });

    redirect(`/jobs/${jobId}`);
}

async function generateFundraiserFiveAds(formData: FormData) {
    "use server";

    const jobId = formData.get("jobId")?.toString();
    if (!jobId) throw new Error("Missing jobId");

    const selectedReferenceIds = Array.from(
        new Set(
            formData
                .getAll("selectedReferenceIds")
                .map((v) => String(v).trim())
                .filter(Boolean)
        )
    );

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error("Job not found");
    if (job.campaignType !== "donation") redirect(`/jobs/${jobId}`);

    const { pageEvaluation, backstoryEvaluation, referenceEvaluation } =
        resolveDonationEvaluations(job);

    if (
        Object.keys(backstoryEvaluation).length === 0 ||
        Object.keys(referenceEvaluation).length === 0
    ) {
        throw new Error("Run donation evaluation first.");
    }

    const jobSharedRefsAll = await prisma.referenceAsset.findMany({
        where: { jobId, adId: null },
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            filePath: true,
            originalName: true,
            mimeType: true,
        },
    });
    const jobSharedRefs =
        selectedReferenceIds.length > 0
            ? jobSharedRefsAll.filter((ref) =>
                  selectedReferenceIds.includes(String(ref.id))
              )
            : jobSharedRefsAll;
    const referenceImageUrls = jobSharedRefs
        .map((r) => r.filePath)
        .filter(Boolean);

    const rnd = Math.random;
    const brainRow =
        (await getFundraiserCreativeBrain()) ?? {
            previousWinningPrompts: "",
            anglesList: "",
            additionalInfo: "",
        };
    const swipeCtx = await getDonationSwipeBatchContext();
    const varKeyPool = resolveVarKeyPoolFromAdditionalInfo(
        brainRow.additionalInfo
    );
    const plans = planFundraiserBatchOfFive(brainRow.anglesList, rnd, {
        varKeyPool,
    });
    const winningSeeds = pickRandomWinningPromptSeeds(
        brainRow.previousWinningPrompts,
        5,
        rnd,
        swipeCtx.seedLines
    );
    const brainStaticPreamble = buildBrainStaticPreamble(brainRow);
    const slots = plans.map((p, i) => ({
        slotIndex: p.slotIndex,
        styleTemplateId: p.styleTemplateId,
        templateLabel: donationStyleTemplateLabel(p.styleTemplateId),
        selectedAngle: p.angleLine,
        keyedBrainInstructions: buildBrainKeyedInstructions(
            brainRow,
            p.activeBrainKeys
        ),
        winningPromptSeed: winningSeeds[i] || undefined,
    }));

    const planForHistory = plans.map((p, i) => ({
        slotIndex: p.slotIndex,
        styleTemplateId: p.styleTemplateId,
        templateLabel: donationStyleTemplateLabel(p.styleTemplateId),
        angleLine: p.angleLine,
        varKeys: [...p.varKeys],
        winningPromptSeed: winningSeeds[i] || undefined,
    }));

    const existingBatchHistory = await readJobFundraiserBatchHistory(jobId);
    const priorBatchesSummary = formatBatchHistoryForPrompt(
        parseFundraiserBatchHistory(existingBatchHistory)
    );

    const platforms = String(job.platform || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const adJson = await generateDonationFundraiserBatchFive({
        campaignType: job.campaign_type || "",
        subjectName: job.subject_name || "",
        subjectType: job.subject_type || "",
        speciesBreedAge: job.species_breed_age || "",
        physicalDescription: job.physical_description || "",
        injuryOrMedicalDetails: job.injury_or_medical_details || "",
        backstorySummary: job.backstory_summary || "",
        urgencyLevel: job.urgency_level || "",
        fundraiserGoalAmount: job.fundraiser_goal_amount || undefined,
        emotionalHook: job.emotional_hook || undefined,
        companionOrFamilyDetail: job.companion_or_family_detail || undefined,
        beforeDetail: job.before_detail || undefined,
        platforms: platforms.length ? platforms.join(", ") : job.platform || "",
        pageEvaluation,
        backstoryEvaluation,
        referenceEvaluation,
        referenceImageUrls,
        brainStaticPreamble,
        swipeBankSection: swipeCtx.formattedSection || undefined,
        priorBatchesSummary,
        slots,
    });

    const parsed = parseValidateAndNormalizeClaudeAds(
        JSON.stringify(adJson),
        5
    );

    if (!parsed.ok || parsed.ads.length !== 5) {
        await prisma.job.update({
            where: { id: jobId },
            data: {
                status: "donation_ad_error",
                claudeOutput: JSON.stringify(
                    {
                        error: parsed.ok
                            ? `Expected 5 ads, got ${parsed.ads.length}`
                            : parsed.diagnostics.error,
                    },
                    null,
                    2
                ),
            },
        });
        redirect(`/jobs/${jobId}`);
    }

    const maxAdNumber = await prisma.ad.findFirst({
        where: { jobId },
        orderBy: { adNumber: "desc" },
        select: { adNumber: true },
    });
    let nextAdNumber = (maxAdNumber?.adNumber ?? 0) + 1;

    const createdIds: string[] = [];
    for (let i = 0; i < 5; i++) {
        const num = nextAdNumber++;
        const ad = await prisma.ad.create({
            data: {
                jobId,
                adNumber: num,
                title: `Ad ${num}`,
                sourceBlock: JSON.stringify(parsed.ads[i], null, 2),
                editedPrompt: String(parsed.ads[i]!.visualPrompt || "").trim(),
                status: "ready",
            },
        });
        createdIds.push(ad.id);
    }

    if (jobSharedRefs.length > 0) {
        for (const adId of createdIds) {
            await prisma.referenceAsset.createMany({
                data: jobSharedRefs.map((ref) => ({
                    jobId,
                    adId,
                    filePath: ref.filePath,
                    originalName: ref.originalName,
                    mimeType: ref.mimeType,
                })),
            });
        }
    }

    const summaryAds = parsed.ads.map((a, i) => ({
        hook: typeof a.hook === "string" ? a.hook : undefined,
        angle: typeof a.angle === "string" ? a.angle : undefined,
        templateId: plans[i]?.styleTemplateId,
    }));

    const nextHistory = appendFundraiserBatchHistory(
        existingBatchHistory,
        summaryAds,
        planForHistory
    );
    await writeJobFundraiserBatchHistory(jobId, nextHistory);

    redirect(`/jobs/${jobId}`);
}

const STORY_EVAL_ERROR_QUERY_KEY = "storyEvalError";
const FRESH_BATCH_QUERY_KEY = "freshBatch";
const FRESH_BATCH_PARTIAL_QUERY_KEY = "freshBatchPartial";
const FRESH_BATCH_ERROR_QUERY_KEY = "freshBatchError";

async function generateFundraiserFiveAdsFreshAngles(formData: FormData) {
    "use server";

    const jobId = formData.get("jobId")?.toString();
    if (!jobId) throw new Error("Missing jobId");

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error("Job not found");
    if (job.campaignType !== "donation") redirect(`/jobs/${jobId}`);

    const { pageEvaluation, backstoryEvaluation, referenceEvaluation } =
        resolveDonationEvaluations(job);

    if (
        Object.keys(backstoryEvaluation).length === 0 ||
        Object.keys(referenceEvaluation).length === 0
    ) {
        throw new Error("Run donation evaluation first.");
    }

    const jobSharedRefsAll = await prisma.referenceAsset.findMany({
        where: { jobId, adId: null },
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            filePath: true,
            originalName: true,
            mimeType: true,
        },
    });
    const jobSharedRefs = jobSharedRefsAll;
    const referenceImageUrls = jobSharedRefs
        .map((r) => r.filePath)
        .filter(Boolean);

    const rnd = Math.random;
    const brainRow =
        (await getFundraiserCreativeBrain()) ?? {
            previousWinningPrompts: "",
            anglesList: "",
            additionalInfo: "",
        };

    const memoryAngles = parseAnglesList(brainRow.anglesList);
    if (memoryAngles.length === 0) {
        redirect(
            `/jobs/${jobId}?${new URLSearchParams({ [FRESH_BATCH_ERROR_QUERY_KEY]: "noAngles" }).toString()}`
        );
    }

    const existingBatchHistory = await readJobFundraiserBatchHistory(jobId);
    const histParsed = parseFundraiserBatchHistory(existingBatchHistory);
    const usedKeys = collectUsedAngleMemoryKeys(histParsed, memoryAngles);
    const remainingAngles = memoryAngles.filter(
        (m) => !usedKeys.has(normalizeAngleLine(m))
    );

    if (remainingAngles.length === 0) {
        redirect(
            `/jobs/${jobId}?${new URLSearchParams({ [FRESH_BATCH_ERROR_QUERY_KEY]: "exhausted" }).toString()}`
        );
    }

    const slotCount = Math.min(5, remainingAngles.length);
    const swipeCtx = await getDonationSwipeBatchContext();
    const varKeyPool = resolveVarKeyPoolFromAdditionalInfo(
        brainRow.additionalInfo
    );
    const plans = planFundraiserBatchFreshAngles(
        brainRow.anglesList,
        usedKeys,
        rnd,
        { varKeyPool }
    );

    if (plans.length !== slotCount || plans.length === 0) {
        redirect(
            `/jobs/${jobId}?${new URLSearchParams({ [FRESH_BATCH_ERROR_QUERY_KEY]: "plan" }).toString()}`
        );
    }

    const winningSeeds = pickRandomWinningPromptSeeds(
        brainRow.previousWinningPrompts,
        slotCount,
        rnd,
        swipeCtx.seedLines
    );
    const brainStaticPreamble = buildBrainStaticPreamble(brainRow);
    const slots = plans.map((p, i) => ({
        slotIndex: p.slotIndex,
        styleTemplateId: p.styleTemplateId,
        templateLabel: donationStyleTemplateLabel(p.styleTemplateId),
        selectedAngle: p.angleLine,
        keyedBrainInstructions: buildBrainKeyedInstructions(
            brainRow,
            p.activeBrainKeys
        ),
        winningPromptSeed: winningSeeds[i] || undefined,
    }));

    const planForHistory = plans.map((p, i) => ({
        slotIndex: p.slotIndex,
        styleTemplateId: p.styleTemplateId,
        templateLabel: donationStyleTemplateLabel(p.styleTemplateId),
        angleLine: p.angleLine,
        varKeys: [...p.varKeys],
        winningPromptSeed: winningSeeds[i] || undefined,
    }));

    const priorBatchesSummary = formatBatchHistoryForPrompt(histParsed);

    const platforms = String(job.platform || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const adJson = await generateDonationFundraiserBatchFive({
        campaignType: job.campaign_type || "",
        subjectName: job.subject_name || "",
        subjectType: job.subject_type || "",
        speciesBreedAge: job.species_breed_age || "",
        physicalDescription: job.physical_description || "",
        injuryOrMedicalDetails: job.injury_or_medical_details || "",
        backstorySummary: job.backstory_summary || "",
        urgencyLevel: job.urgency_level || "",
        fundraiserGoalAmount: job.fundraiser_goal_amount || undefined,
        emotionalHook: job.emotional_hook || undefined,
        companionOrFamilyDetail: job.companion_or_family_detail || undefined,
        beforeDetail: job.before_detail || undefined,
        platforms: platforms.length ? platforms.join(", ") : job.platform || "",
        pageEvaluation,
        backstoryEvaluation,
        referenceEvaluation,
        referenceImageUrls,
        brainStaticPreamble,
        swipeBankSection: swipeCtx.formattedSection || undefined,
        priorBatchesSummary,
        slots,
    });

    const parsed = parseValidateAndNormalizeClaudeAds(
        JSON.stringify(adJson),
        slotCount
    );

    if (!parsed.ok || parsed.ads.length !== slotCount) {
        await prisma.job.update({
            where: { id: jobId },
            data: {
                status: "donation_ad_error",
                claudeOutput: JSON.stringify(
                    {
                        error: parsed.ok
                            ? `Expected ${slotCount} ads, got ${parsed.ads.length}`
                            : parsed.diagnostics.error,
                    },
                    null,
                    2
                ),
            },
        });
        redirect(`/jobs/${jobId}`);
    }

    const maxAdNumber = await prisma.ad.findFirst({
        where: { jobId },
        orderBy: { adNumber: "desc" },
        select: { adNumber: true },
    });
    let nextAdNumber = (maxAdNumber?.adNumber ?? 0) + 1;

    const createdIds: string[] = [];
    for (let i = 0; i < slotCount; i++) {
        const num = nextAdNumber++;
        const ad = await prisma.ad.create({
            data: {
                jobId,
                adNumber: num,
                title: `Ad ${num}`,
                sourceBlock: JSON.stringify(parsed.ads[i], null, 2),
                editedPrompt: String(parsed.ads[i]!.visualPrompt || "").trim(),
                status: "ready",
            },
        });
        createdIds.push(ad.id);
    }

    if (jobSharedRefs.length > 0) {
        for (const adId of createdIds) {
            await prisma.referenceAsset.createMany({
                data: jobSharedRefs.map((ref) => ({
                    jobId,
                    adId,
                    filePath: ref.filePath,
                    originalName: ref.originalName,
                    mimeType: ref.mimeType,
                })),
            });
        }
    }

    const summaryAds = parsed.ads.map((a, i) => ({
        hook: typeof a.hook === "string" ? a.hook : undefined,
        angle: typeof a.angle === "string" ? a.angle : undefined,
        templateId: plans[i]?.styleTemplateId,
    }));

    const nextHistory = appendFundraiserBatchHistory(
        existingBatchHistory,
        summaryAds,
        planForHistory
    );
    await writeJobFundraiserBatchHistory(jobId, nextHistory);

    const remainingAfter = remainingAngles.length - slotCount;
    const qs = new URLSearchParams();
    if (remainingAfter <= 0) {
        qs.set(FRESH_BATCH_QUERY_KEY, "last");
        if (slotCount < 5) qs.set(FRESH_BATCH_PARTIAL_QUERY_KEY, "1");
    } else {
        qs.set(FRESH_BATCH_QUERY_KEY, "ok");
    }
    redirect(`/jobs/${jobId}?${qs.toString()}`);
}

const VARIATION_ERROR_QUERY_KEY = "variationError";
const VARIATION_ERROR_MAX_LEN = 2000;

function redirectWithVariationError(jobId: string, message: string): never {
    const safe = message.replace(/\s+/g, " ").trim().slice(0, VARIATION_ERROR_MAX_LEN);
    const qs = new URLSearchParams({ [VARIATION_ERROR_QUERY_KEY]: safe });
    redirect(`/jobs/${jobId}?${qs.toString()}`);
}

// --- Ad editing stage ---
async function saveAdPromptAndReferences(formData: FormData) {
    "use server";

    const jobId = formData.get("jobId")?.toString();
    const adId = formData.get("adId")?.toString();
    const editedPrompt = formData.get("editedPrompt")?.toString() || "";

    if (!jobId || !adId) throw new Error("Missing jobId or adId");

    await prisma.ad.update({
        where: { id: adId },
        data: { editedPrompt },
    });

    redirect(`/jobs/${jobId}`);
}

async function makeAdKlingReady(formData: FormData) {
    "use server";

    const jobId = formData.get("jobId")?.toString();
    const adId = formData.get("adId")?.toString();
    if (!jobId || !adId) throw new Error("Missing jobId or adId");

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error("Job not found");
    if (job.campaignType !== "donation") redirect(`/jobs/${jobId}`);

    const ad = await prisma.ad.findUnique({ where: { id: adId } });
    if (!ad?.sourceBlock) throw new Error("Ad missing sourceBlock");

    type AdTab = {
        angle?: string;
        hook?: string;
        headline?: string;
        primaryText?: string;
        cta?: string;
        visualPrompt?: string;
    };

    const source = tryParseJson(ad.sourceBlock) as AdTab | null;
    if (
        !source ||
        typeof source.hook !== "string" ||
        typeof source.headline !== "string" ||
        typeof source.primaryText !== "string" ||
        typeof source.cta !== "string" ||
        typeof source.visualPrompt !== "string"
    ) {
        redirect(`/jobs/${jobId}`);
    }

    const combined =
        (ad.editedPrompt || "").trim() || source.visualPrompt.trim();
    const staticVisual = extractStaticVisualFromAdPrompt(combined);
    if (!staticVisual) redirect(`/jobs/${jobId}`);

    const donationEvaluationsResolved = resolveDonationEvaluations(job);
    const brainRowKling = (await getFundraiserCreativeBrain()) ?? null;
    const fundraiserBrainPreambleKling =
        buildBrainStaticPreamble(brainRowKling) || undefined;

    const out = await rewriteDonationVisualToKlingReady({
        staticVisualPrompt: staticVisual,
        hook: source.hook,
        headline: source.headline,
        primaryText: source.primaryText,
        cta: source.cta,
        campaignType: job.campaign_type || "",
        donationEvaluations: {
            pageEvaluation: donationEvaluationsResolved.pageEvaluation,
            backstoryEvaluation: donationEvaluationsResolved.backstoryEvaluation,
            referenceEvaluation: donationEvaluationsResolved.referenceEvaluation,
        },
        fundraiserBrainPreamble: fundraiserBrainPreambleKling,
    });

    const newVisual = (out.visualPrompt || "").trim();
    if (
        !newVisual ||
        !newVisual.includes("KIE_IMAGE_PROMPT:") ||
        !newVisual.includes("|| KLING_ANIMATION_PROMPT:")
    ) {
        redirect(`/jobs/${jobId}`);
    }

    const nextSource = {
        ...source,
        visualPrompt: newVisual,
        angle: buildKlingAngleLabel(source.angle || ""),
    };

    const kieOnly = extractKiePortionForImageGen(newVisual);

    await prisma.ad.update({
        where: { id: adId },
        data: {
            sourceBlock: JSON.stringify(nextSource, null, 2),
            editedPrompt: kieOnly,
        },
    });

    redirect(`/jobs/${jobId}`);
}

// --- Image generation stage (per ad) ---
async function generateAdImages(formData: FormData) {
    "use server";

    const jobId = formData.get("jobId")?.toString();
    const adId = formData.get("adId")?.toString();
    const adAspectRatioRaw = formData.get("adAspectRatio")?.toString();
    const adAspectRatio: "1:1" | "9:16" =
        adAspectRatioRaw === "9:16" ? "9:16" : "1:1";

    if (!jobId || !adId) throw new Error("Missing jobId or adId");

    const ad = await prisma.ad.findUnique({
        where: { id: adId },
    });

    if (!ad) throw new Error("Ad not found");

    let prompt = (ad.editedPrompt || ad.sourceBlock || "").trim();
    if (!prompt) throw new Error("No prompt available");

    // Donation TEMPLATE 6 (KLING VIDEO READY) stores BOTH prompts in `visualPrompt`
    // in a single-line format. Kie image generation must use only the KIE portion.
    if (
        prompt.includes("KIE_IMAGE_PROMPT:") &&
        prompt.includes("|| KLING_ANIMATION_PROMPT:")
    ) {
        const afterKie = prompt.split("KIE_IMAGE_PROMPT:")[1] || "";
        const kiePart = afterKie.split("|| KLING_ANIMATION_PROMPT:")[0] || "";
        prompt = kiePart.trim();
    }

    // Prefer ad-specific references. If none exist, fall back to shared job references.
    const adReferenceAssets = await prisma.referenceAsset.findMany({
        where: { jobId, adId },
        orderBy: { createdAt: "asc" },
    });

    const referenceAssets =
        adReferenceAssets.length > 0
            ? adReferenceAssets
            : await prisma.referenceAsset.findMany({
                  where: { jobId, adId: null },
                  orderBy: { createdAt: "asc" },
              });

    const referenceImages = referenceAssets
        .map((asset) => asset.filePath)
        .filter(Boolean);

    console.log("[generateAdImages]", {
        jobId,
        adId,
        referenceCount: referenceImages.length,
        used: adReferenceAssets.length > 0 ? "ad" : "job_shared",
    });

    await prisma.ad.update({
        where: { id: adId },
        data: { status: "generating_images" },
    });

    try {
        const result = await generateImageWithKie(
            prompt,
            referenceImages,
            adAspectRatio
        );
        const urls = extractImageUrlsFromResult(result);

        await prisma.image.deleteMany({
            where: { adId },
        });

        if (urls.length > 0) {
            await prisma.image.createMany({
                data: urls.map((url) => ({
                    adId,
                    url,
                    prompt,
                })),
            });
        }

        await prisma.ad.update({
            where: { id: adId },
            data: {
                status: "images_generated",
                kieResult: JSON.stringify(result, null, 2),
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await prisma.ad.update({
            where: { id: adId },
            data: {
                status: "kie_error",
                kieResult: `Kie generation failed:\n\n${message}`,
            },
        });
    }

    redirect(`/jobs/${jobId}`);
}

export default async function JobDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
    const { id } = await params;
    const sp = (await searchParams) ?? {};
    const variationErrRaw = sp[VARIATION_ERROR_QUERY_KEY];
    const variationErrorMessage =
        typeof variationErrRaw === "string"
            ? variationErrRaw
            : Array.isArray(variationErrRaw)
              ? variationErrRaw[0] ?? ""
              : "";

    const freshBatchRaw = sp[FRESH_BATCH_QUERY_KEY];
    const freshBatchStatus =
        typeof freshBatchRaw === "string"
            ? freshBatchRaw
            : Array.isArray(freshBatchRaw)
              ? freshBatchRaw[0]
              : undefined;
    const freshPartialRaw = sp[FRESH_BATCH_PARTIAL_QUERY_KEY];
    const freshBatchPartialFlag =
        typeof freshPartialRaw === "string"
            ? freshPartialRaw
            : Array.isArray(freshPartialRaw)
              ? freshPartialRaw[0]
              : undefined;
    const freshErrRaw = sp[FRESH_BATCH_ERROR_QUERY_KEY];
    const freshBatchError =
        typeof freshErrRaw === "string"
            ? freshErrRaw
            : Array.isArray(freshErrRaw)
              ? freshErrRaw[0]
              : undefined;

    const storyEvalErrRaw = sp[STORY_EVAL_ERROR_QUERY_KEY];
    const storyEvalErrorCode =
        typeof storyEvalErrRaw === "string"
            ? storyEvalErrRaw
            : Array.isArray(storyEvalErrRaw)
              ? storyEvalErrRaw[0] ?? ""
              : "";
    const storyEvalErrorMessage =
        storyEvalErrorCode === "need_backstory"
            ? "Add a backstory in the text box (or edit the draft we pre-filled). If the box is empty, click Analyze Fundraiser again so we can pull text from the fundraiser page, then try Evaluate Story."
            : "";

    const job = await prisma.job.findUnique({
        where: { id },
        include: {
            ads: {
                include: {
                    images: {
                        orderBy: { createdAt: "desc" },
                    },
                },
                orderBy: {
                    adNumber: "asc",
                },
            },
            referenceAssets: {
                orderBy: { createdAt: "asc" },
            },
        },
    });

    if (!job) notFound();

    if (job.campaignType !== "donation") {
        return (
            <div style={{ padding: 24, maxWidth: 560 }}>
                <h1 style={{ marginTop: 0 }}>Fundraiser-only workspace</h1>
                <p style={{ opacity: 0.9, lineHeight: 1.5 }}>
                    This job is not a fundraiser campaign. Create a new
                    fundraiser from the home page.
                </p>
                <Link href="/">Back to home</Link>
            </div>
        );
    }

    const requestedCount = normalizeRequestedAdCount(job.numberOfAds);
    const diagnostics = extractLatestClaudeDiagnostics(job.claudeOutput);

    const showReturnedNote =
        job.ads.length > 0 &&
        diagnostics &&
        typeof diagnostics.returnedAdCount === "number" &&
        diagnostics.returnedAdCount !== requestedCount;

    const showErrorPanel = job.status === "error" && job.ads.length === 0;
    const fallbackError =
        typeof diagnostics?.error === "string" && diagnostics.error.trim()
            ? diagnostics.error
            : typeof job.claudeOutput === "string" && job.claudeOutput.trim()
              ? job.claudeOutput.trim().slice(0, 500)
              : "Try again.";

    const fallbackPreview =
        typeof diagnostics?.preview === "string" && diagnostics.preview.trim()
            ? diagnostics.preview
            : typeof job.claudeOutput === "string" && job.claudeOutput.trim()
              ? job.claudeOutput.trim().slice(0, 500)
              : "";

    const dwSnap =
        job.campaignType === "donation"
            ? getDonationWizardSnapshot(job.claudeOutput)
            : null;
    const resolvedDonation =
        job.campaignType === "donation"
            ? resolveDonationEvaluations(job)
            : {
                  pageEvaluation: {} as Record<string, unknown>,
                  backstoryEvaluation: {} as Record<string, unknown>,
                  referenceEvaluation: {} as Record<string, unknown>,
              };

    const donationPageEval = resolvedDonation.pageEvaluation;
    const donationBackstoryEval = resolvedDonation.backstoryEvaluation;
    const donationReferenceEval = resolvedDonation.referenceEvaluation;

    const displayBackstoryText =
        job.campaignType === "donation"
            ? (
                  (job.backstory_summary || "").trim() ||
                  String(dwSnap?.backstorySummary || "").trim() ||
                  composeBackstoryFromPageEval(
                      donationPageEval,
                      (job.rawText || "").trim()
                  ).trim()
              )
            : "";

    const displayPageEvalStr =
        job.campaignType === "donation"
            ? (job.donationPageEvaluation || "").trim() ||
              formatDonationEvalBlock(donationPageEval)
            : "";

    const displayStoryEvalStr =
        job.campaignType === "donation"
            ? (job.donationBackstoryEvaluation || "").trim() ||
              formatDonationEvalBlock(donationBackstoryEval)
            : "";

    const displayReferenceEvalStr =
        job.campaignType === "donation"
            ? (job.donationReferenceEvaluation || "").trim() ||
              formatDonationEvalBlock(donationReferenceEval)
            : "";

    const fundraiserBatchHistRaw =
        job.campaignType === "donation"
            ? await readJobFundraiserBatchHistory(job.id)
            : null;
    const fundraiserBatchHist =
        job.campaignType === "donation"
            ? parseFundraiserBatchHistory(fundraiserBatchHistRaw)
            : { batches: [] };
    const lastAutoBatchPlan =
        fundraiserBatchHist.batches.length > 0
            ? fundraiserBatchHist.batches[fundraiserBatchHist.batches.length - 1]
                  ?.plan
            : undefined;

    const fundraiserBrainForFresh = await getFundraiserCreativeBrain();
    const memAnglesForFresh = parseAnglesList(
        fundraiserBrainForFresh?.anglesList ?? ""
    );
    const usedAngleKeysForFresh = collectUsedAngleMemoryKeys(
        fundraiserBatchHist,
        memAnglesForFresh
    );
    const remainingFreshAngleCount = memAnglesForFresh.filter(
        (m) => !usedAngleKeysForFresh.has(normalizeAngleLine(m))
    ).length;

    const donationSharedReferenceAssets =
        job.campaignType === "donation"
            ? job.referenceAssets.filter((ref) => !ref.adId)
            : [];
    const isDonationBuildStep =
        job.campaignType === "donation" && job.status === "donation_build";
    const hasDonationPageEval =
        job.campaignType === "donation" &&
        (!!(job.donationPageEvaluation || "").trim() ||
            Object.keys(donationPageEval).length > 0 ||
            [
                "donation_page_evaluated",
                "donation_story_evaluated",
                "donation_images_evaluated",
                "donation_build",
            ].includes(job.status || ""));
    const hasDonationStoryEval =
        job.campaignType === "donation" &&
        (!!(job.donationBackstoryEvaluation || "").trim() ||
            Object.keys(donationBackstoryEval).length > 0);
    const hasDonationImageEval =
        job.campaignType === "donation" &&
        (!!(job.donationReferenceEvaluation || "").trim() ||
            Object.keys(donationReferenceEval).length > 0);

    const hasUserUploadedDonationReferenceImages =
        job.campaignType === "donation"
            ? (job.referenceAssets || []).some(
                  (ref) =>
                      !String(ref.originalName || "").startsWith(
                          "scraped-image-"
                      )
              )
            : false;

    const showDonationReferenceWarning =
        job.campaignType === "donation" &&
        !hasUserUploadedDonationReferenceImages;

    const showDonationInjuryMinimalWarning =
        job.campaignType === "donation" &&
        (job.injury_or_medical_details || "").trim().length < 30;

    const showDonationEmotionalHookInfo =
        job.campaignType === "donation" &&
        !(job.emotional_hook || "").trim();

    const showFreshAnglesBatchCta =
        isDonationBuildStep &&
        job.ads.length >= 5 &&
        remainingFreshAngleCount > 0 &&
        Object.keys(donationBackstoryEval).length > 0 &&
        Object.keys(donationReferenceEval).length > 0;

    return (
        <main
            style={{
                padding: 0,
                maxWidth: 1200,
                margin: "0 auto",
                color: "var(--foreground)",
            }}
        >
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
                <h1 style={{ margin: 0 }}>Campaign Workspace</h1>
                <Link
                    href="/"
                    style={{
                        fontSize: 13,
                        color: "var(--foreground)",
                        textDecoration: "none",
                        opacity: 0.85,
                    }}
                >
                    Back to Campaigns
                </Link>
            </div>

            {variationErrorMessage ? (
                <div
                    style={{
                        marginTop: 16,
                        padding: 14,
                        borderRadius: 14,
                        border: "1px solid #b91c1c",
                        background: "rgba(185, 28, 28, 0.08)",
                    }}
                >
                    <div
                        style={{
                            fontWeight: 900,
                            marginBottom: 8,
                            color: "var(--warning, #b91c1c)",
                        }}
                    >
                        Variation generation failed
                    </div>
                    <div
                        style={{
                            fontSize: 13,
                            lineHeight: 1.5,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                        }}
                    >
                        {variationErrorMessage}
                    </div>
                    <Link
                        href={`/jobs/${id}`}
                        style={{
                            display: "inline-block",
                            marginTop: 12,
                            fontSize: 13,
                            fontWeight: 700,
                            color: "var(--accent)",
                        }}
                    >
                        Dismiss
                    </Link>
                </div>
            ) : null}

            {storyEvalErrorMessage ? (
                <div
                    style={{
                        marginTop: 16,
                        padding: 14,
                        borderRadius: 14,
                        border: "1px solid #b45309",
                        background: "rgba(180, 83, 9, 0.08)",
                    }}
                >
                    <div
                        style={{
                            fontWeight: 900,
                            marginBottom: 8,
                            color: "#b45309",
                        }}
                    >
                        Story evaluation needs a backstory
                    </div>
                    <div
                        style={{
                            fontSize: 13,
                            lineHeight: 1.5,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                        }}
                    >
                        {storyEvalErrorMessage}
                    </div>
                    <Link
                        href={`/jobs/${id}`}
                        style={{
                            display: "inline-block",
                            marginTop: 12,
                            fontSize: 13,
                            fontWeight: 700,
                            color: "var(--accent)",
                        }}
                    >
                        Dismiss
                    </Link>
                </div>
            ) : null}

            {freshBatchStatus === "last" ? (
                <div
                    style={{
                        marginTop: 16,
                        padding: 14,
                        borderRadius: 14,
                        border: "1px solid rgba(124, 58, 237, 0.45)",
                        background: "rgba(124, 58, 237, 0.1)",
                    }}
                >
                    <div
                        style={{
                            fontWeight: 900,
                            marginBottom: 8,
                            color: "var(--accent)",
                        }}
                    >
                        Last batch of fresh angles
                    </div>
                    <div
                        style={{
                            fontSize: 13,
                            lineHeight: 1.55,
                            opacity: 0.95,
                        }}
                    >
                        {freshBatchPartialFlag === "1"
                            ? "This was the final batch — fewer than 5 unused Memory angles remained, so we generated only the ads we could. All Memory angles for this campaign are now used."
                            : "All Memory angles for this campaign are now used. You won’t see “Generate more fresh angles” below anymore."}
                    </div>
                    <Link
                        href={`/jobs/${id}`}
                        style={{
                            display: "inline-block",
                            marginTop: 12,
                            fontSize: 13,
                            fontWeight: 700,
                            color: "var(--accent)",
                        }}
                    >
                        Dismiss
                    </Link>
                </div>
            ) : null}

            {freshBatchStatus === "ok" ? (
                <div
                    style={{
                        marginTop: 16,
                        padding: 12,
                        borderRadius: 14,
                        border: "1px solid var(--border)",
                        background: "var(--surfaceElevated)",
                        fontSize: 13,
                    }}
                >
                    Fresh-angle batch added.{" "}
                    <Link
                        href={`/jobs/${id}`}
                        style={{ fontWeight: 700, color: "var(--accent)" }}
                    >
                        Dismiss
                    </Link>
                </div>
            ) : null}

            {freshBatchError ? (
                <div
                    style={{
                        marginTop: 16,
                        padding: 14,
                        borderRadius: 14,
                        border: "1px solid #b45309",
                        background: "rgba(180, 83, 9, 0.08)",
                    }}
                >
                    <div
                        style={{
                            fontWeight: 900,
                            marginBottom: 8,
                            color: "#b45309",
                        }}
                    >
                        Fresh-angle batch unavailable
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                        {freshBatchError === "noAngles"
                            ? "Add lines to the angle list in Memory → Creative Brain first."
                            : freshBatchError === "exhausted"
                              ? "Every Memory angle has already been used in a batch on this job."
                              : freshBatchError === "plan"
                                ? "Could not build a fresh-angle plan. Try again or check Memory."
                                : freshBatchError}
                    </div>
                    <Link
                        href={`/jobs/${id}`}
                        style={{
                            display: "inline-block",
                            marginTop: 12,
                            fontSize: 13,
                            fontWeight: 700,
                            color: "var(--accent)",
                        }}
                    >
                        Dismiss
                    </Link>
                </div>
            ) : null}

            <div
                style={{
                    marginTop: 20,
                    border: "1px solid var(--border)",
                    padding: 16,
                    borderRadius: 16,
                    background: "var(--surface)",
                }}
            >
                <p>
                    <strong>URL:</strong> {job.url}
                </p>
                <p>
                    <strong>Campaign Type:</strong> {job.campaignType}
                </p>
                <p>
                    <strong>Platform:</strong> {job.platform || "Meta"}
                </p>
                <p>
                    <strong>Funnel Stage:</strong> {job.funnelStage || "Mix"}
                </p>
                <p>
                    <strong>Requested Ads:</strong> {job.numberOfAds || ""}
                </p>
                <p>
                    <strong>Status:</strong> {job.status}
                </p>
                <p>
                    <strong>Total Ads:</strong> {job.ads.length}
                </p>
            </div>

            <div
                style={{
                    marginTop: 24,
                    border: "1px solid var(--border)",
                    padding: 16,
                    borderRadius: 16,
                    background: "var(--surface)",
                }}
            >
                <h2 style={{ margin: 0, fontSize: 16 }}>Scraped Source</h2>

                {showErrorPanel ? (
                    <div
                        style={{
                            marginTop: 12,
                            padding: 12,
                            border: "1px solid #7a1d1d",
                            background: "#1a0b0b",
                            color: "#ffb4b4",
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>
                            Could not generate ad tabs.
                        </div>
                        <div style={{ opacity: 0.95 }}>
                                {fallbackError}
                        </div>
                            {fallbackPreview ? (
                            <div style={{ marginTop: 8, fontSize: 13 }}>
                                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                                    Preview:
                                </div>
                                <div
                                    style={{
                                        padding: 8,
                                        border: "1px solid #7a1d1d",
                                    }}
                                >
                                        {fallbackPreview}
                                </div>
                            </div>
                        ) : null}
                    </div>
                ) : null}

                {showReturnedNote ? (
                    <div
                        style={{
                            marginTop: 12,
                            padding: 12,
                            border: "1px solid #6a4b00",
                            background: "#1a1406",
                            color: "#ffe2a8",
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        Model returned {diagnostics?.returnedAdCount} of{" "}
                        {requestedCount} ads.
                    </div>
                ) : null}

                <div style={{ marginTop: 14 }}>
                    {job.campaignType === "donation" ? (
                        <div
                            style={{
                                marginTop: 16,
                                border: "1px solid var(--border)",
                                borderRadius: 16,
                                padding: 16,
                                background: "var(--surface)",
                            }}
                        >
                            {job.status === "donation_page_eval_error" ? (
                                <div
                                    style={{
                                        marginBottom: 12,
                                        border: "1px solid var(--danger)",
                                        borderRadius: 12,
                                        padding: 10,
                                        background: "rgba(220,38,38,0.08)",
                                        color: "var(--foreground)",
                                        fontSize: 13,
                                        whiteSpace: "pre-wrap",
                                    }}
                                >
                                    Could not analyze fundraiser page.
                                    {job.claudeOutput
                                        ? `\n\n${job.claudeOutput}`
                                        : ""}
                                </div>
                            ) : null}

                            <h3 style={{ margin: 0, marginBottom: 12 }}>
                                Fundraiser: evaluate → create ads (1 or batch of 5)
                            </h3>

                            {displayBackstoryText ? (
                                <div
                                    style={{
                                        marginBottom: 14,
                                        border: "1px solid var(--border)",
                                        borderRadius: 14,
                                        padding: 12,
                                        background: "var(--surfaceElevated)",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight: 900,
                                            marginBottom: 8,
                                        }}
                                    >
                                        Backstory (from fundraiser page)
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            lineHeight: 1.5,
                                            whiteSpace: "pre-wrap",
                                            opacity: 0.92,
                                        }}
                                    >
                                        {displayBackstoryText}
                                    </div>
                                </div>
                            ) : null}

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)",
                                    gap: 12,
                                }}
                            >
                                <div
                                    style={{
                                        border: "1px solid var(--border)",
                                        borderRadius: 14,
                                        padding: 12,
                                        background: "var(--surfaceElevated)",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight: 900,
                                            marginBottom: 8,
                                        }}
                                    >
                                        Page Evaluation
                                    </div>
                                    <pre
                                        style={{
                                            margin: 0,
                                            whiteSpace: "pre-wrap",
                                            fontSize: 12,
                                            lineHeight: 1.45,
                                            opacity: 0.9,
                                        }}
                                    >
                                        {displayPageEvalStr.trim()
                                            ? displayPageEvalStr
                                            : hasDonationPageEval
                                              ? "Page step is marked done but no evaluation text was found. Try “Analyze Fundraiser” again, or run `npx prisma generate` if the DB schema is new."
                                              : "Not analyzed yet."}
                                    </pre>
                                </div>
                                <div
                                    style={{
                                        border: "1px solid var(--border)",
                                        borderRadius: 14,
                                        padding: 12,
                                        background:
                                            "var(--surfaceElevated)",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight: 900,
                                            marginBottom: 8,
                                        }}
                                    >
                                        Backstory Evaluation
                                    </div>
                                    <pre
                                        style={{
                                            margin: 0,
                                            whiteSpace: "pre-wrap",
                                            fontSize: 12,
                                            lineHeight: 1.45,
                                            opacity: 0.9,
                                        }}
                                    >
                                        {displayStoryEvalStr.trim()
                                            ? displayStoryEvalStr
                                            : dwSnap?.storyEvaluationError
                                              ? `Story evaluation did not complete:\n${String(dwSnap.storyEvaluationError)}\n\nUse “Evaluate Story” below.`
                                              : "Not evaluated yet."}
                                    </pre>
                                </div>

                                <div
                                    style={{
                                        border: "1px solid var(--border)",
                                        borderRadius: 14,
                                        padding: 12,
                                        background:
                                            "var(--surfaceElevated)",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight: 900,
                                            marginBottom: 8,
                                        }}
                                    >
                                        Reference Image Evaluation
                                    </div>
                                    <pre
                                        style={{
                                            margin: 0,
                                            whiteSpace: "pre-wrap",
                                            fontSize: 12,
                                            lineHeight: 1.45,
                                            opacity: 0.9,
                                        }}
                                    >
                                        {dwSnap?.referenceEvaluationError
                                            ? String(dwSnap.referenceEvaluationError)
                                            : displayReferenceEvalStr.trim()
                                              ? displayReferenceEvalStr
                                              : hasDonationImageEval
                                                ? "Image step is marked done but no evaluation text was found. Try “Evaluate Images” again."
                                                : "Not evaluated yet."}
                                    </pre>
                                </div>
                            </div>

                            {!hasDonationPageEval ? (
                                <form action={analyzeDonationFundraiser} style={{ marginTop: 12 }}>
                                    <input type="hidden" name="jobId" value={job.id} />
                                    <button
                                        type="submit"
                                        style={{
                                            width: "100%",
                                            padding: "10px 14px",
                                            borderRadius: 12,
                                            border: "1px solid var(--borderStrong)",
                                            background: "var(--accent)",
                                            color: "#fff",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Analyze Fundraiser
                                    </button>
                                </form>
                            ) : null}

                            {hasDonationPageEval && !hasDonationStoryEval ? (
                                <form action={evaluateDonationStory} style={{ marginTop: 12 }}>
                                    <input type="hidden" name="jobId" value={job.id} />
                                    <label style={{ fontSize: 13, fontWeight: 800 }}>
                                        Backstory
                                    </label>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            opacity: 0.75,
                                            marginTop: 4,
                                        }}
                                    >
                                        Pulled from the fundraiser page where possible. Edit
                                        before evaluating if you need to correct details.
                                    </div>
                                    <textarea
                                        name="backstory"
                                        defaultValue={
                                            displayBackstoryText ||
                                            job.backstory_summary ||
                                            ""
                                        }
                                        style={{
                                            width: "100%",
                                            minHeight: 120,
                                            marginTop: 8,
                                            padding: 10,
                                            borderRadius: 12,
                                            border: "1px solid var(--border)",
                                            background: "var(--surfaceElevated)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        style={{
                                            marginTop: 10,
                                            width: "100%",
                                            padding: "10px 14px",
                                            borderRadius: 12,
                                            border: "1px solid var(--borderStrong)",
                                            background: "var(--accent)",
                                            color: "#fff",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Evaluate Story
                                    </button>
                                </form>
                            ) : null}

                            {hasDonationStoryEval ? (
                                <details
                                    style={{
                                        marginTop: 12,
                                        border: "1px solid var(--border)",
                                        borderRadius: 12,
                                        padding: "8px 12px",
                                        background: "var(--surfaceElevated)",
                                    }}
                                >
                                    <summary
                                        style={{
                                            cursor: "pointer",
                                            fontWeight: 800,
                                            fontSize: 13,
                                        }}
                                    >
                                        Edit backstory &amp; re-evaluate
                                    </summary>
                                    <form
                                        action={evaluateDonationStory}
                                        style={{ marginTop: 10 }}
                                    >
                                        <input type="hidden" name="jobId" value={job.id} />
                                        <textarea
                                            name="backstory"
                                            defaultValue={
                                                displayBackstoryText ||
                                                job.backstory_summary ||
                                                ""
                                            }
                                            style={{
                                                width: "100%",
                                                minHeight: 100,
                                                marginTop: 4,
                                                padding: 10,
                                                borderRadius: 12,
                                                border: "1px solid var(--border)",
                                                background: "var(--surface)",
                                                color: "var(--foreground)",
                                            }}
                                        />
                                        <button
                                            type="submit"
                                            style={{
                                                marginTop: 8,
                                                padding: "8px 12px",
                                                borderRadius: 10,
                                                border: "1px solid var(--borderStrong)",
                                                background: "var(--accent)",
                                                color: "#fff",
                                                cursor: "pointer",
                                                fontSize: 13,
                                            }}
                                        >
                                            Re-evaluate story
                                        </button>
                                    </form>
                                </details>
                            ) : null}

                            {hasDonationStoryEval && !hasDonationImageEval ? (
                                <div style={{ marginTop: 12 }}>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 800,
                                            marginBottom: 8,
                                        }}
                                    >
                                        Reference images
                                    </div>
                                    <p
                                        style={{
                                            fontSize: 12,
                                            opacity: 0.82,
                                            lineHeight: 1.45,
                                            marginTop: 0,
                                            marginBottom: 10,
                                        }}
                                    >
                                        Add one or more photos (× removes). Up to{" "}
                                        {MAX_JOB_SHARED_REFERENCE_IMAGES} total. Then
                                        add optional descriptions in order and run
                                        evaluate.
                                    </p>
                                    {donationSharedReferenceAssets.length > 0 ? (
                                        <div
                                            style={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                gap: 10,
                                                marginBottom: 14,
                                            }}
                                        >
                                            {donationSharedReferenceAssets.map((ref) => (
                                                <ReferenceImageChip
                                                    key={ref.id}
                                                    asset={{
                                                        id: ref.id,
                                                        filePath: ref.filePath,
                                                        originalName:
                                                            ref.originalName,
                                                    }}
                                                    jobId={job.id}
                                                    adId={null}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div
                                            style={{
                                                fontSize: 12,
                                                opacity: 0.75,
                                                marginBottom: 12,
                                            }}
                                        >
                                            No images yet — add at least one below.
                                        </div>
                                    )}

                                    <form
                                        action={appendJobSharedReferenceImages}
                                        style={{
                                            marginBottom: 16,
                                            padding: 12,
                                            borderRadius: 12,
                                            border: "1px dashed var(--borderStrong)",
                                            background: "var(--surfaceElevated)",
                                        }}
                                    >
                                        <input
                                            type="hidden"
                                            name="jobId"
                                            value={job.id}
                                        />
                                        <label
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 700,
                                                display: "block",
                                                marginBottom: 6,
                                            }}
                                        >
                                            Add image(s)
                                        </label>
                                        <input
                                            type="file"
                                            name="referenceFiles"
                                            multiple
                                            accept="image/png,image/jpeg,image/webp,image/*"
                                            style={{ width: "100%" }}
                                        />
                                        <button
                                            type="submit"
                                            style={{
                                                marginTop: 10,
                                                padding: "8px 14px",
                                                borderRadius: 10,
                                                border:
                                                    "1px solid var(--borderStrong)",
                                                background: "var(--accent)",
                                                color: "#fff",
                                                cursor: "pointer",
                                                fontWeight: 700,
                                            }}
                                        >
                                            Save uploads
                                        </button>
                                    </form>

                                    <form action={evaluateDonationImages}>
                                        <input
                                            type="hidden"
                                            name="jobId"
                                            value={job.id}
                                        />
                                        <div
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 700,
                                                marginBottom: 6,
                                            }}
                                        >
                                            Descriptions (optional, same order as
                                            images left → right)
                                        </div>
                                        <div
                                            style={{
                                                display: "grid",
                                                gap: 8,
                                            }}
                                        >
                                            {donationSharedReferenceAssets.length >
                                            0 ? (
                                                donationSharedReferenceAssets.map(
                                                    (ref, idx) => (
                                                        <input
                                                            key={ref.id}
                                                            type="text"
                                                            name="reference_image_descriptions[]"
                                                            defaultValue={
                                                                (
                                                                    ref as {
                                                                        description?:
                                                                            | string
                                                                            | null;
                                                                    }
                                                                ).description ||
                                                                ""
                                                            }
                                                            placeholder={`Image ${idx + 1} description (optional)`}
                                                            style={{
                                                                width: "100%",
                                                                padding: 8,
                                                                borderRadius: 10,
                                                                border: "1px solid var(--border)",
                                                                background:
                                                                    "var(--surfaceElevated)",
                                                                color: "var(--foreground)",
                                                            }}
                                                        />
                                                    )
                                                )
                                            ) : (
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        opacity: 0.75,
                                                    }}
                                                >
                                                    Add images first to attach
                                                    descriptions.
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={
                                                donationSharedReferenceAssets.length ===
                                                0
                                            }
                                            style={{
                                                marginTop: 10,
                                                width: "100%",
                                                padding: "10px 14px",
                                                borderRadius: 12,
                                                border:
                                                    "1px solid var(--borderStrong)",
                                                background:
                                                    donationSharedReferenceAssets.length ===
                                                    0
                                                        ? "var(--border)"
                                                        : "var(--accent)",
                                                color: "#fff",
                                                cursor:
                                                    donationSharedReferenceAssets.length ===
                                                    0
                                                        ? "not-allowed"
                                                        : "pointer",
                                                opacity:
                                                    donationSharedReferenceAssets.length ===
                                                    0
                                                        ? 0.6
                                                        : 1,
                                            }}
                                        >
                                            Evaluate images
                                        </button>
                                    </form>
                                </div>
                            ) : null}

                            {Object.keys(donationBackstoryEval).length > 0 &&
                            Object.keys(donationReferenceEval).length > 0 &&
                            !isDonationBuildStep ? (
                                <form
                                    action={goToDonationAdBuilder}
                                    style={{ marginTop: 12 }}
                                >
                                    <input
                                        type="hidden"
                                        name="jobId"
                                        value={job.id}
                                    />
                                    <button
                                        type="submit"
                                        style={{
                                            width: "100%",
                                            padding: "10px 14px",
                                            borderRadius: 12,
                                            border:
                                                "1px solid var(--borderStrong)",
                                            background: "var(--accent)",
                                            color: "#fff",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Next
                                    </button>
                                </form>
                            ) : null}

                            {Object.keys(donationBackstoryEval).length > 0 &&
                            Object.keys(donationReferenceEval).length > 0 &&
                            isDonationBuildStep ? (
                                <details
                                    style={{ marginTop: 14 }}
                                    open
                                >
                                    <summary
                                        style={{
                                            cursor: "pointer",
                                            fontWeight: 900,
                                            opacity: 0.95,
                                            marginBottom: 10,
                                        }}
                                    >
                                        Generate ads (auto from Creative Brain)
                                    </summary>

                                    <p
                                        style={{
                                            fontSize: 13,
                                            opacity: 0.85,
                                            lineHeight: 1.5,
                                            marginTop: 0,
                                            marginBottom: 12,
                                        }}
                                    >
                                        Templates, angles, VAR hints, and winning-prompt
                                        seeds are picked randomly from{" "}
                                        <Link href="/memory">Memory → Creative Brain</Link>.
                                        After generation, the blueprint for that run
                                        appears under <strong>Ad tabs</strong>. Use{" "}
                                        <strong>Generate variations</strong> on each ad
                                        for optional tweaks.
                                    </p>

                                    <form action={generateFundraiserFiveAds}>
                                        <input
                                            type="hidden"
                                            name="jobId"
                                            value={job.id}
                                        />

                                        <div style={{ marginTop: 4 }}>
                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    fontWeight: 800,
                                                    opacity: 0.9,
                                                    marginBottom: 8,
                                                }}
                                            >
                                                Reference images (for Kie)
                                            </div>
                                            {donationSharedReferenceAssets.length > 0 ? (
                                                <div
                                                    style={{
                                                        display: "grid",
                                                        gap: 6,
                                                    }}
                                                >
                                                    {donationSharedReferenceAssets.map(
                                                        (ref) => (
                                                            <label
                                                                key={ref.id}
                                                                style={{
                                                                    fontSize: 12,
                                                                    opacity: 0.92,
                                                                    display: "flex",
                                                                    gap: 8,
                                                                    alignItems: "center",
                                                                }}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    name="selectedReferenceIds"
                                                                    value={ref.id}
                                                                    defaultChecked
                                                                />
                                                                {ref.originalName}
                                                                {(ref as { description?: string | null })
                                                                    .description
                                                                    ? ` — ${(ref as { description?: string | null }).description}`
                                                                    : ""}
                                                            </label>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: 12, opacity: 0.8 }}>
                                                    No shared references found. Upload references on the create page.
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            style={{
                                                marginTop: 14,
                                                width: "100%",
                                                padding: "12px 14px",
                                                borderRadius: 12,
                                                border:
                                                    "1px solid var(--borderStrong)",
                                                background: "var(--accent)",
                                                color: "#fff",
                                                cursor: "pointer",
                                                fontWeight: 700,
                                            }}
                                        >
                                            Generate 5 ads (one Claude call)
                                        </button>
                                    </form>
                                </details>
                            ) : null}
                        </div>
                    ) : null}

                </div>
            </div>

            {job.ads.length > 0 && job.campaignType === "donation" ? (
                <div
                    style={{
                        marginTop: 24,
                        border: "1px solid var(--border)",
                        padding: 16,
                        borderRadius: 16,
                        background: "var(--surface)",
                    }}
                >
                    <h2 style={{ marginTop: 0 }}>Reference images (all ads)</h2>
                    <p style={{ opacity: 0.85, marginBottom: 12, fontSize: 13 }}>
                        Each thumbnail has × to remove. Add more with the file picker
                        (saved on submit). Max {MAX_JOB_SHARED_REFERENCE_IMAGES} images.
                        These are shared when an ad tab has no ad-specific refs.
                    </p>

                    {job.referenceAssets.filter((r) => !r.adId).length > 0 ? (
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 10,
                                marginBottom: 16,
                            }}
                        >
                            {job.referenceAssets
                                .filter((r) => !r.adId)
                                .map((ref) => (
                                    <ReferenceImageChip
                                        key={ref.id}
                                        asset={{
                                            id: ref.id,
                                            filePath: ref.filePath,
                                            originalName: ref.originalName,
                                        }}
                                        jobId={job.id}
                                        adId={null}
                                    />
                                ))}
                        </div>
                    ) : (
                        <div
                            style={{
                                fontSize: 13,
                                opacity: 0.75,
                                marginBottom: 14,
                            }}
                        >
                            No shared references yet.
                        </div>
                    )}

                    <form action={appendJobSharedReferenceImages}>
                        <input type="hidden" name="jobId" value={job.id} />
                        <label
                            style={{
                                fontSize: 13,
                                fontWeight: 700,
                                display: "block",
                                marginBottom: 6,
                            }}
                        >
                            Add image(s)
                        </label>
                        <input
                            type="file"
                            name="referenceFiles"
                            multiple
                            accept="image/*"
                            style={{
                                width: "100%",
                                padding: 14,
                                border: "2px dashed var(--borderStrong)",
                                background: "var(--surfaceElevated)",
                                color: "var(--foreground)",
                                borderRadius: 12,
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                marginTop: 12,
                                padding: "10px 14px",
                                borderRadius: 10,
                                border: "1px solid var(--borderStrong)",
                                background: "var(--accent)",
                                color: "#fff",
                                cursor: "pointer",
                                fontWeight: 700,
                            }}
                        >
                            Save uploads
                        </button>
                    </form>
                </div>
            ) : null}

            {job.ads.length > 0 ? (
                <div style={{ marginTop: 24 }}>
                    <h2>Ad Tabs</h2>
                    {job.campaignType === "donation" ? (
                        <div
                            style={{
                                marginBottom: 16,
                                border: "1px solid var(--border)",
                                borderRadius: 16,
                                padding: 14,
                                background: "var(--surfaceElevated)",
                            }}
                        >
                            {showDonationReferenceWarning ? (
                                <div
                                    style={{
                                        marginBottom: 10,
                                        color: "var(--warning)",
                                        fontSize: 13,
                                        fontWeight: 700,
                                    }}
                                >
                                    ⚠️ These prompts will generate a generic subject.
                                    Upload reference photos and regenerate for best
                                    results.
                                </div>
                            ) : null}
                            {showDonationInjuryMinimalWarning ? (
                                <div
                                    style={{
                                        marginBottom: 10,
                                        color: "var(--warning)",
                                        fontSize: 13,
                                        fontWeight: 700,
                                    }}
                                >
                                    ⚠️ Injury details were minimal. Add more
                                    specific injury information and regenerate for
                                    stronger emotional impact.
                                </div>
                            ) : null}
                            {showDonationEmotionalHookInfo ? (
                                <div
                                    style={{
                                        color: "var(--accent)",
                                        fontSize: 13,
                                        fontWeight: 700,
                                    }}
                                >
                                    💡 Add an emotional hook detail and regenerate to
                                    unlock stronger text overlay copy.
                                </div>
                            ) : null}
                            {lastAutoBatchPlan &&
                            lastAutoBatchPlan.length > 0 ? (
                                <div
                                    style={{
                                        marginTop: 12,
                                        border: "1px solid var(--border)",
                                        borderRadius: 14,
                                        padding: 12,
                                        background: "rgba(124, 58, 237, 0.06)",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight: 900,
                                            marginBottom: 6,
                                            fontSize: 14,
                                        }}
                                    >
                                        Last auto batch blueprint
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            opacity: 0.82,
                                            marginBottom: 10,
                                            lineHeight: 1.45,
                                        }}
                                    >
                                        What was randomly chosen from{" "}
                                        <Link href="/memory">Creative Brain</Link> for
                                        the latest &quot;Generate 5 ads&quot; run
                                        (templates, angles, VARs, winning-prompt
                                        seeds). Matches ad tabs in numeric order from
                                        that run.
                                    </div>
                                    <ol
                                        style={{
                                            margin: 0,
                                            paddingLeft: 18,
                                            fontSize: 12,
                                            lineHeight: 1.55,
                                        }}
                                    >
                                        {lastAutoBatchPlan.map((slot: FundraiserBatchPlanSlot) => (
                                            <li
                                                key={slot.slotIndex}
                                                style={{ marginBottom: 10 }}
                                            >
                                                <strong>
                                                    Slot {slot.slotIndex}:{" "}
                                                    {slot.templateLabel}
                                                </strong>
                                                {slot.angleLine ? (
                                                    <div>
                                                        Angle: {slot.angleLine}
                                                    </div>
                                                ) : null}
                                                {slot.varKeys &&
                                                slot.varKeys.length > 0 ? (
                                                    <div>
                                                        VARs:{" "}
                                                        {slot.varKeys.join(", ")}
                                                    </div>
                                                ) : (
                                                    <div>VARs: (none)</div>
                                                )}
                                                {slot.winningPromptSeed ? (
                                                    <div
                                                        style={{
                                                            opacity: 0.88,
                                                            marginTop: 4,
                                                            whiteSpace: "pre-wrap",
                                                        }}
                                                    >
                                                        Winning seed:{" "}
                                                        {slot.winningPromptSeed.length >
                                                        200
                                                            ? `${slot.winningPromptSeed.slice(0, 200)}…`
                                                            : slot.winningPromptSeed}
                                                    </div>
                                                ) : null}
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                    <div style={{ marginTop: 12, display: "grid", gap: 16 }}>
                        {job.ads.map((ad) => {
                            type AdTabSource = {
                                headline?: string;
                                primaryText?: string;
                                cta?: string;
                                angle?: string;
                                hook?: string;
                                visualPrompt?: string;
                            };

                            const source = tryParseJson(
                                ad.sourceBlock
                            ) as AdTabSource | null;

                            const headline = source?.headline;
                            const primaryText = source?.primaryText;
                            const cta = source?.cta;
                            const angle = source?.angle;
                            const hook = source?.hook;

                            const sourceVisualPrompt =
                                typeof source?.visualPrompt === "string"
                                    ? source.visualPrompt
                                    : "";

                            const editedPromptRaw =
                                typeof ad.editedPrompt === "string"
                                    ? ad.editedPrompt
                                    : sourceVisualPrompt;

                            const extractKieImagePrompt = (
                                visualPrompt: string
                            ) => {
                                if (
                                    visualPrompt.includes(
                                        "KIE_IMAGE_PROMPT:"
                                    ) &&
                                    visualPrompt.includes(
                                        "|| KLING_ANIMATION_PROMPT:"
                                    )
                                ) {
                                    const afterKie =
                                        visualPrompt.split(
                                            "KIE_IMAGE_PROMPT:"
                                        )[1] || "";
                                    const kiePart = afterKie.split(
                                        "|| KLING_ANIMATION_PROMPT:"
                                    )[0];
                                    return kiePart.trim();
                                }
                                return (visualPrompt || "").trim();
                            };

                            const extractKlingAnimationPrompt = (
                                visualPrompt: string
                            ) => {
                                if (
                                    visualPrompt.includes(
                                        "KIE_IMAGE_PROMPT:"
                                    ) &&
                                    visualPrompt.includes(
                                        "|| KLING_ANIMATION_PROMPT:"
                                    )
                                ) {
                                    const afterMarker =
                                        visualPrompt.split(
                                            "|| KLING_ANIMATION_PROMPT:"
                                        )[1] || "";
                                    return afterMarker.trim();
                                }
                                return "";
                            };

                            const isKlingVideoReady =
                                sourceVisualPrompt.includes(
                                    "KIE_IMAGE_PROMPT:"
                                ) &&
                                sourceVisualPrompt.includes(
                                    "|| KLING_ANIMATION_PROMPT:"
                                );

                            const developedPrompt = extractKieImagePrompt(
                                editedPromptRaw || ""
                            );
                            const klingAnimationPrompt = isKlingVideoReady
                                ? extractKlingAnimationPrompt(sourceVisualPrompt)
                                : "";

                            const angleParts = (angle || "").split(" — ");
                            const donationStyleLabel =
                                angleParts[0] || angle || "";
                            const donationConceptName = angleParts
                                .slice(1)
                                .join(" — ");

                            const adSpecificReferenceAssets =
                                job.referenceAssets.filter(
                                    (r) => r.adId === ad.id
                                );
                            const sharedReferenceAssets =
                                job.referenceAssets.filter(
                                    (r) => r.adId === null
                                );
                            const effectiveReferenceAssets =
                                adSpecificReferenceAssets.length > 0
                                    ? adSpecificReferenceAssets
                                    : sharedReferenceAssets;

                            const usingAdSpecificRefs =
                                adSpecificReferenceAssets.length > 0;

                            const statusColor =
                                ad.status === "images_generated"
                                    ? "#0f766e"
                                    : ad.status === "generating_images"
                                      ? "#1d4ed8"
                                      : ad.status === "kie_error"
                                        ? "#b91c1c"
                                        : "#475569";

                            return (
                                <details
                                    key={ad.id}
                                    open={ad.adNumber === 1}
                                    style={{
                                        border: "1px solid var(--border)",
                                        borderRadius: 14,
                                        padding: 16,
                                        background: "var(--surface)",
                                        boxShadow:
                                            "0 1px 10px rgba(0, 0, 0, 0.25)",
                                    }}
                                >
                                    <summary
                                        style={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: 10,
                                            listStyle: "none",
                                            cursor: "pointer",
                                            fontWeight: 800,
                                            color: "var(--foreground)",
                                            marginBottom: 12,
                                        }}
                                    >
                                        <span>
                                            Ad {ad.adNumber}{" "}
                                            <span
                                                style={{
                                                    fontWeight: 700,
                                                    color: statusColor,
                                                }}
                                            >
                                                • {ad.status}
                                            </span>
                                        </span>
                                        <AdCollapsibleHeaderActions
                                            jobId={job.id}
                                            adId={ad.id}
                                            aspectSelectHeaderId={`aspect-header-${ad.id}`}
                                            generateAdImages={generateAdImages}
                                            firstImageUrl={
                                                ad.images[0]?.url ?? null
                                            }
                                            firstImageDownloadName={
                                                ad.images[0]
                                                    ? `SacredStatics-ad-${job.id.slice(0, 8)}-${ad.adNumber}-${ad.images[0].id.slice(-6)}`
                                                    : ""
                                            }
                                        />
                                    </summary>

                                    {job.campaignType === "donation" ? (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                justifyContent:
                                                    "space-between",
                                                gap: 12,
                                                marginBottom: 10,
                                            }}
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        fontWeight: 900,
                                                        marginBottom: 4,
                                                    }}
                                                >
                                                    {donationStyleLabel ||
                                                        "—"}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 13,
                                                        opacity: 0.85,
                                                        marginBottom: 6,
                                                    }}
                                                >
                                                    {donationConceptName ||
                                                        ""}
                                                </div>
                                                <div style={{ fontSize: 12, opacity: 0.8 }}>
                                                    {developedPrompt.length} chars
                                                </div>
                                            </div>
                                            <div>
                                                <CopyToClipboardButton
                                                    text={developedPrompt}
                                                    label="Copy"
                                                />
                                            </div>
                                        </div>
                                    ) : null}

                                    <div style={{ fontSize: 13, opacity: 0.95 }}>
                                        <div>
                                            <strong>Angle:</strong>{" "}
                                            {angle || "—"}
                                        </div>
                                        <div>
                                            <strong>Hook:</strong>{" "}
                                            {hook || "—"}
                                        </div>
                                        <div>
                                            <strong>Headline:</strong>{" "}
                                            {headline || "—"}
                                        </div>
                                        <div>
                                            <strong>Primary:</strong>{" "}
                                            {primaryText || "—"}
                                        </div>
                                        <div>
                                            <strong>CTA:</strong>{" "}
                                            {cta || "—"}
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 16 }}>
                                        <h4 style={{ margin: "0 0 8px 0" }}>
                                            Developed Prompt (editable)
                                        </h4>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                opacity: 0.78,
                                                lineHeight: 1.45,
                                                marginBottom: 10,
                                            }}
                                        >
                                            Workflow: edit &amp; save → references
                                            &amp; aspect below → generate → refine
                                            (Kling / variations) → optionally save
                                            this tab to Memory at the bottom.
                                        </div>
                                        <form action={saveAdPromptAndReferences}>
                                            <input
                                                type="hidden"
                                                name="jobId"
                                                value={job.id}
                                            />
                                            <input
                                                type="hidden"
                                                name="adId"
                                                value={ad.id}
                                            />
                                            <textarea
                                                id={`ad-edited-prompt-${ad.id}`}
                                                name="editedPrompt"
                                                defaultValue={developedPrompt}
                                                style={{
                                                    width: "100%",
                                                    minHeight: 180,
                                                    padding: 12,
                                                    background: "black",
                                                    color: "white",
                                                    border: "1px solid #444",
                                                }}
                                            />
                                            <div style={{ marginTop: 10 }}>
                                                <button
                                                    type="submit"
                                                    style={{
                                                        padding:
                                                            "8px 12px",
                                                        borderRadius: 10,
                                                        border:
                                                            "1px solid var(--borderStrong)",
                                                        background:
                                                            "var(--surfaceElevated)",
                                                        color: "var(--foreground)",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    Save Prompt
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    <div
                                        style={{
                                            marginTop: 20,
                                            padding: 14,
                                            borderRadius: 14,
                                            border: "1px solid var(--border)",
                                            background: "var(--surfaceElevated)",
                                        }}
                                    >
                                        <h4 style={{ margin: "0 0 10px 0" }}>
                                            Reference images → aspect ratio →
                                            generate
                                        </h4>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                opacity: 0.85,
                                                marginBottom: 10,
                                                lineHeight: 1.45,
                                            }}
                                        >
                                            Set references and ratio, then run
                                            Kie.
                                            {ad.adNumber === 1 ? (
                                                <>
                                                    {" "}
                                                    On <strong>Ad 1</strong>, open{" "}
                                                    <strong>
                                                        Variation options →
                                                        preview → new ad tab
                                                    </strong>{" "}
                                                    below to fork copy (preview
                                                    first, then save tabs).
                                                </>
                                            ) : (
                                                <>
                                                    {" "}
                                                    New angles from{" "}
                                                    <strong>Ad 1</strong>: switch
                                                    to that tab and use{" "}
                                                    <strong>
                                                        Variation options
                                                    </strong>{" "}
                                                    under its Kie button.
                                                </>
                                            )}{" "}
                                            After an image, open{" "}
                                            <strong>
                                                Refine this ad → Kling-ready
                                                &amp; animation
                                            </strong>{" "}
                                            below for Kling-ready.
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                opacity: 0.9,
                                                marginBottom: 8,
                                            }}
                                        >
                                            {effectiveReferenceAssets.length >
                                            0 ? (
                                                <>
                                                    {effectiveReferenceAssets.length}{" "}
                                                    image
                                                    {effectiveReferenceAssets.length ===
                                                    1
                                                        ? ""
                                                        : "s"}{" "}
                                                    {usingAdSpecificRefs
                                                        ? "for this ad (× removes)"
                                                        : "(shared job refs — × removes from job)"}{" "}
                                                </>
                                            ) : (
                                                <>
                                                    No references — add for this ad
                                                    below (max {MAX_AD_REFERENCE_IMAGES}
                                                    ), or use shared job refs.
                                                </>
                                            )}
                                        </div>

                                        {effectiveReferenceAssets.length >
                                        0 ? (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 10,
                                                    flexWrap: "wrap",
                                                    marginBottom: 12,
                                                }}
                                            >
                                                {effectiveReferenceAssets.map(
                                                    (ref) => (
                                                        <ReferenceImageChip
                                                            key={ref.id}
                                                            asset={{
                                                                id: ref.id,
                                                                filePath:
                                                                    ref.filePath,
                                                                originalName:
                                                                    ref.originalName,
                                                            }}
                                                            jobId={job.id}
                                                            adId={
                                                                usingAdSpecificRefs
                                                                    ? ad.id
                                                                    : null
                                                            }
                                                        />
                                                    )
                                                )}
                                            </div>
                                        ) : null}

                                        <form action={appendAdReferenceImages}>
                                            <input
                                                type="hidden"
                                                name="jobId"
                                                value={job.id}
                                            />
                                            <input
                                                type="hidden"
                                                name="adId"
                                                value={ad.id}
                                            />
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    marginBottom: 6,
                                                }}
                                            >
                                                Add image(s) for this ad only
                                            </div>
                                            <div style={{ marginBottom: 10 }}>
                                                <input
                                                    type="file"
                                                    name="referenceFiles"
                                                    multiple
                                                    accept="image/*"
                                                    style={{
                                                        width: "100%",
                                                        padding: 10,
                                                        borderRadius: 12,
                                                        border:
                                                            "1px dashed var(--borderStrong)",
                                                        background:
                                                            "var(--surfaceElevated)",
                                                        color: "var(--foreground)",
                                                    }}
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                style={{
                                                    padding: "8px 12px",
                                                    borderRadius: 10,
                                                    border:
                                                        "1px solid var(--borderStrong)",
                                                    background: "var(--accent)",
                                                    color: "#fff",
                                                    cursor: "pointer",
                                                    width: "100%",
                                                    fontWeight: 700,
                                                }}
                                            >
                                                Save uploads
                                            </button>
                                        </form>

                                        <form action={generateAdImages}>
                                            <input
                                                type="hidden"
                                                name="jobId"
                                                value={job.id}
                                            />
                                            <input
                                                type="hidden"
                                                name="adId"
                                                value={ad.id}
                                            />
                                            <div style={{ marginBottom: 10 }}>
                                                <label
                                                    htmlFor={`aspect-body-${ad.id}`}
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: 700,
                                                        opacity: 0.9,
                                                    }}
                                                >
                                                    Aspect Ratio
                                                </label>
                                                <br />
                                                <select
                                                    id={`aspect-body-${ad.id}`}
                                                    name="adAspectRatio"
                                                    defaultValue="1:1"
                                                    style={{
                                                        width: 220,
                                                        padding: 8,
                                                        marginTop: 8,
                                                        background:
                                                            "var(--surfaceElevated)",
                                                        color: "var(--foreground)",
                                                        border: "1px solid var(--border)",
                                                    }}
                                                >
                                                    <option value="1:1">
                                                        1080x1080 (1:1)
                                                    </option>
                                                    <option value="9:16">
                                                        9:16 (TT/Reels)
                                                    </option>
                                                </select>
                                            </div>
                                            <button
                                                type="submit"
                                                style={{
                                                    padding: "10px 14px",
                                                    borderRadius: 10,
                                                    border:
                                                        "1px solid rgba(124, 58, 237, 0.35)",
                                                    background: "var(--accent)",
                                                    color: "#fff",
                                                    cursor: "pointer",
                                                    width: "100%",
                                                    fontWeight: 700,
                                                }}
                                            >
                                                Generate This Ad with Kie
                                            </button>
                                        </form>

                                        {ad.adNumber === 1 ? (
                                            <AdVariationPanel
                                                jobId={job.id}
                                                adId={ad.id}
                                                showKlingOption={
                                                    job.campaignType ===
                                                    "donation"
                                                }
                                            />
                                        ) : null}
                                    </div>

                                    <div style={{ marginTop: 20 }}>
                                        <h4 style={{ margin: "0 0 8px 0" }}>
                                            Generated images
                                        </h4>
                                        {ad.images.length > 0 ? (
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    opacity: 0.72,
                                                    marginBottom: 10,
                                                }}
                                            >
                                                Previews are scaled for review.
                                                Save image downloads the full-resolution
                                                file.
                                            </div>
                                        ) : null}
                                        {ad.images.length === 0 ? (
                                            <div style={{ opacity: 0.85 }}>
                                                No generated images yet.
                                            </div>
                                        ) : (
                                            <div
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns:
                                                        "repeat(auto-fit, minmax(260px, 320px))",
                                                    gap: 16,
                                                    justifyContent: "start",
                                                }}
                                            >
                                                {ad.images.map((image) => (
                                                    <div
                                                        key={image.id}
                                                        style={{
                                                            border:
                                                                "1px solid var(--border)",
                                                            padding: 12,
                                                            borderRadius: 12,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                                minHeight: 120,
                                                                padding: 8,
                                                                borderRadius: 8,
                                                                background:
                                                                    "var(--surfaceElevated)",
                                                            }}
                                                        >
                                                            <img
                                                                src={image.url}
                                                                alt={`Ad ${ad.adNumber}`}
                                                                style={{
                                                                    maxWidth:
                                                                        "min(100%, 280px)",
                                                                    maxHeight:
                                                                        "min(52vh, 420px)",
                                                                    width: "auto",
                                                                    height: "auto",
                                                                    objectFit:
                                                                        "contain",
                                                                    display:
                                                                        "block",
                                                                }}
                                                            />
                                                        </div>
                                                        <SaveImageButton
                                                            imageUrl={image.url}
                                                            downloadName={`SacredStatics-ad-${job.id.slice(0, 8)}-${ad.adNumber}-${image.id.slice(-6)}`}
                                                        />
                                                        <div
                                                            style={{
                                                                marginTop: 8,
                                                                fontSize: 12,
                                                                wordBreak: "break-all",
                                                                opacity: 0.9,
                                                            }}
                                                        >
                                                            {image.url}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <details
                                        style={{
                                            marginTop: 22,
                                            padding: 12,
                                            borderRadius: 14,
                                            border: "1px solid var(--border)",
                                            background: "var(--surfaceElevated)",
                                        }}
                                    >
                                        <summary
                                            style={{
                                                cursor: "pointer",
                                                fontWeight: 800,
                                                fontSize: 14,
                                                listStyle: "none",
                                            }}
                                        >
                                            Refine this ad → Kling-ready &amp;
                                            animation (optional)
                                        </summary>
                                        <div style={{ marginTop: 14 }}>
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    opacity: 0.82,
                                                    lineHeight: 1.45,
                                                    marginBottom: 14,
                                                }}
                                            >
                                                After generating with Kie, go
                                                Kling-ready for video packs. Fork
                                                new ad tabs from{" "}
                                                <strong>Ad 1</strong> via{" "}
                                                <strong>Variation options</strong>{" "}
                                                under its Kie button. Save prompt
                                                edits first if you changed the Kie
                                                block.
                                            </div>

                                            {job.campaignType === "donation" ? (
                                                <div
                                                    style={{
                                                        marginBottom: 16,
                                                        padding: 12,
                                                        borderRadius: 12,
                                                        border: "1px solid var(--border)",
                                                        background:
                                                            "var(--surface)",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: 12,
                                                            opacity: 0.85,
                                                            lineHeight: 1.45,
                                                            marginBottom: 10,
                                                        }}
                                                    >
                                                        <strong>Kling ready</strong>{" "}
                                                        — hyper-real{" "}
                                                        <code>
                                                            KIE_IMAGE_PROMPT
                                                        </code>{" "}
                                                        still +{" "}
                                                        <code>
                                                            KLING_ANIMATION_PROMPT
                                                        </code>
                                                        . For more control, use{" "}
                                                        <em>Kling-ready pack</em>{" "}
                                                        in{" "}
                                                        <strong>
                                                            Variation options
                                                        </strong>{" "}
                                                        on the{" "}
                                                        <strong>Ad 1</strong> tab
                                                        (under Kie).
                                                    </div>
                                                    <form
                                                        action={makeAdKlingReady}
                                                    >
                                                        <input
                                                            type="hidden"
                                                            name="jobId"
                                                            value={job.id}
                                                        />
                                                        <input
                                                            type="hidden"
                                                            name="adId"
                                                            value={ad.id}
                                                        />
                                                        <button
                                                            type="submit"
                                                            style={{
                                                                padding:
                                                                    "10px 14px",
                                                                borderRadius: 10,
                                                                border:
                                                                    "1px solid rgba(124, 58, 237, 0.45)",
                                                                background:
                                                                    "var(--accent)",
                                                                color: "#fff",
                                                                cursor: "pointer",
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            Make this ad Kling
                                                            ready
                                                        </button>
                                                    </form>
                                                </div>
                                            ) : null}

                                            {job.campaignType === "donation" &&
                                            isKlingVideoReady &&
                                            klingAnimationPrompt ? (
                                                <div style={{ marginTop: 18 }}>
                                                    <h4
                                                        style={{
                                                            margin: "0 0 8px 0",
                                                        }}
                                                    >
                                                        Kling animation prompt
                                                    </h4>
                                                    <textarea
                                                        readOnly
                                                        defaultValue={
                                                            klingAnimationPrompt
                                                        }
                                                        style={{
                                                            width: "100%",
                                                            minHeight: 120,
                                                            padding: 12,
                                                            background: "black",
                                                            color: "white",
                                                            border: "1px solid #444",
                                                        }}
                                                    />
                                                    <div
                                                        style={{
                                                            marginTop: 10,
                                                            display: "flex",
                                                            justifyContent:
                                                                "flex-end",
                                                        }}
                                                    >
                                                        <CopyToClipboardButton
                                                            text={
                                                                klingAnimationPrompt
                                                            }
                                                            label="Copy Kling prompt"
                                                        />
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    </details>
                                </details>
                            );
                        })}
                    </div>

                    {showFreshAnglesBatchCta ? (
                        <div
                            style={{
                                marginTop: 28,
                                padding: 20,
                                borderRadius: 18,
                                border: "2px solid rgba(124, 58, 237, 0.35)",
                                background:
                                    "linear-gradient(180deg, rgba(124, 58, 237, 0.09), var(--surfaceElevated))",
                            }}
                        >
                            <h3
                                style={{
                                    marginTop: 0,
                                    marginBottom: 10,
                                    fontSize: 18,
                                }}
                            >
                                Generate more ads (fresh Memory angles)
                            </h3>
                            <p
                                style={{
                                    fontSize: 13,
                                    lineHeight: 1.55,
                                    opacity: 0.9,
                                    marginTop: 0,
                                    marginBottom: 14,
                                }}
                            >
                                Uses only angles from{" "}
                                <Link href="/memory">Memory</Link> that have not
                                appeared in any prior batch on this job — same
                                evaluations, swipe context, Creative Brain, and
                                batch pipeline as <strong>Generate 5 ads</strong>.
                                {remainingFreshAngleCount < 5 ? (
                                    <>
                                        {" "}
                                        <strong>
                                            {remainingFreshAngleCount} unused angle
                                            {remainingFreshAngleCount === 1
                                                ? ""
                                                : "s"}{" "}
                                            left
                                        </strong>
                                        — next run will be a smaller batch and, if
                                        that exhausts Memory, will be marked as the
                                        last batch.
                                    </>
                                ) : null}
                            </p>
                            <form
                                action={generateFundraiserFiveAdsFreshAngles}
                            >
                                <input
                                    type="hidden"
                                    name="jobId"
                                    value={job.id}
                                />
                                <button
                                    type="submit"
                                    style={{
                                        width: "100%",
                                        padding: "16px 18px",
                                        borderRadius: 14,
                                        border: "1px solid var(--borderStrong)",
                                        background: "var(--accent)",
                                        color: "#fff",
                                        cursor: "pointer",
                                        fontWeight: 800,
                                        fontSize: 16,
                                    }}
                                >
                                    Generate up to 5 new ads (fresh angles, one
                                    Claude call)
                                </button>
                            </form>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </main>
    );
}

