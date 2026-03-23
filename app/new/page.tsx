export const dynamic = "force-dynamic"
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { scrapeUrlToHtml } from "@/src/lib/scrape";
import { evaluateDonationPageFromScrape } from "@/src/lib/anthropic";
import {
    persistDonationPageEvalAndAutoStoryEval,
    mergeDonationWizardSnapshotIntoClaudeOutput,
} from "@/src/lib/donationWizard";

function stripHtml(input: string) {
    return input
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
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

async function createCampaign(formData: FormData) {
    "use server";

    const urlRaw = String(formData.get("url") || "").trim();
    if (!urlRaw) throw new Error("Fundraiser URL is required.");
    const url =
        urlRaw.startsWith("http://") || urlRaw.startsWith("https://")
            ? urlRaw
            : `https://${urlRaw}`;

    const baseJobData: Record<string, unknown> = {
        url,
        campaignType: "donation",
        status: "donation_intake",
        platform: "facebook",
        funnelStage: "Mix",
        formatRatio: "70% 9:16 / 30% 1080x1080",
        numberOfAds: "1",
        campaign_type: "FAMILY CRISIS",
        subject_name: "Fundraiser",
        subject_type: "human",
    };

    const runtimeJobFields = (() => {
        try {
            const fields = (prisma as any)?._runtimeDataModel?.models?.Job?.fields;
            if (!Array.isArray(fields)) return null;
            return new Set(
                fields
                    .map((f: any) => (f && typeof f.name === "string" ? f.name : ""))
                    .filter(Boolean)
            );
        } catch {
            return null;
        }
    })();

    const createData =
        runtimeJobFields && runtimeJobFields.size > 0
            ? Object.fromEntries(
                  Object.entries(baseJobData).filter(([k]) =>
                      runtimeJobFields.has(k)
                  )
              )
            : baseJobData;

    const job = await prisma.job.create({ data: createData as any });

    try {
        const scraped = await scrapeUrlToHtml(url);
        const rawText = stripHtml(scraped.html || "").slice(0, 16000);
        const pageEval = await evaluateDonationPageFromScrape({
            fundraiserUrl: url,
            scrapedText: rawText,
        });

        await persistDonationPageEvalAndAutoStoryEval({
            jobId: job.id,
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
        console.error(
            "[createCampaign] Fundraiser analyze failed; saving fallback page eval. jobId=%s error=%s",
            job.id,
            message,
            error
        );
        const fallbackEval = {
            subjectName: "Fundraiser",
            whatHappened: "Unable to auto-extract from URL. Please provide backstory manually.",
            whyFundingIsNeeded: "User-provided details required.",
            urgencyLevel: "general",
            keyEmotionalHooks: [
                "Human impact",
                "Urgent support needed",
                "Direct call for help",
            ],
            usefulPhrases: ["Help now", "Support this fundraiser"],
            draftBackstory: "",
            warning: "Automatic page analysis failed. Continue with manual backstory.",
        };
        const mergedClaude = mergeDonationWizardSnapshotIntoClaudeOutput(null, {
            pageEvaluation: fallbackEval,
            backstorySummary: "",
            pageEvaluationError: message,
        });

        await prisma.job.update({
            where: { id: job.id },
            data: filterJobDataByRuntimeFields({
                status: "donation_page_evaluated",
                donationPageEvaluation: JSON.stringify(fallbackEval),
                claudeOutput: mergedClaude,
            }) as any,
        });
    }

    redirect(`/jobs/${job.id}`);
}

export default function NewJobPage() {
    return (
        <main style={{ maxWidth: 760 }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>
                Donation Campaign
            </h1>
            <div style={{ marginTop: 8, opacity: 0.82 }}>
                Step 1: paste fundraiser URL and analyze the page.
            </div>

            <form
                action={createCampaign}
                style={{
                    marginTop: 18,
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    padding: 16,
                    background: "var(--surface)",
                }}
            >
                <label htmlFor="url" style={{ fontWeight: 800 }}>
                    Fundraiser URL
                </label>
                <input
                    id="url"
                    name="url"
                    type="url"
                    required
                    placeholder="https://gofundme.com/..."
                    style={{
                        width: "100%",
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
                        marginTop: 14,
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "1px solid rgba(124, 58, 237, 0.35)",
                        background: "var(--accent)",
                        color: "#fff",
                        cursor: "pointer",
                    }}
                >
                    Analyze Fundraiser
                </button>
            </form>
        </main>
    );
}

