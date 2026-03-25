import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

function authOk(req: NextRequest): boolean {
    const secret = process.env.CRM_AGENT_SECRET;
    if (!secret) return true;
    return req.headers.get("x-crm-secret") === secret;
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ adId: string }> }
) {
    if (!authOk(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { adId } = await params;

    const ad = await prisma.ad.findUnique({
        where: { id: adId },
        include: {
            job: { select: { subject_type: true, campaign_type: true, subject_name: true } },
            images: { orderBy: { createdAt: "desc" }, take: 1 },
        },
    });

    if (!ad) return NextResponse.json({ error: "Ad not found" }, { status: 404 });

    // Parse ad fields from sourceBlock
    let source: Record<string, string> = {};
    try { source = JSON.parse(ad.sourceBlock || "{}"); } catch {}

    const angle = String(source.angle || "").trim();
    const hook = String(source.hook || "").trim();
    const primaryText = String(source.primaryText || "").trim();
    const headline = String(source.headline || "").trim();
    const cta = String(source.cta || "").trim();
    const visualPrompt = String(ad.editedPrompt || source.visualPrompt || "").trim();

    if (!hook && !angle) {
        return NextResponse.json({ error: "Ad has no hook or angle to save" }, { status: 400 });
    }

    // Find or create a "Winners" swipe category
    const db = prisma as any;
    let category = await db.swipeCategory.findFirst({
        where: { name: "Winners", marketType: "donation" },
    });
    if (!category) {
        category = await db.swipeCategory.create({
            data: { name: "Winners", marketType: "donation", description: "High-performing ads saved from campaigns" },
        });
    }

    // Check for duplicate (same hook)
    const existing = await db.swipeEntry.findFirst({
        where: { hook, marketType: "donation" },
    });
    if (existing) {
        return NextResponse.json({ ok: false, duplicate: true, message: "An entry with this hook already exists in the swipe bank" });
    }

    // Build a concise whyItWorks note from the visual prompt (first 200 chars)
    const visualSummary = visualPrompt.slice(0, 200).replace(/\n/g, " ").trim();

    const entry = await db.swipeEntry.create({
        data: {
            title: headline || hook.slice(0, 60) || `Winner Ad ${ad.adNumber}`,
            marketType: "donation",
            categoryId: category.id,
            status: "active",
            angle,
            hook,
            concept: headline,
            copy: primaryText.slice(0, 500),
            cta,
            visualDirection: visualSummary,
            whyItWorks: `Saved as winner from campaign job ${ad.jobId}, ad #${ad.adNumber}`,
            source: `job:${ad.jobId}:ad:${adId}`,
            notes: `Image: ${ad.images[0]?.url || "none"}`,
        },
    });

    // Mark the ad as winner
    await prisma.ad.update({
        where: { id: adId },
        data: { isWinner: true },
    });

    return NextResponse.json({
        ok: true,
        swipeEntryId: entry.id,
        title: entry.title,
        angle,
        hook: hook.slice(0, 80),
    });
}
