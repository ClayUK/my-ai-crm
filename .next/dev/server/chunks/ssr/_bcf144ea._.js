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
"[project]/src/lib/kie.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateImageWithKie",
    ()=>generateImageWithKie,
    "uploadReferenceFilesToKie",
    ()=>uploadReferenceFilesToKie
]);
const KIE_API_BASE = "https://api.kie.ai";
const KIE_UPLOAD_BASE = "https://kieai.redpandaai.co";
function getKieApiKey() {
    const key = process.env.KIE_API_KEY;
    if (!key) {
        throw new Error("Missing KIE_API_KEY in .env");
    }
    return key;
}
async function sleep(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms));
}
async function uploadReferenceFilesToKie(files) {
    const apiKey = getKieApiKey();
    const uploaded = [];
    for (const file of files){
        const anyFile = file;
        // Avoid fragile `instanceof File` checks; in server runtimes the
        // File/Blob implementation can differ while still being usable.
        if (!anyFile || typeof anyFile.size !== "number" || anyFile.size === 0) continue;
        const fileName = anyFile.name || "reference-image";
        const fileType = anyFile.type || null;
        const form = new FormData();
        form.set("file", anyFile, fileName);
        form.set("uploadPath", "images/user-uploads");
        form.set("fileName", fileName);
        const res = await fetch(`${KIE_UPLOAD_BASE}/api/file-stream-upload`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`
            },
            body: form
        });
        const json = await res.json();
        if (!res.ok || json?.code !== 200 || !json?.data?.downloadUrl) {
            throw new Error(`Kie file upload failed: ${JSON.stringify(json)}`);
        }
        uploaded.push({
            filePath: json.data.downloadUrl,
            originalName: json.data.originalName || fileName,
            mimeType: json.data.mimeType || fileType
        });
    }
    return uploaded;
}
async function generateImageWithKie(prompt, referenceImages = [], aspectRatio = "1:1") {
    const apiKey = getKieApiKey();
    const createRes = await fetch(`${KIE_API_BASE}/api/v1/jobs/createTask`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "nano-banana-2",
            input: {
                prompt,
                image_input: referenceImages,
                google_search: true,
                aspect_ratio: aspectRatio,
                resolution: "1K",
                output_format: "png"
            }
        })
    });
    const createJson = await createRes.json();
    if (!createRes.ok || createJson?.code !== 200 || !createJson?.data?.taskId) {
        throw new Error(`Kie task creation failed: ${JSON.stringify(createJson)}`);
    }
    const taskId = createJson.data.taskId;
    for(let attempt = 0; attempt < 30; attempt++){
        await sleep(3000);
        const statusRes = await fetch(`${KIE_API_BASE}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        });
        const statusJson = await statusRes.json();
        if (!statusRes.ok || statusJson?.code !== 200) {
            throw new Error(`Kie status check failed: ${JSON.stringify(statusJson)}`);
        }
        const data = statusJson.data;
        const state = data?.state;
        if (state === "success") {
            let parsedResult = data?.resultJson;
            if (typeof parsedResult === "string") {
                try {
                    parsedResult = JSON.parse(parsedResult);
                } catch  {}
            }
            return {
                taskId,
                state,
                raw: statusJson,
                result: parsedResult
            };
        }
        if (state === "fail") {
            throw new Error(`Kie generation failed: ${data?.failMsg || "Unknown failure"}`);
        }
    }
    throw new Error("Kie generation timed out.");
}
}),
"[project]/src/lib/claudeAds.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "extractJsonObject",
    ()=>extractJsonObject,
    "normalizeRequestedAdCount",
    ()=>normalizeRequestedAdCount,
    "validateAds",
    ()=>validateAds
]);
function normalizeRequestedAdCount(value) {
    if (!value) return 6;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 6;
    if (parsed < 1) return 1;
    if (parsed > 1000) return 1000;
    return Math.floor(parsed);
}
function extractJsonObject(text) {
    const trimmed = text.trim();
    try {
        return JSON.parse(trimmed);
    } catch  {}
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
        const possible = trimmed.slice(start, end + 1);
        try {
            return JSON.parse(possible);
        } catch  {}
    }
    return null;
}
function validateAds(parsed, requestedCount) {
    if (!parsed || typeof parsed !== "object") {
        throw new Error("Claude did not return a valid JSON object.");
    }
    const ads = parsed.ads;
    if (!Array.isArray(ads)) {
        throw new Error("Claude response is missing the ads array.");
    }
    if (ads.length !== requestedCount) {
        throw new Error(`Claude returned ${ads.length} ads but ${requestedCount} were requested.`);
    }
    const requiredFields = [
        "angle",
        "hook",
        "primaryText",
        "headline",
        "cta",
        "visualPrompt"
    ];
    ads.forEach((ad, index)=>{
        const adNum = index + 1;
        if (!ad || typeof ad !== "object") {
            throw new Error(`Ad ${adNum} is not a valid object.`);
        }
        for (const field of requiredFields){
            const value = ad[field];
            if (typeof value !== "string" || !value.trim()) {
                throw new Error(`Ad ${adNum} is missing required field: ${String(field)}`);
            }
        }
    });
    return ads;
}
}),
"[project]/src/lib/anthropic.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "analyzeWebsiteText",
    ()=>analyzeWebsiteText,
    "anthropic",
    ()=>anthropic,
    "extractWebsiteIntelligence",
    ()=>extractWebsiteIntelligence,
    "generateAdTabs",
    ()=>generateAdTabs,
    "generateAdVariationsFromBaseAd",
    ()=>generateAdVariationsFromBaseAd,
    "generateCreativeStrategy",
    ()=>generateCreativeStrategy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@anthropic-ai/sdk/index.mjs [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$client$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__Anthropic__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/@anthropic-ai/sdk/client.mjs [app-rsc] (ecmascript) <export Anthropic as default>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claudeAds$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/claudeAds.ts [app-rsc] (ecmascript)");
;
;
;
const anthropic = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$client$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__Anthropic__as__default$3e$__["default"]({
    apiKey: process.env.ANTHROPIC_API_KEY
});
function getTextBlock(value) {
    if (!value || typeof value !== "object") return null;
    const content = value.content;
    const first = Array.isArray(content) ? content[0] : null;
    return first && first.type === "text" ? first.text : null;
}
function shouldExpandAdPrompts(json) {
    const ads = Array.isArray(json?.ads) ? json.ads : [];
    if (ads.length === 0) return false;
    return ads.some((ad)=>{
        const edited = typeof ad?.editedPrompt === "string" ? ad.editedPrompt.trim() : "";
        const scene = typeof ad?.scenePrompt === "string" ? ad.scenePrompt.trim() : "";
        // Heuristic thresholds: we want genuinely production-ready depth.
        return edited.length < 650 || scene.length < 350;
    });
}
function safeText(value) {
    return value?.trim() || "";
}
function tokenize(value) {
    return safeText(value).toLowerCase().split(/[^a-z0-9]+/i).map((token)=>token.trim()).filter(Boolean);
}
function unique(items) {
    return Array.from(new Set(items));
}
function scoreText(text, tokens) {
    const lower = text.toLowerCase();
    let score = 0;
    for (const token of tokens){
        if (!token) continue;
        if (lower.includes(token)) score += 1;
    }
    return score;
}
function buildIntentTokens(input) {
    return unique([
        ...tokenize(input.campaignType),
        ...tokenize(input.platform),
        ...tokenize(input.funnelStage),
        ...tokenize(input.primaryAngles),
        ...tokenize(input.ctaStyle),
        ...tokenize(input.visualStyle),
        ...tokenize(input.referenceImageTypes),
        ...tokenize(input.testimonialUsage),
        ...tokenize(input.creativeMode)
    ]);
}
function buildEntrySearchBlob(entry) {
    return [
        entry.title,
        entry.hook,
        entry.angle,
        entry.concept,
        entry.copy,
        entry.cta,
        entry.visualDirection,
        entry.audience,
        entry.platform,
        entry.funnelStage,
        entry.offerType,
        entry.emotionalTrigger,
        entry.objectionHandled,
        entry.whyItWorks,
        entry.source,
        entry.tags,
        entry.notes,
        entry.category?.name
    ].filter(Boolean).join(" ");
}
function buildSimpleSearchBlob(item) {
    return Object.values(item).flatMap((value)=>{
        if (typeof value === "string") return [
            value
        ];
        return [];
    }).join(" ");
}
async function getMemoryContext(input) {
    const marketType = input.campaignType === "donation" ? "donation" : "product";
    const creativeMode = input.creativeMode || "Mix";
    const modeNormalized = creativeMode.trim().toLowerCase();
    const isExplore = modeNormalized === "explore";
    const isScaleWinners = modeNormalized === "scale winners" || modeNormalized === "scalewinners";
    const tokens = buildIntentTokens(input);
    // Creative Mode affects *how* we bias memory selection (not how we structure prompts).
    const swipeTake = isExplore ? 18 : isScaleWinners ? 28 : 25;
    const frameworksTake = isExplore ? 16 : isScaleWinners ? 10 : 12;
    const audienceTake = isExplore ? 14 : isScaleWinners ? 10 : 12;
    const visualPatternsTake = isExplore ? 12 : isScaleWinners ? 8 : 10;
    const copyFormulasTake = isExplore ? 12 : isScaleWinners ? 8 : 10;
    const offerAnglesTake = isExplore ? 12 : isScaleWinners ? 10 : 10;
    const researchNotesTake = isExplore ? 14 : isScaleWinners ? 10 : 12;
    const performanceWeight = isExplore ? 0.12 : isScaleWinners ? 0.35 : 0.25;
    const usageWeight = isExplore ? 0.06 : isScaleWinners ? 0.18 : 0.1;
    const researchPriorityWeight = isExplore ? 0.15 : isScaleWinners ? 0.35 : 0.25;
    const [swipeEntriesRaw, frameworksRaw, audienceInsightsRaw, visualPatternsRaw, copyFormulasRaw, offerAnglesRaw, researchNotesRaw] = await Promise.all([
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].swipeEntry.findMany({
            where: {
                marketType,
                status: "active"
            },
            include: {
                category: true
            },
            orderBy: [
                {
                    performanceScore: "desc"
                },
                {
                    usageCount: "desc"
                },
                {
                    createdAt: "desc"
                }
            ],
            take: 200
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].conceptFramework.findMany({
            where: {
                marketType,
                status: "active"
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 80
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].audienceInsight.findMany({
            where: {
                marketType
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 80
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].visualPattern.findMany({
            where: {
                marketType,
                status: "active"
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 80
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].copyFormula.findMany({
            where: {
                marketType,
                status: "active"
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 80
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].offerAngle.findMany({
            where: {
                marketType,
                status: "active"
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 80
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].researchNote.findMany({
            where: {
                marketType,
                status: "active"
            },
            orderBy: [
                {
                    priority: "desc"
                },
                {
                    createdAt: "desc"
                }
            ],
            take: 80
        })
    ]);
    const swipeEntries = swipeEntriesRaw.map((entry)=>({
            entry,
            score: scoreText(buildEntrySearchBlob(entry), tokens) + (entry.performanceScore || 0) * performanceWeight + (entry.usageCount || 0) * usageWeight
        })).sort((a, b)=>b.score - a.score).slice(0, swipeTake).map((item)=>item.entry);
    const frameworks = frameworksRaw.map((item)=>({
            item,
            score: scoreText(buildSimpleSearchBlob(item), tokens)
        })).sort((a, b)=>b.score - a.score).slice(0, frameworksTake).map((item)=>item.item);
    const audienceInsights = audienceInsightsRaw.map((item)=>({
            item,
            score: scoreText(buildSimpleSearchBlob(item), tokens)
        })).sort((a, b)=>b.score - a.score).slice(0, audienceTake).map((item)=>item.item);
    const visualPatterns = visualPatternsRaw.map((item)=>({
            item,
            score: scoreText(buildSimpleSearchBlob(item), tokens)
        })).sort((a, b)=>b.score - a.score).slice(0, visualPatternsTake).map((item)=>item.item);
    const copyFormulas = copyFormulasRaw.map((item)=>({
            item,
            score: scoreText(buildSimpleSearchBlob(item), tokens)
        })).sort((a, b)=>b.score - a.score).slice(0, copyFormulasTake).map((item)=>item.item);
    const offerAngles = offerAnglesRaw.map((item)=>({
            item,
            score: scoreText(buildSimpleSearchBlob(item), tokens)
        })).sort((a, b)=>b.score - a.score).slice(0, offerAnglesTake).map((item)=>item.item);
    const researchNotes = researchNotesRaw.map((item)=>({
            item,
            score: scoreText(buildSimpleSearchBlob(item), tokens) + (item.priority || 0) * researchPriorityWeight
        })).sort((a, b)=>b.score - a.score).slice(0, researchNotesTake).map((item)=>item.item);
    return {
        marketType,
        swipeEntries,
        frameworks,
        audienceInsights,
        visualPatterns,
        copyFormulas,
        offerAngles,
        researchNotes,
        intentTokens: tokens
    };
}
function formatMemoryContext(memory) {
    const swipeText = memory.swipeEntries.map((entry, index)=>{
        return [
            `${index + 1}. [${entry.category.name}] ${entry.title}`,
            entry.hook ? `Hook: ${entry.hook}` : "",
            entry.angle ? `Angle: ${entry.angle}` : "",
            entry.concept ? `Concept: ${entry.concept}` : "",
            entry.copy ? `Copy: ${entry.copy}` : "",
            entry.cta ? `CTA: ${entry.cta}` : "",
            entry.visualDirection ? `Visual Direction: ${entry.visualDirection}` : "",
            entry.audience ? `Audience: ${entry.audience}` : "",
            entry.platform ? `Platform: ${entry.platform}` : "",
            entry.funnelStage ? `Funnel Stage: ${entry.funnelStage}` : "",
            entry.offerType ? `Offer Type: ${entry.offerType}` : "",
            entry.emotionalTrigger ? `Emotional Trigger: ${entry.emotionalTrigger}` : "",
            entry.objectionHandled ? `Objection Handled: ${entry.objectionHandled}` : "",
            entry.whyItWorks ? `Why It Works: ${entry.whyItWorks}` : "",
            entry.tags ? `Tags: ${entry.tags}` : "",
            entry.notes ? `Notes: ${entry.notes}` : ""
        ].filter(Boolean).join("\n");
    }).join("\n\n");
    const frameworksText = memory.frameworks.map((item, index)=>{
        return [
            `${index + 1}. ${item.name}`,
            item.frameworkType ? `Type: ${item.frameworkType}` : "",
            item.summary ? `Summary: ${item.summary}` : "",
            item.structure ? `Structure: ${item.structure}` : "",
            item.promptInstructions ? `Prompt Instructions: ${item.promptInstructions}` : "",
            item.bestUseCases ? `Best Use Cases: ${item.bestUseCases}` : "",
            item.badUseCases ? `Bad Use Cases: ${item.badUseCases}` : "",
            item.examples ? `Examples: ${item.examples}` : "",
            item.tags ? `Tags: ${item.tags}` : ""
        ].filter(Boolean).join("\n");
    }).join("\n\n");
    const audienceText = memory.audienceInsights.map((item, index)=>{
        return [
            `${index + 1}. ${item.name}`,
            item.segmentType ? `Segment Type: ${item.segmentType}` : "",
            item.demographics ? `Demographics: ${item.demographics}` : "",
            item.psychographics ? `Psychographics: ${item.psychographics}` : "",
            item.painPoints ? `Pain Points: ${item.painPoints}` : "",
            item.desires ? `Desires: ${item.desires}` : "",
            item.fears ? `Fears: ${item.fears}` : "",
            item.objections ? `Objections: ${item.objections}` : "",
            item.buyingTriggers ? `Buying Triggers: ${item.buyingTriggers}` : "",
            item.languagePatterns ? `Language Patterns: ${item.languagePatterns}` : "",
            item.stylePreferences ? `Style Preferences: ${item.stylePreferences}` : "",
            item.platformBehavior ? `Platform Behavior: ${item.platformBehavior}` : "",
            item.tags ? `Tags: ${item.tags}` : ""
        ].filter(Boolean).join("\n");
    }).join("\n\n");
    const visualText = memory.visualPatterns.map((item, index)=>{
        return [
            `${index + 1}. ${item.name}`,
            item.patternType ? `Pattern Type: ${item.patternType}` : "",
            item.summary ? `Summary: ${item.summary}` : "",
            item.composition ? `Composition: ${item.composition}` : "",
            item.lighting ? `Lighting: ${item.lighting}` : "",
            item.colorPalette ? `Color Palette: ${item.colorPalette}` : "",
            item.typographyStyle ? `Typography: ${item.typographyStyle}` : "",
            item.mood ? `Mood: ${item.mood}` : "",
            item.backgroundStyle ? `Background Style: ${item.backgroundStyle}` : "",
            item.productPlacement ? `Product Placement: ${item.productPlacement}` : "",
            item.useCase ? `Use Case: ${item.useCase}` : "",
            item.tags ? `Tags: ${item.tags}` : ""
        ].filter(Boolean).join("\n");
    }).join("\n\n");
    const copyText = memory.copyFormulas.map((item, index)=>{
        return [
            `${index + 1}. ${item.name}`,
            item.formulaType ? `Formula Type: ${item.formulaType}` : "",
            item.structure ? `Structure: ${item.structure}` : "",
            item.headlineFormula ? `Headline Formula: ${item.headlineFormula}` : "",
            item.bodyFormula ? `Body Formula: ${item.bodyFormula}` : "",
            item.ctaFormula ? `CTA Formula: ${item.ctaFormula}` : "",
            item.bestUseCases ? `Best Use Cases: ${item.bestUseCases}` : "",
            item.tone ? `Tone: ${item.tone}` : "",
            item.examples ? `Examples: ${item.examples}` : "",
            item.tags ? `Tags: ${item.tags}` : ""
        ].filter(Boolean).join("\n");
    }).join("\n\n");
    const offerText = memory.offerAngles.map((item, index)=>{
        return [
            `${index + 1}. ${item.name}`,
            item.angleType ? `Angle Type: ${item.angleType}` : "",
            item.summary ? `Summary: ${item.summary}` : "",
            item.hookIdeas ? `Hook Ideas: ${item.hookIdeas}` : "",
            item.urgencyMechanics ? `Urgency Mechanics: ${item.urgencyMechanics}` : "",
            item.bestUseCases ? `Best Use Cases: ${item.bestUseCases}` : "",
            item.examples ? `Examples: ${item.examples}` : "",
            item.seasonality ? `Seasonality: ${item.seasonality}` : "",
            item.tags ? `Tags: ${item.tags}` : ""
        ].filter(Boolean).join("\n");
    }).join("\n\n");
    const researchText = memory.researchNotes.map((item, index)=>{
        return [
            `${index + 1}. ${item.title}`,
            item.noteType ? `Type: ${item.noteType}` : "",
            item.body ? `Body: ${item.body}` : "",
            item.tags ? `Tags: ${item.tags}` : ""
        ].filter(Boolean).join("\n");
    }).join("\n\n");
    return `
MEMORY BANK — ${memory.marketType.toUpperCase()}
INTENT TOKENS: ${memory.intentTokens.join(", ") || "none"}

SWIPE ENTRIES:
${swipeText || "None"}

CONCEPT FRAMEWORKS:
${frameworksText || "None"}

AUDIENCE INSIGHTS:
${audienceText || "None"}

VISUAL PATTERNS:
${visualText || "None"}

COPY FORMULAS:
${copyText || "None"}

OFFER ANGLES:
${offerText || "None"}

RESEARCH NOTES:
${researchText || "None"}
`;
}
async function analyzeWebsiteText(input) {
    const normalizedInput = typeof input === "string" ? {
        rawText: input,
        campaignType: "product",
        platform: "Meta",
        funnelStage: "Mix",
        formatRatio: "70% 9:16 / 30% 1080x1080",
        primaryAngles: "Problem/Solution, Lifestyle, Urgency",
        testimonialUsage: "Mix",
        ctaStyle: "Mix",
        visualStyle: "Mix",
        numberOfAds: "6",
        referenceImageTypes: "Product only"
    } : input;
    const rawText = normalizedInput.rawText.slice(0, 12000);
    const requestedAdCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claudeAds$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeRequestedAdCount"])(normalizedInput.numberOfAds);
    const memory = await getMemoryContext(normalizedInput);
    const memoryContext = formatMemoryContext(memory);
    const isDonation = memory.marketType === "donation";
    const commonJsonShape = `
Return VALID JSON ONLY with this exact shape (exact keys):

{
  "ads": [
    {
      "adNumber": 1,
      "angle": "",
      "hook": "",
      "primaryText": "",
      "headline": "",
      "cta": "",
      "visualPrompt": ""
    }
  ]
}
`;
    const outputContractBlock = `
OUTPUT CONTRACT (MUST FOLLOW EXACTLY):
- Output MUST be a single JSON object (not an array).
- Output MUST NOT contain markdown, code fences, backticks, or any prose.
- The root object MUST contain the key "ads" (exact spelling, all lowercase).
- "ads" MUST be a non-empty array with EXACTLY ${requestedAdCount} items.
- Do NOT rename any keys. Use the exact keys shown in the schema.
- Do NOT wrap the JSON in \`\`\` fences.
- Return JSON ONLY.
If you do not follow this EXACT structure, the output will be rejected.
`;
    const donationPrompt = `
You are an elite fundraising ad strategist and creative director.

You are generating DONATION / FUNDRAISER static image concepts.

${commonJsonShape}

CRITICAL RULES:
- The ads array must contain EXACTLY ${requestedAdCount} ads.
- Each ad = ONE image concept.
- Each ad must be materially different from the others.
- Use the donation memory bank heavily.
- Be emotionally specific, visually specific, and conversion-aware.
- Do not output generic charity ads.
- Do not compress prompts into shallow summaries.
- Every scenePrompt and editedPrompt must be highly detailed and production-ready.

DONATION-SPECIFIC REQUIREMENTS:
- Build each ad around ONE dominant emotional idea.
- Use urgency only when justified by the page or memory.
- Use trust, empathy, proof, and donor agency.
- If the page suggests a real subject story, make the concepts feel specific and human.
- Reference-image guidance must be practical and explicit.
- Each editedPrompt must be a clean single-image prompt suitable for Nano Banana 2.
- If using text overlays, make them emotionally sharp and specific.

EACH AD MUST INCLUDE:
- a distinct angle
- a distinct audience or donor-psychology pocket where possible
- a distinct visual style or story device
- strong scene composition
- lighting direction
- texture / realism cues
- exact overlay copy
- specific typography direction
- a clear reason the concept should convert

MAKE THE editedPrompt VERY DETAILED:
It should read like a premium final image-generation prompt, not a summary.
Include:
- subject framing
- environment
- lighting direction
- mood
- camera feel
- composition
- realism level
- what text appears and where
- emotional intent
- how reference images should be used if relevant

CAMPAIGN SETTINGS:
- Campaign Type: donation
- Platform: ${normalizedInput.platform}
- Funnel stage: ${normalizedInput.funnelStage}
- Format ratio: ${normalizedInput.formatRatio}
- Primary angles: ${normalizedInput.primaryAngles}
- Testimonial usage: ${normalizedInput.testimonialUsage}
- CTA style: ${normalizedInput.ctaStyle}
- Visual style: ${normalizedInput.visualStyle}
- Number of ads: ${requestedAdCount}
- Reference image types available: ${normalizedInput.referenceImageTypes}

${memoryContext}

WEBSITE TEXT:
${rawText}

${outputContractBlock}
`;
    const productPrompt = `
You are an elite direct-response ecommerce ad strategist and creative director.

You are generating PRODUCT / ECOMMERCE static image concepts.

${commonJsonShape}

CRITICAL RULES:
- The ads array must contain EXACTLY ${requestedAdCount} ads.
- Each ad = ONE image concept.
- Each ad must be materially different from the others.
- Use the product memory bank heavily.
- Do not output generic ecommerce ads.
- Do not compress prompts into shallow summaries.
- Every scenePrompt and editedPrompt must be highly detailed and production-ready.

PRODUCT-SPECIFIC REQUIREMENTS:
- Use clear angle diversity, audience diversity, and style diversity.
- Each ad should feel like a serious testable concept, not a slight variation.
- Use scroll-stop mechanics intelligently.
- Vary CTA intensity when appropriate.
- Vary audience pockets and emotional hooks.
- Use realistic direct-response logic and strong visual specificity.
- Reference-image guidance must be practical and explicit.
- Each editedPrompt must be a clean single-image prompt suitable for Nano Banana 2.

EACH AD MUST INCLUDE:
- a distinct angle
- a distinct audience pocket
- a distinct visual style
- strong scene composition
- lighting direction
- color / texture specificity
- exact text overlay copy
- specific typography direction
- a clear reason the concept should convert

MAKE THE editedPrompt VERY DETAILED:
It should feel like a premium final image-generation prompt, not a summary.
Include:
- camera framing
- setting
- environment details
- product placement
- lighting direction and quality
- mood / atmosphere
- realistic textures
- what people are doing if present
- background elements
- overlay placement
- typography feel
- emotional and conversion intent
- how the reference images should be used

QUALITY EXPECTATIONS:
- Avoid vague phrases like "nice outdoor setting"
- Avoid placeholder-like copy
- Avoid repeating the same persona
- Avoid repeating the same visual rhythm
- Avoid generic AI design feel
- Make the prompts feel like they came from an experienced creative strategist

CAMPAIGN SETTINGS:
- Campaign Type: product
- Platform: ${normalizedInput.platform}
- Funnel stage: ${normalizedInput.funnelStage}
- Format ratio: ${normalizedInput.formatRatio}
- Primary angles: ${normalizedInput.primaryAngles}
- Testimonial usage: ${normalizedInput.testimonialUsage}
- CTA style: ${normalizedInput.ctaStyle}
- Visual style: ${normalizedInput.visualStyle}
- Number of ads: ${requestedAdCount}
- Reference image types available: ${normalizedInput.referenceImageTypes}

${memoryContext}

WEBSITE TEXT:
${rawText}

${outputContractBlock}
`;
    const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 6000,
        messages: [
            {
                role: "user",
                content: isDonation ? donationPrompt : productPrompt
            }
        ]
    });
    const initialText = getTextBlock(response);
    if (!initialText) {
        return '{"summary":{},"targetAudience":{"segments":[]},"productsServices":{},"styleDirection":{"styles":[]},"otherFields":{"bestTestimonials":[],"ctaVariations":[],"urgencyHooks":[],"seasonalAngles":[],"platformNotes":[]},"ads":[]}';
    }
    // If Claude complied but the creative prompts are shallow, do one expansion pass.
    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claudeAds$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extractJsonObject"])(initialText);
    if (parsed && shouldExpandAdPrompts(parsed)) {
        const expansionPrompt = `
You previously returned VALID JSON for an ad concept bundle, but parts of the prompts are too shallow.

Task: RETURN VALID JSON ONLY with the SAME exact schema and EXACTLY ${requestedAdCount} ads.

Expansion requirements:
- Keep the same angles/audiences/overall concepts, but EXPAND "scenePrompt" and "editedPrompt" dramatically.
- Each "editedPrompt" must be premium, production-ready, and specific (aim for 900–1600 characters).
- Each "scenePrompt" must be richly detailed (aim for 500–1000 characters).
- Include: composition, camera/framing, environment specifics, lighting quality/direction, textures/materials, color palette, typography direction, exact overlay text placement, realism/stylization level, and conversion intent.
- Do not add extra commentary. JSON only. No markdown.

Here is your prior JSON to expand (do not change the schema):
${initialText}
`;
        const expanded = await anthropic.messages.create({
            model: "claude-haiku-4-5",
            max_tokens: 6000,
            messages: [
                {
                    role: "user",
                    content: expansionPrompt
                }
            ]
        });
        const expandedText = getTextBlock(expanded);
        if (expandedText) return expandedText;
    }
    return initialText;
}
function buildRejectionTail() {
    return "If you do not follow this EXACT structure, the output will be rejected.";
}
function getFirstTextOrThrow(response) {
    const initialText = getTextBlock(response);
    if (!initialText) throw new Error("Claude returned no text block.");
    return initialText;
}
async function extractWebsiteIntelligence(input) {
    const rawText = (input.rawText || "").slice(0, 12000);
    const imageUrls = (input.imageUrls || []).slice(0, 20);
    const campaignTypeHint = input.campaignTypeHint || "product";
    const schema = `
{
  "campaignType": "product",
  "brandName": "",
  "productName": "",
  "offer": "",
  "price": "",
  "audience": [],
  "keyBenefits": [],
  "objections": [],
  "emotionalDrivers": [],
  "proofPoints": [],
  "visualAssets": {
    "imageUrls": [],
    "hasHumanLifestyleImages": false,
    "hasProductOnlyImages": false
  },
  "sourceSummary": ""
}
`;
    const prompt = `
You are extracting structured website intelligence for ad generation.

Return VALID JSON ONLY.

Website may be an ecommerce product page or a donation/fundraiser page.

Rules:
- Output MUST be a single JSON object.
- Output MUST match the exact JSON schema keys and types.
- campaignType MUST be one of: "product", "donation", "unknown"
- No markdown. No code fences. No prose.

Output schema keys/types:
${schema}

Inputs:
- Campaign type hint (may be wrong): ${campaignTypeHint}
- WEBSITE TEXT:
${rawText}

- IMAGE URLS (if any):
${JSON.stringify(imageUrls)}

${buildRejectionTail()}
`;
    const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 2500,
        messages: [
            {
                role: "user",
                content: prompt
            }
        ]
    });
    return getFirstTextOrThrow(response);
}
async function generateCreativeStrategy(input) {
    const shouldRandomizedTestingBatch = input.primaryAngles.trim().length === 0 && (input.creativeMode === "Explore" || input.creativeMode === "Mix") && input.ctaStyle === "Mix" && input.visualStyle === "Mix";
    const adMixStrategyRulesBlock = input.adMixStrategy === "Heavy Testing" ? `
Ad Mix Strategy (Heavy Testing):
- Create much wider variety across angles, hooks, emotional tone, and visual/overlay execution.
- Prefer broader concept spread and higher contrast between ads (text-heavy vs low-text, DR vs emotional, safer vs bolder).
` : input.adMixStrategy === "Focused Batch" ? `
Ad Mix Strategy (Focused Batch):
- Use fewer angle families / concepts, but generate more execution variations within that tighter lane.
- Keep related concepts consistent (same offer lane) while still changing hook + visual treatment.
` : `
Ad Mix Strategy (Even Mix):
- Balanced spread across angle families and execution styles.
- Avoid repeating the same hook/audience/style pattern.
`;
    const strictlyFollowRulesBlock = input.strictlyFollowSelectedAngles ? `
Strictly Follow Selected Angles (ON):
- Treat the angle families implied by "primaryAngles" as the maximum allowed lane.
- Do NOT introduce unrelated new angle families; stay tightly within the provided angle families and priority ordering.
` : `
Strictly Follow Selected Angles (OFF):
- Use selected/scraped angles first, but you may expand into adjacent concepts for diversity.
`;
    const experimentalAdsRulesBlock = input.includeExperimentalAds ? `
Include Experimental / Clickbait Ads (ON):
- Reserve a portion of the adConcepts (roughly 20–40%) for bolder experimental / clickbait / pattern-interrupt ideas.
- Keep the rest conversion-safe and coherent with the offer + campaign tone.
` : `
Include Experimental / Clickbait Ads (OFF):
- Keep concepts safer and more conventional across the full batch.
`;
    const randomizedTestingRulesBlock = shouldRandomizedTestingBatch ? `
SMART RANDOMIZED TESTING BATCH (no-input fallback):
- Because angles are blank and styles/CTA are set to Mix, intentionally generate a broad randomized testing set.
- Ensure the set includes diversity such as:
  - some text-heavy executions
  - some low-text / minimal-primaryText executions
  - some direct-response angles
  - some emotional / story-led angles
  - some clickbait / pattern-interrupt angles
  - some clean / minimal executions
  - some more aggressive or higher-urgency framing
` : "";
    const memory = await getMemoryContext({
        rawText: input.rawTextForIntentTokens,
        campaignType: input.campaignType,
        platform: input.platform,
        funnelStage: input.funnelStage,
        primaryAngles: input.primaryAngles,
        testimonialUsage: input.testimonialUsage,
        ctaStyle: input.ctaStyle,
        visualStyle: input.visualStyle,
        numberOfAds: "6",
        referenceImageTypes: input.referenceImageTypes,
        creativeMode: input.creativeMode
    });
    const memoryContext = formatMemoryContext(memory);
    const outputSchema = `
{
  "campaignType": "${input.campaignType}",
  "positioningStatement": "",
  "audiencePockets": [],
  "adConcepts": [
    {
      "angle": "",
      "hook": "",
      "audience": "",
      "emotionalDriver": "",
      "proofPoint": "",
      "whyThisAngleShouldWork": "",
      "visualDirection": {
        "style": "",
        "scene": "",
        "lighting": "",
        "composition": "",
        "textureCues": "",
        "typographyDirection": "",
        "overlay": {
          "headline": "",
          "primaryText": "",
          "cta": ""
        }
      },
      "scrollStopMechanic": ""
    }
  ]
}
`;
    const creativeModeRulesBlock = input.creativeMode === "Explore" ? `
Creative Mode Guidance (Explore):
- Prioritize diversity over consistency.
- Encourage wide variation across angles, styles, CTA tone, and layouts (text-heavy vs no-text).
- Reduce reliance on swipe-memory dominance; allow more pattern interrupt / "weird" executions.
` : input.creativeMode === "Scale Winners" ? `
Creative Mode Guidance (Scale Winners):
- Prioritize proven structures and tighter variation.
- Lean more heavily on swipe/pattern/copy memory and selected angles.
- Less randomness; avoid duplicates while keeping concepts within the proven lane.
` : `
Creative Mode Guidance (Mix):
- Balanced exploration + proven structure.
- Use enough diversity to avoid duplicates, but keep conversion tone coherent.
`;
    const prompt = `
You are generating creative strategy (NOT final ad tabs).

Return VALID JSON ONLY with the exact schema below.

Rules:
- No markdown. No code fences. No prose.
- Do NOT output final ads with "visualPrompt". This stage outputs ad concepts and creative ingredients only.

Output schema:
${outputSchema}

Inputs:
- WEBSITE INTELLIGENCE:
${JSON.stringify(input.websiteIntelligence)}

- MEMORY CONTEXT:
${memoryContext}

- Campaign settings:
  - platform: ${input.platform}
  - funnelStage: ${input.funnelStage}
  - primaryAngles: ${input.primaryAngles}
  - testimonialUsage: ${input.testimonialUsage}
  - ctaStyle: ${input.ctaStyle}
  - visualStyle: ${input.visualStyle}
  - referenceImageTypes: ${input.referenceImageTypes}
- creativeMode: ${input.creativeMode}
- adMixStrategy: ${input.adMixStrategy}
- strictlyFollowSelectedAngles: ${input.strictlyFollowSelectedAngles}
- includeExperimentalAds: ${input.includeExperimentalAds}

- Priority rule for primaryAngles:
  - The earlier angles in primaryAngles are higher priority.
  - Use scraped angles first, then explicitly selected angles, then free-text notes last.

${creativeModeRulesBlock}

${randomizedTestingRulesBlock}
${adMixStrategyRulesBlock}
${strictlyFollowRulesBlock}
${experimentalAdsRulesBlock}

${buildRejectionTail()}
`;
    const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 6000,
        messages: [
            {
                role: "user",
                content: prompt
            }
        ]
    });
    return getFirstTextOrThrow(response);
}
async function generateAdTabs(input) {
    const requestedAdCount = Math.max(1, input.requestedAdCount);
    const commonAdsSchema = `
{
  "ads": [
    {
      "angle": "",
      "hook": "",
      "primaryText": "",
      "headline": "",
      "cta": "",
      "visualPrompt": ""
    }
  ]
}
`;
    const contractTail = `
OUTPUT CONTRACT (MUST FOLLOW EXACTLY):
- Output MUST be a single JSON object with a root key "ads".
- "ads" MUST be a non-empty array with EXACTLY ${requestedAdCount} items.
- Each ad item MUST include exactly these keys: "angle", "hook", "primaryText", "headline", "cta", "visualPrompt".
- visualPrompt MUST be a production-ready single-image prompt suitable for Nano Banana 2.
- No markdown/code fences/prose. JSON only.
${buildRejectionTail()}
`;
    const creativeModeRulesBlock = input.creativeMode === "Explore" ? `
Creative Mode Guidance (Explore):
- Prioritize diversity over consistency.
- Encourage wide variation across angles, visual prompts, CTA tone, and layouts.
- Reduce reliance on swipe/pattern memory dominance; allow more pattern interrupt / "weird" executions.
` : input.creativeMode === "Scale Winners" ? `
Creative Mode Guidance (Scale Winners):
- Prioritize proven structures and tighter variation.
- Lean more heavily on swipe/pattern/copy memory and selected angles.
- Less randomness; avoid duplicates while keeping concepts within the proven lane.
` : `
Creative Mode Guidance (Mix):
- Balanced exploration + proven structure.
- Use enough diversity to avoid duplicates, but keep conversion tone coherent.
`;
    const adMixStrategyRulesBlock = input.adMixStrategy === "Heavy Testing" ? `
Ad Mix Strategy (Heavy Testing):
- Keep ad executions varied and high-contrast (text-heavy vs low-text, DR vs emotional, etc.).
` : input.adMixStrategy === "Focused Batch" ? `
Ad Mix Strategy (Focused Batch):
- Stay within fewer angle families; vary execution details (hook/headline/body/visual) without drifting into unrelated concepts.
` : `
Ad Mix Strategy (Even Mix):
- Balanced distribution across angle families and visual executions.
`;
    const strictAngleRulesBlock = input.strictlyFollowSelectedAngles ? `
Strictly Follow Selected Angles (ON):
- Keep angle families within what creativeStrategyJson already provides; do not introduce unrelated new concept lanes.
` : `
Strictly Follow Selected Angles (OFF):
- You may broaden into adjacent concepts as long as each ad remains materially different.
`;
    const experimentalAdsRulesBlock = input.includeExperimentalAds ? `
Include Experimental / Clickbait Ads (ON):
- Ensure a subset of ads feels bolder/greater pattern-interrupt while remaining usable.
` : `
Include Experimental / Clickbait Ads (OFF):
- Keep the batch more conventional across the full set.
`;
    const shouldEnforceTextMix = input.creativeMode === "Explore" || input.creativeMode === "Mix" || input.adMixStrategy === "Heavy Testing" || input.noAnglesSelected;
    const donationCampaignType = input.donationCampaignType || "";
    const donationSubject = input.donationSubject;
    const selectedTemplateIds = donationSubject?.selectedTemplates || [];
    const hasUserUploadedReferenceImages = donationSubject?.hasUserUploadedReferenceImages || false;
    const emotionalDirection = donationCampaignType === "SICK OR INJURED ANIMAL" ? "devastation + tenderness" : donationCampaignType === "ANIMAL SURGERY OR MEDICAL PROCEDURE" ? "urgency + tenderness" : donationCampaignType === "ANIMAL END OF LIFE OR AMPUTATION" ? "fight + tenderness" : donationCampaignType === "HUMAN MEDICAL — CANCER" ? "devastation + fight" : donationCampaignType === "HUMAN MEDICAL — ACCIDENT OR TRAUMA" ? "urgency + devastation" : donationCampaignType === "HUMAN MEDICAL — CHRONIC ILLNESS" ? "fight + tenderness" : donationCampaignType === "HUMAN FINANCIAL CRISIS" ? "tenderness + urgency" : donationCampaignType === "CHILD MEDICAL" ? "devastation + urgency" : donationCampaignType === "FAMILY CRISIS" ? "tenderness + devastation" : donationCampaignType === "MEMORIAL OR LOSS" ? "tenderness only" : "devastation + tenderness";
    const textVsNoTextRulesBlock = shouldEnforceTextMix ? `
TEXT VS NO-TEXT DISTRIBUTION (guaranteed mix when enabled):
- You MUST include:
  - At least 1 text-heavy ad (primaryText substantial)
  - At least 1 minimal-text ad (primaryText short, <= 6 words)
  - At least 1 no-text ad (primaryText MUST be an empty string: "")
- If requestedAdCount < 3:
  - Prioritize at least 1 text-heavy and 1 minimal-text.
  - You may omit the no-text requirement if it can't fit.
- TEXT OVERLAY RULE:
  - If primaryText is empty string, DO NOT include the middle/body overlay instructions in visualPrompt (headline + CTA only).
` : `
TEXT VS NO-TEXT DISTRIBUTION:
- Use natural variation, but do not force empty primaryText.
`;
    const antiGenericRulesBlock = `
ANTI-GENERIC FILTER (STRICT):
- Avoid generic marketing phrases and templated ad language.
- Avoid obvious/boring hooks.
- If any hook/scene feels generic or AI-generated, rewrite it before finalizing.
- Do NOT use phrases like:
  - "Transform your life"
  - "Discover the ultimate"
  - "Say goodbye to"
  - "Game changer"
  - "Unlock the secret"
`;
    const differentiationRulesBlock = `
HARD DIFFERENTIATION REQUIREMENT:
- Each ad MUST differ from others in at least TWO of:
  angle, audience/emotional tone, visual style, format (text-heavy/minimal/no-text),
  hook structure, or layout/text density.
- Check adjacent ads (Ad i vs Ad i-1). If they feel similar, rewrite until the "2-of-6" difference rule passes.
`;
    const hookQualityRulesBlock = `
HOOK QUALITY ENFORCEMENT:
- Hooks must create curiosity/tension/emotion immediately.
- Avoid safe/obvious hooks that sound like generic templates.
- If any hook is weak or too similar to another ad's hook structure, rewrite it.
`;
    const visualDiversityRulesBlock = `
VISUAL STYLE DIVERSITY ENFORCEMENT:
- No two consecutive ads may use the same visual style.
- Use creativeStrategyJson.visualDirection.style as the source of truth for visual style selection.
- If consecutive ads would reuse the same visual style, rewrite one with a different visual style (keep the concept lane intact).
`;
    const sceneSpecificityRulesBlock = `
SCENE SPECIFICITY ENFORCEMENT:
- Every scene must include:
  - specific environment/location (not "nice setting" / "clean look" / "modern vibe")
  - lighting direction (front-lit / side-lit / harsh / soft)
  - color palette (dominant + accents)
  - camera angle/perspective
  - subject placement (where the subject sits in frame)
  - foreground + background elements
`;
    const selfCheckPassBlock = `
SELF-CHECK PASS (VERY IMPORTANT):
- Check for repetition across ads (angles, hooks, CTAs, scene specifics).
- Check for generic hooks/scenes; fix any offenders.
- Check text/no-text mix matches distribution rules when enabled.
- Check consecutive visual style duplication; fix any conflicts.
- Check differentiation rule (at least TWO differing dimensions) for adjacent ads.
- Then output final JSON ONLY (no prose / no commentary).
`;
    const prompt = `
You are converting creative strategy into final AD TAB payloads.

Task:
- Use creativeStrategyJson.adConcepts to create EXACTLY ${requestedAdCount} ad concepts.
- Each concept must be materially different.

Return VALID JSON ONLY with this exact schema:
${commonAdsSchema}

${creativeModeRulesBlock}
${adMixStrategyRulesBlock}
${strictAngleRulesBlock}
${experimentalAdsRulesBlock}
${antiGenericRulesBlock}
${differentiationRulesBlock}
${hookQualityRulesBlock}
${textVsNoTextRulesBlock}
${visualDiversityRulesBlock}
${sceneSpecificityRulesBlock}

Hard rules:
- Read creativeStrategyJson.campaignType.

- If creativeStrategyJson.campaignType is "product", generate a FULL Nano Banana 2 product visual prompt.
  - Follow Creative Mode Guidance to bias diversity vs proven winners: ${input.creativeMode}.
  - visualPrompt MUST be a single-line string (no newline characters) suitable for Nano Banana 2.
  - Include the following labeled sections inside the single string, separated by " | ":
    1) REFERENCE IMAGE: Choose the most appropriate reference image type (product hero vs lifestyle vs in-use) based on the concept's scene/style and the campaign's visualDirection. Be explicit (e.g. "reference: product close-up + optional lifestyle background").
    2) SCENE: Specific environment/location + product placement. Include subject placement (where the product sits/stands in frame), foreground + background elements, depth-of-field cues, realism level, and what the viewer should notice first. Avoid words like "nice setting", "clean look", or "modern vibe".
    3) LIGHTING: Specify lighting direction (front-lit / side-lit) plus softness vs harshness, highlights/shadows behavior, and color temperature.
    4) COLOR PALETTE: Dominant colors + 2-4 accent colors that match the concept.
    5) MOOD: Emotional tone (not generic) that matches the hook/angle.
    6) TEXT OVERLAY: Use the EXACT overlay strings from the strategy and place them precisely:
       - Top: HEADLINE (headline) + placement (e.g. top-left safe area, bold, short lines)
       - Middle: PRIMARY TEXT (primaryText) + placement (e.g. centered mid-frame, readable hierarchy). If primaryText is empty string (""), omit the middle/body overlay line and place CTA only.
       - Bottom: CTA (cta) + placement (e.g. bottom-center pill/button area, high contrast)
       Add brief notes for contrast and readability against the background.
    7) TYPOGRAPHY: Font feel (sans/serif/script), weight, color, and micro-style (e.g. condensed / rounded), aligned to the concept.
    8) CAMERA FEEL: Lens/angle vibes (e.g. 24mm lifestyle, 85mm product close-up look), perspective, and overall framing.
    9) SCROLL-STOP DETAIL: One specific, non-generic detail that makes it feel like a high-performing ecommerce ad (e.g. packaging label visibility, fabric/texture macro, rim light on product edges, motion freeze, subtle steam, etc.).

  - Tone and conversion quality rules for "product":
    - Ad Mix Strategy (for final visuals): ${input.adMixStrategy}
    - Strictly Follow Selected Angles: ${input.strictlyFollowSelectedAngles ? "ON" : "OFF"}
    - Include Experimental / Clickbait Ads: ${input.includeExperimentalAds ? "ON" : "OFF"}
    - Internally extract (do not output): product summary, multiple audience pockets (do not reuse the same persona), features->benefits, differentiators & proof, and urgency.
    - Do NOT repeat the same audience idea, style direction, or hook across ads.
    - Avoid vague visuals (no generic "clean background" alone). Every scene must include specific lighting + color + depth cues.
    - Vary CTA strength/urgency across ads (e.g. some soft-benefit CTAs, some stronger urgency) while using the EXACT provided CTA text.
    - Mix problem/solution, lifestyle, urgency/gift/education/clickbait styles across the set.

  - Format distribution (respect exactly when possible):
    - For the first ~70% of ads by ad order (ad #1..), include "aspect ratio: 9:16" (and mention 70% of requestedAdCount).
    - For the remaining ~30%, include "aspect ratio: 1080x1080" (1:1 square).
    - If exact rounding is ambiguous, be consistent and keep the split close.

- Else if creativeStrategyJson.campaignType is "donation", generate FULL fundraiser-spec donation visual prompts (UGC/emotional/raw/hyper-real).
  - Follow Creative Mode Guidance to bias diversity vs proven winners: ${input.creativeMode}.
  - Ad Mix Strategy (for final visuals): ${input.adMixStrategy}
  - Strictly Follow Selected Angles: ${input.strictlyFollowSelectedAngles ? "ON" : "OFF"}
  - Include Experimental / Clickbait Ads: ${input.includeExperimentalAds ? "ON" : "OFF"}
  - visualPrompt MUST be a single-line string (no newline characters) suitable for Nano Banana 2.
  - visualPrompt MUST include:
    - REFERENCE IMAGE USAGE: explicitly instruct how to use uploaded reference images (e.g. "use reference: donor face / real-life scene / product/benefit context as likeness anchor").
    - EXACT LIKENESS REQUIREMENT: describe that the image must resemble the provided subject(s)/reference(s) (real faces, real features); do NOT stylize into generic stock.
    - SCENE COMPOSITION: specific environment/location + subject placement (where the subject sits/stands in frame), what is in foreground/midground/background, and what the viewer’s eye should land on first. Avoid words like "nice setting", "clean look", or "modern vibe".
    - LIGHTING DETAILS: direction + softness/harshness + realism; include shadow behavior and highlight rolloff.
    - CAMERA ANGLE: lens/height/perspective feel (e.g. eye-level handheld, slight tilt, documentary framing).
    - EMOTIONAL FRAMING: include raw emotion (fear/hope/grief/relief) and emphasize the human moment without turning it into propaganda.
    - TEXT OVERLAY: exact overlay strings from the strategy:
      - Top: headline
      - Middle: primaryText (if non-empty; otherwise omit that line but keep CTA in bottom)
      - Bottom: cta
      Include placement + contrast notes (what background area is behind the text).
    - TYPOGRAPHY: font feel, weight, color contrast, and how it should look on the background (high-legibility, human/realistic overlay styling).
  - Donation style-group rotation (TOTAL = 14 prompts; map by ad order and truncate/extend to match EXACT requestedAdCount):
    1) UGC SNAPCHAT: ads 1–3 (3 prompts)
    2) NATIVE ORGANIC: ads 4–6 (3 prompts)
    3) CLICKBAIT: ads 7–9 (3 prompts)
    4) CREATIVE CONCEPT: ads 10–12 (3 prompts)
    5) ILLUSTRATED: ads 13–14 (2 prompts)
  - For each prompt group:
    - UGC SNAPCHAT: handheld look, imperfect framing, real-room lighting, authentic emotion, subtle motion blur feeling (still hyper-real).
    - NATIVE ORGANIC: natural candid composition, documentary feel, realistic clothing/skin texture.
    - CLICKBAIT: dramatic but truthful framing; emphasize the emotional contrast; DO NOT add fake/irrelevant shock props.
    - CREATIVE CONCEPT: one distinctive cinematic idea each time; keep realism (no generic AI-art poster look).
    - ILLUSTRATED: keep the emotional moment; if illustrating, maintain hyper-real facial features and preserve the scene’s realism cues (not cartoony).
  - STRICT REALISM + HARD RULES:
    - NEVER sanitize injuries.
    - NEVER beautify hardship.
    - ALWAYS preserve realism and emphasize emotion.
    - Do NOT repeat the same angle, concept, or composition.
    - Do NOT repeat the same audience persona, donor story beat, or visual motif.
  - URGENCY HANDLING:
    - If urgency is detectable from overlays/strategy/context, inject urgency naturally into the overlay CTA copy instructions (use the EXACT provided cta string).
    - If not detectable, focus on emotional storytelling (still conversion-aware).
  - Angle/Concept rotation rules (applies to all donation ads):
    - NEVER repeat the same angle type across the output (track used angles internally).
    - Ensure each ad feels like a different donor-recognition moment (different expression/composition/scene).
  - Donation output fields rules (do not change JSON keys):
    - angle MUST include the STYLE GROUP label (UGC SNAPCHAT / NATIVE ORGANIC / CLICKBAIT / CREATIVE CONCEPT / ILLUSTRATED) + a unique concept descriptor.
    - hook MUST be the overlay idea that matches the emotional framing for that STYLE GROUP.
    - headline / primaryText / cta MUST come from the strategy overlay values (do not invent alternative overlay wording); visualPrompt is where the detailed scene + typography instructions go.
  - Quality rules:
    - Avoid generic visuals (no "simple background" alone).
    - Include scroll-stopping specifics (visible texture, skin detail, fabric folds, real-world imperfections).
    - Each ad must read like a premium fundraiser image concept ready for immediate Kie generation.

  - Use EXACT provided overlay values from the strategy for headline/primaryText/cta placement.

  - Do NOT output prose; visualPrompt is a single-line string.

  - If you cannot infer required overlays, still keep the output schema valid and ensure angle/hook/headline/primaryText/cta are present from the strategy.

DONATION PROMPT OVERRIDE (user templates + 8-block quality structure):
  - selected_templates (ids): ${selectedTemplateIds.join(", ") || "NONE"}
  - campaign_type: ${donationCampaignType || "UNKNOWN"}
  - user uploaded reference images attached: ${hasUserUploadedReferenceImages ? "YES" : "NO"}
  - Donation subject ground-truth:
    - subject_name: ${(donationSubject?.subjectName || "").slice(0, 120)}
    - subject_type: ${(donationSubject?.subjectType || "").slice(0, 30)}
    - species_breed_age: ${(donationSubject?.speciesBreedAge || "").slice(0, 160)}
    - physical_description: ${(donationSubject?.physicalDescription || "").slice(0, 900)}
    - injury_or_medical_details: ${(donationSubject?.injuryOrMedicalDetails || "").slice(0, 900)}
    - backstory_summary: ${(donationSubject?.backstorySummary || "").slice(0, 500)}
    - urgency_level: ${(donationSubject?.urgencyLevel || "").slice(0, 40)}
    - emotional_hook: ${(donationSubject?.emotionalHook || "").slice(0, 260)}

TEMPLATE ALLOCATION (must match EXACTLY requestedAdCount):
  - Group ads by selected templates in this template-id order: 1 -> 2 -> 3 -> 4 -> 5 -> 6.
  - Template counts:
    - TEMPLATE 1 (UGC SNAPCHAT) = 3 ads
    - TEMPLATE 2 (NATIVE ORGANIC) = 3 ads
    - TEMPLATE 3 (HYPER REALISTIC CLICKBAIT) = 3 ads
    - TEMPLATE 4 (CREATIVE CONCEPT) = 3 ads
    - TEMPLATE 5 (ILLUSTRATED AI) = 2 ads
    - TEMPLATE 6 (KLING VIDEO READY) = 3 ads

  Donation JSON fields rules (still using the existing keys only):
  - angle MUST use the selected TEMPLATE label prefix (including KLING VIDEO READY for TEMPLATE 6) and include an AD index within that template.
    - TEMPLATE 1 => "UGC SNAPCHAT AD"
    - TEMPLATE 2 => "NATIVE ORGANIC AD"
    - TEMPLATE 3 => "HYPER REALISTIC CLICKBAIT AD"
    - TEMPLATE 4 => "CREATIVE CONCEPT AD"
    - TEMPLATE 5 => "ILLUSTRATED AI AD"
    - TEMPLATE 6 => "KLING VIDEO READY AD"
  - hook MUST match the emotional overlay idea for that template.
  - headline / primaryText / cta MUST come from the strategy overlays for this ad.

REQUIRED 8-BLOCK QUALITY PROMPT (visualPrompt ONLY, must be in this exact order):
  - visualPrompt MUST be a single-line string with NO newline characters.
  - BLOCK 1:
    "Using the attached reference images as the primary subject reference. Do not generalize. Do not create a generic [species/person]. Recreate the EXACT subject including: Specific facial structure and features; Exact coloring, markings, and fur or skin texture; All visible injuries exactly as shown in reference; All medical details — bandages colors and patterns, IV lines, medical devices, wounds — exactly as they appear; Their specific expression and body language Reference images override all other description. If no reference images are attached use the physical description and injury details provided to be as specific as possible."
  - BLOCK 2:
    "Do not heal, clean up, soften, beautify, or improve any injuries, wounds, medical devices, or physical damage. The injuries are the emotional core of this image. Every wound, bandage, and medical detail must be faithfully recreated exactly as described or shown. If anything has been softened the prompt has failed."
  - BLOCK 3:
    "Vertical 9:16 format. [STYLE SPECIFIC CAMERA QUALITY BLOCK]"
  - BLOCK 4:
    Inject template-specific scene description (specific environment + subject placement + foreground/background + depth cues). Avoid vague phrases like "nice setting" or "modern vibe".
  - BLOCK 5:
    Inject template-specific lighting (direction + softness/harshness + color temperature + shadow/highlight behavior).
  - BLOCK 6 (INCLUDE ONLY IF ON-IMAGE TEXT IS REQUIRED BY THIS TEMPLATE):
    "[TEXT CONTENT] Text placement rules: Slightly imperfect alignment — 2 to 3 degrees off horizontal. As if typed directly into Instagram stories in 30 seconds. Not perfectly centered — slightly left or right of center. White text with subtle dark outline. Clean bold sans serif font. Chunky and readable at scroll speed. The imperfection is intentional and critical to authenticity."
    - [TEXT CONTENT] must be the EXACT strategy overlays: headline (top), primaryText (middle if non-empty), cta (bottom).
    - OMIT BLOCK 6 entirely for TEMPLATE 2 and for TEMPLATE 6 KIE image prompt.
  - BLOCK 7:
    Use this emotional direction phrase: ${emotionalDirection}
  - BLOCK 8:
    "This image should look like it was taken by someone who loves this subject and is terrified of losing them — not by someone who knows how to make ads. The moment it looks produced it loses everything. Keep it human. Keep it real."

  TEMPLATE STYLE BINDINGS (how to fill BLOCK 3–5 and whether BLOCK 6 appears):
  - TEMPLATE 1 (UGC SNAPCHAT): fill [STYLE SPECIFIC CAMERA QUALITY BLOCK] with handheld smartphone look, grain, slight washout, imperfect framing; concepts: Middle of the night / Vet visit / Home moment; INCLUDE BLOCK 6.
  - TEMPLATE 2 (NATIVE ORGANIC): fill [STYLE SPECIFIC CAMERA QUALITY BLOCK] with quiet camera-roll realism; concepts: Empty object / Quiet moment / Human touch; OMIT BLOCK 6 (NO on-image text).
  - TEMPLATE 3 (CLICKBAIT): fill [STYLE SPECIFIC CAMERA QUALITY BLOCK] with hyper-real close framing and confrontational truth; concepts: Direct confrontation / Scale shot / Evidence shot; INCLUDE BLOCK 6.
  - TEMPLATE 4 (CREATIVE CONCEPT): fill [STYLE SPECIFIC CAMERA QUALITY BLOCK] with cinematic real-world prop realism (missing poster/sticky note/vet invoice/etc); INCLUDE BLOCK 6.
  - TEMPLATE 5 (ILLUSTRATED AI): fill [STYLE SPECIFIC CAMERA QUALITY BLOCK] with painterly/watercolor/colored pencil look while preserving injuries exactly (no sanitizing); INCLUDE BLOCK 6.
  - TEMPLATE 6 (KLING VIDEO READY):
    - output visualPrompt in this exact format (single-line):
      "KIE_IMAGE_PROMPT: <BLOCKS 1–5 and 7–8 only (OMIT BLOCK 6)> || KLING_ANIMATION_PROMPT: <animation prompt>"
    - KLING_ANIMATION_PROMPT must follow:
      - Subject breathes gently (chest rise/fall visible) with low motion intensity.
      - Choose exactly one background movement element: curtains OR candle flame OR rain on glass OR dust in light beam OR outside world (blurred trees/street).
      - Fur/skin reacts to moving light source.
      - Camera completely still. Motion intensity low. Duration 6–8 seconds. Photorealistic.
      - Add text-to-add cue at end:
        "Text to add in post — centered at top, fades in at 1 second, holds through 6 seconds, fades out: [SINGLE EMOTIONAL LINE BASED ON campaign_type]."

Else (any other non-"product" campaignType), follow the existing simpler visualPrompt quality requirements only:
  - visualPrompt must include:
    - subject framing and composition
    - environment specifics
    - lighting direction and quality
    - texture/realism cues
    - typographyDirection guidance
    - exact overlay text (headline + primaryText + cta) with placement notes
    - camera feel (lens/angle vibes) and overall mood

- Do NOT invent missing fields for headline/primaryText/cta; use overlay values from the strategy.
- Do not output prose; JSON only.

creativeStrategyJson:
${input.creativeStrategyJson}

${contractTail}

${selfCheckPassBlock}
`;
    const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 7000,
        messages: [
            {
                role: "user",
                content: prompt
            }
        ]
    });
    return getFirstTextOrThrow(response);
}
async function generateAdVariationsFromBaseAd(input) {
    const requestedVariations = Math.max(3, Math.min(5, Math.floor(input.requestedVariations)));
    const commonAdsSchema = `
{
  "ads": [
    {
      "angle": "",
      "hook": "",
      "primaryText": "",
      "headline": "",
      "cta": "",
      "visualPrompt": ""
    }
  ]
}
`;
    const contractTail = `
OUTPUT CONTRACT (MUST FOLLOW EXACTLY):
- Output MUST be a single JSON object with a root key "ads".
- "ads" MUST be a non-empty array with EXACTLY ${requestedVariations} items.
- Each ad item MUST include exactly these keys: "angle", "hook", "primaryText", "headline", "cta", "visualPrompt".
- visualPrompt MUST be a production-ready single-image prompt suitable for Nano Banana 2.
- No markdown/code fences/prose. JSON only.
${buildRejectionTail()}
`;
    const strictAngleBlock = input.strictlyFollowSelectedAngles ? `
Strictly Follow Selected Angles (ON):
- Keep the angle family tightly aligned with the baseAd.angle.
- Do NOT switch into unrelated concepts/offers.
` : `
Strictly Follow Selected Angles (OFF):
- You may keep the same offer lane but broaden slightly into adjacent execution ideas.
`;
    const experimentalBlock = input.includeExperimentalAds ? `
Include Experimental / Clickbait Ads (ON):
- Ensure at least 1 variation feels more experimental / clickbait / pattern-interrupt than the rest.
` : `
Include Experimental / Clickbait Ads (OFF):
- Keep variations more conventional overall.
`;
    const adMixBlock = input.adMixStrategy === "Heavy Testing" ? `
Ad Mix Strategy (Heavy Testing):
- Variations should feel more chaotic/high-contrast: mix emotional + DR + pattern interrupts; vary text density and visual intensity.
` : input.adMixStrategy === "Focused Batch" ? `
Ad Mix Strategy (Focused Batch):
- Keep the same angle lane; vary execution details (hook/headline/body/cta/visual) without drifting into new families.
` : `
Ad Mix Strategy (Even Mix):
- Balanced variety across the variations, without duplicates.
`;
    const variationInstructionBlock = input.variationInstruction ? `
Additional variation instruction from user:
${input.variationInstruction}
` : "";
    const antiGenericBlock = `
ANTI-GENERIC FILTER:
- Avoid generic hooks and templated ad language.
- If any hook/scene feels generic, rewrite it.
`;
    const differentiationBlock = `
DIFFERENTIATION (within variations):
- Each variation must differ from the others in at least TWO of:
  hook structure, headline, primaryText text density, CTA tone, visual composition/framing, or emotional framing.
`;
    const sceneSpecificityBlock = `
SCENE SPECIFICITY:
- Every variation's scene must include: specific environment/location, lighting direction, color palette, camera angle, subject placement, and foreground/background elements.
`;
    const selfCheckVariationsBlock = `
SELF-CHECK (before outputting JSON):
- Verify no clones: hook + headline + primaryText + cta wording must not all match baseAd.
- Verify differentiation across the generated variations (2-of rule).
- Verify no generic hooks/scenes.
- Then output final JSON only.
`;
    const prompt = `
You are generating VARIATIONS of a single existing ad tab (NOT a fresh batch).

Task:
- Create EXACTLY ${requestedVariations} new ad variations from the baseAd below.
- Preserve the base concept / angle family / core offer lane.
- Do NOT create clones: every variation must change at least hook, headline, primaryText, and cta wording (and also change visualPrompt meaningfully).

Rules:
- Stay within the provided adTab payload schema and return JSON ONLY.
- Avoid unrelated concepts/offers.
- It is OK to reuse the same visual style across variations; vary composition, framing, subject interaction, and text usage.
- Text handling:
  - If the user instruction requests removing text (e.g. "remove text", "no-text", "less text"), set primaryText to an empty string: "".
  - Otherwise, allow minimal-text variants by using short primaryText (<= 6 words), not empty, unless asked.

${variationInstructionBlock}

BaseAd (source of truth):
${JSON.stringify(input.baseAd)}

Campaign settings:
- campaignType: ${input.campaignType}
- creativeMode: ${input.creativeMode}
${adMixBlock}
${strictAngleBlock}
${experimentalBlock}

${antiGenericBlock}
${differentiationBlock}
${sceneSpecificityBlock}

When writing visualPrompt:
- output a single-line Nano Banana 2 prompt with labeled sections separated by " | ".
- Include: REFERENCE IMAGE USAGE | SCENE | LIGHTING | COLOR PALETTE | MOOD | TEXT OVERLAY | TYPOGRAPHY | CAMERA FEEL | SCROLL-STOP DETAIL.
- Ensure TEXT OVERLAY uses the variation's headline/primaryText/cta with clear placement + readability notes.

Return VALID JSON ONLY with this exact schema:
${commonAdsSchema}

${contractTail}

${selfCheckVariationsBlock}
`;
    const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 3500,
        messages: [
            {
                role: "user",
                content: prompt
            }
        ]
    });
    return getFirstTextOrThrow(response);
}
}),
"[project]/src/lib/scrape.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeAndValidatePublicUrl",
    ()=>normalizeAndValidatePublicUrl,
    "scrapeUrlToHtml",
    ()=>scrapeUrlToHtml
]);
function isPrivateIpLiteral(hostname) {
    const lower = hostname.toLowerCase();
    if (lower === "localhost") return true;
    if (lower === "::1") return true;
    const ipv4Match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (!ipv4Match) return false;
    const parts = ipv4Match.slice(1).map((n)=>Number(n));
    if (parts.some((p)=>!Number.isInteger(p) || p < 0 || p > 255)) return true;
    const [a, b] = parts;
    if (a === 127) return true;
    if (a === 10) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 169 && b === 254) return true;
    return false;
}
function normalizeAndValidatePublicUrl(input) {
    const raw = input.trim();
    if (!raw) throw new Error("URL is required");
    const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw);
    const normalizedInput = hasScheme ? raw : `https://${raw}`;
    let url;
    try {
        url = new URL(normalizedInput);
    } catch  {
        throw new Error("Invalid URL (check formatting)");
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("URL must start with http:// or https://");
    }
    if (isPrivateIpLiteral(url.hostname)) {
        throw new Error("Refusing to fetch private/local URLs");
    }
    // Return the caller-facing normalized input (trim + scheme injection only).
    // This avoids unexpected canonicalization changes like trailing slashes.
    return normalizedInput;
}
async function fetchWithTimeout(url, init, timeoutMs) {
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), timeoutMs);
    try {
        return await fetch(url, {
            ...init,
            signal: controller.signal
        });
    } finally{
        clearTimeout(timeout);
    }
}
async function fetchHtmlOnce(url) {
    const response = await fetchWithTimeout(url, {
        method: "GET",
        cache: "no-store",
        redirect: "follow",
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "no-cache",
            Pragma: "no-cache"
        }
    }, 15000);
    const contentType = response.headers.get("content-type");
    const html = await response.text();
    const imageUrls = extractImageUrlsFromHtml(html);
    return {
        finalUrl: response.url || url,
        html,
        status: response.status,
        contentType,
        imageUrls
    };
}
function extractImageUrlsFromHtml(html) {
    const urls = new Set();
    const text = html ?? "";
    // <img src="...">
    const imgSrcRe = /<img[^>]+src\s*=\s*["']([^"']+)["']/gi;
    let match;
    while((match = imgSrcRe.exec(text)) !== null){
        const url = match[1];
        if (typeof url !== "string") continue;
        const lower = url.toLowerCase();
        if ((url.startsWith("http://") || url.startsWith("https://")) && (lower.includes(".png") || lower.includes(".jpg") || lower.includes(".jpeg") || lower.includes(".webp") || lower.includes("image"))) {
            urls.add(url);
        }
    }
    // <meta property="og:image" content="...">
    const ogImageRe = /<meta[^>]+property\s*=\s*["']og:image["'][^>]+content\s*=\s*["']([^"']+)["'][^>]*>/i;
    const ogMatch = text.match(ogImageRe);
    if (ogMatch?.[1]) {
        const url = ogMatch[1];
        const lower = url.toLowerCase();
        if ((url.startsWith("http://") || url.startsWith("https://")) && (lower.includes(".png") || lower.includes(".jpg") || lower.includes(".jpeg") || lower.includes(".webp") || lower.includes("image"))) {
            urls.add(url);
        }
    }
    return Array.from(urls);
}
function buildJinaReaderUrl(targetUrl) {
    // Jina "reader" style endpoint which returns extracted text/HTML-ish output.
    // It’s a pragmatic fallback when sites block direct fetches.
    return `https://r.jina.ai/${targetUrl}`;
}
async function scrapeUrlToHtml(urlInput) {
    const url = normalizeAndValidatePublicUrl(urlInput);
    let lastError = null;
    // Attempt 1: direct fetch
    try {
        const result = await fetchHtmlOnce(url);
        if (result.html && result.html.length > 300) return result;
    } catch (err) {
        lastError = err;
    }
    // Attempt 2: fallback (often bypasses bot protections)
    try {
        const fallbackUrl = buildJinaReaderUrl(url);
        const result = await fetchHtmlOnce(fallbackUrl);
        if (result.html && result.html.length > 300) return result;
    } catch (err) {
        lastError = err;
    }
    const message = lastError instanceof Error ? lastError.message : String(lastError || "Unknown error");
    throw new Error(`Failed to fetch URL content. ${message}`);
}
}),
"[project]/src/lib/claude/parseClaudeJson.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeAdsCount",
    ()=>normalizeAdsCount,
    "parseClaudeAdPayload",
    ()=>parseClaudeAdPayload,
    "parseValidateAndNormalizeClaudeAds",
    ()=>parseValidateAndNormalizeClaudeAds,
    "sanitizeClaudeRawOutput",
    ()=>sanitizeClaudeRawOutput,
    "validateClaudeAdsPayload",
    ()=>validateClaudeAdsPayload
]);
function sanitizeClaudeRawOutput(rawText) {
    let text = rawText ?? "";
    // Remove BOM if present.
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    return text.trim();
}
function safePreview(text, maxChars = 500) {
    const cleaned = sanitizeClaudeRawOutput(text);
    return cleaned.slice(0, maxChars);
}
function safeJsonParse(text) {
    try {
        return {
            ok: true,
            value: JSON.parse(text)
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
            ok: false,
            error: message
        };
    }
}
function extractFromCodeFence(raw) {
    // Supports ```json ...``` and ``` ...```
    // Strategy: scan for fences and return the first block that parses as JSON (or at least contains {/[).
    const text = raw.replace(/\r\n/g, "\n");
    const fence = "```";
    const blocks = [];
    let i = 0;
    while(i < text.length){
        const start = text.indexOf(fence, i);
        if (start === -1) break;
        const afterFence = start + fence.length;
        const lineEnd = text.indexOf("\n", afterFence);
        const headerEnd = lineEnd === -1 ? text.length : lineEnd;
        const blockStart = headerEnd + 1;
        const end = text.indexOf(fence, blockStart);
        if (end === -1) break;
        const inner = text.slice(blockStart, end).trim();
        if (inner) blocks.push(inner);
        i = end + fence.length;
    }
    for (const block of blocks){
        if (!block.includes("{") && !block.includes("[")) continue;
        const parsed = safeJsonParse(block);
        if (parsed.ok) return {
            ok: true,
            extracted: block
        };
    }
    return {
        ok: false,
        error: "No JSON-parsable fenced code block found."
    };
}
function balancedExtractTopLevelJson(raw) {
    const text = raw;
    const firstObj = text.indexOf("{");
    const firstArr = text.indexOf("[");
    const start = firstObj === -1 ? firstArr : firstArr === -1 ? firstObj : Math.min(firstObj, firstArr);
    if (start === -1) {
        return {
            ok: false,
            error: "No '{' or '[' found in output."
        };
    }
    const openChar = text[start];
    const closeChar = openChar === "{" ? "}" : "]";
    let depth = 0;
    let inString = false;
    let escape = false;
    for(let i = start; i < text.length; i++){
        const ch = text[i];
        if (inString) {
            if (escape) {
                escape = false;
                continue;
            }
            if (ch === "\\") {
                escape = true;
                continue;
            }
            if (ch === '"') {
                inString = false;
            }
            continue;
        }
        if (ch === '"') {
            inString = true;
            continue;
        }
        if (ch === openChar) depth += 1;
        if (ch === closeChar) depth -= 1;
        if (depth === 0) {
            const extracted = text.slice(start, i + 1);
            return {
                ok: true,
                extracted
            };
        }
    }
    return {
        ok: false,
        error: "Found JSON start but could not find matching close."
    };
}
function coercePayloadShape(value) {
    if (Array.isArray(value)) {
        return {
            ads: value
        };
    }
    if (value && typeof value === "object") {
        const ads = value.ads;
        if (Array.isArray(ads)) return value;
    }
    return null;
}
function recoverAdsArrayFromNearMissObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const obj = value;
    const candidates = Object.entries(obj).filter(([, v])=>Array.isArray(v)).map(([k, v])=>({
            key: k,
            arr: v
        })).filter(({ arr })=>arr.length > 0 && arr.every((item)=>item && typeof item === "object" && !Array.isArray(item)));
    if (candidates.length === 0) return null;
    const preferredKeys = [
        "adIdeas",
        "ad_ideas",
        "adConcepts",
        "ad_concepts",
        "concepts",
        "creatives",
        "creative",
        "variants",
        "results",
        "items",
        "outputAds",
        "adsPayload"
    ];
    const preferred = candidates.find((c)=>preferredKeys.includes(c.key));
    const picked = preferred || candidates[0];
    return {
        recoveredKey: picked.key,
        ads: picked.arr
    };
}
function listTopLevelKeys(value) {
    if (!value || typeof value !== "object") return [];
    if (Array.isArray(value)) return [];
    return Object.keys(value);
}
function extractAdsArrayFromParsedValue(value) {
    // Implements ordered fallbacks from the request:
    // - root array → ads
    // - data.data array → ads
    // - data.results array → ads
    // - object has only one array field → ads
    // - if array items look like ads (contain "hook" or "headline") → accept
    const detectedKeys = listTopLevelKeys(value);
    const looksLikeAd = (item)=>item && typeof item === "object" && !Array.isArray(item) && (typeof item.hook === "string" || typeof item.headline === "string" || typeof item.primaryText === "string");
    if (Array.isArray(value)) {
        return {
            ok: true,
            ads: value,
            extractedFrom: "root_array",
            detectedKeys
        };
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
        const obj = value;
        if (Array.isArray(obj.ads)) {
            return {
                ok: true,
                ads: obj.ads,
                extractedFrom: "ads",
                detectedKeys
            };
        }
        if (Array.isArray(obj.data)) {
            return {
                ok: true,
                ads: obj.data,
                extractedFrom: "data",
                detectedKeys
            };
        }
        if (obj.data && typeof obj.data === "object" && Array.isArray(obj.data.data)) {
            return {
                ok: true,
                ads: obj.data.data,
                extractedFrom: "data.data",
                detectedKeys
            };
        }
        if (Array.isArray(obj.results)) {
            return {
                ok: true,
                ads: obj.results,
                extractedFrom: "results",
                detectedKeys
            };
        }
        const arrayFields = Object.entries(obj).filter(([, v])=>Array.isArray(v));
        if (arrayFields.length === 1) {
            return {
                ok: true,
                ads: arrayFields[0][1],
                extractedFrom: `only_array_field:${arrayFields[0][0]}`,
                detectedKeys
            };
        }
        const recovered = recoverAdsArrayFromNearMissObject(value);
        if (recovered) {
            return {
                ok: true,
                ads: recovered.ads,
                extractedFrom: `near_miss:${recovered.recoveredKey}`,
                detectedKeys
            };
        }
    }
    // If we found *some* array earlier but it didn't match the above, we don't attempt deeper heuristics.
    return {
        ok: false,
        error: "No ads array found",
        detectedKeys
    };
}
function detectAdCount(value) {
    if (Array.isArray(value)) return value.length;
    if (value && typeof value === "object") {
        const ads = value.ads;
        if (Array.isArray(ads)) return ads.length;
    }
    return undefined;
}
function parseClaudeAdPayload(rawText) {
    const sanitized = sanitizeClaudeRawOutput(rawText);
    const preview = safePreview(rawText);
    const direct = safeJsonParse(sanitized);
    if (direct.ok) {
        const extracted = extractAdsArrayFromParsedValue(direct.value);
        if (!extracted.ok) {
            return {
                ok: false,
                error: `${extracted.error}. Detected keys: ${extracted.detectedKeys.join(", ") || "none"}`,
                preview,
                meta: {
                    strategy: "direct",
                    adCount: detectAdCount(direct.value)
                }
            };
        }
        return {
            ok: true,
            data: {
                ...direct.value,
                ads: extracted.ads
            },
            meta: {
                strategy: "direct",
                adCount: extracted.ads.length
            }
        };
    }
    const fenced = extractFromCodeFence(sanitized);
    if (fenced.ok) {
        const parsed = safeJsonParse(fenced.extracted);
        if (parsed.ok) {
            const extracted = extractAdsArrayFromParsedValue(parsed.value);
            if (!extracted.ok) {
                return {
                    ok: false,
                    error: `${extracted.error}. Detected keys: ${extracted.detectedKeys.join(", ") || "none"}`,
                    preview,
                    meta: {
                        strategy: "code_fence",
                        adCount: detectAdCount(parsed.value)
                    }
                };
            }
            return {
                ok: true,
                data: {
                    ...parsed.value,
                    ads: extracted.ads
                },
                meta: {
                    strategy: "code_fence",
                    adCount: extracted.ads.length
                }
            };
        }
    }
    const extracted = balancedExtractTopLevelJson(sanitized);
    if (extracted.ok) {
        const parsed = safeJsonParse(extracted.extracted);
        if (parsed.ok) {
            const extractedAds = extractAdsArrayFromParsedValue(parsed.value);
            if (!extractedAds.ok) {
                return {
                    ok: false,
                    error: `${extractedAds.error}. Detected keys: ${extractedAds.detectedKeys.join(", ") || "none"}`,
                    preview,
                    meta: {
                        strategy: "balanced_extract",
                        adCount: detectAdCount(parsed.value)
                    }
                };
            }
            return {
                ok: true,
                data: {
                    ...parsed.value,
                    ads: extractedAds.ads
                },
                meta: {
                    strategy: "balanced_extract",
                    adCount: extractedAds.ads.length
                }
            };
        }
        return {
            ok: false,
            error: `Extracted JSON candidate but JSON.parse failed: ${parsed.error}`,
            preview,
            meta: {
                strategy: "balanced_extract"
            }
        };
    }
    return {
        ok: false,
        error: `Could not parse JSON. Direct parse error: ${direct.error}. Fence: ${fenced.ok ? "ok" : fenced.error}. Extract: ${extracted.ok ? "ok" : extracted.error}`,
        preview
    };
}
function validateClaudeAdsPayload(payload) {
    if (!payload || typeof payload !== "object") {
        return {
            ok: false,
            error: "Payload must be an object."
        };
    }
    if (!Array.isArray(payload.ads)) {
        return {
            ok: false,
            error: 'Payload is missing required field "ads" (must be an array).'
        };
    }
    if (payload.ads.length === 0) {
        return {
            ok: false,
            error: 'Payload "ads" array is empty. Expected at least 1 ad.'
        };
    }
    const requiredNonEmptyFields = [
        "angle",
        "hook",
        "headline",
        "cta",
        "visualPrompt"
    ];
    const warnings = [];
    const validAds = [];
    let invalidCount = 0;
    payload.ads.forEach((ad, index)=>{
        const adNum = index + 1;
        if (!ad || typeof ad !== "object" || Array.isArray(ad)) {
            invalidCount += 1;
            warnings.push(`Ad ${adNum} is not a valid object; skipped.`);
            return;
        }
        const missing = [];
        for (const field of requiredNonEmptyFields){
            const value = ad[field];
            if (typeof value !== "string" || !value.trim()) missing.push(String(field));
        }
        // primaryText is allowed to be empty string to support true "no-text" ads.
        if (typeof ad.primaryText !== "string") {
            missing.push("primaryText");
        }
        if (missing.length) {
            invalidCount += 1;
            warnings.push(`Ad ${adNum} missing/invalid fields: ${missing.join(", ")}; skipped.`);
            return;
        }
        validAds.push(ad);
    });
    if (invalidCount > 0) {
        warnings.unshift(`Skipped ${invalidCount} invalid ads due to missing required fields.`);
    }
    // IMPORTANT: caller will treat 0 valid ads as an error (not warnings).
    return {
        ok: true,
        ads: validAds,
        warnings
    };
}
function normalizeAdsCount(ads, requestedCount) {
    const warnings = [];
    if (ads.length > requestedCount) {
        warnings.push(`Model returned ${ads.length} ads; trimming to requested ${requestedCount}.`);
        return {
            ads: ads.slice(0, requestedCount),
            warnings
        };
    }
    if (ads.length < requestedCount) {
        warnings.push(`Model returned ${ads.length} ads; fewer than requested ${requestedCount}.`);
        return {
            ads,
            warnings
        };
    }
    return {
        ads,
        warnings
    };
}
function parseValidateAndNormalizeClaudeAds(rawText, requestedCount) {
    const sanitized = sanitizeClaudeRawOutput(rawText);
    const parsed = parseClaudeAdPayload(sanitized);
    if (!parsed.ok) {
        return {
            ok: false,
            diagnostics: {
                ok: false,
                error: parsed.error,
                preview: parsed.preview,
                strategy: parsed.meta?.strategy,
                requestedCount,
                parsedAdCount: parsed.meta?.adCount,
                warnings: []
            }
        };
    }
    const validation = validateClaudeAdsPayload(parsed.data);
    if (!validation.ok) {
        return {
            ok: false,
            diagnostics: {
                ok: false,
                error: validation.error,
                preview: sanitized.slice(0, 500),
                strategy: parsed.meta.strategy,
                requestedCount,
                parsedAdCount: parsed.meta.adCount,
                warnings: []
            }
        };
    }
    const normalized = normalizeAdsCount(validation.ads, requestedCount);
    const warnings = [
        ...validation.warnings || [],
        ...normalized.warnings || []
    ];
    const sampleItemPreview = Array.isArray(parsed.data?.ads) && parsed.data.ads.length > 0 ? JSON.stringify(parsed.data.ads[0], null, 2).slice(0, 500) : "";
    if (normalized.ads.length === 0) {
        const detectedKeys = listTopLevelKeys(parsed.data);
        return {
            ok: false,
            diagnostics: {
                ok: false,
                error: "Parsed JSON but no valid ads matched schema",
                preview: sanitized.slice(0, 500),
                strategy: parsed.meta.strategy,
                requestedCount,
                parsedAdCount: parsed.meta.adCount ?? parsed.data?.ads?.length,
                returnedAdCount: 0,
                warnings,
                detectedKeys,
                invalidCount: (parsed.meta.adCount || 0) - 0,
                sampleItemPreview
            }
        };
    }
    return {
        ok: true,
        ads: normalized.ads,
        diagnostics: {
            ok: true,
            preview: sanitized.slice(0, 500),
            strategy: parsed.meta.strategy,
            requestedCount,
            parsedAdCount: parsed.meta.adCount ?? parsed.data?.ads?.length ?? validation.ads.length,
            returnedAdCount: normalized.ads.length,
            warnings,
            detectedKeys: listTopLevelKeys(parsed.data),
            invalidCount: (parsed.meta.adCount ?? parsed.data?.ads?.length ?? 0) - validation.ads.length,
            sampleItemPreview
        }
    };
}
}),
"[project]/app/jobs/[id]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "$$RSC_SERVER_ACTION_0",
    ()=>$$RSC_SERVER_ACTION_0,
    "$$RSC_SERVER_ACTION_1",
    ()=>$$RSC_SERVER_ACTION_1,
    "$$RSC_SERVER_ACTION_2",
    ()=>$$RSC_SERVER_ACTION_2,
    "$$RSC_SERVER_ACTION_3",
    ()=>$$RSC_SERVER_ACTION_3,
    "$$RSC_SERVER_ACTION_4",
    ()=>$$RSC_SERVER_ACTION_4,
    "$$RSC_SERVER_ACTION_5",
    ()=>$$RSC_SERVER_ACTION_5,
    "$$RSC_SERVER_ACTION_6",
    ()=>$$RSC_SERVER_ACTION_6,
    "default",
    ()=>JobDetailPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"4015356bb4c7e8e9605883f2f41f10786716822ed8":"$$RSC_SERVER_ACTION_4","40163adf6e526e8b5daf9df8dfd98135b45720999b":"$$RSC_SERVER_ACTION_0","4017e7700eafc8c40397f642ec8db7fbc5d8bf413b":"$$RSC_SERVER_ACTION_3","4057a32e8da1e760f6aeaf883bb16e83c894436d98":"$$RSC_SERVER_ACTION_5","4082dbf34e83d757ef3b4effcdddd122ce322f336f":"$$RSC_SERVER_ACTION_6","40ae0eedb2783eb623d89ce87f72ca5fbf7344c59f":"$$RSC_SERVER_ACTION_1","40e7df428217a28d413bdcaba894785ade6e877651":"$$RSC_SERVER_ACTION_2"},"",""] */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$kie$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/kie.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$anthropic$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/anthropic.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claudeAds$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/claudeAds.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scrape$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/scrape.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claude$2f$parseClaudeJson$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/claude/parseClaudeJson.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
