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
    "evaluateDonationBackstory",
    ()=>evaluateDonationBackstory,
    "evaluateDonationPageFromScrape",
    ()=>evaluateDonationPageFromScrape,
    "evaluateDonationReferences",
    ()=>evaluateDonationReferences,
    "extractWebsiteIntelligence",
    ()=>extractWebsiteIntelligence,
    "generateAdTabs",
    ()=>generateAdTabs,
    "generateAdVariationsFromBaseAd",
    ()=>generateAdVariationsFromBaseAd,
    "generateCreativeStrategy",
    ()=>generateCreativeStrategy,
    "generateDonationFundraiserBatchFive",
    ()=>generateDonationFundraiserBatchFive,
    "generateDonationSingleAdPrompt",
    ()=>generateDonationSingleAdPrompt,
    "rewriteDonationVisualToKlingReady",
    ()=>rewriteDonationVisualToKlingReady
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
/** Above ~21.3k the TS SDK refuses non-streaming requests (estimated wall time > 10 min). */ const ANTHROPIC_NONSTREAMING_MAX_TOKENS_CAP = 21_000;
function streamMessagesBody(body) {
    return anthropic.messages.stream({
        ...body,
        stream: true
    });
}
/**
 * Non-streaming create, or streaming + finalMessage when the SDK requires it
 * (large max_tokens / long requests). See anthropic-sdk-typescript long-requests.
 */ async function messagesCreateLongRequestSafe(body) {
    const maxTok = body && typeof body === "object" && "max_tokens" in body && typeof body.max_tokens === "number" ? body.max_tokens : 0;
    if (maxTok > ANTHROPIC_NONSTREAMING_MAX_TOKENS_CAP) {
        return streamMessagesBody(body).finalMessage();
    }
    try {
        const res = await anthropic.messages.create(body);
        return res;
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (!msg.includes("Streaming is required") && !msg.includes("longer than 10 minutes")) {
            throw err;
        }
        return streamMessagesBody(body).finalMessage();
    }
}
function getTextBlock(value) {
    if (!value || typeof value !== "object") return null;
    const content = value.content;
    const first = Array.isArray(content) ? content[0] : null;
    return first && first.type === "text" ? first.text : null;
}
/** Concatenate all `text` blocks (extended-thinking responses may include `thinking` blocks first). */ function collectAssistantTextBlocks(content) {
    if (!Array.isArray(content)) return "";
    const parts = [];
    for (const block of content){
        if (block && typeof block === "object" && block.type === "text" && typeof block.text === "string") {
            parts.push(block.text);
        }
    }
    return parts.join("");
}
/**
 * "Generate 5 ads" batch: extended thinking by default (Claude 4.x).
 * Disable: ANTHROPIC_FUNDRAISER_BATCH_THINKING=false
 * Override model: ANTHROPIC_FUNDRAISER_BATCH_MODEL=claude-sonnet-4-5-20250929
 * Override budget (min 1024): ANTHROPIC_FUNDRAISER_BATCH_THINKING_BUDGET=12000
 * Override max output: ANTHROPIC_FUNDRAISER_BATCH_MAX_TOKENS=24000
 */ function getFundraiserBatchMessageParams() {
    const thinkingFlag = String(process.env.ANTHROPIC_FUNDRAISER_BATCH_THINKING ?? "true").trim().toLowerCase();
    const thinkingDisabled = thinkingFlag === "0" || thinkingFlag === "false" || thinkingFlag === "off" || thinkingFlag === "no";
    const model = process.env.ANTHROPIC_FUNDRAISER_BATCH_MODEL?.trim() || "claude-haiku-4-5";
    if (thinkingDisabled) {
        return {
            model,
            max_tokens: 9000
        };
    }
    let budget = 10_000;
    const budgetRaw = Number(process.env.ANTHROPIC_FUNDRAISER_BATCH_THINKING_BUDGET);
    if (Number.isFinite(budgetRaw) && budgetRaw >= 1024) {
        budget = Math.floor(budgetRaw);
    }
    const minMax = budget + 12_000;
    const maxRaw = Number(process.env.ANTHROPIC_FUNDRAISER_BATCH_MAX_TOKENS);
    const max_tokens = Number.isFinite(maxRaw) && maxRaw > minMax ? Math.floor(maxRaw) : Math.max(minMax, 20_000);
    return {
        model,
        max_tokens,
        thinking: {
            type: "enabled",
            budget_tokens: budget
        }
    };
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
    const combined = collectAssistantTextBlocks(response && typeof response === "object" ? response.content : undefined);
    if (combined.trim()) return combined;
    const initialText = getTextBlock(response);
    if (!initialText) throw new Error("Claude returned no text block.");
    return initialText;
}
async function extractWebsiteIntelligence(input) {
    const rawText = (input.rawText || "").slice(0, 12000);
    const imageUrls = (input.imageUrls || []).slice(0, 20);
    const campaignTypeHint = input.campaignTypeHint || "product";
    const schemaObj = {
        campaignType: "product",
        brandName: "",
        productName: "",
        offer: "",
        price: "",
        audience: [],
        keyBenefits: [],
        objections: [],
        emotionalDrivers: [],
        proofPoints: [],
        visualAssets: {
            imageUrls: [],
            hasHumanLifestyleImages: false,
            hasProductOnlyImages: false
        },
        sourceSummary: ""
    };
    const schema = JSON.stringify(schemaObj, null, 2);
    /*
// --- Donation sequential generation blocks (donation-only, lightweight) ---

export async function evaluateDonationBackstory(input: {
    campaignType: string;
    backstorySummary: string;
    urgencyLevel: string;
    emotionalHook?: string;
    subjectName: string;
}) {
    const emotionalDirection =
        input.campaignType === "SICK OR INJURED ANIMAL"
            ? "devastation + tenderness"
            : input.campaignType ===
                "ANIMAL SURGERY OR MEDICAL PROCEDURE"
              ? "urgency + tenderness"
              : input.campaignType === "ANIMAL END OF LIFE OR AMPUTATION"
                ? "fight + tenderness"
                : input.campaignType === "HUMAN MEDICAL — CANCER"
                  ? "devastation + fight"
                  : input.campaignType ===
                      "HUMAN MEDICAL — ACCIDENT OR TRAUMA"
                    ? "urgency + devastation"
                    : input.campaignType ===
                        "HUMAN MEDICAL — CHRONIC ILLNESS"
                      ? "fight + tenderness"
                      : input.campaignType === "HUMAN FINANCIAL CRISIS"
                        ? "tenderness + urgency"
                        : input.campaignType === "CHILD MEDICAL"
                          ? "devastation + urgency"
                          : input.campaignType === "FAMILY CRISIS"
                            ? "tenderness + devastation"
                            : input.campaignType === "MEMORIAL OR LOSS"
                              ? "tenderness only"
                              : "devastation + tenderness";

    const schemaObj = {
        emotionalStrength: 0,
        urgency: "",
        strongestHooks: ["", "", ""],
        themes: ["", "", ""],
        emotionalAnglesToUse: ["", "", ""],
        emotionalDirection,
    };
    const schema = JSON.stringify(schemaObj, null, 2);

    const prompt = [
        "Return VALID JSON ONLY. No markdown.",
        "",
        "TASK: Donation backstory evaluation (Block A).",
        "",
        "INPUTS:",
        "- campaignType: " + input.campaignType,
        "- subjectName: " + input.subjectName,
        "- urgencyLevel: " + input.urgencyLevel,
        "- emotionalHook: " + (input.emotionalHook || "(none)"),
        "- backstorySummary: " + input.backstorySummary,
        "",
        schema,
        "",
        "Rules:",
        "- strongestHooks must be short, hook-like, usable as ad text.",
        "- themes are narrative pillars to reuse consistently.",
        "- emotionalAnglesToUse are 3 distinct angle phrases for generating ad hooks.",
    ].join("\n");

    const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 900,
        messages: [{ role: "user", content: prompt }],
    });

    const text = response.content?.[0] && "text" in response.content[0]
        ? (response.content[0] as any).text
        : "";
    const parsed = extractJsonObject(text || "") || extractJsonObject(JSON.stringify(text)) ;
    return parsed ?? {};
}

export async function evaluateDonationPageFromScrape(input: {
    fundraiserUrl: string;
    scrapedText: string;
}) {
    const schemaObj = {
        subjectName: "",
        whatHappened: "",
        whyFundingIsNeeded: "",
        urgencyLevel: "general",
        keyEmotionalHooks: ["", "", ""],
        usefulPhrases: ["", "", ""],
        draftBackstory: "",
    };

    const prompt = [
        "Return VALID JSON ONLY. No markdown.",
        "",
        "You are preparing to create high-converting fundraiser ads.",
        "Extract:",
        "- character/subject name",
        "- what happened (core problem)",
        "- why funding is needed",
        "- urgency level",
        "- key emotional hooks",
        "- any useful phrases or details",
        "",
        "INPUT URL:",
        input.fundraiserUrl,
        "",
        "SCRAPED PAGE TEXT:",
        input.scrapedText.slice(0, 14000),
        "",
        JSON.stringify(schemaObj, null, 2),
    ].join("\n");

    const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
    });

    const text =
        response.content?.[0] && "text" in response.content[0]
            ? (response.content[0] as any).text
            : "";

    return extractJsonObject(text || "") ?? {};
}

export async function evaluateDonationReferences(input: {
    campaignType: string;
    referenceDescriptions: Array<{ index: number; description?: string }>;
    referenceImageUrls?: string[];
    physicalDescription: string;
    injuryOrMedicalDetails: string;
}) {
    const schemaObj = {
        imagesSummary: "",
        bestEmotionalVisualDetails: ["", "", ""],
        likenessPreservationNotes: ["", "", ""],
        selectedReferenceImages: [0],
        visualElementsToPreserve: ["", "", ""],
        textOverlayNotes: "",
    };
    const schema = JSON.stringify(schemaObj, null, 2);

    const referenceLines = input.referenceDescriptions
        .map(
            (r) =>
                "  - [" +
                r.index +
                "] " +
                (r.description ? r.description : "(empty)")
        )
        .join("\n");

    const prompt = [
        "Return VALID JSON ONLY. No markdown.",
        "",
        "TASK: Donation reference-image evaluation (Block B).",
        "",
        "IMPORTANT: You are evaluating the uploaded reference images based on the user-provided descriptions.",
        "",
        "INPUTS:",
        "- campaignType: " + input.campaignType,
        "- physicalDescription: " + input.physicalDescription,
        "- injuryOrMedicalDetails: " + input.injuryOrMedicalDetails,
        "- referenceDescriptions (index-based):",
        referenceLines,
        "",
        schema,
        "",
        "Rules:",
        "- selectedReferenceImages must list 1–" +
            Math.min(4, input.referenceDescriptions.length || 4) +
            " indices that are strongest for likeness.",
        "- likenessPreservationNotes must emphasize what must be matched in Kie output.",
    ].join("\n");

    const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
    });

    const text = response.content?.[0] && "text" in response.content[0]
        ? (response.content[0] as any).text
        : "";
    const parsed = extractJsonObject(text || "") || extractJsonObject(JSON.stringify(text));
    return parsed ?? {};
}

export async function generateDonationSingleAdPrompt(input: {
    campaignType: string;
    subjectName: string;
    subjectType: string;
    speciesBreedAge: string;
    physicalDescription: string;
    injuryOrMedicalDetails: string;
    backstorySummary: string;
    urgencyLevel: string;
    fundraiserGoalAmount?: string;
    emotionalHook?: string;
    companionOrFamilyDetail?: string;
    beforeDetail?: string;
    platforms: string;
    styleTemplateId: string; // "1".."6"
    selectedAngle?: string;
    helperSettings: {
        higherAggression?: boolean;
        lowerAggression?: boolean;
        addText?: boolean;
        strongerCTA?: boolean;
        higherQuality?: boolean;
        beforeAfter?: boolean;
        extraNotes?: string;
    };
    pageEvaluation?: any;
    backstoryEvaluation: any;
    referenceEvaluation: any;
}) {
    const templateLabel =
        input.styleTemplateId === "1"
            ? "UGC SNAPCHAT"
            : input.styleTemplateId === "2"
              ? "NATIVE ORGANIC"
              : input.styleTemplateId === "3"
                ? "HYPER REALISTIC CLICKBAIT"
                : input.styleTemplateId === "4"
                  ? "CREATIVE CONCEPT"
                  : input.styleTemplateId === "5"
                    ? "ILLUSTRATED AI"
                    : "KLING VIDEO READY";

    const emotionalDirection =
        input.campaignType === "SICK OR INJURED ANIMAL"
            ? "devastation + tenderness"
            : input.campaignType ===
                "ANIMAL SURGERY OR MEDICAL PROCEDURE"
              ? "urgency + tenderness"
              : input.campaignType === "ANIMAL END OF LIFE OR AMPUTATION"
                ? "fight + tenderness"
                : input.campaignType === "HUMAN MEDICAL — CANCER"
                  ? "devastation + fight"
                  : input.campaignType ===
                      "HUMAN MEDICAL — ACCIDENT OR TRAUMA"
                    ? "urgency + devastation"
                    : input.campaignType ===
                        "HUMAN MEDICAL — CHRONIC ILLNESS"
                      ? "fight + tenderness"
                      : input.campaignType === "HUMAN FINANCIAL CRISIS"
                        ? "tenderness + urgency"
                        : input.campaignType === "CHILD MEDICAL"
                          ? "devastation + urgency"
                          : input.campaignType === "FAMILY CRISIS"
                            ? "tenderness + devastation"
                            : input.campaignType === "MEMORIAL OR LOSS"
                              ? "tenderness only"
                              : "devastation + tenderness";

    const textNeeded = input.styleTemplateId === "2" ? false : true;
    const wantsText =
        input.helperSettings.addText ?? false;
    const finalTextNeeded = input.styleTemplateId === "2" ? wantsText : textNeeded;

    const noText = !finalTextNeeded;

    const schemaObj = {
        ads: [
            {
                angle: "",
                hook: "",
                primaryText: "",
                headline: "",
                cta: "",
                visualPrompt: "",
            },
        ],
    };
    const schema = JSON.stringify(schemaObj, null, 2);

    const block1 = `Using the attached reference images as the primary subject reference. Do not generalize. Do not create a generic [species/person]. Recreate the EXACT subject including: — Specific facial structure and features — Exact coloring, markings, and fur or skin texture — All visible injuries exactly as shown in reference — All medical details — bandages colors and patterns, IV lines, medical devices, wounds — exactly as they appear — Their specific expression and body language Reference images override all other description. If no reference images are attached use the physical description and injury details provided to be as specific as possible.`;
    const block2 = `Do not heal, clean up, soften, beautify, or improve any injuries, wounds, medical devices, or physical damage. The injuries are the emotional core of this image. Every wound, bandage, and medical detail must be faithfully recreated exactly as described or shown. If anything has been softened the prompt has failed.`;
    const block3 = `Vertical 9:16 format. ${input.styleTemplateId === "1" ? "handheld smartphone night grain + imperfect framing" : input.styleTemplateId === "2" ? "camera-roll realism + quiet documentary framing" : input.styleTemplateId === "3" ? "confrontational hyper-real close framing + bold micro-detail" : input.styleTemplateId === "4" ? "cinematic still + distinctive real-world prop realism" : input.styleTemplateId === "5" ? "painterly/watercolor/colored-pencil look (preserve injury realism)" : "still camera-ready for Kling animation layers"}`;
    const block7 = `Inject emotional direction based on campaign_type using this exact mapping: ${emotionalDirection}`;
    const block8 =
        "This image should look like it was taken by someone who loves this subject and is terrified of losing them — not by someone who knows how to make ads. The moment it looks produced it loses everything. Keep it human. Keep it real.";

    const overlayTextBlock =
        finalTextNeeded
            ? `[TEXT CONTENT]
Text placement rules: Slightly imperfect alignment — 2 to 3 degrees off horizontal. As if typed directly into Instagram stories in 30 seconds. Not perfectly centered — slightly left or right of center. White text with subtle dark outline. Clean bold sans serif font. Chunky and readable at scroll speed. The imperfection is intentional and critical to authenticity.`
            : "";

    const sceneAndLighting =
        input.styleTemplateId === "1"
            ? "SCENE: middle-of-the-night phone-cam vibe (bathroom light or living-room lamp), subject in foreground, documentary handheld framing. LIGHTING: warm overhead or lamp light, harsh-soft contrast, visible room grain."
            : input.styleTemplateId === "2"
              ? "SCENE: quiet candid moment, subject framed naturally, minimal background distractions. LIGHTING: soft window light or soft indoor shade, gentle shadows."
              : input.styleTemplateId === "3"
                ? "SCENE: confrontational eye-level close-up, scale shot feel, evidence-like realism. LIGHTING: dramatic but truthful, high micro-contrast, clear highlight rolloff."
                : input.styleTemplateId === "4"
                  ? "SCENE: unexpected prop/story device scene (missing poster / vet invoice / phone screen), subject beside prop, cinematic realism. LIGHTING: cinematic directional light, realistic shadows."
                  : input.styleTemplateId === "5"
                    ? "SCENE: emotionally raw portrait moment rendered in illustrated style but preserving every wound and medical detail exactly. LIGHTING: painterly lighting with realistic shadow structure."
                    : "SCENE: Kling-ready close-up with life-detail in subject foreground; background movement element; preserve realism.";

    // KIE image prompt must omit BLOCK 6 for Kling. We keep it conditional via finalTextNeeded and omit for template6.
    const wantsKling = input.styleTemplateId === "6";

    const textBlockForPrompt =
        wantsKling || noText ? "" : overlayTextBlock;

    const animationPromptTemplate =
        'Slow cinematic animation. [SUBJECT] breathes gently — chest rising and falling slowly. [BACKGROUND MOVEMENT ELEMENT] animates naturally — [SPECIFIC MOVEMENT DESCRIPTION]. [LIGHT REACTION] — [SUBJECT]\\'s [FUR/SKIN/HAIR] catches the changing light and [REACTS SPECIFICALLY]. Camera completely still. Everything that moves is background and midground only. [SUBJECT] stays present and still in foreground. Duration 6 to 8 seconds. Motion intensity low. Photorealistic. No sudden movements. No dramatic shifts. Just [LIFE BARELY HELD / WORLD STILL MOVING / TIME SLOWING DOWN AROUND THEM].';

    const klingAnimationWithCue =
        `${animationPromptTemplate} Text to add in post — centered at top, fades in at 1 second, holds through 6 seconds, fades out: [SINGLE EMOTIONAL LINE BASED ON campaign_type].`;

    const visualPromptKie = [
        block1,
        block2,
        block3,
        sceneAndLighting,
        input.styleTemplateId === "1"
            ? "LIGHTING: warm imperfect night lamp light with harsh-soft edge transitions."
            : "LIGHTING: template-specific direction with realistic shadow/highlight rolloff.",
        wantsKling ? "" : textBlockForPrompt,
        block7,
        block8,
    ]
        .filter(Boolean)
        .join(" ");

    const visualPromptKieSingleLine = visualPromptKie.replace(
        /[\r\n]+/g,
        " "
    );

    const visualPromptSingle = wantsKling
        ? `KIE_IMAGE_PROMPT: ${visualPromptKieSingleLine} || KLING_ANIMATION_PROMPT: ${klingAnimationWithCue}`
        : visualPromptKieSingleLine;

    const helperNotes = [
        input.helperSettings.higherAggression ? "higher aggression" : "",
        input.helperSettings.lowerAggression ? "lower aggression" : "",
        input.helperSettings.addText ? "add text overlay" : "",
        input.helperSettings.strongerCTA ? "stronger CTA" : "",
        input.helperSettings.higherQuality ? "higher quality/less gimmicky" : "",
        input.helperSettings.beforeAfter ? "before/after framing" : "",
        input.helperSettings.extraNotes ? `extra notes: ${input.helperSettings.extraNotes}` : "",
    ]
        .filter(Boolean)
        .join("; ");

    const prompt = `
Return VALID JSON ONLY. No markdown.

You are generating a single DONATION / FUNDRAISER static ad concept for Kie.

INPUTS:
- styleTemplateId: ${input.styleTemplateId} (${templateLabel})
- campaignType: ${input.campaignType}
- subjectName: ${input.subjectName}
- subjectType: ${input.subjectType}
- speciesBreedAge: ${input.speciesBreedAge}
- physicalDescription: ${input.physicalDescription}
- injuryOrMedicalDetails: ${input.injuryOrMedicalDetails}
- backstorySummary: ${input.backstorySummary}
- urgencyLevel: ${input.urgencyLevel}
- fundraiserGoalAmount: ${input.fundraiserGoalAmount || "(none)"}
- emotionalHook: ${input.emotionalHook || "(none)"}
- companionOrFamilyDetail: ${input.companionOrFamilyDetail || "(none)"}
- beforeDetail: ${input.beforeDetail || "(none)"}
- platforms: ${input.platforms}
- selectedAngle: ${input.selectedAngle || "(none)"}
- helperNotes: ${helperNotes || "(none)"}

BACKSTORY EVALUATION (Block A):
${JSON.stringify(input.backstoryEvaluation || {})}

REFERENCE EVALUATION (Block B):
${JSON.stringify(input.referenceEvaluation || {})}

QUALITY REQUIREMENT:
visualPrompt MUST include donation blocks in exact order, and be a SINGLE-LINE string:
BLOCK 1, BLOCK 2, BLOCK 3, BLOCK 4, BLOCK 5, ${wantsKling ? "omit BLOCK 6 for KIE portion" : "optional BLOCK 6 based on text overlay"}, BLOCK 7, BLOCK 8.

For styleTemplateId = 2 (NATIVE ORGANIC), prefer NO on-image text unless helperNotes includes add text.
For styleTemplateId = 6 (KLING VIDEO READY), visualPrompt MUST contain BOTH:
KIE_IMAGE_PROMPT: ... || KLING_ANIMATION_PROMPT: ...

${schema}

Rules:
- primaryText must be "" if no on-image text.
- angle/hook/headline/primaryText/cta must be conversion-aware and match the chosen template style.
- visualPrompt must already contain the final text overlay instruction content if included.
`;

    const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 2500,
        messages: [{ role: "user", content: prompt }],
    });

    const text =
        response.content?.[0] && "text" in response.content[0]
            ? (response.content[0] as any).text
            : "";

    const parsed = extractJsonObject(text);
    return parsed;
}
`;

*/ const prompt = `
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
async function evaluateDonationBackstory(input) {
    const emotionalDirection = input.campaignType === "SICK OR INJURED ANIMAL" ? "devastation + tenderness" : input.campaignType === "ANIMAL SURGERY OR MEDICAL PROCEDURE" ? "urgency + tenderness" : input.campaignType === "ANIMAL END OF LIFE OR AMPUTATION" ? "fight + tenderness" : input.campaignType === "HUMAN MEDICAL — CANCER" ? "devastation + fight" : input.campaignType === "HUMAN MEDICAL — ACCIDENT OR TRAUMA" ? "urgency + devastation" : input.campaignType === "HUMAN MEDICAL — CHRONIC ILLNESS" ? "fight + tenderness" : input.campaignType === "HUMAN FINANCIAL CRISIS" ? "tenderness + urgency" : input.campaignType === "CHILD MEDICAL" ? "devastation + urgency" : input.campaignType === "FAMILY CRISIS" ? "tenderness + devastation" : input.campaignType === "MEMORIAL OR LOSS" ? "tenderness only" : "devastation + tenderness";
    const schemaObj = {
        emotionalStrength: 0,
        urgency: "",
        strongestHooks: [
            "",
            "",
            ""
        ],
        themes: [
            "",
            "",
            ""
        ],
        emotionalAnglesToUse: [
            "",
            "",
            ""
        ],
        emotionalDirection
    };
    const prompt = [
        "Return VALID JSON ONLY. No markdown.",
        "",
        "TASK: Donation backstory evaluation (Block A).",
        "",
        "INPUTS:",
        "- campaignType: " + input.campaignType,
        "- subjectName: " + input.subjectName,
        "- urgencyLevel: " + input.urgencyLevel,
        "- emotionalHook: " + (input.emotionalHook || "(none)"),
        "- backstorySummary: " + input.backstorySummary,
        "",
        JSON.stringify(schemaObj, null, 2),
        "",
        "Rules:",
        "- strongestHooks must be short, hook-like, usable as ad text.",
        "- themes are narrative pillars to reuse consistently.",
        "- emotionalAnglesToUse are 3 distinct angle phrases for generating ad hooks."
    ].join("\n");
    const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 900,
        messages: [
            {
                role: "user",
                content: prompt
            }
        ]
    });
    const text = response.content?.[0] && "text" in response.content[0] ? response.content[0].text : "";
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claudeAds$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extractJsonObject"])(text || "") ?? {};
}
async function evaluateDonationPageFromScrape(input) {
    const schemaObj = {
        subjectName: "",
        whatHappened: "",
        whyFundingIsNeeded: "",
        urgencyLevel: "general",
        keyEmotionalHooks: [
            "",
            "",
            ""
        ],
        usefulPhrases: [
            "",
            "",
            ""
        ],
        draftBackstory: ""
    };
    const prompt = [
        "Return VALID JSON ONLY. No markdown.",
        "",
        "You are preparing to create high-converting fundraiser ads.",
        "Extract:",
        "- character/subject name",
        "- what happened (core problem)",
        "- why funding is needed",
        "- urgency level",
        "- key emotional hooks",
        "- any useful phrases or details",
        "",
        "INPUT URL:",
        input.fundraiserUrl,
        "",
        "SCRAPED PAGE TEXT:",
        input.scrapedText.slice(0, 14000),
        "",
        JSON.stringify(schemaObj, null, 2)
    ].join("\n");
    const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 1200,
        messages: [
            {
                role: "user",
                content: prompt
            }
        ]
    });
    const text = response.content?.[0] && "text" in response.content[0] ? response.content[0].text : "";
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claudeAds$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extractJsonObject"])(text || "") ?? {};
}
async function evaluateDonationReferences(input) {
    const schemaObj = {
        imagesSummary: "",
        bestEmotionalVisualDetails: [
            "",
            "",
            ""
        ],
        likenessPreservationNotes: [
            "",
            "",
            ""
        ],
        selectedReferenceImages: [
            0
        ],
        visualElementsToPreserve: [
            "",
            "",
            ""
        ],
        textOverlayNotes: ""
    };
    const referenceLines = input.referenceDescriptions.map((r)=>{
        const desc = r.description && r.description.trim() ? r.description : "(empty)";
        return "  - [" + r.index + "] " + desc;
    }).join("\n");
    const prompt = [
        "Return VALID JSON ONLY. No markdown.",
        "",
        "TASK: Donation reference-image evaluation (Block B).",
        "",
        "IMPORTANT: You are evaluating the uploaded reference images based on the user-provided descriptions.",
        "",
        "INPUTS:",
        "- campaignType: " + input.campaignType,
        "- physicalDescription: " + input.physicalDescription,
        "- injuryOrMedicalDetails: " + input.injuryOrMedicalDetails,
        "- referenceDescriptions (index-based):",
        referenceLines,
        "- uploaded image URLs:",
        JSON.stringify(input.referenceImageUrls || []),
        "",
        JSON.stringify(schemaObj, null, 2),
        "",
        "Rules:",
        "- selectedReferenceImages must list strongest likeness indices (choose 1–" + Math.min(4, input.referenceDescriptions.length || 4) + ").",
        "- likenessPreservationNotes must emphasize what must be matched in Kie output."
    ].join("\n");
    const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 1000,
        messages: [
            {
                role: "user",
                content: prompt
            }
        ]
    });
    const text = response.content?.[0] && "text" in response.content[0] ? response.content[0].text : "";
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claudeAds$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extractJsonObject"])(text || "") ?? {};
}
async function generateDonationSingleAdPrompt(input) {
    const templateLabel = input.styleTemplateId === "1" ? "UGC SNAPCHAT" : input.styleTemplateId === "2" ? "NATIVE ORGANIC" : input.styleTemplateId === "3" ? "HYPER REALISTIC CLICKBAIT" : input.styleTemplateId === "4" ? "CREATIVE CONCEPT" : input.styleTemplateId === "5" ? "ILLUSTRATED AI" : "KLING VIDEO READY";
    const helperNotes = [
        input.helperSettings.higherAggression ? "higher aggression" : "",
        input.helperSettings.lowerAggression ? "lower aggression" : "",
        input.helperSettings.addText ? "add text overlay" : "",
        input.helperSettings.strongerCTA ? "stronger CTA" : "",
        input.helperSettings.higherQuality ? "higher quality" : "",
        input.helperSettings.beforeAfter ? "before/after framing" : "",
        input.helperSettings.extraNotes ? "extraNotes: " + input.helperSettings.extraNotes : ""
    ].filter(Boolean).join("; ");
    const expectsText = input.styleTemplateId === "2" ? !!input.helperSettings.addText : true;
    const primaryTextValue = expectsText ? "..." : "";
    const schema = {
        ads: [
            {
                angle: "",
                hook: "",
                primaryText: primaryTextValue,
                headline: "",
                cta: "",
                visualPrompt: ""
            }
        ]
    };
    const styleSpecificCamera = input.styleTemplateId === "1" ? "handheld smartphone night grain + imperfect framing" : input.styleTemplateId === "2" ? "camera-roll realism + quiet documentary framing" : input.styleTemplateId === "3" ? "hyper-real close framing + confrontational micro-detail" : input.styleTemplateId === "4" ? "cinematic still + distinctive real-world prop realism" : input.styleTemplateId === "5" ? "painterly/watercolor/colored-pencil look (preserve injury realism)" : "Kling-ready close-up with life-detail in subject foreground";
    const wantKling = input.styleTemplateId === "6";
    const visualPromptRules = wantKling ? [
        "visualPrompt MUST contain BOTH:",
        "KIE_IMAGE_PROMPT: <BLOCKS 1–5 and 7–8 only (OMIT BLOCK 6)> || KLING_ANIMATION_PROMPT: <animation prompt>"
    ].join("\n") : [
        "visualPrompt MUST be a single-line string containing BLOCKS 1–5 and 7–8. Include BLOCK 6 only if expectsText is true."
    ].join("\n");
    const prompt = [
        "Return VALID JSON ONLY. No markdown.",
        "",
        "You are generating ONE DONATION/FUNDRAISER static ad concept for Kie.",
        "",
        "INPUTS:",
        "- template: " + templateLabel,
        "- campaignType: " + input.campaignType,
        "- subjectName: " + input.subjectName,
        "- subjectType: " + input.subjectType,
        "- species/breed/age: " + input.speciesBreedAge,
        "- physicalDescription: " + input.physicalDescription,
        "- injuryOrMedicalDetails: " + input.injuryOrMedicalDetails,
        "- backstorySummary: " + input.backstorySummary,
        "- urgencyLevel: " + input.urgencyLevel,
        "- fundraiserGoalAmount: " + (input.fundraiserGoalAmount || "(none)"),
        "- emotionalHook: " + (input.emotionalHook || "(none)"),
        "- companionOrFamilyDetail: " + (input.companionOrFamilyDetail || "(none)"),
        "- beforeDetail: " + (input.beforeDetail || "(none)"),
        "- platforms: " + input.platforms,
        "- selectedAngle: " + (input.selectedAngle || "(none)"),
        "- helperNotes: " + (helperNotes || "(none)"),
        "",
        input.referenceImageUrls && input.referenceImageUrls.length ? "REFERENCE IMAGE URLS (match these in generation):\n" + input.referenceImageUrls.map((u, i)=>`[${i}] ${u}`).join("\n") : "",
        "",
        (input.creativeBrainSection || "").trim() ? input.creativeBrainSection.trim() : "",
        "",
        "BACKSTORY EVALUATION:",
        JSON.stringify(input.backstoryEvaluation || {}, null, 2),
        "",
        "PAGE EVALUATION:",
        JSON.stringify(input.pageEvaluation || {}, null, 2),
        "",
        "REFERENCE EVALUATION:",
        JSON.stringify(input.referenceEvaluation || {}, null, 2),
        "",
        "STYLE CAMERA BLOCK:",
        styleSpecificCamera,
        "",
        "QUALITY REQUIREMENTS (visualPrompt):",
        "- Blocks must appear in order: BLOCK 1, BLOCK 2, BLOCK 3, BLOCK 4, BLOCK 5, BLOCK 6(optional), BLOCK 7, BLOCK 8.",
        "- visualPrompt MUST already include the overlay text instructions if BLOCK 6 is included.",
        "- Avoid generic ad language; be specific and grounded in the provided details.",
        visualPromptRules,
        "",
        JSON.stringify(schema, null, 2)
    ].join("\n");
    const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 2200,
        messages: [
            {
                role: "user",
                content: prompt
            }
        ]
    });
    const text = response.content?.[0] && "text" in response.content[0] ? response.content[0].text : "";
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claudeAds$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extractJsonObject"])(text || "") ?? {
        ads: []
    };
}
async function generateDonationFundraiserBatchFive(input) {
    const adCount = input.slots.length;
    if (adCount < 1 || adCount > 5) {
        throw new Error(`generateDonationFundraiserBatchFive: expected 1–5 slots, got ${adCount}`);
    }
    const schema = {
        ads: Array.from({
            length: adCount
        }, ()=>({
                angle: "",
                hook: "",
                primaryText: "",
                headline: "",
                cta: "",
                visualPrompt: ""
            }))
    };
    const slotBlocks = input.slots.map((s)=>{
        const tid = s.styleTemplateId;
        const styleSpecificCamera = tid === "1" ? "handheld smartphone night grain + imperfect framing" : tid === "2" ? "camera-roll realism + quiet documentary framing" : tid === "3" ? "hyper-real close framing + confrontational micro-detail" : tid === "4" ? "cinematic still + distinctive real-world prop realism" : tid === "5" ? "painterly/watercolor/colored-pencil look (preserve injury realism)" : "Kling-ready close-up with life-detail in subject foreground";
        const wantKling = tid === "6";
        const keyed = s.keyedBrainInstructions || "";
        const hasVarAddText = /\bVAR_ADD_TEXT\b/i.test(keyed);
        const hasVarNoText = /\bVAR_NO_TEXT\b/i.test(keyed);
        const expectsText = hasVarNoText ? false : tid === "2" ? hasVarAddText : true;
        const visualPromptRules = wantKling ? "visualPrompt MUST contain BOTH: KIE_IMAGE_PROMPT: <BLOCKS 1–5 and 7–8 only (OMIT BLOCK 6)> || KLING_ANIMATION_PROMPT: <animation prompt>" : "visualPrompt MUST be a single-line string containing BLOCKS 1–5 and 7–8. Include BLOCK 6 only if this slot expects on-image text.";
        const seedLine = (s.winningPromptSeed || "").trim().length > 0 ? `WINNING_PROMPT_SEED (pattern / rhythm only — adapt to this fundraiser; do not copy verbatim):\n${s.winningPromptSeed.trim()}` : "WINNING_PROMPT_SEED: (none — rely on global brain examples)";
        return [
            `--- SLOT ${s.slotIndex} (template ${tid} ${s.templateLabel}) ---`,
            `- selectedAngle: ${s.selectedAngle || "(none — pick from brain angle list)"}`,
            `- expectsOnImageText: ${expectsText ? "true" : "false"} (for NATIVE ORGANIC/2, text only if VAR_ADD_TEXT is present and VAR_NO_TEXT is not; VAR_NO_TEXT forces minimal/no on-image text for this slot)`,
            `- If expectsOnImageText is false: primaryText must be "" and omit BLOCK 6 from the KIE block structure.`,
            seedLine,
            s.keyedBrainInstructions ? `KEYED BRAIN FOR THIS SLOT:\n${s.keyedBrainInstructions}` : "(no keyed lines for this slot)",
            `STYLE CAMERA: ${styleSpecificCamera}`,
            visualPromptRules
        ].join("\n");
    });
    const diversityRules = adCount === 1 ? `
SINGLE AD OUTPUT:
- Produce one sharp donation ad following SLOT 1 below.
- Avoid repeating concepts called out in PRIOR BATCHES ON THIS JOB below.
- If SWIPE BANK appears above: borrow structure, lighting vocabulary, and block rhythm only — never transplant another animal's story, injuries, or names; EVALUATIONS + campaign inputs are the source of truth.

OUTPUT:
- Return JSON with key "ads" containing EXACTLY 1 object matching SLOT 1.
- Each ad: angle, hook, primaryText, headline, cta, visualPrompt (all strings).
`.trim() : `
BATCH DIVERSITY (required):
- Across the ${adCount} ads, use noticeably different hooks, angles, and visual scenes.
- Include a mix of text density: at least one strong on-image text ad, at least one minimal-text, and at least one with no on-image text (primaryText "") where template allows (especially template 2 without VAR_ADD_TEXT, or any slot with VAR_NO_TEXT).
- Do not repeat the same hook wording or near-duplicate scenes across slots.
- Avoid repeating concepts called out in PRIOR BATCHES ON THIS JOB below.
- If SWIPE BANK appears above: borrow structure, lighting vocabulary, and block rhythm only — never transplant another animal's story, injuries, or names; EVALUATIONS + campaign inputs are the source of truth.

OUTPUT:
- Return JSON with key "ads" containing EXACTLY ${adCount} objects in order matching SLOT 1..${adCount}.
- Each ad: angle, hook, primaryText, headline, cta, visualPrompt (all strings).
`.trim();
    const prompt = [
        "Return VALID JSON ONLY. No markdown.",
        "",
        adCount === 1 ? "You have extended thinking enabled: use it to reconcile Creative Brain, swipe bank (if any), evaluations, prior batches, and the slot template before writing output." : "You have extended thinking enabled: use it to reconcile Creative Brain, swipe bank (if any), evaluations, prior batches, and each slot's template before writing output. Aim for sharp, distinct, donation-optimized concepts that convert without repeating hooks or scenes.",
        "",
        `You are generating EXACTLY ${adCount} distinct DONATION/FUNDRAISER static ad concept${adCount === 1 ? "" : "s"} for Kie in ONE batch.`,
        "",
        "SHARED CAMPAIGN INPUTS:",
        "- campaignType: " + input.campaignType,
        "- subjectName: " + input.subjectName,
        "- subjectType: " + input.subjectType,
        "- species/breed/age: " + input.speciesBreedAge,
        "- physicalDescription: " + input.physicalDescription,
        "- injuryOrMedicalDetails: " + input.injuryOrMedicalDetails,
        "- backstorySummary: " + input.backstorySummary,
        "- urgencyLevel: " + input.urgencyLevel,
        "- fundraiserGoalAmount: " + (input.fundraiserGoalAmount || "(none)"),
        "- emotionalHook: " + (input.emotionalHook || "(none)"),
        "- companionOrFamilyDetail: " + (input.companionOrFamilyDetail || "(none)"),
        "- beforeDetail: " + (input.beforeDetail || "(none)"),
        "- platforms: " + input.platforms,
        "",
        input.referenceImageUrls.length ? "REFERENCE IMAGE URLS (match likeness; same refs apply to all ads in this batch):\n" + input.referenceImageUrls.map((u, i)=>`[${i}] ${u}`).join("\n") : "REFERENCE IMAGE URLS: (none)",
        "",
        (input.brainStaticPreamble || "").trim(),
        "",
        (input.swipeBankSection || "").trim(),
        "",
        "PRIOR BATCHES ON THIS JOB (avoid repeating these hooks/angles/templates):",
        input.priorBatchesSummary,
        "",
        "EVALUATIONS:",
        "BACKSTORY:",
        JSON.stringify(input.backstoryEvaluation || {}, null, 2),
        "",
        "PAGE:",
        JSON.stringify(input.pageEvaluation || {}, null, 2),
        "",
        "REFERENCE IMAGES ANALYSIS:",
        JSON.stringify(input.referenceEvaluation || {}, null, 2),
        "",
        diversityRules,
        "",
        "PER-SLOT INSTRUCTIONS:",
        slotBlocks.join("\n\n"),
        "",
        "QUALITY: Each visualPrompt follows donation BLOCK order (1–8) per template rules above; be specific to this subject; no generic ad copy.",
        "",
        JSON.stringify(schema, null, 2)
    ].filter((line)=>line !== "").join("\n");
    const batchParams = getFundraiserBatchMessageParams();
    const response = await messagesCreateLongRequestSafe({
        model: batchParams.model,
        max_tokens: batchParams.max_tokens,
        ...batchParams.thinking ? {
            thinking: batchParams.thinking
        } : {},
        messages: [
            {
                role: "user",
                content: prompt
            }
        ]
    });
    const text = collectAssistantTextBlocks(response.content) || (response.content?.[0] && "text" in response.content[0] ? response.content[0].text : "");
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claudeAds$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extractJsonObject"])(text || "") ?? {
        ads: []
    };
}
/** Shared donation prompt block: page/story/reference eval JSON + rules (batch, variations, Kling). */ function buildDonationVariationEvaluationsBlock(evals) {
    return [
        "CAMPAIGN GROUND TRUTH (EVALUATIONS — factual source for this fundraiser):",
        "These JSON blocks are the same inputs used when this job was evaluated. They take precedence over baseAd when facts conflict.",
        "",
        "BACKSTORY EVALUATION:",
        JSON.stringify(evals.backstoryEvaluation ?? {}, null, 2),
        "",
        "PAGE EVALUATION:",
        JSON.stringify(evals.pageEvaluation ?? {}, null, 2),
        "",
        "REFERENCE IMAGE EVALUATION:",
        JSON.stringify(evals.referenceEvaluation ?? {}, null, 2),
        "",
        "EVALUATION RULES:",
        "- Do not invent donation mechanics, amounts, or recurring/subscription offers unless clearly supported by PAGE evaluation or these JSON fields.",
        "- If baseAd copy implies offers, price points, or billing models not supported by PAGE evaluation, rewrite hook/headline/primaryText/cta/visualPrompt to align with evaluations and Creative Brain.",
        ""
    ].join("\n");
}
async function rewriteDonationVisualToKlingReady(input) {
    const evalBlock = input.donationEvaluations ? [
        "",
        buildDonationVariationEvaluationsBlock(input.donationEvaluations),
        ""
    ].join("\n") : "";
    const brainBlock = (input.fundraiserBrainPreamble || "").trim() ? [
        "",
        "FUNDRAISER CREATIVE BRAIN (Memory — patterns and global notes; do not contradict EVALUATIONS):",
        input.fundraiserBrainPreamble.trim(),
        ""
    ].join("\n") : "";
    const thinkingLead = input.donationEvaluations || (input.fundraiserBrainPreamble || "").trim() ? "Extended thinking is enabled: reconcile EVALUATIONS, Creative Brain (if any), and COPY below before outputting JSON.\n\n" : "";
    const prompt = [
        "Return VALID JSON ONLY. No markdown.",
        "",
        thinkingLead,
        'Schema: {"visualPrompt":"<single line, no literal newlines>"}',
        "",
        "You upgrade a STATIC donation/fundraiser image prompt into a 2-part line: still frame for Nano Banana + Kling animation strand.",
        evalBlock,
        brainBlock,
        "STATIC PROMPT (preserve subject, injuries, likeness; tighten photoreal specifics where vague):",
        (input.staticVisualPrompt || "").slice(0, 12000),
        "",
        "COPY (motion mood + on-screen text cue — must comply with PAGE evaluation; no unsupported offers):",
        "- campaignType: " + input.campaignType,
        "- hook: " + input.hook,
        "- headline: " + input.headline,
        "- primaryText: " + input.primaryText,
        "- cta: " + input.cta,
        "",
        "OUTPUT visualPrompt = ONE LINE with BOTH parts separated by exactly:",
        " || ",
        "",
        "1) KIE_IMAGE_PROMPT:",
        "   Hyper-photoreal still. Include donation narrative blocks 1–5 and 7–8 in order.",
        "   OMIT block 6 entirely inside KIE (no on-image text in the still).",
        "   Medical/injury fidelity must match the static prompt.",
        "",
        "2) KLING_ANIMATION_PROMPT:",
        "   6–8 seconds, low motion, photoreal. Subject breathes gently (visible chest). Camera locked.",
        "   Exactly ONE subtle background motion: curtains OR candle flame OR rain on glass OR dust in light OR blurred outside world.",
        "   Fur/skin catches moving light subtly.",
        "   End with this exact style of cue (fill bracket from hook/headline):",
        '   Text to add in post — centered at top, fades in at 1 second, holds through 6 seconds, fades out: [ONE short emotional line].',
        "",
        "Rules: No markdown. No line breaks inside visualPrompt."
    ].join("\n");
    const batchParams = getFundraiserBatchMessageParams();
    const response = await messagesCreateLongRequestSafe({
        model: batchParams.model,
        max_tokens: Math.max(batchParams.max_tokens, 6000),
        ...batchParams.thinking ? {
            thinking: batchParams.thinking
        } : {},
        messages: [
            {
                role: "user",
                content: prompt
            }
        ]
    });
    const text = getFirstTextOrThrow(response);
    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claudeAds$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extractJsonObject"])(text || "") ?? {};
    return parsed;
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
    const maxTokens = input.donationOnly && requestedAdCount >= 20 ? 12000 : 7000;
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
  - Use ONLY the selected template ids as the allowed style/template cycle.
  - Generate ads in round-robin across the selected template ids:
    - ad #1 uses the first selected template
    - ad #2 uses the second selected template
    - continue in this order, then wrap back to the first selected template
    - continue until you have EXACTLY requestedAdCount ads total.
  - For every repetition of a template later in the batch, you MUST change the concept/story-device, camera framing/distance, scene environment, lighting mood, and text treatment so the later occurrence still feels distinct.

LARGE BATCH ANTI-REPETITION RULES (apply when requestedAdCount >= 20):
  - No two ads can feel like the same setup with different wording.
  - Track used: (a) template, (b) concept/story-device, (c) camera framing/distance, (d) setting/environment, (e) lighting mood, (f) text density (text-heavy vs minimal vs no-text), and (g) emotional headline pattern.
  - For any two ads, ensure at least 4 of those 7 items differ.
  - Never repeat the same emotional headline pattern in adjacent ads.
  - Before outputting final JSON, self-check each adjacent pair (Ad i vs Ad i-1) for similarity; if any pair feels too close, rewrite one.

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
  - For TEMPLATE 6 (KLING VIDEO READY), these 8 blocks apply only to the KIE_IMAGE_PROMPT portion (inside visualPrompt), and the KLING_ANIMATION_PROMPT portion must follow the animation prompt rules instead of repeating BLOCK 1–8.
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
        max_tokens: maxTokens,
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
    const requestedVariations = input.campaignType === "donation" ? Math.max(1, Math.min(5, Math.floor(input.requestedVariations))) : Math.max(3, Math.min(5, Math.floor(input.requestedVariations)));
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
    const visualContractLine = input.campaignType === "donation" && input.donationKlingFormat ? "- visualPrompt MUST be ONE line: KIE_IMAGE_PROMPT: <still> || KLING_ANIMATION_PROMPT: <animation> (both parts required)." : "- visualPrompt MUST be a production-ready single-image prompt suitable for Nano Banana 2.";
    const contractTail = `
OUTPUT CONTRACT (MUST FOLLOW EXACTLY):
- Output MUST be a single JSON object with a root key "ads".
- "ads" MUST be a non-empty array with EXACTLY ${requestedVariations} items.
- Each ad item MUST include exactly these keys: "angle", "hook", "primaryText", "headline", "cta", "visualPrompt".
${visualContractLine}
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
    const brainBlock = (input.creativeBrainSection || "").trim() ? `
FUNDRAISER CREATIVE BRAIN (apply where relevant to these variations):
${input.creativeBrainSection.trim()}
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
    const selfCheckVariationsBlock = input.campaignType === "donation" && input.donationEvaluations ? `
SELF-CHECK (before outputting JSON):
- Verify no clones: hook + headline + primaryText + cta wording must not all match baseAd.
- Verify differentiation across the generated variations (2-of rule).
- Verify no generic hooks/scenes.
- Verify all copy complies with PAGE evaluation (no unsupported donation claims).
- Then output final JSON only.
` : `
SELF-CHECK (before outputting JSON):
- Verify no clones: hook + headline + primaryText + cta wording must not all match baseAd.
- Verify differentiation across the generated variations (2-of rule).
- Verify no generic hooks/scenes.
- Then output final JSON only.
`;
    const donationVisualPromptRules = `
- visualPrompt MUST be a single-line string (no newline characters).
- DEFAULT: STATIC STILL AD — one photoreal Nano Banana prompt with donation BLOCKS 1–8 in order (include BLOCK 6 when on-image text fits the variation).
- If baseAd.visualPrompt contains legacy KIE_IMAGE_PROMPT / KLING markers, extract the still intent and output ONE normal static BLOCK 1–8 line (no KLING pack).
- Keep the template style aligned with baseAd.angle prefix (UGC SNAPCHAT / NATIVE ORGANIC / HYPER REALISTIC CLICKBAIT / CREATIVE CONCEPT / ILLUSTRATED AI).
- Keep subject identity / emotional core consistent with the base ad (do not turn it into a new story).
- Text overlays (when included) must use the variation's headline/primaryText/cta with correct placement.
`;
    const donationKlingVariationRules = `
- visualPrompt MUST be a single-line string (no newline characters).
- KLING FORMAT MODE — every variation outputs exactly:
  "KIE_IMAGE_PROMPT: <...> || KLING_ANIMATION_PROMPT: <...>"
- KIE_IMAGE_PROMPT: hyper-photoreal still; donation blocks 1–5 and 7–8 in order; OMIT BLOCK 6 inside KIE (no on-image text in the still).
- KLING_ANIMATION_PROMPT: 6–8s subtle motion — subject breathes, camera locked, ONE background element moves, photoreal; end with:
  Text to add in post — centered at top, fades in at 1 second, holds through 6 seconds, fades out: [ONE line from this variation's hook/headline].
- Prefix each variation's angle with: KLING VIDEO READY — (then the angle concept).
- Keep subject / medical accuracy consistent with baseAd; vary hooks and scenes across variations.
`;
    const productVisualPromptRules = `
- output a single-line Nano Banana 2 prompt with labeled sections separated by " | ".
- Include: REFERENCE IMAGE USAGE | SCENE | LIGHTING | COLOR PALETTE | MOOD | TEXT OVERLAY | TYPOGRAPHY | CAMERA FEEL | SCROLL-STOP DETAIL.
- Ensure TEXT OVERLAY uses the variation's headline/primaryText/cta with clear placement + readability notes.
`;
    const donationRulesForPrompt = input.campaignType === "donation" ? input.donationKlingFormat ? donationKlingVariationRules : donationVisualPromptRules : productVisualPromptRules;
    const donationEvalBlock = input.campaignType === "donation" && input.donationEvaluations ? buildDonationVariationEvaluationsBlock(input.donationEvaluations) : "";
    const donationThinkingLead = input.campaignType === "donation" ? input.donationEvaluations ? "Extended thinking is enabled: use it to reconcile CAMPAIGN GROUND TRUTH (EVALUATIONS), FUNDRAISER CREATIVE BRAIN (if any), user variation instructions, and baseAd before writing JSON.\n\n" : "Extended thinking is enabled: reconcile FUNDRAISER CREATIVE BRAIN (if any), user variation instructions, and baseAd before writing JSON.\n\n" : "";
    const prompt = `
You are generating VARIATIONS of a single existing ad tab (NOT a fresh batch).

${donationThinkingLead}Task:
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

${donationEvalBlock}${variationInstructionBlock}
${brainBlock}

BaseAd (execution starting point — align copy with EVALUATIONS when they conflict):
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
${donationRulesForPrompt}

Return VALID JSON ONLY with this exact schema:
${commonAdsSchema}

${contractTail}

${selfCheckVariationsBlock}
`;
    if (input.campaignType === "donation") {
        const batchParams = getFundraiserBatchMessageParams();
        const response = await messagesCreateLongRequestSafe({
            model: batchParams.model,
            max_tokens: Math.max(batchParams.max_tokens, 10_000),
            ...batchParams.thinking ? {
                thinking: batchParams.thinking
            } : {},
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        });
        return getFirstTextOrThrow(response);
    }
    const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 5000,
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
"[project]/src/lib/klingReady.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Helpers for optional Kling video packs (KIE still + KLING animation strand). */ __turbopack_context__.s([
    "buildKlingAngleLabel",
    ()=>buildKlingAngleLabel,
    "extractKiePortionForImageGen",
    ()=>extractKiePortionForImageGen,
    "extractStaticVisualFromAdPrompt",
    ()=>extractStaticVisualFromAdPrompt
]);
function extractStaticVisualFromAdPrompt(combined) {
    const t = (combined || "").trim();
    if (!t) return "";
    if (t.includes("KIE_IMAGE_PROMPT:") && t.includes("|| KLING_ANIMATION_PROMPT:")) {
        const after = t.split("KIE_IMAGE_PROMPT:")[1] || "";
        return after.split("|| KLING_ANIMATION_PROMPT:")[0].trim();
    }
    if (t.includes("KIE_IMAGE_PROMPT:")) {
        return (t.split("KIE_IMAGE_PROMPT:")[1] || "").trim();
    }
    return t;
}
function extractKiePortionForImageGen(visualPrompt) {
    const t = (visualPrompt || "").trim();
    if (t.includes("KIE_IMAGE_PROMPT:") && t.includes("|| KLING_ANIMATION_PROMPT:")) {
        const after = t.split("KIE_IMAGE_PROMPT:")[1] || "";
        return after.split("|| KLING_ANIMATION_PROMPT:")[0].trim();
    }
    return t;
}
function buildKlingAngleLabel(previousAngle) {
    const a = (previousAngle || "").trim();
    if (a.startsWith("KLING VIDEO READY")) return a;
    return a ? `KLING VIDEO READY — ${a}` : "KLING VIDEO READY";
}
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
    "collectUsedAngleMemoryKeys",
    ()=>collectUsedAngleMemoryKeys,
    "donationStyleTemplateLabel",
    ()=>donationStyleTemplateLabel,
    "formatBatchHistoryForPrompt",
    ()=>formatBatchHistoryForPrompt,
    "getFundraiserCreativeBrain",
    ()=>getFundraiserCreativeBrain,
    "helperSettingsToVarKeys",
    ()=>helperSettingsToVarKeys,
    "mergeAdditionalInfoSections",
    ()=>mergeAdditionalInfoSections,
    "normalizeAngleLine",
    ()=>normalizeAngleLine,
    "parseAnglesList",
    ()=>parseAnglesList,
    "parseFundraiserBatchHistory",
    ()=>parseFundraiserBatchHistory,
    "parseKeyedAdditionalInfo",
    ()=>parseKeyedAdditionalInfo,
    "pickRandomWinningPromptSeeds",
    ()=>pickRandomWinningPromptSeeds,
    "planFundraiserBatchFreshAngles",
    ()=>planFundraiserBatchFreshAngles,
    "planFundraiserBatchOfFive",
    ()=>planFundraiserBatchOfFive,
    "resolveVarKeyPoolFromAdditionalInfo",
    ()=>resolveVarKeyPoolFromAdditionalInfo,
    "splitAdditionalInfoSections",
    ()=>splitAdditionalInfoSections,
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
    "VAR_NO_TEXT",
    "VAR_STRONGER_CTA",
    "VAR_HIGHER_QUALITY",
    "VAR_BEFORE_AFTER"
];
function splitAdditionalInfoSections(text) {
    const lines = (text || "").split(/\r?\n/);
    const varRows = [];
    const otherLines = [];
    const varIndexByKey = new Map();
    for (const line of lines){
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
        const key = trimmed.slice(0, eq).trim().toUpperCase().replace(/\s+/g, "_");
        const val = trimmed.slice(eq + 1).trim();
        if (key.startsWith("VAR_")) {
            const existing = varIndexByKey.get(key);
            if (existing !== undefined) {
                varRows[existing] = {
                    key,
                    value: val
                };
            } else {
                varIndexByKey.set(key, varRows.length);
                varRows.push({
                    key,
                    value: val
                });
            }
        } else {
            otherLines.push(line);
        }
    }
    return {
        globalAndTemplateLines: otherLines.join("\n"),
        varKeyRows: varRows
    };
}
function mergeAdditionalInfoSections(globalAndTemplateLines, varKeyRows) {
    const normRows = varKeyRows.map((r)=>({
            key: r.key.trim().toUpperCase().replace(/\s+/g, "_"),
            value: r.value.trim()
        })).filter((r)=>r.key.startsWith("VAR_") && r.key.length > 4);
    const varLines = normRows.map((r)=>`${r.key} = ${r.value}`);
    const g = (globalAndTemplateLines || "").replace(/\s+$/, "");
    if (!g && varLines.length === 0) return "";
    if (!g) return varLines.join("\n");
    if (varLines.length === 0) return g;
    return `${g}\n\n${varLines.join("\n")}`;
}
function resolveVarKeyPoolFromAdditionalInfo(additionalInfo) {
    const { keyed } = parseKeyedAdditionalInfo(additionalInfo);
    const fromMemory = [];
    for (const k of keyed.keys()){
        if (k.startsWith("VAR_")) fromMemory.push(k);
    }
    if (fromMemory.length > 0) return fromMemory;
    return [
        ...VAR_BRAIN_KEYS
    ];
}
function resolveVarKeyConflicts(keys, random) {
    const set = new Set(keys);
    if (set.has("VAR_ADD_TEXT") && set.has("VAR_NO_TEXT")) {
        if (random() < 0.5) set.delete("VAR_NO_TEXT");
        else set.delete("VAR_ADD_TEXT");
    }
    return Array.from(set);
}
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
    if (helpers.noText) keys.push("VAR_NO_TEXT");
    if (helpers.strongerCTA) keys.push("VAR_STRONGER_CTA");
    if (helpers.higherQuality) keys.push("VAR_HIGHER_QUALITY");
    if (helpers.beforeAfter) keys.push("VAR_BEFORE_AFTER");
    if (keys.includes("VAR_ADD_TEXT") && keys.includes("VAR_NO_TEXT")) {
        return keys.filter((k)=>k !== "VAR_NO_TEXT");
    }
    return keys;
}
function variationCheckboxesToVarKeys(_flags) {
    return [];
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
function normalizeAngleLine(s) {
    return s.trim().toLowerCase().replace(/\s+/g, " ");
}
function parseAnglesList(anglesListText) {
    const seen = new Set();
    const out = [];
    for (const line of (anglesListText || "").split(/\r?\n/)){
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
function findMemoryAngleKeyForStoredAngle(stored, memoryAngles) {
    const s = normalizeAngleLine(stored);
    if (!s) return null;
    for (const m of memoryAngles){
        const nm = normalizeAngleLine(m);
        if (nm === s) return nm;
        if (s.includes(nm) || nm.includes(s)) return nm;
    }
    return null;
}
function collectUsedAngleMemoryKeys(history, memoryAngles) {
    const used = new Set();
    for (const batch of history.batches){
        if (batch.plan && batch.plan.length) {
            for (const slot of batch.plan){
                const line = slot.angleLine?.trim();
                if (!line) continue;
                const k = findMemoryAngleKeyForStoredAngle(line, memoryAngles);
                if (k) used.add(k);
            }
        } else {
            for (const ad of batch.ads){
                const a = ad.angle?.trim();
                if (!a) continue;
                const k = findMemoryAngleKeyForStoredAngle(a, memoryAngles);
                if (k) used.add(k);
            }
        }
    }
    return used;
}
function planFundraiserBatchFreshAngles(anglesListText, usedAngleKeys, random = Math.random, options) {
    const memoryLines = parseAnglesList(anglesListText);
    const remaining = memoryLines.filter((m)=>!usedAngleKeys.has(normalizeAngleLine(m)));
    const slotCount = Math.min(5, remaining.length);
    if (slotCount <= 0) return [];
    const shuffled = [
        ...remaining
    ];
    shuffleInPlace(shuffled, random);
    const chosenAngles = shuffled.slice(0, slotCount);
    const templateDeck = [
        "1",
        "2",
        "3",
        "4",
        "5"
    ];
    shuffleInPlace(templateDeck, random);
    let baseVarPool = options?.varKeyPool?.filter(Boolean).length ?? 0 ? [
        ...options.varKeyPool
    ] : [
        ...VAR_BRAIN_KEYS
    ];
    if (baseVarPool.length === 0) {
        baseVarPool = [
            ...VAR_BRAIN_KEYS
        ];
    }
    const plans = [];
    for(let i = 0; i < slotCount; i++){
        const styleTemplateId = templateDeck[i];
        const brainTemplateKey = TEMPLATE_ID_TO_BRAIN_KEY[styleTemplateId] || "UGC_SNAPCHAT";
        const angleLine = chosenAngles[i];
        const varPool = [
            ...baseVarPool
        ];
        shuffleInPlace(varPool, random);
        const nVar = Math.floor(random() * 4);
        const rawKeys = varPool.slice(0, nVar);
        const varKeys = resolveVarKeyConflicts(rawKeys, random);
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
function planFundraiserBatchOfFive(anglesListText, random = Math.random, options) {
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
    let baseVarPool = options?.varKeyPool?.filter(Boolean).length ?? 0 ? [
        ...options.varKeyPool
    ] : [
        ...VAR_BRAIN_KEYS
    ];
    if (baseVarPool.length === 0) {
        baseVarPool = [
            ...VAR_BRAIN_KEYS
        ];
    }
    const plans = [];
    for(let i = 0; i < 5; i++){
        const styleTemplateId = deck[i % deck.length];
        const brainTemplateKey = TEMPLATE_ID_TO_BRAIN_KEY[styleTemplateId] || "UGC_SNAPCHAT";
        const angleLine = angleLines.length > 0 ? pickRandom(angleLines, random) : "";
        const varPool = [
            ...baseVarPool
        ];
        shuffleInPlace(varPool, random);
        const nVar = Math.floor(random() * 4);
        const rawKeys = varPool.slice(0, nVar);
        const varKeys = resolveVarKeyConflicts(rawKeys, random);
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
"[project]/src/lib/jobFundraiserBatchHistory.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readJobFundraiserBatchHistory",
    ()=>readJobFundraiserBatchHistory,
    "writeJobFundraiserBatchHistory",
    ()=>writeJobFundraiserBatchHistory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-rsc] (ecmascript)");
;
async function readJobFundraiserBatchHistory(jobId) {
    const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].$queryRaw`
        SELECT "fundraiserBatchHistory" FROM "Job" WHERE "id" = ${jobId}
    `;
    return rows[0]?.fundraiserBatchHistory ?? null;
}
async function writeJobFundraiserBatchHistory(jobId, value) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].$executeRaw`
        UPDATE "Job" SET "fundraiserBatchHistory" = ${value} WHERE "id" = ${jobId}
    `;
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
"[project]/app/jobs/[id]/reference-asset-constants.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Shared job-level reference images (adId null) */ __turbopack_context__.s([
    "MAX_AD_REFERENCE_IMAGES",
    ()=>MAX_AD_REFERENCE_IMAGES,
    "MAX_JOB_SHARED_REFERENCE_IMAGES",
    ()=>MAX_JOB_SHARED_REFERENCE_IMAGES
]);
const MAX_JOB_SHARED_REFERENCE_IMAGES = 12;
const MAX_AD_REFERENCE_IMAGES = 12;
}),
"[project]/app/jobs/[id]/reference-asset-actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40080b6f9b38ff8e80ae0d33b3683983013fa75342":"deleteReferenceAsset","4045a879dc16ec07fffa6217e6898545bebb4c410b":"appendAdReferenceImages","40ecd3d46559d15a5378ce247f5587dccf4fc7eaf7":"appendJobSharedReferenceImages"},"",""] */ __turbopack_context__.s([
    "appendAdReferenceImages",
    ()=>appendAdReferenceImages,
    "appendJobSharedReferenceImages",
    ()=>appendJobSharedReferenceImages,
    "deleteReferenceAsset",
    ()=>deleteReferenceAsset
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$kie$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/kie.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$reference$2d$asset$2d$constants$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/jobs/[id]/reference-asset-constants.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
;
function collectUploadedFiles(formData, fieldName) {
    const raw = formData.getAll(fieldName);
    return raw.filter((item)=>!!item && typeof item.size === "number" && item.size > 0);
}
async function deleteReferenceAsset(formData) {
    const jobId = formData.get("jobId")?.toString();
    const refId = formData.get("referenceAssetId")?.toString();
    const adIdRaw = formData.get("adId")?.toString();
    if (!jobId || !refId) throw new Error("Missing jobId or referenceAssetId");
    const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.findFirst({
        where: adIdRaw && adIdRaw.trim().length > 0 ? {
            id: refId,
            jobId,
            adId: adIdRaw.trim()
        } : {
            id: refId,
            jobId,
            adId: null
        }
    });
    if (!existing) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
    }
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.delete({
        where: {
            id: refId
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
}
async function appendJobSharedReferenceImages(formData) {
    const jobId = formData.get("jobId")?.toString();
    if (!jobId) throw new Error("Missing jobId");
    const files = collectUploadedFiles(formData, "referenceFiles");
    if (files.length === 0) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
    }
    const existingCount = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.count({
        where: {
            jobId,
            adId: null
        }
    });
    const room = Math.max(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$reference$2d$asset$2d$constants$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MAX_JOB_SHARED_REFERENCE_IMAGES"] - existingCount);
    if (room === 0) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
    }
    const slice = files.slice(0, room);
    const uploaded = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$kie$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["uploadReferenceFilesToKie"])(slice);
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.createMany({
        data: uploaded.map((file)=>({
                jobId,
                adId: null,
                filePath: file.filePath,
                originalName: file.originalName,
                mimeType: file.mimeType
            }))
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
}
async function appendAdReferenceImages(formData) {
    const jobId = formData.get("jobId")?.toString();
    const adId = formData.get("adId")?.toString();
    if (!jobId || !adId) throw new Error("Missing jobId or adId");
    const files = collectUploadedFiles(formData, "referenceFiles");
    if (files.length === 0) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
    }
    const existingCount = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.count({
        where: {
            jobId,
            adId
        }
    });
    const room = Math.max(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$reference$2d$asset$2d$constants$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MAX_AD_REFERENCE_IMAGES"] - existingCount);
    if (room === 0) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
    }
    const slice = files.slice(0, room);
    const uploaded = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$kie$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["uploadReferenceFilesToKie"])(slice);
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.createMany({
        data: uploaded.map((file)=>({
                jobId,
                adId,
                filePath: file.filePath,
                originalName: file.originalName,
                mimeType: file.mimeType
            }))
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    deleteReferenceAsset,
    appendJobSharedReferenceImages,
    appendAdReferenceImages
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteReferenceAsset, "40080b6f9b38ff8e80ae0d33b3683983013fa75342", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(appendJobSharedReferenceImages, "40ecd3d46559d15a5378ce247f5587dccf4fc7eaf7", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(appendAdReferenceImages, "4045a879dc16ec07fffa6217e6898545bebb4c410b", null);
}),
"[project]/app/jobs/[id]/reference-image-chip.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ReferenceImageChip",
    ()=>ReferenceImageChip
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$reference$2d$asset$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/jobs/[id]/reference-asset-actions.ts [app-rsc] (ecmascript)");
;
;
function ReferenceImageChip({ asset, jobId, adId }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: "relative",
            width: 96,
            height: 96,
            borderRadius: 12,
            border: "1px solid var(--border)",
            overflow: "hidden",
            background: "var(--surfaceElevated)",
            flexShrink: 0
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: asset.filePath,
                alt: asset.originalName || "Reference",
                title: asset.originalName || "",
                style: {
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block"
                }
            }, void 0, false, {
                fileName: "[project]/app/jobs/[id]/reference-image-chip.tsx",
                lineNumber: 32,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                action: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$reference$2d$asset$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteReferenceAsset"],
                style: {
                    position: "absolute",
                    top: 4,
                    right: 4,
                    margin: 0
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "hidden",
                        name: "jobId",
                        value: jobId
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/reference-image-chip.tsx",
                        lineNumber: 52,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "hidden",
                        name: "referenceAssetId",
                        value: asset.id
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/reference-image-chip.tsx",
                        lineNumber: 53,
                        columnNumber: 17
                    }, this),
                    adId ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "hidden",
                        name: "adId",
                        value: adId
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/reference-image-chip.tsx",
                        lineNumber: 54,
                        columnNumber: 25
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "submit",
                        "aria-label": "Remove reference image",
                        title: "Remove",
                        style: {
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            border: "1px solid rgba(0,0,0,0.35)",
                            background: "rgba(0,0,0,0.65)",
                            color: "#fff",
                            fontSize: 16,
                            lineHeight: 1,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0,
                            fontWeight: 700
                        },
                        children: "×"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/reference-image-chip.tsx",
                        lineNumber: 55,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/reference-image-chip.tsx",
                lineNumber: 43,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/jobs/[id]/reference-image-chip.tsx",
        lineNumber: 20,
        columnNumber: 9
    }, this);
}
}),
"[project]/app/jobs/[id]/ad-variation-panel.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdVariationPanel",
    ()=>AdVariationPanel
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const AdVariationPanel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AdVariationPanel() from the server but AdVariationPanel is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/jobs/[id]/ad-variation-panel.tsx <module evaluation>", "AdVariationPanel");
}),
"[project]/app/jobs/[id]/ad-variation-panel.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdVariationPanel",
    ()=>AdVariationPanel
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const AdVariationPanel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AdVariationPanel() from the server but AdVariationPanel is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/jobs/[id]/ad-variation-panel.tsx", "AdVariationPanel");
}),
"[project]/app/jobs/[id]/ad-variation-panel.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$ad$2d$variation$2d$panel$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/app/jobs/[id]/ad-variation-panel.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$ad$2d$variation$2d$panel$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/app/jobs/[id]/ad-variation-panel.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$ad$2d$variation$2d$panel$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdCollapsibleHeaderActions",
    ()=>AdCollapsibleHeaderActions
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const AdCollapsibleHeaderActions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AdCollapsibleHeaderActions() from the server but AdCollapsibleHeaderActions is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx <module evaluation>", "AdCollapsibleHeaderActions");
}),
"[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdCollapsibleHeaderActions",
    ()=>AdCollapsibleHeaderActions
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const AdCollapsibleHeaderActions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AdCollapsibleHeaderActions() from the server but AdCollapsibleHeaderActions is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx", "AdCollapsibleHeaderActions");
}),
"[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$ad$2d$collapsible$2d$header$2d$actions$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$ad$2d$collapsible$2d$header$2d$actions$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$ad$2d$collapsible$2d$header$2d$actions$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
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
"[project]/src/lib/donationWizard.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "composeBackstoryFromPageEval",
    ()=>composeBackstoryFromPageEval,
    "getDonationWizardSnapshot",
    ()=>getDonationWizardSnapshot,
    "mergeDonationWizardSnapshotIntoClaudeOutput",
    ()=>mergeDonationWizardSnapshotIntoClaudeOutput,
    "persistDonationPageEvalAndAutoStoryEval",
    ()=>persistDonationPageEvalAndAutoStoryEval,
    "resolveDonationEvaluations",
    ()=>resolveDonationEvaluations
]);
/**
 * Donation URL wizard helpers — donation-only, shared by create + job retry actions.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$anthropic$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/anthropic.ts [app-rsc] (ecmascript)");
;
;
function tryParseJsonLocal(value) {
    if (!value?.trim()) return null;
    try {
        return JSON.parse(value);
    } catch  {
        return null;
    }
}
function getDonationWizardSnapshot(claudeOutput) {
    if (!claudeOutput?.trim()) return null;
    try {
        const root = JSON.parse(claudeOutput);
        if (!root || typeof root !== "object" || Array.isArray(root)) return null;
        const snap = root.donationWizardSnapshot;
        if (!snap || typeof snap !== "object" || Array.isArray(snap)) return null;
        return snap;
    } catch  {
        return null;
    }
}
function mergeDonationWizardSnapshotIntoClaudeOutput(existingClaudeOutput, patch) {
    let root = {};
    if (existingClaudeOutput?.trim()) {
        try {
            const parsed = JSON.parse(existingClaudeOutput);
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                root = parsed;
            } else {
                root = {
                    previousClaudeOutput: existingClaudeOutput
                };
            }
        } catch  {
            root = {
                previousClaudeOutput: existingClaudeOutput
            };
        }
    }
    const prevSnap = root.donationWizardSnapshot && typeof root.donationWizardSnapshot === "object" && !Array.isArray(root.donationWizardSnapshot) ? root.donationWizardSnapshot : {};
    const merged = {
        ...prevSnap
    };
    for (const [key, val] of Object.entries(patch)){
        if (val === null) {
            delete merged[key];
        } else {
            merged[key] = val;
        }
    }
    merged.v = 1;
    merged.updatedAt = new Date().toISOString();
    root.donationWizardSnapshot = merged;
    return JSON.stringify(root, null, 2);
}
function asObject(val) {
    if (val && typeof val === "object" && !Array.isArray(val)) {
        return val;
    }
    return {};
}
function resolveDonationEvaluations(job) {
    const snap = getDonationWizardSnapshot(job.claudeOutput);
    const pageCol = asObject(tryParseJsonLocal(job.donationPageEvaluation));
    const storyCol = asObject(tryParseJsonLocal(job.donationBackstoryEvaluation));
    const refCol = asObject(tryParseJsonLocal(job.donationReferenceEvaluation));
    const pageSnap = asObject(snap?.pageEvaluation);
    const storySnap = asObject(snap?.storyEvaluation);
    const refSnap = asObject(snap?.referenceEvaluation);
    return {
        pageEvaluation: Object.keys(pageCol).length ? pageCol : pageSnap,
        backstoryEvaluation: Object.keys(storyCol).length ? storyCol : storySnap,
        referenceEvaluation: Object.keys(refCol).length ? refCol : refSnap
    };
}
function composeBackstoryFromPageEval(pageEval, rawTextFallback) {
    const p = pageEval || {};
    const draft = String(p.draftBackstory || "").trim();
    if (draft.length >= 50) return draft.slice(0, 8000);
    const what = String(p.whatHappened || "").trim();
    const why = String(p.whyFundingIsNeeded || "").trim();
    let combined = [
        draft,
        what && `What happened: ${what}`,
        why && `Why help is needed: ${why}`
    ].filter(Boolean).join("\n\n").trim();
    if (combined.length >= 40) return combined.slice(0, 8000);
    const raw = String(rawTextFallback || "").replace(/\s+/g, " ").trim();
    if (raw.length > 250) {
        return raw.slice(0, 6000);
    }
    return combined.slice(0, 8000);
}
async function persistDonationPageEvalAndAutoStoryEval(options) {
    const { jobId, pageEval, rawText, filterJobData, jobRow } = options;
    const prev = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.findUnique({
        where: {
            id: jobId
        },
        select: {
            claudeOutput: true
        }
    });
    const backstoryText = composeBackstoryFromPageEval(pageEval, rawText);
    const subjectFromPage = String(pageEval.subjectName || "").trim();
    const urgencyFromPage = String(pageEval.urgencyLevel || "").trim();
    const snapshotBase = mergeDonationWizardSnapshotIntoClaudeOutput(prev?.claudeOutput, {
        pageEvaluation: pageEval,
        backstorySummary: backstoryText
    });
    const baseUpdate = {
        rawText,
        donationPageEvaluation: JSON.stringify(pageEval),
        backstory_summary: backstoryText || undefined,
        status: "donation_page_evaluated",
        claudeOutput: snapshotBase
    };
    if (subjectFromPage) baseUpdate.subject_name = subjectFromPage;
    if (urgencyFromPage) baseUpdate.urgency_level = urgencyFromPage;
    if (backstoryText.length < 20) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.update({
            where: {
                id: jobId
            },
            data: filterJobData(baseUpdate)
        });
        return;
    }
    try {
        const evalResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$anthropic$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["evaluateDonationBackstory"])({
            campaignType: jobRow.campaign_type || "FAMILY CRISIS",
            subjectName: subjectFromPage || jobRow.subject_name || "Fundraiser",
            urgencyLevel: urgencyFromPage || jobRow.urgency_level || "general",
            emotionalHook: jobRow.emotional_hook || undefined,
            backstorySummary: backstoryText
        });
        const snapshotFull = mergeDonationWizardSnapshotIntoClaudeOutput(snapshotBase, {
            pageEvaluation: pageEval,
            backstorySummary: backstoryText,
            storyEvaluation: evalResult
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.update({
            where: {
                id: jobId
            },
            data: filterJobData({
                ...baseUpdate,
                claudeOutput: snapshotFull,
                donationBackstoryEvaluation: JSON.stringify(evalResult),
                physical_description: backstoryText,
                injury_or_medical_details: backstoryText,
                status: "donation_story_evaluated"
            })
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const snapshotErr = mergeDonationWizardSnapshotIntoClaudeOutput(snapshotBase, {
            pageEvaluation: pageEval,
            backstorySummary: backstoryText,
            storyEvaluationError: message
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.update({
            where: {
                id: jobId
            },
            data: filterJobData({
                ...baseUpdate,
                claudeOutput: snapshotErr
            })
        });
    }
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
"[project]/app/components/CopyToClipboardButton.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/app/components/CopyToClipboardButton.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/components/CopyToClipboardButton.tsx <module evaluation>", "default");
}),
"[project]/app/components/CopyToClipboardButton.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/app/components/CopyToClipboardButton.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/components/CopyToClipboardButton.tsx", "default");
}),
"[project]/app/components/CopyToClipboardButton.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CopyToClipboardButton$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/app/components/CopyToClipboardButton.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CopyToClipboardButton$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/app/components/CopyToClipboardButton.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CopyToClipboardButton$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/app/components/SaveImageButton.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/app/components/SaveImageButton.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/components/SaveImageButton.tsx <module evaluation>", "default");
}),
"[project]/app/components/SaveImageButton.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/app/components/SaveImageButton.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/components/SaveImageButton.tsx", "default");
}),
"[project]/app/components/SaveImageButton.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$SaveImageButton$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/app/components/SaveImageButton.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$SaveImageButton$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/app/components/SaveImageButton.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$SaveImageButton$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
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
    "$$RSC_SERVER_ACTION_7",
    ()=>$$RSC_SERVER_ACTION_7,
    "$$RSC_SERVER_ACTION_8",
    ()=>$$RSC_SERVER_ACTION_8,
    "default",
    ()=>JobDetailPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"4015356bb4c7e8e9605883f2f41f10786716822ed8":"$$RSC_SERVER_ACTION_4","40163adf6e526e8b5daf9df8dfd98135b45720999b":"$$RSC_SERVER_ACTION_0","4017e7700eafc8c40397f642ec8db7fbc5d8bf413b":"$$RSC_SERVER_ACTION_3","4057a32e8da1e760f6aeaf883bb16e83c894436d98":"$$RSC_SERVER_ACTION_5","4082dbf34e83d757ef3b4effcdddd122ce322f336f":"$$RSC_SERVER_ACTION_6","4092b1f82a50c1db8f6ad329ce3a5c2944d43eb06a":"$$RSC_SERVER_ACTION_7","409c6a162f9158ed6065f6525d94907e9423fa046a":"$$RSC_SERVER_ACTION_8","40ae0eedb2783eb623d89ce87f72ca5fbf7344c59f":"$$RSC_SERVER_ACTION_1","40e7df428217a28d413bdcaba894785ade6e877651":"$$RSC_SERVER_ACTION_2"},"",""] */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$kie$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/kie.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$anthropic$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/anthropic.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$klingReady$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/klingReady.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/creativeBrain.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claudeAds$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/claudeAds.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobFundraiserBatchHistory$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobFundraiserBatchHistory.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$swipeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/swipeBrain.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$reference$2d$asset$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/jobs/[id]/reference-asset-actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$reference$2d$asset$2d$constants$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/jobs/[id]/reference-asset-constants.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$reference$2d$image$2d$chip$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/jobs/[id]/reference-image-chip.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$ad$2d$variation$2d$panel$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/jobs/[id]/ad-variation-panel.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$ad$2d$collapsible$2d$header$2d$actions$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scrape$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/scrape.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$donationWizard$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/donationWizard.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claude$2f$parseClaudeJson$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/claude/parseClaudeJson.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CopyToClipboardButton$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/CopyToClipboardButton.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$SaveImageButton$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/SaveImageButton.tsx [app-rsc] (ecmascript)");
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
function formatDonationEvalBlock(obj) {
    if (obj == null) return "";
    if (typeof obj === "string") return obj.trim();
    try {
        return JSON.stringify(obj, null, 2);
    } catch  {
        return String(obj);
    }
}
function filterJobDataByRuntimeFields(data) {
    try {
        const fields = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"]?._runtimeDataModel?.models?.Job?.fields;
        if (!Array.isArray(fields)) return data;
        const allowed = new Set(fields.map((f)=>f && typeof f.name === "string" ? f.name : "").filter(Boolean));
        return Object.fromEntries(Object.entries(data).filter(([k])=>allowed.has(k)));
    } catch  {
        return data;
    }
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
const // --- Donation step actions (donation-only) ---
$$RSC_SERVER_ACTION_0 = async function analyzeDonationFundraiser(formData) {
    const jobId = formData.get("jobId")?.toString();
    if (!jobId) throw new Error("Missing jobId");
    const job = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.findUnique({
        where: {
            id: jobId
        }
    });
    if (!job) throw new Error("Job not found");
    if (job.campaignType !== "donation") (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
    try {
        const scraped = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scrape$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["scrapeUrlToHtml"])(job.url);
        const rawText = stripHtml(scraped.html || "").slice(0, 16000);
        const pageEval = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$anthropic$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["evaluateDonationPageFromScrape"])({
            fundraiserUrl: job.url,
            scrapedText: rawText
        });
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$donationWizard$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["persistDonationPageEvalAndAutoStoryEval"])({
            jobId,
            pageEval: pageEval,
            rawText,
            filterJobData: filterJobDataByRuntimeFields,
            jobRow: {
                campaign_type: job.campaign_type,
                subject_name: job.subject_name,
                urgency_level: job.urgency_level,
                emotional_hook: job.emotional_hook
            }
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const fallbackEval = {
            subjectName: "Fundraiser",
            whatHappened: "Unable to auto-extract from URL. Please provide backstory manually.",
            whyFundingIsNeeded: "User-provided details required.",
            urgencyLevel: "general",
            keyEmotionalHooks: [
                "Human impact",
                "Urgent support needed",
                "Direct call for help"
            ],
            usefulPhrases: [
                "Help now",
                "Support this fundraiser"
            ],
            draftBackstory: "",
            warning: "Automatic page analysis failed in retry. Continue with manual backstory."
        };
        const prevRow = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.findUnique({
            where: {
                id: jobId
            },
            select: {
                claudeOutput: true
            }
        });
        const mergedClaude = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$donationWizard$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mergeDonationWizardSnapshotIntoClaudeOutput"])(prevRow?.claudeOutput, {
            pageEvaluation: fallbackEval,
            backstorySummary: "",
            pageEvaluationRetryError: message
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.update({
            where: {
                id: jobId
            },
            data: filterJobDataByRuntimeFields({
                donationPageEvaluation: JSON.stringify(fallbackEval),
                status: "donation_page_evaluated",
                claudeOutput: mergedClaude
            })
        });
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_0, "40163adf6e526e8b5daf9df8dfd98135b45720999b", null);
var analyzeDonationFundraiser = $$RSC_SERVER_ACTION_0;
const $$RSC_SERVER_ACTION_1 = async function evaluateDonationStory(formData) {
    const jobId = formData.get("jobId")?.toString();
    const backstory = String(formData.get("backstory") || "").trim();
    if (!jobId) throw new Error("Missing jobId");
    if (!backstory) throw new Error("Backstory is required.");
    const job = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.findUnique({
        where: {
            id: jobId
        }
    });
    if (!job) throw new Error("Job not found");
    const evalResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$anthropic$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["evaluateDonationBackstory"])({
        campaignType: job.campaign_type || "FAMILY CRISIS",
        subjectName: job.subject_name || "Fundraiser",
        urgencyLevel: job.urgency_level || "general",
        emotionalHook: job.emotional_hook || undefined,
        backstorySummary: backstory
    });
    const prevOut = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.findUnique({
        where: {
            id: jobId
        },
        select: {
            claudeOutput: true
        }
    });
    const mergedClaude = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$donationWizard$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mergeDonationWizardSnapshotIntoClaudeOutput"])(prevOut?.claudeOutput, {
        storyEvaluation: evalResult,
        backstorySummary: backstory
    });
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.update({
        where: {
            id: jobId
        },
        data: filterJobDataByRuntimeFields({
            backstory_summary: backstory,
            physical_description: backstory,
            injury_or_medical_details: backstory,
            donationBackstoryEvaluation: JSON.stringify(evalResult),
            claudeOutput: mergedClaude,
            status: "donation_story_evaluated"
        })
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_1, "40ae0eedb2783eb623d89ce87f72ca5fbf7344c59f", null);
var evaluateDonationStory = $$RSC_SERVER_ACTION_1;
const $$RSC_SERVER_ACTION_2 = async function evaluateDonationImages(formData) {
    const jobId = formData.get("jobId")?.toString();
    if (!jobId) throw new Error("Missing jobId");
    const imageDescriptions = formData.getAll("reference_image_descriptions[]").map((v)=>String(v).trim());
    async function readClaudeOutput() {
        const row = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.findUnique({
            where: {
                id: jobId
            },
            select: {
                claudeOutput: true
            }
        });
        return row?.claudeOutput ?? null;
    }
    const refs = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.findMany({
        where: {
            jobId,
            adId: null
        },
        orderBy: {
            createdAt: "asc"
        },
        select: {
            filePath: true,
            originalName: true
        }
    });
    if (refs.length === 0) {
        const mergedClaude = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$donationWizard$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mergeDonationWizardSnapshotIntoClaudeOutput"])(await readClaudeOutput(), {
            referenceEvaluationError: "Add at least one reference image, then try Evaluate Images again."
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.update({
            where: {
                id: jobId
            },
            data: filterJobDataByRuntimeFields({
                claudeOutput: mergedClaude
            })
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
    }
    const referenceDescriptions = refs.map((r, idx)=>({
            index: idx,
            description: imageDescriptions[idx] || r.originalName || ""
        }));
    const job = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.findUnique({
        where: {
            id: jobId
        }
    });
    if (!job) throw new Error("Job not found");
    let evalResult;
    let evalOk = true;
    try {
        evalResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$anthropic$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["evaluateDonationReferences"])({
            campaignType: job.campaign_type || "FAMILY CRISIS",
            referenceDescriptions,
            referenceImageUrls: refs.map((r)=>r.filePath),
            physicalDescription: job.physical_description || job.backstory_summary || "",
            injuryOrMedicalDetails: job.injury_or_medical_details || job.backstory_summary || ""
        });
    } catch (claudeErr) {
        evalOk = false;
        const msg = claudeErr instanceof Error ? claudeErr.message : String(claudeErr);
        evalResult = {
            imagesSummary: "Reference image evaluation failed (see error).",
            error: msg
        };
    }
    const mergedClaude = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$donationWizard$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mergeDonationWizardSnapshotIntoClaudeOutput"])(await readClaudeOutput(), evalOk ? {
        referenceEvaluation: evalResult,
        referenceEvaluationError: null,
        referenceEvaluationApiFailed: null
    } : {
        referenceEvaluation: evalResult,
        referenceEvaluationApiFailed: true
    });
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.update({
        where: {
            id: jobId
        },
        data: filterJobDataByRuntimeFields({
            donationReferenceEvaluation: JSON.stringify(evalResult),
            claudeOutput: mergedClaude,
            status: evalOk ? "donation_images_evaluated" : job.status
        })
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_2, "40e7df428217a28d413bdcaba894785ade6e877651", null);
var evaluateDonationImages = $$RSC_SERVER_ACTION_2;
const $$RSC_SERVER_ACTION_3 = async function goToDonationAdBuilder(formData) {
    const jobId = formData.get("jobId")?.toString();
    if (!jobId) throw new Error("Missing jobId");
    const job = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.findUnique({
        where: {
            id: jobId
        },
        select: {
            campaignType: true,
            claudeOutput: true,
            donationBackstoryEvaluation: true,
            donationReferenceEvaluation: true,
            donationPageEvaluation: true
        }
    });
    if (!job) throw new Error("Job not found");
    if (job.campaignType !== "donation") {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
    }
    const { backstoryEvaluation, referenceEvaluation } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$donationWizard$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveDonationEvaluations"])(job);
    if (Object.keys(backstoryEvaluation).length === 0 || Object.keys(referenceEvaluation).length === 0) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
    }
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.update({
        where: {
            id: jobId
        },
        data: {
            status: "donation_build"
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_3, "4017e7700eafc8c40397f642ec8db7fbc5d8bf413b", null);
var goToDonationAdBuilder = $$RSC_SERVER_ACTION_3;
const $$RSC_SERVER_ACTION_4 = async function generateFundraiserFiveAds(formData) {
    const jobId = formData.get("jobId")?.toString();
    if (!jobId) throw new Error("Missing jobId");
    const selectedReferenceIds = Array.from(new Set(formData.getAll("selectedReferenceIds").map((v)=>String(v).trim()).filter(Boolean)));
    const job = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.findUnique({
        where: {
            id: jobId
        }
    });
    if (!job) throw new Error("Job not found");
    if (job.campaignType !== "donation") (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
    const { pageEvaluation, backstoryEvaluation, referenceEvaluation } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$donationWizard$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveDonationEvaluations"])(job);
    if (Object.keys(backstoryEvaluation).length === 0 || Object.keys(referenceEvaluation).length === 0) {
        throw new Error("Run donation evaluation first.");
    }
    const jobSharedRefsAll = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.findMany({
        where: {
            jobId,
            adId: null
        },
        orderBy: {
            createdAt: "asc"
        },
        select: {
            id: true,
            filePath: true,
            originalName: true,
            mimeType: true
        }
    });
    const jobSharedRefs = selectedReferenceIds.length > 0 ? jobSharedRefsAll.filter((ref)=>selectedReferenceIds.includes(String(ref.id))) : jobSharedRefsAll;
    const referenceImageUrls = jobSharedRefs.map((r)=>r.filePath).filter(Boolean);
    const rnd = Math.random;
    const brainRow = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getFundraiserCreativeBrain"])() ?? {
        previousWinningPrompts: "",
        anglesList: "",
        additionalInfo: ""
    };
    const swipeCtx = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$swipeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDonationSwipeBatchContext"])();
    const varKeyPool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveVarKeyPoolFromAdditionalInfo"])(brainRow.additionalInfo);
    const plans = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["planFundraiserBatchOfFive"])(brainRow.anglesList, rnd, {
        varKeyPool
    });
    const winningSeeds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["pickRandomWinningPromptSeeds"])(brainRow.previousWinningPrompts, 5, rnd, swipeCtx.seedLines);
    const brainStaticPreamble = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["buildBrainStaticPreamble"])(brainRow);
    const slots = plans.map((p, i)=>({
            slotIndex: p.slotIndex,
            styleTemplateId: p.styleTemplateId,
            templateLabel: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["donationStyleTemplateLabel"])(p.styleTemplateId),
            selectedAngle: p.angleLine,
            keyedBrainInstructions: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["buildBrainKeyedInstructions"])(brainRow, p.activeBrainKeys),
            winningPromptSeed: winningSeeds[i] || undefined
        }));
    const planForHistory = plans.map((p, i)=>({
            slotIndex: p.slotIndex,
            styleTemplateId: p.styleTemplateId,
            templateLabel: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["donationStyleTemplateLabel"])(p.styleTemplateId),
            angleLine: p.angleLine,
            varKeys: [
                ...p.varKeys
            ],
            winningPromptSeed: winningSeeds[i] || undefined
        }));
    const existingBatchHistory = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobFundraiserBatchHistory$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readJobFundraiserBatchHistory"])(jobId);
    const priorBatchesSummary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatBatchHistoryForPrompt"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseFundraiserBatchHistory"])(existingBatchHistory));
    const platforms = String(job.platform || "").split(",").map((s)=>s.trim()).filter(Boolean);
    const adJson = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$anthropic$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generateDonationFundraiserBatchFive"])({
        campaignType: job.campaign_type || "",
        subjectName: job.subject_name || "",
        subjectType: job.subject_type || "",
        speciesBreedAge: job.species_breed_age || "",
        physicalDescription: job.physical_description || "",
        injuryOrMedicalDetails: job.injury_or_medical_details || "",
        backstorySummary: job.backstory_summary || "",
        urgencyLevel: job.urgency_level || "",
        fundraiserGoalAmount: job.fundraiser_goal_amount || undefined,
        emotionalHook: job.emotional_hook || undefined,
        companionOrFamilyDetail: job.companion_or_family_detail || undefined,
        beforeDetail: job.before_detail || undefined,
        platforms: platforms.length ? platforms.join(", ") : job.platform || "",
        pageEvaluation,
        backstoryEvaluation,
        referenceEvaluation,
        referenceImageUrls,
        brainStaticPreamble,
        swipeBankSection: swipeCtx.formattedSection || undefined,
        priorBatchesSummary,
        slots
    });
    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claude$2f$parseClaudeJson$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseValidateAndNormalizeClaudeAds"])(JSON.stringify(adJson), 5);
    if (!parsed.ok || parsed.ads.length !== 5) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.update({
            where: {
                id: jobId
            },
            data: {
                status: "donation_ad_error",
                claudeOutput: JSON.stringify({
                    error: parsed.ok ? `Expected 5 ads, got ${parsed.ads.length}` : parsed.diagnostics.error
                }, null, 2)
            }
        });
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
    let nextAdNumber = (maxAdNumber?.adNumber ?? 0) + 1;
    const createdIds = [];
    for(let i = 0; i < 5; i++){
        const num = nextAdNumber++;
        const ad = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.create({
            data: {
                jobId,
                adNumber: num,
                title: `Ad ${num}`,
                sourceBlock: JSON.stringify(parsed.ads[i], null, 2),
                editedPrompt: String(parsed.ads[i].visualPrompt || "").trim(),
                status: "ready"
            }
        });
        createdIds.push(ad.id);
    }
    if (jobSharedRefs.length > 0) {
        for (const adId of createdIds){
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.createMany({
                data: jobSharedRefs.map((ref)=>({
                        jobId,
                        adId,
                        filePath: ref.filePath,
                        originalName: ref.originalName,
                        mimeType: ref.mimeType
                    }))
            });
        }
    }
    const summaryAds = parsed.ads.map((a, i)=>({
            hook: typeof a.hook === "string" ? a.hook : undefined,
            angle: typeof a.angle === "string" ? a.angle : undefined,
            templateId: plans[i]?.styleTemplateId
        }));
    const nextHistory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["appendFundraiserBatchHistory"])(existingBatchHistory, summaryAds, planForHistory);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobFundraiserBatchHistory$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["writeJobFundraiserBatchHistory"])(jobId, nextHistory);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_4, "4015356bb4c7e8e9605883f2f41f10786716822ed8", null);
var generateFundraiserFiveAds = $$RSC_SERVER_ACTION_4;
const FRESH_BATCH_QUERY_KEY = "freshBatch";
const FRESH_BATCH_PARTIAL_QUERY_KEY = "freshBatchPartial";
const FRESH_BATCH_ERROR_QUERY_KEY = "freshBatchError";
const $$RSC_SERVER_ACTION_5 = async function generateFundraiserFiveAdsFreshAngles(formData) {
    const jobId = formData.get("jobId")?.toString();
    if (!jobId) throw new Error("Missing jobId");
    const job = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.findUnique({
        where: {
            id: jobId
        }
    });
    if (!job) throw new Error("Job not found");
    if (job.campaignType !== "donation") (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
    const { pageEvaluation, backstoryEvaluation, referenceEvaluation } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$donationWizard$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveDonationEvaluations"])(job);
    if (Object.keys(backstoryEvaluation).length === 0 || Object.keys(referenceEvaluation).length === 0) {
        throw new Error("Run donation evaluation first.");
    }
    const jobSharedRefsAll = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.findMany({
        where: {
            jobId,
            adId: null
        },
        orderBy: {
            createdAt: "asc"
        },
        select: {
            id: true,
            filePath: true,
            originalName: true,
            mimeType: true
        }
    });
    const jobSharedRefs = jobSharedRefsAll;
    const referenceImageUrls = jobSharedRefs.map((r)=>r.filePath).filter(Boolean);
    const rnd = Math.random;
    const brainRow = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getFundraiserCreativeBrain"])() ?? {
        previousWinningPrompts: "",
        anglesList: "",
        additionalInfo: ""
    };
    const memoryAngles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseAnglesList"])(brainRow.anglesList);
    if (memoryAngles.length === 0) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}?${new URLSearchParams({
            [FRESH_BATCH_ERROR_QUERY_KEY]: "noAngles"
        }).toString()}`);
    }
    const existingBatchHistory = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobFundraiserBatchHistory$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readJobFundraiserBatchHistory"])(jobId);
    const histParsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseFundraiserBatchHistory"])(existingBatchHistory);
    const usedKeys = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collectUsedAngleMemoryKeys"])(histParsed, memoryAngles);
    const remainingAngles = memoryAngles.filter((m)=>!usedKeys.has((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeAngleLine"])(m)));
    if (remainingAngles.length === 0) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}?${new URLSearchParams({
            [FRESH_BATCH_ERROR_QUERY_KEY]: "exhausted"
        }).toString()}`);
    }
    const slotCount = Math.min(5, remainingAngles.length);
    const swipeCtx = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$swipeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDonationSwipeBatchContext"])();
    const varKeyPool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveVarKeyPoolFromAdditionalInfo"])(brainRow.additionalInfo);
    const plans = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["planFundraiserBatchFreshAngles"])(brainRow.anglesList, usedKeys, rnd, {
        varKeyPool
    });
    if (plans.length !== slotCount || plans.length === 0) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}?${new URLSearchParams({
            [FRESH_BATCH_ERROR_QUERY_KEY]: "plan"
        }).toString()}`);
    }
    const winningSeeds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["pickRandomWinningPromptSeeds"])(brainRow.previousWinningPrompts, slotCount, rnd, swipeCtx.seedLines);
    const brainStaticPreamble = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["buildBrainStaticPreamble"])(brainRow);
    const slots = plans.map((p, i)=>({
            slotIndex: p.slotIndex,
            styleTemplateId: p.styleTemplateId,
            templateLabel: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["donationStyleTemplateLabel"])(p.styleTemplateId),
            selectedAngle: p.angleLine,
            keyedBrainInstructions: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["buildBrainKeyedInstructions"])(brainRow, p.activeBrainKeys),
            winningPromptSeed: winningSeeds[i] || undefined
        }));
    const planForHistory = plans.map((p, i)=>({
            slotIndex: p.slotIndex,
            styleTemplateId: p.styleTemplateId,
            templateLabel: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["donationStyleTemplateLabel"])(p.styleTemplateId),
            angleLine: p.angleLine,
            varKeys: [
                ...p.varKeys
            ],
            winningPromptSeed: winningSeeds[i] || undefined
        }));
    const priorBatchesSummary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatBatchHistoryForPrompt"])(histParsed);
    const platforms = String(job.platform || "").split(",").map((s)=>s.trim()).filter(Boolean);
    const adJson = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$anthropic$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generateDonationFundraiserBatchFive"])({
        campaignType: job.campaign_type || "",
        subjectName: job.subject_name || "",
        subjectType: job.subject_type || "",
        speciesBreedAge: job.species_breed_age || "",
        physicalDescription: job.physical_description || "",
        injuryOrMedicalDetails: job.injury_or_medical_details || "",
        backstorySummary: job.backstory_summary || "",
        urgencyLevel: job.urgency_level || "",
        fundraiserGoalAmount: job.fundraiser_goal_amount || undefined,
        emotionalHook: job.emotional_hook || undefined,
        companionOrFamilyDetail: job.companion_or_family_detail || undefined,
        beforeDetail: job.before_detail || undefined,
        platforms: platforms.length ? platforms.join(", ") : job.platform || "",
        pageEvaluation,
        backstoryEvaluation,
        referenceEvaluation,
        referenceImageUrls,
        brainStaticPreamble,
        swipeBankSection: swipeCtx.formattedSection || undefined,
        priorBatchesSummary,
        slots
    });
    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claude$2f$parseClaudeJson$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseValidateAndNormalizeClaudeAds"])(JSON.stringify(adJson), slotCount);
    if (!parsed.ok || parsed.ads.length !== slotCount) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.update({
            where: {
                id: jobId
            },
            data: {
                status: "donation_ad_error",
                claudeOutput: JSON.stringify({
                    error: parsed.ok ? `Expected ${slotCount} ads, got ${parsed.ads.length}` : parsed.diagnostics.error
                }, null, 2)
            }
        });
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
    let nextAdNumber = (maxAdNumber?.adNumber ?? 0) + 1;
    const createdIds = [];
    for(let i = 0; i < slotCount; i++){
        const num = nextAdNumber++;
        const ad = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.create({
            data: {
                jobId,
                adNumber: num,
                title: `Ad ${num}`,
                sourceBlock: JSON.stringify(parsed.ads[i], null, 2),
                editedPrompt: String(parsed.ads[i].visualPrompt || "").trim(),
                status: "ready"
            }
        });
        createdIds.push(ad.id);
    }
    if (jobSharedRefs.length > 0) {
        for (const adId of createdIds){
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.createMany({
                data: jobSharedRefs.map((ref)=>({
                        jobId,
                        adId,
                        filePath: ref.filePath,
                        originalName: ref.originalName,
                        mimeType: ref.mimeType
                    }))
            });
        }
    }
    const summaryAds = parsed.ads.map((a, i)=>({
            hook: typeof a.hook === "string" ? a.hook : undefined,
            angle: typeof a.angle === "string" ? a.angle : undefined,
            templateId: plans[i]?.styleTemplateId
        }));
    const nextHistory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["appendFundraiserBatchHistory"])(existingBatchHistory, summaryAds, planForHistory);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobFundraiserBatchHistory$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["writeJobFundraiserBatchHistory"])(jobId, nextHistory);
    const remainingAfter = remainingAngles.length - slotCount;
    const qs = new URLSearchParams();
    if (remainingAfter <= 0) {
        qs.set(FRESH_BATCH_QUERY_KEY, "last");
        if (slotCount < 5) qs.set(FRESH_BATCH_PARTIAL_QUERY_KEY, "1");
    } else {
        qs.set(FRESH_BATCH_QUERY_KEY, "ok");
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}?${qs.toString()}`);
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_5, "4057a32e8da1e760f6aeaf883bb16e83c894436d98", null);
var generateFundraiserFiveAdsFreshAngles = $$RSC_SERVER_ACTION_5;
const VARIATION_ERROR_QUERY_KEY = "variationError";
const VARIATION_ERROR_MAX_LEN = 2000;
function redirectWithVariationError(jobId, message) {
    const safe = message.replace(/\s+/g, " ").trim().slice(0, VARIATION_ERROR_MAX_LEN);
    const qs = new URLSearchParams({
        [VARIATION_ERROR_QUERY_KEY]: safe
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}?${qs.toString()}`);
}
const // --- Ad editing stage ---
$$RSC_SERVER_ACTION_6 = async function saveAdPromptAndReferences(formData) {
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
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_6, "4082dbf34e83d757ef3b4effcdddd122ce322f336f", null);
var saveAdPromptAndReferences = $$RSC_SERVER_ACTION_6;
const $$RSC_SERVER_ACTION_7 = async function makeAdKlingReady(formData) {
    const jobId = formData.get("jobId")?.toString();
    const adId = formData.get("adId")?.toString();
    if (!jobId || !adId) throw new Error("Missing jobId or adId");
    const job = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.findUnique({
        where: {
            id: jobId
        }
    });
    if (!job) throw new Error("Job not found");
    if (job.campaignType !== "donation") (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
    const ad = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.findUnique({
        where: {
            id: adId
        }
    });
    if (!ad?.sourceBlock) throw new Error("Ad missing sourceBlock");
    const source = tryParseJson(ad.sourceBlock);
    if (!source || typeof source.hook !== "string" || typeof source.headline !== "string" || typeof source.primaryText !== "string" || typeof source.cta !== "string" || typeof source.visualPrompt !== "string") {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
    }
    const combined = (ad.editedPrompt || "").trim() || source.visualPrompt.trim();
    const staticVisual = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$klingReady$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extractStaticVisualFromAdPrompt"])(combined);
    if (!staticVisual) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
    const donationEvaluationsResolved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$donationWizard$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveDonationEvaluations"])(job);
    const brainRowKling = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getFundraiserCreativeBrain"])() ?? null;
    const fundraiserBrainPreambleKling = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["buildBrainStaticPreamble"])(brainRowKling) || undefined;
    const out = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$anthropic$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rewriteDonationVisualToKlingReady"])({
        staticVisualPrompt: staticVisual,
        hook: source.hook,
        headline: source.headline,
        primaryText: source.primaryText,
        cta: source.cta,
        campaignType: job.campaign_type || "",
        donationEvaluations: {
            pageEvaluation: donationEvaluationsResolved.pageEvaluation,
            backstoryEvaluation: donationEvaluationsResolved.backstoryEvaluation,
            referenceEvaluation: donationEvaluationsResolved.referenceEvaluation
        },
        fundraiserBrainPreamble: fundraiserBrainPreambleKling
    });
    const newVisual = (out.visualPrompt || "").trim();
    if (!newVisual || !newVisual.includes("KIE_IMAGE_PROMPT:") || !newVisual.includes("|| KLING_ANIMATION_PROMPT:")) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
    }
    const nextSource = {
        ...source,
        visualPrompt: newVisual,
        angle: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$klingReady$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["buildKlingAngleLabel"])(source.angle || "")
    };
    const kieOnly = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$klingReady$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extractKiePortionForImageGen"])(newVisual);
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.update({
        where: {
            id: adId
        },
        data: {
            sourceBlock: JSON.stringify(nextSource, null, 2),
            editedPrompt: kieOnly
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}`);
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_7, "4092b1f82a50c1db8f6ad329ce3a5c2944d43eb06a", null);
var makeAdKlingReady = $$RSC_SERVER_ACTION_7;
const // --- Image generation stage (per ad) ---
$$RSC_SERVER_ACTION_8 = async function generateAdImages(formData) {
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
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_8, "409c6a162f9158ed6065f6525d94907e9423fa046a", null);
var generateAdImages = $$RSC_SERVER_ACTION_8;
async function JobDetailPage({ params, searchParams }) {
    const { id } = await params;
    const sp = await searchParams ?? {};
    const variationErrRaw = sp[VARIATION_ERROR_QUERY_KEY];
    const variationErrorMessage = typeof variationErrRaw === "string" ? variationErrRaw : Array.isArray(variationErrRaw) ? variationErrRaw[0] ?? "" : "";
    const freshBatchRaw = sp[FRESH_BATCH_QUERY_KEY];
    const freshBatchStatus = typeof freshBatchRaw === "string" ? freshBatchRaw : Array.isArray(freshBatchRaw) ? freshBatchRaw[0] : undefined;
    const freshPartialRaw = sp[FRESH_BATCH_PARTIAL_QUERY_KEY];
    const freshBatchPartialFlag = typeof freshPartialRaw === "string" ? freshPartialRaw : Array.isArray(freshPartialRaw) ? freshPartialRaw[0] : undefined;
    const freshErrRaw = sp[FRESH_BATCH_ERROR_QUERY_KEY];
    const freshBatchError = typeof freshErrRaw === "string" ? freshErrRaw : Array.isArray(freshErrRaw) ? freshErrRaw[0] : undefined;
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
    if (job.campaignType !== "donation") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                padding: 24,
                maxWidth: 560
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    style: {
                        marginTop: 0
                    },
                    children: "Fundraiser-only workspace"
                }, void 0, false, {
                    fileName: "[project]/app/jobs/[id]/page.tsx",
                    lineNumber: 1142,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        opacity: 0.9,
                        lineHeight: 1.5
                    },
                    children: "This job is not a fundraiser campaign. Create a new fundraiser from the home page."
                }, void 0, false, {
                    fileName: "[project]/app/jobs/[id]/page.tsx",
                    lineNumber: 1143,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                    href: "/",
                    children: "Back to home"
                }, void 0, false, {
                    fileName: "[project]/app/jobs/[id]/page.tsx",
                    lineNumber: 1147,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/jobs/[id]/page.tsx",
            lineNumber: 1141,
            columnNumber: 13
        }, this);
    }
    const requestedCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claudeAds$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeRequestedAdCount"])(job.numberOfAds);
    const diagnostics = extractLatestClaudeDiagnostics(job.claudeOutput);
    const showReturnedNote = job.ads.length > 0 && diagnostics && typeof diagnostics.returnedAdCount === "number" && diagnostics.returnedAdCount !== requestedCount;
    const showErrorPanel = job.status === "error" && job.ads.length === 0;
    const fallbackError = typeof diagnostics?.error === "string" && diagnostics.error.trim() ? diagnostics.error : typeof job.claudeOutput === "string" && job.claudeOutput.trim() ? job.claudeOutput.trim().slice(0, 500) : "Try again.";
    const fallbackPreview = typeof diagnostics?.preview === "string" && diagnostics.preview.trim() ? diagnostics.preview : typeof job.claudeOutput === "string" && job.claudeOutput.trim() ? job.claudeOutput.trim().slice(0, 500) : "";
    const dwSnap = job.campaignType === "donation" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$donationWizard$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDonationWizardSnapshot"])(job.claudeOutput) : null;
    const resolvedDonation = job.campaignType === "donation" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$donationWizard$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveDonationEvaluations"])(job) : {
        pageEvaluation: {},
        backstoryEvaluation: {},
        referenceEvaluation: {}
    };
    const donationPageEval = resolvedDonation.pageEvaluation;
    const donationBackstoryEval = resolvedDonation.backstoryEvaluation;
    const donationReferenceEval = resolvedDonation.referenceEvaluation;
    const displayBackstoryText = job.campaignType === "donation" ? (job.backstory_summary || "").trim() || String(dwSnap?.backstorySummary || "").trim() : "";
    const displayPageEvalStr = job.campaignType === "donation" ? (job.donationPageEvaluation || "").trim() || formatDonationEvalBlock(donationPageEval) : "";
    const displayStoryEvalStr = job.campaignType === "donation" ? (job.donationBackstoryEvaluation || "").trim() || formatDonationEvalBlock(donationBackstoryEval) : "";
    const displayReferenceEvalStr = job.campaignType === "donation" ? (job.donationReferenceEvaluation || "").trim() || formatDonationEvalBlock(donationReferenceEval) : "";
    const fundraiserBatchHistRaw = job.campaignType === "donation" ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobFundraiserBatchHistory$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readJobFundraiserBatchHistory"])(job.id) : null;
    const fundraiserBatchHist = job.campaignType === "donation" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseFundraiserBatchHistory"])(fundraiserBatchHistRaw) : {
        batches: []
    };
    const lastAutoBatchPlan = fundraiserBatchHist.batches.length > 0 ? fundraiserBatchHist.batches[fundraiserBatchHist.batches.length - 1]?.plan : undefined;
    const fundraiserBrainForFresh = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getFundraiserCreativeBrain"])();
    const memAnglesForFresh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseAnglesList"])(fundraiserBrainForFresh?.anglesList ?? "");
    const usedAngleKeysForFresh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collectUsedAngleMemoryKeys"])(fundraiserBatchHist, memAnglesForFresh);
    const remainingFreshAngleCount = memAnglesForFresh.filter((m)=>!usedAngleKeysForFresh.has((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeAngleLine"])(m))).length;
    const donationSharedReferenceAssets = job.campaignType === "donation" ? job.referenceAssets.filter((ref)=>!ref.adId) : [];
    const isDonationBuildStep = job.campaignType === "donation" && job.status === "donation_build";
    const hasDonationPageEval = job.campaignType === "donation" && (!!(job.donationPageEvaluation || "").trim() || Object.keys(donationPageEval).length > 0 || [
        "donation_page_evaluated",
        "donation_story_evaluated",
        "donation_images_evaluated",
        "donation_build"
    ].includes(job.status || ""));
    const hasDonationStoryEval = job.campaignType === "donation" && (!!(job.donationBackstoryEvaluation || "").trim() || Object.keys(donationBackstoryEval).length > 0);
    const hasDonationImageEval = job.campaignType === "donation" && (!!(job.donationReferenceEvaluation || "").trim() || Object.keys(donationReferenceEval).length > 0);
    const hasUserUploadedDonationReferenceImages = job.campaignType === "donation" ? (job.referenceAssets || []).some((ref)=>!String(ref.originalName || "").startsWith("scraped-image-")) : false;
    const showDonationReferenceWarning = job.campaignType === "donation" && !hasUserUploadedDonationReferenceImages;
    const showDonationInjuryMinimalWarning = job.campaignType === "donation" && (job.injury_or_medical_details || "").trim().length < 30;
    const showDonationEmotionalHookInfo = job.campaignType === "donation" && !(job.emotional_hook || "").trim();
    const showFreshAnglesBatchCta = isDonationBuildStep && job.ads.length >= 5 && remainingFreshAngleCount > 0 && Object.keys(donationBackstoryEval).length > 0 && Object.keys(donationReferenceEval).length > 0;
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
                        lineNumber: 1309,
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
                        lineNumber: 1310,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/page.tsx",
                lineNumber: 1308,
                columnNumber: 13
            }, this),
            variationErrorMessage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 16,
                    padding: 14,
                    borderRadius: 14,
                    border: "1px solid #b91c1c",
                    background: "rgba(185, 28, 28, 0.08)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontWeight: 900,
                            marginBottom: 8,
                            color: "var(--warning, #b91c1c)"
                        },
                        children: "Variation generation failed"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1333,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: 13,
                            lineHeight: 1.5,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word"
                        },
                        children: variationErrorMessage
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1342,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        href: `/jobs/${id}`,
                        style: {
                            display: "inline-block",
                            marginTop: 12,
                            fontSize: 13,
                            fontWeight: 700,
                            color: "var(--accent)"
                        },
                        children: "Dismiss"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1352,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/page.tsx",
                lineNumber: 1324,
                columnNumber: 17
            }, this) : null,
            freshBatchStatus === "last" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 16,
                    padding: 14,
                    borderRadius: 14,
                    border: "1px solid rgba(124, 58, 237, 0.45)",
                    background: "rgba(124, 58, 237, 0.1)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontWeight: 900,
                            marginBottom: 8,
                            color: "var(--accent)"
                        },
                        children: "Last batch of fresh angles"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1377,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: 13,
                            lineHeight: 1.55,
                            opacity: 0.95
                        },
                        children: freshBatchPartialFlag === "1" ? "This was the final batch — fewer than 5 unused Memory angles remained, so we generated only the ads we could. All Memory angles for this campaign are now used." : "All Memory angles for this campaign are now used. You won’t see “Generate more fresh angles” below anymore."
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1386,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        href: `/jobs/${id}`,
                        style: {
                            display: "inline-block",
                            marginTop: 12,
                            fontSize: 13,
                            fontWeight: 700,
                            color: "var(--accent)"
                        },
                        children: "Dismiss"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1397,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/page.tsx",
                lineNumber: 1368,
                columnNumber: 17
            }, this) : null,
            freshBatchStatus === "ok" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 16,
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid var(--border)",
                    background: "var(--surfaceElevated)",
                    fontSize: 13
                },
                children: [
                    "Fresh-angle batch added.",
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        href: `/jobs/${id}`,
                        style: {
                            fontWeight: 700,
                            color: "var(--accent)"
                        },
                        children: "Dismiss"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1424,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/page.tsx",
                lineNumber: 1413,
                columnNumber: 17
            }, this) : null,
            freshBatchError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 16,
                    padding: 14,
                    borderRadius: 14,
                    border: "1px solid #b45309",
                    background: "rgba(180, 83, 9, 0.08)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontWeight: 900,
                            marginBottom: 8,
                            color: "#b45309"
                        },
                        children: "Fresh-angle batch unavailable"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1443,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: 13,
                            lineHeight: 1.5
                        },
                        children: freshBatchError === "noAngles" ? "Add lines to the angle list in Memory → Creative Brain first." : freshBatchError === "exhausted" ? "Every Memory angle has already been used in a batch on this job." : freshBatchError === "plan" ? "Could not build a fresh-angle plan. Try again or check Memory." : freshBatchError
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1452,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        href: `/jobs/${id}`,
                        style: {
                            display: "inline-block",
                            marginTop: 12,
                            fontSize: 13,
                            fontWeight: 700,
                            color: "var(--accent)"
                        },
                        children: "Dismiss"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1461,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/page.tsx",
                lineNumber: 1434,
                columnNumber: 17
            }, this) : null,
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
                                lineNumber: 1486,
                                columnNumber: 21
                            }, this),
                            " ",
                            job.url
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1485,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Campaign Type:"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1489,
                                columnNumber: 21
                            }, this),
                            " ",
                            job.campaignType
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1488,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Platform:"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1492,
                                columnNumber: 21
                            }, this),
                            " ",
                            job.platform || "Meta"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1491,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Funnel Stage:"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1495,
                                columnNumber: 21
                            }, this),
                            " ",
                            job.funnelStage || "Mix"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1494,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Requested Ads:"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1498,
                                columnNumber: 21
                            }, this),
                            " ",
                            job.numberOfAds || ""
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1497,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Status:"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1501,
                                columnNumber: 21
                            }, this),
                            " ",
                            job.status
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1500,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Total Ads:"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1504,
                                columnNumber: 21
                            }, this),
                            " ",
                            job.ads.length
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1503,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/page.tsx",
                lineNumber: 1476,
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
                        lineNumber: 1517,
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
                                lineNumber: 1530,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    opacity: 0.95
                                },
                                children: fallbackError
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1533,
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
                                        lineNumber: 1538,
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
                                        lineNumber: 1541,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 1537,
                                columnNumber: 29
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1520,
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
                        lineNumber: 1555,
                        columnNumber: 21
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 14
                        },
                        children: job.campaignType === "donation" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                marginTop: 16,
                                border: "1px solid var(--border)",
                                borderRadius: 16,
                                padding: 16,
                                background: "var(--surface)"
                            },
                            children: [
                                job.status === "donation_page_eval_error" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        marginBottom: 12,
                                        border: "1px solid var(--danger)",
                                        borderRadius: 12,
                                        padding: 10,
                                        background: "rgba(220,38,38,0.08)",
                                        color: "var(--foreground)",
                                        fontSize: 13,
                                        whiteSpace: "pre-wrap"
                                    },
                                    children: [
                                        "Could not analyze fundraiser page.",
                                        job.claudeOutput ? `\n\n${job.claudeOutput}` : ""
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                    lineNumber: 1582,
                                    columnNumber: 33
                                }, this) : null,
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    style: {
                                        margin: 0,
                                        marginBottom: 12
                                    },
                                    children: "Fundraiser: evaluate → create ads (1 or batch of 5)"
                                }, void 0, false, {
                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                    lineNumber: 1601,
                                    columnNumber: 29
                                }, this),
                                displayBackstoryText ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        marginBottom: 14,
                                        border: "1px solid var(--border)",
                                        borderRadius: 14,
                                        padding: 12,
                                        background: "var(--surfaceElevated)"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontWeight: 900,
                                                marginBottom: 8
                                            },
                                            children: "Backstory (from fundraiser page)"
                                        }, void 0, false, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 1615,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: 13,
                                                lineHeight: 1.5,
                                                whiteSpace: "pre-wrap",
                                                opacity: 0.92
                                            },
                                            children: displayBackstoryText
                                        }, void 0, false, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 1623,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                    lineNumber: 1606,
                                    columnNumber: 33
                                }, this) : null,
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: "grid",
                                        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)",
                                        gap: 12
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                border: "1px solid var(--border)",
                                                borderRadius: 14,
                                                padding: 12,
                                                background: "var(--surfaceElevated)"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontWeight: 900,
                                                        marginBottom: 8
                                                    },
                                                    children: "Page Evaluation"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 1652,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                                    style: {
                                                        margin: 0,
                                                        whiteSpace: "pre-wrap",
                                                        fontSize: 12,
                                                        lineHeight: 1.45,
                                                        opacity: 0.9
                                                    },
                                                    children: displayPageEvalStr.trim() ? displayPageEvalStr : hasDonationPageEval ? "Page step is marked done but no evaluation text was found. Try “Analyze Fundraiser” again, or run `npx prisma generate` if the DB schema is new." : "Not analyzed yet."
                                                }, void 0, false, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 1660,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 1644,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                border: "1px solid var(--border)",
                                                borderRadius: 14,
                                                padding: 12,
                                                background: "var(--surfaceElevated)"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontWeight: 900,
                                                        marginBottom: 8
                                                    },
                                                    children: "Backstory Evaluation"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 1685,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                                    style: {
                                                        margin: 0,
                                                        whiteSpace: "pre-wrap",
                                                        fontSize: 12,
                                                        lineHeight: 1.45,
                                                        opacity: 0.9
                                                    },
                                                    children: displayStoryEvalStr.trim() ? displayStoryEvalStr : dwSnap?.storyEvaluationError ? `Story evaluation did not complete:\n${String(dwSnap.storyEvaluationError)}\n\nUse “Evaluate Story” below.` : "Not evaluated yet."
                                                }, void 0, false, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 1693,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 1676,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                border: "1px solid var(--border)",
                                                borderRadius: 14,
                                                padding: 12,
                                                background: "var(--surfaceElevated)"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontWeight: 900,
                                                        marginBottom: 8
                                                    },
                                                    children: "Reference Image Evaluation"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 1719,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                                    style: {
                                                        margin: 0,
                                                        whiteSpace: "pre-wrap",
                                                        fontSize: 12,
                                                        lineHeight: 1.45,
                                                        opacity: 0.9
                                                    },
                                                    children: dwSnap?.referenceEvaluationError ? String(dwSnap.referenceEvaluationError) : displayReferenceEvalStr.trim() ? displayReferenceEvalStr : hasDonationImageEval ? "Image step is marked done but no evaluation text was found. Try “Evaluate Images” again." : "Not evaluated yet."
                                                }, void 0, false, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 1727,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 1710,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                    lineNumber: 1636,
                                    columnNumber: 29
                                }, this),
                                !hasDonationPageEval ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                    action: analyzeDonationFundraiser,
                                    style: {
                                        marginTop: 12
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "hidden",
                                            name: "jobId",
                                            value: job.id
                                        }, void 0, false, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 1749,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            style: {
                                                width: "100%",
                                                padding: "10px 14px",
                                                borderRadius: 12,
                                                border: "1px solid var(--borderStrong)",
                                                background: "var(--accent)",
                                                color: "#fff",
                                                cursor: "pointer"
                                            },
                                            children: "Analyze Fundraiser"
                                        }, void 0, false, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 1750,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                    lineNumber: 1748,
                                    columnNumber: 33
                                }, this) : null,
                                hasDonationPageEval && !hasDonationStoryEval ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                    action: evaluateDonationStory,
                                    style: {
                                        marginTop: 12
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "hidden",
                                            name: "jobId",
                                            value: job.id
                                        }, void 0, false, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 1769,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            style: {
                                                fontSize: 13,
                                                fontWeight: 800
                                            },
                                            children: "Backstory"
                                        }, void 0, false, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 1770,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: 12,
                                                opacity: 0.75,
                                                marginTop: 4
                                            },
                                            children: "Pulled from the fundraiser page where possible. Edit before evaluating if you need to correct details."
                                        }, void 0, false, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 1773,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                            name: "backstory",
                                            defaultValue: displayBackstoryText || job.backstory_summary || "",
                                            style: {
                                                width: "100%",
                                                minHeight: 120,
                                                marginTop: 8,
                                                padding: 10,
                                                borderRadius: 12,
                                                border: "1px solid var(--border)",
                                                background: "var(--surfaceElevated)",
                                                color: "var(--foreground)"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 1783,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            style: {
                                                marginTop: 10,
                                                width: "100%",
                                                padding: "10px 14px",
                                                borderRadius: 12,
                                                border: "1px solid var(--borderStrong)",
                                                background: "var(--accent)",
                                                color: "#fff",
                                                cursor: "pointer"
                                            },
                                            children: "Evaluate Story"
                                        }, void 0, false, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 1801,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                    lineNumber: 1768,
                                    columnNumber: 33
                                }, this) : null,
                                hasDonationStoryEval ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                    style: {
                                        marginTop: 12,
                                        border: "1px solid var(--border)",
                                        borderRadius: 12,
                                        padding: "8px 12px",
                                        background: "var(--surfaceElevated)"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                            style: {
                                                cursor: "pointer",
                                                fontWeight: 800,
                                                fontSize: 13
                                            },
                                            children: "Edit backstory & re-evaluate"
                                        }, void 0, false, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 1829,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                            action: evaluateDonationStory,
                                            style: {
                                                marginTop: 10
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "hidden",
                                                    name: "jobId",
                                                    value: job.id
                                                }, void 0, false, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 1842,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                    name: "backstory",
                                                    defaultValue: displayBackstoryText || job.backstory_summary || "",
                                                    style: {
                                                        width: "100%",
                                                        minHeight: 100,
                                                        marginTop: 4,
                                                        padding: 10,
                                                        borderRadius: 12,
                                                        border: "1px solid var(--border)",
                                                        background: "var(--surface)",
                                                        color: "var(--foreground)"
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 1843,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "submit",
                                                    style: {
                                                        marginTop: 8,
                                                        padding: "8px 12px",
                                                        borderRadius: 10,
                                                        border: "1px solid var(--borderStrong)",
                                                        background: "var(--accent)",
                                                        color: "#fff",
                                                        cursor: "pointer",
                                                        fontSize: 13
                                                    },
                                                    children: "Re-evaluate story"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 1861,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 1838,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                    lineNumber: 1820,
                                    columnNumber: 33
                                }, this) : null,
                                hasDonationStoryEval && !hasDonationImageEval ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        marginTop: 12
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: 13,
                                                fontWeight: 800,
                                                marginBottom: 8
                                            },
                                            children: "Reference images"
                                        }, void 0, false, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 1882,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontSize: 12,
                                                opacity: 0.82,
                                                lineHeight: 1.45,
                                                marginTop: 0,
                                                marginBottom: 10
                                            },
                                            children: [
                                                "Add one or more photos (× removes). Up to",
                                                " ",
                                                __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$reference$2d$asset$2d$constants$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MAX_JOB_SHARED_REFERENCE_IMAGES"],
                                                " total. Then add optional descriptions in order and run evaluate."
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 1891,
                                            columnNumber: 37
                                        }, this),
                                        donationSharedReferenceAssets.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: "flex",
                                                flexWrap: "wrap",
                                                gap: 10,
                                                marginBottom: 14
                                            },
                                            children: donationSharedReferenceAssets.map((ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$reference$2d$image$2d$chip$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ReferenceImageChip"], {
                                                    asset: {
                                                        id: ref.id,
                                                        filePath: ref.filePath,
                                                        originalName: ref.originalName
                                                    },
                                                    jobId: job.id,
                                                    adId: null
                                                }, ref.id, false, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 1915,
                                                    columnNumber: 49
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 1906,
                                            columnNumber: 41
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: 12,
                                                opacity: 0.75,
                                                marginBottom: 12
                                            },
                                            children: "No images yet — add at least one below."
                                        }, void 0, false, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 1929,
                                            columnNumber: 41
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                            action: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$reference$2d$asset$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["appendJobSharedReferenceImages"],
                                            style: {
                                                marginBottom: 16,
                                                padding: 12,
                                                borderRadius: 12,
                                                border: "1px dashed var(--borderStrong)",
                                                background: "var(--surfaceElevated)"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "hidden",
                                                    name: "jobId",
                                                    value: job.id
                                                }, void 0, false, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 1950,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    style: {
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        display: "block",
                                                        marginBottom: 6
                                                    },
                                                    children: "Add image(s)"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 1955,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "file",
                                                    name: "referenceFiles",
                                                    multiple: true,
                                                    accept: "image/png,image/jpeg,image/webp,image/*",
                                                    style: {
                                                        width: "100%"
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 1965,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "submit",
                                                    style: {
                                                        marginTop: 10,
                                                        padding: "8px 14px",
                                                        borderRadius: 10,
                                                        border: "1px solid var(--borderStrong)",
                                                        background: "var(--accent)",
                                                        color: "#fff",
                                                        cursor: "pointer",
                                                        fontWeight: 700
                                                    },
                                                    children: "Save uploads"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 1972,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 1940,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                            action: evaluateDonationImages,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "hidden",
                                                    name: "jobId",
                                                    value: job.id
                                                }, void 0, false, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 1991,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        marginBottom: 6
                                                    },
                                                    children: "Descriptions (optional, same order as images left → right)"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 1996,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: "grid",
                                                        gap: 8
                                                    },
                                                    children: donationSharedReferenceAssets.length > 0 ? donationSharedReferenceAssets.map((ref, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            name: "reference_image_descriptions[]",
                                                            defaultValue: ref.description || "",
                                                            placeholder: `Image ${idx + 1} description (optional)`,
                                                            style: {
                                                                width: "100%",
                                                                padding: 8,
                                                                borderRadius: 10,
                                                                border: "1px solid var(--border)",
                                                                background: "var(--surfaceElevated)",
                                                                color: "var(--foreground)"
                                                            }
                                                        }, ref.id, false, {
                                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                                            lineNumber: 2016,
                                                            columnNumber: 57
                                                        }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: 12,
                                                            opacity: 0.75
                                                        },
                                                        children: "Add images first to attach descriptions."
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2044,
                                                        columnNumber: 49
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 2006,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "submit",
                                                    disabled: donationSharedReferenceAssets.length === 0,
                                                    style: {
                                                        marginTop: 10,
                                                        width: "100%",
                                                        padding: "10px 14px",
                                                        borderRadius: 12,
                                                        border: "1px solid var(--borderStrong)",
                                                        background: donationSharedReferenceAssets.length === 0 ? "var(--border)" : "var(--accent)",
                                                        color: "#fff",
                                                        cursor: donationSharedReferenceAssets.length === 0 ? "not-allowed" : "pointer",
                                                        opacity: donationSharedReferenceAssets.length === 0 ? 0.6 : 1
                                                    },
                                                    children: "Evaluate images"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 2055,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 1990,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                    lineNumber: 1881,
                                    columnNumber: 33
                                }, this) : null,
                                Object.keys(donationBackstoryEval).length > 0 && Object.keys(donationReferenceEval).length > 0 && !isDonationBuildStep ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                    action: goToDonationAdBuilder,
                                    style: {
                                        marginTop: 12
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "hidden",
                                            name: "jobId",
                                            value: job.id
                                        }, void 0, false, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 2099,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            style: {
                                                width: "100%",
                                                padding: "10px 14px",
                                                borderRadius: 12,
                                                border: "1px solid var(--borderStrong)",
                                                background: "var(--accent)",
                                                color: "#fff",
                                                cursor: "pointer"
                                            },
                                            children: "Next"
                                        }, void 0, false, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 2104,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                    lineNumber: 2095,
                                    columnNumber: 33
                                }, this) : null,
                                Object.keys(donationBackstoryEval).length > 0 && Object.keys(donationReferenceEval).length > 0 && isDonationBuildStep ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                    style: {
                                        marginTop: 14
                                    },
                                    open: true,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                            style: {
                                                cursor: "pointer",
                                                fontWeight: 900,
                                                opacity: 0.95,
                                                marginBottom: 10
                                            },
                                            children: "Generate ads (auto from Creative Brain)"
                                        }, void 0, false, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 2129,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontSize: 13,
                                                opacity: 0.85,
                                                lineHeight: 1.5,
                                                marginTop: 0,
                                                marginBottom: 12
                                            },
                                            children: [
                                                "Templates, angles, VAR hints, and winning-prompt seeds are picked randomly from",
                                                " ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                                    href: "/memory",
                                                    children: "Memory → Creative Brain"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 2151,
                                                    columnNumber: 41
                                                }, this),
                                                ". After generation, the blueprint for that run appears under ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: "Ad tabs"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 2153,
                                                    columnNumber: 55
                                                }, this),
                                                ". Use",
                                                " ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: "Generate variations"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 2154,
                                                    columnNumber: 41
                                                }, this),
                                                " on each ad for optional tweaks."
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 2140,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                            action: generateFundraiserFiveAds,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "hidden",
                                                    name: "jobId",
                                                    value: job.id
                                                }, void 0, false, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 2159,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        marginTop: 4
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                fontSize: 13,
                                                                fontWeight: 800,
                                                                opacity: 0.9,
                                                                marginBottom: 8
                                                            },
                                                            children: "Reference images (for Kie)"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                                            lineNumber: 2166,
                                                            columnNumber: 45
                                                        }, this),
                                                        donationSharedReferenceAssets.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: "grid",
                                                                gap: 6
                                                            },
                                                            children: donationSharedReferenceAssets.map((ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    style: {
                                                                        fontSize: 12,
                                                                        opacity: 0.92,
                                                                        display: "flex",
                                                                        gap: 8,
                                                                        alignItems: "center"
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "checkbox",
                                                                            name: "selectedReferenceIds",
                                                                            value: ref.id,
                                                                            defaultChecked: true
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                            lineNumber: 2195,
                                                                            columnNumber: 65
                                                                        }, this),
                                                                        ref.originalName,
                                                                        ref.description ? ` — ${ref.description}` : ""
                                                                    ]
                                                                }, ref.id, true, {
                                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                    lineNumber: 2185,
                                                                    columnNumber: 61
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                                            lineNumber: 2177,
                                                            columnNumber: 49
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                fontSize: 12,
                                                                opacity: 0.8
                                                            },
                                                            children: "No shared references found. Upload references on the create page."
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                                            lineNumber: 2211,
                                                            columnNumber: 49
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 2165,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "submit",
                                                    style: {
                                                        marginTop: 14,
                                                        width: "100%",
                                                        padding: "12px 14px",
                                                        borderRadius: 12,
                                                        border: "1px solid var(--borderStrong)",
                                                        background: "var(--accent)",
                                                        color: "#fff",
                                                        cursor: "pointer",
                                                        fontWeight: 700
                                                    },
                                                    children: "Generate 5 ads (one Claude call)"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 2217,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 2158,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                    lineNumber: 2125,
                                    columnNumber: 33
                                }, this) : null
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/jobs/[id]/page.tsx",
                            lineNumber: 1572,
                            columnNumber: 25
                        }, this) : null
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 1570,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/page.tsx",
                lineNumber: 1508,
                columnNumber: 13
            }, this),
            job.ads.length > 0 && job.campaignType === "donation" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                            marginTop: 0
                        },
                        children: "Reference images (all ads)"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 2253,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            opacity: 0.85,
                            marginBottom: 12,
                            fontSize: 13
                        },
                        children: [
                            "Each thumbnail has × to remove. Add more with the file picker (saved on submit). Max ",
                            __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$reference$2d$asset$2d$constants$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MAX_JOB_SHARED_REFERENCE_IMAGES"],
                            " images. These are shared when an ad tab has no ad-specific refs."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 2254,
                        columnNumber: 21
                    }, this),
                    job.referenceAssets.filter((r)=>!r.adId).length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 10,
                            marginBottom: 16
                        },
                        children: job.referenceAssets.filter((r)=>!r.adId).map((ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$reference$2d$image$2d$chip$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ReferenceImageChip"], {
                                asset: {
                                    id: ref.id,
                                    filePath: ref.filePath,
                                    originalName: ref.originalName
                                },
                                jobId: job.id,
                                adId: null
                            }, ref.id, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 2272,
                                columnNumber: 37
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 2261,
                        columnNumber: 25
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: 13,
                            opacity: 0.75,
                            marginBottom: 14
                        },
                        children: "No shared references yet."
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 2285,
                        columnNumber: 25
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        action: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$reference$2d$asset$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["appendJobSharedReferenceImages"],
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "hidden",
                                name: "jobId",
                                value: job.id
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 2297,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                style: {
                                    fontSize: 13,
                                    fontWeight: 700,
                                    display: "block",
                                    marginBottom: 6
                                },
                                children: "Add image(s)"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 2298,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "file",
                                name: "referenceFiles",
                                multiple: true,
                                accept: "image/*",
                                style: {
                                    width: "100%",
                                    padding: 14,
                                    border: "2px dashed var(--borderStrong)",
                                    background: "var(--surfaceElevated)",
                                    color: "var(--foreground)",
                                    borderRadius: 12
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 2308,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                style: {
                                    marginTop: 12,
                                    padding: "10px 14px",
                                    borderRadius: 10,
                                    border: "1px solid var(--borderStrong)",
                                    background: "var(--accent)",
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontWeight: 700
                                },
                                children: "Save uploads"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 2322,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 2296,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/page.tsx",
                lineNumber: 2244,
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
                        lineNumber: 2343,
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
                                lineNumber: 2355,
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
                                lineNumber: 2369,
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
                                lineNumber: 2383,
                                columnNumber: 33
                            }, this) : null,
                            lastAutoBatchPlan && lastAutoBatchPlan.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12,
                                    border: "1px solid var(--border)",
                                    borderRadius: 14,
                                    padding: 12,
                                    background: "rgba(124, 58, 237, 0.06)"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontWeight: 900,
                                            marginBottom: 6,
                                            fontSize: 14
                                        },
                                        children: "Last auto batch blueprint"
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 2405,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: 12,
                                            opacity: 0.82,
                                            marginBottom: 10,
                                            lineHeight: 1.45
                                        },
                                        children: [
                                            "What was randomly chosen from",
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/memory",
                                                children: "Creative Brain"
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 2423,
                                                columnNumber: 41
                                            }, this),
                                            ' for the latest "Generate 5 ads" run (templates, angles, VARs, winning-prompt seeds). Matches ad tabs in numeric order from that run.'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 2414,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                                        style: {
                                            margin: 0,
                                            paddingLeft: 18,
                                            fontSize: 12,
                                            lineHeight: 1.55
                                        },
                                        children: lastAutoBatchPlan.map((slot)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                style: {
                                                    marginBottom: 10
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: [
                                                            "Slot ",
                                                            slot.slotIndex,
                                                            ":",
                                                            " ",
                                                            slot.templateLabel
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2442,
                                                        columnNumber: 49
                                                    }, this),
                                                    slot.angleLine ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            "Angle: ",
                                                            slot.angleLine
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2447,
                                                        columnNumber: 53
                                                    }, this) : null,
                                                    slot.varKeys && slot.varKeys.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            "VARs:",
                                                            " ",
                                                            slot.varKeys.join(", ")
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2453,
                                                        columnNumber: 53
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: "VARs: (none)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2458,
                                                        columnNumber: 53
                                                    }, this),
                                                    slot.winningPromptSeed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            opacity: 0.88,
                                                            marginTop: 4,
                                                            whiteSpace: "pre-wrap"
                                                        },
                                                        children: [
                                                            "Winning seed:",
                                                            " ",
                                                            slot.winningPromptSeed.length > 200 ? `${slot.winningPromptSeed.slice(0, 200)}…` : slot.winningPromptSeed
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2461,
                                                        columnNumber: 53
                                                    }, this) : null
                                                ]
                                            }, slot.slotIndex, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 2438,
                                                columnNumber: 45
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 2429,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 2396,
                                columnNumber: 33
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 2345,
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
                                            display: "flex",
                                            flexWrap: "wrap",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: 10,
                                            listStyle: "none",
                                            cursor: "pointer",
                                            fontWeight: 800,
                                            color: "var(--foreground)",
                                            marginBottom: 12
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                                        lineNumber: 2632,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 2630,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$ad$2d$collapsible$2d$header$2d$actions$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AdCollapsibleHeaderActions"], {
                                                jobId: job.id,
                                                adId: ad.id,
                                                aspectSelectHeaderId: `aspect-header-${ad.id}`,
                                                generateAdImages: generateAdImages,
                                                firstImageUrl: ad.images[0]?.url ?? null,
                                                firstImageDownloadName: ad.images[0] ? `SacredStatics-ad-${job.id.slice(0, 8)}-${ad.adNumber}-${ad.images[0].id.slice(-6)}` : ""
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 2641,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 2616,
                                        columnNumber: 37
                                    }, this),
                                    job.campaignType === "donation" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            alignItems: "flex-start",
                                            justifyContent: "space-between",
                                            gap: 12,
                                            marginBottom: 10
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontWeight: 900,
                                                            marginBottom: 4
                                                        },
                                                        children: donationStyleLabel || "—"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2669,
                                                        columnNumber: 49
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: 13,
                                                            opacity: 0.85,
                                                            marginBottom: 6
                                                        },
                                                        children: donationConceptName || ""
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2678,
                                                        columnNumber: 49
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: 12,
                                                            opacity: 0.8
                                                        },
                                                        children: [
                                                            developedPrompt.length,
                                                            " chars"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2688,
                                                        columnNumber: 49
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 2668,
                                                columnNumber: 45
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CopyToClipboardButton$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                                    text: developedPrompt,
                                                    label: "Copy"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                    lineNumber: 2693,
                                                    columnNumber: 49
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 2692,
                                                columnNumber: 45
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 2658,
                                        columnNumber: 41
                                    }, this) : null,
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
                                                        lineNumber: 2703,
                                                        columnNumber: 45
                                                    }, this),
                                                    " ",
                                                    angle || "—"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 2702,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Hook:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2707,
                                                        columnNumber: 45
                                                    }, this),
                                                    " ",
                                                    hook || "—"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 2706,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Headline:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2711,
                                                        columnNumber: 45
                                                    }, this),
                                                    " ",
                                                    headline || "—"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 2710,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Primary:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2715,
                                                        columnNumber: 45
                                                    }, this),
                                                    " ",
                                                    primaryText || "—"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 2714,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "CTA:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2719,
                                                        columnNumber: 45
                                                    }, this),
                                                    " ",
                                                    cta || "—"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 2718,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 2701,
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
                                                lineNumber: 2725,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: 12,
                                                    opacity: 0.78,
                                                    lineHeight: 1.45,
                                                    marginBottom: 10
                                                },
                                                children: "Workflow: edit & save → references & aspect below → generate → refine (Kling / variations) → optionally save this tab to Memory at the bottom."
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 2728,
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
                                                        lineNumber: 2742,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "hidden",
                                                        name: "adId",
                                                        value: ad.id
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2747,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                        id: `ad-edited-prompt-${ad.id}`,
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
                                                        lineNumber: 2752,
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
                                                            lineNumber: 2766,
                                                            columnNumber: 49
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2765,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 2741,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 2724,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 20,
                                            padding: 14,
                                            borderRadius: 14,
                                            border: "1px solid var(--border)",
                                            background: "var(--surfaceElevated)"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                style: {
                                                    margin: "0 0 10px 0"
                                                },
                                                children: "Reference images → aspect ratio → generate"
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 2795,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: 12,
                                                    opacity: 0.85,
                                                    marginBottom: 10,
                                                    lineHeight: 1.45
                                                },
                                                children: [
                                                    "Set references and ratio, then run Kie.",
                                                    ad.adNumber === 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            " ",
                                                            "On ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                children: "Ad 1"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                lineNumber: 2812,
                                                                columnNumber: 56
                                                            }, this),
                                                            ", open",
                                                            " ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                children: "Variation options → preview → new ad tab"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                lineNumber: 2813,
                                                                columnNumber: 53
                                                            }, this),
                                                            " ",
                                                            "below to fork copy (preview first, then save tabs)."
                                                        ]
                                                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            " ",
                                                            "New angles from",
                                                            " ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                children: "Ad 1"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                lineNumber: 2824,
                                                                columnNumber: 53
                                                            }, this),
                                                            ": switch to that tab and use",
                                                            " ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                children: "Variation options"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                lineNumber: 2826,
                                                                columnNumber: 53
                                                            }, this),
                                                            " ",
                                                            "under its Kie button."
                                                        ]
                                                    }, void 0, true),
                                                    " ",
                                                    "After an image, open",
                                                    " ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Refine this ad → Kling-ready & animation"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2833,
                                                        columnNumber: 45
                                                    }, this),
                                                    " ",
                                                    "below for Kling-ready."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 2799,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: 13,
                                                    opacity: 0.9,
                                                    marginBottom: 8
                                                },
                                                children: effectiveReferenceAssets.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        effectiveReferenceAssets.length,
                                                        " ",
                                                        "image",
                                                        effectiveReferenceAssets.length === 1 ? "" : "s",
                                                        " ",
                                                        usingAdSpecificRefs ? "for this ad (× removes)" : "(shared job refs — × removes from job)",
                                                        " "
                                                    ]
                                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        "No references — add for this ad below (max ",
                                                        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$reference$2d$asset$2d$constants$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MAX_AD_REFERENCE_IMAGES"],
                                                        "), or use shared job refs."
                                                    ]
                                                }, void 0, true)
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 2839,
                                                columnNumber: 41
                                            }, this),
                                            effectiveReferenceAssets.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: "flex",
                                                    gap: 10,
                                                    flexWrap: "wrap",
                                                    marginBottom: 12
                                                },
                                                children: effectiveReferenceAssets.map((ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$reference$2d$image$2d$chip$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ReferenceImageChip"], {
                                                        asset: {
                                                            id: ref.id,
                                                            filePath: ref.filePath,
                                                            originalName: ref.originalName
                                                        },
                                                        jobId: job.id,
                                                        adId: usingAdSpecificRefs ? ad.id : null
                                                    }, ref.id, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2880,
                                                        columnNumber: 57
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 2870,
                                                columnNumber: 45
                                            }, this) : null,
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                                action: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$reference$2d$asset$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["appendAdReferenceImages"],
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "hidden",
                                                        name: "jobId",
                                                        value: job.id
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2902,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "hidden",
                                                        name: "adId",
                                                        value: ad.id
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2907,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: 12,
                                                            fontWeight: 700,
                                                            marginBottom: 6
                                                        },
                                                        children: "Add image(s) for this ad only"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2912,
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
                                                            lineNumber: 2922,
                                                            columnNumber: 49
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2921,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "submit",
                                                        style: {
                                                            padding: "8px 12px",
                                                            borderRadius: 10,
                                                            border: "1px solid var(--borderStrong)",
                                                            background: "var(--accent)",
                                                            color: "#fff",
                                                            cursor: "pointer",
                                                            width: "100%",
                                                            fontWeight: 700
                                                        },
                                                        children: "Save uploads"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2939,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 2901,
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
                                                        lineNumber: 2958,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "hidden",
                                                        name: "adId",
                                                        value: ad.id
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2963,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            marginBottom: 10
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                htmlFor: `aspect-body-${ad.id}`,
                                                                style: {
                                                                    fontSize: 13,
                                                                    fontWeight: 700,
                                                                    opacity: 0.9
                                                                },
                                                                children: "Aspect Ratio"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                lineNumber: 2969,
                                                                columnNumber: 49
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                lineNumber: 2979,
                                                                columnNumber: 49
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                id: `aspect-body-${ad.id}`,
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
                                                                        lineNumber: 2994,
                                                                        columnNumber: 53
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "9:16",
                                                                        children: "9:16 (TT/Reels)"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                        lineNumber: 2997,
                                                                        columnNumber: 53
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                lineNumber: 2980,
                                                                columnNumber: 49
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 2968,
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
                                                            width: "100%",
                                                            fontWeight: 700
                                                        },
                                                        children: "Generate This Ad with Kie"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 3002,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 2957,
                                                columnNumber: 41
                                            }, this),
                                            ad.adNumber === 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$ad$2d$variation$2d$panel$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AdVariationPanel"], {
                                                jobId: job.id,
                                                adId: ad.id,
                                                showKlingOption: job.campaignType === "donation"
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 3021,
                                                columnNumber: 45
                                            }, this) : null
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 2786,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 20
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                style: {
                                                    margin: "0 0 8px 0"
                                                },
                                                children: "Generated images"
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 3033,
                                                columnNumber: 41
                                            }, this),
                                            ad.images.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: 12,
                                                    opacity: 0.72,
                                                    marginBottom: 10
                                                },
                                                children: "Previews are scaled for review. Save image downloads the full-resolution file."
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 3037,
                                                columnNumber: 45
                                            }, this) : null,
                                            ad.images.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    opacity: 0.85
                                                },
                                                children: "No generated images yet."
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 3050,
                                                columnNumber: 45
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: "grid",
                                                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 320px))",
                                                    gap: 16,
                                                    justifyContent: "start"
                                                },
                                                children: ad.images.map((image)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            border: "1px solid var(--border)",
                                                            padding: 12,
                                                            borderRadius: 12
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: "flex",
                                                                    justifyContent: "center",
                                                                    alignItems: "center",
                                                                    minHeight: 120,
                                                                    padding: 8,
                                                                    borderRadius: 8,
                                                                    background: "var(--surfaceElevated)"
                                                                },
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                    src: image.url,
                                                                    alt: `Ad ${ad.adNumber}`,
                                                                    style: {
                                                                        maxWidth: "min(100%, 280px)",
                                                                        maxHeight: "min(52vh, 420px)",
                                                                        width: "auto",
                                                                        height: "auto",
                                                                        objectFit: "contain",
                                                                        display: "block"
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                    lineNumber: 3085,
                                                                    columnNumber: 61
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                lineNumber: 3073,
                                                                columnNumber: 57
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$SaveImageButton$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                                                imageUrl: image.url,
                                                                downloadName: `SacredStatics-ad-${job.id.slice(0, 8)}-${ad.adNumber}-${image.id.slice(-6)}`
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                lineNumber: 3102,
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
                                                                lineNumber: 3106,
                                                                columnNumber: 57
                                                            }, this)
                                                        ]
                                                    }, image.id, true, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 3064,
                                                        columnNumber: 53
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 3054,
                                                columnNumber: 45
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 3032,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                        style: {
                                            marginTop: 22,
                                            padding: 12,
                                            borderRadius: 14,
                                            border: "1px solid var(--border)",
                                            background: "var(--surfaceElevated)"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                                style: {
                                                    cursor: "pointer",
                                                    fontWeight: 800,
                                                    fontSize: 14,
                                                    listStyle: "none"
                                                },
                                                children: "Refine this ad → Kling-ready & animation (optional)"
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 3131,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginTop: 14
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: 12,
                                                            opacity: 0.82,
                                                            lineHeight: 1.45,
                                                            marginBottom: 14
                                                        },
                                                        children: [
                                                            "After generating with Kie, go Kling-ready for video packs. Fork new ad tabs from",
                                                            " ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                children: "Ad 1"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                lineNumber: 3154,
                                                                columnNumber: 49
                                                            }, this),
                                                            " via",
                                                            " ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                children: "Variation options"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                lineNumber: 3155,
                                                                columnNumber: 49
                                                            }, this),
                                                            " ",
                                                            "under its Kie button. Save prompt edits first if you changed the Kie block."
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 3143,
                                                        columnNumber: 45
                                                    }, this),
                                                    job.campaignType === "donation" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            marginBottom: 16,
                                                            padding: 12,
                                                            borderRadius: 12,
                                                            border: "1px solid var(--border)",
                                                            background: "var(--surface)"
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: 12,
                                                                    opacity: 0.85,
                                                                    lineHeight: 1.45,
                                                                    marginBottom: 10
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                        children: "Kling ready"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                        lineNumber: 3180,
                                                                        columnNumber: 57
                                                                    }, this),
                                                                    " ",
                                                                    "— hyper-real",
                                                                    " ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                                        children: "KIE_IMAGE_PROMPT"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                        lineNumber: 3182,
                                                                        columnNumber: 57
                                                                    }, this),
                                                                    " ",
                                                                    "still +",
                                                                    " ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                                        children: "KLING_ANIMATION_PROMPT"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                        lineNumber: 3186,
                                                                        columnNumber: 57
                                                                    }, this),
                                                                    ". For more control, use",
                                                                    " ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                                                        children: "Kling-ready pack"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                        lineNumber: 3190,
                                                                        columnNumber: 57
                                                                    }, this),
                                                                    " ",
                                                                    "in",
                                                                    " ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                        children: "Variation options"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                        lineNumber: 3192,
                                                                        columnNumber: 57
                                                                    }, this),
                                                                    " ",
                                                                    "on the",
                                                                    " ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                        children: "Ad 1"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                        lineNumber: 3196,
                                                                        columnNumber: 57
                                                                    }, this),
                                                                    " tab (under Kie)."
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                lineNumber: 3172,
                                                                columnNumber: 53
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                                                action: makeAdKlingReady,
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "hidden",
                                                                        name: "jobId",
                                                                        value: job.id
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                        lineNumber: 3202,
                                                                        columnNumber: 57
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "hidden",
                                                                        name: "adId",
                                                                        value: ad.id
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                        lineNumber: 3207,
                                                                        columnNumber: 57
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "submit",
                                                                        style: {
                                                                            padding: "10px 14px",
                                                                            borderRadius: 10,
                                                                            border: "1px solid rgba(124, 58, 237, 0.45)",
                                                                            background: "var(--accent)",
                                                                            color: "#fff",
                                                                            cursor: "pointer",
                                                                            fontWeight: 700
                                                                        },
                                                                        children: "Make this ad Kling ready"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                        lineNumber: 3212,
                                                                        columnNumber: 57
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                lineNumber: 3199,
                                                                columnNumber: 53
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 3162,
                                                        columnNumber: 49
                                                    }, this) : null,
                                                    job.campaignType === "donation" && isKlingVideoReady && klingAnimationPrompt ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            marginTop: 18
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                style: {
                                                                    margin: "0 0 8px 0"
                                                                },
                                                                children: "Kling animation prompt"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                lineNumber: 3238,
                                                                columnNumber: 53
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                                readOnly: true,
                                                                defaultValue: klingAnimationPrompt,
                                                                style: {
                                                                    width: "100%",
                                                                    minHeight: 120,
                                                                    padding: 12,
                                                                    background: "black",
                                                                    color: "white",
                                                                    border: "1px solid #444"
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                lineNumber: 3245,
                                                                columnNumber: 53
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    marginTop: 10,
                                                                    display: "flex",
                                                                    justifyContent: "flex-end"
                                                                },
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CopyToClipboardButton$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                                                    text: klingAnimationPrompt,
                                                                    label: "Copy Kling prompt"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                    lineNumber: 3267,
                                                                    columnNumber: 57
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                                lineNumber: 3259,
                                                                columnNumber: 53
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 3237,
                                                        columnNumber: 49
                                                    }, this) : null
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 3142,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 3122,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, ad.id, true, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 2604,
                                columnNumber: 33
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 2482,
                        columnNumber: 21
                    }, this),
                    showFreshAnglesBatchCta ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 28,
                            padding: 20,
                            borderRadius: 18,
                            border: "2px solid rgba(124, 58, 237, 0.35)",
                            background: "linear-gradient(180deg, rgba(124, 58, 237, 0.09), var(--surfaceElevated))"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    marginTop: 0,
                                    marginBottom: 10,
                                    fontSize: 18
                                },
                                children: "Generate more ads (fresh Memory angles)"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 3294,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 13,
                                    lineHeight: 1.55,
                                    opacity: 0.9,
                                    marginTop: 0,
                                    marginBottom: 14
                                },
                                children: [
                                    "Uses only angles from",
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/memory",
                                        children: "Memory"
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 3313,
                                        columnNumber: 33
                                    }, this),
                                    " that have not appeared in any prior batch on this job — same evaluations, swipe context, Creative Brain, and batch pipeline as ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: "Generate 5 ads"
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 3316,
                                        columnNumber: 51
                                    }, this),
                                    ".",
                                    remainingFreshAngleCount < 5 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: [
                                                    remainingFreshAngleCount,
                                                    " unused angle",
                                                    remainingFreshAngleCount === 1 ? "" : "s",
                                                    " ",
                                                    "left"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 3320,
                                                columnNumber: 41
                                            }, this),
                                            "— next run will be a smaller batch and, if that exhausts Memory, will be marked as the last batch."
                                        ]
                                    }, void 0, true) : null
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 3303,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                action: generateFundraiserFiveAdsFreshAngles,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "hidden",
                                        name: "jobId",
                                        value: job.id
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 3336,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "submit",
                                        style: {
                                            width: "100%",
                                            padding: "16px 18px",
                                            borderRadius: 14,
                                            border: "1px solid var(--borderStrong)",
                                            background: "var(--accent)",
                                            color: "#fff",
                                            cursor: "pointer",
                                            fontWeight: 800,
                                            fontSize: 16
                                        },
                                        children: "Generate up to 5 new ads (fresh angles, one Claude call)"
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 3341,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 3333,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 3284,
                        columnNumber: 25
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/page.tsx",
                lineNumber: 2342,
                columnNumber: 17
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/app/jobs/[id]/page.tsx",
        lineNumber: 1300,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/lib/adVariationCore.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseClientAdPayload",
    ()=>parseClientAdPayload,
    "persistVariationAds",
    ()=>persistVariationAds,
    "runVariationClaudeOnly",
    ()=>runVariationClaudeOnly
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$anthropic$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/anthropic.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/creativeBrain.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claude$2f$parseClaudeJson$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/claude/parseClaudeJson.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$donationWizard$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/donationWizard.ts [app-rsc] (ecmascript)");
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
async function runVariationClaudeOnly(input) {
    const job = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.findUnique({
        where: {
            id: input.jobId
        }
    });
    if (!job) {
        return {
            ok: false,
            error: "Job not found."
        };
    }
    const variationInstruction = input.variationInstruction.trim();
    const safeCount = job.campaignType === "donation" ? 1 : 4;
    const baseAd = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.findUnique({
        where: {
            id: input.baseAdId
        }
    });
    if (!baseAd?.sourceBlock) {
        return {
            ok: false,
            error: "Base ad missing saved data."
        };
    }
    const basePayload = tryParseJson(baseAd.sourceBlock);
    if (!basePayload || typeof basePayload !== "object" || typeof basePayload.angle !== "string" || typeof basePayload.hook !== "string" || typeof basePayload.primaryText !== "string" || typeof basePayload.headline !== "string" || typeof basePayload.cta !== "string") {
        return {
            ok: false,
            error: "This ad is missing angle, hook, headline, primary text, or CTA in saved data."
        };
    }
    const visualPromptMerged = (typeof basePayload.visualPrompt === "string" ? basePayload.visualPrompt : "").trim() || String(baseAd.editedPrompt || "").trim();
    if (!visualPromptMerged) {
        return {
            ok: false,
            error: "No visual prompt found. Save “Developed Prompt” first or regenerate this ad."
        };
    }
    const brainForVariations = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getFundraiserCreativeBrain"])();
    const creativeBrainSectionForVariations = job.campaignType === "donation" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$creativeBrain$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["buildBrainPromptSection"])(brainForVariations, []) : undefined;
    const donationEvaluationsResolved = job.campaignType === "donation" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$donationWizard$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveDonationEvaluations"])(job) : null;
    let variationsRaw;
    try {
        variationsRaw = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$anthropic$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generateAdVariationsFromBaseAd"])({
            baseAd: {
                angle: basePayload.angle,
                hook: basePayload.hook,
                primaryText: basePayload.primaryText,
                headline: basePayload.headline,
                cta: basePayload.cta,
                visualPrompt: visualPromptMerged
            },
            campaignType: job.campaignType === "donation" ? "donation" : "product",
            requestedVariations: safeCount,
            creativeMode: job.creativeMode || "Mix",
            adMixStrategy: job.adMixStrategy || "Even Mix",
            strictlyFollowSelectedAngles: job.strictlyFollowSelectedAngles ?? false,
            includeExperimentalAds: job.includeExperimentalAds ?? false,
            variationInstruction,
            creativeBrainSection: creativeBrainSectionForVariations,
            donationEvaluations: job.campaignType === "donation" && donationEvaluationsResolved ? {
                pageEvaluation: donationEvaluationsResolved.pageEvaluation,
                backstoryEvaluation: donationEvaluationsResolved.backstoryEvaluation,
                referenceEvaluation: donationEvaluationsResolved.referenceEvaluation
            } : undefined,
            donationKlingFormat: job.campaignType === "donation" ? input.flags.klingFormat : undefined
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
            ok: false,
            error: `Claude request failed: ${msg}`
        };
    }
    const parsedResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claude$2f$parseClaudeJson$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseValidateAndNormalizeClaudeAds"])(variationsRaw, safeCount);
    if (!parsedResult.ok) {
        const d = parsedResult.diagnostics;
        const hint = [
            d.error,
            d.warnings?.length ? d.warnings.join(" ") : "",
            d.preview ? `Output preview: ${d.preview.slice(0, 400)}` : ""
        ].filter(Boolean).join(" — ");
        return {
            ok: false,
            error: hint || "Could not parse variation response."
        };
    }
    if (parsedResult.ads.length === 0) {
        return {
            ok: false,
            error: "Model returned no usable ads."
        };
    }
    return {
        ok: true,
        ads: parsedResult.ads
    };
}
function isParsedAdShape(o) {
    if (!o || typeof o !== "object") return false;
    const a = o;
    return typeof a.angle === "string" && typeof a.hook === "string" && typeof a.primaryText === "string" && typeof a.headline === "string" && typeof a.cta === "string" && typeof a.visualPrompt === "string";
}
async function persistVariationAds(options) {
    const { jobId, baseAdId, ads } = options;
    const n = ads.length;
    if (n === 0) throw new Error("No ads to persist.");
    const job = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.findUnique({
        where: {
            id: jobId
        }
    });
    if (!job) throw new Error("Job not found");
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
        data: ads.map((ad, i)=>({
                jobId,
                adNumber: startAdNumber + i,
                title: `Variation ${i + 1}`,
                sourceBlock: JSON.stringify(ad, null, 2),
                editedPrompt: String(ad.visualPrompt || "").trim(),
                status: "ready",
                parentAdId: baseAdId
            }))
    });
    if (job.campaignType === "donation") {
        const baseAdSpecificRefs = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.findMany({
            where: {
                jobId,
                adId: baseAdId
            },
            orderBy: {
                createdAt: "asc"
            },
            select: {
                filePath: true,
                originalName: true,
                mimeType: true
            }
        });
        const refsToCopy = baseAdSpecificRefs.length > 0 ? baseAdSpecificRefs : await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.findMany({
            where: {
                jobId,
                adId: null
            },
            orderBy: {
                createdAt: "asc"
            },
            select: {
                filePath: true,
                originalName: true,
                mimeType: true
            }
        });
        if (refsToCopy.length > 0) {
            const newAds = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.findMany({
                where: {
                    jobId,
                    parentAdId: baseAdId,
                    adNumber: {
                        gte: startAdNumber,
                        lt: startAdNumber + n
                    }
                },
                select: {
                    id: true
                }
            });
            const data = newAds.flatMap((newAd)=>refsToCopy.map((ref)=>({
                        jobId,
                        adId: newAd.id,
                        filePath: ref.filePath,
                        originalName: ref.originalName,
                        mimeType: ref.mimeType
                    })));
            if (data.length > 0) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.createMany({
                    data
                });
            }
        }
    }
}
function parseClientAdPayload(raw) {
    if (!isParsedAdShape(raw)) {
        return {
            ok: false,
            error: "Invalid ad payload."
        };
    }
    const ad = raw;
    const required = [
        "angle",
        "hook",
        "headline",
        "cta",
        "visualPrompt"
    ];
    for (const k of required){
        if (!String(ad[k] || "").trim()) {
            return {
                ok: false,
                error: `Field "${k}" cannot be empty.`
            };
        }
    }
    if (typeof ad.primaryText !== "string") {
        return {
            ok: false,
            error: "primaryText must be a string."
        };
    }
    return {
        ok: true,
        ad
    };
}
}),
"[project]/app/jobs/[id]/variation-preview-actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40a3088bbcaae3f7f0ff7ccce12a1a44a0019bb119":"commitVariationAdsAction","40bad6b049d3cdbd0e4623e3c6712746f1b06bcd3f":"previewVariationPromptAction"},"",""] */ __turbopack_context__.s([
    "commitVariationAdsAction",
    ()=>commitVariationAdsAction,
    "previewVariationPromptAction",
    ()=>previewVariationPromptAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$adVariationCore$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/adVariationCore.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
async function previewVariationPromptAction(input) {
    const row = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.findUnique({
        where: {
            id: input.jobId
        },
        select: {
            id: true
        }
    });
    if (!row) {
        return {
            ok: false,
            error: "Job not found."
        };
    }
    const adRow = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.findFirst({
        where: {
            id: input.baseAdId,
            jobId: input.jobId
        },
        select: {
            id: true
        }
    });
    if (!adRow) {
        return {
            ok: false,
            error: "Ad not found on this job."
        };
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$adVariationCore$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["runVariationClaudeOnly"])({
        jobId: input.jobId,
        baseAdId: input.baseAdId,
        variationInstruction: input.variationInstruction,
        flags: input.flags
    });
}
async function commitVariationAdsAction(input) {
    if (!Array.isArray(input.ads) || input.ads.length === 0) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${input.jobId}?variationError=${encodeURIComponent("Nothing to save — generate a preview first.")}`);
    }
    const validated = [];
    for(let i = 0; i < input.ads.length; i++){
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$adVariationCore$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseClientAdPayload"])(input.ads[i]);
        if (!parsed.ok) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${input.jobId}?variationError=${encodeURIComponent(`Ad ${i + 1}: ${parsed.error}`)}`);
        }
        validated.push(parsed.ad);
    }
    const job = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.findUnique({
        where: {
            id: input.jobId
        },
        select: {
            id: true
        }
    });
    if (!job) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${input.jobId}?variationError=${encodeURIComponent("Job not found.")}`);
    }
    const base = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.findFirst({
        where: {
            id: input.baseAdId,
            jobId: input.jobId
        },
        select: {
            id: true
        }
    });
    if (!base) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${input.jobId}?variationError=${encodeURIComponent("Base ad not found.")}`);
    }
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$adVariationCore$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["persistVariationAds"])({
        jobId: input.jobId,
        baseAdId: input.baseAdId,
        ads: validated
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${input.jobId}`);
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    previewVariationPromptAction,
    commitVariationAdsAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(previewVariationPromptAction, "40bad6b049d3cdbd0e4623e3c6712746f1b06bcd3f", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(commitVariationAdsAction, "40a3088bbcaae3f7f0ff7ccce12a1a44a0019bb119", null);
}),
"[project]/.next-internal/server/app/jobs/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/jobs/[id]/page.tsx [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/jobs/[id]/reference-asset-actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/app/jobs/[id]/variation-preview-actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/jobs/[id]/page.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$reference$2d$asset$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/jobs/[id]/reference-asset-actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$variation$2d$preview$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/jobs/[id]/variation-preview-actions.ts [app-rsc] (ecmascript)");
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
;
;
;
;
}),
"[project]/.next-internal/server/app/jobs/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/jobs/[id]/page.tsx [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/jobs/[id]/reference-asset-actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/app/jobs/[id]/variation-preview-actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "40080b6f9b38ff8e80ae0d33b3683983013fa75342",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$reference$2d$asset$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteReferenceAsset"],
    "4015356bb4c7e8e9605883f2f41f10786716822ed8",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_4"],
    "40163adf6e526e8b5daf9df8dfd98135b45720999b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_0"],
    "4017e7700eafc8c40397f642ec8db7fbc5d8bf413b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_3"],
    "4045a879dc16ec07fffa6217e6898545bebb4c410b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$reference$2d$asset$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["appendAdReferenceImages"],
    "4057a32e8da1e760f6aeaf883bb16e83c894436d98",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_5"],
    "4082dbf34e83d757ef3b4effcdddd122ce322f336f",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_6"],
    "4092b1f82a50c1db8f6ad329ce3a5c2944d43eb06a",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_7"],
    "409c6a162f9158ed6065f6525d94907e9423fa046a",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_8"],
    "40a3088bbcaae3f7f0ff7ccce12a1a44a0019bb119",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$variation$2d$preview$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["commitVariationAdsAction"],
    "40ae0eedb2783eb623d89ce87f72ca5fbf7344c59f",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_1"],
    "40bad6b049d3cdbd0e4623e3c6712746f1b06bcd3f",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$variation$2d$preview$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["previewVariationPromptAction"],
    "40e7df428217a28d413bdcaba894785ade6e877651",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_2"],
    "40ecd3d46559d15a5378ce247f5587dccf4fc7eaf7",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$reference$2d$asset$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["appendJobSharedReferenceImages"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$jobs$2f5b$id$5d2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$reference$2d$asset$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$variation$2d$preview$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/jobs/[id]/page/actions.js { ACTIONS_MODULE0 => "[project]/app/jobs/[id]/page.tsx [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/app/jobs/[id]/reference-asset-actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE2 => "[project]/app/jobs/[id]/variation-preview-actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/jobs/[id]/page.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$reference$2d$asset$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/jobs/[id]/reference-asset-actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$variation$2d$preview$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/jobs/[id]/variation-preview-actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_bd321272._.js.map