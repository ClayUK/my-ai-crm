import { prisma } from "@/src/lib/prisma";

export const FUNDRAISER_BRAIN_SCOPE = "fundraiser";

/** If Prisma client was generated before CreativeBrain existed, this is undefined until `npx prisma generate` + dev restart. */
function creativeBrainDb() {
    const db = (
        prisma as unknown as {
            creativeBrain?: {
                findUnique: (args: {
                    where: { scope: string };
                }) => Promise<{
                    previousWinningPrompts: string;
                    anglesList: string;
                    additionalInfo: string;
                } | null>;
                upsert: (args: unknown) => Promise<unknown>;
            };
        }
    ).creativeBrain;
    return db;
}

export const CREATIVE_BRAIN_PRISMA_FIX =
    "Restart the dev server after running: npx prisma generate && npx prisma db push";

/** Map donation style template id → additionalInfo key */
export function donationStyleTemplateLabel(styleTemplateId: string): string {
    switch (styleTemplateId) {
        case "1":
            return "UGC SNAPCHAT";
        case "2":
            return "NATIVE ORGANIC";
        case "3":
            return "HYPER REALISTIC CLICKBAIT";
        case "4":
            return "CREATIVE CONCEPT";
        case "5":
            return "ILLUSTRATED AI";
        case "6":
            return "KLING VIDEO READY";
        default:
            return "UGC SNAPCHAT";
    }
}

export const TEMPLATE_ID_TO_BRAIN_KEY: Record<string, string> = {
    "1": "UGC_SNAPCHAT",
    "2": "NATIVE_ORGANIC",
    "3": "HYPER_CLICKBAIT",
    "4": "CREATIVE_CONCEPT",
    "5": "ILLUSTRATED",
    "6": "KLING_VIDEO",
};

/** Default batch mixer pool when Memory has no `VAR_*` lines. */
export const VAR_BRAIN_KEYS = [
    "VAR_HIGHER_AGGRESSION",
    "VAR_LOWER_AGGRESSION",
    "VAR_ADD_TEXT",
    "VAR_NO_TEXT",
    "VAR_STRONGER_CTA",
    "VAR_HIGHER_QUALITY",
    "VAR_BEFORE_AFTER",
] as const;

export type VarKeyRow = { key: string; value: string };

/**
 * Split `additionalInfo` into (a) global + template keys (UGC_SNAPCHAT, …) and
 * (b) variation keys (VAR_*) for the Memory UI editor.
 */
export function splitAdditionalInfoSections(text: string): {
    globalAndTemplateLines: string;
    varKeyRows: VarKeyRow[];
} {
    const lines = (text || "").split(/\r?\n/);
    const varRows: VarKeyRow[] = [];
    const otherLines: string[] = [];
    const varIndexByKey = new Map<string, number>();

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            otherLines.push(line);
            continue;
        }
        if (trimmed.startsWith("#")) {
            otherLines.push(line);
            continue;
        }
        const eq = trimmed.indexOf("=");
        if (eq <= 0) {
            otherLines.push(line);
            continue;
        }
        const key = trimmed
            .slice(0, eq)
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "_");
        const val = trimmed.slice(eq + 1).trim();
        if (key.startsWith("VAR_")) {
            const existing = varIndexByKey.get(key);
            if (existing !== undefined) {
                varRows[existing] = { key, value: val };
            } else {
                varIndexByKey.set(key, varRows.length);
                varRows.push({ key, value: val });
            }
        } else {
            otherLines.push(line);
        }
    }

    return {
        globalAndTemplateLines: otherLines.join("\n"),
        varKeyRows: varRows,
    };
}

/** Merge editor sections back into a single `additionalInfo` string. */
export function mergeAdditionalInfoSections(
    globalAndTemplateLines: string,
    varKeyRows: VarKeyRow[]
): string {
    const normRows = varKeyRows
        .map((r) => ({
            key: r.key
                .trim()
                .toUpperCase()
                .replace(/\s+/g, "_"),
            value: r.value.trim(),
        }))
        .filter((r) => r.key.startsWith("VAR_") && r.key.length > 4);

    const varLines = normRows.map((r) => `${r.key} = ${r.value}`);
    const g = (globalAndTemplateLines || "").replace(/\s+$/, "");
    if (!g && varLines.length === 0) return "";
    if (!g) return varLines.join("\n");
    if (varLines.length === 0) return g;
    return `${g}\n\n${varLines.join("\n")}`;
}

