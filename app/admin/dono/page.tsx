import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { seedDefaultMemory } from "@/src/lib/defaultMemory";
import { redirect } from "next/navigation";

const MARKET_TYPE = "donation";

async function seedDonationMemory() {
    "use server";
    await seedDefaultMemory("donation");
    redirect("/admin/dono");
}

async function createSwipeCategory(formData: FormData) {
    "use server";

    const name = formData.get("name")?.toString().trim();
    const description = formData.get("description")?.toString().trim() || "";

    if (!name) throw new Error("Category name is required");

    await prisma.swipeCategory.create({
        data: {
            name,
            description,
            marketType: MARKET_TYPE,
        },
    });

    redirect("/admin/dono");
}

async function createSwipeEntry(formData: FormData) {
    "use server";

    const title = formData.get("title")?.toString().trim();
    const categoryId = formData.get("categoryId")?.toString().trim();

    if (!title || !categoryId) {
        throw new Error("Swipe entry title and category are required");
    }

    await prisma.swipeEntry.create({
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
            notes: formData.get("notes")?.toString().trim() || null,
        },
    });

    redirect("/admin/dono");
}

async function createConceptFramework(formData: FormData) {
    "use server";

    const name = formData.get("name")?.toString().trim();
    if (!name) throw new Error("Framework name is required");

    await prisma.conceptFramework.create({
        data: {
            name,
            marketType: MARKET_TYPE,
            frameworkType: formData.get("frameworkType")?.toString().trim() || null,
            summary: formData.get("summary")?.toString().trim() || null,
            structure: formData.get("structure")?.toString().trim() || null,
            promptInstructions:
                formData.get("promptInstructions")?.toString().trim() || null,
            bestUseCases: formData.get("bestUseCases")?.toString().trim() || null,
            badUseCases: formData.get("badUseCases")?.toString().trim() || null,
            examples: formData.get("examples")?.toString().trim() || null,
            tags: formData.get("tags")?.toString().trim() || null,
            notes: formData.get("notes")?.toString().trim() || null,
        },
    });

    redirect("/admin/dono");
}

async function createAudienceInsight(formData: FormData) {
    "use server";

    const name = formData.get("name")?.toString().trim();
    if (!name) throw new Error("Audience name is required");

    await prisma.audienceInsight.create({
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
            languagePatterns:
                formData.get("languagePatterns")?.toString().trim() || null,
            stylePreferences:
                formData.get("stylePreferences")?.toString().trim() || null,
            platformBehavior:
                formData.get("platformBehavior")?.toString().trim() || null,
            tags: formData.get("tags")?.toString().trim() || null,
            notes: formData.get("notes")?.toString().trim() || null,
        },
    });

    redirect("/admin/dono");
}

async function createVisualPattern(formData: FormData) {
    "use server";

    const name = formData.get("name")?.toString().trim();
    if (!name) throw new Error("Visual pattern name is required");

    await prisma.visualPattern.create({
        data: {
            name,
            marketType: MARKET_TYPE,
            patternType: formData.get("patternType")?.toString().trim() || null,
            summary: formData.get("summary")?.toString().trim() || null,
            composition: formData.get("composition")?.toString().trim() || null,
            lighting: formData.get("lighting")?.toString().trim() || null,
            colorPalette: formData.get("colorPalette")?.toString().trim() || null,
            typographyStyle:
                formData.get("typographyStyle")?.toString().trim() || null,
            mood: formData.get("mood")?.toString().trim() || null,
            backgroundStyle:
                formData.get("backgroundStyle")?.toString().trim() || null,
            productPlacement:
                formData.get("productPlacement")?.toString().trim() || null,
            useCase: formData.get("useCase")?.toString().trim() || null,
            examples: formData.get("examples")?.toString().trim() || null,
            tags: formData.get("tags")?.toString().trim() || null,
            notes: formData.get("notes")?.toString().trim() || null,
        },
    });

    redirect("/admin/dono");
}

