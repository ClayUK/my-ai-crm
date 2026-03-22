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
        ...tokenize(input.testimonialUsage)
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
    const tokens = buildIntentTokens(input);
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
            score: scoreText(buildEntrySearchBlob(entry), tokens) + (entry.performanceScore || 0) * 0.25 + (entry.usageCount || 0) * 0.1
        })).sort((a, b)=>b.score - a.score).slice(0, 25).map((item)=>item.entry);
    const frameworks = frameworksRaw.map((item)=>({
            item,
            score: scoreText(buildSimpleSearchBlob(item), tokens)
        })).sort((a, b)=>b.score - a.score).slice(0, 12).map((item)=>item.item);
    const audienceInsights = audienceInsightsRaw.map((item)=>({
            item,
            score: scoreText(buildSimpleSearchBlob(item), tokens)
        })).sort((a, b)=>b.score - a.score).slice(0, 12).map((item)=>item.item);
    const visualPatterns = visualPatternsRaw.map((item)=>({
            item,
            score: scoreText(buildSimpleSearchBlob(item), tokens)
        })).sort((a, b)=>b.score - a.score).slice(0, 10).map((item)=>item.item);
    const copyFormulas = copyFormulasRaw.map((item)=>({
            item,
            score: scoreText(buildSimpleSearchBlob(item), tokens)
        })).sort((a, b)=>b.score - a.score).slice(0, 10).map((item)=>item.item);
    const offerAngles = offerAnglesRaw.map((item)=>({
            item,
            score: scoreText(buildSimpleSearchBlob(item), tokens)
        })).sort((a, b)=>b.score - a.score).slice(0, 10).map((item)=>item.item);
    const researchNotes = researchNotesRaw.map((item)=>({
            item,
            score: scoreText(buildSimpleSearchBlob(item), tokens) + (item.priority || 0) * 0.25
        })).sort((a, b)=>b.score - a.score).slice(0, 12).map((item)=>item.item);
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
        referenceImageTypes: input.referenceImageTypes
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
    const prompt = `
You are converting creative strategy into final AD TAB payloads.

Task:
- Use creativeStrategyJson.adConcepts to create EXACTLY ${requestedAdCount} ad concepts.
- Each concept must be materially different.

Return VALID JSON ONLY with this exact schema:
${commonAdsSchema}

Hard rules:
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
    return url.toString();
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
    const requiredFields = [
        "angle",
        "hook",
        "primaryText",
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
        for (const field of requiredFields){
            const value = ad[field];
            if (typeof value !== "string" || !value.trim()) missing.push(String(field));
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
"[project]/app/new/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "$$RSC_SERVER_ACTION_0",
    ()=>$$RSC_SERVER_ACTION_0,
    "default",
    ()=>NewJobPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"40730f95c785369b4ed2e31e5d2ca0bfdd6084b025":"$$RSC_SERVER_ACTION_0"},"",""] */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$anthropic$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/anthropic.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scrape$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/scrape.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claudeAds$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/claudeAds.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claude$2f$parseClaudeJson$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/claude/parseClaudeJson.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
function stripHtml(html) {
    return html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function getErrorMessage(error) {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    try {
        return JSON.stringify(error);
    } catch  {
        return "Unknown error";
    }
}
function normalizeAdCount(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return "6";
    if (parsed < 1) return "1";
    if (parsed > 1000) return "1000";
    return String(Math.floor(parsed));
}
const $$RSC_SERVER_ACTION_0 = async function createJob(formData) {
    const urlRaw = formData.get("url")?.toString().trim();
    const campaignType = formData.get("campaignType")?.toString().trim() || "product";
    const platform = formData.get("platform")?.toString().trim() || "Meta";
    const funnelStage = formData.get("funnelStage")?.toString().trim() || "Mix";
    const formatRatio = formData.get("formatRatio")?.toString().trim() || "70% 9:16 / 30% 1080x1080";
    const primaryAngles = formData.get("primaryAngles")?.toString().trim() || "Problem/Solution, Lifestyle, Urgency";
    const testimonialUsage = formData.get("testimonialUsage")?.toString().trim() || "Mix";
    const ctaStyle = formData.get("ctaStyle")?.toString().trim() || "Mix";
    const visualStyle = formData.get("visualStyle")?.toString().trim() || "Mix";
    const numberOfAds = normalizeAdCount(formData.get("numberOfAds")?.toString().trim());
    const requestedCount = Number(numberOfAds);
    const referenceImageTypes = formData.get("referenceImageTypes")?.toString().trim() || "Product only";
    if (!urlRaw) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/new?error=${encodeURIComponent("URL is required")}`);
    }
    // Important: `job.url` must come only from the submitted input.
    // Do not overwrite it with redirect targets from the scraper.
    let jobUrl = urlRaw;
    let rawText = "";
    let scrapeStatus = null;
    let scrapedImageUrls = [];
    try {
        jobUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scrape$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeAndValidatePublicUrl"])(urlRaw);
    } catch (error) {
        const message = getErrorMessage(error);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/new?error=${encodeURIComponent(message)}`);
    }
    try {
        const scraped = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scrape$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["scrapeUrlToHtml"])(jobUrl);
        scrapedImageUrls = scraped.imageUrls || [];
        rawText = stripHtml(scraped.html).slice(0, 15000);
        if (!rawText.trim()) {
            scrapeStatus = `scrape_empty_text (status ${scraped.status})`;
        }
    } catch (error) {
        const message = getErrorMessage(error);
        // We still create the job so the user can see the failure reason.
        scrapeStatus = `scrape_error: ${message}`;
        rawText = "";
    }
    let claudeOutput = "";
    let kieResult = null;
    let status = scrapeStatus ? "scrape_error" : "processed";
    let adTabStageSucceeded = false;
    let stageFailure = null;
    let currentStage = "unknown";
    if (!scrapeStatus) {
        try {
            currentStage = "website_intelligence";
            const intelligenceRaw = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$anthropic$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extractWebsiteIntelligence"])({
                rawText,
                imageUrls: scrapedImageUrls,
                campaignTypeHint: campaignType === "donation" ? "donation" : "product"
            });
            const intelligenceParsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claudeAds$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extractJsonObject"])(intelligenceRaw);
            const websiteIntelligence = {
                campaignType: intelligenceParsed?.campaignType === "donation" ? "donation" : intelligenceParsed?.campaignType === "product" ? "product" : "unknown",
                brandName: typeof intelligenceParsed?.brandName === "string" ? intelligenceParsed.brandName : undefined,
                productName: typeof intelligenceParsed?.productName === "string" ? intelligenceParsed.productName : undefined,
                offer: typeof intelligenceParsed?.offer === "string" ? intelligenceParsed.offer : undefined,
                price: typeof intelligenceParsed?.price === "string" ? intelligenceParsed.price : undefined,
                audience: Array.isArray(intelligenceParsed?.audience) ? intelligenceParsed.audience.filter((x)=>typeof x === "string") : undefined,
                keyBenefits: Array.isArray(intelligenceParsed?.keyBenefits) ? intelligenceParsed.keyBenefits.filter((x)=>typeof x === "string") : undefined,
                objections: Array.isArray(intelligenceParsed?.objections) ? intelligenceParsed.objections.filter((x)=>typeof x === "string") : undefined,
                emotionalDrivers: Array.isArray(intelligenceParsed?.emotionalDrivers) ? intelligenceParsed.emotionalDrivers.filter((x)=>typeof x === "string") : undefined,
                proofPoints: Array.isArray(intelligenceParsed?.proofPoints) ? intelligenceParsed.proofPoints.filter((x)=>typeof x === "string") : undefined,
                visualAssets: intelligenceParsed?.visualAssets && typeof intelligenceParsed.visualAssets === "object" ? {
                    imageUrls: Array.isArray(intelligenceParsed.visualAssets.imageUrls) ? intelligenceParsed.visualAssets.imageUrls.filter((x)=>typeof x === "string") : [],
                    hasHumanLifestyleImages: Boolean(intelligenceParsed.visualAssets.hasHumanLifestyleImages),
                    hasProductOnlyImages: Boolean(intelligenceParsed.visualAssets.hasProductOnlyImages)
                } : undefined,
                sourceSummary: typeof intelligenceParsed?.sourceSummary === "string" ? intelligenceParsed.sourceSummary : rawText.slice(0, 500)
            };
            const effectiveCampaignType = websiteIntelligence.campaignType === "donation" ? "donation" : websiteIntelligence.campaignType === "product" ? "product" : campaignType === "donation" ? "donation" : "product";
            currentStage = "creative_strategy";
            const strategyRaw = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$anthropic$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generateCreativeStrategy"])({
                websiteIntelligence,
                campaignType: effectiveCampaignType,
                platform,
                funnelStage,
                primaryAngles,
                testimonialUsage,
                ctaStyle,
                visualStyle,
                referenceImageTypes,
                rawTextForIntentTokens: rawText
            });
            currentStage = "ad_tab_generation";
            claudeOutput = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$anthropic$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generateAdTabs"])({
                creativeStrategyJson: strategyRaw,
                requestedAdCount: requestedCount
            });
            adTabStageSucceeded = true;
            kieResult = JSON.stringify({
                websiteIntelligence,
                creativeStrategy: strategyRaw
            }, null, 2);
        } catch (error) {
            const message = getErrorMessage(error);
            status = currentStage === "website_intelligence" ? "website_intelligence_error" : currentStage === "creative_strategy" ? "creative_strategy_error" : currentStage === "ad_tab_generation" ? "ad_tab_generation_error" : "claude_error";
            stageFailure = {
                stage: currentStage,
                message
            };
            claudeOutput = JSON.stringify({
                ads: [],
                stage: currentStage,
                error: message
            }, null, 2);
            kieResult = JSON.stringify({
                stage: currentStage,
                error: message
            }, null, 2);
        }
    } else {
        claudeOutput = JSON.stringify({
            ads: [],
            error: scrapeStatus
        }, null, 2);
        kieResult = JSON.stringify({
            scrapeStatus
        }, null, 2);
    }
    const job = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.create({
        data: {
            url: jobUrl,
            campaignType,
            rawText,
            claudeOutput,
            status,
            kieResult: kieResult ?? null,
            platform,
            funnelStage,
            formatRatio,
            primaryAngles,
            testimonialUsage,
            ctaStyle,
            visualStyle,
            numberOfAds,
            referenceImageTypes
        }
    });
    if (!adTabStageSucceeded) {
        // Persist scraped reference images for later regeneration.
        if (scrapedImageUrls.length > 0) {
            const unique = Array.from(new Set(scrapedImageUrls)).slice(0, 25);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.createMany({
                data: unique.map((url, index)=>({
                        jobId: job.id,
                        adId: null,
                        filePath: url,
                        originalName: `scraped-image-${index + 1}`,
                        mimeType: null
                    }))
            });
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${job.id}?stageError=1&stage=${encodeURIComponent(stageFailure?.stage || "unknown")}`);
    }
    const parsedAdsResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claude$2f$parseClaudeJson$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseValidateAndNormalizeClaudeAds"])(claudeOutput, requestedCount);
    const diagnostics = parsedAdsResult.diagnostics;
    const diagJson = JSON.stringify(diagnostics, null, 2);
    if (!parsedAdsResult.ok) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.update({
            where: {
                id: job.id
            },
            data: {
                status: "ad_parse_error",
                claudeOutput: `${claudeOutput || ""}

__CLAUDE_PARSE_DIAGNOSTICS__
${diagJson}
__END_CLAUDE_PARSE_DIAGNOSTICS__`
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${job.id}?parseError=1`);
    }
    // Save scraped reference images (job-level/shared) for Kie.
    if (scrapedImageUrls.length > 0) {
        const unique = Array.from(new Set(scrapedImageUrls)).slice(0, 25);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.createMany({
            data: unique.map((url, index)=>({
                    jobId: job.id,
                    adId: null,
                    filePath: url,
                    originalName: `scraped-image-${index + 1}`,
                    mimeType: null
                }))
        });
    }
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.createMany({
        data: parsedAdsResult.ads.map((ad, index)=>({
                jobId: job.id,
                adNumber: index + 1,
                title: ad.angle || ad.headline || `Ad ${index + 1}`,
                sourceBlock: JSON.stringify(ad, null, 2),
                editedPrompt: String(ad.visualPrompt || "").trim(),
                status: "ready"
            }))
    });
    const returnedCount = typeof diagnostics.returnedAdCount === "number" ? diagnostics.returnedAdCount : parsedAdsResult.ads.length;
    const finalStatus = returnedCount === 0 ? "ad_parse_error" : returnedCount === requestedCount ? "success" : "processed_with_warnings";
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.update({
        where: {
            id: job.id
        },
        data: {
            status: finalStatus,
            claudeOutput: `${claudeOutput || ""}

__CLAUDE_PARSE_DIAGNOSTICS__
${diagJson}
__END_CLAUDE_PARSE_DIAGNOSTICS__`
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${job.id}?ad=1`);
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_0, "40730f95c785369b4ed2e31e5d2ca0bfdd6084b025", null);
var createJob = $$RSC_SERVER_ACTION_0;
function NewJobPage({ searchParams }) {
    const error = searchParams?.error ? String(searchParams.error) : "";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        style: {
            padding: 40,
            maxWidth: 900
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                children: "Create New Campaign"
            }, void 0, false, {
                fileName: "[project]/app/new/page.tsx",
                lineNumber: 405,
                columnNumber: 13
            }, this),
            error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 16,
                    padding: 12,
                    border: "1px solid #7a1d1d",
                    background: "#1a0b0b",
                    color: "#ffb4b4",
                    whiteSpace: "pre-wrap"
                },
                children: error
            }, void 0, false, {
                fileName: "[project]/app/new/page.tsx",
                lineNumber: 408,
                columnNumber: 17
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                action: createJob,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 20
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "campaignType",
                                children: "Campaign Type"
                            }, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 424,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 425,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                id: "campaignType",
                                name: "campaignType",
                                defaultValue: "product",
                                style: {
                                    width: 260,
                                    padding: 8,
                                    marginTop: 8
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "product",
                                        children: "Product / Ecommerce"
                                    }, void 0, false, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 432,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "donation",
                                        children: "Donation / Fundraiser"
                                    }, void 0, false, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 433,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 426,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/new/page.tsx",
                        lineNumber: 423,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 20
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "url",
                                children: "Website URL"
                            }, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 438,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 439,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                id: "url",
                                name: "url",
                                type: "url",
                                placeholder: "https://example.com/product-page",
                                required: true,
                                style: {
                                    width: 500,
                                    padding: 8,
                                    marginTop: 8
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 440,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/new/page.tsx",
                        lineNumber: 437,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 20
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "platform",
                                children: "Platform"
                            }, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 451,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 452,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                id: "platform",
                                name: "platform",
                                defaultValue: "Meta",
                                style: {
                                    width: 260,
                                    padding: 8,
                                    marginTop: 8
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "Meta"
                                    }, void 0, false, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 459,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "TikTok"
                                    }, void 0, false, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 460,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "Pinterest"
                                    }, void 0, false, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 461,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "Google Display"
                                    }, void 0, false, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 462,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "Mix"
                                    }, void 0, false, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 463,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 453,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/new/page.tsx",
                        lineNumber: 450,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 20
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "funnelStage",
                                children: "Funnel Stage"
                            }, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 468,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 469,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                id: "funnelStage",
                                name: "funnelStage",
                                defaultValue: "Mix",
                                style: {
                                    width: 260,
                                    padding: 8,
                                    marginTop: 8
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "Cold"
                                    }, void 0, false, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 476,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "Warm"
                                    }, void 0, false, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 477,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "Mix"
                                    }, void 0, false, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 478,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 470,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/new/page.tsx",
                        lineNumber: 467,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 20
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "formatRatio",
                                children: "Format Ratio"
                            }, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 483,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 484,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                id: "formatRatio",
                                name: "formatRatio",
                                defaultValue: "70% 9:16 / 30% 1080x1080",
                                style: {
                                    width: 320,
                                    padding: 8,
                                    marginTop: 8
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 485,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/new/page.tsx",
                        lineNumber: 482,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 20
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "primaryAngles",
                                children: "Primary Angles"
                            }, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 494,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 495,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                id: "primaryAngles",
                                name: "primaryAngles",
                                defaultValue: "Problem/Solution, Lifestyle, Urgency",
                                style: {
                                    width: 500,
                                    padding: 8,
                                    marginTop: 8
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 496,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/new/page.tsx",
                        lineNumber: 493,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 20
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "testimonialUsage",
                                children: "Testimonial Usage"
                            }, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 505,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 506,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                id: "testimonialUsage",
                                name: "testimonialUsage",
                                defaultValue: "Mix",
                                style: {
                                    width: 260,
                                    padding: 8,
                                    marginTop: 8
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "Yes"
                                    }, void 0, false, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 513,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "No"
                                    }, void 0, false, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 514,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "Mix"
                                    }, void 0, false, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 515,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 507,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/new/page.tsx",
                        lineNumber: 504,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 20
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "ctaStyle",
                                children: "CTA Style"
                            }, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 520,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 521,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                id: "ctaStyle",
                                name: "ctaStyle",
                                defaultValue: "Mix",
                                style: {
                                    width: 260,
                                    padding: 8,
                                    marginTop: 8
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "Hard sell"
                                    }, void 0, false, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 528,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "Soft"
                                    }, void 0, false, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 529,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "Mix"
                                    }, void 0, false, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 530,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 522,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/new/page.tsx",
                        lineNumber: 519,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 20
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "visualStyle",
                                children: "Visual Style"
                            }, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 535,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 536,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                id: "visualStyle",
                                name: "visualStyle",
                                defaultValue: "Mix",
                                style: {
                                    width: 260,
                                    padding: 8,
                                    marginTop: 8
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "Minimal"
                                    }, void 0, false, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 543,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "Lifestyle"
                                    }, void 0, false, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 544,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "Bold DR"
                                    }, void 0, false, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 545,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "Mix"
                                    }, void 0, false, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 546,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 537,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/new/page.tsx",
                        lineNumber: 534,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 20
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "numberOfAds",
                                children: "Exact Number of Ads (1–1000)"
                            }, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 551,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 552,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                id: "numberOfAds",
                                name: "numberOfAds",
                                type: "number",
                                min: "1",
                                max: "1000",
                                step: "1",
                                defaultValue: "6",
                                style: {
                                    width: 260,
                                    padding: 8,
                                    marginTop: 8
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 553,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/new/page.tsx",
                        lineNumber: 550,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 20
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "referenceImageTypes",
                                children: "Reference Image Types Available"
                            }, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 566,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 569,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                id: "referenceImageTypes",
                                name: "referenceImageTypes",
                                defaultValue: "Product only",
                                style: {
                                    width: 260,
                                    padding: 8,
                                    marginTop: 8
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "Product only"
                                    }, void 0, false, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 576,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "Lifestyle"
                                    }, void 0, false, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 577,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "Mix"
                                    }, void 0, false, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 578,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 570,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/new/page.tsx",
                        lineNumber: 565,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 24
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "submit",
                            children: "Create Campaign"
                        }, void 0, false, {
                            fileName: "[project]/app/new/page.tsx",
                            lineNumber: 583,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/new/page.tsx",
                        lineNumber: 582,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/new/page.tsx",
                lineNumber: 422,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/new/page.tsx",
        lineNumber: 404,
        columnNumber: 9
    }, this);
}
}),
"[project]/.next-internal/server/app/new/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/new/page.tsx [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$new$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/new/page.tsx [app-rsc] (ecmascript)");
;
}),
"[project]/.next-internal/server/app/new/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/new/page.tsx [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "40730f95c785369b4ed2e31e5d2ca0bfdd6084b025",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$new$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_0"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$new$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$new$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/new/page/actions.js { ACTIONS_MODULE0 => "[project]/app/new/page.tsx [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$new$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/new/page.tsx [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_86fa359b._.js.map