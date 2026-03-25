/**
 * POST /api/win/WIN-xxxxxxxx
 * Resolves a winner code to an adId and saves it to the swipe bank.
 * Winner codes are stored on Ad.title as "WIN-{adId.slice(0,8)}" during batch creation.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

function authOk(req: NextRequest): boolean {
    const secret = process.env.CRM_AGENT_SECRET;
    if (!secret) return true;
    return req.headers.get("x-crm-secret") === secret;
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    if (!authOk(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await params;
    const normalized = code.toUpperCase().trim();

    if (!normalized.startsWith("WIN-")) {
        return NextResponse.json({ error: "Invalid winner code format. Expected WIN-xxxxxxxx" }, { status: 400 });
    }

    const prefix = normalized.slice(4); // e.g. "A1B2C3D4"

    // Find ad by winner code stored in notes field
    const ad = await prisma.ad.findFirst({
        where: { title: { contains: normalized } },
        include: {
            job: { select: { subject_type: true, campaign_type: true, subject_name: true } },
            images: { orderBy: { createdAt: "desc" }, take: 1 },
        },
    });

    // Fallback: match by adId prefix
    const finalAd = ad || await prisma.ad.findFirst({
        where: { id: { startsWith: prefix.toLowerCase() } },
        include: {
            job: { select: { subject_type: true, campaign_type: true, subject_name: true } },
            images: { orderBy: { createdAt: "desc" }, take: 1 },
        },
    });

    if (!finalAd) {
        return NextResponse.json({ error: `No ad found for code ${normalized}` }, { status: 404 });
    }

    // Parse ad fields
    let source: Record<string, string> = {};
    try { source = JSON.parse(finalAd.sourceBlock || "{}"); } catch {}

    const angle = String(source.angle || "").trim();
    const hook = String(source.hook || "").trim();
    const primaryText = String(source.primaryText || "").trim();
    const headline = String(source.headline || "").trim();
    const cta = String(source.cta || "").trim();
    const visualPrompt = String(finalAd.editedPrompt || source.visualPrompt || "").trim();

    if (!hook && !angle) {
        return NextResponse.json({ error: "Ad has no hook or angle to save" }, { status: 400 });
    }

    const db = prisma as any;

    // Find or create Winners category
    let category = await db.swipeCategory.findFirst({
        where: { name: "Winners", marketType: "donation" },
    });
    if (!category) {
        category = await db.swipeCategory.create({
            data: { name: "Winners", marketType: "donation", description: "High-performing ads saved from campaigns" },
        });
    }

    // Deduplicate by hook
    const existing = await db.swipeEntry.findFirst({
        where: { hook, marketType: "donation" },
    });
    if (existing) {
        return NextResponse.json({ ok: false, duplicate: true, message: "Already in swipe bank" });
    }

    const entry = await db.swipeEntry.create({
        data: {
            title: headline || hook.slice(0, 60) || `Winner ${normalized}`,
            marketType: "donation",
            categoryId: category.id,
            status: "active",
            angle,
            hook,
            concept: headline,
            copy: primaryText.slice(0, 500),
            cta,
            visualDirection: visualPrompt.slice(0, 300).replace(/\n/g, " "),
            whyItWorks: `Saved as winner via code ${normalized} from job ${finalAd.jobId}`,
            source: `job:${finalAd.jobId}:ad:${finalAd.id}`,
            notes: `Image: ${finalAd.images[0]?.url || "none"}`,
        },
    });

    await prisma.ad.update({
        where: { id: finalAd.id },
        data: { isWinner: true },
    });

    return NextResponse.json({
        ok: true,
        code: normalized,
        swipeEntryId: entry.id,
        title: entry.title,
        angle: angle.slice(0, 60),
        hook: hook.slice(0, 80),
    });
}
