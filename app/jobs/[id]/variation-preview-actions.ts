"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import {
    runVariationClaudeOnly,
    persistVariationAds,
    parseClientAdPayload,
    type VariationCheckboxFlags,
} from "@/src/lib/adVariationCore";
import type { ParsedAd } from "@/src/lib/claude/parseClaudeJson";

export type VariationPreviewResult =
    | { ok: true; ads: ParsedAd[] }
    | { ok: false; error: string };

export async function previewVariationPromptAction(input: {
    jobId: string;
    baseAdId: string;
    variationInstruction: string;
    flags: VariationCheckboxFlags;
}): Promise<VariationPreviewResult> {
    const row = await prisma.job.findUnique({
        where: { id: input.jobId },
        select: { id: true },
    });
    if (!row) {
        return { ok: false, error: "Job not found." };
    }

    const adRow = await prisma.ad.findFirst({
        where: { id: input.baseAdId, jobId: input.jobId },
        select: { id: true },
    });
    if (!adRow) {
        return { ok: false, error: "Ad not found on this job." };
    }

    return runVariationClaudeOnly({
        jobId: input.jobId,
        baseAdId: input.baseAdId,
        variationInstruction: input.variationInstruction,
        flags: input.flags,
    });
}

export async function commitVariationAdsAction(input: {
    jobId: string;
    baseAdId: string;
    ads: unknown[];
}): Promise<void> {
    if (!Array.isArray(input.ads) || input.ads.length === 0) {
        redirect(
            `/jobs/${input.jobId}?variationError=${encodeURIComponent("Nothing to save — generate a preview first.")}`
        );
    }

    const validated: ParsedAd[] = [];
    for (let i = 0; i < input.ads.length; i++) {
        const parsed = parseClientAdPayload(input.ads[i]);
        if (!parsed.ok) {
            redirect(
                `/jobs/${input.jobId}?variationError=${encodeURIComponent(`Ad ${i + 1}: ${parsed.error}`)}`
            );
        }
        validated.push(parsed.ad);
    }

    const job = await prisma.job.findUnique({
        where: { id: input.jobId },
        select: { id: true },
    });
    if (!job) {
        redirect(
            `/jobs/${input.jobId}?variationError=${encodeURIComponent("Job not found.")}`
        );
    }

    const base = await prisma.ad.findFirst({
        where: { id: input.baseAdId, jobId: input.jobId },
        select: { id: true },
    });
    if (!base) {
        redirect(
            `/jobs/${input.jobId}?variationError=${encodeURIComponent("Base ad not found.")}`
        );
    }

    await persistVariationAds({
        jobId: input.jobId,
        baseAdId: input.baseAdId,
        ads: validated,
    });

    redirect(`/jobs/${input.jobId}`);
}
