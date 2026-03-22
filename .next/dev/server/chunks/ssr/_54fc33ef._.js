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
"[project]/src/lib/defaultMemory.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "seedDefaultMemory",
    ()=>seedDefaultMemory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-rsc] (ecmascript)");
;
const productCategoryNames = [
    {
        name: "Hooks",
        description: "Winning hook patterns and lead-ins"
    },
    {
        name: "Angles",
        description: "Strategic ad angles and themes"
    },
    {
        name: "Audience Pockets",
        description: "Specific audience personas and subsegments"
    },
    {
        name: "Visual Styles",
        description: "Reusable visual directions and creative looks"
    },
    {
        name: "CTA Styles",
        description: "Direct response and softer CTA patterns"
    },
    {
        name: "Scroll Stop Mechanics",
        description: "Pattern interrupts and thumb-stop ideas"
    },
    {
        name: "Reference Image Guidance",
        description: "What kinds of assets to upload"
    },
    {
        name: "Typography Direction",
        description: "Type styles and layout feel"
    },
    {
        name: "Platform Notes",
        description: "Platform-specific ad behavior notes"
    },
    {
        name: "Offer Angles",
        description: "Sale, urgency, gift, and conversion framing"
    }
];
const donationCategoryNames = [
    {
        name: "Donation Hooks",
        description: "Donation-specific hooks and lead-ins"
    },
    {
        name: "Impact Angles",
        description: "Ways to frame the impact of giving"
    },
    {
        name: "Donor Psychology",
        description: "Emotional triggers and donor motivations"
    },
    {
        name: "Urgency & Matching",
        description: "Deadlines, matches, and urgent asks"
    },
    {
        name: "Story Formats",
        description: "Narrative and testimonial structures"
    },
    {
        name: "Recurring Giving",
        description: "Monthly giving and sustainer messaging"
    },
    {
        name: "Trust & Proof",
        description: "Credibility, transparency, and proof devices"
    },
    {
        name: "Platform Notes",
        description: "Platform behavior for donation offers"
    }
];
async function ensureCategory(name, description, marketType) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].swipeCategory.upsert({
        where: {
            name_marketType: {
                name,
                marketType
            }
        },
        update: {
            description
        },
        create: {
            name,
            description,
            marketType
        }
    });
}
async function seedDefaultMemory(marketType) {
    if (marketType === "product") {
        const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].swipeEntry.count({
            where: {
                marketType: "product"
            }
        });
        if (existing > 0) {
            return {
                skipped: true,
                reason: "Product memory already seeded"
            };
        }
        const categories = new Map();
        for (const category of productCategoryNames){
            const created = await ensureCategory(category.name, category.description, "product");
            categories.set(category.name, created.id);
        }
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].swipeEntry.createMany({
            data: [
                {
                    marketType: "product",
                    categoryId: categories.get("Angles"),
                    title: "Problem/Solution",
                    angle: "Problem/Solution",
                    concept: "Show the pain point clearly, then show the product as the clean fix.",
                    audience: "Broad cold audience",
                    whyItWorks: "Fastest path to clarity and direct response.",
                    tags: "core,product,pain point,direct response"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Angles"),
                    title: "Parental Relief",
                    angle: "Parental Relief",
                    concept: "Focus on the emotional relief a parent feels when the product removes friction, guilt, chaos, or conflict.",
                    audience: "Parents",
                    emotionalTrigger: "relief,guilt reduction,calm",
                    whyItWorks: "High emotional resonance for parenting products.",
                    tags: "parents,emotion,relief"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Angles"),
                    title: "Lifestyle / Aspiration",
                    angle: "Lifestyle/Aspiration",
                    concept: "Sell the identity, the desired life, and the outcome around the product.",
                    audience: "Identity-driven buyers",
                    whyItWorks: "People buy the future self, not only the item.",
                    tags: "aspiration,identity,lifestyle"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Angles"),
                    title: "Outdoor / Adventure",
                    angle: "Outdoor/Adventure",
                    concept: "Frame the product around activity, movement, freedom, and real-world use.",
                    audience: "Outdoorsy families",
                    whyItWorks: "Adds energy and use-case specificity.",
                    tags: "outdoor,adventure,activity"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Angles"),
                    title: "Gift Angle",
                    angle: "Gift",
                    concept: "Position the product as a smart gift for birthdays, holidays, grandparents, or teachers.",
                    audience: "Gift buyers",
                    whyItWorks: "Expands use-case beyond direct self-purchase.",
                    tags: "gift,holiday,occasion"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Angles"),
                    title: "Deal / Urgency",
                    angle: "Deal/Urgency",
                    concept: "Lead with sale, scarcity, timing, and social proof.",
                    audience: "Price-sensitive buyers",
                    emotionalTrigger: "FOMO, urgency",
                    whyItWorks: "Strong conversion driver when the offer is real.",
                    tags: "sale,urgency,fomo"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Angles"),
                    title: "Education / Development",
                    angle: "Education",
                    concept: "Focus on learning, development, progress, or skills built through the product.",
                    audience: "Parents, homeschool buyers",
                    whyItWorks: "Rational + emotional combined.",
                    tags: "education,development,learning"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Audience Pockets"),
                    title: "Exhausted Millennial Moms",
                    audience: "Exhausted millennial moms",
                    concept: "Tired, overloaded, juggling everything, wants practical relief and less chaos.",
                    emotionalTrigger: "relief,control,calm",
                    whyItWorks: "Clear emotional pain and large buyer segment.",
                    tags: "moms,parenting,chaos,relief"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Audience Pockets"),
                    title: "Homeschool Parents",
                    audience: "Homeschool parents",
                    concept: "Value educational payoff, structure, intentionality, and practical use.",
                    whyItWorks: "Strong need-state and rational buyer logic.",
                    tags: "homeschool,education,parents"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Audience Pockets"),
                    title: "Outdoorsy Families",
                    audience: "Outdoorsy families",
                    concept: "Value movement, exploration, and non-screen engagement.",
                    whyItWorks: "Pairs well with adventure and digital detox angles.",
                    tags: "outdoor,family,adventure"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Audience Pockets"),
                    title: "Neurodiverse Support",
                    audience: "ADHD / sensory / regulation aware families",
                    concept: "Frame product as helping focus, calm, sensory regulation, or peaceful play.",
                    whyItWorks: "Strong emotional and functional specificity.",
                    tags: "adhd,sensory,focus,regulation"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Audience Pockets"),
                    title: "Multi-Kid Families",
                    audience: "Multi-kid households",
                    concept: "Emphasize sibling harmony, shared use, less fighting, and easier family dynamics.",
                    whyItWorks: "Speaks to a real household pain point.",
                    tags: "siblings,multi-kid,family"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Audience Pockets"),
                    title: "Dad / Masculine Practical Buyer",
                    audience: "Practical dads",
                    concept: "Use rugged, no-fluff, useful, durable framing.",
                    whyItWorks: "Different tone than default mom-centric creative.",
                    tags: "dad,masculine,practical"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Audience Pockets"),
                    title: "Minimalist Buyer",
                    audience: "Minimalist / anti-clutter buyer",
                    concept: "Lead with intentionality, fewer better things, clean use, and anti-junk sentiment.",
                    whyItWorks: "Strong for premium and anti-noise positioning.",
                    tags: "minimalist,intentional,anti-clutter"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Audience Pockets"),
                    title: "Nostalgic Gen X / Analog Childhood",
                    audience: "Nostalgic buyer",
                    concept: "Tap into pre-screen childhood nostalgia, tactile play, and simpler times.",
                    whyItWorks: "Powerful emotional bridge for parents buying for kids.",
                    tags: "nostalgia,analog,gen x"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Audience Pockets"),
                    title: "Wellness / Digital Detox",
                    audience: "Mindful wellness-oriented parents",
                    concept: "Frame product as reducing screens and making family life feel calmer and more present.",
                    whyItWorks: "Fits modern parent concerns and values.",
                    tags: "wellness,digital detox,mindful parenting"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Visual Styles"),
                    title: "Bold Text-Heavy Direct Response",
                    visualDirection: "Bold DR",
                    concept: "Large headline, strong offer, obvious CTA, high readability, conversion-first composition.",
                    whyItWorks: "Clear and direct for paid social.",
                    tags: "bold,dr,text-heavy"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Visual Styles"),
                    title: "Lifestyle / UGC Aesthetic",
                    visualDirection: "Lifestyle/UGC",
                    concept: "Believable, less polished, feels captured in real life, emotionally accessible.",
                    whyItWorks: "Feels native and trusted.",
                    tags: "ugc,lifestyle,authentic"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Visual Styles"),
                    title: "Clean Minimal",
                    visualDirection: "Clean Minimal",
                    concept: "Simple composition, whitespace, strong product focus, premium feel.",
                    whyItWorks: "Great for premium and anti-clutter messaging.",
                    tags: "minimal,premium,clean"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Visual Styles"),
                    title: "Infographic / Educational",
                    visualDirection: "Infographic/Educational",
                    concept: "Teaches benefits fast with labels, arrows, features, and visual hierarchy.",
                    whyItWorks: "Makes benefits easier to process quickly.",
                    tags: "infographic,educational,features"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Visual Styles"),
                    title: "Emotional / Aspirational",
                    visualDirection: "Emotional/Aspirational",
                    concept: "Warm emotion, ideal life, meaningful outcome, softer CTA and mood.",
                    whyItWorks: "Strong for top of funnel and identity-based selling.",
                    tags: "emotional,aspirational,identity"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Visual Styles"),
                    title: "Rugged / Masculine",
                    visualDirection: "Rugged/Masculine",
                    concept: "Darker tones, practical utility, bold type, less decorative polish.",
                    whyItWorks: "Broadens appeal to under-targeted buyer segments.",
                    tags: "rugged,masculine,utility"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Visual Styles"),
                    title: "Soft / Feminine",
                    visualDirection: "Soft/Feminine",
                    concept: "Gentle palette, warmth, intimacy, soft shapes, trust-building tone.",
                    whyItWorks: "Fits comfort, care, and emotional products well.",
                    tags: "soft,feminine,warm"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Visual Styles"),
                    title: "Retro / Nostalgic",
                    visualDirection: "Retro/Nostalgic",
                    concept: "Vintage-inspired cues, analog warmth, memory-triggering tone.",
                    whyItWorks: "Great for anti-screen and throwback products.",
                    tags: "retro,nostalgic,vintage"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Visual Styles"),
                    title: "Surreal / Pattern Interrupt",
                    visualDirection: "Surreal/Pattern Interrupt",
                    concept: "Unexpected visual logic, weird scale, strange environment, thumb-stop energy.",
                    whyItWorks: "For scrolling interruption and curiosity.",
                    tags: "surreal,pattern interrupt,thumb-stop"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Visual Styles"),
                    title: "Meme-Native / Chaotic",
                    visualDirection: "Meme-native/Chaotic",
                    concept: "Internet-native formatting, chaotic energy, intentionally loud and culturally fluent.",
                    whyItWorks: "High stop power if matched to product and audience.",
                    tags: "meme,chaotic,internet-native"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("CTA Styles"),
                    title: "Hard Sell CTA",
                    cta: "Shop Now / Get Yours / Save Today",
                    concept: "Use when urgency, discount, or obvious direct response is the angle.",
                    whyItWorks: "Best for bottom-funnel urgency.",
                    tags: "hard sell,cta,conversion"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("CTA Styles"),
                    title: "Soft CTA",
                    cta: "See Why Parents Love It / Learn More / Explore the Collection",
                    concept: "Use when emotional, identity, or trust is the angle.",
                    whyItWorks: "Better fit for softer or aspirational creative.",
                    tags: "soft cta,trust,top funnel"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Scroll Stop Mechanics"),
                    title: "Hot Take / Polarizing Statement",
                    hook: "Lead with an opinion strong enough to stop the scroll.",
                    concept: "Use a controversial but relevant statement to break attention patterns.",
                    whyItWorks: "Fast interruption of feed autopilot.",
                    tags: "hot take,polarizing,scroll stop"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Scroll Stop Mechanics"),
                    title: "Absurd Visual / Pattern Interrupt",
                    hook: "Use a visually strange or exaggerated scene to force attention.",
                    concept: "The image itself becomes the hook.",
                    whyItWorks: "Visual novelty gets attention quickly.",
                    tags: "absurd,visual,pattern interrupt"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Scroll Stop Mechanics"),
                    title: "Fake UGC / Caught Moment",
                    hook: "Make it feel like a real moment was captured unexpectedly.",
                    concept: "Doorbell cam, phone snapshot, caught in the act, imperfect realness.",
                    whyItWorks: "Feels native and believable.",
                    tags: "ugc,caught moment,believable"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Scroll Stop Mechanics"),
                    title: "Meme / Rage Bait",
                    hook: "Internet-native, slightly chaotic, opinionated or funny formatting.",
                    concept: "Use sparingly where brand/product fit.",
                    whyItWorks: "Can drive very high stop rate.",
                    tags: "meme,rage bait,viral"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Scroll Stop Mechanics"),
                    title: "Curiosity Gap",
                    hook: "Say enough to trigger curiosity but not enough to fully explain.",
                    concept: "Creates a need to resolve the gap.",
                    whyItWorks: "Strong click/attention behavior.",
                    tags: "curiosity gap,clickbait,interest"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Scroll Stop Mechanics"),
                    title: "POV / First-Person Immersion",
                    hook: "Make the viewer feel inside the moment.",
                    concept: "POV framing creates self-projection.",
                    whyItWorks: "Immersion improves emotional response.",
                    tags: "pov,first-person,immersion"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Reference Image Guidance"),
                    title: "Reference Image Rules",
                    concept: "Always specify what asset should be uploaded: product hero, product in-hand, lifestyle shot, packaging, user photo, or brand photography.",
                    whyItWorks: "Reduces vague image generation and improves consistency.",
                    tags: "reference images,assets,nano banana"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Typography Direction"),
                    title: "Typography Specificity Rule",
                    concept: "Never say generic typography. Specify weight, feel, color, spacing, and analogous brand if useful.",
                    whyItWorks: "Improves output quality and visual specificity.",
                    tags: "typography,specificity,design system"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Platform Notes"),
                    title: "Meta Platform Note",
                    platform: "Meta",
                    concept: "Meta ads benefit from fast readability, clear hierarchy, strong stop-power, and obvious first-frame communication.",
                    whyItWorks: "Meta feed is fast and crowded.",
                    tags: "meta,platform,native"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Platform Notes"),
                    title: "TikTok Platform Note",
                    platform: "TikTok",
                    concept: "TikTok creative should feel less polished, more native, and more emotionally immediate.",
                    whyItWorks: "Overproduced assets often feel less native.",
                    tags: "tiktok,platform,native,ugc"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Offer Angles"),
                    title: "Seasonal / Gift Offer",
                    offerType: "seasonal",
                    concept: "Use holiday, birthday, grandparent, and occasion framing.",
                    whyItWorks: "Expands conversion moments beyond direct need-state.",
                    tags: "seasonal,gift,occasion"
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Offer Angles"),
                    title: "Social Proof + Scarcity",
                    offerType: "scarcity",
                    concept: "Combine proof with time pressure or stock pressure.",
                    whyItWorks: "Blends trust and urgency.",
                    tags: "social proof,scarcity,urgency"
                }
            ]
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].conceptFramework.createMany({
            data: [
                {
                    marketType: "product",
                    name: "Standard Batch of 5",
                    frameworkType: "batching",
                    summary: "Organize product ads into batches of 5 with varied audiences and angles.",
                    structure: "Each batch covers multiple angles, audiences, and styles without repetition.",
                    promptInstructions: "Track format split, avoid same audience back-to-back, vary style and CTA intensity.",
                    bestUseCases: "5-30 ad product campaigns",
                    tags: "batching,rotation,product"
                },
                {
                    marketType: "product",
                    name: "Clickbait Batch",
                    frameworkType: "scroll-stop",
                    summary: "Separate clickbait/experimental ad batch from core conversion ads.",
                    structure: "Use one unique scroll-stop mechanic per ad.",
                    promptInstructions: "Keep more experimental hooks separate from core ad batch.",
                    bestUseCases: "High-volume angle exploration",
                    tags: "clickbait,scroll stop,experimentation"
                },
                {
                    marketType: "product",
                    name: "Audience Rotation Framework",
                    frameworkType: "diversity",
                    summary: "Force audience variety so ads do not all speak to the same buyer persona.",
                    structure: "Rotate audience pocket every ad where possible.",
                    promptInstructions: "Do not let consecutive ads target the same audience pocket.",
                    bestUseCases: "Larger ad batches",
                    tags: "audience,rotation,diversity"
                },
                {
                    marketType: "product",
                    name: "Style Rotation Framework",
                    frameworkType: "diversity",
                    summary: "Alternate visual styles to avoid repetitive look and feel.",
                    structure: "Do not repeat the same style back-to-back.",
                    promptInstructions: "Mix bold DR, UGC, minimal, infographic, emotional, and pattern interrupt styles.",
                    bestUseCases: "Creative fatigue reduction",
                    tags: "style,rotation,creative variation"
                }
            ]
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].audienceInsight.createMany({
            data: [
                {
                    marketType: "product",
                    name: "Exhausted Millennial Moms",
                    segmentType: "parent",
                    demographics: "Millennial moms, often managing children and household load.",
                    psychographics: "Values relief, peace, practical solutions, less chaos.",
                    painPoints: "Overwhelm, guilt, friction, screen overuse, decision fatigue.",
                    desires: "Calm house, easier parenting, more present family life.",
                    buyingTriggers: "Immediate relief, believable transformation, emotional resonance.",
                    languagePatterns: "I just need something that works. I am tired of the chaos.",
                    tags: "moms,parenting,relief"
                },
                {
                    marketType: "product",
                    name: "Homeschool Parents",
                    segmentType: "education",
                    demographics: "Parents teaching at home or seeking educational enrichment.",
                    psychographics: "Intentional, practical, value learning outcomes.",
                    painPoints: "Keeping kids engaged, reducing friction, making learning easier.",
                    desires: "Useful, skill-building, meaningful products.",
                    buyingTriggers: "Clear developmental or educational benefit.",
                    tags: "homeschool,education,parents"
                },
                {
                    marketType: "product",
                    name: "Outdoorsy Families",
                    segmentType: "lifestyle",
                    demographics: "Families who value activity and time outside.",
                    psychographics: "Movement, adventure, freedom, non-screen play.",
                    painPoints: "Too much indoor time, too many screens, low engagement.",
                    desires: "More active and memorable family experiences.",
                    buyingTriggers: "Adventure, use-case vividness, healthy contrast to screens.",
                    tags: "outdoor,family,adventure"
                },
                {
                    marketType: "product",
                    name: "Neurodiverse Support Families",
                    segmentType: "special-needs-aware",
                    demographics: "Parents aware of ADHD, sensory, regulation, or focus needs.",
                    psychographics: "Seeking calm, practical support, non-judgmental solutions.",
                    painPoints: "Overstimulation, regulation issues, focus struggles.",
                    desires: "Calm, smoother routines, supportive tools.",
                    buyingTriggers: "Specificity, empathy, functional benefit.",
                    tags: "adhd,sensory,regulation"
                }
            ]
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].visualPattern.createMany({
            data: [
                {
                    marketType: "product",
                    name: "Bold Direct Response Hero",
                    patternType: "product",
                    summary: "Large headline, strong offer, product clear in frame.",
                    composition: "Product dominant, text hierarchy strong, conversion-focused layout.",
                    lighting: "Bright, high-clarity, commercial lighting.",
                    typographyStyle: "Bold, highly legible, high contrast.",
                    tags: "dr,hero,offer"
                },
                {
                    marketType: "product",
                    name: "Believable UGC Lifestyle",
                    patternType: "lifestyle",
                    summary: "Feels captured in real life, not overly polished.",
                    composition: "Human context, believable scene, emotionally familiar.",
                    lighting: "Natural window light or casual home light.",
                    mood: "Warm, real, trustworthy.",
                    tags: "ugc,lifestyle,authentic"
                },
                {
                    marketType: "product",
                    name: "Infographic Explainer",
                    patternType: "educational",
                    summary: "Feature-led layout with labels and visual teaching.",
                    composition: "Product + pointers + feature labels.",
                    typographyStyle: "Clean, structured, readable.",
                    tags: "infographic,educational,features"
                }
            ]
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].copyFormula.createMany({
            data: [
                {
                    marketType: "product",
                    name: "The Thing Nobody Tells You",
                    formulaType: "hook",
                    headlineFormula: "The [thing] nobody tells you about [problem]",
                    bodyFormula: "Expose hidden frustration, introduce product as cleaner solution.",
                    ctaFormula: "See why people are switching",
                    bestUseCases: "Cold audience pattern interrupt",
                    tags: "hook,curiosity,problem"
                },
                {
                    marketType: "product",
                    name: "If You Are This, This Is For You",
                    formulaType: "audience-match",
                    headlineFormula: "If you are a [persona], this is for you",
                    bodyFormula: "Call out pain point + outcome + why it fits this persona.",
                    ctaFormula: "See if it fits your family",
                    bestUseCases: "Audience pocket ads",
                    tags: "persona,audience,match"
                },
                {
                    marketType: "product",
                    name: "Stop Doing This, Do This Instead",
                    formulaType: "hot-take",
                    headlineFormula: "Stop [bad behavior], do this instead",
                    bodyFormula: "Contrast old ineffective behavior with better approach.",
                    ctaFormula: "Try the better way",
                    bestUseCases: "Direct response / opinionated hook",
                    tags: "hot take,contrast,problem solution"
                }
            ]
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].offerAngle.createMany({
            data: [
                {
                    marketType: "product",
                    name: "Urgency Discount Angle",
                    angleType: "discount",
                    summary: "Lead with active offer and time pressure.",
                    hookIdeas: "40% Off Today / Ends Tonight / Save Before It Sells Out",
                    urgencyMechanics: "deadline, low stock, sale ending",
                    tags: "discount,urgency,offer"
                },
                {
                    marketType: "product",
                    name: "Gift Positioning Angle",
                    angleType: "gift",
                    summary: "Position the product as an easy meaningful gift.",
                    hookIdeas: "The gift they actually use / perfect for birthdays and holidays",
                    seasonality: "birthday, holiday, teacher, grandparent",
                    tags: "gift,seasonal"
                }
            ]
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].researchNote.createMany({
            data: [
                {
                    marketType: "product",
                    title: "Product Prompt Generator Rules",
                    noteType: "system-spec",
                    body: "Avoid generic AI aesthetic, repetitive hooks, vague scenes, missing text placement, same audience repeated, back-to-back same styles, mismatched CTA intensity. Prioritize diverse audience pockets, exact copy, specific scene details, clear reference image guidance, style and CTA variation, and quality-check output.",
                    tags: "rules,quality control,product",
                    priority: 10
                },
                {
                    marketType: "product",
                    title: "Desired Ad Output Structure",
                    noteType: "format-spec",
                    body: "Each ad should include angle, audience, format, style, testimonial, reference image guidance, detailed scene prompt, text overlay top/middle/bottom/CTA, and typography direction.",
                    tags: "format,ads,product",
                    priority: 10
                }
            ]
        });
        return {
            skipped: false,
            marketType: "product"
        };
    }
    const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].swipeEntry.count({
        where: {
            marketType: "donation"
        }
    });
    if (existing > 0) {
        return {
            skipped: true,
            reason: "Donation memory already seeded"
        };
    }
    const categories = new Map();
    for (const category of donationCategoryNames){
        const created = await ensureCategory(category.name, category.description, "donation");
        categories.set(category.name, created.id);
    }
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].swipeEntry.createMany({
        data: [
            {
                marketType: "donation",
                categoryId: categories.get("Donation Hooks"),
                title: "Urgent Human Need Hook",
                hook: "Someone needs help right now.",
                concept: "Lead with immediate human need and direct emotional relevance.",
                emotionalTrigger: "urgency, compassion, responsibility",
                whyItWorks: "Fast emotional clarity for donation action.",
                tags: "donation,urgency,emotion"
            },
            {
                marketType: "donation",
                categoryId: categories.get("Donation Hooks"),
                title: "Donor as Hero",
                hook: "You can be the reason this changes today.",
                concept: "Frame the donor as the active force creating the outcome.",
                emotionalTrigger: "agency, purpose, hero identity",
                whyItWorks: "Turns passive sympathy into active participation.",
                tags: "donor hero,identity,agency"
            },
            {
                marketType: "donation",
                categoryId: categories.get("Impact Angles"),
                title: "Specific Impact Per Dollar",
                angle: "Concrete impact",
                concept: "Translate donation amount into a visible outcome.",
                whyItWorks: "Makes giving feel real and measurable.",
                tags: "impact,concrete,conversion"
            },
            {
                marketType: "donation",
                categoryId: categories.get("Impact Angles"),
                title: "Before / After Impact",
                angle: "Transformation",
                concept: "Show what changes because of support.",
                whyItWorks: "People give to move someone from pain to possibility.",
                tags: "transformation,before-after"
            },
            {
                marketType: "donation",
                categoryId: categories.get("Urgency & Matching"),
                title: "Match Ends Tonight",
                angle: "Matching gift",
                concept: "Use a match deadline to increase urgency and perceived leverage.",
                whyItWorks: "Boosts urgency and value of each dollar.",
                tags: "matching,deadline,urgency"
            },
            {
                marketType: "donation",
                categoryId: categories.get("Recurring Giving"),
                title: "Monthly Sustainer Framing",
                angle: "Recurring donation",
                concept: "Frame monthly giving as steady rescue and consistent support.",
                whyItWorks: "Builds sustainable donor value.",
                tags: "monthly,sustainer,recurring"
            },
            {
                marketType: "donation",
                categoryId: categories.get("Trust & Proof"),
                title: "Transparency / Proof of Use",
                angle: "Proof",
                concept: "Show where the money goes, what changed, and why the org is credible.",
                whyItWorks: "Reduces skepticism and donor hesitation.",
                tags: "trust,credibility,proof"
            },
            {
                marketType: "donation",
                categoryId: categories.get("Story Formats"),
                title: "Single Person Story",
                angle: "Story hook",
                concept: "One human story beats abstract numbers when emotional connection matters.",
                whyItWorks: "Concrete story increases empathy and memory.",
                tags: "story,emotion,empathy"
            }
        ]
    });
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].conceptFramework.createMany({
        data: [
            {
                marketType: "donation",
                name: "Need → Hope → Action",
                frameworkType: "donation-core",
                summary: "Show the problem, show the hope, then ask for the gift.",
                structure: "Need → emotional stakes → credible intervention → action",
                promptInstructions: "Do not bury the ask. Keep the ask connected to the impact.",
                tags: "donation,core framework"
            },
            {
                marketType: "donation",
                name: "Specific Dollar Impact",
                frameworkType: "donation-conversion",
                summary: "Tie donation amounts to visible outcomes.",
                structure: "$X does Y for Z person or cause",
                promptInstructions: "Use specific amounts and outcomes when possible.",
                tags: "impact,specificity,donation"
            },
            {
                marketType: "donation",
                name: "Match Deadline Framework",
                frameworkType: "urgency",
                summary: "Use match windows and deadlines for urgency.",
                structure: "match opportunity → time deadline → donor leverage",
                promptInstructions: "Use hard CTA and urgency when the match is real.",
                tags: "matching,urgency,cta"
            }
        ]
    });
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].audienceInsight.createMany({
        data: [
            {
                marketType: "donation",
                name: "Compassion-Driven First-Time Donor",
                segmentType: "donor",
                demographics: "Broad adult donor profile",
                psychographics: "Wants to help, emotionally responsive, needs clarity and trust",
                painPoints: "Feels helpless, unsure where to give, overwhelmed by causes",
                desires: "To help in a meaningful way and feel confident it matters",
                objections: "Is this real? Will my money matter?",
                buyingTriggers: "Specific impact, urgency, social proof, transparency",
                tags: "first-time donor,trust,impact"
            },
            {
                marketType: "donation",
                name: "Recurring Giver / Sustainer Prospect",
                segmentType: "donor",
                psychographics: "Values consistency, responsibility, long-term change",
                desires: "To create reliable impact over time",
                objections: "I already give enough / I do not want another monthly charge",
                buyingTriggers: "Monthly impact framing, low-friction entry amount, stability message",
                tags: "monthly donor,sustainer"
            }
        ]
    });
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].visualPattern.createMany({
        data: [
            {
                marketType: "donation",
                name: "Human Impact Portrait",
                patternType: "donation",
                summary: "Emotionally direct portrait with clear stakes and compassionate composition.",
                composition: "Subject forward, context visible but not distracting.",
                lighting: "Natural, honest, empathetic lighting.",
                mood: "Serious but hopeful.",
                tags: "donation,portrait,emotion"
            },
            {
                marketType: "donation",
                name: "Impact Infographic Donation Ad",
                patternType: "donation",
                summary: "Show what each gift amount makes possible.",
                composition: "Donation amount + outcome + visual support.",
                typographyStyle: "Readable and trust-building.",
                tags: "infographic,impact,donation"
            }
        ]
    });
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].copyFormula.createMany({
        data: [
            {
                marketType: "donation",
                name: "Your Gift Does This",
                formulaType: "impact",
                headlineFormula: "Your $[amount] can [specific result]",
                bodyFormula: "Translate gift directly into tangible impact.",
                ctaFormula: "Give now",
                tags: "impact,donation,direct"
            },
            {
                marketType: "donation",
                name: "Before Midnight Match",
                formulaType: "urgency",
                headlineFormula: "Your gift will be doubled before midnight",
                bodyFormula: "Explain the match and what doubled support does.",
                ctaFormula: "Double your impact now",
                tags: "match,deadline,urgency"
            }
        ]
    });
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].offerAngle.createMany({
        data: [
            {
                marketType: "donation",
                name: "Matching Gift Angle",
                angleType: "matching",
                summary: "Use matches to increase leverage and urgency.",
                hookIdeas: "Your gift goes twice as far / Match ends tonight",
                urgencyMechanics: "deadline, challenge grant, doubled impact",
                tags: "match,donation,urgency"
            },
            {
                marketType: "donation",
                name: "Monthly Giving Angle",
                angleType: "monthly",
                summary: "Frame small recurring gifts as dependable long-term help.",
                hookIdeas: "Become a monthly lifeline / Give once, help all year",
                tags: "monthly,recurring,sustainer"
            }
        ]
    });
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].researchNote.createMany({
        data: [
            {
                marketType: "donation",
                title: "Fundraiser Ad Image Generator System",
                noteType: "system-spec",
                priority: 10,
                tags: "donation,image prompts,system",
                body: `
ROLE:
Expert fundraiser ad creative director generating hyper realistic emotionally compelling AI image prompts.

INPUTS:
Subject name
Subject type (animal or human)
Species or age
Physical description
Visible injuries
Backstory
Urgency level
Platform
Reference images

OUTPUT STRUCTURE:
Generate prompts across five style systems.

STYLE 1 — UGC SNAPCHAT
Vertical 9:16
Snapchat quality
Washed out grain
Chunky digital noise
Unpolished phone look
Top emotional text only

Angles rotate:
door gap
mirror reflection
under surface
over shoulder
peek corner
carrier grate
macro close up
worm's eye
overhead
behind subject
`
            },
            {
                marketType: "donation",
                title: "Donation Creative Style — Native Organic",
                noteType: "creative-style",
                priority: 8,
                tags: "donation,ugc,organic",
                body: `
STYLE 2 — NATIVE ORGANIC
Vertical 9:16 iPhone photo
Raw and unedited
Warm natural white balance
Real life lighting

Concept rotation:
sun spot
facing wall
empty bowl foreground
beloved object
slow walk
human hand touch
mirror reflection
looking out window
favorite resting spot
injury close up

No text or tiny bottom emotional line only.
`
            },
            {
                marketType: "donation",
                title: "Donation Creative Style — Hyper Realistic Clickbait",
                noteType: "creative-style",
                priority: 8,
                tags: "donation,clickbait,hyper realism",
                body: `
STYLE 3 — HYPER REALISTIC CLICKBAIT

Vertical 9:16
Maximum realism
Every strand of fur or skin detail visible
Clinical or harsh lighting

Top text:
Massive bold white scroll stopping headline

Bottom CTA:
Click the link. Any amount helps.

Direct eye contact strongly preferred.
`
            },
            {
                marketType: "donation",
                title: "Donation Creative Style — Story Concept",
                noteType: "creative-style",
                priority: 8,
                tags: "donation,story,concept",
                body: `
STYLE 4 — CREATIVE STORY CONCEPT

Unexpected storytelling objects:

missing poster
sticky note
vet invoice
gofundme progress screen
calendar date circled
text message screenshot
polaroid photo
empty food bowl
collar hanging on hook
phone search history
coin jar fundraiser
favorite spot empty

Large emotional headline at top.
No CTA text.
Let visual concept carry story.
`
            },
            {
                marketType: "donation",
                title: "Donation Creative Style — Illustration",
                noteType: "creative-style",
                priority: 7,
                tags: "donation,illustration",
                body: `
STYLE 5 — ILLUSTRATED

Styles rotate:

digital oil painting
watercolor wash
colored pencil
soft pastel
impressionist
continuous line art

Warm emotional palettes.
Injuries must remain visible.
Top gentle headline.
Bottom small CTA.
`
            },
            {
                marketType: "donation",
                title: "Donation Creative Universal Rules",
                noteType: "rules",
                priority: 10,
                tags: "donation,rules",
                body: `
UNIVERSAL RULES

Always recreate subject exactly from reference images.
Never heal or soften injuries.
Vertical 9:16 always.
Never repeat angles or concepts in one batch.
Injuries remain emotional focal point.
Text should feel placed by a person.
Authenticity converts better than polish.
Direct eye contact is strongest when possible.
Human hands and everyday objects add emotional depth.
`
            },
            {
                marketType: "donation",
                title: "Donation Urgency Language Library",
                noteType: "copy-library",
                priority: 9,
                tags: "donation,urgency,copy",
                body: `
LAST DAY:
Today is the last day to save [NAME]
This fundraiser closes tonight
The clock is running
Donations close in 24 hours
[NAME] is out of time

ONGOING:
Any amount helps [NAME] fight
Every dollar counts
Help [NAME] get the care they deserve
Any amount brings [NAME] closer

GENERAL CTA:
Click the link. Any amount helps.
Help [NAME] survive this.
Every donation goes directly to [NAME].
`
            },
            {
                marketType: "donation",
                title: "Donation Angle Rotation Rule",
                noteType: "system-rule",
                priority: 10,
                tags: "donation,variation",
                body: `
ANGLE ROTATION RULE

Angles and concepts must never repeat within one output.

Each style block must use completely different visual approaches.

Goal:
Maximum creative diversity across prompts so user receives
multiple distinct ads ready for testing.
`
            },
            {
                marketType: "donation",
                title: "Donation Creative Core Rule",
                noteType: "system-spec",
                body: "Donation creative should maximize emotional clarity, trust, concrete impact, and donor agency. Show why the gift matters, where the money goes, and why now.",
                tags: "donation,rules,trust,impact",
                priority: 10
            },
            {
                marketType: "donation",
                title: "Donation CTA Rule",
                noteType: "system-spec",
                body: "Use harder CTAs when urgency or matching is real. Use softer trust-building CTAs when the ad is story-first or emotional-first.",
                tags: "donation,cta,urgency",
                priority: 8
            }
        ]
    });
    return {
        skipped: false,
        marketType: "donation"
    };
}
}),
"[project]/app/admin/dono/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
    ()=>DonationAdminPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"00f901d11fe8f04785cd3c6658565ab2d62ad93e3b":"$$RSC_SERVER_ACTION_0","4045ba37d8d236f40f14f4f6e2181c1cde9cedfc6a":"$$RSC_SERVER_ACTION_5","40462918826704c5f4ea908e01f1471ccb2dd96fb6":"$$RSC_SERVER_ACTION_1","404637d0f9ac68b88b9d4e40f7d2c0f413f8473289":"$$RSC_SERVER_ACTION_2","4059095179b8b19dd88034160d83a14c1b5a129ad2":"$$RSC_SERVER_ACTION_6","406e29c5600dddac356fe1546e7539bc4c1788ede4":"$$RSC_SERVER_ACTION_7","4099723d8d8a4a5460cef48d73865955c573f90983":"$$RSC_SERVER_ACTION_4","40ab8e8412f742ec8d593febe05297a7f0ca26d45e":"$$RSC_SERVER_ACTION_8","40e3d1a762376250616cc203d653347e445520c63f":"$$RSC_SERVER_ACTION_3"},"",""] */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$defaultMemory$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/defaultMemory.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
