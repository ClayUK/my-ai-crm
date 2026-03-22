module.exports = [
"[project]/src/lib/prisma.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]();
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/src/lib/creativeBrain.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CREATIVE_BRAIN_PRISMA_FIX",
    ()=>CREATIVE_BRAIN_PRISMA_FIX,
    "FUNDRAISER_BRAIN_SCOPE",
    ()=>FUNDRAISER_BRAIN_SCOPE,
    "TEMPLATE_ID_TO_BRAIN_KEY",
    ()=>TEMPLATE_ID_TO_BRAIN_KEY,
    "VAR_BRAIN_KEYS",
    ()=>VAR_BRAIN_KEYS,
    "appendFundraiserBatchHistory",
    ()=>appendFundraiserBatchHistory,
    "buildBrainKeyedInstructions",
    ()=>buildBrainKeyedInstructions,
    "buildBrainPromptSection",
    ()=>buildBrainPromptSection,
    "buildBrainStaticPreamble",
    ()=>buildBrainStaticPreamble,
    "buildReferenceUrlsSection",
    ()=>buildReferenceUrlsSection,
    "donationStyleTemplateLabel",
    ()=>donationStyleTemplateLabel,
    "formatBatchHistoryForPrompt",
    ()=>formatBatchHistoryForPrompt,
    "getFundraiserCreativeBrain",
    ()=>getFundraiserCreativeBrain,
    "helperSettingsToVarKeys",
    ()=>helperSettingsToVarKeys,
    "parseFundraiserBatchHistory",
    ()=>parseFundraiserBatchHistory,
    "parseKeyedAdditionalInfo",
    ()=>parseKeyedAdditionalInfo,
    "pickRandomWinningPromptSeeds",
    ()=>pickRandomWinningPromptSeeds,
    "planFundraiserBatchOfFive",
    ()=>planFundraiserBatchOfFive,
    "variationCheckboxesToVarKeys",
    ()=>variationCheckboxesToVarKeys
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-rsc] (ecmascript)");
;
const FUNDRAISER_BRAIN_SCOPE = "fundraiser";
/** If Prisma client was generated before CreativeBrain existed, this is undefined until `npx prisma generate` + dev restart. */ function creativeBrainDb() {
    const db = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].creativeBrain;
    return db;
}
const CREATIVE_BRAIN_PRISMA_FIX = "Restart the dev server after running: npx prisma generate && npx prisma db push";
function donationStyleTemplateLabel(styleTemplateId) {
    switch(styleTemplateId){
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
const TEMPLATE_ID_TO_BRAIN_KEY = {
    "1": "UGC_SNAPCHAT",
    "2": "NATIVE_ORGANIC",
    "3": "HYPER_CLICKBAIT",
    "4": "CREATIVE_CONCEPT",
    "5": "ILLUSTRATED",
    "6": "KLING_VIDEO"
};
const VAR_BRAIN_KEYS = [
    "VAR_HIGHER_AGGRESSION",
    "VAR_LOWER_AGGRESSION",
    "VAR_ADD_TEXT",
    "VAR_STRONGER_CTA",
    "VAR_HIGHER_QUALITY",
    "VAR_BEFORE_AFTER"
];
function parseKeyedAdditionalInfo(text) {
    const globalLines = [];
    const keyed = new Map();
    const lines = (text || "").split(/\r?\n/);
    for (const line of lines){
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
    return {
        globalLines,
        keyed
    };
}
function buildBrainPromptSection(brain, activeKeys) {
    if (!brain) return "";
    const winners = (brain.previousWinningPrompts || "").trim();
    const angles = (brain.anglesList || "").trim();
    const { globalLines, keyed } = parseKeyedAdditionalInfo(brain.additionalInfo || "");
    const keySet = new Set(activeKeys.map((k)=>k.trim().toUpperCase().replace(/\s+/g, "_")));
    const keyedBlocks = [];
    for (const k of keySet){
        const v = keyed.get(k);
        if (v) keyedBlocks.push(`${k}: ${v}`);
    }
    const globalBlock = globalLines.length > 0 ? `\nGLOBAL CREATIVE NOTES:\n${globalLines.join("\n")}` : "";
    const keyedBlock = keyedBlocks.length > 0 ? `\nACTIVE STYLE / OPTION INSTRUCTIONS (apply these strictly):\n${keyedBlocks.join("\n\n")}` : "";
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
function buildBrainStaticPreamble(brain) {
    if (!brain) return "";
    const winners = (brain.previousWinningPrompts || "").trim();
    const angles = (brain.anglesList || "").trim();
    const { globalLines } = parseKeyedAdditionalInfo(brain.additionalInfo || "");
    const globalBlock = globalLines.length > 0 ? `\nGLOBAL CREATIVE NOTES:\n${globalLines.join("\n")}` : "";
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
function buildBrainKeyedInstructions(brain, activeKeys) {
    if (!brain) return "";
    const { keyed } = parseKeyedAdditionalInfo(brain.additionalInfo || "");
    const keySet = new Set(activeKeys.map((k)=>k.trim().toUpperCase().replace(/\s+/g, "_")));
    const keyedBlocks = [];
    for (const k of keySet){
        const v = keyed.get(k);
        if (v) keyedBlocks.push(`${k}: ${v}`);
    }
    if (keyedBlocks.length === 0) return "";
    return `ACTIVE STYLE / OPTION INSTRUCTIONS (apply strictly for this slot):\n${keyedBlocks.join("\n\n")}`;
}
function helperSettingsToVarKeys(helpers) {
    const keys = [];
    if (helpers.higherAggression) keys.push("VAR_HIGHER_AGGRESSION");
    if (helpers.lowerAggression) keys.push("VAR_LOWER_AGGRESSION");
    if (helpers.addText) keys.push("VAR_ADD_TEXT");
    if (helpers.strongerCTA) keys.push("VAR_STRONGER_CTA");
    if (helpers.higherQuality) keys.push("VAR_HIGHER_QUALITY");
    if (helpers.beforeAfter) keys.push("VAR_BEFORE_AFTER");
    return keys;
}
function variationCheckboxesToVarKeys(flags) {
    return helperSettingsToVarKeys(flags);
}
function buildReferenceUrlsSection(urls) {
    const clean = urls.map((u)=>u.trim()).filter(Boolean);
    if (clean.length === 0) return "";
    return `
REFERENCE IMAGE URLS (these will be sent to the image model with the prompt; match likeness and details):
${clean.map((u, i)=>`[${i}] ${u}`).join("\n")}
`.trim();
}
async function getFundraiserCreativeBrain() {
    const db = creativeBrainDb();
    if (!db) {
        console.error(`[creativeBrain] prisma.creativeBrain is missing. ${CREATIVE_BRAIN_PRISMA_FIX}`);
        return null;
    }
    const row = await db.findUnique({
        where: {
            scope: FUNDRAISER_BRAIN_SCOPE
        }
    });
    if (!row) return null;
    return {
        previousWinningPrompts: row.previousWinningPrompts,
        anglesList: row.anglesList,
        additionalInfo: row.additionalInfo
    };
}
function pickRandomWinningPromptSeeds(previousWinningPromptsText, count, random = Math.random, extraOneLineSeeds = []) {
    const fromBrain = (previousWinningPromptsText || "").split(/\r?\n/).map((s)=>s.trim()).filter(Boolean);
    const extras = (extraOneLineSeeds || []).map((s)=>s.trim()).filter(Boolean);
    const pool = [
        ...fromBrain,
        ...extras
    ];
    const out = [];
    for(let i = 0; i < count; i++){
        if (pool.length === 0) {
            out.push("");
            continue;
        }
        out.push(pool[Math.floor(random() * pool.length)]);
    }
    return out;
}
function shuffleInPlace(arr, random) {
    for(let i = arr.length - 1; i > 0; i--){
        const j = Math.floor(random() * (i + 1));
        [arr[i], arr[j]] = [
            arr[j],
            arr[i]
        ];
    }
}
function pickRandom(arr, random) {
    return arr[Math.floor(random() * arr.length)];
}
function planFundraiserBatchOfFive(anglesListText, random = Math.random) {
    const angleLines = (anglesListText || "").split(/\r?\n/).map((s)=>s.trim()).filter(Boolean);
    const templateIds = [
        "1",
        "2",
        "3",
        "4",
        "5"
    ];
    const deck = [
        ...templateIds
    ];
    shuffleInPlace(deck, random);
    const plans = [];
    for(let i = 0; i < 5; i++){
        const styleTemplateId = deck[i % deck.length];
        const brainTemplateKey = TEMPLATE_ID_TO_BRAIN_KEY[styleTemplateId] || "UGC_SNAPCHAT";
        const angleLine = angleLines.length > 0 ? pickRandom(angleLines, random) : "";
        const varPool = [
            ...VAR_BRAIN_KEYS
        ];
        shuffleInPlace(varPool, random);
        const nVar = Math.floor(random() * 4);
        const varKeys = varPool.slice(0, nVar);
        const activeBrainKeys = [
            brainTemplateKey,
            ...varKeys
        ];
        plans.push({
            slotIndex: i + 1,
            styleTemplateId,
            brainTemplateKey,
            angleLine,
            varKeys,
            activeBrainKeys
        });
    }
    return plans;
}
function parseFundraiserBatchHistory(raw) {
    if (!raw?.trim()) return {
        batches: []
    };
    try {
        const p = JSON.parse(raw);
        if (!p || !Array.isArray(p.batches)) return {
            batches: []
        };
        return p;
    } catch  {
        return {
            batches: []
        };
    }
}
function appendFundraiserBatchHistory(existing, newAds, plan) {
    const hist = parseFundraiserBatchHistory(existing);
    hist.batches.push({
        at: new Date().toISOString(),
        ...plan && plan.length ? {
            plan
        } : {},
        ads: newAds.map((a)=>({
                hook: a.hook?.slice(0, 120),
                angle: a.angle?.slice(0, 120),
                templateId: a.templateId
            }))
    });
    while(hist.batches.length > 12)hist.batches.shift();
    return JSON.stringify(hist);
}
function formatBatchHistoryForPrompt(hist) {
    if (!hist.batches.length) return "(no prior batches on this campaign)";
    const lines = [];
    for (const b of hist.batches.slice(-6)){
        for (const a of b.ads){
            lines.push(`- ${a.templateId || "?"} | ${(a.angle || "").slice(0, 80)} | ${(a.hook || "").slice(0, 80)}`);
        }
    }
    return lines.join("\n") || "(empty)";
}
}),
"[project]/src/lib/swipeBrain.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DONATION_SWIPE_BATCH_LIMIT",
    ()=>DONATION_SWIPE_BATCH_LIMIT,
    "getDonationSwipeBatchContext",
    ()=>getDonationSwipeBatchContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-rsc] (ecmascript)");
;
const DONATION_SWIPE_BATCH_LIMIT = 6;
function collapseToSeedLine(text, maxLen = 1500) {
    return (text || "").replace(/\s+/g, " ").trim().slice(0, maxLen);
}
function formatSwipeEntryBlock(index, e, maxVisual = 3500) {
    const lines = [
        `### Swipe ${index + 1}: ${e.title}`,
        `- Category: ${e.category.name}`
    ];
    if (e.angle?.trim()) lines.push(`- Angle: ${e.angle.trim()}`);
    if (e.hook?.trim()) lines.push(`- Hook: ${e.hook.trim()}`);
    if (e.concept?.trim()) lines.push(`- Headline / concept: ${e.concept.trim()}`);
    if (e.copy?.trim()) lines.push(`- Primary copy: ${e.copy.trim()}`);
    if (e.cta?.trim()) lines.push(`- CTA: ${e.cta.trim()}`);
    if (e.visualDirection?.trim()) {
        const v = e.visualDirection.trim();
        lines.push(`- Visual / Kie prompt:\n${v.length > maxVisual ? `${v.slice(0, maxVisual)}…` : v}`);
    }
    if (e.whyItWorks?.trim()) lines.push(`- Why it works: ${e.whyItWorks.trim()}`);
    if (e.notes?.trim()) lines.push(`- Notes: ${e.notes.trim()}`);
    return lines.join("\n");
}
async function getDonationSwipeBatchContext() {
    const entries = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].swipeEntry.findMany({
        where: {
            marketType: "donation",
            status: "active"
        },
        orderBy: [
            {
                performanceScore: "desc"
            },
            {
                createdAt: "desc"
            }
        ],
        take: DONATION_SWIPE_BATCH_LIMIT,
        include: {
            category: {
                select: {
                    name: true
                }
            }
        }
    });
    if (entries.length === 0) {
        return {
            formattedSection: "",
            seedLines: [],
            count: 0
        };
    }
    const blocks = [];
    const seedLines = [];
    entries.forEach((e, i)=>{
        blocks.push(formatSwipeEntryBlock(i, e));
        const forSeed = e.visualDirection?.trim() || [
            e.hook,
            e.angle,
            e.concept
        ].filter(Boolean).join(" — ");
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
        count: entries.length
    };
}
}),
"[project]/app/memory/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "$$RSC_SERVER_ACTION_0",
    ()=>$$RSC_SERVER_ACTION_0,
    "default",
    ()=>MemoryPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"402745c2dccf0c2b753789a83d3e13c72be90993d7":"$$RSC_SERVER_ACTION_0"},"",""] */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/creativeBrain.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$swipeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/swipeBrain.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