/**
 * Keys the batch planner randomly attaches to slots. If Memory defines any
 * `VAR_*` keys, only those are used; otherwise {@link VAR_BRAIN_KEYS}.
 */
export function resolveVarKeyPoolFromAdditionalInfo(
    additionalInfo: string
): string[] {
    const { keyed } = parseKeyedAdditionalInfo(additionalInfo);
    const fromMemory: string[] = [];
    for (const k of keyed.keys()) {
        if (k.startsWith("VAR_")) fromMemory.push(k);
    }
    if (fromMemory.length > 0) return fromMemory;
    return [...VAR_BRAIN_KEYS];
}

function resolveVarKeyConflicts(keys: string[], random: () => number): string[] {
    const set = new Set(keys);
    if (set.has("VAR_ADD_TEXT") && set.has("VAR_NO_TEXT")) {
        if (random() < 0.5) set.delete("VAR_NO_TEXT");
        else set.delete("VAR_ADD_TEXT");
    }
    return Array.from(set);
}

export type PlanFundraiserBatchOptions = {
    /** If set and non-empty, random slot VAR attachments are drawn only from this pool. */
    varKeyPool?: string[];
};

export type CreativeBrainRow = {
    previousWinningPrompts: string;
    anglesList: string;
    additionalInfo: string;
};

/**
 * Parse lines like KEY = value. Keys are trimmed uppercase segments before first =.
 * Lines without = (or empty key) count as "global" prose.
 */
export function parseKeyedAdditionalInfo(text: string): {
    globalLines: string[];
    keyed: Map<string, string>;
} {
    const globalLines: string[] = [];
    const keyed = new Map<string, string>();
    const lines = (text || "").split(/\r?\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq <= 0) {
            globalLines.push(trimmed);
            continue;
        }
        const key = trimmed.slice(0, eq).trim().toUpperCase().replace(/\s+/g, "_");
        const val = trimmed.slice(eq + 1).trim();
        if (key) keyed.set(key, val);
    }
    return { globalLines, keyed };
}

export function buildBrainPromptSection(
    brain: CreativeBrainRow | null,
    activeKeys: string[]
): string {
    if (!brain) return "";

    const winners = (brain.previousWinningPrompts || "").trim();
    const angles = (brain.anglesList || "").trim();
    const { globalLines, keyed } = parseKeyedAdditionalInfo(
        brain.additionalInfo || ""
    );

    const keySet = new Set(
        activeKeys.map((k) => k.trim().toUpperCase().replace(/\s+/g, "_"))
    );

    const keyedBlocks: string[] = [];
    for (const k of keySet) {
        const v = keyed.get(k);
        if (v) keyedBlocks.push(`${k}: ${v}`);
    }

    const globalBlock =
        globalLines.length > 0
            ? `\nGLOBAL CREATIVE NOTES:\n${globalLines.join("\n")}`
            : "";

    const keyedBlock =
        keyedBlocks.length > 0
            ? `\nACTIVE STYLE / OPTION INSTRUCTIONS (apply these strictly):\n${keyedBlocks.join("\n\n")}`
            : "";

    return `
=== FUNDRAISER CREATIVE BRAIN (Memory) ===
Use these as patterns and ingredients. Do not copy verbatim — adapt to this fundraiser.

PREVIOUS WINNING PROMPTS (examples):
${winners || "(none saved)"}

ANGLE LIST (rotate / prioritize; avoid repeating the same angle across ads in one batch):
${angles || "(none saved)"}
${keyedBlock}
${globalBlock}
=== END BRAIN ===
`.trim();
}

