import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import archiver from "archiver";
import { Readable } from "stream";

function authOk(req: NextRequest): boolean {
    const secret = process.env.CRM_AGENT_SECRET;
    if (!secret) return true;
    return req.headers.get("x-crm-secret") === secret;
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!authOk(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: jobId } = await params;
    const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
            ads: {
                include: { images: { orderBy: { createdAt: "desc" } } },
                orderBy: { adNumber: "asc" },
            },
        },
    });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const adsWithImages = job.ads.filter((ad) => ad.images.length > 0);
    if (adsWithImages.length === 0) {
        return NextResponse.json({ error: "No generated images found" }, { status: 400 });
    }

    // Build ZIP in memory
    const archive = archiver("zip", { zlib: { level: 6 } });
    const chunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
        archive.on("data", (chunk: Buffer) => chunks.push(chunk));
        archive.on("end", resolve);
        archive.on("error", reject);

        // Add a manifest JSON
        const manifest = {
            jobId,
            url: job.url,
            subjectName: job.subject_name,
            generatedAt: new Date().toISOString(),
            ads: adsWithImages.map((ad) => {
                let sourceBlock: Record<string, unknown> = {};
                try { sourceBlock = JSON.parse(ad.sourceBlock || "{}"); } catch {}
                return {
                    adNumber: ad.adNumber,
                    angle: sourceBlock.angle || "",
                    hook: sourceBlock.hook || "",
                    headline: sourceBlock.headline || "",
                    primaryText: sourceBlock.primaryText || "",
                    cta: sourceBlock.cta || "",
                    imageUrls: ad.images.map((i) => i.url),
                };
            }),
        };
        archive.append(JSON.stringify(manifest, null, 2), { name: "manifest.json" });

        // Queue image downloads
        let pending = 0;
        const tryFinalize = () => {
            if (pending === 0) archive.finalize();
        };

        for (const ad of adsWithImages) {
            for (let imgIdx = 0; imgIdx < ad.images.length; imgIdx++) {
                const image = ad.images[imgIdx]!;
                pending++;
                fetch(image.url)
                    .then((res) => {
                        if (!res.ok || !res.body) {
                            pending--;
                            tryFinalize();
                            return;
                        }
                        const ext = image.url.toLowerCase().includes(".png") ? "png" :
                            image.url.toLowerCase().includes(".webp") ? "webp" : "jpg";
                        const filename = `ad-${ad.adNumber}-img${imgIdx + 1}.${ext}`;
                        const nodeStream = Readable.from(res.body as any);
                        archive.append(nodeStream, { name: filename });
                        pending--;
                        tryFinalize();
                    })
                    .catch(() => {
                        pending--;
                        tryFinalize();
                    });
            }
        }

        if (pending === 0) archive.finalize();
    });

    const zipBuffer = Buffer.concat(chunks);
    const shortId = jobId.slice(0, 8);
    const filename = `campaign-${shortId}-${adsWithImages.length}ads.zip`;

    return new NextResponse(zipBuffer, {
        status: 200,
        headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Content-Length": String(zipBuffer.length),
        },
    });
}
