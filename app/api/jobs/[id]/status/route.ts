import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import {
    parseFundraiserBatchHistory,
    parseAnglesList,
    collectUsedAngleMemoryKeys,
    normalizeAngleLine,
    getFundraiserCreativeBrain,
} from "@/src/lib/creativeBrain";
import { readJobFundraiserBatchHistory } from "@/src/lib/jobFundraiserBatchHistory";
import { resolveDonationEvaluations } from "@/src/lib/donationWizard";

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

    const { pageEvaluation, backstoryEvaluation, referenceEvaluation } = resolveDonationEvaluations(job);
    const batchHistRaw = await readJobFundraiserBatchHistory(jobId);
    const batchHist = parseFundraiserBatchHistory(batchHistRaw);
    const brain = await getFundraiserCreativeBrain();
    const memAngles = parseAnglesList(brain?.anglesList ?? "");
    const usedKeys = collectUsedAngleMemoryKeys(batchHist, memAngles);
    const remainingAngles = memAngles.filter((m) => !usedKeys.has(normalizeAngleLine(m))).length;

    return NextResponse.json({
        jobId,
        status: job.status,
        url: job.url,
        subjectName: job.subject_name,
        evaluations: {
            page: Object.keys(pageEvaluation).length > 0,
            story: Object.keys(backstoryEvaluation).length > 0,
            // refs are optional — skipped_no_images counts as ok
            references: Object.keys(referenceEvaluation).length > 0 || !job.donationReferenceEvaluation,
        },
        memory: {
            totalAngles: memAngles.length,
            remainingAngles,
            batchesGenerated: batchHist.batches.length,
        },
        ads: job.ads.map((ad) => ({
            id: ad.id,
            adNumber: ad.adNumber,
            status: ad.status,
            hasImage: ad.images.length > 0,
            imageUrls: ad.images.map((i) => i.url),
        })),
        totalAds: job.ads.length,
        adsWithImages: job.ads.filter((ad) => ad.images.length > 0).length,
    });
}
