export const dynamic = "force-dynamic"
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { CREATIVE_BRAIN_PRISMA_FIX, FUNDRAISER_BRAIN_SCOPE } from "@/src/lib/creativeBrain";
import { DONATION_SWIPE_BATCH_LIMIT } from "@/src/lib/swipeBrain";
import { CreativeBrainForm } from "./creative-brain-form";

export default async function MemoryPage() {
    const brainDb = (
        prisma as unknown as {
            creativeBrain?: {
                findUnique: (args: unknown) => Promise<unknown>;
            };
        }
    ).creativeBrain;

    const [brainRaw, donationSwipeEntries, donationCategories, activeDonationSwipes] =
        await Promise.all([
            brainDb?.findUnique
                ? brainDb.findUnique({
                      where: { scope: FUNDRAISER_BRAIN_SCOPE },
                  })
                : Promise.resolve(null),
            prisma.swipeEntry.count({ where: { marketType: "donation" } }),
            prisma.swipeCategory.count({ where: { marketType: "donation" } }),
            prisma.swipeEntry.count({
                where: { marketType: "donation", status: "active" },
            }),
        ]);

    const brain = brainRaw as {
        previousWinningPrompts: string;
        anglesList: string;
        additionalInfo: string;
    } | null;

    return (
        <div>
            <div style={{ marginBottom: 18 }}>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>
                    Creative Brain
                </h1>
                <div style={{ marginTop: 6, opacity: 0.75, fontSize: 13 }}>
                    Global fundraiser memory: prompts, angles, and keyed notes
                    used in ad generation and batch runs.
                </div>
            </div>

            <CreativeBrainForm initialBrain={brain} />

            <div
                style={{
                    marginTop: 20,
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    padding: 16,
                    background: "var(--surface)",
                }}
            >
                <div style={{ fontWeight: 900, marginBottom: 6 }}>
                    Saved swipe bank (fundraiser)
                </div>
                <div style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.55 }}>
                    Categories: {donationCategories} • Entries:{" "}
                    {donationSwipeEntries} • <strong>Active</strong> (pulled into
                    batches): {activeDonationSwipes}. Each <strong>Generate 5 ads</strong>{" "}
                    run includes up to {DONATION_SWIPE_BATCH_LIMIT} active entries (by
                    performance score, then newest) as structured swipe context and
                    random prompt seeds alongside Creative Brain + evaluations.
                </div>
                <div style={{ marginTop: 12 }}>
                    <Link
                        href="/admin/dono"
                        style={{
                            display: "inline-block",
                            padding: "10px 14px",
                            borderRadius: 12,
                            border: "1px solid var(--borderStrong)",
                            color: "var(--foreground)",
                            textDecoration: "none",
                            fontSize: 13,
                            fontWeight: 700,
                        }}
                    >
                        Open swipe bank admin
                    </Link>
                </div>
            </div>
        </div>
    );
}
