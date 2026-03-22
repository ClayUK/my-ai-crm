import { prisma } from "@/src/lib/prisma";
import { generateAdVariationsFromBaseAd } from "@/src/lib/anthropic";
import {
    buildBrainPromptSection,
    getFundraiserCreativeBrain,
} from "@/src/lib/creativeBrain";
import {
    parseValidateAndNormalizeClaudeAds,
    type ParsedAd,
} from "@/src/lib/claude/parseClaudeJson";
import { resolveDonationEvaluations } from "@/src/lib/donationWizard";

function tryParseJson(value: string | null): unknown {
    if (!value) return null;
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

/** Variation panel: free-text instruction + optional Kling output format. VAR_* mixing is only on Generate 5 (Memory). */
export type VariationCheckboxFlags = {
    klingFormat: boolean;
};

export type RunVariationInput = {
    jobId: string;
    baseAdId: string;
    variationInstruction: string;
    flags: VariationCheckboxFlags;
};

/**
 * Load base ad, call Claude for variations, parse. No DB writes.
 */
export async function runVariationClaudeOnly(
    input: RunVariationInput
): Promise<
    | { ok: true; ads: ParsedAd[] }
    | { ok: false; error: string }
> {
    const job = await prisma.job.findUnique({ where: { id: input.jobId } });
    if (!job) {
        return { ok: false, error: "Job not found." };
    }

    const variationInstruction = input.variationInstruction.trim();

    const safeCount =
        job.campaignType === "donation"
            ? 1
            : 4;

    const baseAd = await prisma.ad.findUnique({ where: { id: input.baseAdId } });
    if (!baseAd?.sourceBlock) {
        return { ok: false, error: "Base ad missing saved data." };
    }

    type BaseAdPayload = {
        angle?: unknown;
        hook?: unknown;
        primaryText?: unknown;
        headline?: unknown;
        cta?: unknown;
        visualPrompt?: unknown;
    };

    const basePayload = tryParseJson(baseAd.sourceBlock) as BaseAdPayload | null;

    if (
        !basePayload ||
        typeof basePayload !== "object" ||
        typeof basePayload.angle !== "string" ||
        typeof basePayload.hook !== "string" ||
        typeof basePayload.primaryText !== "string" ||
        typeof basePayload.headline !== "string" ||
        typeof basePayload.cta !== "string"
    ) {
        return {
            ok: false,
            error:
                "This ad is missing angle, hook, headline, primary text, or CTA in saved data.",
        };
    }

    const visualPromptMerged =
        (typeof basePayload.visualPrompt === "string"
            ? basePayload.visualPrompt
            : ""
        ).trim() || String(baseAd.editedPrompt || "").trim();

    if (!visualPromptMerged) {
        return {
            ok: false,
            error:
                "No visual prompt found. Save “Developed Prompt” first or regenerate this ad.",
        };
    }

    const brainForVariations = await getFundraiserCreativeBrain();
    const creativeBrainSectionForVariations =
        job.campaignType === "donation"
            ? buildBrainPromptSection(brainForVariations, [])
            : undefined;

    const donationEvaluationsResolved =
        job.campaignType === "donation"
            ? resolveDonationEvaluations(job)
            : null;

    let variationsRaw: string;
    try {
        variationsRaw = await generateAdVariationsFromBaseAd({
            baseAd: {
                angle: basePayload.angle,
                hook: basePayload.hook,
                primaryText: basePayload.primaryText,
                headline: basePayload.headline,
                cta: basePayload.cta,
                visualPrompt: visualPromptMerged,
            },
            campaignType: job.campaignType === "donation" ? "donation" : "product",
            requestedVariations: safeCount,
            creativeMode: job.creativeMode || "Mix",
            adMixStrategy: job.adMixStrategy || "Even Mix",
            strictlyFollowSelectedAngles: job.strictlyFollowSelectedAngles ?? false,
            includeExperimentalAds: job.includeExperimentalAds ?? false,
            variationInstruction,
            creativeBrainSection: creativeBrainSectionForVariations,
            donationEvaluations:
                job.campaignType === "donation" && donationEvaluationsResolved
                    ? {
                          pageEvaluation:
                              donationEvaluationsResolved.pageEvaluation,
                          backstoryEvaluation:
                              donationEvaluationsResolved.backstoryEvaluation,
                          referenceEvaluation:
                              donationEvaluationsResolved.referenceEvaluation,
                      }
                    : undefined,
            donationKlingFormat:
                job.campaignType === "donation"
                    ? input.flags.klingFormat
                    : undefined,
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { ok: false, error: `Claude request failed: ${msg}` };
    }

    const parsedResult = parseValidateAndNormalizeClaudeAds(
        variationsRaw,
        safeCount
    );

    if (!parsedResult.ok) {
        const d = parsedResult.diagnostics;
        const hint = [
            d.error,
            d.warnings?.length ? d.warnings.join(" ") : "",
            d.preview ? `Output preview: ${d.preview.slice(0, 400)}` : "",
        ]
            .filter(Boolean)
            .join(" — ");
        return { ok: false, error: hint || "Could not parse variation response." };
    }

    if (parsedResult.ads.length === 0) {
        return { ok: false, error: "Model returned no usable ads." };
    }

    return { ok: true, ads: parsedResult.ads };
}

function isParsedAdShape(o: unknown): o is ParsedAd {
    if (!o || typeof o !== "object") return false;
    const a = o as Record<string, unknown>;
    return (
        typeof a.angle === "string" &&
        typeof a.hook === "string" &&
        typeof a.primaryText === "string" &&
        typeof a.headline === "string" &&
        typeof a.cta === "string" &&
        typeof a.visualPrompt === "string"
    );
}

/**
 * Insert variation ad rows + copy donation refs (same as legacy generateAdVariations).
 */
export async function persistVariationAds(options: {
    jobId: string;
    baseAdId: string;
    ads: ParsedAd[];
}): Promise<void> {
    const { jobId, baseAdId, ads } = options;
    const n = ads.length;
    if (n === 0) throw new Error("No ads to persist.");

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error("Job not found");

    const maxAdNumber = await prisma.ad.findFirst({
        where: { jobId },
        orderBy: { adNumber: "desc" },
        select: { adNumber: true },
    });

    const startAdNumber = (maxAdNumber?.adNumber ?? 0) + 1;

    await prisma.ad.createMany({
        data: ads.map((ad, i) => ({
            jobId,
            adNumber: startAdNumber + i,
            title: `Variation ${i + 1}`,
            sourceBlock: JSON.stringify(ad, null, 2),
            editedPrompt: String(ad.visualPrompt || "").trim(),
            status: "ready",
            parentAdId: baseAdId,
        })),
    });

    if (job.campaignType === "donation") {
        const baseAdSpecificRefs = await prisma.referenceAsset.findMany({
            where: { jobId, adId: baseAdId },
            orderBy: { createdAt: "asc" },
            select: {
                filePath: true,
                originalName: true,
                mimeType: true,
            },
        });

        const refsToCopy =
            baseAdSpecificRefs.length > 0
                ? baseAdSpecificRefs
                : await prisma.referenceAsset.findMany({
                      where: { jobId, adId: null },
                      orderBy: { createdAt: "asc" },
                      select: {
                          filePath: true,
                          originalName: true,
                          mimeType: true,
                      },
                  });

        if (refsToCopy.length > 0) {
            const newAds = await prisma.ad.findMany({
                where: {
                    jobId,
                    parentAdId: baseAdId,
                    adNumber: {
                        gte: startAdNumber,
                        lt: startAdNumber + n,
                    },
                },
                select: { id: true },
            });

            const data = newAds.flatMap((newAd) =>
                refsToCopy.map((ref) => ({
                    jobId,
                    adId: newAd.id,
                    filePath: ref.filePath,
                    originalName: ref.originalName,
                    mimeType: ref.mimeType,
                }))
            );

            if (data.length > 0) {
                await prisma.referenceAsset.createMany({ data });
            }
        }
    }
}

/** Validate client-submitted ad before persist (allows user edits in preview). */
export function parseClientAdPayload(
    raw: unknown
): { ok: true; ad: ParsedAd } | { ok: false; error: string } {
    if (!isParsedAdShape(raw)) {
        return { ok: false, error: "Invalid ad payload." };
    }
    const ad = raw as ParsedAd;
    const required: (keyof ParsedAd)[] = [
        "angle",
        "hook",
        "headline",
        "cta",
        "visualPrompt",
    ];
    for (const k of required) {
        if (!String(ad[k] || "").trim()) {
            return { ok: false, error: `Field "${k}" cannot be empty.` };
        }
    }
    if (typeof ad.primaryText !== "string") {
        return { ok: false, error: "primaryText must be a string." };
    }
    return { ok: true, ad };
}