/** Shared preamble once per batch; pair with `buildBrainKeyedInstructions` per slot. */
export function buildBrainStaticPreamble(brain: CreativeBrainRow | null): string {
    if (!brain) return "";
    const winners = (brain.previousWinningPrompts || "").trim();
    const angles = (brain.anglesList || "").trim();
    const { globalLines } = parseKeyedAdditionalInfo(brain.additionalInfo || "");
    const globalBlock =
        globalLines.length > 0
            ? `\nGLOBAL CREATIVE NOTES:\n${globalLines.join("\n")}`
            : "";
    return `
=== FUNDRAISER CREATIVE BRAIN (Memory) ===
Use these as patterns and ingredients. Do not copy verbatim — adapt to this fundraiser.

PREVIOUS WINNING PROMPTS (examples):
${winners || "(none saved)"}

ANGLE LIST (rotate / prioritize; avoid repeating the same angle across ads in one batch):
${angles || "(none saved)"}
${globalBlock}
`.trim();
}

export function buildBrainKeyedInstructions(
    brain: CreativeBrainRow | null,
    activeKeys: string[]
): string {
    if (!brain) return "";
    const { keyed } = parseKeyedAdditionalInfo(brain.additionalInfo || "");
    const keySet = new Set(
        activeKeys.map((k) => k.trim().toUpperCase().replace(/\s+/g, "_"))
    );
    const keyedBlocks: string[] = [];
    for (const k of keySet) {
        const v = keyed.get(k);
        if (v) keyedBlocks.push(`${k}: ${v}`);
    }
    if (keyedBlocks.length === 0) return "";
    return `ACTIVE STYLE / OPTION INSTRUCTIONS (apply strictly for this slot):\n${keyedBlocks.join("\n\n")}`;
}

export function helperSettingsToVarKeys(helpers: {
    higherAggression?: boolean;
    lowerAggression?: boolean;
    addText?: boolean;
    noText?: boolean;
    strongerCTA?: boolean;
    higherQuality?: boolean;
    beforeAfter?: boolean;
}): string[] {
    const keys: string[] = [];
    if (helpers.higherAggression) keys.push("VAR_HIGHER_AGGRESSION");
    if (helpers.lowerAggression) keys.push("VAR_LOWER_AGGRESSION");
    if (helpers.addText) keys.push("VAR_ADD_TEXT");
    if (helpers.noText) keys.push("VAR_NO_TEXT");
    if (helpers.strongerCTA) keys.push("VAR_STRONGER_CTA");
    if (helpers.higherQuality) keys.push("VAR_HIGHER_QUALITY");
    if (helpers.beforeAfter) keys.push("VAR_BEFORE_AFTER");
    if (keys.includes("VAR_ADD_TEXT") && keys.includes("VAR_NO_TEXT")) {
        return keys.filter((k) => k !== "VAR_NO_TEXT");
    }
    return keys;
}

/** @deprecated Variation UI no longer maps checkboxes to VAR_*; batch uses Memory keys only. */
export function variationCheckboxesToVarKeys(_flags: unknown): string[] {
    return [];
}

export function buildReferenceUrlsSection(urls: string[]): string {
    const clean = urls.map((u) => u.trim()).filter(Boolean);
    if (clean.length === 0) return "";
    return `
REFERENCE IMAGE URLS (these will be sent to the image model with the prompt; match likeness and details):
${clean.map((u, i) => `[${i}] ${u}`).join("\n")}
`.trim();
}

export async function getFundraiserCreativeBrain(): Promise<CreativeBrainRow | null> {
    const db = creativeBrainDb();
    if (!db) {
        console.error(
            `[creativeBrain] prisma.creativeBrain is missing. ${CREATIVE_BRAIN_PRISMA_FIX}`
        );
        return null;
    }
    const row = await db.findUnique({
        where: { scope: FUNDRAISER_BRAIN_SCOPE },
    });
    if (!row) return null;
    return {
        previousWinningPrompts: row.previousWinningPrompts,
        anglesList: row.anglesList,
        additionalInfo: row.additionalInfo,
    };
}

/** Random lines from "previous winning prompts" + optional swipe one-liners (one seed per batch slot). */
export function pickRandomWinningPromptSeeds(
    previousWinningPromptsText: string,
    count: number,
    random: () => number = Math.random,
    extraOneLineSeeds: string[] = []
): string[] {
    const fromBrain = (previousWinningPromptsText || "")
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
    const extras = (extraOneLineSeeds || [])
        .map((s) => s.trim())
        .filter(Boolean);
    const pool = [...fromBrain, ...extras];
    const out: string[] = [];
    for (let i = 0; i < count; i++) {
        if (pool.length === 0) {
            out.push("");
            continue;
        }
        out.push(pool[Math.floor(random() * pool.length)]!);
    }
    return out;
}