const $$RSC_SERVER_ACTION_0 = async function saveFundraiserCreativeBrain(formData) {
    const previousWinningPrompts = String(formData.get("previousWinningPrompts") || "");
    const anglesList = String(formData.get("anglesList") || "");
    const additionalInfo = String(formData.get("additionalInfo") || "");
    const db = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].creativeBrain;
    if (!db?.upsert) {
        throw new Error(`Creative Brain is unavailable. ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CREATIVE_BRAIN_PRISMA_FIX"]}`);
    }
    await db.upsert({
        where: {
            scope: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FUNDRAISER_BRAIN_SCOPE"]
        },
        create: {
            scope: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FUNDRAISER_BRAIN_SCOPE"],
            previousWinningPrompts,
            anglesList,
            additionalInfo
        },
        update: {
            previousWinningPrompts,
            anglesList,
            additionalInfo
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/memory");
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_0, "402745c2dccf0c2b753789a83d3e13c72be90993d7", null);
var saveFundraiserCreativeBrain = $$RSC_SERVER_ACTION_0;
async function MemoryPage() {
    const brainDb = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].creativeBrain;
    const [brainRaw, donationSwipeEntries, donationCategories, activeDonationSwipes] = await Promise.all([
        brainDb?.findUnique ? brainDb.findUnique({
            where: {
                scope: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FUNDRAISER_BRAIN_SCOPE"]
            }
        }) : Promise.resolve(null),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].swipeEntry.count({
            where: {
                marketType: "donation"
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].swipeCategory.count({
            where: {
                marketType: "donation"
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].swipeEntry.count({
            where: {
                marketType: "donation",
                status: "active"
            }
        })
    ]);
    const brain = brainRaw;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginBottom: 18
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        style: {
                            margin: 0,
                            fontSize: 26,
                            fontWeight: 900
                        },
                        children: "Creative Brain"
                    }, void 0, false, {
                        fileName: "[project]/app/memory/page.tsx",
                        lineNumber: 80,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 6,
                            opacity: 0.75,
                            fontSize: 13
                        },
                        children: "Global fundraiser memory: prompts, angles, and keyed notes used in ad generation and batch runs."
                    }, void 0, false, {
                        fileName: "[project]/app/memory/page.tsx",
                        lineNumber: 83,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/memory/page.tsx",
                lineNumber: 79,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                action: saveFundraiserCreativeBrain,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: "grid",
                        gap: 16,
                        border: "1px solid var(--border)",
                        borderRadius: 16,
                        padding: 16,
                        background: "var(--surface)"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: {
                                        display: "block",
                                        fontWeight: 800,
                                        fontSize: 13,
                                        marginBottom: 6
                                    },
                                    children: "Previous winning prompts"
                                }, void 0, false, {
                                    fileName: "[project]/app/memory/page.tsx",
                                    lineNumber: 101,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: 12,
                                        opacity: 0.75,
                                        marginBottom: 8
                                    },
                                    children: [
                                        "Paste example visual prompts or short descriptions that performed well (one per line or freeform). Up to",
                                        " ",
                                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$swipeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DONATION_SWIPE_BATCH_LIMIT"],
                                        " active donation swipe entries also merge into the same seed pool + structured context on ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Generate 5 ads"
                                        }, void 0, false, {
                                            fileName: "[project]/app/memory/page.tsx",
                                            lineNumber: 122,
                                            columnNumber: 40
                                        }, this),
                                        "."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/memory/page.tsx",
                                    lineNumber: 111,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "previousWinningPrompts",
                                    defaultValue: brain?.previousWinningPrompts || "",
                                    rows: 8,
                                    style: {
                                        width: "100%",
                                        padding: 10,
                                        borderRadius: 12,
                                        border: "1px solid var(--border)",
                                        background: "var(--surfaceElevated)",
                                        color: "var(--foreground)"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/memory/page.tsx",
                                    lineNumber: 124,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/memory/page.tsx",
                            lineNumber: 100,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: {
                                        display: "block",
                                        fontWeight: 800,
                                        fontSize: 13,
                                        marginBottom: 6
                                    },
                                    children: "Angles list"
                                }, void 0, false, {
                                    fileName: "[project]/app/memory/page.tsx",
                                    lineNumber: 140,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: 12,
                                        opacity: 0.75,
                                        marginBottom: 8
                                    },
                                    children: "One angle per line. Batches randomize from this list."
                                }, void 0, false, {
                                    fileName: "[project]/app/memory/page.tsx",
                                    lineNumber: 150,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "anglesList",
                                    defaultValue: brain?.anglesList || "",
                                    rows: 10,
                                    style: {
                                        width: "100%",
                                        padding: 10,
                                        borderRadius: 12,
                                        border: "1px solid var(--border)",
                                        background: "var(--surfaceElevated)",
                                        color: "var(--foreground)"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/memory/page.tsx",
                                    lineNumber: 159,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/memory/page.tsx",
                            lineNumber: 139,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: {
                                        display: "block",
                                        fontWeight: 800,
                                        fontSize: 13,
                                        marginBottom: 6
                                    },
                                    children: "Additional info (global notes + keyed lines)"
                                }, void 0, false, {
                                    fileName: "[project]/app/memory/page.tsx",
                                    lineNumber: 175,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: 12,
                                        opacity: 0.75,
                                        marginBottom: 8,
                                        lineHeight: 1.5
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Global lines"
                                        }, void 0, false, {
                                            fileName: "[project]/app/memory/page.tsx",
                                            lineNumber: 193,
                                            columnNumber: 29
                                        }, this),
                                        " (no ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                            children: "="
                                        }, void 0, false, {
                                            fileName: "[project]/app/memory/page.tsx",
                                            lineNumber: 193,
                                            columnNumber: 63
                                        }, this),
                                        "): lighting keywords, mood, camera notes, new ideas, prompt additions — anything that should influence every slot unless overridden. Use ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                            children: "KEY = value"
                                        }, void 0, false, {
                                            fileName: "[project]/app/memory/page.tsx",
                                            lineNumber: 196,
                                            columnNumber: 33
                                        }, this),
                                        " per line for template-specific overrides. Template keys (batch uses 1–5 only):",
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                            children: "UGC_SNAPCHAT"
                                        }, void 0, false, {
                                            fileName: "[project]/app/memory/page.tsx",
                                            lineNumber: 198,
                                            columnNumber: 29
                                        }, this),
                                        ", ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                            children: "NATIVE_ORGANIC"
                                        }, void 0, false, {
                                            fileName: "[project]/app/memory/page.tsx",
                                            lineNumber: 198,
                                            columnNumber: 56
                                        }, this),
                                        ",",
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                            children: "HYPER_CLICKBAIT"
                                        }, void 0, false, {
                                            fileName: "[project]/app/memory/page.tsx",
                                            lineNumber: 199,
                                            columnNumber: 29
                                        }, this),
                                        ", ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                            children: "CREATIVE_CONCEPT"
                                        }, void 0, false, {
                                            fileName: "[project]/app/memory/page.tsx",
                                            lineNumber: 199,
                                            columnNumber: 59
                                        }, this),
                                        ",",
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                            children: "ILLUSTRATED"
                                        }, void 0, false, {
                                            fileName: "[project]/app/memory/page.tsx",
                                            lineNumber: 200,
                                            columnNumber: 29
                                        }, this),
                                        ". Optional",
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                            children: "KLING_VIDEO"
                                        }, void 0, false, {
                                            fileName: "[project]/app/memory/page.tsx",
                                            lineNumber: 201,
                                            columnNumber: 29
                                        }, this),
                                        " applies to",
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "variations"
                                        }, void 0, false, {
                                            fileName: "[project]/app/memory/page.tsx",
                                            lineNumber: 202,
                                            columnNumber: 29
                                        }, this),
                                        " / manual tweaks — use",
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Kling ready"
                                        }, void 0, false, {
                                            fileName: "[project]/app/memory/page.tsx",
                                            lineNumber: 203,
                                            columnNumber: 29
                                        }, this),
                                        " on a job ad for the video pack. Variation helpers: ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                            children: "VAR_HIGHER_AGGRESSION"
                                        }, void 0, false, {
                                            fileName: "[project]/app/memory/page.tsx",
                                            lineNumber: 204,
                                            columnNumber: 48
                                        }, this),
                                        ",",
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                            children: "VAR_LOWER_AGGRESSION"
                                        }, void 0, false, {
                                            fileName: "[project]/app/memory/page.tsx",
                                            lineNumber: 205,
                                            columnNumber: 29
                                        }, this),
                                        ", ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                            children: "VAR_ADD_TEXT"
                                        }, void 0, false, {
                                            fileName: "[project]/app/memory/page.tsx",
                                            lineNumber: 205,
                                            columnNumber: 64
                                        }, this),
                                        ", ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                            children: "VAR_STRONGER_CTA"
                                        }, void 0, false, {
                                            fileName: "[project]/app/memory/page.tsx",
                                            lineNumber: 206,
                                            columnNumber: 31
                                        }, this),
                                        ",",
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                            children: "VAR_HIGHER_QUALITY"
                                        }, void 0, false, {
                                            fileName: "[project]/app/memory/page.tsx",
                                            lineNumber: 207,
                                            columnNumber: 29
                                        }, this),
                                        ",",
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                            children: "VAR_BEFORE_AFTER"
                                        }, void 0, false, {
                                            fileName: "[project]/app/memory/page.tsx",
                                            lineNumber: 208,
                                            columnNumber: 29
                                        }, this),
                                        "."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/memory/page.tsx",
                                    lineNumber: 185,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "additionalInfo",
                                    defaultValue: brain?.additionalInfo || "",
                                    rows: 12,
                                    style: {
                                        width: "100%",
                                        padding: 10,
                                        borderRadius: 12,
                                        border: "1px solid var(--border)",
                                        background: "var(--surfaceElevated)",
                                        color: "var(--foreground)",
                                        fontFamily: "ui-monospace, monospace",
                                        fontSize: 12
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/memory/page.tsx",
                                    lineNumber: 210,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/memory/page.tsx",
                            lineNumber: 174,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "submit",
                            style: {
                                justifySelf: "start",
                                padding: "10px 18px",
                                borderRadius: 12,
                                border: "1px solid var(--borderStrong)",
                                background: "var(--accent)",
                                color: "#fff",
                                fontWeight: 700,
                                cursor: "pointer"
                            },
                            children: "Save Creative Brain"
                        }, void 0, false, {
                            fileName: "[project]/app/memory/page.tsx",
                            lineNumber: 227,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/memory/page.tsx",
                    lineNumber: 90,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/memory/page.tsx",
                lineNumber: 89,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 20,
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    padding: 16,
                    background: "var(--surface)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontWeight: 900,
                            marginBottom: 6
                        },
                        children: "Saved swipe bank (fundraiser)"
                    }, void 0, false, {
                        fileName: "[project]/app/memory/page.tsx",
                        lineNumber: 254,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: 13,
                            opacity: 0.8,
                            lineHeight: 1.55
                        },
                        children: [
                            "Categories: ",
                            donationCategories,
                            " • Entries:",
                            " ",
                            donationSwipeEntries,
                            " • ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Active"
                            }, void 0, false, {
                                fileName: "[project]/app/memory/page.tsx",
                                lineNumber: 259,
                                columnNumber: 46
                            }, this),
                            " (pulled into batches): ",
                            activeDonationSwipes,
                            ". Each ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Generate 5 ads"
                            }, void 0, false, {
                                fileName: "[project]/app/memory/page.tsx",
                                lineNumber: 260,
                                columnNumber: 60
                            }, this),
                            " ",
                            "run includes up to ",
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$swipeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DONATION_SWIPE_BATCH_LIMIT"],
                            " active entries (by performance score, then newest) as structured swipe context and random prompt seeds alongside Creative Brain + evaluations."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/memory/page.tsx",
                        lineNumber: 257,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 12
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                            href: "/admin/dono",
                            style: {
                                display: "inline-block",
                                padding: "10px 14px",
                                borderRadius: 12,
                                border: "1px solid var(--borderStrong)",
                                color: "var(--foreground)",
                                textDecoration: "none",
                                fontSize: 13,
                                fontWeight: 700
                            },
                            children: "Open swipe bank admin"
                        }, void 0, false, {
                            fileName: "[project]/app/memory/page.tsx",
                            lineNumber: 266,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/memory/page.tsx",
                        lineNumber: 265,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/memory/page.tsx",
                lineNumber: 245,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/memory/page.tsx",
        lineNumber: 78,
        columnNumber: 9
    }, this);
}
}),
"[project]/.next-internal/server/app/memory/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/memory/page.tsx [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$memory$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/memory/page.tsx [app-rsc] (ecmascript)");
;
}),
"[project]/.next-internal/server/app/memory/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/memory/page.tsx [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "402745c2dccf0c2b753789a83d3e13c72be90993d7",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$memory$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_0"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$memory$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$memory$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/memory/page/actions.js { ACTIONS_MODULE0 => "[project]/app/memory/page.tsx [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$memory$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/memory/page.tsx [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_d9b94ec4._.js.map