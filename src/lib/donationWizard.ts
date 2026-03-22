/**
 * Donation URL wizard helpers — donation-only, shared by create + job retry actions.
 */

import { prisma } from "@/src/lib/prisma";
import { evaluateDonationBackstory } from "@/src/lib/anthropic";

function tryParseJsonLocal(value: string | null | undefined): unknown {
    if (!value?.trim()) return null;
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

/** Read nested snapshot written into Job.claudeOutput (survives stale Prisma clients that drop newer columns). */
export function getDonationWizardSnapshot(
    claudeOutput: string | null | undefined
): Record<string, unknown> | null {
    if (!claudeOutput?.trim()) return null;
    try {
        const root = JSON.parse(claudeOutput) as unknown;
        if (!root || typeof root !== "object" || Array.isArray(root)) return null;
        const snap = (root as Record<string, unknown>).donationWizardSnapshot;
        if (!snap || typeof snap !== "object" || Array.isArray(snap)) return null;
        return snap as Record<string, unknown>;
    } catch {
        return null;
    }
}

/** Merge donation wizard fields into claudeOutput JSON without losing other keys. */
export function mergeDonationWizardSnapshotIntoClaudeOutput(
    existingClaudeOutput: string | null | undefined,
    patch: Record<string, unknown>
): string {
    let root: Record<string, unknown> = {};
    if (existingClaudeOutput?.trim()) {
        try {
            const parsed = JSON.parse(existingClaudeOutput) as unknown;
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                root = parsed as Record<string, unknown>;
            } else {
                root = { previousClaudeOutput: existingClaudeOutput };
            }
        } catch {
            root = { previousClaudeOutput: existingClaudeOutput };
        }
    }
    const prevSnap =
        root.donationWizardSnapshot &&
        typeof root.donationWizardSnapshot === "object" &&
        !Array.isArray(root.donationWizardSnapshot)
            ? (root.donationWizardSnapshot as Record<string, unknown>)
            : {};
    const merged: Record<string, unknown> = { ...prevSnap };
    for (const [key, val] of Object.entries(patch)) {
        if (val === null) {
            delete merged[key];
        } else {
            merged[key] = val;
        }
    }
    merged.v = 1;
    merged.updatedAt = new Date().toISOString();
    root.donationWizardSnapshot = merged;
    return JSON.stringify(root, null, 2);
}

function asObject(val: unknown): Record<string, unknown> {
    if (val && typeof val === "object" && !Array.isArray(val)) {
        return val as Record<string, unknown>;
    }
    return {};
}

/** Resolve page / story / reference evaluations from DB columns or claudeOutput snapshot. */
export function resolveDonationEvaluations(job: {
    claudeOutput?: string | null;
    donationPageEvaluation?: string | null;
    donationBackstoryEvaluation?: string | null;
    donationReferenceEvaluation?: string | null;
}): {
    pageEvaluation: Record<string, unknown>;
    backstoryEvaluation: Record<string, unknown>;
    referenceEvaluation: Record<string, unknown>;
} {
    const snap = getDonationWizardSnapshot(job.claudeOutput);
    const pageCol = asObject(tryParseJsonLocal(job.donationPageEvaluation));
    const storyCol = asObject(tryParseJsonLocal(job.donationBackstoryEvaluation));
    const refCol = asObject(tryParseJsonLocal(job.donationReferenceEvaluation));
    const pageSnap = asObject(snap?.pageEvaluation);
    const storySnap = asObject(snap?.storyEvaluation);
    const refSnap = asObject(snap?.referenceEvaluation);

    return {
        pageEvaluation: Object.keys(pageCol).length ? pageCol : pageSnap,
        backstoryEvaluation: Object.keys(storyCol).length ? storyCol : storySnap,
        referenceEvaluation: Object.keys(refCol).length ? refCol : refSnap,
    };
}

