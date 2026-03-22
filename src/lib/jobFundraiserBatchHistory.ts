import { prisma } from "@/src/lib/prisma";

/**
 * Read/write `Job.fundraiserBatchHistory` via Prisma (PostgreSQL-safe).
 * Previously used raw SQL for older generated clients; the field is in schema now.
 */
export async function readJobFundraiserBatchHistory(
    jobId: string
): Promise<string | null> {
    const row = await prisma.job.findUnique({
        where: { id: jobId },
        select: { fundraiserBatchHistory: true },
    });
    return row?.fundraiserBatchHistory ?? null;
}

export async function writeJobFundraiserBatchHistory(
    jobId: string,
    value: string
): Promise<void> {
    await prisma.job.update({
        where: { id: jobId },
        data: { fundraiserBatchHistory: value },
    });
}