async function createCopyFormula(formData: FormData) {
    "use server";

    const name = formData.get("name")?.toString().trim();
    if (!name) throw new Error("Copy formula name is required");

    await prisma.copyFormula.create({
        data: {
            name,
            marketType: MARKET_TYPE,
            formulaType: formData.get("formulaType")?.toString().trim() || null,
            structure: formData.get("structure")?.toString().trim() || null,
            headlineFormula:
                formData.get("headlineFormula")?.toString().trim() || null,
            bodyFormula: formData.get("bodyFormula")?.toString().trim() || null,
            ctaFormula: formData.get("ctaFormula")?.toString().trim() || null,
            bestUseCases: formData.get("bestUseCases")?.toString().trim() || null,
            tone: formData.get("tone")?.toString().trim() || null,
            examples: formData.get("examples")?.toString().trim() || null,
            tags: formData.get("tags")?.toString().trim() || null,
            notes: formData.get("notes")?.toString().trim() || null,
        },
    });

    redirect("/admin/dono");
}

async function createOfferAngle(formData: FormData) {
    "use server";

    const name = formData.get("name")?.toString().trim();
    if (!name) throw new Error("Offer angle name is required");

    await prisma.offerAngle.create({
        data: {
            name,
            marketType: MARKET_TYPE,
            angleType: formData.get("angleType")?.toString().trim() || null,
            summary: formData.get("summary")?.toString().trim() || null,
            hookIdeas: formData.get("hookIdeas")?.toString().trim() || null,
            urgencyMechanics:
                formData.get("urgencyMechanics")?.toString().trim() || null,
            bestUseCases:
                formData.get("bestUseCases")?.toString().trim() || null,
            examples: formData.get("examples")?.toString().trim() || null,
            seasonality: formData.get("seasonality")?.toString().trim() || null,
            tags: formData.get("tags")?.toString().trim() || null,
            notes: formData.get("notes")?.toString().trim() || null,
        },
    });

    redirect("/admin/dono");
}

async function createResearchNote(formData: FormData) {
    "use server";

    const title = formData.get("title")?.toString().trim();
    if (!title) throw new Error("Research note title is required");

    await prisma.researchNote.create({
        data: {
            title,
            marketType: MARKET_TYPE,
            noteType: formData.get("noteType")?.toString().trim() || null,
            body: formData.get("body")?.toString().trim() || "",
            source: formData.get("source")?.toString().trim() || null,
            tags: formData.get("tags")?.toString().trim() || null,
            priority: (() => {
                const raw = formData.get("priority")?.toString().trim();
                if (!raw) return null;
                const n = Number(raw);
                return Number.isFinite(n) ? n : null;
            })(),
        },
    });

    redirect("/admin/dono");
}

