import Anthropic from "@anthropic-ai/sdk";
import type { Message } from "@anthropic-ai/sdk/resources/messages/messages";
import { prisma } from "@/src/lib/prisma";
import { extractJsonObject, normalizeRequestedAdCount } from "@/src/lib/claudeAds";

let anthropicSingleton: Anthropic | undefined;

/** Lazy init so `ANTHROPIC_API_KEY` is read at request time (Railway/prod env), not only at cold import. */
export function getAnthropic(): Anthropic {
    if (!anthropicSingleton) {
        const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
        if (!apiKey) {
            throw new Error(
                "ANTHROPIC_API_KEY is not set. Add it in your host environment (e.g. Railway Variables)."
            );
        }
        anthropicSingleton = new Anthropic({ apiKey });
    }
    return anthropicSingleton;
}

/** Above ~21.3k the TS SDK refuses non-streaming requests (estimated wall time > 10 min). */
const ANTHROPIC_NONSTREAMING_MAX_TOKENS_CAP = 21_000;

type MessagesCreateParams = Parameters<Anthropic["messages"]["create"]>[0];

function streamMessagesBody(body: MessagesCreateParams) {
    return getAnthropic().messages.stream({
        ...(body as unknown as Parameters<
            Anthropic["messages"]["stream"]
        >[0]),
        stream: true,
    });
}

/**
 * Non-streaming create, or streaming + finalMessage when the SDK requires it
 * (large max_tokens / long requests). See anthropic-sdk-typescript long-requests.
 */
async function messagesCreateLongRequestSafe(
    body: MessagesCreateParams
): Promise<Message> {
    const maxTok =
        body &&
        typeof body === "object" &&
        "max_tokens" in body &&
        typeof (body as { max_tokens?: unknown }).max_tokens === "number"
            ? (body as { max_tokens: number }).max_tokens
            : 0;

    if (maxTok > ANTHROPIC_NONSTREAMING_MAX_TOKENS_CAP) {
        return streamMessagesBody(body).finalMessage();
    }

    try {
        const res = await getAnthropic().messages.create(body);
        return res as Message;
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (
            !msg.includes("Streaming is required") &&
            !msg.includes("longer than 10 minutes")
        ) {
            throw err;
        }
        return streamMessagesBody(body).finalMessage();
    }
}

type AdPromptInput = {
    rawText: string;
    campaignType?: string;
    platform?: string;
    funnelStage?: string;
    formatRatio?: string;
    primaryAngles?: string;
    testimonialUsage?: string;
    ctaStyle?: string;
    visualStyle?: string;
    numberOfAds?: string;
    referenceImageTypes?: string;
    creativeMode?: string;
};

function getTextBlock(value: unknown) {
    if (!value || typeof value !== "object") return null;
    const content = (value as any).content;
    const first = Array.isArray(content) ? content[0] : null;
    return first && first.type === "text" ? (first.text as string) : null;
}