export type BatchAdPlan = {
    slotIndex: number;
    styleTemplateId: string;
    brainTemplateKey: string;
    /** Angle line from angles list (or empty) */
    angleLine: string;
    varKeys: string[];
    /** Combined keys for buildBrainPromptSection */
    activeBrainKeys: string[];
};

function shuffleInPlace<T>(arr: T[], random: () => number) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function pickRandom<T>(arr: T[], random: () => number): T {
    return arr[Math.floor(random() * arr.length)]!;
}

export function normalizeAngleLine(s: string): string {
    return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Non-empty lines from Memory "angles list" (skips # comments), deduped by
 * {@link normalizeAngleLine}.
 */
export function parseAnglesList(anglesListText: string): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const line of (anglesListText || "").split(/\r?\n/)) {
        const t = line.trim();
        if (!t || t.startsWith("#")) continue;
        const n = normalizeAngleLine(t);
        if (!seen.has(n)) {
            seen.add(n);
            out.push(t);
        }
    }
    return out;
}

function findMemoryAngleKeyForStoredAngle(
    stored: string,
    memoryAngles: string[]
): string | null {
    const s = normalizeAngleLine(stored);
    if (!s) return null;
    for (const m of memoryAngles) {
        const nm = normalizeAngleLine(m);
        if (nm === s) return nm;
        if (s.includes(nm) || nm.includes(s)) return nm;
    }
    return null;
}

/**
 * Which Memory angle lines (normalized keys) have already been used in prior
 * fundraiser batches on this job — for "fresh angles" batches without repeats.
 */
export function collectUsedAngleMemoryKeys(
    history: FundraiserBatchHistory,
    memoryAngles: string[]
): Set<string> {
    const used = new Set<string>();
    for (const batch of history.batches) {
        if (batch.plan && batch.plan.length) {
            for (const slot of batch.plan) {
                const line = slot.angleLine?.trim();
                if (!line) continue;
                const k = findMemoryAngleKeyForStoredAngle(line, memoryAngles);
                if (k) used.add(k);
            }
        } else {
            for (const ad of batch.ads) {
                const a = ad.angle?.trim();
                if (!a) continue;
                const k = findMemoryAngleKeyForStoredAngle(a, memoryAngles);
                if (k) used.add(k);
            }
        }
    }
    return used;
}

/**
 * Next batch: only angles from Memory that are not in `usedAngleKeys`, at most
 * 5 slots, unique angles within the batch, shuffled templates 1–5 (no
 * replacement per slot).
 */
export function planFundraiserBatchFreshAngles(
    anglesListText: string,
    usedAngleKeys: Set<string>,
    random: () => number = Math.random,
    options?: PlanFundraiserBatchOptions
): BatchAdPlan[] {
    const memoryLines = parseAnglesList(anglesListText);
    const remaining = memoryLines.filter(
        (m) => !usedAngleKeys.has(normalizeAngleLine(m))
    );
    const slotCount = Math.min(5, remaining.length);
    if (slotCount <= 0) return [];

    const shuffled = [...remaining];
    shuffleInPlace(shuffled, random);
    const chosenAngles = shuffled.slice(0, slotCount);

    const templateDeck = ["1", "2", "3", "4", "5"];
    shuffleInPlace(templateDeck, random);

    let baseVarPool =
        options?.varKeyPool?.filter(Boolean).length ?? 0
            ? [...(options!.varKeyPool as string[])]
            : [...VAR_BRAIN_KEYS];
    if (baseVarPool.length === 0) {
        baseVarPool = [...VAR_BRAIN_KEYS];
    }

    const plans: BatchAdPlan[] = [];
    for (let i = 0; i < slotCount; i++) {
        const styleTemplateId = templateDeck[i]!;
        const brainTemplateKey =
            TEMPLATE_ID_TO_BRAIN_KEY[styleTemplateId] || "UGC_SNAPCHAT";
        const angleLine = chosenAngles[i]!;
        const varPool = [...baseVarPool];
        shuffleInPlace(varPool, random);
        const nVar = Math.floor(random() * 4);
        const rawKeys = varPool.slice(0, nVar);
        const varKeys = resolveVarKeyConflicts(rawKeys, random);
        const activeBrainKeys = [brainTemplateKey, ...varKeys];
        plans.push({
            slotIndex: i + 1,
            styleTemplateId,
            brainTemplateKey,
            angleLine,
            varKeys,
            activeBrainKeys,
        });
    }

    return plans;
}