const MARKET_TYPE = "donation";
const $$RSC_SERVER_ACTION_0 = async function seedDonationMemory() {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$defaultMemory$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["seedDefaultMemory"])("donation");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/admin/dono");
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_0, "00f901d11fe8f04785cd3c6658565ab2d62ad93e3b", null);
var seedDonationMemory = $$RSC_SERVER_ACTION_0;
const $$RSC_SERVER_ACTION_1 = async function createSwipeCategory(formData) {
    const name = formData.get("name")?.toString().trim();
    const description = formData.get("description")?.toString().trim() || "";
    if (!name) throw new Error("Category name is required");
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].swipeCategory.create({
        data: {
            name,
            description,
            marketType: MARKET_TYPE
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/admin/dono");
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_1, "40462918826704c5f4ea908e01f1471ccb2dd96fb6", null);
var createSwipeCategory = $$RSC_SERVER_ACTION_1;
const $$RSC_SERVER_ACTION_2 = async function createSwipeEntry(formData) {
    const title = formData.get("title")?.toString().trim();
    const categoryId = formData.get("categoryId")?.toString().trim();
    if (!title || !categoryId) {
        throw new Error("Swipe entry title and category are required");
    }
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].swipeEntry.create({
        data: {
            title,
            categoryId,
            marketType: MARKET_TYPE,
            hook: formData.get("hook")?.toString().trim() || null,
            angle: formData.get("angle")?.toString().trim() || null,
            concept: formData.get("concept")?.toString().trim() || null,
            copy: formData.get("copy")?.toString().trim() || null,
            cta: formData.get("cta")?.toString().trim() || null,
            visualDirection: formData.get("visualDirection")?.toString().trim() || null,
            audience: formData.get("audience")?.toString().trim() || null,
            platform: formData.get("platform")?.toString().trim() || null,
            funnelStage: formData.get("funnelStage")?.toString().trim() || null,
            offerType: formData.get("offerType")?.toString().trim() || null,
            emotionalTrigger: formData.get("emotionalTrigger")?.toString().trim() || null,
            objectionHandled: formData.get("objectionHandled")?.toString().trim() || null,
            whyItWorks: formData.get("whyItWorks")?.toString().trim() || null,
            source: formData.get("source")?.toString().trim() || null,
            tags: formData.get("tags")?.toString().trim() || null,
            notes: formData.get("notes")?.toString().trim() || null
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/admin/dono");
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_2, "404637d0f9ac68b88b9d4e40f7d2c0f413f8473289", null);
var createSwipeEntry = $$RSC_SERVER_ACTION_2;
const $$RSC_SERVER_ACTION_3 = async function createConceptFramework(formData) {
    const name = formData.get("name")?.toString().trim();
    if (!name) throw new Error("Framework name is required");
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].conceptFramework.create({
        data: {
            name,
            marketType: MARKET_TYPE,
            frameworkType: formData.get("frameworkType")?.toString().trim() || null,
            summary: formData.get("summary")?.toString().trim() || null,
            structure: formData.get("structure")?.toString().trim() || null,
            promptInstructions: formData.get("promptInstructions")?.toString().trim() || null,
            bestUseCases: formData.get("bestUseCases")?.toString().trim() || null,
            badUseCases: formData.get("badUseCases")?.toString().trim() || null,
            examples: formData.get("examples")?.toString().trim() || null,
            tags: formData.get("tags")?.toString().trim() || null,
            notes: formData.get("notes")?.toString().trim() || null
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/admin/dono");
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_3, "40e3d1a762376250616cc203d653347e445520c63f", null);
var createConceptFramework = $$RSC_SERVER_ACTION_3;
const $$RSC_SERVER_ACTION_4 = async function createAudienceInsight(formData) {
    const name = formData.get("name")?.toString().trim();
    if (!name) throw new Error("Audience name is required");
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].audienceInsight.create({
        data: {
            name,
            marketType: MARKET_TYPE,
            segmentType: formData.get("segmentType")?.toString().trim() || null,
            demographics: formData.get("demographics")?.toString().trim() || null,
            psychographics: formData.get("psychographics")?.toString().trim() || null,
            painPoints: formData.get("painPoints")?.toString().trim() || null,
            desires: formData.get("desires")?.toString().trim() || null,
            fears: formData.get("fears")?.toString().trim() || null,
            objections: formData.get("objections")?.toString().trim() || null,
            buyingTriggers: formData.get("buyingTriggers")?.toString().trim() || null,
            languagePatterns: formData.get("languagePatterns")?.toString().trim() || null,
            stylePreferences: formData.get("stylePreferences")?.toString().trim() || null,
            platformBehavior: formData.get("platformBehavior")?.toString().trim() || null,
            tags: formData.get("tags")?.toString().trim() || null,
            notes: formData.get("notes")?.toString().trim() || null
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/admin/dono");
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_4, "4099723d8d8a4a5460cef48d73865955c573f90983", null);
var createAudienceInsight = $$RSC_SERVER_ACTION_4;
const $$RSC_SERVER_ACTION_5 = async function createVisualPattern(formData) {
    const name = formData.get("name")?.toString().trim();
    if (!name) throw new Error("Visual pattern name is required");
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].visualPattern.create({
        data: {
            name,
            marketType: MARKET_TYPE,
            patternType: formData.get("patternType")?.toString().trim() || null,
            summary: formData.get("summary")?.toString().trim() || null,
            composition: formData.get("composition")?.toString().trim() || null,
            lighting: formData.get("lighting")?.toString().trim() || null,
            colorPalette: formData.get("colorPalette")?.toString().trim() || null,
            typographyStyle: formData.get("typographyStyle")?.toString().trim() || null,
            mood: formData.get("mood")?.toString().trim() || null,
            backgroundStyle: formData.get("backgroundStyle")?.toString().trim() || null,
            productPlacement: formData.get("productPlacement")?.toString().trim() || null,
            useCase: formData.get("useCase")?.toString().trim() || null,
            examples: formData.get("examples")?.toString().trim() || null,
            tags: formData.get("tags")?.toString().trim() || null,
            notes: formData.get("notes")?.toString().trim() || null
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/admin/dono");
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_5, "4045ba37d8d236f40f14f4f6e2181c1cde9cedfc6a", null);
var createVisualPattern = $$RSC_SERVER_ACTION_5;
const $$RSC_SERVER_ACTION_6 = async function createCopyFormula(formData) {
    const name = formData.get("name")?.toString().trim();
    if (!name) throw new Error("Copy formula name is required");
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].copyFormula.create({
        data: {
            name,
            marketType: MARKET_TYPE,
            formulaType: formData.get("formulaType")?.toString().trim() || null,
            structure: formData.get("structure")?.toString().trim() || null,
            headlineFormula: formData.get("headlineFormula")?.toString().trim() || null,
            bodyFormula: formData.get("bodyFormula")?.toString().trim() || null,
            ctaFormula: formData.get("ctaFormula")?.toString().trim() || null,
            bestUseCases: formData.get("bestUseCases")?.toString().trim() || null,
            tone: formData.get("tone")?.toString().trim() || null,
            examples: formData.get("examples")?.toString().trim() || null,
            tags: formData.get("tags")?.toString().trim() || null,
            notes: formData.get("notes")?.toString().trim() || null
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/admin/dono");
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_6, "4059095179b8b19dd88034160d83a14c1b5a129ad2", null);
var createCopyFormula = $$RSC_SERVER_ACTION_6;
const $$RSC_SERVER_ACTION_7 = async function createOfferAngle(formData) {
    const name = formData.get("name")?.toString().trim();
    if (!name) throw new Error("Offer angle name is required");
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].offerAngle.create({
        data: {
            name,
            marketType: MARKET_TYPE,
            angleType: formData.get("angleType")?.toString().trim() || null,
            summary: formData.get("summary")?.toString().trim() || null,
            hookIdeas: formData.get("hookIdeas")?.toString().trim() || null,
            urgencyMechanics: formData.get("urgencyMechanics")?.toString().trim() || null,
            bestUseCases: formData.get("bestUseCases")?.toString().trim() || null,
            examples: formData.get("examples")?.toString().trim() || null,
            seasonality: formData.get("seasonality")?.toString().trim() || null,
            tags: formData.get("tags")?.toString().trim() || null,
            notes: formData.get("notes")?.toString().trim() || null
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/admin/dono");
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_7, "406e29c5600dddac356fe1546e7539bc4c1788ede4", null);
var createOfferAngle = $$RSC_SERVER_ACTION_7;
const $$RSC_SERVER_ACTION_8 = async function createResearchNote(formData) {
    const title = formData.get("title")?.toString().trim();
    if (!title) throw new Error("Research note title is required");
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].researchNote.create({
        data: {
            title,
            marketType: MARKET_TYPE,
            noteType: formData.get("noteType")?.toString().trim() || null,
            body: formData.get("body")?.toString().trim() || "",
            source: formData.get("source")?.toString().trim() || null,
            tags: formData.get("tags")?.toString().trim() || null,
            priority: (()=>{
                const raw = formData.get("priority")?.toString().trim();
                if (!raw) return null;
                const n = Number(raw);
                return Number.isFinite(n) ? n : null;
            })()
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/admin/dono");
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_8, "40ab8e8412f742ec8d593febe05297a7f0ca26d45e", null);
var createResearchNote = $$RSC_SERVER_ACTION_8;
async function DonationAdminPage() {
    const categories = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].swipeCategory.findMany({
        where: {
            marketType: MARKET_TYPE
        },
        orderBy: {
            createdAt: "desc"
        }
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        style: {
            padding: 40,
            maxWidth: 1200
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                children: "Memory — Donation"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 250,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    marginTop: 8
                                },
                                children: "Add and refine donation-side swipe memory for SacredStatics."
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 251,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 249,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                href: "/",
                                style: {
                                    border: "1px solid #444",
                                    padding: "10px 14px",
                                    textDecoration: "none",
                                    marginRight: 10
                                },
                                children: "Home"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 257,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                href: "/admin",
                                style: {
                                    border: "1px solid #444",
                                    padding: "10px 14px",
                                    textDecoration: "none"
                                },
                                children: "Product"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 268,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 256,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/dono/page.tsx",
                lineNumber: 248,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 20,
                    border: "1px solid #333",
                    padding: 16
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Seed Donation Memory"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 282,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Preload donation-focused hooks, impact angles, donor psychology, matching gift urgency, recurring giving, and style systems."
                    }, void 0, false, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 283,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        action: seedDonationMemory,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "submit",
                            style: {
                                marginTop: 12
                            },
                            children: "Seed Donation Memory"
                        }, void 0, false, {
                            fileName: "[project]/app/admin/dono/page.tsx",
                            lineNumber: 285,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 284,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/dono/page.tsx",
                lineNumber: 281,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 30,
                    border: "1px solid #333",
                    padding: 16
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Create Swipe Category"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 292,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        action: createSwipeCategory,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                name: "name",
                                placeholder: "Donation Hooks, Donor Psychology...",
                                style: {
                                    width: 320,
                                    padding: 8,
                                    marginTop: 8
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 294,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 299,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                name: "description",
                                placeholder: "What this category is for",
                                style: {
                                    width: "100%",
                                    minHeight: 80,
                                    padding: 8,
                                    marginTop: 12
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 300,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 305,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                style: {
                                    marginTop: 12
                                },
                                children: "Save Category"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 306,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 293,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 18
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                children: "Existing Categories"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 312,
                                columnNumber: 21
                            }, this),
                            categories.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "No categories yet."
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 314,
                                columnNumber: 25
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                children: categories.map((category)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: category.name
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/dono/page.tsx",
                                                lineNumber: 319,
                                                columnNumber: 37
                                            }, this),
                                            category.description ? ` — ${category.description}` : ""
                                        ]
                                    }, category.id, true, {
                                        fileName: "[project]/app/admin/dono/page.tsx",
                                        lineNumber: 318,
                                        columnNumber: 33
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 316,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 311,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/dono/page.tsx",
                lineNumber: 291,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 30,
                    border: "1px solid #333",
                    padding: 16
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Create Swipe Entry"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 329,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        action: createSwipeEntry,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                style: {
                                    marginTop: 12
                                },
                                children: "Save Swipe Entry"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 331,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 8
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "title",
                                    placeholder: "Entry title",
                                    style: {
                                        width: 320,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 335,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 334,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    name: "categoryId",
                                    style: {
                                        width: 320,
                                        padding: 8
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "",
                                            children: "Select category"
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/dono/page.tsx",
                                            lineNumber: 344,
                                            columnNumber: 29
                                        }, this),
                                        categories.map((category)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: category.id,
                                                children: category.name
                                            }, category.id, false, {
                                                fileName: "[project]/app/admin/dono/page.tsx",
                                                lineNumber: 346,
                                                columnNumber: 33
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 343,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 342,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "hook",
                                    placeholder: "Hook",
                                    style: {
                                        width: "100%",
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 354,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 353,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "angle",
                                    placeholder: "Angle",
                                    style: {
                                        width: "100%",
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 358,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 357,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "concept",
                                    placeholder: "Concept",
                                    style: {
                                        width: "100%",
                                        minHeight: 80,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 362,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 361,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "copy",
                                    placeholder: "Winning copy or example copy",
                                    style: {
                                        width: "100%",
                                        minHeight: 100,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 366,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 365,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "cta",
                                    placeholder: "CTA",
                                    style: {
                                        width: "100%",
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 370,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 369,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "visualDirection",
                                    placeholder: "Visual direction",
                                    style: {
                                        width: "100%",
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 374,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 373,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "audience",
                                    placeholder: "Audience",
                                    style: {
                                        width: "100%",
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 378,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 377,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "platform",
                                    placeholder: "Platform",
                                    style: {
                                        width: "100%",
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 382,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 381,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "funnelStage",
                                    placeholder: "Funnel stage",
                                    style: {
                                        width: "100%",
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 386,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 385,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "offerType",
                                    placeholder: "Offer type",
                                    style: {
                                        width: "100%",
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 390,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 389,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "emotionalTrigger",
                                    placeholder: "Emotional trigger",
                                    style: {
                                        width: "100%",
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 394,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 393,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "objectionHandled",
                                    placeholder: "Objection handled",
                                    style: {
                                        width: "100%",
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 398,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 397,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "whyItWorks",
                                    placeholder: "Why it works",
                                    style: {
                                        width: "100%",
                                        minHeight: 80,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 402,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 401,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "source",
                                    placeholder: "Source",
                                    style: {
                                        width: "100%",
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 406,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 405,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "tags",
                                    placeholder: "Tags",
                                    style: {
                                        width: "100%",
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 410,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 409,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "notes",
                                    placeholder: "Notes",
                                    style: {
                                        width: "100%",
                                        minHeight: 80,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 414,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 413,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 330,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/dono/page.tsx",
                lineNumber: 328,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 30,
                    border: "1px solid #333",
                    padding: 16
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Create Concept Framework"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 421,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        action: createConceptFramework,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                style: {
                                    marginTop: 12
                                },
                                children: "Save Concept Framework"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 423,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                name: "name",
                                placeholder: "Framework name",
                                style: {
                                    width: 320,
                                    padding: 8,
                                    marginTop: 8
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 426,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "frameworkType",
                                    placeholder: "Framework type",
                                    style: {
                                        width: "100%",
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 432,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 431,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "summary",
                                    placeholder: "Summary",
                                    style: {
                                        width: "100%",
                                        minHeight: 80,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 435,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 434,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "structure",
                                    placeholder: "Structure",
                                    style: {
                                        width: "100%",
                                        minHeight: 80,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 438,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 437,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "promptInstructions",
                                    placeholder: "Prompt instructions",
                                    style: {
                                        width: "100%",
                                        minHeight: 80,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 441,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 440,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "bestUseCases",
                                    placeholder: "Best use cases",
                                    style: {
                                        width: "100%",
                                        minHeight: 60,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 444,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 443,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "badUseCases",
                                    placeholder: "Bad use cases",
                                    style: {
                                        width: "100%",
                                        minHeight: 60,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 447,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 446,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "examples",
                                    placeholder: "Examples",
                                    style: {
                                        width: "100%",
                                        minHeight: 80,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 450,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 449,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "tags",
                                    placeholder: "Tags",
                                    style: {
                                        width: "100%",
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 453,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 452,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "notes",
                                    placeholder: "Notes",
                                    style: {
                                        width: "100%",
                                        minHeight: 80,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 456,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 455,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 422,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/dono/page.tsx",
                lineNumber: 420,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 30,
                    border: "1px solid #333",
                    padding: 16
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Create Audience Insight"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 463,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        action: createAudienceInsight,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                style: {
                                    marginTop: 12
                                },
                                children: "Save Audience Insight"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 465,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                name: "name",
                                placeholder: "Audience name",
                                style: {
                                    width: 320,
                                    padding: 8,
                                    marginTop: 8
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 468,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "segmentType",
                                    placeholder: "Segment type",
                                    style: {
                                        width: "100%",
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 474,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 473,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "demographics",
                                    placeholder: "Demographics",
                                    style: {
                                        width: "100%",
                                        minHeight: 70,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 477,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 476,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "psychographics",
                                    placeholder: "Psychographics",
                                    style: {
                                        width: "100%",
                                        minHeight: 70,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 480,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 479,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "painPoints",
                                    placeholder: "Pain points",
                                    style: {
                                        width: "100%",
                                        minHeight: 70,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 483,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 482,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "desires",
                                    placeholder: "Desires",
                                    style: {
                                        width: "100%",
                                        minHeight: 70,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 486,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 485,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "fears",
                                    placeholder: "Fears",
                                    style: {
                                        width: "100%",
                                        minHeight: 70,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 489,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 488,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "objections",
                                    placeholder: "Objections",
                                    style: {
                                        width: "100%",
                                        minHeight: 70,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 492,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 491,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "buyingTriggers",
                                    placeholder: "Buying triggers",
                                    style: {
                                        width: "100%",
                                        minHeight: 70,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 495,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 494,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "languagePatterns",
                                    placeholder: "Language patterns",
                                    style: {
                                        width: "100%",
                                        minHeight: 70,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 498,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 497,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "stylePreferences",
                                    placeholder: "Style preferences",
                                    style: {
                                        width: "100%",
                                        minHeight: 70,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 501,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 500,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "platformBehavior",
                                    placeholder: "Platform behavior",
                                    style: {
                                        width: "100%",
                                        minHeight: 70,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 504,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 503,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "tags",
                                    placeholder: "Tags",
                                    style: {
                                        width: "100%",
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 507,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 506,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "notes",
                                    placeholder: "Notes",
                                    style: {
                                        width: "100%",
                                        minHeight: 80,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 510,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 509,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 464,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/dono/page.tsx",
                lineNumber: 462,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 30,
                    border: "1px solid #333",
                    padding: 16
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Create Visual Pattern"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 517,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Used in prompt memory to shape scene, lighting, composition, and typography."
                    }, void 0, false, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 518,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        action: createVisualPattern,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                name: "name",
                                placeholder: "Name",
                                style: {
                                    width: 320,
                                    padding: 8,
                                    marginTop: 8
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 523,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "patternType",
                                    placeholder: "Pattern type",
                                    style: {
                                        width: "100%",
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 529,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 528,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "summary",
                                    placeholder: "Summary",
                                    style: {
                                        width: "100%",
                                        minHeight: 80,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 536,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 535,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "composition",
                                    placeholder: "Composition",
                                    style: {
                                        width: "100%",
                                        minHeight: 80,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 543,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 542,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "lighting",
                                    placeholder: "Lighting",
                                    style: {
                                        width: "100%",
                                        minHeight: 80,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 550,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 549,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "colorPalette",
                                    placeholder: "Color palette",
                                    style: {
                                        width: "100%",
                                        minHeight: 80,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 557,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 556,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "typographyStyle",
                                    placeholder: "Typography style",
                                    style: {
                                        width: "100%",
                                        minHeight: 80,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 564,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 563,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "mood",
                                    placeholder: "Mood",
                                    style: {
                                        width: "100%",
                                        minHeight: 60,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 571,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 570,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "backgroundStyle",
                                    placeholder: "Background style",
                                    style: {
                                        width: "100%",
                                        minHeight: 60,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 578,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 577,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "productPlacement",
                                    placeholder: "Product placement",
                                    style: {
                                        width: "100%",
                                        minHeight: 60,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 585,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 584,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "useCase",
                                    placeholder: "Use case",
                                    style: {
                                        width: "100%",
                                        minHeight: 60,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 592,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 591,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "examples",
                                    placeholder: "Examples",
                                    style: {
                                        width: "100%",
                                        minHeight: 60,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 599,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 598,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "tags",
                                    placeholder: "Tags",
                                    style: {
                                        width: "100%",
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 606,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 605,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "notes",
                                    placeholder: "Notes",
                                    style: {
                                        width: "100%",
                                        minHeight: 80,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 613,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 612,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                style: {
                                    marginTop: 12
                                },
                                children: "Save Visual Pattern"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 619,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 522,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/dono/page.tsx",
                lineNumber: 516,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 30,
                    border: "1px solid #333",
                    padding: 16
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Create Copy Formula"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 626,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Used in prompt memory for headline/body/CTA copy structure."
                    }, void 0, false, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 627,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        action: createCopyFormula,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                name: "name",
                                placeholder: "Name",
                                style: {
                                    width: 320,
                                    padding: 8,
                                    marginTop: 8
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 629,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "formulaType",
                                    placeholder: "Formula type",
                                    style: {
                                        width: "100%",
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 635,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 634,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "structure",
                                    placeholder: "Structure",
                                    style: {
                                        width: "100%",
                                        minHeight: 80,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 642,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 641,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "headlineFormula",
                                    placeholder: "Headline formula",
                                    style: {
                                        width: "100%",
                                        minHeight: 70,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 649,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 648,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "bodyFormula",
                                    placeholder: "Body formula",
                                    style: {
                                        width: "100%",
                                        minHeight: 100,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 656,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 655,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "ctaFormula",
                                    placeholder: "CTA formula",
                                    style: {
                                        width: "100%",
                                        minHeight: 70,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 663,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 662,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "bestUseCases",
                                    placeholder: "Best use cases",
                                    style: {
                                        width: "100%",
                                        minHeight: 60,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 670,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 669,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "tone",
                                    placeholder: "Tone",
                                    style: {
                                        width: "100%",
                                        minHeight: 60,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 677,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 676,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "examples",
                                    placeholder: "Examples",
                                    style: {
                                        width: "100%",
                                        minHeight: 80,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 684,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 683,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "tags",
                                    placeholder: "Tags",
                                    style: {
                                        width: "100%",
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 691,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 690,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "notes",
                                    placeholder: "Notes",
                                    style: {
                                        width: "100%",
                                        minHeight: 80,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 698,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 697,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                style: {
                                    marginTop: 12
                                },
                                children: "Save Copy Formula"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 704,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 628,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/dono/page.tsx",
                lineNumber: 625,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 30,
                    border: "1px solid #333",
                    padding: 16
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Create Offer Angle"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 711,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Used in prompt memory for offer/urgency hooks."
                    }, void 0, false, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 712,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        action: createOfferAngle,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                name: "name",
                                placeholder: "Name",
                                style: {
                                    width: 320,
                                    padding: 8,
                                    marginTop: 8
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 714,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "angleType",
                                    placeholder: "Angle type",
                                    style: {
                                        width: "100%",
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 720,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 719,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "summary",
                                    placeholder: "Summary",
                                    style: {
                                        width: "100%",
                                        minHeight: 80,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 727,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 726,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "hookIdeas",
                                    placeholder: "Hook ideas",
                                    style: {
                                        width: "100%",
                                        minHeight: 80,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 734,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 733,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "urgencyMechanics",
                                    placeholder: "Urgency mechanics",
                                    style: {
                                        width: "100%",
                                        minHeight: 80,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 741,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 740,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "bestUseCases",
                                    placeholder: "Best use cases",
                                    style: {
                                        width: "100%",
                                        minHeight: 60,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 748,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 747,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "examples",
                                    placeholder: "Examples",
                                    style: {
                                        width: "100%",
                                        minHeight: 80,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 755,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 754,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "seasonality",
                                    placeholder: "Seasonality",
                                    style: {
                                        width: "100%",
                                        minHeight: 60,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 762,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 761,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "tags",
                                    placeholder: "Tags",
                                    style: {
                                        width: "100%",
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 769,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 768,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "notes",
                                    placeholder: "Notes",
                                    style: {
                                        width: "100%",
                                        minHeight: 80,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 776,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 775,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                style: {
                                    marginTop: 12
                                },
                                children: "Save Offer Angle"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 782,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 713,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/dono/page.tsx",
                lineNumber: 710,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 30,
                    border: "1px solid #333",
                    padding: 16
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Create Research Note"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 789,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Used in prompt memory for supporting evidence and research."
                    }, void 0, false, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 790,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        action: createResearchNote,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                name: "title",
                                placeholder: "Title",
                                style: {
                                    width: 320,
                                    padding: 8,
                                    marginTop: 8
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 792,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "noteType",
                                    placeholder: "Note type (e.g. study, claim)",
                                    style: {
                                        width: "100%",
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 798,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 797,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "body",
                                    placeholder: "Body",
                                    style: {
                                        width: "100%",
                                        minHeight: 160,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 805,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 804,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "source",
                                    placeholder: "Source (URL/citation)",
                                    style: {
                                        width: "100%",
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 812,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 811,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "priority",
                                    placeholder: "Priority (number)",
                                    type: "number",
                                    style: {
                                        width: 200,
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 819,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 818,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "tags",
                                    placeholder: "Tags",
                                    style: {
                                        width: "100%",
                                        padding: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/dono/page.tsx",
                                    lineNumber: 827,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 826,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                style: {
                                    marginTop: 12
                                },
                                children: "Save Research Note"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/dono/page.tsx",
                                lineNumber: 833,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/dono/page.tsx",
                        lineNumber: 791,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/dono/page.tsx",
                lineNumber: 788,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/admin/dono/page.tsx",
        lineNumber: 247,
        columnNumber: 9
    }, this);
}
}),
"[project]/.next-internal/server/app/admin/dono/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/admin/dono/page.tsx [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$dono$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/admin/dono/page.tsx [app-rsc] (ecmascript)");
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
"[project]/.next-internal/server/app/admin/dono/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/admin/dono/page.tsx [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "00f901d11fe8f04785cd3c6658565ab2d62ad93e3b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$dono$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_0"],
    "4045ba37d8d236f40f14f4f6e2181c1cde9cedfc6a",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$dono$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_5"],
    "40462918826704c5f4ea908e01f1471ccb2dd96fb6",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$dono$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_1"],
    "404637d0f9ac68b88b9d4e40f7d2c0f413f8473289",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$dono$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_2"],
    "4059095179b8b19dd88034160d83a14c1b5a129ad2",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$dono$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_6"],
    "406e29c5600dddac356fe1546e7539bc4c1788ede4",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$dono$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_7"],
    "4099723d8d8a4a5460cef48d73865955c573f90983",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$dono$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_4"],
    "40ab8e8412f742ec8d593febe05297a7f0ca26d45e",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$dono$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_8"],
    "40e3d1a762376250616cc203d653347e445520c63f",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$dono$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_3"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$admin$2f$dono$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$admin$2f$dono$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/admin/dono/page/actions.js { ACTIONS_MODULE0 => "[project]/app/admin/dono/page.tsx [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$dono$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/admin/dono/page.tsx [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_54fc33ef._.js.map