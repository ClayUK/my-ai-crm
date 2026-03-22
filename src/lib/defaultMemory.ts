import { prisma } from "@/src/lib/prisma";

type MarketType = "product" | "donation";

const productCategoryNames = [
    { name: "Hooks", description: "Winning hook patterns and lead-ins" },
    { name: "Angles", description: "Strategic ad angles and themes" },
    { name: "Audience Pockets", description: "Specific audience personas and subsegments" },
    { name: "Visual Styles", description: "Reusable visual directions and creative looks" },
    { name: "CTA Styles", description: "Direct response and softer CTA patterns" },
    { name: "Scroll Stop Mechanics", description: "Pattern interrupts and thumb-stop ideas" },
    { name: "Reference Image Guidance", description: "What kinds of assets to upload" },
    { name: "Typography Direction", description: "Type styles and layout feel" },
    { name: "Platform Notes", description: "Platform-specific ad behavior notes" },
    { name: "Offer Angles", description: "Sale, urgency, gift, and conversion framing" },
];

const donationCategoryNames = [
    { name: "Donation Hooks", description: "Donation-specific hooks and lead-ins" },
    { name: "Impact Angles", description: "Ways to frame the impact of giving" },
    { name: "Donor Psychology", description: "Emotional triggers and donor motivations" },
    { name: "Urgency & Matching", description: "Deadlines, matches, and urgent asks" },
    { name: "Story Formats", description: "Narrative and testimonial structures" },
    { name: "Recurring Giving", description: "Monthly giving and sustainer messaging" },
    { name: "Trust & Proof", description: "Credibility, transparency, and proof devices" },
    { name: "Platform Notes", description: "Platform behavior for donation offers" },
];

async function ensureCategory(
    name: string,
    description: string,
    marketType: MarketType
) {
    return prisma.swipeCategory.upsert({
        where: {
            name_marketType: {
                name,
                marketType,
            },
        },
        update: {
            description,
        },
        create: {
            name,
            description,
            marketType,
        },
    });
}

