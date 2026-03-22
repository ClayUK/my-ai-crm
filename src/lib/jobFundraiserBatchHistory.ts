import { prisma } from "@/src/lib/prisma";

/**
 * Read/write `Job.fundraiserBatchHistory` via raw SQL so batch history works even when
 * `@prisma/client` was generated from an older schema (avoids PrismaClientValidationError
 * on `job.update({ data: { fundraiserBatchHistory } })` until `npx prisma generate`).
 */
export async function readJobFundraiserBatchHistory(
    jobId: string
): Promise<string | null> {
    const rows = await prisma.$queryRaw<Array<{ fundraiserBatchHistory: string | null }>>`
        SELECT "fundraiserBatchHistory" FROM "Job" WHERE "id" = ${jobId}
    `;
    return rows[0]?.fundraiserBatchHistory ?? null;
}

export async function writeJobFundraiserBatchHistory(
    jobId: string,
    value: string
): Promise<void> {
    await prisma.$executeRaw`
        UPDATE "Job" SET "fundraiserBatchHistory" = ${value} WHERE "id" = ${jobId}
    `;
}