function tryParseJson(value) {
    if (!value) return null;
    try {
        return JSON.parse(value);
    } catch  {
        return null;
    }
}
function stripHtml(html) {
    return html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
const PRODUCT_ANGLE_LABELS = [
    "Problem/Solution",
    "Before/After",
    "Root Cause Reveal",
    "Common Mistake",
    "Worst Case Scenario",
    "Lifestyle Aspiration",
    "Dream Outcome",
    "Identity Shift",
    "Future Self",
    "Transformation",
    "Social Proof",
    "Science-Backed",
    "Founder Story",
    "Transparency",
    "Skeptic Converted",
    "Low Stock Warning",
    "Price Increase Warning",
    "Last Chance",
    "Sell-Out Risk",
    "Flash Sale",
    "Price vs. Value",
    "Cost Per Use",
    "Competitor Comparison",
    "ROI / Pays For Itself",
    "Bundle Deal",
    "Contrarian Claim",
    "Myth Busting",
    "Shocking Stat",
    "Relatable Struggle",
    "Risk Reversal / Guarantee",
    "Old Way vs. New Way",
    "Made Differently",
    "Upgraded Version"
];
const DONATION_ANGLE_LABELS = [
    "Deadline/Match Ends Tonight",
    "Every Dollar Doubled",
    "One Person Can Change This",
    "The Cost of Inaction",
    "We're Almost There",
    "Single Person/Animal Story",
    "Before/After (Their Life)",
    "The Moment Everything Changed",
    "Raw Vulnerability",
    "You Were Once Like Them",
    "X,000 People Already Gave",
    "Transparency (Where Money Goes)",
    "Founder/Insider Story",
    "Endorsed by Trusted Name",
    "Real Results Shown",
    "You Can't Unsee This",
    "Shared Responsibility",
    "The Bystander Effect Flip",
    "What If It Were You",
    "Silence = Complicity",
    "Tribe/Community Belonging",
    "\"People Like You Give\"",
    "Values Alignment",
    "Anti-Villain Positioning",
    "Be the Hero",
    "Dream Outcome for Recipient",
    "Light at the End",
    "Proof It Works",
    "This Is Solvable",
    "You're the Missing Piece",
    "Just $1 a Day",
    "Skip One Coffee",
    "No Commitment / Cancel Anytime",
    "Takes 60 Seconds",
    "Small Gift Big Impact",
    "Named/Credited Donor",
    "Founding Member Status",
    "Limited Campaign Window",
    "Public Acknowledgment",
    "Leave a Legacy"
];
function dedupePreserveOrder(items) {
    const seen = new Set();
    const out = [];
    for (const item of items){
        const key = item.trim();
        if (!key) continue;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(key);
    }
    return out;
}
function extractSelectedAnglesFromJobPrimaryAngles(primaryAngles, campaignType) {
    const raw = (primaryAngles || "").trim();
    if (!raw) return {
        selectedAngles: [],
        textAngleNotes: ""
    };
    const labels = campaignType === "product" ? PRODUCT_ANGLE_LABELS : DONATION_ANGLE_LABELS;
    const selectedAngles = labels.filter((label)=>raw.includes(label));
    // Remove selected labels to leave the remaining free-text notes.
    let notes = raw;
    for (const label of selectedAngles){
        // Escape regex chars for safe replacement.
        const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        notes = notes.replace(new RegExp(escaped, "g"), "");
    }
    notes = notes.replace(/[,|]+/g, ",").replace(/\s+,/g, ",").replace(/,\s+/g, ", ").trim();
    // If notes is still identical to raw, we didn't find any labels.
    if (!selectedAngles.length) {
        return {
            selectedAngles: [],
            textAngleNotes: raw
        };
    }
    return {
        selectedAngles,
        textAngleNotes: notes
    };
}
function extractAnglesFromScrapedContent(scrapedContent, campaignType) {
    const text = scrapedContent.toLowerCase();
    const rules = campaignType === "product" ? [
        {
            angle: "Problem/Solution",
            keywords: [
                "problem",
                "pain",
                "struggle",
                "solution",
                "fix"
            ]
        },
        {
            angle: "Relatable Struggle",
            keywords: [
                "tired of",
                "frustrated",
                "sick of",
                "struggling"
            ]
        },
        {
            angle: "Before/After",
            keywords: [
                "before",
                "after",
                "transformation"
            ]
        },
        {
            angle: "Social Proof",
            keywords: [
                "reviews",
                "customers",
                "people",
                "rated",
                "trusted"
            ]
        },
        {
            angle: "Science-Backed",
            keywords: [
                "proven",
                "research",
                "study",
                "clinical",
                "evidence"
            ]
        },
        {
            angle: "Founder Story",
            keywords: [
                "founder",
                "our story",
                "we started"
            ]
        },
        {
            angle: "Transparency",
            keywords: [
                "transparent",
                "ingredients",
                "how it works",
                "breakdown"
            ]
        },
        {
            angle: "Low Stock Warning",
            keywords: [
                "low stock",
                "only left",
                "running out",
                "while supplies last"
            ]
        },
        {
            angle: "Last Chance",
            keywords: [
                "last chance",
                "ending soon",
                "final days",
                "ends soon"
            ]
        },
        {
            angle: "Flash Sale",
            keywords: [
                "flash sale",
                "today only",
                "limited time deal"
            ]
        },
        {
            angle: "Risk Reversal / Guarantee",
            keywords: [
                "guarantee",
                "refund",
                "risk-free",
                "warranty"
            ]
        },
        {
            angle: "Price vs. Value",
            keywords: [
                "value",
                "worth",
                "price vs",
                "compared at"
            ]
        },
        {
            angle: "Competitor Comparison",
            keywords: [
                "versus",
                "compared to",
                "other brands",
                "better than"
            ]
        },
        {
            angle: "ROI / Pays For Itself",
            keywords: [
                "roi",
                "return",
                "pays for itself",
                "save money"
            ]
        },
        {
            angle: "Bundle Deal",
            keywords: [
                "bundle",
                "pack",
                "save more",
                "multi-pack"
            ]
        },
        {
            angle: "Myth Busting",
            keywords: [
                "myth",
                "false",
                "no way",
                "doesn't work",
                "doesn't do"
            ]
        },
        {
            angle: "Shocking Stat",
            keywords: [
                "stat",
                "statistics",
                "percentage",
                "%",
                "x%"
            ]
        },
        {
            angle: "Contrarian Claim",
            keywords: [
                "stop",
                "most people",
                "instead",
                "wrong",
                "quit"
            ]
        },
        {
            angle: "Upgraded Version",
            keywords: [
                "upgraded",
                "improved",
                "new version",
                "enhanced",
                "latest"
            ]
        }
    ] : [
        {
            angle: "Deadline/Match Ends Tonight",
            keywords: [
                "ends tonight",
                "tonight",
                "deadline",
                "match ends",
                "by tonight"
            ]
        },
        {
            angle: "Every Dollar Doubled",
            keywords: [
                "every dollar",
                "doubled",
                "2x",
                "double the impact",
                "match"
            ]
        },
        {
            angle: "One Person Can Change This",
            keywords: [
                "one person",
                "you can",
                "your impact",
                "together we can"
            ]
        },
        {
            angle: "The Cost of Inaction",
            keywords: [
                "cost of inaction",
                "if we don't",
                "without",
                "every day",
                "inaction"
            ]
        },
        {
            angle: "We're Almost There",
            keywords: [
                "almost there",
                "nearing",
                "goal",
                "final stretch",
                "almost"
            ]
        },
        {
            angle: "Limited Campaign Window",
            keywords: [
                "limited time",
                "campaign ends",
                "ending soon",
                "hurry"
            ]
        },
        {
            angle: "Single Person/Animal Story",
            keywords: [
                "meet",
                "their story",
                "rescued",
                "patient",
                "animal",
                "dog",
                "cat",
                "child",
                "family"
            ]
        },
        {
            angle: "The Moment Everything Changed",
            keywords: [
                "moment",
                "everything changed",
                "that day"
            ]
        },
        {
            angle: "Raw Vulnerability",
            keywords: [
                "vulnerable",
                "raw",
                "afraid",
                "scared",
                "pain",
                "wounded"
            ]
        },
        {
            angle: "X,000 People Already Gave",
            keywords: [
                "people already gave",
                "supporters",
                "donors",
                "thousand",
                "given"
            ]
        },
        {
            angle: "Transparency (Where Money Goes)",
            keywords: [
                "where money goes",
                "transparency",
                "breakdown",
                "funds",
                "allocation"
            ]
        },
        {
            angle: "Founder/Insider Story",
            keywords: [
                "founder",
                "behind the scenes",
                "our team",
                "insider"
            ]
        },
        {
            angle: "Endorsed by Trusted Name",
            keywords: [
                "endorsed",
                "partner",
                "trusted",
                "as seen",
                "recommended"
            ]
        },
        {
            angle: "Real Results Shown",
            keywords: [
                "results",
                "impact",
                "outcomes",
                "changed",
                "after"
            ]
        },
        {
            angle: "Proof It Works",
            keywords: [
                "proven",
                "works",
                "we've helped",
                "evidence"
            ]
        },
        {
            angle: "Just $1 a Day",
            keywords: [
                "$1 a day",
                "one dollar a day",
                "1 a day"
            ]
        },
        {
            angle: "Takes 60 Seconds",
            keywords: [
                "60 seconds",
                "one minute",
                "takes 1 minute"
            ]
        },
        {
            angle: "No Commitment / Cancel Anytime",
            keywords: [
                "cancel anytime",
                "no commitment",
                "cancel",
                "anytime"
            ]
        },
        {
            angle: "Small Gift Big Impact",
            keywords: [
                "small gift",
                "big impact",
                "little goes far"
            ]
        },
        {
            angle: "Named/Credited Donor",
            keywords: [
                "named",
                "credited",
                "recognition",
                "acknowledged"
            ]
        },
        {
            angle: "Leave a Legacy",
            keywords: [
                "legacy",
                "leave behind",
                "remember",
                "will"
            ]
        }
    ];
    const scored = [];
    for (const rule of rules){
        let score = 0;
        for (const kw of rule.keywords){
            if (!kw) continue;
            if (text.includes(kw.toLowerCase())) score += 1;
        }
        if (score > 0) scored.push({
            angle: rule.angle,
            score
        });
    }
    scored.sort((a, b)=>b.score - a.score);
    const out = scored.map((x)=>x.angle);
    // Keep it short so it fits into prompt input safely.
    return dedupePreserveOrder(out).slice(0, campaignType === "product" ? 10 : 10);
}
function buildMergedPrimaryAnglesForPrompt(args) {
    const scraped = dedupePreserveOrder(args.scrapedAngles);
    const selected = dedupePreserveOrder(args.selectedAngles);
    const mergedAngles = [];
    for (const a of scraped)mergedAngles.push(a);
    for (const a of selected){
        if (!mergedAngles.includes(a)) mergedAngles.push(a);
    }
    const notes = (args.textAngleNotes || "").trim();
    if (notes) mergedAngles.push(notes);
    return mergedAngles.filter(Boolean).join(", ");
}
function extractImageUrlsFromResult(result) {
    const urls = new Set();
    function walk(value) {
        if (!value) return;
        if (typeof value === "string") {
            const lower = value.toLowerCase();
            if ((value.startsWith("http://") || value.startsWith("https://")) && (lower.includes(".png") || lower.includes(".jpg") || lower.includes(".jpeg") || lower.includes(".webp") || lower.includes("image"))) {
                urls.add(value);
            }
            return;
        }
        if (Array.isArray(value)) {
            for (const item of value)walk(item);
            return;
        }
        if (typeof value === "object") {
            for (const nested of Object.values(value)){
                walk(nested);
            }
        }
    }
    walk(result);
    return Array.from(urls);
}
function extractLatestClaudeDiagnostics(claudeOutput) {
    const text = claudeOutput || "";
    const startMarker = "__CLAUDE_PARSE_DIAGNOSTICS__";
    const endMarker = "__END_CLAUDE_PARSE_DIAGNOSTICS__";
    const start = text.lastIndexOf(startMarker);
    if (start === -1) return null;
    const afterStart = start + startMarker.length;
    const end = text.indexOf(endMarker, afterStart);
    if (end === -1) return null;
    const jsonText = text.slice(afterStart, end).trim();
    const parsed = tryParseJson(jsonText);
    return parsed && typeof parsed === "object" ? parsed : null;
}
const // --- Core funnel stage: scrape -> Claude -> create ad tabs ---
$$RSC_SERVER_ACTION_0 = async function scrapeAndGenerateAds(formData) {
    const jobId = formData.get("jobId")?.toString();
    if (!jobId) throw new Error("Missing jobId");
    const job = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.findUnique({
        where: {
            id: jobId
        }
    });
    if (!job) throw new Error("Job not found");
    const requestedCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claudeAds$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeRequestedAdCount"])(job.numberOfAds);
    const noAnglesSelected = !(job.primaryAngles || "").trim();
    const hasUserUploadedDonationReferenceImages = job.campaignType === "donation" ? (await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.findMany({
        where: {
            jobId,
            adId: null
        },
        select: {
            originalName: true
        }
    })).some((ref)=>!String(ref.originalName || "").startsWith("scraped-image-")) : false;
    try {
        const scraped = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scrape$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["scrapeUrlToHtml"])(job.url);
        const rawText = stripHtml(scraped.html).slice(0, 15000);
        if (!rawText.trim()) throw new Error("Scrape produced empty text.");
        const intelligenceRaw = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$anthropic$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extractWebsiteIntelligence"])({
            rawText,
            imageUrls: scraped.imageUrls || [],
            campaignTypeHint: job.campaignType === "donation" ? "donation" : "product"
        });
        const intelligenceParsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claudeAds$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extractJsonObject"])(intelligenceRaw);
        if (!intelligenceParsed) {
            throw new Error("Claude returned invalid website intelligence JSON.");
        }
        const websiteIntelligence = intelligenceParsed;
        const effectiveCampaignType = job.campaignType === "donation" ? "donation" : "product";
        const strategyRaw = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$anthropic$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generateCreativeStrategy"])({
            websiteIntelligence,
            campaignType: effectiveCampaignType,
            platform: job.platform || "Meta",
            funnelStage: job.funnelStage || "Mix",
            primaryAngles: (()=>{
                const angleSources = extractSelectedAnglesFromJobPrimaryAngles(job.primaryAngles, effectiveCampaignType);
                return buildMergedPrimaryAnglesForPrompt({
                    scrapedAngles: extractAnglesFromScrapedContent(rawText, effectiveCampaignType),
                    selectedAngles: angleSources.selectedAngles,
                    textAngleNotes: angleSources.textAngleNotes
                });
            })(),
            testimonialUsage: job.testimonialUsage || "Mix",
            ctaStyle: job.ctaStyle || "Mix",
            visualStyle: job.visualStyle || "Mix",
            referenceImageTypes: job.referenceImageTypes || "Product only",
            creativeMode: job.creativeMode || "Mix",
            adMixStrategy: job.adMixStrategy || "Even Mix",
            strictlyFollowSelectedAngles: job.strictlyFollowSelectedAngles ?? false,
            includeExperimentalAds: job.includeExperimentalAds ?? false,
            rawTextForIntentTokens: rawText
        });
        const claudeOutput = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$anthropic$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generateAdTabs"])({
            creativeStrategyJson: strategyRaw,
            requestedAdCount: requestedCount,
            creativeMode: job.creativeMode || "Mix",
            adMixStrategy: job.adMixStrategy || "Even Mix",
            strictlyFollowSelectedAngles: job.strictlyFollowSelectedAngles ?? false,
            includeExperimentalAds: job.includeExperimentalAds ?? false,
            noAnglesSelected,
            donationOnly: job.campaignType === "donation",
            donationCampaignType: job.campaign_type || undefined,
            donationSubject: job.campaignType === "donation" ? {
                subjectName: job.subject_name || "",
                subjectType: job.subject_type || "",
                speciesBreedAge: job.species_breed_age || "",
                physicalDescription: job.physical_description || "",
                injuryOrMedicalDetails: job.injury_or_medical_details || "",
                backstorySummary: job.backstory_summary || "",
                urgencyLevel: job.urgency_level || "",
                fundraiserGoalAmount: job.fundraiser_goal_amount || "",
                emotionalHook: job.emotional_hook || "",
                companionOrFamilyDetail: job.companion_or_family_detail || "",
                beforeDetail: job.before_detail || "",
                selectedTemplates: (job.selected_templates || "").split(",").map((t)=>t.trim()).filter(Boolean),
                hasUserUploadedReferenceImages: hasUserUploadedDonationReferenceImages
            } : undefined
        });
        const parsedAdsResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claude$2f$parseClaudeJson$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseValidateAndNormalizeClaudeAds"])(claudeOutput, requestedCount);
        const diagnostics = parsedAdsResult.diagnostics;
        const diagJson = JSON.stringify(diagnostics, null, 2);
        if (!parsedAdsResult.ok) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.update({
                where: {
                    id: jobId
                },
                data: {
                    status: "error",
                    rawText,
                    claudeOutput: `${claudeOutput || ""}

__CLAUDE_PARSE_DIAGNOSTICS__
${diagJson}
__END_CLAUDE_PARSE_DIAGNOSTICS__`,
                    kieResult: null
                }
            });
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
        }
        // Reference images for Kie (scraped <img> and og:image URLs)
        const uniqueImageUrls = Array.from(new Set((scraped.imageUrls || []).filter(Boolean))).slice(0, 25);
        // For donation campaigns, preserve any user-uploaded subject reference images
        // created during the Create Campaign flow.
        if (job.campaignType !== "donation") {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.deleteMany({
                where: {
                    jobId,
                    adId: null
                }
            });
        }
        if (uniqueImageUrls.length > 0) {
            const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.findMany({
                where: {
                    jobId,
                    adId: null
                },
                select: {
                    filePath: true
                }
            });
            const existingFilePaths = new Set(existing.map((e)=>e.filePath));
            const toInsert = uniqueImageUrls.filter((url)=>!existingFilePaths.has(url));
            if (toInsert.length > 0) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.createMany({
                    data: toInsert.map((url, index)=>({
                            jobId,
                            adId: null,
                            filePath: url,
                            originalName: `scraped-image-${index + 1}`,
                            mimeType: null
                        }))
                });
            }
        }
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.deleteMany({
            where: {
                jobId
            }
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.createMany({
            data: parsedAdsResult.ads.map((ad, index)=>({
                    jobId,
                    adNumber: index + 1,
                    title: ad.angle || ad.headline || `Ad ${index + 1}`,
                    sourceBlock: JSON.stringify(ad, null, 2),
                    editedPrompt: String(ad.visualPrompt || "").trim(),
                    status: "ready"
                }))
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.update({
            where: {
                id: jobId
            },
            data: {
                status: "success",
                rawText,
                claudeOutput: `${claudeOutput || ""}

__CLAUDE_PARSE_DIAGNOSTICS__
${diagJson}
__END_CLAUDE_PARSE_DIAGNOSTICS__`,
                kieResult: null
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.update({
            where: {
                id: jobId
            },
            data: {
                status: "error",
                claudeOutput: JSON.stringify({
                    error: message,
                    stage: "scrape_and_generate_ads"
                }, null, 2)
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
    }
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_0, "40163adf6e526e8b5daf9df8dfd98135b45720999b", null);
var scrapeAndGenerateAds = $$RSC_SERVER_ACTION_0;
const // --- Ad editing stage ---
$$RSC_SERVER_ACTION_1 = async function saveAdPromptAndReferences(formData) {
    const jobId = formData.get("jobId")?.toString();
    const adId = formData.get("adId")?.toString();
    const editedPrompt = formData.get("editedPrompt")?.toString() || "";
    if (!jobId || !adId) throw new Error("Missing jobId or adId");
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.update({
        where: {
            id: adId
        },
        data: {
            editedPrompt
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_1, "40ae0eedb2783eb623d89ce87f72ca5fbf7344c59f", null);
var saveAdPromptAndReferences = $$RSC_SERVER_ACTION_1;
const // --- Ad variation stage (append sibling variation tabs) ---
$$RSC_SERVER_ACTION_2 = async function generateAdVariations(formData) {
    const jobId = formData.get("jobId")?.toString();
    const baseAdId = formData.get("adId")?.toString();
    const variationCountRaw = formData.get("variationCount")?.toString();
    const variationInstruction = String(formData.get("variationInstruction") || "").trim();
    if (!jobId || !baseAdId) throw new Error("Missing jobId or adId");
    const variationCount = Number(variationCountRaw);
    const safeCount = Number.isFinite(variationCount) && variationCount >= 3 ? Math.max(3, Math.min(5, Math.floor(variationCount))) : 4;
    const job = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.findUnique({
        where: {
            id: jobId
        }
    });
    if (!job) throw new Error("Job not found");
    const baseAd = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.findUnique({
        where: {
            id: baseAdId
        }
    });
    if (!baseAd?.sourceBlock) throw new Error("Base ad missing sourceBlock");
    const baseSource = tryParseJson(baseAd.sourceBlock);
    const basePayload = baseSource;
    if (!basePayload || typeof basePayload !== "object" || typeof basePayload.angle !== "string" || typeof basePayload.hook !== "string" || typeof basePayload.primaryText !== "string" || typeof basePayload.headline !== "string" || typeof basePayload.cta !== "string" || typeof basePayload.visualPrompt !== "string") {
        // If the base ad isn't in the expected format, fail gracefully by not generating variations.
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
    }
    const variationsRaw = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$anthropic$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generateAdVariationsFromBaseAd"])({
        baseAd: {
            angle: basePayload.angle,
            hook: basePayload.hook,
            primaryText: basePayload.primaryText,
            headline: basePayload.headline,
            cta: basePayload.cta,
            visualPrompt: basePayload.visualPrompt
        },
        campaignType: job.campaignType === "donation" ? "donation" : "product",
        requestedVariations: safeCount,
        creativeMode: job.creativeMode || "Mix",
        adMixStrategy: job.adMixStrategy || "Even Mix",
        strictlyFollowSelectedAngles: job.strictlyFollowSelectedAngles ?? false,
        includeExperimentalAds: job.includeExperimentalAds ?? false,
        variationInstruction
    });
    const parsedResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claude$2f$parseClaudeJson$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseValidateAndNormalizeClaudeAds"])(variationsRaw, safeCount);
    if (!parsedResult.ok) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
    }
    if (parsedResult.ads.length === 0) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
    }
    const maxAdNumber = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.findFirst({
        where: {
            jobId
        },
        orderBy: {
            adNumber: "desc"
        },
        select: {
            adNumber: true
        }
    });
    const startAdNumber = (maxAdNumber?.adNumber ?? 0) + 1;
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.createMany({
        data: parsedResult.ads.map((ad, i)=>({
                jobId,
                adNumber: startAdNumber + i,
                title: `Variation ${i + 1}`,
                sourceBlock: JSON.stringify(ad, null, 2),
                editedPrompt: String(ad.visualPrompt || "").trim(),
                status: "ready",
                parentAdId: baseAdId
            }))
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_2, "40e7df428217a28d413bdcaba894785ade6e877651", null);
var generateAdVariations = $$RSC_SERVER_ACTION_2;
const // --- Save a generated ad into the memory-bank tables ---
$$RSC_SERVER_ACTION_3 = async function saveAdToMemory(formData) {
    const jobId = formData.get("jobId")?.toString();
    const adId = formData.get("adId")?.toString();
    const memoryNotes = String(formData.get("memoryNotes") || "").trim();
    const markWinner = formData.get("markWinner") ? true : false;
    if (!jobId || !adId) throw new Error("Missing jobId or adId");
    const job = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.findUnique({
        where: {
            id: jobId
        }
    });
    if (!job) throw new Error("Job not found");
    const ad = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.findUnique({
        where: {
            id: adId
        }
    });
    if (!ad?.sourceBlock) throw new Error("Ad missing sourceBlock");
    const source = tryParseJson(ad.sourceBlock);
    if (!source || typeof source !== "object") {
        throw new Error("Bad ad.sourceBlock JSON");
    }
    const marketType = job.campaignType === "donation" ? "donation" : "product";
    const preferredCategoryName = marketType === "product" ? "Angles" : "Impact Angles";
    const preferredCategory = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].swipeCategory.findUnique({
        where: {
            name_marketType: {
                name: preferredCategoryName,
                marketType
            }
        }
    });
    const fallbackCategory = preferredCategory ? preferredCategory : await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].swipeCategory.findFirst({
        where: {
            marketType
        }
    });
    if (!fallbackCategory) throw new Error("No swipe categories found for this marketType");
    const swipeTitle = typeof source.headline === "string" && source.headline.trim() || typeof source.angle === "string" && source.angle.trim() || `Generated ad ${ad.adNumber}`;
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].swipeEntry.create({
        data: {
            title: swipeTitle,
            marketType,
            categoryId: fallbackCategory.id,
            hook: typeof source.hook === "string" ? source.hook : undefined,
            angle: typeof source.angle === "string" ? source.angle : undefined,
            concept: typeof source.headline === "string" && source.headline.trim() ? source.headline : typeof source.primaryText === "string" && source.primaryText.trim() ? source.primaryText : undefined,
            copy: typeof source.primaryText === "string" && source.primaryText.trim() ? source.primaryText : undefined,
            cta: typeof source.cta === "string" ? source.cta : undefined,
            visualDirection: typeof source.visualPrompt === "string" ? source.visualPrompt : undefined,
            platform: job.platform || undefined,
            funnelStage: job.funnelStage || undefined,
            tags: [
                "generated",
                job.creativeMode || undefined,
                job.adMixStrategy || undefined,
                markWinner ? "winner" : undefined
            ].filter(Boolean).join(","),
            notes: memoryNotes || `Saved from Ad ${ad.adNumber} (${job.id}).`
        }
    });
    if (markWinner) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.update({
            where: {
                id: adId
            },
            data: {
                isWinner: true
            }
        });
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_3, "4017e7700eafc8c40397f642ec8db7fbc5d8bf413b", null);
var saveAdToMemory = $$RSC_SERVER_ACTION_3;
const // --- Image generation stage (per ad) ---
$$RSC_SERVER_ACTION_4 = async function generateAdImages(formData) {
    const jobId = formData.get("jobId")?.toString();
    const adId = formData.get("adId")?.toString();
    const adAspectRatioRaw = formData.get("adAspectRatio")?.toString();
    const adAspectRatio = adAspectRatioRaw === "9:16" ? "9:16" : "1:1";
    if (!jobId || !adId) throw new Error("Missing jobId or adId");
    const ad = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.findUnique({
        where: {
            id: adId
        }
    });
    if (!ad) throw new Error("Ad not found");
    let prompt = (ad.editedPrompt || ad.sourceBlock || "").trim();
    if (!prompt) throw new Error("No prompt available");
    // Donation TEMPLATE 6 (KLING VIDEO READY) stores BOTH prompts in `visualPrompt`
    // in a single-line format. Kie image generation must use only the KIE portion.
    if (prompt.includes("KIE_IMAGE_PROMPT:") && prompt.includes("|| KLING_ANIMATION_PROMPT:")) {
        const afterKie = prompt.split("KIE_IMAGE_PROMPT:")[1] || "";
        const kiePart = afterKie.split("|| KLING_ANIMATION_PROMPT:")[0] || "";
        prompt = kiePart.trim();
    }
    // Prefer ad-specific references. If none exist, fall back to shared job references.
    const adReferenceAssets = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.findMany({
        where: {
            jobId,
            adId
        },
        orderBy: {
            createdAt: "asc"
        }
    });
    const referenceAssets = adReferenceAssets.length > 0 ? adReferenceAssets : await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.findMany({
        where: {
            jobId,
            adId: null
        },
        orderBy: {
            createdAt: "asc"
        }
    });
    const referenceImages = referenceAssets.map((asset)=>asset.filePath).filter(Boolean);
    console.log("[generateAdImages]", {
        jobId,
        adId,
        referenceCount: referenceImages.length,
        used: adReferenceAssets.length > 0 ? "ad" : "job_shared"
    });
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.update({
        where: {
            id: adId
        },
        data: {
            status: "generating_images"
        }
    });
    try {
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$kie$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generateImageWithKie"])(prompt, referenceImages, adAspectRatio);
        const urls = extractImageUrlsFromResult(result);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].image.deleteMany({
            where: {
                adId
            }
        });
        if (urls.length > 0) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].image.createMany({
                data: urls.map((url)=>({
                        adId,
                        url,
                        prompt
                    }))
            });
        }
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.update({
            where: {
                id: adId
            },
            data: {
                status: "images_generated",
                kieResult: JSON.stringify(result, null, 2)
            }
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.update({
            where: {
                id: adId
            },
            data: {
                status: "kie_error",
                kieResult: `Kie generation failed:\n\n${message}`
            }
        });
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_4, "4015356bb4c7e8e9605883f2f41f10786716822ed8", null);
var generateAdImages = $$RSC_SERVER_ACTION_4;
const // --- Product reference images (shared across all ads) ---
$$RSC_SERVER_ACTION_5 = async function uploadProductReferenceFilesForAllAds(formData) {
    const jobId = formData.get("jobId")?.toString();
    if (!jobId) throw new Error("Missing jobId");
    const rawFiles = formData.getAll("referenceFiles");
    const files = rawFiles.filter((item)=>!!item && typeof item.size === "number" && item.size > 0);
    if (files.length === 0) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
    const uploaded = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$kie$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["uploadReferenceFilesToKie"])(files);
    // Replace shared reference images so every ad uses the latest set.
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.deleteMany({
        where: {
            jobId,
            adId: null
        }
    });
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.createMany({
        data: uploaded.map((file)=>({
                jobId,
                adId: null,
                filePath: file.filePath,
                originalName: file.originalName,
                mimeType: file.mimeType
            }))
    });
    console.log("[uploadProductReferenceFilesForAllAds]", {
        jobId,
        savedReferences: uploaded.length
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_5, "4057a32e8da1e760f6aeaf883bb16e83c894436d98", null);
var uploadProductReferenceFilesForAllAds = $$RSC_SERVER_ACTION_5;
const // --- Ad-specific reference images (used by Generate Image for that tab) ---
$$RSC_SERVER_ACTION_6 = async function uploadReferenceFilesForAd(formData) {
    const jobId = formData.get("jobId")?.toString();
    const adId = formData.get("adId")?.toString();
    if (!jobId || !adId) throw new Error("Missing jobId or adId");
    const rawFiles = formData.getAll("referenceFiles");
    const files = rawFiles.filter((item)=>!!item && typeof item.size === "number" && item.size > 0);
    if (files.length === 0) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
    const uploaded = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$kie$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["uploadReferenceFilesToKie"])(files);
    // Replace references for this specific ad.
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.deleteMany({
        where: {
            jobId,
            adId
        }
    });
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.createMany({
        data: uploaded.map((file)=>({
                jobId,
                adId,
                filePath: file.filePath,
                originalName: file.originalName,
                mimeType: file.mimeType
            }))
    });
    console.log("[uploadReferenceFilesForAd]", {
        jobId,
        adId,
        savedReferences: uploaded.length
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_6, "4082dbf34e83d757ef3b4effcdddd122ce322f336f", null);
var uploadReferenceFilesForAd = $$RSC_SERVER_ACTION_6;
async function JobDetailPage({ params }) {
    const { id } = await params;
    const job = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.findUnique({
        where: {
            id
        },
        include: {
            ads: {
                include: {
                    images: {
                        orderBy: {
                            createdAt: "desc"
                        }
                    }
                },
                orderBy: {
                    adNumber: "asc"
                }
            },
            referenceAssets: {
                orderBy: {
                    createdAt: "asc"
                }
            }
        }
    });
    if (!job) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    const requestedCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claudeAds$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeRequestedAdCount"])(job.numberOfAds);
    const diagnostics = extractLatestClaudeDiagnostics(job.claudeOutput);
    const showScrapeButton = job.ads.length === 0;
    const showReturnedNote = job.ads.length > 0 && diagnostics && typeof diagnostics.returnedAdCount === "number" && diagnostics.returnedAdCount !== requestedCount;
    const showErrorPanel = job.status === "error" && job.ads.length === 0;
    const fallbackError = typeof diagnostics?.error === "string" && diagnostics.error.trim() ? diagnostics.error : typeof job.claudeOutput === "string" && job.claudeOutput.trim() ? job.claudeOutput.trim().slice(0, 500) : "Try again.";
    const fallbackPreview = typeof diagnostics?.preview === "string" && diagnostics.preview.trim() ? diagnostics.preview : typeof job.claudeOutput === "string" && job.claudeOutput.trim() ? job.claudeOutput.trim().slice(0, 500) : "";
    const hasUserUploadedDonationReferenceImages = job.campaignType === "donation" ? (job.referenceAssets || []).some((ref)=>!String(ref.originalName || "").startsWith("scraped-image-")) : false;
    const showDonationReferenceWarning = job.campaignType === "donation" && !hasUserUploadedDonationReferenceImages;
    const showDonationInjuryMinimalWarning = job.campaignType === "donation" && (job.injury_or_medical_details || "").trim().length < 30;
    const showDonationEmotionalHookInfo = job.campaignType === "donation" && !(job.emotional_hook || "").trim();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        style: {
            padding: 0,
            maxWidth: 1200,
            margin: "0 auto",
            color: "var(--foreground)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 16
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        style: {
                            margin: 0
                        },
                        children: "Campaign Workspace"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1192,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        href: "/",
                        style: {
                            fontSize: 13,
                            color: "var(--foreground)",
                            textDecoration: "none",
                            opacity: 0.85
                        },
                        children: "Back to Campaigns"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1193,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/page.tsx",
                lineNumber: 1191,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 20,
                    border: "1px solid var(--border)",
                    padding: 16,
                    borderRadius: 16,
                    background: "var(--surface)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "URL:"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1216,
                                columnNumber: 21
                            }, this),
                            " ",
                            job.url
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1215,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Campaign Type:"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1219,
                                columnNumber: 21
                            }, this),
                            " ",
                            job.campaignType
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1218,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Platform:"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1222,
                                columnNumber: 21
                            }, this),
                            " ",
                            job.platform || "Meta"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1221,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Funnel Stage:"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1225,
                                columnNumber: 21
                            }, this),
                            " ",
                            job.funnelStage || "Mix"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1224,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Requested Ads:"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1228,
                                columnNumber: 21
                            }, this),
                            " ",
                            job.numberOfAds || ""
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1227,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Status:"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1231,
                                columnNumber: 21
                            }, this),
                            " ",
                            job.status
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1230,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Total Ads:"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1234,
                                columnNumber: 21
                            }, this),
                            " ",
                            job.ads.length
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1233,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/page.tsx",
                lineNumber: 1206,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 24,
                    border: "1px solid var(--border)",
                    padding: 16,
                    borderRadius: 16,
                    background: "var(--surface)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        style: {
                            margin: 0,
                            fontSize: 16
                        },
                        children: "Scraped Source"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1247,
                        columnNumber: 17
                    }, this),
                    showErrorPanel ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 12,
                            padding: 12,
                            border: "1px solid #7a1d1d",
                            background: "#1a0b0b",
                            color: "#ffb4b4",
                            whiteSpace: "pre-wrap"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontWeight: 700,
                                    marginBottom: 6
                                },
                                children: "Could not generate ad tabs."
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1260,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    opacity: 0.95
                                },
                                children: fallbackError
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1263,
                                columnNumber: 25
                            }, this),
                            fallbackPreview ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 8,
                                    fontSize: 13
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontWeight: 700,
                                            marginBottom: 4
                                        },
                                        children: "Preview:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 1268,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: 8,
                                            border: "1px solid #7a1d1d"
                                        },
                                        children: fallbackPreview
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 1271,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1267,
                                columnNumber: 29
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1250,
                        columnNumber: 21
                    }, this) : null,
                    showReturnedNote ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 12,
                            padding: 12,
                            border: "1px solid #6a4b00",
                            background: "#1a1406",
                            color: "#ffe2a8",
                            whiteSpace: "pre-wrap"
                        },
                        children: [
                            "Model returned ",
                            diagnostics?.returnedAdCount,
                            " of",
                            " ",
                            requestedCount,
                            " ads."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1285,
                        columnNumber: 21
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 14
                        },
                        children: [
                            job.rawText ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                        style: {
                                            cursor: "pointer",
                                            fontWeight: 800,
                                            opacity: 0.9
                                        },
                                        children: "View extracted text"
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 1303,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            whiteSpace: "pre-wrap",
                                            lineHeight: 1.5,
                                            marginTop: 12,
                                            maxHeight: 320,
                                            overflow: "auto",
                                            border: "1px solid rgba(15,23,42,0.10)",
                                            padding: 12,
                                            borderRadius: 12
                                        },
                                        children: job.rawText
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 1312,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1302,
                                columnNumber: 25
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    opacity: 0.85
                                },
                                children: "No scraped content yet."
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1328,
                                columnNumber: 25
                            }, this),
                            showScrapeButton ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                action: scrapeAndGenerateAds,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "hidden",
                                        name: "jobId",
                                        value: job.id
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 1333,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "submit",
                                        style: {
                                            marginTop: 12,
                                            padding: "10px 14px",
                                            borderRadius: 12,
                                            border: "1px solid rgba(124, 58, 237, 0.35)",
                                            background: "var(--accent)",
                                            color: "#fff",
                                            cursor: "pointer"
                                        },
                                        children: "Scrape + Generate Ad Tabs"
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 1334,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1332,
                                columnNumber: 25
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1300,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/page.tsx",
                lineNumber: 1238,
                columnNumber: 13
            }, this),
            job.ads.length > 0 && (job.campaignType === "product" || job.campaignType === "donation") ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 24,
                    border: "1px solid var(--border)",
                    padding: 16,
                    borderRadius: 16,
                    background: "var(--surface)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: job.campaignType === "product" ? "Product Reference Images (All Ads)" : "Donation Reference Images (All Ads)"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1365,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        action: uploadProductReferenceFilesForAllAds,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "hidden",
                                name: "jobId",
                                value: job.id
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1372,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 14
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            opacity: 0.85,
                                            marginBottom: 8
                                        },
                                        children: "Drop reference images here (or choose files). These will be used for every ad when generating with Kie."
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 1375,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "file",
                                        name: "referenceFiles",
                                        multiple: true,
                                        accept: "image/*",
                                        style: {
                                            width: "100%",
                                            padding: 20,
                                            border: "2px dashed #555",
                                            background: "#111",
                                            color: "var(--foreground)"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 1378,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1374,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 14
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    style: {
                                        padding: "10px 14px",
                                        borderRadius: 10,
                                        border: "1px solid var(--borderStrong)",
                                        background: "var(--surfaceElevated)",
                                        color: "var(--foreground)",
                                        cursor: "pointer"
                                    },
                                    children: "Upload Reference Files"
                                }, void 0, false, {
                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                    lineNumber: 1394,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1393,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1371,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/page.tsx",
                lineNumber: 1356,
                columnNumber: 17
            }, this) : null,
            job.ads.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 24
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Ad Tabs"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1414,
                        columnNumber: 21
                    }, this),
                    job.campaignType === "donation" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginBottom: 16,
                            border: "1px solid var(--border)",
                            borderRadius: 16,
                            padding: 14,
                            background: "var(--surfaceElevated)"
                        },
                        children: [
                            showDonationReferenceWarning ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginBottom: 10,
                                    color: "var(--warning)",
                                    fontSize: 13,
                                    fontWeight: 700
                                },
                                children: "⚠️ These prompts will generate a generic subject. Upload reference photos and regenerate for best results."
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1426,
                                columnNumber: 33
                            }, this) : null,
                            showDonationInjuryMinimalWarning ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginBottom: 10,
                                    color: "var(--warning)",
                                    fontSize: 13,
                                    fontWeight: 700
                                },
                                children: "⚠️ Injury details were minimal. Add more specific injury information and regenerate for stronger emotional impact."
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1440,
                                columnNumber: 33
                            }, this) : null,
                            showDonationEmotionalHookInfo ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    color: "var(--accent)",
                                    fontSize: 13,
                                    fontWeight: 700
                                },
                                children: "💡 Add an emotional hook detail and regenerate to unlock stronger text overlay copy."
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1454,
                                columnNumber: 33
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1416,
                        columnNumber: 25
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 12,
                            display: "grid",
                            gap: 16
                        },
                        children: job.ads.map((ad)=>{
                            const source = tryParseJson(ad.sourceBlock);
                            const headline = source?.headline;
                            const primaryText = source?.primaryText;
                            const cta = source?.cta;
                            const angle = source?.angle;
                            const hook = source?.hook;
                            const sourceVisualPrompt = typeof source?.visualPrompt === "string" ? source.visualPrompt : "";
                            const editedPromptRaw = typeof ad.editedPrompt === "string" ? ad.editedPrompt : sourceVisualPrompt;
                            const extractKieImagePrompt = (visualPrompt)=>{
                                if (visualPrompt.includes("KIE_IMAGE_PROMPT:") && visualPrompt.includes("|| KLING_ANIMATION_PROMPT:")) {
                                    const afterKie = visualPrompt.split("KIE_IMAGE_PROMPT:")[1] || "";
                                    const kiePart = afterKie.split("|| KLING_ANIMATION_PROMPT:")[0];
                                    return kiePart.trim();
                                }
                                return (visualPrompt || "").trim();
                            };
                            const extractKlingAnimationPrompt = (visualPrompt)=>{
                                if (visualPrompt.includes("KIE_IMAGE_PROMPT:") && visualPrompt.includes("|| KLING_ANIMATION_PROMPT:")) {
                                    const afterMarker = visualPrompt.split("|| KLING_ANIMATION_PROMPT:")[1] || "";
                                    return afterMarker.trim();
                                }
                                return "";
                            };
                            const isKlingVideoReady = sourceVisualPrompt.includes("KIE_IMAGE_PROMPT:") && sourceVisualPrompt.includes("|| KLING_ANIMATION_PROMPT:");
                            const developedPrompt = extractKieImagePrompt(editedPromptRaw || "");
                            const klingAnimationPrompt = isKlingVideoReady ? extractKlingAnimationPrompt(sourceVisualPrompt) : "";
                            const angleParts = (angle || "").split(" — ");
                            const donationStyleLabel = angleParts[0] || angle || "";
                            const donationConceptName = angleParts.slice(1).join(" — ");
                            const adSpecificReferenceAssets = job.referenceAssets.filter((r)=>r.adId === ad.id);
                            const sharedReferenceAssets = job.referenceAssets.filter((r)=>r.adId === null);
                            const effectiveReferenceAssets = adSpecificReferenceAssets.length > 0 ? adSpecificReferenceAssets : sharedReferenceAssets;
                            const usingAdSpecificRefs = adSpecificReferenceAssets.length > 0;
                            const statusColor = ad.status === "images_generated" ? "#0f766e" : ad.status === "generating_images" ? "#1d4ed8" : ad.status === "kie_error" ? "#b91c1c" : "#475569";
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                open: ad.adNumber === 1,
                                style: {
                                    border: "1px solid var(--border)",
                                    borderRadius: 14,
                                    padding: 16,
                                    background: "var(--surface)",
                                    boxShadow: "0 1px 10px rgba(0, 0, 0, 0.25)"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                        style: {
                                            cursor: "pointer",
                                            fontWeight: 800,
                                            color: "var(--foreground)",
                                            marginBottom: 12
                                        },
                                        children: [
                                            "Ad ",
                                            ad.adNumber,
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontWeight: 700,
                                                    color: statusColor
                                                },
                                                children: [
                                                    "• ",
                                                    ad.status
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 1610,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 1601,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: 13,
                                            opacity: 0.95
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Angle:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 1617,
                                                        columnNumber: 45
                                                    }, this),
                                                    " ",
                                                    angle || "—"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 1616,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Hook:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 1621,
                                                        columnNumber: 45
                                                    }, this),
                                                    " ",
                                                    hook || "—"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 1620,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Headline:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 1625,
                                                        columnNumber: 45
                                                    }, this),
                                                    " ",
                                                    headline || "—"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 1624,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Primary:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 1629,
                                                        columnNumber: 45
                                                    }, this),
                                                    " ",
                                                    primaryText || "—"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 1628,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "CTA:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 1633,
                                                        columnNumber: 45
                                                    }, this),
                                                    " ",
                                                    cta || "—"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 1632,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 1615,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 16
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                style: {
                                                    margin: "0 0 8px 0"
                                                },
                                                children: "Developed Prompt (editable)"
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 1639,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                                action: saveAdPromptAndReferences,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "hidden",
                                                        name: "jobId",
                                                        value: job.id
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 1643,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "hidden",
                                                        name: "adId",
                                                        value: ad.id
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 1648,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                        name: "editedPrompt",
                                                        defaultValue: developedPrompt,
                                                        style: {
                                                            width: "100%",
                                                            minHeight: 180,
                                                            padding: 12,
                                                            background: "black",
                                                            color: "white",
                                                            border: "1px solid #444"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 1653,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            marginTop: 10
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "submit",
                                                            style: {
                                                                padding: "8px 12px",
                                                                borderRadius: 10,
                                                                border: "1px solid var(--borderStrong)",
                                                                background: "var(--surfaceElevated)",
                                                                color: "var(--foreground)",
                                                                cursor: "pointer"
                                                            },
                                                            children: "Save Prompt"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                                            lineNumber: 1666,
                                                            columnNumber: 49
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 1665,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 1642,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 1638,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 16
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                style: {
                                                    margin: "0 0 8px 0"
                                                },
                                                children: "Tab Controls"
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 1687,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginBottom: 12
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                                            style: {
                                                                cursor: "pointer",
                                                                fontWeight: 800,
                                                                marginBottom: 10
                                                            },
                                                            children: "Generate Variations"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                                            lineNumber: 1693,
                                                            columnNumber: 49
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                                            action: generateAdVariations,
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "hidden",
                                                                    name: "jobId",
                                                                    value: job.id
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                    lineNumber: 1703,
                                                                    columnNumber: 53
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "hidden",
                                                                    name: "adId",
                                                                    value: ad.id
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                    lineNumber: 1708,
                                                                    columnNumber: 53
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "hidden",
                                                                    name: "variationCount",
                                                                    value: "4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                    lineNumber: 1713,
                                                                    columnNumber: 53
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        marginBottom: 10
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            style: {
                                                                                fontSize: 13,
                                                                                fontWeight: 700,
                                                                                opacity: 0.9
                                                                            },
                                                                            children: "Optional: What do you want to change?"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                            lineNumber: 1723,
                                                                            columnNumber: 57
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                            lineNumber: 1732,
                                                                            columnNumber: 57
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "text",
                                                                            name: "variationInstruction",
                                                                            placeholder: 'e.g. "make it more aggressive", "target dads", "remove text", "add urgency"',
                                                                            style: {
                                                                                width: "100%",
                                                                                padding: 8,
                                                                                marginTop: 6,
                                                                                borderRadius: 10,
                                                                                border: "1px solid var(--border)"
                                                                            }
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                            lineNumber: 1733,
                                                                            columnNumber: 57
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                    lineNumber: 1718,
                                                                    columnNumber: 53
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "submit",
                                                                    style: {
                                                                        padding: "10px 14px",
                                                                        borderRadius: 10,
                                                                        border: "1px solid var(--borderStrong)",
                                                                        background: "var(--surfaceElevated)",
                                                                        color: "var(--foreground)",
                                                                        cursor: "pointer",
                                                                        width: "100%"
                                                                    },
                                                                    children: "Generate Variations"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                    lineNumber: 1747,
                                                                    columnNumber: 53
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                                            lineNumber: 1702,
                                                            columnNumber: 49
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 1692,
                                                    columnNumber: 45
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 1691,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginBottom: 12
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                                    action: saveAdToMemory,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "hidden",
                                                            name: "jobId",
                                                            value: job.id
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                                            lineNumber: 1771,
                                                            columnNumber: 49
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "hidden",
                                                            name: "adId",
                                                            value: ad.id
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                                            lineNumber: 1776,
                                                            columnNumber: 49
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                marginBottom: 8
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    style: {
                                                                        fontSize: 13,
                                                                        fontWeight: 700,
                                                                        opacity: 0.9
                                                                    },
                                                                    children: "Memory Notes (optional)"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                    lineNumber: 1782,
                                                                    columnNumber: 53
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                    lineNumber: 1791,
                                                                    columnNumber: 53
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "text",
                                                                    name: "memoryNotes",
                                                                    placeholder: "e.g. felt believable, strong CTA, best-performing...",
                                                                    style: {
                                                                        width: "100%",
                                                                        padding: 8,
                                                                        marginTop: 6,
                                                                        borderRadius: 10,
                                                                        border: "1px solid var(--border)",
                                                                        background: "var(--surfaceElevated)",
                                                                        color: "var(--foreground)"
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                    lineNumber: 1792,
                                                                    columnNumber: 53
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                                            lineNumber: 1781,
                                                            columnNumber: 49
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                marginBottom: 10
                                                            },
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                style: {
                                                                    display: "flex",
                                                                    gap: 8,
                                                                    alignItems: "center",
                                                                    fontSize: 13,
                                                                    opacity: 0.95
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "checkbox",
                                                                        name: "markWinner",
                                                                        value: "1"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                        lineNumber: 1820,
                                                                        columnNumber: 57
                                                                    }, this),
                                                                    "Mark as Winner"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                lineNumber: 1810,
                                                                columnNumber: 53
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                                            lineNumber: 1809,
                                                            columnNumber: 49
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "submit",
                                                            style: {
                                                                padding: "10px 14px",
                                                                borderRadius: 10,
                                                                border: "1px solid var(--borderStrong)",
                                                                background: "var(--surfaceElevated)",
                                                                color: "var(--foreground)",
                                                                cursor: "pointer",
                                                                width: "100%"
                                                            },
                                                            children: "Save to Memory"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                                            lineNumber: 1828,
                                                            columnNumber: 49
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 1770,
                                                    columnNumber: 45
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 1769,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 1686,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 16
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: 13,
                                                    opacity: 0.9,
                                                    marginBottom: 8
                                                },
                                                children: effectiveReferenceAssets.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        "Using",
                                                        " ",
                                                        effectiveReferenceAssets.length,
                                                        " ",
                                                        "reference image",
                                                        effectiveReferenceAssets.length === 1 ? "" : "s",
                                                        " ",
                                                        usingAdSpecificRefs ? "for this ad" : "(shared)",
                                                        " "
                                                    ]
                                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: "No reference images attached"
                                                }, void 0, false)
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 1850,
                                                columnNumber: 41
                                            }, this),
                                            effectiveReferenceAssets.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: "flex",
                                                    gap: 10,
                                                    flexWrap: "wrap",
                                                    marginBottom: 12
                                                },
                                                children: effectiveReferenceAssets.slice(0, 4).map((ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            width: 64,
                                                            height: 64,
                                                            border: "1px solid var(--border)",
                                                            borderRadius: 12,
                                                            overflow: "hidden",
                                                            background: "var(--surfaceElevated)",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center"
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                            src: ref.filePath,
                                                            alt: "Reference",
                                                            style: {
                                                                width: "100%",
                                                                height: "100%",
                                                                objectFit: "cover"
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                                            lineNumber: 1910,
                                                            columnNumber: 61
                                                        }, this)
                                                    }, ref.id, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 1891,
                                                        columnNumber: 57
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 1880,
                                                columnNumber: 45
                                            }, this) : null,
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                                action: uploadReferenceFilesForAd,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "hidden",
                                                        name: "jobId",
                                                        value: job.id
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 1930,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "hidden",
                                                        name: "adId",
                                                        value: ad.id
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 1935,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            marginBottom: 10
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "file",
                                                            name: "referenceFiles",
                                                            multiple: true,
                                                            accept: "image/*",
                                                            style: {
                                                                width: "100%",
                                                                padding: 10,
                                                                borderRadius: 12,
                                                                border: "1px dashed var(--borderStrong)",
                                                                background: "var(--surfaceElevated)",
                                                                color: "var(--foreground)"
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                                            lineNumber: 1941,
                                                            columnNumber: 49
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 1940,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "submit",
                                                        style: {
                                                            padding: "8px 12px",
                                                            borderRadius: 10,
                                                            border: "1px solid var(--border)",
                                                            background: "transparent",
                                                            color: "var(--foreground)",
                                                            cursor: "pointer",
                                                            width: "100%"
                                                        },
                                                        children: "Upload Reference Images"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 1958,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 1927,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                                action: generateAdImages,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "hidden",
                                                        name: "jobId",
                                                        value: job.id
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 1977,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "hidden",
                                                        name: "adId",
                                                        value: ad.id
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 1982,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            marginBottom: 10
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                htmlFor: `aspectRatio-${ad.id}`,
                                                                style: {
                                                                    fontSize: 13,
                                                                    fontWeight: 700,
                                                                    opacity: 0.9
                                                                },
                                                                children: "Aspect Ratio"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                lineNumber: 1988,
                                                                columnNumber: 49
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                lineNumber: 1998,
                                                                columnNumber: 49
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                id: `aspectRatio-${ad.id}`,
                                                                name: "adAspectRatio",
                                                                defaultValue: "1:1",
                                                                style: {
                                                                    width: 220,
                                                                    padding: 8,
                                                                    marginTop: 8,
                                                                    background: "var(--surfaceElevated)",
                                                                    color: "var(--foreground)",
                                                                    border: "1px solid var(--border)"
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "1:1",
                                                                        children: "1080x1080 (1:1)"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                        lineNumber: 2013,
                                                                        columnNumber: 53
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "9:16",
                                                                        children: "9:16 (TT/Reels)"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                        lineNumber: 2016,
                                                                        columnNumber: 53
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                lineNumber: 1999,
                                                                columnNumber: 49
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 1987,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "submit",
                                                        style: {
                                                            padding: "10px 14px",
                                                            borderRadius: 10,
                                                            border: "1px solid rgba(124, 58, 237, 0.35)",
                                                            background: "var(--accent)",
                                                            color: "#fff",
                                                            cursor: "pointer",
                                                            width: "100%"
                                                        },
                                                        children: "Generate This Ad with Kie"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2021,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 1976,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 1849,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 16
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                style: {
                                                    margin: "0 0 8px 0"
                                                },
                                                children: "Image Gallery"
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 2040,
                                                columnNumber: 41
                                            }, this),
                                            ad.images.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    opacity: 0.85
                                                },
                                                children: "No generated images yet."
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 2044,
                                                columnNumber: 45
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: "grid",
                                                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                                                    gap: 16
                                                },
                                                children: ad.images.map((image)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            border: "1px solid var(--border)",
                                                            padding: 12
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                src: image.url,
                                                                alt: `Ad ${ad.adNumber}`,
                                                                style: {
                                                                    width: "100%",
                                                                    height: "auto",
                                                                    display: "block"
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                lineNumber: 2065,
                                                                columnNumber: 57
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    marginTop: 8,
                                                                    fontSize: 12,
                                                                    wordBreak: "break-all",
                                                                    opacity: 0.9
                                                                },
                                                                children: image.url
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                lineNumber: 2074,
                                                                columnNumber: 57
                                                            }, this)
                                                        ]
                                                    }, image.id, true, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2057,
                                                        columnNumber: 53
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 2048,
                                                columnNumber: 45
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 2039,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, ad.id, true, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1589,
                                columnNumber: 33
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1467,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/page.tsx",
                lineNumber: 1413,
                columnNumber: 17
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/app/jobs/[id]/page.tsx",
        lineNumber: 1183,
        columnNumber: 9
    }, this);
}
}),
"[project]/.next-internal/server/app/jobs/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/jobs/[id]/page.tsx [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/jobs/[id]/page.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
}),
"[project]/.next-internal/server/app/jobs/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/jobs/[id]/page.tsx [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "4015356bb4c7e8e9605883f2f41f10786716822ed8",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_4"],
    "40163adf6e526e8b5daf9df8dfd98135b45720999b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_0"],
    "4017e7700eafc8c40397f642ec8db7fbc5d8bf413b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_3"],
    "4057a32e8da1e760f6aeaf883bb16e83c894436d98",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_5"],
    "4082dbf34e83d757ef3b4effcdddd122ce322f336f",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_6"],
    "40ae0eedb2783eb623d89ce87f72ca5fbf7344c59f",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_1"],
    "40e7df428217a28d413bdcaba894785ade6e877651",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_2"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$jobs$2f5b$id$5d2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/jobs/[id]/page/actions.js { ACTIONS_MODULE0 => "[project]/app/jobs/[id]/page.tsx [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/jobs/[id]/page.tsx [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_bcf144ea._.js.map