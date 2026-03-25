import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { scrapeUrlToHtml } from "@/src/lib/scrape";
import { evaluateDonationPageFromScrape } from "@/src/lib/anthropic";
import {
    persistDonationPageEvalAndAutoStoryEval,
    mergeDonationWizardSnapshotIntoClaudeOutput,
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
    if (!secret) return true;
    return req.headers.get("x-crm-secret") === secret;
}

export async function POST(req: NextRequest) {
    if (!authOk(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    let url = String(body?.url || "").trim();
    if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = `https://${url}`;
    }

    // Create job record
    const baseJobData = {
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

    const job = await prisma.job.create({
        data: filterJobDataByRuntimeFields(baseJobData) as any,
    });

    const jobId = job.id;

    // Kick off page evaluation immediately
    try {
        const scraped = await scrapeUrlToHtml(url);
        const rawText = stripHtml(scraped.html || "").slice(0, 16000);
        const pageEval = await evaluateDonationPageFromScrape({
            fundraiserUrl: url,
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
    } catch (err) {
        // Save fallback so job is still usable
        const fallback = {
            subjectName: "Fundraiser",
            whatHappened: "Unable to auto-extract. Backstory will be minimal.",
            urgencyLevel: "general",
            keyEmotionalHooks: ["Human impact", "Urgent support needed"],
            usefulPhrases: ["Help now", "Support this fundraiser"],
            draftBackstory: "",
            warning: "Page analysis failed on create.",
        };
        const mergedClaude = mergeDonationWizardSnapshotIntoClaudeOutput(null, {
            pageEvaluation: fallback,
            pageEvaluationError: err instanceof Error ? err.message : String(err),
        });
        await prisma.job.update({
            where: { id: jobId },
            data: filterJobDataByRuntimeFields({
                donationPageEvaluation: JSON.stringify(fallback),
                status: "donation_page_evaluated",
                claudeOutput: mergedClaude,
            }) as any,
        });
    }

    return NextResponse.json({ ok: true, jobId, url });
}