export default async function DonationAdminPage() {
    const categories = await prisma.swipeCategory.findMany({
        where: { marketType: MARKET_TYPE },
        orderBy: { createdAt: "desc" },
    });

    return (
        <main style={{ padding: 40, maxWidth: 1200 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1>Memory — Donation</h1>
                    <p style={{ marginTop: 8 }}>
                        Add and refine donation-side swipe memory for SacredStatics.
                    </p>
                </div>

                <div>
                    <Link
                        href="/"
                        style={{
                            border: "1px solid #444",
                            padding: "10px 14px",
                            textDecoration: "none",
                            marginRight: 10,
                        }}
                    >
                        Home
                    </Link>
                    <Link
                        href="/admin"
                        style={{
                            border: "1px solid #444",
                            padding: "10px 14px",
                            textDecoration: "none",
                        }}
                    >
                        Product
                    </Link>
                </div>
            </div>

            <div style={{ marginTop: 20, border: "1px solid #333", padding: 16 }}>
                <h2>Seed Donation Memory</h2>
                <p>Preload donation-focused hooks, impact angles, donor psychology, matching gift urgency, recurring giving, and style systems.</p>
                <form action={seedDonationMemory}>
                    <button type="submit" style={{ marginTop: 12 }}>
                        Seed Donation Memory
                    </button>
                </form>
            </div>

            <div style={{ marginTop: 30, border: "1px solid #333", padding: 16 }}>
                <h2>Create Swipe Category</h2>
                <form action={createSwipeCategory}>
                    <input
                        name="name"
                        placeholder="Donation Hooks, Donor Psychology..."
                        style={{ width: 320, padding: 8, marginTop: 8 }}
                    />
                    <br />
                    <textarea
                        name="description"
                        placeholder="What this category is for"
                        style={{ width: "100%", minHeight: 80, padding: 8, marginTop: 12 }}
                    />
                    <br />
                    <button type="submit" style={{ marginTop: 12 }}>
                        Save Category
                    </button>
                </form>

                <div style={{ marginTop: 18 }}>
                    <h3>Existing Categories</h3>
                    {categories.length === 0 ? (
                        <p>No categories yet.</p>
                    ) : (
                        <ul>
                            {categories.map((category) => (
                                <li key={category.id}>
                                    <strong>{category.name}</strong>
                                    {category.description ? ` — ${category.description}` : ""}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div style={{ marginTop: 30, border: "1px solid #333", padding: 16 }}>
                <h2>Create Swipe Entry</h2>
                <form action={createSwipeEntry}>
                    <button type="submit" style={{ marginTop: 12 }}>
                        Save Swipe Entry
                    </button>
                    <div style={{ marginTop: 8 }}>
                        <input
                            name="title"
                            placeholder="Entry title"
                            style={{ width: 320, padding: 8 }}
                        />
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <select name="categoryId" style={{ width: 320, padding: 8 }}>
                            <option value="">Select category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <input name="hook" placeholder="Hook" style={{ width: "100%", padding: 8 }} />
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <input name="angle" placeholder="Angle" style={{ width: "100%", padding: 8 }} />
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <textarea name="concept" placeholder="Concept" style={{ width: "100%", minHeight: 80, padding: 8 }} />
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <textarea name="copy" placeholder="Winning copy or example copy" style={{ width: "100%", minHeight: 100, padding: 8 }} />
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <input name="cta" placeholder="CTA" style={{ width: "100%", padding: 8 }} />
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <input name="visualDirection" placeholder="Visual direction" style={{ width: "100%", padding: 8 }} />
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <input name="audience" placeholder="Audience" style={{ width: "100%", padding: 8 }} />
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <input name="platform" placeholder="Platform" style={{ width: "100%", padding: 8 }} />
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <input name="funnelStage" placeholder="Funnel stage" style={{ width: "100%", padding: 8 }} />
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <input name="offerType" placeholder="Offer type" style={{ width: "100%", padding: 8 }} />
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <input name="emotionalTrigger" placeholder="Emotional trigger" style={{ width: "100%", padding: 8 }} />
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <input name="objectionHandled" placeholder="Objection handled" style={{ width: "100%", padding: 8 }} />
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <textarea name="whyItWorks" placeholder="Why it works" style={{ width: "100%", minHeight: 80, padding: 8 }} />
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <input name="source" placeholder="Source" style={{ width: "100%", padding: 8 }} />
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <input name="tags" placeholder="Tags" style={{ width: "100%", padding: 8 }} />
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <textarea name="notes" placeholder="Notes" style={{ width: "100%", minHeight: 80, padding: 8 }} />
                    </div>

                </form>
            </div>

            <div style={{ marginTop: 30, border: "1px solid #333", padding: 16 }}>
                <h2>Create Concept Framework</h2>
                <form action={createConceptFramework}>
                    <button type="submit" style={{ marginTop: 12 }}>
                        Save Concept Framework
                    </button>
                    <input
                        name="name"
                        placeholder="Framework name"
                        style={{ width: 320, padding: 8, marginTop: 8 }}
                    />
                    <div style={{ marginTop: 12 }}>
                        <input name="frameworkType" placeholder="Framework type" style={{ width: "100%", padding: 8 }} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea name="summary" placeholder="Summary" style={{ width: "100%", minHeight: 80, padding: 8 }} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea name="structure" placeholder="Structure" style={{ width: "100%", minHeight: 80, padding: 8 }} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea name="promptInstructions" placeholder="Prompt instructions" style={{ width: "100%", minHeight: 80, padding: 8 }} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea name="bestUseCases" placeholder="Best use cases" style={{ width: "100%", minHeight: 60, padding: 8 }} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea name="badUseCases" placeholder="Bad use cases" style={{ width: "100%", minHeight: 60, padding: 8 }} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea name="examples" placeholder="Examples" style={{ width: "100%", minHeight: 80, padding: 8 }} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <input name="tags" placeholder="Tags" style={{ width: "100%", padding: 8 }} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea name="notes" placeholder="Notes" style={{ width: "100%", minHeight: 80, padding: 8 }} />
                    </div>

                </form>
            </div>

            <div style={{ marginTop: 30, border: "1px solid #333", padding: 16 }}>
                <h2>Create Audience Insight</h2>
                <form action={createAudienceInsight}>
                    <button type="submit" style={{ marginTop: 12 }}>
                        Save Audience Insight
                    </button>
                    <input
                        name="name"
                        placeholder="Audience name"
                        style={{ width: 320, padding: 8, marginTop: 8 }}
                    />
                    <div style={{ marginTop: 12 }}>
                        <input name="segmentType" placeholder="Segment type" style={{ width: "100%", padding: 8 }} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea name="demographics" placeholder="Demographics" style={{ width: "100%", minHeight: 70, padding: 8 }} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea name="psychographics" placeholder="Psychographics" style={{ width: "100%", minHeight: 70, padding: 8 }} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea name="painPoints" placeholder="Pain points" style={{ width: "100%", minHeight: 70, padding: 8 }} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea name="desires" placeholder="Desires" style={{ width: "100%", minHeight: 70, padding: 8 }} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea name="fears" placeholder="Fears" style={{ width: "100%", minHeight: 70, padding: 8 }} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea name="objections" placeholder="Objections" style={{ width: "100%", minHeight: 70, padding: 8 }} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea name="buyingTriggers" placeholder="Buying triggers" style={{ width: "100%", minHeight: 70, padding: 8 }} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea name="languagePatterns" placeholder="Language patterns" style={{ width: "100%", minHeight: 70, padding: 8 }} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea name="stylePreferences" placeholder="Style preferences" style={{ width: "100%", minHeight: 70, padding: 8 }} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea name="platformBehavior" placeholder="Platform behavior" style={{ width: "100%", minHeight: 70, padding: 8 }} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <input name="tags" placeholder="Tags" style={{ width: "100%", padding: 8 }} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea name="notes" placeholder="Notes" style={{ width: "100%", minHeight: 80, padding: 8 }} />
                    </div>

                </form>
            </div>

            <div style={{ marginTop: 30, border: "1px solid #333", padding: 16 }}>
                <h2>Create Visual Pattern</h2>
                <p>
                    Used in prompt memory to shape scene, lighting, composition, and
                    typography.
                </p>
                <form action={createVisualPattern}>
                    <input
                        name="name"
                        placeholder="Name"
                        style={{ width: 320, padding: 8, marginTop: 8 }}
                    />
                    <div style={{ marginTop: 12 }}>
                        <input
                            name="patternType"
                            placeholder="Pattern type"
                            style={{ width: "100%", padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="summary"
                            placeholder="Summary"
                            style={{ width: "100%", minHeight: 80, padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="composition"
                            placeholder="Composition"
                            style={{ width: "100%", minHeight: 80, padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="lighting"
                            placeholder="Lighting"
                            style={{ width: "100%", minHeight: 80, padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="colorPalette"
                            placeholder="Color palette"
                            style={{ width: "100%", minHeight: 80, padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="typographyStyle"
                            placeholder="Typography style"
                            style={{ width: "100%", minHeight: 80, padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="mood"
                            placeholder="Mood"
                            style={{ width: "100%", minHeight: 60, padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="backgroundStyle"
                            placeholder="Background style"
                            style={{ width: "100%", minHeight: 60, padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="productPlacement"
                            placeholder="Product placement"
                            style={{ width: "100%", minHeight: 60, padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="useCase"
                            placeholder="Use case"
                            style={{ width: "100%", minHeight: 60, padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="examples"
                            placeholder="Examples"
                            style={{ width: "100%", minHeight: 60, padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <input
                            name="tags"
                            placeholder="Tags"
                            style={{ width: "100%", padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="notes"
                            placeholder="Notes"
                            style={{ width: "100%", minHeight: 80, padding: 8 }}
                        />
                    </div>
                    <button type="submit" style={{ marginTop: 12 }}>
                        Save Visual Pattern
                    </button>
                </form>
            </div>

            <div style={{ marginTop: 30, border: "1px solid #333", padding: 16 }}>
                <h2>Create Copy Formula</h2>
                <p>Used in prompt memory for headline/body/CTA copy structure.</p>
                <form action={createCopyFormula}>
                    <input
                        name="name"
                        placeholder="Name"
                        style={{ width: 320, padding: 8, marginTop: 8 }}
                    />
                    <div style={{ marginTop: 12 }}>
                        <input
                            name="formulaType"
                            placeholder="Formula type"
                            style={{ width: "100%", padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="structure"
                            placeholder="Structure"
                            style={{ width: "100%", minHeight: 80, padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="headlineFormula"
                            placeholder="Headline formula"
                            style={{ width: "100%", minHeight: 70, padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="bodyFormula"
                            placeholder="Body formula"
                            style={{ width: "100%", minHeight: 100, padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="ctaFormula"
                            placeholder="CTA formula"
                            style={{ width: "100%", minHeight: 70, padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="bestUseCases"
                            placeholder="Best use cases"
                            style={{ width: "100%", minHeight: 60, padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="tone"
                            placeholder="Tone"
                            style={{ width: "100%", minHeight: 60, padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="examples"
                            placeholder="Examples"
                            style={{ width: "100%", minHeight: 80, padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <input
                            name="tags"
                            placeholder="Tags"
                            style={{ width: "100%", padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="notes"
                            placeholder="Notes"
                            style={{ width: "100%", minHeight: 80, padding: 8 }}
                        />
                    </div>
                    <button type="submit" style={{ marginTop: 12 }}>
                        Save Copy Formula
                    </button>
                </form>
            </div>

            <div style={{ marginTop: 30, border: "1px solid #333", padding: 16 }}>
                <h2>Create Offer Angle</h2>
                <p>Used in prompt memory for offer/urgency hooks.</p>
                <form action={createOfferAngle}>
                    <input
                        name="name"
                        placeholder="Name"
                        style={{ width: 320, padding: 8, marginTop: 8 }}
                    />
                    <div style={{ marginTop: 12 }}>
                        <input
                            name="angleType"
                            placeholder="Angle type"
                            style={{ width: "100%", padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="summary"
                            placeholder="Summary"
                            style={{ width: "100%", minHeight: 80, padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="hookIdeas"
                            placeholder="Hook ideas"
                            style={{ width: "100%", minHeight: 80, padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="urgencyMechanics"
                            placeholder="Urgency mechanics"
                            style={{ width: "100%", minHeight: 80, padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="bestUseCases"
                            placeholder="Best use cases"
                            style={{ width: "100%", minHeight: 60, padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="examples"
                            placeholder="Examples"
                            style={{ width: "100%", minHeight: 80, padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="seasonality"
                            placeholder="Seasonality"
                            style={{ width: "100%", minHeight: 60, padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <input
                            name="tags"
                            placeholder="Tags"
                            style={{ width: "100%", padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="notes"
                            placeholder="Notes"
                            style={{ width: "100%", minHeight: 80, padding: 8 }}
                        />
                    </div>
                    <button type="submit" style={{ marginTop: 12 }}>
                        Save Offer Angle
                    </button>
                </form>
            </div>

            <div style={{ marginTop: 30, border: "1px solid #333", padding: 16 }}>
                <h2>Create Research Note</h2>
                <p>Used in prompt memory for supporting evidence and research.</p>
                <form action={createResearchNote}>
                    <input
                        name="title"
                        placeholder="Title"
                        style={{ width: 320, padding: 8, marginTop: 8 }}
                    />
                    <div style={{ marginTop: 12 }}>
                        <input
                            name="noteType"
                            placeholder="Note type (e.g. study, claim)"
                            style={{ width: "100%", padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <textarea
                            name="body"
                            placeholder="Body"
                            style={{ width: "100%", minHeight: 160, padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <input
                            name="source"
                            placeholder="Source (URL/citation)"
                            style={{ width: "100%", padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <input
                            name="priority"
                            placeholder="Priority (number)"
                            type="number"
                            style={{ width: 200, padding: 8 }}
                        />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <input
                            name="tags"
                            placeholder="Tags"
                            style={{ width: "100%", padding: 8 }}
                        />
                    </div>
                    <button type="submit" style={{ marginTop: 12 }}>
                        Save Research Note
                    </button>
                </form>
            </div>

        </main>
    );
}