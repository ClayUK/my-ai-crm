import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

function authOk(req: NextRequest): boolean {
    const secret = process.env.CRM_AGENT_SECRET;
    if (!secret) return true;
    return req.headers.get("x-crm-secret") === secret;
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!authOk(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: jobId } = await params;
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const urls: string[] = Array.isArray(body.urls) ? body.urls : body.url ? [body.url] : [];

    if (urls.length === 0) {
        return NextResponse.json({ error: "Provide urls array or url string" }, { status: 400 });
    }

    const created = [];
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i]!.trim();
        if (!url) continue;
        const asset = await prisma.referenceAsset.create({
            data: {
                jobId,
                filePath: url,
                originalName: `reference-${i + 1}.jpg`,
                mimeType: "image/jpeg",
            },
        });
        created.push(asset.id);
    }

    return NextResponse.json({ ok: true, jobId, added: created.length });
}