/**
 * Build 5 randomized slot plans: static templates 1–5 only (no Kling in batch).
 * Use variations (Kling pack) or per-ad "Kling ready" for video workflows.
 */
export function planFundraiserBatchOfFive(
    anglesListText: string,
    random: () => number = Math.random,
    options?: PlanFundraiserBatchOptions
): BatchAdPlan[] {
    const angleLines = (anglesListText || "")
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);

    const templateIds = ["1", "2", "3", "4", "5"];
    const deck = [...templateIds];
    shuffleInPlace(deck, random);

    let baseVarPool =
        options?.varKeyPool?.filter(Boolean).length ?? 0
            ? [...(options!.varKeyPool as string[])]
            : [...VAR_BRAIN_KEYS];
    if (baseVarPool.length === 0) {
        baseVarPool = [...VAR_BRAIN_KEYS];
    }

    const plans: BatchAdPlan[] = [];
    for (let i = 0; i < 5; i++) {
        const styleTemplateId = deck[i % deck.length]!;
        const brainTemplateKey =
            TEMPLATE_ID_TO_BRAIN_KEY[styleTemplateId] || "UGC_SNAPCHAT";
        const angleLine =
            angleLines.length > 0 ? pickRandom(angleLines, random) : "";

        const varPool = [...baseVarPool];
        shuffleInPlace(varPool, random);
        const nVar = Math.floor(random() * 4);
        const rawKeys = varPool.slice(0, nVar);
        const varKeys = resolveVarKeyConflicts(rawKeys, random);

        const activeBrainKeys = [brainTemplateKey, ...varKeys];
        plans.push({
            slotIndex: i + 1,
            styleTemplateId,
            brainTemplateKey,
            angleLine,
            varKeys,
            activeBrainKeys,
        });
    }

    return plans;
}

export type FundraiserBatchPlanSlot = {
    slotIndex: number;
    styleTemplateId: string;
    templateLabel: string;
    angleLine: string;
    varKeys: string[];
    winningPromptSeed?: string;
};

export type FundraiserBatchHistory = {
    batches: Array<{
        at: string;
        plan?: FundraiserBatchPlanSlot[];
        ads: Array<{
            hook?: string;
            angle?: string;
            templateId?: string;
        }>;
    }>;
};

export function parseFundraiserBatchHistory(
    raw: string | null | undefined
): FundraiserBatchHistory {
    if (!raw?.trim()) return { batches: [] };
    try {
        const p = JSON.parse(raw) as FundraiserBatchHistory;
        if (!p || !Array.isArray(p.batches)) return { batches: [] };
        return p;
    } catch {
        return { batches: [] };
    }
}

export function appendFundraiserBatchHistory(
    existing: string | null | undefined,
    newAds: Array<{ hook?: string; angle?: string; templateId?: string }>,
    plan?: FundraiserBatchPlanSlot[]
): string {
    const hist = parseFundraiserBatchHistory(existing);
    hist.batches.push({
        at: new Date().toISOString(),
        ...(plan && plan.length ? { plan } : {}),
        ads: newAds.map((a) => ({
            hook: a.hook?.slice(0, 120),
            angle: a.angle?.slice(0, 120),
            templateId: a.templateId,
        })),
    });
    while (hist.batches.length > 12) hist.batches.shift();
    return JSON.stringify(hist);
}

export function formatBatchHistoryForPrompt(
    hist: FundraiserBatchHistory
): string {
    if (!hist.batches.length) return "(no prior batches on this campaign)";
    const lines: string[] = [];
    for (const b of hist.batches.slice(-6)) {
        for (const a of b.ads) {
            lines.push(
                `- ${a.templateId || "?"} | ${(a.angle || "").slice(0, 80)} | ${(a.hook || "").slice(0, 80)}`
            );
        }
    }
    return lines.join("\n") || "(empty)";
}
