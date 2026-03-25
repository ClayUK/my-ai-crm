import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { generateImageWithKie } from "@/src/lib/kie";
import { inferKieAspectRatioFromPrompt } from "@/src/lib/kieAspect";

function authOk(req: NextRequest): boolean {
    const secret = process.env.CRM_AGENT_SECRET;
    if (!secret) return true;
    return req.headers.get("x-crm-secret") === secret;
}

function extractImageUrls(result: unknown): string[] {
    const urls = new Set<string>();
    function walk(value: unknown) {
        if (!value) return;
        if (typeof value === "string") {
            const lower = value.toLowerCase();
            if (
                (value.startsWith("http://") || value.startsWith("https://")) &&
                (lower.includes(".png") || lower.includes(".jpg") || lower.includes(".jpeg") ||
                    lower.includes(".webp") || lower.includes("image"))
            ) {
                urls.add(value);
            }
            return;
        }
        if (Array.isArray(value)) { for (const item of value) walk(item); return; }
        if (typeof value === "object") {
            for (const nested of Object.values(value as Record<string, unknown>)) walk(nested);
        }
    }
    walk(result);
    return Array.from(urls);
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!authOk(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: jobId } = await params;
    const body = await req.json().catch(() => ({}));
    const adId = body?.adId as string | undefined;

    if (!adId) {
        return NextResponse.json({ error: "adId is required in request body" }, { status: 400 });
    }

    const ad = await prisma.ad.findUnique({ where: { id: adId } });
    if (!ad) return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    if (ad.jobId !== jobId) return NextResponse.json({ error: "Ad does not belong to this job" }, { status: 400 });

    let prompt = (ad.editedPrompt || ad.sourceBlock || "").trim();
    if (!prompt) return NextResponse.json({ error: "No prompt on ad" }, { status: 400 });

    // Handle Kling split format
    if (prompt.includes("KIE_IMAGE_PROMPT:") && prompt.includes("|| KLING_ANIMATION_PROMPT:")) {
        const afterKie = prompt.split("KIE_IMAGE_PROMPT:")[1] || "";
        prompt = (afterKie.split("|| KLING_ANIMATION_PROMPT:")[0] || "").trim();
    }

    // Get reference images
    const adRefs = await prisma.referenceAsset.findMany({
        where: { jobId, adId },
        orderBy: { createdAt: "asc" },
    });
    const sharedRefs = adRefs.length > 0 ? [] : await prisma.referenceAsset.findMany({
        where: { jobId, adId: null },
        orderBy: { createdAt: "asc" },
    });
    const referenceImages = (adRefs.length > 0 ? adRefs : sharedRefs).map((r) => r.filePath).filter(Boolean);

    const aspectOverride = ad.kieAspectOverride === "9:16" || ad.kieAspectOverride === "1:1"
        ? ad.kieAspectOverride as "9:16" | "1:1"
        : null;
    const aspect: "1:1" | "9:16" = aspectOverride ?? inferKieAspectRatioFromPrompt(prompt);

    await prisma.ad.update({ where: { id: adId }, data: { status: "generating_images" } });

    try {
        const result = await generateImageWithKie(prompt, referenceImages, aspect);
        const urls = extractImageUrls(result);

        await prisma.image.deleteMany({ where: { adId } });
        if (urls.length > 0) {
            await prisma.image.createMany({
                data: urls.map((url) => ({ adId, url, prompt })),
            });
        }

        await prisma.ad.update({
            where: { id: adId },
            data: { status: "images_generated", kieResult: JSON.stringify(result, null, 2) },
        });

        return NextResponse.json({ ok: true, adId, imageUrls: urls, aspect });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await prisma.ad.update({
            where: { id: adId },
            data: { status: "kie_error", kieResult: `Kie generation failed:\n\n${message}` },
        });
        return NextResponse.json({ ok: false, adId, error: message }, { status: 500 });
    }
}
