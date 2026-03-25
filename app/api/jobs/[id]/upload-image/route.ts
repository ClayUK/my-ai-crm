import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

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

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
        return NextResponse.json({ error: "No file provided. Send multipart/form-data with field 'file'" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `ref-${randomUUID()}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads", jobId);
    await mkdir(uploadDir, { recursive: true });

    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Store as public URL path
    const publicPath = `/uploads/${jobId}/${filename}`;

    await prisma.referenceAsset.create({
        data: {
            jobId,
            filePath: publicPath,
            originalName: file.name,
            mimeType: file.type || `image/${ext}`,
        },
    });

    return NextResponse.json({
        ok: true,
        jobId,
        filePath: publicPath,
        originalName: file.name,
    });
}
