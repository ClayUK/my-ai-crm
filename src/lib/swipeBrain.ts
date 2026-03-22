import { prisma } from "@/src/lib/prisma";

/** Max donation swipe entries merged into each "Generate 5 ads" batch (keep prompt focused). */
export const DONATION_SWIPE_BATCH_LIMIT = 6;

export type DonationSwipeBatchContext = {
    /** Structured block for Claude (empty if no swipes). */
    formattedSection: string;
    /** One line per swipe for random WINNING_PROMPT_SEED pool (with Creative Brain lines). */
    seedLines: string[];
    /** Count loaded (for UI). */
    count: number;
};

function collapseToSeedLine(text: string, maxLen = 1500): string {
    return (text || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, maxLen);
}

function formatSwipeEntryBlock(
    index: number,
    e: {
        title: string;
        angle: string | null;
        hook: string | null;
        concept: string | null;
        copy: string | null;
        cta: string | null;
        visualDirection: string | null;
        whyItWorks: string | null;
        notes: string | null;
        category: { name: string };
    },
    maxVisual = 3500
): string {
    const lines: string[] = [
        `### Swipe ${index + 1}: ${e.title}`,
        `- Category: ${e.category.name}`,
    ];
    if (e.angle?.trim()) lines.push(`- Angle: ${e.angle.trim()}`);
    if (e.hook?.trim()) lines.push(`- Hook: ${e.hook.trim()}`);
    if (e.concept?.trim()) lines.push(`- Headline / concept: ${e.concept.trim()}`);
    if (e.copy?.trim()) lines.push(`- Primary copy: ${e.copy.trim()}`);
    if (e.cta?.trim()) lines.push(`- CTA: ${e.cta.trim()}`);
    if (e.visualDirection?.trim()) {
        const v = e.visualDirection.trim();
        lines.push(
            `- Visual / Kie prompt:\n${v.length > maxVisual ? `${v.slice(0, maxVisual)}…` : v}`
        );
    }
    if (e.whyItWorks?.trim()) lines.push(`- Why it works: ${e.whyItWorks.trim()}`);
    if (e.notes?.trim()) lines.push(`- Notes: ${e.notes.trim()}`);
    return lines.join("\n");
}

/**
 * Load top donation swipes for batch generation: structured reference + seed lines.
 */
export async function getDonationSwipeBatchContext(): Promise<DonationSwipeBatchContext> {
    const entries = await prisma.swipeEntry.findMany({
        where: {
            marketType: "donation",
            status: "active",
        },
        orderBy: [{ performanceScore: "desc" }, { createdAt: "desc" }],
        take: DONATION_SWIPE_BATCH_LIMIT,
        include: {
            category: { select: { name: true } },
        },
    });

    if (entries.length === 0) {
        return { formattedSection: "", seedLines: [], count: 0 };
    }

    const blocks: string[] = [];
    const seedLines: string[] = [];

    entries.forEach((e, i) => {
        blocks.push(formatSwipeEntryBlock(i, e));
        const forSeed =
            e.visualDirection?.trim() ||
            [e.hook, e.angle, e.concept].filter(Boolean).join(" — ");
        const line = collapseToSeedLine(forSeed);
        if (line) seedLines.push(line);
    });

    const formattedSection = `
=== SWIPE BANK (saved winning / reference ads — use for STRUCTURE, pacing, lighting vocabulary, block style) ===
These are from your swipe library (other campaigns). Do NOT copy their subject, names, or specific story beats.
Ground every output in THIS job's EVALUATIONS and campaign inputs above. Adapt patterns only.

${blocks.join("\n\n---\n\n")}

=== END SWIPE BANK ===
`.trim();

    return {
        formattedSection,
        seedLines,
        count: entries.length,
    };
}
