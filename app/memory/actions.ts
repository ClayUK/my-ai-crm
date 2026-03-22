"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { CREATIVE_BRAIN_PRISMA_FIX, FUNDRAISER_BRAIN_SCOPE } from "@/src/lib/creativeBrain";

export async function saveFundraiserCreativeBrain(formData: FormData) {
    const previousWinningPrompts = String(
        formData.get("previousWinningPrompts") || ""
    );
    const anglesList = String(formData.get("anglesList") || "");
    const additionalInfo = String(formData.get("additionalInfo") || "");

    const db = (
        prisma as unknown as {
            creativeBrain?: {
                upsert: (args: unknown) => Promise<unknown>;
            };
        }
    ).creativeBrain;
    if (!db?.upsert) {
        throw new Error(`Creative Brain is unavailable. ${CREATIVE_BRAIN_PRISMA_FIX}`);
    }

    await db.upsert({
        where: { scope: FUNDRAISER_BRAIN_SCOPE },
        create: {
            scope: FUNDRAISER_BRAIN_SCOPE,
            previousWinningPrompts,
            anglesList,
            additionalInfo,
        },
        update: {
            previousWinningPrompts,
            anglesList,
            additionalInfo,
        },
    });

    revalidatePath("/memory");
}
