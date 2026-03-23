import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

function safeDownloadFileName(raw: string | null): string {
    const fallback = "sacredstatics-image.png";
    if (!raw?.trim()) return fallback;
    const base = raw
        .replace(/\.(png|jpe?g|webp)$/i, "")
        .replace(/[^\w.\- ()[\]]+/g, "_")
        .trim()
        .slice(0, 100);
    const withExt = /\.(png|jpe?g|webp)$/i.test(raw)
        ? raw.replace(/[^\w.\- ()[\]]+/g, "_").trim().slice(0, 120)
        : `${base || "sacredstatics-image"}.png`;
    return withExt || fallback;
}

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const filename = safeDownloadFileName(searchParams.get("filename"));

    const row = await prisma.image.findUnique({
        where: { id },
        select: { url: true },
    });

    if (!row?.url?.trim()) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let upstream: Response;
    try {
        upstream = await fetch(row.url, { redirect: "follow" });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch image" },
            { status: 502 }
        );
    }

    if (!upstream.ok) {
        return NextResponse.json(
            { error: "Image URL returned an error" },
            { status: 502 }
        );
    }

    const contentType =
        upstream.headers.get("content-type") || "application/octet-stream";
    const buf = Buffer.from(await upstream.arrayBuffer());

    return new NextResponse(buf, {
        status: 200,
        headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${filename.replace(/"/g, "")}"`,
            "Cache-Control": "private, no-store",
        },
    });
}