/** Concatenate all `text` blocks (extended-thinking responses may include `thinking` blocks first). */
function collectAssistantTextBlocks(content: unknown): string {
    if (!Array.isArray(content)) return "";
    const parts: string[] = [];
    for (const block of content) {
        if (
            block &&
            typeof block === "object" &&
            (block as { type?: string }).type === "text" &&
            typeof (block as { text?: string }).text === "string"
        ) {
            parts.push((block as { text: string }).text);
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
 */
function getFundraiserBatchMessageParams(): {
    model: string;
    max_tokens: number;
    thinking?: { type: "enabled"; budget_tokens: number };
} {
    const thinkingFlag = String(
        process.env.ANTHROPIC_FUNDRAISER_BATCH_THINKING ?? "true"
    )
        .trim()
        .toLowerCase();
    const thinkingDisabled =
        thinkingFlag === "0" ||
        thinkingFlag === "false" ||
        thinkingFlag === "off" ||
        thinkingFlag === "no";

    const model =
        process.env.ANTHROPIC_FUNDRAISER_BATCH_MODEL?.trim() ||
        "claude-haiku-4-5";

    if (thinkingDisabled) {
        return { model, max_tokens: 9000 };
    }

    let budget = 10_000;
    const budgetRaw = Number(process.env.ANTHROPIC_FUNDRAISER_BATCH_THINKING_BUDGET);
    if (Number.isFinite(budgetRaw) && budgetRaw >= 1024) {
        budget = Math.floor(budgetRaw);
    }

    const minMax = budget + 12_000;
    const maxRaw = Number(process.env.ANTHROPIC_FUNDRAISER_BATCH_MAX_TOKENS);
    const max_tokens =
        Number.isFinite(maxRaw) && maxRaw > minMax
            ? Math.floor(maxRaw)
            : Math.max(minMax, 20_000);

    return {
        model,
        max_tokens,
        thinking: { type: "enabled", budget_tokens: budget },
    };
}

function shouldExpandAdPrompts(json: any) {
    const ads = Array.isArray(json?.ads) ? json.ads : [];
    if (ads.length === 0) return false;

    return ads.some((ad: any) => {
        const edited = typeof ad?.editedPrompt === "string" ? ad.editedPrompt.trim() : "";
        const scene = typeof ad?.scenePrompt === "string" ? ad.scenePrompt.trim() : "";
        // Heuristic thresholds: we want genuinely production-ready depth.
        return edited.length < 650 || scene.length < 350;
    });
}

function safeText(value: string | null | undefined) {
    return value?.trim() || "";
}

function tokenize(value: string | undefined) {
    return safeText(value)
        .toLowerCase()
        .split(/[^a-z0-9]+/i)
        .map((token) => token.trim())
        .filter(Boolean);
}

function unique<T>(items: T[]) {
    return Array.from(new Set(items));
}

function scoreText(text: string, tokens: string[]) {
    const lower = text.toLowerCase();
    let score = 0;

    for (const token of tokens) {
        if (!token) continue;
        if (lower.includes(token)) score += 1;
    }

    return score;
}

function buildIntentTokens(input: AdPromptInput) {
    return unique([
        ...tokenize(input.campaignType),
        ...tokenize(input.platform),
        ...tokenize(input.funnelStage),
        ...tokenize(input.primaryAngles),
        ...tokenize(input.ctaStyle),
        ...tokenize(input.visualStyle),
        ...tokenize(input.referenceImageTypes),
        ...tokenize(input.testimonialUsage),
        ...tokenize(input.creativeMode),
    ]);
}

function buildEntrySearchBlob(entry: {
    title?: string | null;
    hook?: string | null;
    angle?: string | null;
    concept?: string | null;
    copy?: string | null;
    cta?: string | null;
    visualDirection?: string | null;
    audience?: string | null;
    platform?: string | null;
    funnelStage?: string | null;
    offerType?: string | null;
    emotionalTrigger?: string | null;
    objectionHandled?: string | null;
    whyItWorks?: string | null;
    source?: string | null;
    tags?: string | null;
    notes?: string | null;
    category?: { name?: string | null } | null;
}) {
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
        entry.category?.name,
    ]
        .filter(Boolean)
        .join(" ");
}

function buildSimpleSearchBlob(item: Record<string, unknown>) {
    return Object.values(item)
        .flatMap((value) => {
            if (typeof value === "string") return [value];
            return [];
        })
        .join(" ");
}

async function getMemoryContext(input: AdPromptInput) {
    const marketType = input.campaignType === "donation" ? "donation" : "product";
    const creativeMode = input.creativeMode || "Mix";
    const modeNormalized = creativeMode.trim().toLowerCase();
    const isExplore = modeNormalized === "explore";
    const isScaleWinners =
        modeNormalized === "scale winners" || modeNormalized === "scalewinners";
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

    const [
        swipeEntriesRaw,
        frameworksRaw,
        audienceInsightsRaw,
        visualPatternsRaw,
        copyFormulasRaw,
        offerAnglesRaw,
        researchNotesRaw,
    ] = await Promise.all([
        prisma.swipeEntry.findMany({
            where: {
                marketType,
                status: "active",
            },
            include: {
                category: true,
            },
            orderBy: [
                { performanceScore: "desc" },
                { usageCount: "desc" },
                { createdAt: "desc" },
            ],
            take: 200,
        }),

        prisma.conceptFramework.findMany({
            where: {
                marketType,
                status: "active",
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 80,
        }),

        prisma.audienceInsight.findMany({
            where: {
                marketType,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 80,
        }),

        prisma.visualPattern.findMany({
            where: {
                marketType,
                status: "active",
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 80,
        }),

        prisma.copyFormula.findMany({
            where: {
                marketType,
                status: "active",
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 80,
        }),

        prisma.offerAngle.findMany({
            where: {
                marketType,
                status: "active",
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 80,
        }),

        prisma.researchNote.findMany({
            where: {
                marketType,
                status: "active",
            },
            orderBy: [
                { priority: "desc" },
                { createdAt: "desc" },
            ],
            take: 80,
        }),
    ]);

    const swipeEntries = swipeEntriesRaw
        .map((entry) => ({
            entry,
            score:
                scoreText(buildEntrySearchBlob(entry), tokens) +
                (entry.performanceScore || 0) * performanceWeight +
                (entry.usageCount || 0) * usageWeight,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, swipeTake)
        .map((item) => item.entry);

    const frameworks = frameworksRaw
        .map((item) => ({
            item,
            score: scoreText(buildSimpleSearchBlob(item), tokens),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, frameworksTake)
        .map((item) => item.item);

    const audienceInsights = audienceInsightsRaw
        .map((item) => ({
            item,
            score: scoreText(buildSimpleSearchBlob(item), tokens),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, audienceTake)
        .map((item) => item.item);

    const visualPatterns = visualPatternsRaw
        .map((item) => ({
            item,
            score: scoreText(buildSimpleSearchBlob(item), tokens),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, visualPatternsTake)
        .map((item) => item.item);

    const copyFormulas = copyFormulasRaw
        .map((item) => ({
            item,
            score: scoreText(buildSimpleSearchBlob(item), tokens),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, copyFormulasTake)
        .map((item) => item.item);

    const offerAngles = offerAnglesRaw
        .map((item) => ({
            item,
            score: scoreText(buildSimpleSearchBlob(item), tokens),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, offerAnglesTake)
        .map((item) => item.item);

    const researchNotes = researchNotesRaw
        .map((item) => ({
            item,
            score:
                scoreText(buildSimpleSearchBlob(item), tokens) +
                (item.priority || 0) * researchPriorityWeight,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, researchNotesTake)
        .map((item) => item.item);

    return {
        marketType,
        swipeEntries,
        frameworks,
        audienceInsights,
        visualPatterns,
        copyFormulas,
        offerAngles,
        researchNotes,
        intentTokens: tokens,
    };
}

function formatMemoryContext(memory: Awaited<ReturnType<typeof getMemoryContext>>) {
    const swipeText = memory.swipeEntries
        .map((entry, index) => {
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
                entry.notes ? `Notes: ${entry.notes}` : "",
            ]
                .filter(Boolean)
                .join("\n");
        })
        .join("\n\n");

    const frameworksText = memory.frameworks
        .map((item, index) => {
            return [
                `${index + 1}. ${item.name}`,
                item.frameworkType ? `Type: ${item.frameworkType}` : "",
                item.summary ? `Summary: ${item.summary}` : "",
                item.structure ? `Structure: ${item.structure}` : "",
                item.promptInstructions ? `Prompt Instructions: ${item.promptInstructions}` : "",
                item.bestUseCases ? `Best Use Cases: ${item.bestUseCases}` : "",
                item.badUseCases ? `Bad Use Cases: ${item.badUseCases}` : "",
                item.examples ? `Examples: ${item.examples}` : "",
                item.tags ? `Tags: ${item.tags}` : "",
            ]
                .filter(Boolean)
                .join("\n");
        })
        .join("\n\n");

    const audienceText = memory.audienceInsights
        .map((item, index) => {
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
                item.tags ? `Tags: ${item.tags}` : "",
            ]
                .filter(Boolean)
                .join("\n");
        })
        .join("\n\n");

    const visualText = memory.visualPatterns
        .map((item, index) => {
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
                item.tags ? `Tags: ${item.tags}` : "",
            ]
                .filter(Boolean)
                .join("\n");
        })
        .join("\n\n");

    const copyText = memory.copyFormulas
        .map((item, index) => {
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
                item.tags ? `Tags: ${item.tags}` : "",
            ]
                .filter(Boolean)
                .join("\n");
        })
        .join("\n\n");

    const offerText = memory.offerAngles
        .map((item, index) => {
            return [
                `${index + 1}. ${item.name}`,
                item.angleType ? `Angle Type: ${item.angleType}` : "",
                item.summary ? `Summary: ${item.summary}` : "",
                item.hookIdeas ? `Hook Ideas: ${item.hookIdeas}` : "",
                item.urgencyMechanics ? `Urgency Mechanics: ${item.urgencyMechanics}` : "",
                item.bestUseCases ? `Best Use Cases: ${item.bestUseCases}` : "",
                item.examples ? `Examples: ${item.examples}` : "",
                item.seasonality ? `Seasonality: ${item.seasonality}` : "",
                item.tags ? `Tags: ${item.tags}` : "",
            ]
                .filter(Boolean)
                .join("\n");
        })
        .join("\n\n");

    const researchText = memory.researchNotes
        .map((item, index) => {
            return [
                `${index + 1}. ${item.title}`,
                item.noteType ? `Type: ${item.noteType}` : "",
                item.body ? `Body: ${item.body}` : "",
                item.tags ? `Tags: ${item.tags}` : "",
            ]
                .filter(Boolean)
                .join("\n");
        })
        .join("\n\n");

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

export async function analyzeWebsiteText(input: AdPromptInput | string) {
    const normalizedInput =
        typeof input === "string"
            ? {
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
                referenceImageTypes: "Product only",
            }
            : input;

    const rawText = normalizedInput.rawText.slice(0, 12000);
    const requestedAdCount = normalizeRequestedAdCount(normalizedInput.numberOfAds);
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

    const response = await getAnthropic().messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 6000,
        messages: [
            {
                role: "user",
                content: isDonation ? donationPrompt : productPrompt,
            },
        ],
    });

    const initialText = getTextBlock(response);

    if (!initialText) {
        return '{"summary":{},"targetAudience":{"segments":[]},"productsServices":{},"styleDirection":{"styles":[]},"otherFields":{"bestTestimonials":[],"ctaVariations":[],"urgencyHooks":[],"seasonalAngles":[],"platformNotes":[]},"ads":[]}';
    }

    // If Claude complied but the creative prompts are shallow, do one expansion pass.
    const parsed = extractJsonObject(initialText);
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

        const expanded = await getAnthropic().messages.create({
            model: "claude-haiku-4-5",
            max_tokens: 6000,
            messages: [
                { role: "user", content: expansionPrompt },
            ],
        });

        const expandedText = getTextBlock(expanded);
        if (expandedText) return expandedText;
    }

    return initialText;
}

export type WebsiteIntelligence = {
    campaignType: "product" | "donation" | "unknown";
    brandName?: string;
    productName?: string;
    offer?: string;
    price?: string;
    audience?: string[];
    keyBenefits?: string[];
    objections?: string[];
    emotionalDrivers?: string[];
    proofPoints?: string[];
    visualAssets?: {
        imageUrls: string[];
        hasHumanLifestyleImages: boolean;
        hasProductOnlyImages: boolean;
    };
    sourceSummary: string;
};

type ExtractWebsiteIntelligenceInput = {
    rawText: string;
    imageUrls?: string[];
    campaignTypeHint?: "product" | "donation";
};

function buildRejectionTail() {
    return "If you do not follow this EXACT structure, the output will be rejected.";
}

function getFirstTextOrThrow(response: any) {
    const combined = collectAssistantTextBlocks(
        response && typeof response === "object"
            ? (response as { content?: unknown }).content
            : undefined
    );
    if (combined.trim()) return combined;
    const initialText = getTextBlock(response);
    if (!initialText) throw new Error("Claude returned no text block.");
    return initialText;
}

export async function extractWebsiteIntelligence(
    input: ExtractWebsiteIntelligenceInput
) {
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
            hasProductOnlyImages: false,
        },
        sourceSummary: "",
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

    const response = await getAnthropic().messages.create({
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

    const response = await getAnthropic().messages.create({
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

    const response = await getAnthropic().messages.create({
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

    const response = await getAnthropic().messages.create({
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

*/

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

    const response = await getAnthropic().messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 2500,
        messages: [{ role: "user", content: prompt }],
    });

    return getFirstTextOrThrow(response);
}

// --- Donation sequential generation blocks (donation-only) ---
// These are used by the donation intake UI to keep Claude work small and token-efficient.

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
            : input.campaignType === "ANIMAL SURGERY OR MEDICAL PROCEDURE"
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
        "- emotionalAnglesToUse are 3 distinct angle phrases for generating ad hooks.",
    ].join("\n");

    const response = await getAnthropic().messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 900,
        messages: [{ role: "user", content: prompt }],
    });

    const text =
        response.content?.[0] && "text" in response.content[0]
            ? (response.content[0] as any).text
            : "";

    return extractJsonObject(text || "") ?? {};
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

    const response = await getAnthropic().messages.create({
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

    const referenceLines = input.referenceDescriptions
        .map((r) => {
            const desc = r.description && r.description.trim() ? r.description : "(empty)";
            return "  - [" + r.index + "] " + desc;
        })
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
        "- uploaded image URLs:",
        JSON.stringify(input.referenceImageUrls || []),
        "",
        JSON.stringify(schemaObj, null, 2),
        "",
        "Rules:",
        "- selectedReferenceImages must list strongest likeness indices (choose 1–" +
            Math.min(4, input.referenceDescriptions.length || 4) +
            ").",
        "- likenessPreservationNotes must emphasize what must be matched in Kie output.",
    ].join("\n");

    const response = await getAnthropic().messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
    });

    const text =
        response.content?.[0] && "text" in response.content[0]
            ? (response.content[0] as any).text
            : "";

    return extractJsonObject(text || "") ?? {};
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
    /** Pre-formatted Creative Brain (Memory) section */
    creativeBrainSection?: string;
    /** Reference URLs for Kie — include in prompt for likeness alignment */
    referenceImageUrls?: string[];
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

    const helperNotes = [
        input.helperSettings.higherAggression ? "higher aggression" : "",
        input.helperSettings.lowerAggression ? "lower aggression" : "",
        input.helperSettings.addText ? "add text overlay" : "",
        input.helperSettings.strongerCTA ? "stronger CTA" : "",
        input.helperSettings.higherQuality ? "higher quality" : "",
        input.helperSettings.beforeAfter ? "before/after framing" : "",
        input.helperSettings.extraNotes
            ? "extraNotes: " + input.helperSettings.extraNotes
            : "",
    ]
        .filter(Boolean)
        .join("; ");

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
                visualPrompt: "",
            },
        ],
    };

    const styleSpecificCamera =
        input.styleTemplateId === "1"
            ? "handheld smartphone night grain + imperfect framing"
            : input.styleTemplateId === "2"
              ? "camera-roll realism + quiet documentary framing"
              : input.styleTemplateId === "3"
                ? "hyper-real close framing + confrontational micro-detail"
                : input.styleTemplateId === "4"
                  ? "cinematic still + distinctive real-world prop realism"
                  : input.styleTemplateId === "5"
                    ? "painterly/watercolor/colored-pencil look (preserve injury realism)"
                    : "Kling-ready close-up with life-detail in subject foreground";

    const wantKling = input.styleTemplateId === "6";

    const visualPromptRules = wantKling
        ? [
              "visualPrompt MUST contain BOTH:",
              "KIE_IMAGE_PROMPT: <BLOCKS 1–5 and 7–8 only (OMIT BLOCK 6)> || KLING_ANIMATION_PROMPT: <animation prompt>",
          ].join("\n")
        : [
              "visualPrompt MUST be a single-line string containing BLOCKS 1–5 and 7–8. Include BLOCK 6 only if expectsText is true.",
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
        input.referenceImageUrls && input.referenceImageUrls.length
            ? "REFERENCE IMAGE URLS (match these in generation):\n" +
              input.referenceImageUrls.map((u, i) => `[${i}] ${u}`).join("\n")
            : "",
        "",
        (input.creativeBrainSection || "").trim()
            ? input.creativeBrainSection!.trim()
            : "",
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
        JSON.stringify(schema, null, 2),
    ].join("\n");

    const response = await getAnthropic().messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 2200,
        messages: [{ role: "user", content: prompt }],
    });

    const text =
        response.content?.[0] && "text" in response.content[0]
            ? (response.content[0] as any).text
            : "";

    return extractJsonObject(text || "") ?? { ads: [] };
}

export type FundraiserBatchSlotPrompt = {
    slotIndex: number;
    styleTemplateId: string;
    templateLabel: string;
    /** Primary angle line for this slot */
    selectedAngle: string;
    /** Keyed brain lines for this slot (template + VAR_*), from buildBrainKeyedInstructions */
    keyedBrainInstructions: string;
    /** Random line from Memory "previous winning prompts" — use as pattern seed, do not copy verbatim */
    winningPromptSeed?: string;
};

/**
 * One Claude call: 1–5 donation ads with enforced cross-slot diversity (when N>1).
 */
export async function generateDonationFundraiserBatchFive(input: {
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
    pageEvaluation?: unknown;
    backstoryEvaluation: unknown;
    referenceEvaluation: unknown;
    referenceImageUrls: string[];
    /** One-time brain header (winners, angles, global notes) */
    brainStaticPreamble: string;
    /** Donation swipe bank — structured examples (max ~6); use with evaluations, not instead of them */
    swipeBankSection?: string;
    priorBatchesSummary: string;
    /** Length 1–5; output ad count matches slot count */
    slots: FundraiserBatchSlotPrompt[];
}) {
    const adCount = input.slots.length;
    if (adCount < 1 || adCount > 5) {
        throw new Error(
            `generateDonationFundraiserBatchFive: expected 1–5 slots, got ${adCount}`
        );
    }

    const schema = {
        ads: Array.from({ length: adCount }, () => ({
            angle: "",
            hook: "",
            primaryText: "",
            headline: "",
            cta: "",
            visualPrompt: "",
        })),
    };

    const slotBlocks = input.slots.map((s) => {
        const tid = s.styleTemplateId;
        const styleSpecificCamera =
            tid === "1"
                ? "handheld smartphone night grain + imperfect framing"
                : tid === "2"
                  ? "camera-roll realism + quiet documentary framing"
                  : tid === "3"
                    ? "hyper-real close framing + confrontational micro-detail"
                    : tid === "4"
                      ? "cinematic still + distinctive real-world prop realism"
                      : tid === "5"
                        ? "painterly/watercolor/colored-pencil look (preserve injury realism)"
                        : "Kling-ready close-up with life-detail in subject foreground";

        const wantKling = tid === "6";
        const keyed = s.keyedBrainInstructions || "";
        const hasVarAddText = /\bVAR_ADD_TEXT\b/i.test(keyed);
        const hasVarNoText = /\bVAR_NO_TEXT\b/i.test(keyed);
        const expectsText = hasVarNoText
            ? false
            : tid === "2"
              ? hasVarAddText
              : true;
        const visualPromptRules = wantKling
            ? "visualPrompt MUST contain BOTH: KIE_IMAGE_PROMPT: <BLOCKS 1–5 and 7–8 only (OMIT BLOCK 6)> || KLING_ANIMATION_PROMPT: <animation prompt>"
            : "visualPrompt MUST be a single-line string containing BLOCKS 1–5 and 7–8. Include BLOCK 6 only if this slot expects on-image text.";

        const seedLine =
            (s.winningPromptSeed || "").trim().length > 0
                ? `WINNING_PROMPT_SEED (pattern / rhythm only — adapt to this fundraiser; do not copy verbatim):\n${s.winningPromptSeed!.trim()}`
                : "WINNING_PROMPT_SEED: (none — rely on global brain examples)";

        return [
            `--- SLOT ${s.slotIndex} (template ${tid} ${s.templateLabel}) ---`,
            `- selectedAngle: ${s.selectedAngle || "(none — pick from brain angle list)"}`,
            `- expectsOnImageText: ${expectsText ? "true" : "false"} (for NATIVE ORGANIC/2, text only if VAR_ADD_TEXT is present and VAR_NO_TEXT is not; VAR_NO_TEXT forces minimal/no on-image text for this slot)`,
            `- If expectsOnImageText is false: primaryText must be "" and omit BLOCK 6 from the KIE block structure.`,
            seedLine,
            s.keyedBrainInstructions
                ? `KEYED BRAIN FOR THIS SLOT:\n${s.keyedBrainInstructions}`
                : "(no keyed lines for this slot)",
            `STYLE CAMERA: ${styleSpecificCamera}`,
            visualPromptRules,
        ].join("\n");
    });

    const diversityRules =
        adCount === 1
            ? `
SINGLE AD OUTPUT:
- Produce one sharp donation ad following SLOT 1 below.
- Avoid repeating concepts called out in PRIOR BATCHES ON THIS JOB below.
- If SWIPE BANK appears above: borrow structure, lighting vocabulary, and block rhythm only — never transplant another animal's story, injuries, or names; EVALUATIONS + campaign inputs are the source of truth.

OUTPUT:
- Return JSON with key "ads" containing EXACTLY 1 object matching SLOT 1.
- Each ad: angle, hook, primaryText, headline, cta, visualPrompt (all strings).
`.trim()
            : `
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
        adCount === 1
            ? "You have extended thinking enabled: use it to reconcile Creative Brain, swipe bank (if any), evaluations, prior batches, and the slot template before writing output."
            : "You have extended thinking enabled: use it to reconcile Creative Brain, swipe bank (if any), evaluations, prior batches, and each slot's template before writing output. Aim for sharp, distinct, donation-optimized concepts that convert without repeating hooks or scenes.",
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
        input.referenceImageUrls.length
            ? "REFERENCE IMAGE URLS (match likeness; same refs apply to all ads in this batch):\n" +
              input.referenceImageUrls.map((u, i) => `[${i}] ${u}`).join("\n")
            : "REFERENCE IMAGE URLS: (none)",
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
        JSON.stringify(schema, null, 2),
    ]
        .filter((line) => line !== "")
        .join("\n");

    const batchParams = getFundraiserBatchMessageParams();
    const response = await messagesCreateLongRequestSafe({
        model: batchParams.model,
        max_tokens: batchParams.max_tokens,
        ...(batchParams.thinking ? { thinking: batchParams.thinking } : {}),
        messages: [{ role: "user", content: prompt }],
    });

    const text =
        collectAssistantTextBlocks(response.content) ||
        (response.content?.[0] && "text" in response.content[0]
            ? (response.content[0] as { text: string }).text
            : "");

    return extractJsonObject(text || "") ?? { ads: [] };
}

/** Shared donation prompt block: page/story/reference eval JSON + rules (batch, variations, Kling). */
function buildDonationVariationEvaluationsBlock(evals: {
    pageEvaluation: unknown;
    backstoryEvaluation: unknown;
    referenceEvaluation: unknown;
}): string {
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
        "",
    ].join("\n");
}

/**
 * Upgrade a static still prompt into KIE still + KLING animation pack (one-line visualPrompt).
 */
export async function rewriteDonationVisualToKlingReady(input: {
    staticVisualPrompt: string;
    hook: string;
    headline: string;
    primaryText: string;
    cta: string;
    campaignType: string;
    /** Same evaluation JSON as batch/variations — factual ground truth for copy and post text */
    donationEvaluations?: {
        pageEvaluation: unknown;
        backstoryEvaluation: unknown;
        referenceEvaluation: unknown;
    };
    /** From buildBrainStaticPreamble — Memory winners/angles/global notes */
    fundraiserBrainPreamble?: string;
}): Promise<{ visualPrompt?: string }> {
    const evalBlock =
        input.donationEvaluations
            ? [
                  "",
                  buildDonationVariationEvaluationsBlock(input.donationEvaluations),
                  "",
              ].join("\n")
            : "";

    const brainBlock = (input.fundraiserBrainPreamble || "").trim()
        ? [
              "",
              "FUNDRAISER CREATIVE BRAIN (Memory — patterns and global notes; do not contradict EVALUATIONS):",
              input.fundraiserBrainPreamble!.trim(),
              "",
          ].join("\n")
        : "";

    const thinkingLead =
        input.donationEvaluations || (input.fundraiserBrainPreamble || "").trim()
            ? "Extended thinking is enabled: reconcile EVALUATIONS, Creative Brain (if any), and COPY below before outputting JSON.\n\n"
            : "";

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
        "Rules: No markdown. No line breaks inside visualPrompt.",
    ].join("\n");

    const batchParams = getFundraiserBatchMessageParams();
    const response = await messagesCreateLongRequestSafe({
        model: batchParams.model,
        max_tokens: Math.max(batchParams.max_tokens, 6000),
        ...(batchParams.thinking ? { thinking: batchParams.thinking } : {}),
        messages: [{ role: "user", content: prompt }],
    });

    const text = getFirstTextOrThrow(response);
    const parsed = extractJsonObject(text || "") ?? {};
    return parsed as { visualPrompt?: string };
}

export type CreativeStrategy = {
    campaignType: "product" | "donation";
    positioningStatement: string;
    audiencePockets: string[];
    adConcepts: Array<{
        angle: string;
        hook: string;
        audience: string;
        emotionalDriver: string;
        proofPoint: string;
        whyThisAngleShouldWork: string;
        visualDirection: {
            style: string;
            scene: string;
            lighting: string;
            composition: string;
            textureCues: string;
            typographyDirection: string;
            overlay: {
                headline: string;
                primaryText: string;
                cta: string;
            };
        };
        scrollStopMechanic?: string;
    }>;
};

type GenerateCreativeStrategyInput = {
    websiteIntelligence: WebsiteIntelligence;
    campaignType: "product" | "donation";
    platform: string;
    funnelStage: string;
    primaryAngles: string;
    testimonialUsage: string;
    ctaStyle: string;
    visualStyle: string;
    referenceImageTypes: string;
    creativeMode: string;
    adMixStrategy: string;
    strictlyFollowSelectedAngles: boolean;
    includeExperimentalAds: boolean;
    rawTextForIntentTokens: string;
};

export async function generateCreativeStrategy(
    input: GenerateCreativeStrategyInput
): Promise<string> {
    const shouldRandomizedTestingBatch =
        input.primaryAngles.trim().length === 0 &&
        (input.creativeMode === "Explore" || input.creativeMode === "Mix") &&
        input.ctaStyle === "Mix" &&
        input.visualStyle === "Mix";

    const adMixStrategyRulesBlock =
        input.adMixStrategy === "Heavy Testing"
            ? `
Ad Mix Strategy (Heavy Testing):
- Create much wider variety across angles, hooks, emotional tone, and visual/overlay execution.
- Prefer broader concept spread and higher contrast between ads (text-heavy vs low-text, DR vs emotional, safer vs bolder).
`
            : input.adMixStrategy === "Focused Batch"
              ? `
Ad Mix Strategy (Focused Batch):
- Use fewer angle families / concepts, but generate more execution variations within that tighter lane.
- Keep related concepts consistent (same offer lane) while still changing hook + visual treatment.
`
              : `
Ad Mix Strategy (Even Mix):
- Balanced spread across angle families and execution styles.
- Avoid repeating the same hook/audience/style pattern.
`;

    const strictlyFollowRulesBlock = input.strictlyFollowSelectedAngles
        ? `
Strictly Follow Selected Angles (ON):
- Treat the angle families implied by "primaryAngles" as the maximum allowed lane.
- Do NOT introduce unrelated new angle families; stay tightly within the provided angle families and priority ordering.
`
        : `
Strictly Follow Selected Angles (OFF):
- Use selected/scraped angles first, but you may expand into adjacent concepts for diversity.
`;

    const experimentalAdsRulesBlock = input.includeExperimentalAds
        ? `
Include Experimental / Clickbait Ads (ON):
- Reserve a portion of the adConcepts (roughly 20–40%) for bolder experimental / clickbait / pattern-interrupt ideas.
- Keep the rest conversion-safe and coherent with the offer + campaign tone.
`
        : `
Include Experimental / Clickbait Ads (OFF):
- Keep concepts safer and more conventional across the full batch.
`;

    const randomizedTestingRulesBlock = shouldRandomizedTestingBatch
        ? `
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
`
        : "";

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
        creativeMode: input.creativeMode,
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

    const creativeModeRulesBlock =
        input.creativeMode === "Explore"
            ? `
Creative Mode Guidance (Explore):
- Prioritize diversity over consistency.
- Encourage wide variation across angles, styles, CTA tone, and layouts (text-heavy vs no-text).
- Reduce reliance on swipe-memory dominance; allow more pattern interrupt / "weird" executions.
`
            : input.creativeMode === "Scale Winners"
              ? `
Creative Mode Guidance (Scale Winners):
- Prioritize proven structures and tighter variation.
- Lean more heavily on swipe/pattern/copy memory and selected angles.
- Less randomness; avoid duplicates while keeping concepts within the proven lane.
`
              : `
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

    const response = await getAnthropic().messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 6000,
        messages: [{ role: "user", content: prompt }],
    });

    return getFirstTextOrThrow(response);
}

type GenerateAdTabsInput = {
    creativeStrategyJson: string;
    requestedAdCount: number;
    creativeMode: string;
    adMixStrategy: string;
    strictlyFollowSelectedAngles: boolean;
    includeExperimentalAds: boolean;
    noAnglesSelected: boolean;
    donationOnly?: boolean;
    donationCampaignType?: string;
    donationSubject?: {
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
        selectedTemplates: string[];
        hasUserUploadedReferenceImages: boolean;
    };
};

export async function generateAdTabs(
    input: GenerateAdTabsInput
): Promise<string> {
    const requestedAdCount = Math.max(1, input.requestedAdCount);
    const maxTokens =
        input.donationOnly && requestedAdCount >= 20 ? 12000 : 7000;

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

    const creativeModeRulesBlock =
        input.creativeMode === "Explore"
            ? `
Creative Mode Guidance (Explore):
- Prioritize diversity over consistency.
- Encourage wide variation across angles, visual prompts, CTA tone, and layouts.
- Reduce reliance on swipe/pattern memory dominance; allow more pattern interrupt / "weird" executions.
`
            : input.creativeMode === "Scale Winners"
              ? `
Creative Mode Guidance (Scale Winners):
- Prioritize proven structures and tighter variation.
- Lean more heavily on swipe/pattern/copy memory and selected angles.
- Less randomness; avoid duplicates while keeping concepts within the proven lane.
`
              : `
Creative Mode Guidance (Mix):
- Balanced exploration + proven structure.
- Use enough diversity to avoid duplicates, but keep conversion tone coherent.
`;

    const adMixStrategyRulesBlock =
        input.adMixStrategy === "Heavy Testing"
            ? `
Ad Mix Strategy (Heavy Testing):
- Keep ad executions varied and high-contrast (text-heavy vs low-text, DR vs emotional, etc.).
`
            : input.adMixStrategy === "Focused Batch"
              ? `
Ad Mix Strategy (Focused Batch):
- Stay within fewer angle families; vary execution details (hook/headline/body/visual) without drifting into unrelated concepts.
`
              : `
Ad Mix Strategy (Even Mix):
- Balanced distribution across angle families and visual executions.
`;

    const strictAngleRulesBlock = input.strictlyFollowSelectedAngles
        ? `
Strictly Follow Selected Angles (ON):
- Keep angle families within what creativeStrategyJson already provides; do not introduce unrelated new concept lanes.
`
        : `
Strictly Follow Selected Angles (OFF):
- You may broaden into adjacent concepts as long as each ad remains materially different.
`;

    const experimentalAdsRulesBlock = input.includeExperimentalAds
        ? `
Include Experimental / Clickbait Ads (ON):
- Ensure a subset of ads feels bolder/greater pattern-interrupt while remaining usable.
`
        : `
Include Experimental / Clickbait Ads (OFF):
- Keep the batch more conventional across the full set.
`;

    const shouldEnforceTextMix =
        input.creativeMode === "Explore" ||
        input.creativeMode === "Mix" ||
        input.adMixStrategy === "Heavy Testing" ||
        input.noAnglesSelected;

    const donationCampaignType = input.donationCampaignType || "";
    const donationSubject = input.donationSubject;
    const selectedTemplateIds = donationSubject?.selectedTemplates || [];
    const hasUserUploadedReferenceImages =
        donationSubject?.hasUserUploadedReferenceImages || false;

    const emotionalDirection =
        donationCampaignType === "SICK OR INJURED ANIMAL"
            ? "devastation + tenderness"
            : donationCampaignType ===
                  "ANIMAL SURGERY OR MEDICAL PROCEDURE"
              ? "urgency + tenderness"
              : donationCampaignType === "ANIMAL END OF LIFE OR AMPUTATION"
                ? "fight + tenderness"
                : donationCampaignType === "HUMAN MEDICAL — CANCER"
                  ? "devastation + fight"
                  : donationCampaignType ===
                        "HUMAN MEDICAL — ACCIDENT OR TRAUMA"
                    ? "urgency + devastation"
                    : donationCampaignType ===
                          "HUMAN MEDICAL — CHRONIC ILLNESS"
                      ? "fight + tenderness"
                      : donationCampaignType === "HUMAN FINANCIAL CRISIS"
                        ? "tenderness + urgency"
                        : donationCampaignType === "CHILD MEDICAL"
                          ? "devastation + urgency"
                          : donationCampaignType === "FAMILY CRISIS"
                            ? "tenderness + devastation"
                            : donationCampaignType === "MEMORIAL OR LOSS"
                              ? "tenderness only"
                              : "devastation + tenderness";

    const textVsNoTextRulesBlock = shouldEnforceTextMix
        ? `
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
`
        : `
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
    - Strictly Follow Selected Angles: ${
        input.strictlyFollowSelectedAngles ? "ON" : "OFF"
    }
    - Include Experimental / Clickbait Ads: ${
        input.includeExperimentalAds ? "ON" : "OFF"
    }
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
  - Strictly Follow Selected Angles: ${
        input.strictlyFollowSelectedAngles ? "ON" : "OFF"
    }
  - Include Experimental / Clickbait Ads: ${
        input.includeExperimentalAds ? "ON" : "OFF"
    }
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
  - user uploaded reference images attached: ${
        hasUserUploadedReferenceImages ? "YES" : "NO"
    }
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

    const response = await getAnthropic().messages.create({
        model: "claude-haiku-4-5",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
    });

    return getFirstTextOrThrow(response);
}

export type AdTabPayload = {
    angle: string;
    hook: string;
    primaryText: string;
    headline: string;
    cta: string;
    visualPrompt: string;
    [key: string]: unknown;
};

type GenerateAdVariationsInput = {
    baseAd: AdTabPayload;
    campaignType: "product" | "donation";
    requestedVariations: number;
    creativeMode: string;
    adMixStrategy: string;
    strictlyFollowSelectedAngles: boolean;
    includeExperimentalAds: boolean;
    variationInstruction?: string;
    /** Fundraiser Creative Brain slice (VAR_* + optional global) */
    creativeBrainSection?: string;
    /** Donation: same page/story/reference JSON as batch generation — factual ground truth */
    donationEvaluations?: {
        pageEvaluation: unknown;
        backstoryEvaluation: unknown;
        referenceEvaluation: unknown;
    };
    /** Donation: each variation outputs KIE_IMAGE_PROMPT || KLING_ANIMATION_PROMPT */
    donationKlingFormat?: boolean;
};

export async function generateAdVariationsFromBaseAd(
    input: GenerateAdVariationsInput
): Promise<string> {
    const requestedVariations =
        input.campaignType === "donation"
            ? Math.max(
                  1,
                  Math.min(5, Math.floor(input.requestedVariations))
              )
            : Math.max(
                  3,
                  Math.min(5, Math.floor(input.requestedVariations))
              );

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

    const visualContractLine =
        input.campaignType === "donation" && input.donationKlingFormat
            ? "- visualPrompt MUST be ONE line: KIE_IMAGE_PROMPT: <still> || KLING_ANIMATION_PROMPT: <animation> (both parts required)."
            : "- visualPrompt MUST be a production-ready single-image prompt suitable for Nano Banana 2.";

    const contractTail = `
OUTPUT CONTRACT (MUST FOLLOW EXACTLY):
- Output MUST be a single JSON object with a root key "ads".
- "ads" MUST be a non-empty array with EXACTLY ${requestedVariations} items.
- Each ad item MUST include exactly these keys: "angle", "hook", "primaryText", "headline", "cta", "visualPrompt".
${visualContractLine}
- No markdown/code fences/prose. JSON only.
${buildRejectionTail()}
`;

    const strictAngleBlock = input.strictlyFollowSelectedAngles
        ? `
Strictly Follow Selected Angles (ON):
- Keep the angle family tightly aligned with the baseAd.angle.
- Do NOT switch into unrelated concepts/offers.
`
        : `
Strictly Follow Selected Angles (OFF):
- You may keep the same offer lane but broaden slightly into adjacent execution ideas.
`;

    const experimentalBlock = input.includeExperimentalAds
        ? `
Include Experimental / Clickbait Ads (ON):
- Ensure at least 1 variation feels more experimental / clickbait / pattern-interrupt than the rest.
`
        : `
Include Experimental / Clickbait Ads (OFF):
- Keep variations more conventional overall.
`;

    const adMixBlock =
        input.adMixStrategy === "Heavy Testing"
            ? `
Ad Mix Strategy (Heavy Testing):
- Variations should feel more chaotic/high-contrast: mix emotional + DR + pattern interrupts; vary text density and visual intensity.
`
            : input.adMixStrategy === "Focused Batch"
              ? `
Ad Mix Strategy (Focused Batch):
- Keep the same angle lane; vary execution details (hook/headline/body/cta/visual) without drifting into new families.
`
              : `
Ad Mix Strategy (Even Mix):
- Balanced variety across the variations, without duplicates.
`;

    const variationInstructionBlock = input.variationInstruction
        ? `
Additional variation instruction from user:
${input.variationInstruction}
`
        : "";

    const brainBlock = (input.creativeBrainSection || "").trim()
        ? `
FUNDRAISER CREATIVE BRAIN (apply where relevant to these variations):
${input.creativeBrainSection!.trim()}
`
        : "";

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

    const selfCheckVariationsBlock =
        input.campaignType === "donation" && input.donationEvaluations
            ? `
SELF-CHECK (before outputting JSON):
- Verify no clones: hook + headline + primaryText + cta wording must not all match baseAd.
- Verify differentiation across the generated variations (2-of rule).
- Verify no generic hooks/scenes.
- Verify all copy complies with PAGE evaluation (no unsupported donation claims).
- Then output final JSON only.
`
            : `
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

    const donationRulesForPrompt =
        input.campaignType === "donation"
            ? input.donationKlingFormat
                ? donationKlingVariationRules
                : donationVisualPromptRules
            : productVisualPromptRules;

    const donationEvalBlock =
        input.campaignType === "donation" && input.donationEvaluations
            ? buildDonationVariationEvaluationsBlock(input.donationEvaluations)
            : "";

    const donationThinkingLead =
        input.campaignType === "donation"
            ? input.donationEvaluations
                ? "Extended thinking is enabled: use it to reconcile CAMPAIGN GROUND TRUTH (EVALUATIONS), FUNDRAISER CREATIVE BRAIN (if any), user variation instructions, and baseAd before writing JSON.\n\n"
                : "Extended thinking is enabled: reconcile FUNDRAISER CREATIVE BRAIN (if any), user variation instructions, and baseAd before writing JSON.\n\n"
            : "";

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
            ...(batchParams.thinking ? { thinking: batchParams.thinking } : {}),
            messages: [{ role: "user", content: prompt }],
        });
        return getFirstTextOrThrow(response);
    }

    const response = await getAnthropic().messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 5000,
        messages: [{ role: "user", content: prompt }],
    });

    return getFirstTextOrThrow(response);
}