/** Build one backstory string from page-eval JSON, falling back to scraped text when needed. */
export function composeBackstoryFromPageEval(
    pageEval: Record<string, unknown> | null | undefined,
    rawTextFallback: string
): string {
    const p = pageEval || {};
    const draft = String(p.draftBackstory || "").trim();
    if (draft.length >= 50) return draft.slice(0, 8000);

    const what = String(p.whatHappened || "").trim();
    const why = String(p.whyFundingIsNeeded || "").trim();
    let combined = [draft, what && `What happened: ${what}`, why && `Why help is needed: ${why}`]
        .filter(Boolean)
        .join("\n\n")
        .trim();

    if (combined.length >= 40) return combined.slice(0, 8000);

    const raw = String(rawTextFallback || "")
        .replace(/\s+/g, " ")
        .trim();
    if (raw.length > 250) {
        return raw.slice(0, 6000);
    }

    return combined.slice(0, 8000);
}

type JobAngleRow = {
    campaign_type?: string | null;
    subject_name?: string | null;
    urgency_level?: string | null;
    emotional_hook?: string | null;
};

/**
 * After URL page extraction, save page eval + backstory text, then run Block A
 * (evaluateDonationBackstory) so the workspace shows "Backstory Evaluation" immediately.
 */
export async function persistDonationPageEvalAndAutoStoryEval(options: {
    jobId: string;
    pageEval: Record<string, unknown>;
    rawText: string;
    filterJobData: (data: Record<string, unknown>) => Record<string, unknown>;
    jobRow: JobAngleRow;
}): Promise<void> {
    const { jobId, pageEval, rawText, filterJobData, jobRow } = options;

    const prev = await prisma.job.findUnique({
        where: { id: jobId },
        select: { claudeOutput: true },
    });

    const backstoryText = composeBackstoryFromPageEval(pageEval, rawText);
    const subjectFromPage = String(pageEval.subjectName || "").trim();
    const urgencyFromPage = String(pageEval.urgencyLevel || "").trim();

    const snapshotBase = mergeDonationWizardSnapshotIntoClaudeOutput(
        prev?.claudeOutput,
        {
            pageEvaluation: pageEval,
            backstorySummary: backstoryText,
        }
    );

    const baseUpdate: Record<string, unknown> = {
        rawText,
        donationPageEvaluation: JSON.stringify(pageEval),
        backstory_summary: backstoryText || undefined,
        status: "donation_page_evaluated",
        claudeOutput: snapshotBase,
    };
    if (subjectFromPage) baseUpdate.subject_name = subjectFromPage;
    if (urgencyFromPage) baseUpdate.urgency_level = urgencyFromPage;

    if (backstoryText.length < 20) {
        await prisma.job.update({
            where: { id: jobId },
            data: filterJobData(baseUpdate) as any,
        });
        return;
    }

    try {
        const evalResult = await evaluateDonationBackstory({
            campaignType: jobRow.campaign_type || "FAMILY CRISIS",
            subjectName:
                subjectFromPage || jobRow.subject_name || "Fundraiser",
            urgencyLevel:
                urgencyFromPage || jobRow.urgency_level || "general",
            emotionalHook: jobRow.emotional_hook || undefined,
            backstorySummary: backstoryText,
        });

        const snapshotFull = mergeDonationWizardSnapshotIntoClaudeOutput(
            snapshotBase,
            {
                pageEvaluation: pageEval,
                backstorySummary: backstoryText,
                storyEvaluation: evalResult as Record<string, unknown>,
            }
        );

        await prisma.job.update({
            where: { id: jobId },
            data: filterJobData({
                ...baseUpdate,
                claudeOutput: snapshotFull,
                donationBackstoryEvaluation: JSON.stringify(evalResult),
                physical_description: backstoryText,
                injury_or_medical_details: backstoryText,
                status: "donation_story_evaluated",
            }) as any,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const snapshotErr = mergeDonationWizardSnapshotIntoClaudeOutput(
            snapshotBase,
            {
                pageEvaluation: pageEval,
                backstorySummary: backstoryText,
                storyEvaluationError: message,
            }
        );
        await prisma.job.update({
            where: { id: jobId },
            data: filterJobData({
                ...baseUpdate,
                claudeOutput: snapshotErr,
            }) as any,
        });
    }
}