export async function seedDefaultMemory(marketType: MarketType) {
    if (marketType === "product") {
        const existing = await prisma.swipeEntry.count({
            where: { marketType: "product" },
        });

        if (existing > 0) {
            return { skipped: true, reason: "Product memory already seeded" };
        }

        const categories = new Map<string, string>();

        for (const category of productCategoryNames) {
            const created = await ensureCategory(
                category.name,
                category.description,
                "product"
            );
            categories.set(category.name, created.id);
        }

        await prisma.swipeEntry.createMany({
            data: [
                {
                    marketType: "product",
                    categoryId: categories.get("Angles")!,
                    title: "Problem/Solution",
                    angle: "Problem/Solution",
                    concept:
                        "Show the pain point clearly, then show the product as the clean fix.",
                    audience: "Broad cold audience",
                    whyItWorks: "Fastest path to clarity and direct response.",
                    tags: "core,product,pain point,direct response",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Angles")!,
                    title: "Parental Relief",
                    angle: "Parental Relief",
                    concept:
                        "Focus on the emotional relief a parent feels when the product removes friction, guilt, chaos, or conflict.",
                    audience: "Parents",
                    emotionalTrigger: "relief,guilt reduction,calm",
                    whyItWorks: "High emotional resonance for parenting products.",
                    tags: "parents,emotion,relief",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Angles")!,
                    title: "Lifestyle / Aspiration",
                    angle: "Lifestyle/Aspiration",
                    concept:
                        "Sell the identity, the desired life, and the outcome around the product.",
                    audience: "Identity-driven buyers",
                    whyItWorks: "People buy the future self, not only the item.",
                    tags: "aspiration,identity,lifestyle",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Angles")!,
                    title: "Outdoor / Adventure",
                    angle: "Outdoor/Adventure",
                    concept:
                        "Frame the product around activity, movement, freedom, and real-world use.",
                    audience: "Outdoorsy families",
                    whyItWorks: "Adds energy and use-case specificity.",
                    tags: "outdoor,adventure,activity",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Angles")!,
                    title: "Gift Angle",
                    angle: "Gift",
                    concept:
                        "Position the product as a smart gift for birthdays, holidays, grandparents, or teachers.",
                    audience: "Gift buyers",
                    whyItWorks: "Expands use-case beyond direct self-purchase.",
                    tags: "gift,holiday,occasion",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Angles")!,
                    title: "Deal / Urgency",
                    angle: "Deal/Urgency",
                    concept: "Lead with sale, scarcity, timing, and social proof.",
                    audience: "Price-sensitive buyers",
                    emotionalTrigger: "FOMO, urgency",
                    whyItWorks: "Strong conversion driver when the offer is real.",
                    tags: "sale,urgency,fomo",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Angles")!,
                    title: "Education / Development",
                    angle: "Education",
                    concept:
                        "Focus on learning, development, progress, or skills built through the product.",
                    audience: "Parents, homeschool buyers",
                    whyItWorks: "Rational + emotional combined.",
                    tags: "education,development,learning",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Audience Pockets")!,
                    title: "Exhausted Millennial Moms",
                    audience: "Exhausted millennial moms",
                    concept:
                        "Tired, overloaded, juggling everything, wants practical relief and less chaos.",
                    emotionalTrigger: "relief,control,calm",
                    whyItWorks: "Clear emotional pain and large buyer segment.",
                    tags: "moms,parenting,chaos,relief",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Audience Pockets")!,
                    title: "Homeschool Parents",
                    audience: "Homeschool parents",
                    concept:
                        "Value educational payoff, structure, intentionality, and practical use.",
                    whyItWorks: "Strong need-state and rational buyer logic.",
                    tags: "homeschool,education,parents",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Audience Pockets")!,
                    title: "Outdoorsy Families",
                    audience: "Outdoorsy families",
                    concept:
                        "Value movement, exploration, and non-screen engagement.",
                    whyItWorks: "Pairs well with adventure and digital detox angles.",
                    tags: "outdoor,family,adventure",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Audience Pockets")!,
                    title: "Neurodiverse Support",
                    audience: "ADHD / sensory / regulation aware families",
                    concept:
                        "Frame product as helping focus, calm, sensory regulation, or peaceful play.",
                    whyItWorks: "Strong emotional and functional specificity.",
                    tags: "adhd,sensory,focus,regulation",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Audience Pockets")!,
                    title: "Multi-Kid Families",
                    audience: "Multi-kid households",
                    concept:
                        "Emphasize sibling harmony, shared use, less fighting, and easier family dynamics.",
                    whyItWorks: "Speaks to a real household pain point.",
                    tags: "siblings,multi-kid,family",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Audience Pockets")!,
                    title: "Dad / Masculine Practical Buyer",
                    audience: "Practical dads",
                    concept:
                        "Use rugged, no-fluff, useful, durable framing.",
                    whyItWorks: "Different tone than default mom-centric creative.",
                    tags: "dad,masculine,practical",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Audience Pockets")!,
                    title: "Minimalist Buyer",
                    audience: "Minimalist / anti-clutter buyer",
                    concept:
                        "Lead with intentionality, fewer better things, clean use, and anti-junk sentiment.",
                    whyItWorks: "Strong for premium and anti-noise positioning.",
                    tags: "minimalist,intentional,anti-clutter",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Audience Pockets")!,
                    title: "Nostalgic Gen X / Analog Childhood",
                    audience: "Nostalgic buyer",
                    concept:
                        "Tap into pre-screen childhood nostalgia, tactile play, and simpler times.",
                    whyItWorks:
                        "Powerful emotional bridge for parents buying for kids.",
                    tags: "nostalgia,analog,gen x",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Audience Pockets")!,
                    title: "Wellness / Digital Detox",
                    audience: "Mindful wellness-oriented parents",
                    concept:
                        "Frame product as reducing screens and making family life feel calmer and more present.",
                    whyItWorks:
                        "Fits modern parent concerns and values.",
                    tags: "wellness,digital detox,mindful parenting",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Visual Styles")!,
                    title: "Bold Text-Heavy Direct Response",
                    visualDirection: "Bold DR",
                    concept:
                        "Large headline, strong offer, obvious CTA, high readability, conversion-first composition.",
                    whyItWorks: "Clear and direct for paid social.",
                    tags: "bold,dr,text-heavy",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Visual Styles")!,
                    title: "Lifestyle / UGC Aesthetic",
                    visualDirection: "Lifestyle/UGC",
                    concept:
                        "Believable, less polished, feels captured in real life, emotionally accessible.",
                    whyItWorks: "Feels native and trusted.",
                    tags: "ugc,lifestyle,authentic",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Visual Styles")!,
                    title: "Clean Minimal",
                    visualDirection: "Clean Minimal",
                    concept:
                        "Simple composition, whitespace, strong product focus, premium feel.",
                    whyItWorks: "Great for premium and anti-clutter messaging.",
                    tags: "minimal,premium,clean",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Visual Styles")!,
                    title: "Infographic / Educational",
                    visualDirection: "Infographic/Educational",
                    concept:
                        "Teaches benefits fast with labels, arrows, features, and visual hierarchy.",
                    whyItWorks: "Makes benefits easier to process quickly.",
                    tags: "infographic,educational,features",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Visual Styles")!,
                    title: "Emotional / Aspirational",
                    visualDirection: "Emotional/Aspirational",
                    concept:
                        "Warm emotion, ideal life, meaningful outcome, softer CTA and mood.",
                    whyItWorks:
                        "Strong for top of funnel and identity-based selling.",
                    tags: "emotional,aspirational,identity",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Visual Styles")!,
                    title: "Rugged / Masculine",
                    visualDirection: "Rugged/Masculine",
                    concept:
                        "Darker tones, practical utility, bold type, less decorative polish.",
                    whyItWorks:
                        "Broadens appeal to under-targeted buyer segments.",
                    tags: "rugged,masculine,utility",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Visual Styles")!,
                    title: "Soft / Feminine",
                    visualDirection: "Soft/Feminine",
                    concept:
                        "Gentle palette, warmth, intimacy, soft shapes, trust-building tone.",
                    whyItWorks:
                        "Fits comfort, care, and emotional products well.",
                    tags: "soft,feminine,warm",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Visual Styles")!,
                    title: "Retro / Nostalgic",
                    visualDirection: "Retro/Nostalgic",
                    concept:
                        "Vintage-inspired cues, analog warmth, memory-triggering tone.",
                    whyItWorks:
                        "Great for anti-screen and throwback products.",
                    tags: "retro,nostalgic,vintage",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Visual Styles")!,
                    title: "Surreal / Pattern Interrupt",
                    visualDirection: "Surreal/Pattern Interrupt",
                    concept:
                        "Unexpected visual logic, weird scale, strange environment, thumb-stop energy.",
                    whyItWorks: "For scrolling interruption and curiosity.",
                    tags: "surreal,pattern interrupt,thumb-stop",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Visual Styles")!,
                    title: "Meme-Native / Chaotic",
                    visualDirection: "Meme-native/Chaotic",
                    concept:
                        "Internet-native formatting, chaotic energy, intentionally loud and culturally fluent.",
                    whyItWorks:
                        "High stop power if matched to product and audience.",
                    tags: "meme,chaotic,internet-native",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("CTA Styles")!,
                    title: "Hard Sell CTA",
                    cta: "Shop Now / Get Yours / Save Today",
                    concept:
                        "Use when urgency, discount, or obvious direct response is the angle.",
                    whyItWorks: "Best for bottom-funnel urgency.",
                    tags: "hard sell,cta,conversion",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("CTA Styles")!,
                    title: "Soft CTA",
                    cta: "See Why Parents Love It / Learn More / Explore the Collection",
                    concept:
                        "Use when emotional, identity, or trust is the angle.",
                    whyItWorks:
                        "Better fit for softer or aspirational creative.",
                    tags: "soft cta,trust,top funnel",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Scroll Stop Mechanics")!,
                    title: "Hot Take / Polarizing Statement",
                    hook: "Lead with an opinion strong enough to stop the scroll.",
                    concept:
                        "Use a controversial but relevant statement to break attention patterns.",
                    whyItWorks: "Fast interruption of feed autopilot.",
                    tags: "hot take,polarizing,scroll stop",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Scroll Stop Mechanics")!,
                    title: "Absurd Visual / Pattern Interrupt",
                    hook: "Use a visually strange or exaggerated scene to force attention.",
                    concept: "The image itself becomes the hook.",
                    whyItWorks: "Visual novelty gets attention quickly.",
                    tags: "absurd,visual,pattern interrupt",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Scroll Stop Mechanics")!,
                    title: "Fake UGC / Caught Moment",
                    hook: "Make it feel like a real moment was captured unexpectedly.",
                    concept:
                        "Doorbell cam, phone snapshot, caught in the act, imperfect realness.",
                    whyItWorks: "Feels native and believable.",
                    tags: "ugc,caught moment,believable",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Scroll Stop Mechanics")!,
                    title: "Meme / Rage Bait",
                    hook: "Internet-native, slightly chaotic, opinionated or funny formatting.",
                    concept:
                        "Use sparingly where brand/product fit.",
                    whyItWorks: "Can drive very high stop rate.",
                    tags: "meme,rage bait,viral",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Scroll Stop Mechanics")!,
                    title: "Curiosity Gap",
                    hook: "Say enough to trigger curiosity but not enough to fully explain.",
                    concept: "Creates a need to resolve the gap.",
                    whyItWorks: "Strong click/attention behavior.",
                    tags: "curiosity gap,clickbait,interest",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Scroll Stop Mechanics")!,
                    title: "POV / First-Person Immersion",
                    hook: "Make the viewer feel inside the moment.",
                    concept: "POV framing creates self-projection.",
                    whyItWorks: "Immersion improves emotional response.",
                    tags: "pov,first-person,immersion",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Reference Image Guidance")!,
                    title: "Reference Image Rules",
                    concept:
                        "Always specify what asset should be uploaded: product hero, product in-hand, lifestyle shot, packaging, user photo, or brand photography.",
                    whyItWorks:
                        "Reduces vague image generation and improves consistency.",
                    tags: "reference images,assets,nano banana",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Typography Direction")!,
                    title: "Typography Specificity Rule",
                    concept:
                        "Never say generic typography. Specify weight, feel, color, spacing, and analogous brand if useful.",
                    whyItWorks:
                        "Improves output quality and visual specificity.",
                    tags: "typography,specificity,design system",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Platform Notes")!,
                    title: "Meta Platform Note",
                    platform: "Meta",
                    concept:
                        "Meta ads benefit from fast readability, clear hierarchy, strong stop-power, and obvious first-frame communication.",
                    whyItWorks: "Meta feed is fast and crowded.",
                    tags: "meta,platform,native",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Platform Notes")!,
                    title: "TikTok Platform Note",
                    platform: "TikTok",
                    concept:
                        "TikTok creative should feel less polished, more native, and more emotionally immediate.",
                    whyItWorks:
                        "Overproduced assets often feel less native.",
                    tags: "tiktok,platform,native,ugc",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Offer Angles")!,
                    title: "Seasonal / Gift Offer",
                    offerType: "seasonal",
                    concept:
                        "Use holiday, birthday, grandparent, and occasion framing.",
                    whyItWorks:
                        "Expands conversion moments beyond direct need-state.",
                    tags: "seasonal,gift,occasion",
                },
                {
                    marketType: "product",
                    categoryId: categories.get("Offer Angles")!,
                    title: "Social Proof + Scarcity",
                    offerType: "scarcity",
                    concept:
                        "Combine proof with time pressure or stock pressure.",
                    whyItWorks: "Blends trust and urgency.",
                    tags: "social proof,scarcity,urgency",
                },
            ],
        });

        await prisma.conceptFramework.createMany({
            data: [
                {
                    marketType: "product",
                    name: "Standard Batch of 5",
                    frameworkType: "batching",
                    summary:
                        "Organize product ads into batches of 5 with varied audiences and angles.",
                    structure:
                        "Each batch covers multiple angles, audiences, and styles without repetition.",
                    promptInstructions:
                        "Track format split, avoid same audience back-to-back, vary style and CTA intensity.",
                    bestUseCases: "5-30 ad product campaigns",
                    tags: "batching,rotation,product",
                },
                {
                    marketType: "product",
                    name: "Clickbait Batch",
                    frameworkType: "scroll-stop",
                    summary:
                        "Separate clickbait/experimental ad batch from core conversion ads.",
                    structure: "Use one unique scroll-stop mechanic per ad.",
                    promptInstructions:
                        "Keep more experimental hooks separate from core ad batch.",
                    bestUseCases: "High-volume angle exploration",
                    tags: "clickbait,scroll stop,experimentation",
                },
                {
                    marketType: "product",
                    name: "Audience Rotation Framework",
                    frameworkType: "diversity",
                    summary:
                        "Force audience variety so ads do not all speak to the same buyer persona.",
                    structure: "Rotate audience pocket every ad where possible.",
                    promptInstructions:
                        "Do not let consecutive ads target the same audience pocket.",
                    bestUseCases: "Larger ad batches",
                    tags: "audience,rotation,diversity",
                },
                {
                    marketType: "product",
                    name: "Style Rotation Framework",
                    frameworkType: "diversity",
                    summary:
                        "Alternate visual styles to avoid repetitive look and feel.",
                    structure: "Do not repeat the same style back-to-back.",
                    promptInstructions:
                        "Mix bold DR, UGC, minimal, infographic, emotional, and pattern interrupt styles.",
                    bestUseCases: "Creative fatigue reduction",
                    tags: "style,rotation,creative variation",
                },
            ],
        });

        await prisma.audienceInsight.createMany({
            data: [
                {
                    marketType: "product",
                    name: "Exhausted Millennial Moms",
                    segmentType: "parent",
                    demographics:
                        "Millennial moms, often managing children and household load.",
                    psychographics:
                        "Values relief, peace, practical solutions, less chaos.",
                    painPoints:
                        "Overwhelm, guilt, friction, screen overuse, decision fatigue.",
                    desires: "Calm house, easier parenting, more present family life.",
                    buyingTriggers:
                        "Immediate relief, believable transformation, emotional resonance.",
                    languagePatterns:
                        "I just need something that works. I am tired of the chaos.",
                    tags: "moms,parenting,relief",
                },
                {
                    marketType: "product",
                    name: "Homeschool Parents",
                    segmentType: "education",
                    demographics:
                        "Parents teaching at home or seeking educational enrichment.",
                    psychographics:
                        "Intentional, practical, value learning outcomes.",
                    painPoints:
                        "Keeping kids engaged, reducing friction, making learning easier.",
                    desires: "Useful, skill-building, meaningful products.",
                    buyingTriggers:
                        "Clear developmental or educational benefit.",
                    tags: "homeschool,education,parents",
                },
                {
                    marketType: "product",
                    name: "Outdoorsy Families",
                    segmentType: "lifestyle",
                    demographics:
                        "Families who value activity and time outside.",
                    psychographics:
                        "Movement, adventure, freedom, non-screen play.",
                    painPoints:
                        "Too much indoor time, too many screens, low engagement.",
                    desires:
                        "More active and memorable family experiences.",
                    buyingTriggers:
                        "Adventure, use-case vividness, healthy contrast to screens.",
                    tags: "outdoor,family,adventure",
                },
                {
                    marketType: "product",
                    name: "Neurodiverse Support Families",
                    segmentType: "special-needs-aware",
                    demographics:
                        "Parents aware of ADHD, sensory, regulation, or focus needs.",
                    psychographics:
                        "Seeking calm, practical support, non-judgmental solutions.",
                    painPoints:
                        "Overstimulation, regulation issues, focus struggles.",
                    desires:
                        "Calm, smoother routines, supportive tools.",
                    buyingTriggers:
                        "Specificity, empathy, functional benefit.",
                    tags: "adhd,sensory,regulation",
                },
            ],
        });

        await prisma.visualPattern.createMany({
            data: [
                {
                    marketType: "product",
                    name: "Bold Direct Response Hero",
                    patternType: "product",
                    summary:
                        "Large headline, strong offer, product clear in frame.",
                    composition:
                        "Product dominant, text hierarchy strong, conversion-focused layout.",
                    lighting: "Bright, high-clarity, commercial lighting.",
                    typographyStyle: "Bold, highly legible, high contrast.",
                    tags: "dr,hero,offer",
                },
                {
                    marketType: "product",
                    name: "Believable UGC Lifestyle",
                    patternType: "lifestyle",
                    summary:
                        "Feels captured in real life, not overly polished.",
                    composition:
                        "Human context, believable scene, emotionally familiar.",
                    lighting: "Natural window light or casual home light.",
                    mood: "Warm, real, trustworthy.",
                    tags: "ugc,lifestyle,authentic",
                },
                {
                    marketType: "product",
                    name: "Infographic Explainer",
                    patternType: "educational",
                    summary:
                        "Feature-led layout with labels and visual teaching.",
                    composition: "Product + pointers + feature labels.",
                    typographyStyle: "Clean, structured, readable.",
                    tags: "infographic,educational,features",
                },
            ],
        });

        await prisma.copyFormula.createMany({
            data: [
                {
                    marketType: "product",
                    name: "The Thing Nobody Tells You",
                    formulaType: "hook",
                    headlineFormula:
                        "The [thing] nobody tells you about [problem]",
                    bodyFormula:
                        "Expose hidden frustration, introduce product as cleaner solution.",
                    ctaFormula: "See why people are switching",
                    bestUseCases: "Cold audience pattern interrupt",
                    tags: "hook,curiosity,problem",
                },
                {
                    marketType: "product",
                    name: "If You Are This, This Is For You",
                    formulaType: "audience-match",
                    headlineFormula:
                        "If you are a [persona], this is for you",
                    bodyFormula:
                        "Call out pain point + outcome + why it fits this persona.",
                    ctaFormula: "See if it fits your family",
                    bestUseCases: "Audience pocket ads",
                    tags: "persona,audience,match",
                },
                {
                    marketType: "product",
                    name: "Stop Doing This, Do This Instead",
                    formulaType: "hot-take",
                    headlineFormula:
                        "Stop [bad behavior], do this instead",
                    bodyFormula:
                        "Contrast old ineffective behavior with better approach.",
                    ctaFormula: "Try the better way",
                    bestUseCases:
                        "Direct response / opinionated hook",
                    tags: "hot take,contrast,problem solution",
                },
            ],
        });

        await prisma.offerAngle.createMany({
            data: [
                {
                    marketType: "product",
                    name: "Urgency Discount Angle",
                    angleType: "discount",
                    summary:
                        "Lead with active offer and time pressure.",
                    hookIdeas:
                        "40% Off Today / Ends Tonight / Save Before It Sells Out",
                    urgencyMechanics:
                        "deadline, low stock, sale ending",
                    tags: "discount,urgency,offer",
                },
                {
                    marketType: "product",
                    name: "Gift Positioning Angle",
                    angleType: "gift",
                    summary:
                        "Position the product as an easy meaningful gift.",
                    hookIdeas:
                        "The gift they actually use / perfect for birthdays and holidays",
                    seasonality:
                        "birthday, holiday, teacher, grandparent",
                    tags: "gift,seasonal",
                },
            ],
        });

        await prisma.researchNote.createMany({
            data: [
                {
                    marketType: "product",
                    title: "Product Prompt Generator Rules",
                    noteType: "system-spec",
                    body:
                        "Avoid generic AI aesthetic, repetitive hooks, vague scenes, missing text placement, same audience repeated, back-to-back same styles, mismatched CTA intensity. Prioritize diverse audience pockets, exact copy, specific scene details, clear reference image guidance, style and CTA variation, and quality-check output.",
                    tags: "rules,quality control,product",
                    priority: 10,
                },
                {
                    marketType: "product",
                    title: "Desired Ad Output Structure",
                    noteType: "format-spec",
                    body:
                        "Each ad should include angle, audience, format, style, testimonial, reference image guidance, detailed scene prompt, text overlay top/middle/bottom/CTA, and typography direction.",
                    tags: "format,ads,product",
                    priority: 10,
                },
            ],
        });

        return { skipped: false, marketType: "product" };
    }

    const existing = await prisma.swipeEntry.count({
        where: { marketType: "donation" },
    });

    if (existing > 0) {
        return { skipped: true, reason: "Donation memory already seeded" };
    }

    const categories = new Map<string, string>();

    for (const category of donationCategoryNames) {
        const created = await ensureCategory(
            category.name,
            category.description,
            "donation"
        );
        categories.set(category.name, created.id);
    }

    await prisma.swipeEntry.createMany({
        data: [
            {
                marketType: "donation",
                categoryId: categories.get("Donation Hooks")!,
                title: "Urgent Human Need Hook",
                hook: "Someone needs help right now.",
                concept:
                    "Lead with immediate human need and direct emotional relevance.",
                emotionalTrigger: "urgency, compassion, responsibility",
                whyItWorks:
                    "Fast emotional clarity for donation action.",
                tags: "donation,urgency,emotion",
            },
            {
                marketType: "donation",
                categoryId: categories.get("Donation Hooks")!,
                title: "Donor as Hero",
                hook: "You can be the reason this changes today.",
                concept:
                    "Frame the donor as the active force creating the outcome.",
                emotionalTrigger: "agency, purpose, hero identity",
                whyItWorks:
                    "Turns passive sympathy into active participation.",
                tags: "donor hero,identity,agency",
            },
            {
                marketType: "donation",
                categoryId: categories.get("Impact Angles")!,
                title: "Specific Impact Per Dollar",
                angle: "Concrete impact",
                concept:
                    "Translate donation amount into a visible outcome.",
                whyItWorks:
                    "Makes giving feel real and measurable.",
                tags: "impact,concrete,conversion",
            },
            {
                marketType: "donation",
                categoryId: categories.get("Impact Angles")!,
                title: "Before / After Impact",
                angle: "Transformation",
                concept:
                    "Show what changes because of support.",
                whyItWorks:
                    "People give to move someone from pain to possibility.",
                tags: "transformation,before-after",
            },
            {
                marketType: "donation",
                categoryId: categories.get("Urgency & Matching")!,
                title: "Match Ends Tonight",
                angle: "Matching gift",
                concept:
                    "Use a match deadline to increase urgency and perceived leverage.",
                whyItWorks:
                    "Boosts urgency and value of each dollar.",
                tags: "matching,deadline,urgency",
            },
            {
                marketType: "donation",
                categoryId: categories.get("Recurring Giving")!,
                title: "Monthly Sustainer Framing",
                angle: "Recurring donation",
                concept:
                    "Frame monthly giving as steady rescue and consistent support.",
                whyItWorks:
                    "Builds sustainable donor value.",
                tags: "monthly,sustainer,recurring",
            },
            {
                marketType: "donation",
                categoryId: categories.get("Trust & Proof")!,
                title: "Transparency / Proof of Use",
                angle: "Proof",
                concept:
                    "Show where the money goes, what changed, and why the org is credible.",
                whyItWorks:
                    "Reduces skepticism and donor hesitation.",
                tags: "trust,credibility,proof",
            },
            {
                marketType: "donation",
                categoryId: categories.get("Story Formats")!,
                title: "Single Person Story",
                angle: "Story hook",
                concept:
                    "One human story beats abstract numbers when emotional connection matters.",
                whyItWorks:
                    "Concrete story increases empathy and memory.",
                tags: "story,emotion,empathy",
            },
        ],
    });

    await prisma.conceptFramework.createMany({
        data: [
            {
                marketType: "donation",
                name: "Need → Hope → Action",
                frameworkType: "donation-core",
                summary:
                    "Show the problem, show the hope, then ask for the gift.",
                structure:
                    "Need → emotional stakes → credible intervention → action",
                promptInstructions:
                    "Do not bury the ask. Keep the ask connected to the impact.",
                tags: "donation,core framework",
            },
            {
                marketType: "donation",
                name: "Specific Dollar Impact",
                frameworkType: "donation-conversion",
                summary:
                    "Tie donation amounts to visible outcomes.",
                structure: "$X does Y for Z person or cause",
                promptInstructions:
                    "Use specific amounts and outcomes when possible.",
                tags: "impact,specificity,donation",
            },
            {
                marketType: "donation",
                name: "Match Deadline Framework",
                frameworkType: "urgency",
                summary:
                    "Use match windows and deadlines for urgency.",
                structure:
                    "match opportunity → time deadline → donor leverage",
                promptInstructions:
                    "Use hard CTA and urgency when the match is real.",
                tags: "matching,urgency,cta",
            },
        ],
    });

    await prisma.audienceInsight.createMany({
        data: [
            {
                marketType: "donation",
                name: "Compassion-Driven First-Time Donor",
                segmentType: "donor",
                demographics: "Broad adult donor profile",
                psychographics:
                    "Wants to help, emotionally responsive, needs clarity and trust",
                painPoints:
                    "Feels helpless, unsure where to give, overwhelmed by causes",
                desires:
                    "To help in a meaningful way and feel confident it matters",
                objections:
                    "Is this real? Will my money matter?",
                buyingTriggers:
                    "Specific impact, urgency, social proof, transparency",
                tags: "first-time donor,trust,impact",
            },
            {
                marketType: "donation",
                name: "Recurring Giver / Sustainer Prospect",
                segmentType: "donor",
                psychographics:
                    "Values consistency, responsibility, long-term change",
                desires:
                    "To create reliable impact over time",
                objections:
                    "I already give enough / I do not want another monthly charge",
                buyingTriggers:
                    "Monthly impact framing, low-friction entry amount, stability message",
                tags: "monthly donor,sustainer",
            },
        ],
    });

    await prisma.visualPattern.createMany({
        data: [
            {
                marketType: "donation",
                name: "Human Impact Portrait",
                patternType: "donation",
                summary:
                    "Emotionally direct portrait with clear stakes and compassionate composition.",
                composition:
                    "Subject forward, context visible but not distracting.",
                lighting: "Natural, honest, empathetic lighting.",
                mood: "Serious but hopeful.",
                tags: "donation,portrait,emotion",
            },
            {
                marketType: "donation",
                name: "Impact Infographic Donation Ad",
                patternType: "donation",
                summary:
                    "Show what each gift amount makes possible.",
                composition:
                    "Donation amount + outcome + visual support.",
                typographyStyle:
                    "Readable and trust-building.",
                tags: "infographic,impact,donation",
            },
        ],
    });

    await prisma.copyFormula.createMany({
        data: [
            {
                marketType: "donation",
                name: "Your Gift Does This",
                formulaType: "impact",
                headlineFormula: "Your $[amount] can [specific result]",
                bodyFormula:
                    "Translate gift directly into tangible impact.",
                ctaFormula: "Give now",
                tags: "impact,donation,direct",
            },
            {
                marketType: "donation",
                name: "Before Midnight Match",
                formulaType: "urgency",
                headlineFormula:
                    "Your gift will be doubled before midnight",
                bodyFormula:
                    "Explain the match and what doubled support does.",
                ctaFormula: "Double your impact now",
                tags: "match,deadline,urgency",
            },
        ],
    });

    await prisma.offerAngle.createMany({
        data: [
            {
                marketType: "donation",
                name: "Matching Gift Angle",
                angleType: "matching",
                summary:
                    "Use matches to increase leverage and urgency.",
                hookIdeas:
                    "Your gift goes twice as far / Match ends tonight",
                urgencyMechanics:
                    "deadline, challenge grant, doubled impact",
                tags: "match,donation,urgency",
            },
            {
                marketType: "donation",
                name: "Monthly Giving Angle",
                angleType: "monthly",
                summary:
                    "Frame small recurring gifts as dependable long-term help.",
                hookIdeas:
                    "Become a monthly lifeline / Give once, help all year",
                tags: "monthly,recurring,sustainer",
            },
        ],
    });

    await prisma.researchNote.createMany({
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
`,
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
`,
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
`,
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
`,
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
`,
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
`,
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
`,
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
`,
            },
            {
                marketType: "donation",
                title: "Donation Creative Core Rule",
                noteType: "system-spec",
                body:
                    "Donation creative should maximize emotional clarity, trust, concrete impact, and donor agency. Show why the gift matters, where the money goes, and why now.",
                tags: "donation,rules,trust,impact",
                priority: 10,
            },
            {
                marketType: "donation",
                title: "Donation CTA Rule",
                noteType: "system-spec",
                body:
                    "Use harder CTAs when urgency or matching is real. Use softer trust-building CTAs when the ad is story-first or emotional-first.",
                tags: "donation,cta,urgency",
                priority: 8,
            },
        ],
    });

    return { skipped: false, marketType: "donation" };
}
