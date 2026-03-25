import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import {
    generateDonationFundraiserBatchFive,
} from "@/src/lib/anthropic";
import {
    appendFundraiserBatchHistory,
    buildBrainKeyedInstructions,
    buildBrainStaticPreamble,
    collectUsedAngleMemoryKeys,
    donationStyleTemplateLabel,
    formatBatchHistoryForPrompt,
    getFundraiserCreativeBrain,
    isFundraiserCreativeBrainThin,
    normalizeAngleLine,
    parseAnglesList,
    parseFundraiserBatchHistory,
    pickRandomWinningPromptSeeds,
    planFundraiserBatchFreshAngles,
    planFundraiserBatchOfFive,
    resolveVarKeyPoolFromAdditionalInfo,
    type FundraiserBatchPlanSlot,
} from "@/src/lib/creativeBrain";
import {
    readJobFundraiserBatchHistory,
    writeJobFundraiserBatchHistory,
} from "@/src/lib/jobFundraiserBatchHistory";
import { getDonationSwipeBatchContext } from "@/src/lib/swipeBrain";
import { resolveDonationEvaluations } from "@/src/lib/donationWizard";
import {
    parseValidateAndNormalizeClaudeAds,
} from "@/src/lib/claude/parseClaudeJson";

function authOk(req: NextRequest): boolean {
    const secret = process.env.CRM_AGENT_SECRET;
    if (!secret) return true;
    return req.headers.get("x-crm-secret") === secret;
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!authOk(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: jobId } = await params;

    // Optional body: { mode: "fresh" | "any" }
    const body = await req.json().catch(() => ({}));
    const mode: "fresh" | "any" = body?.mode === "any" ? "any" : "fresh";

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.campaignType !== "donation") {
        return NextResponse.json({ error: "Not a donation job" }, { status: 400 });
    }

    const { backstoryEvaluation, referenceEvaluation, pageEvaluation } = resolveDonationEvaluations(job);
    if (Object.keys(backstoryEvaluation).length === 0 || Object.keys(referenceEvaluation).length === 0) {
        return NextResponse.json({ error: "Run /analyze first — evaluations incomplete" }, { status: 400 });
    }

    const brainRow = (await getFundraiserCreativeBrain()) ?? {
        previousWinningPrompts: "",
        anglesList: "",
        additionalInfo: "",
    };

    if (isFundraiserCreativeBrainThin(brainRow)) {
        return NextResponse.json({ error: "Creative Brain memory is empty. Add angles and winning prompts at /memory first." }, { status: 400 });
    }

    const existingBatchHistory = await readJobFundraiserBatchHistory(jobId);
    const histParsed = parseFundraiserBatchHistory(existingBatchHistory);
    const memoryAngles = parseAnglesList(brainRow.anglesList);
    const usedKeys = collectUsedAngleMemoryKeys(histParsed, memoryAngles);
    const remainingAngles = memoryAngles.filter((m) => !usedKeys.has(normalizeAngleLine(m)));

    const rnd = Math.random;
    const swipeCtx = await getDonationSwipeBatchContext();
    const varKeyPool = resolveVarKeyPoolFromAdditionalInfo(brainRow.additionalInfo);

    let plans;
    if (mode === "fresh") {
        if (remainingAngles.length === 0) {
            return NextResponse.json({
                ok: false,
                anglesExhausted: true,
                message: "All Memory angles used for this job. No more fresh batches available.",
            });
        }
        plans = planFundraiserBatchFreshAngles(brainRow.anglesList, usedKeys, rnd, { varKeyPool });
    } else {
        plans = planFundraiserBatchOfFive(brainRow.anglesList, rnd, { varKeyPool });
    }

    if (!plans || plans.length === 0) {
        return NextResponse.json({ error: "Could not build batch plan" }, { status: 500 });
    }

    const slotCount = plans.length;
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
        keyedBrainInstructions: buildBrainKeyedInstructions(brainRow, p.activeBrainKeys),
        winningPromptSeed: winningSeeds[i] || undefined,
    }));
    const planForHistory: FundraiserBatchPlanSlot[] = plans.map((p, i) => ({
        slotIndex: p.slotIndex,
        styleTemplateId: p.styleTemplateId,
        templateLabel: donationStyleTemplateLabel(p.styleTemplateId),
        angleLine: p.angleLine,
        varKeys: [...p.varKeys],
        winningPromptSeed: winningSeeds[i] || undefined,
    }));

    const priorBatchesSummary = formatBatchHistoryForPrompt(histParsed);
    const platforms = String(job.platform || "").split(",").map((s) => s.trim()).filter(Boolean);

    const referenceImageUrls = (
        await prisma.referenceAsset.findMany({
            where: { jobId, adId: null },
            orderBy: { createdAt: "asc" },
            select: { filePath: true },
        })
    ).map((r) => r.filePath).filter(Boolean);

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

    const parsed = parseValidateAndNormalizeClaudeAds(JSON.stringify(adJson), slotCount);
    if (!parsed.ok || parsed.ads.length !== slotCount) {
        return NextResponse.json({
            error: parsed.ok
                ? `Expected ${slotCount} ads, got ${parsed.ads.length}`
                : parsed.diagnostics.error,
        }, { status: 500 });
    }

    const maxAdNumber = await prisma.ad.findFirst({
        where: { jobId },
        orderBy: { adNumber: "desc" },
        select: { adNumber: true },
    });
    let nextAdNumber = (maxAdNumber?.adNumber ?? 0) + 1;

    const createdAds: Array<{ id: string; adNumber: number; angle: string; hook: string; visualPrompt: string }> = [];

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
        createdAds.push({
            id: ad.id,
            adNumber: num,
            angle: String(parsed.ads[i]!.angle || ""),
            hook: String(parsed.ads[i]!.hook || ""),
            visualPrompt: String(parsed.ads[i]!.visualPrompt || "").slice(0, 200),
        });
    }

    // Copy shared reference images to each new ad
    if (referenceImageUrls.length > 0) {
        const refAssets = await prisma.referenceAsset.findMany({
            where: { jobId, adId: null },
            orderBy: { createdAt: "asc" },
        });
        for (const ad of createdAds) {
            await prisma.referenceAsset.createMany({
                data: refAssets.map((ref) => ({
                    jobId,
                    adId: ad.id,
                    filePath: ref.filePath,
                    originalName: ref.originalName,
                    mimeType: ref.mimeType,
                })),
            });
        }
    }

    // Update batch history
    const summaryAds = parsed.ads.map((a, i) => ({
        hook: typeof a.hook === "string" ? a.hook : undefined,
        angle: typeof a.angle === "string" ? a.angle : undefined,
        templateId: plans[i]?.styleTemplateId,
    }));
    const nextHistory = appendFundraiserBatchHistory(existingBatchHistory, summaryAds, planForHistory);
    await writeJobFundraiserBatchHistory(jobId, nextHistory);

    // Ensure job is in donation_build
    await prisma.job.update({ where: { id: jobId }, data: { status: "donation_build" } });

    return NextResponse.json({
        ok: true,
        jobId,
        batchSize: slotCount,
        remainingAnglesAfter: mode === "fresh" ? Math.max(0, remainingAngles.length - slotCount) : null,
        ads: createdAds,
    });
}
