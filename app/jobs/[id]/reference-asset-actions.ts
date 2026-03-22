"use server";

import { prisma } from "@/src/lib/prisma";
import { uploadReferenceFilesToKie } from "@/src/lib/kie";
import { redirect } from "next/navigation";
import {
    MAX_AD_REFERENCE_IMAGES,
    MAX_JOB_SHARED_REFERENCE_IMAGES,
} from "./reference-asset-constants";

function collectUploadedFiles(formData: FormData, fieldName: string): File[] {
    const raw = formData.getAll(fieldName);
    return raw.filter(
        (item): item is File =>
            !!item &&
            typeof (item as File).size === "number" &&
            (item as File).size > 0
    );
}

/** Remove one reference row (job-level shared or ad-specific). */
export async function deleteReferenceAsset(formData: FormData) {
    const jobId = formData.get("jobId")?.toString();
    const refId = formData.get("referenceAssetId")?.toString();
    const adIdRaw = formData.get("adId")?.toString();

    if (!jobId || !refId) throw new Error("Missing jobId or referenceAssetId");

    const existing = await prisma.referenceAsset.findFirst({
        where:
            adIdRaw && adIdRaw.trim().length > 0
                ? { id: refId, jobId, adId: adIdRaw.trim() }
                : { id: refId, jobId, adId: null },
    });

    if (!existing) {
        redirect(`/jobs/${jobId}`);
    }

    await prisma.referenceAsset.delete({ where: { id: refId } });
    redirect(`/jobs/${jobId}`);
}

/** Append shared (job-level) reference images — does not replace existing. */
export async function appendJobSharedReferenceImages(formData: FormData) {
    const jobId = formData.get("jobId")?.toString();
    if (!jobId) throw new Error("Missing jobId");

    const files = collectUploadedFiles(formData, "referenceFiles");
    if (files.length === 0) {
        redirect(`/jobs/${jobId}`);
    }

    const existingCount = await prisma.referenceAsset.count({
        where: { jobId, adId: null },
    });
    const room = Math.max(0, MAX_JOB_SHARED_REFERENCE_IMAGES - existingCount);
    if (room === 0) {
        redirect(`/jobs/${jobId}`);
    }

    const slice = files.slice(0, room);
    const uploaded = await uploadReferenceFilesToKie(slice);

    await prisma.referenceAsset.createMany({
        data: uploaded.map((file) => ({
            jobId,
            adId: null,
            filePath: file.filePath,
            originalName: file.originalName,
            mimeType: file.mimeType,
        })),
    });

    redirect(`/jobs/${jobId}`);
}

/** Append images for a specific ad tab — does not replace existing. */
export async function appendAdReferenceImages(formData: FormData) {
    const jobId = formData.get("jobId")?.toString();
    const adId = formData.get("adId")?.toString();
    if (!jobId || !adId) throw new Error("Missing jobId or adId");

    const files = collectUploadedFiles(formData, "referenceFiles");
    if (files.length === 0) {
        redirect(`/jobs/${jobId}`);
    }

    const existingCount = await prisma.referenceAsset.count({
        where: { jobId, adId },
    });
    const room = Math.max(0, MAX_AD_REFERENCE_IMAGES - existingCount);
    if (room === 0) {
        redirect(`/jobs/${jobId}`);
    }

    const slice = files.slice(0, room);
    const uploaded = await uploadReferenceFilesToKie(slice);

    await prisma.referenceAsset.createMany({
        data: uploaded.map((file) => ({
            jobId,
            adId,
            filePath: file.filePath,
            originalName: file.originalName,
            mimeType: file.mimeType,
        })),
    });

    redirect(`/jobs/${jobId}`);
}
