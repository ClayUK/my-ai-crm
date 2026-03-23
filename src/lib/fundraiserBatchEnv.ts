import { redirect } from "next/navigation";

/** Query key when batch is blocked for empty Memory (strict mode). */
export const FUNDRAISER_BATCH_GUARD_QUERY_KEY = "batchGuard";

/**
 * When `FUNDRAISER_BATCH_REQUIRE_MEMORY=true`, "Generate 5 ads" / fresh-angle batch
 * redirects to the job with `?batchGuard=need_memory` if Memory is thin.
 */
export function isFundraiserBatchMemoryRequired(): boolean {
    const v = process.env.FUNDRAISER_BATCH_REQUIRE_MEMORY?.trim().toLowerCase();
    return v === "true" || v === "1" || v === "yes";
}

export function redirectWhenFundraiserBatchRequiresMemory(
    jobId: string,
    brainThin: boolean
): void {
    if (!isFundraiserBatchMemoryRequired() || !brainThin) return;
    redirect(
        `/jobs/${jobId}?${new URLSearchParams({
            [FUNDRAISER_BATCH_GUARD_QUERY_KEY]: "need_memory",
        }).toString()}`
    );
}
