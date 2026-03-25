import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { generateImageWithKie, uploadReferenceFilesToKie } from "@/src/lib/kie";
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

/**
 * Resolve reference image paths to Kie-compatible URLs.
 * - If already a Kie CDN URL (kie.ai or kiestatic): use as-is
 * - If a Telegram URL or any other external URL: download + re-upload to Kie CDN
 * - If a local /uploads/ path: skip (ephemeral on Railway, unreliable)
 */
async function resolveReferenceImages(filePaths: string[]): Promise<string[]> {
    const resolved: string[] = [];

    for (const path of filePaths) {
        if (!path) continue;

        // Already on Kie CDN — use directly
        if (path.includes("kie.ai") || path.includes("kiestatic") || path.includes("kiecdn")) {
            resolved.push(path);
            continue;
        }

        // Local path — skip (Railway ephemeral storage, file likely gone)
        if (path.startsWith("/") || path.startsWith("./")) {
            console.log("[generate-image] Skipping local path:", path);
            continue;
        }

        // External URL (Telegram, S3, etc.) — download and re-upload to Kie
        if (path.startsWith("http://") || path.startsWith("https://")) {
            try {
                const res = await fetch(path, { signal: AbortSignal.timeout(15000) });
                if (!res.ok) {
                    console.log("[generate-image] Could not fetch ref image:", path, res.status);
                    continue;
                }
                const buffer = await res.arrayBuffer();
                const ct = res.headers.get("content-type") || "image/jpeg";
                const ext = ct.includes("png") ? "png" : ct.includes("webp") ? "webp" : "jpg";
                const file = new File([buffer], `reference.${ext}`, { type: ct });

                const uploaded = await uploadReferenceFilesToKie([file]);
                if (uploaded[0]?.filePath) {
                    resolved.push(uploaded[0].filePath);
                }
            } catch (e) {
                console.error("[generate-image] Failed to re-upload ref image:", path, e);
            }
            continue;
        }
    }

    return resolved;
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

    let prompt = (ad.editedPrompt || "").trim();

    // Fall back to visualPrompt from sourceBlock if editedPrompt is empty
    if (!prompt && ad.sourceBlock) {
        try {
            const src = JSON.parse(ad.sourceBlock);
            prompt = String(src?.visualPrompt || "").trim();
        } catch {}
    }

    if (!prompt) return NextResponse.json({ error: "No prompt on ad" }, { status: 400 });

    // Handle Kling split format
    if (prompt.includes("KIE_IMAGE_PROMPT:") && prompt.includes("|| KLING_ANIMATION_PROMPT:")) {
        const afterKie = prompt.split("KIE_IMAGE_PROMPT:")[1] || "";
        prompt = (afterKie.split("|| KLING_ANIMATION_PROMPT:")[0] || "").trim();
    }

    // Get reference images — prefer ad-specific, fall back to shared job refs
    const adRefs = await prisma.referenceAsset.findMany({
        where: { jobId, adId },
        orderBy: { createdAt: "asc" },
    });
    const sharedRefs = adRefs.length > 0
        ? []
        : await prisma.referenceAsset.findMany({
            where: { jobId, adId: null },
            orderBy: { createdAt: "asc" },
        });
    const rawPaths = (adRefs.length > 0 ? adRefs : sharedRefs)
        .map((r) => r.filePath)
        .filter(Boolean);

    // Resolve to Kie-compatible URLs (re-upload Telegram/external URLs to Kie CDN)
    const referenceImages = await resolveReferenceImages(rawPaths);

    const aspectOverride =
        ad.kieAspectOverride === "9:16" || ad.kieAspectOverride === "1:1"
            ? (ad.kieAspectOverride as "9:16" | "1:1")
            : null;
    const aspect: "1:1" | "9:16" = aspectOverride ?? inferKieAspectRatioFromPrompt(prompt);

    console.log("[generateAdImages]", {
        jobId, adId,
        rawRefCount: rawPaths.length,
        resolvedRefCount: referenceImages.length,
        aspect,
        aspectSource: aspectOverride ? "override" : "prompt",
    });

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

        return NextResponse.json({ ok: true, adId, imageUrls: urls, aspect, referenceCount: referenceImages.length });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await prisma.ad.update({
            where: { id: adId },
            data: { status: "kie_error", kieResult: `Kie generation failed:\n\n${message}` },
        });
        return NextResponse.json({ ok: false, adId, error: message }, { status: 500 });
    }
}
