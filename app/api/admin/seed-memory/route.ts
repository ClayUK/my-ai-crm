import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

function authOk(req: NextRequest): boolean {
    const secret = process.env.CRM_AGENT_SECRET;
    if (!secret) return true;
    return req.headers.get("x-crm-secret") === secret;
}

// ─── TEMPLATE STYLES ─────────────────────────────────────────────────────────
const ADDITIONAL_INFO = `
UGC_SNAPCHAT = Shot on iPhone, vertical format. Raw, authentic, imperfect. Person filming themselves or a loved one — shaky, emotional, real. Dim indoor light or harsh outdoor. Grainy sensor noise visible. Subject looks directly into camera mid-emotion: tears drying, jaw clenched, eyes red. Caption-style text in white Impact or Helvetica Bold burned into frame — max 6 words, positioned bottom third. Feels like it was posted at 2am out of desperation, not scheduled by a marketing team. Hospital room, car seat, kitchen floor. NEVER clean. NEVER produced. This is a person's real life leaking onto your feed.

NATIVE_ORGANIC = Organic Facebook or Instagram post. Shot on a mid-range Android or iPhone, posted directly from camera roll — not edited. Slightly overexposed or colour-shifted from phone auto-processing. Subject in everyday clothes, natural setting: backyard, hospital waiting room, doorstep. No graphic overlays. No filters. Feels like a friend or neighbour posted this themselves. If text, it's typed as a caption below the image like a real post, not overlaid on the image. Approachable, community-feel, documentary realness.

HYPER_CLICKBAIT = Maximum cinematic emotional impact. Shot with professional DSLR or RED camera. Dramatic directional lighting — harsh side light, golden hour rim light, or single practical lamp in darkness. Subject mid-extreme-expression: tears streaming, hands gripping bed rail, face buried in hands, or looking to sky. Photojournalism meets Hollywood drama. Deep cinematic colour grade: cool shadows, warm highlights, lifted blacks, crushed darks. Rule of thirds composition. Subject sharp, background beautiful bokeh. Text overlay if used: bold cinematic font, white on dark or yellow all-caps. This is designed to stop a fast thumb mid-scroll.

CREATIVE_CONCEPT = Designed visual — not a photo. Choose one of these aesthetics and commit fully:
SPOTIFY WRAPPED: Bold gradient background (deep purple→hot pink, navy→electric blue, black→gold), large bold stat centred ("47 days in hospital", "1 surgery away from coming home", "$8,400 standing between her and treatment"), clean sans-serif, minimalist. Feels data-driven and shareable.
VET BILL / HOSPITAL BILL: Realistic-looking printed bill or receipt aesthetic. Itemised charges. Total at bottom circled in red pen. Handwritten note: "We can't pay this." Feels viscerally real and financially triggering.
NOTES APP: iPhone Notes screenshot. Plain white background, system font. Reads like a private note someone screenshotted. "Day 34. She asked me if she was going to die. I didn't know what to say."
MISSING POSTER / FLYER ON POLE: Weathered paper texture, staple holes, slightly crooked. Photo of subject. Bold header. Torn tabs at bottom with donation link. Feels urgent, grassroots, human.
PAPER SIGN: Handwritten cardboard sign held by someone. Sharpie on cardboard. Raw lettering. "Please help us save [name]." Feels like a street-level cry for help.

ILLUSTRATED = Digital illustration or stylised art. Choose one aesthetic and execute fully:
STORYBOARD PANELS: 3-4 panels in comic/graphic novel style. Panel 1: happy before moment. Panel 2: the diagnosis or accident day. Panel 3: current struggle. Panel 4: what your donation makes possible. Warm muted palette, expressive linework, short caption per panel. Tells the entire arc in one image.
WATERCOLOUR PORTRAIT: Painterly portrait of subject, warm loose brushstrokes, emotional eyes as focal point. Minimal text integrated as brushstroke lettering. Feels like commissioned art for someone who matters.
INFOGRAPHIC ILLUSTRATION: Clean editorial illustration style — think New Yorker meets GoFundMe. Facts and figures woven into illustrated scene. Approachable for people who scroll past photos.

KLING_VIDEO = Frozen-motion cinematic still. Frame designed to animate: tears mid-fall, breath visible in cold air, hand reaching toward camera, curtain mid-billow. Subject in sharp focus, background in motion blur. Dramatic depth of field. Colour grade: teal-orange split. Feels like a frame ripped from a documentary short film. Every element suggests movement about to happen.

# VARIATION MODIFIERS
VAR_HIGHER_AGGRESSION = Maximum emotional intensity. Lead with the single most devastating detail. No softening. Imagery: worst moment, not the best. Hook language: gut punch first, hope second. "She was supposed to graduate this year." "He hasn't held his daughter in 3 months." Urgency baked into every word.

VAR_LOWER_AGGRESSION = Warm, hopeful, community-focused. Lead with love and connection, not pain. "A community showing up." "Small kindnesses adding up." Imagery: human connection, gentle touch, soft light. For donors who respond to warmth not guilt.

VAR_ADD_TEXT = Bold text overlay burned into image. Hook as headline — 5 words max, punchy. White with drop shadow or on dark strip. Second line donation ask. Readable at thumbnail size on a phone. Font: Impact, Helvetica Bold, or Oswald.

VAR_NO_TEXT = Pure image. No overlays. No text. The visual carries everything. Maximum emotional power through composition, expression, and light alone.

VAR_STRONGER_CTA = Unmissable call to action integrated into visual. "Donate now — link in bio", "Tap to help — every dollar counts", "Don't scroll past." CTA feels urgent and direct.

VAR_HIGHER_QUALITY = Elevate every technical element. Perfect exposure. Professional colour grade. Precise rule-of-thirds composition. Subject tack-sharp. Background melting into beautiful bokeh. Feels like it was shot for a major charity campaign by a professional photographer.

VAR_BEFORE_AFTER = Split composition. Left or top: the before (vibrant, healthy, normal life, full of colour). Right or bottom: the after (current reality — stark, clinical, difficult). Visual weight heavy on the after side. No text needed — the contrast says everything.

VAR_SPOTIFY_WRAPPED = Full Spotify Wrapped aesthetic. Bold gradient (purple→pink or navy→electric blue). Large centred stat. Clean sans-serif typography. Feels like a data card gone viral. Shareable by people who wouldn't normally share a charity post.

VAR_STORYBOARD = 3-4 panel comic/storyboard layout. Timeline: normal life → crisis moment → current struggle → what donation enables. Each panel captioned. Illustrated or photo+graphic hybrid. Tells the whole story in one scroll-stopping image.

VAR_NEWS_HEADLINE = Breaking news / local news broadcast aesthetic. Subject photo with news lower-third graphic. Ticker tape at bottom. "COMMUNITY RALLIES FOR..." or "LOCAL FAMILY NEEDS YOUR HELP" header. Journalistic credibility makes it feel urgent and newsworthy.

VAR_PHONE_NOTES = iPhone Notes or iMessage screenshot. Plain white background, system font, no design. Reads like a private note or text thread. The most raw, intimate format possible. "Day 47. The vet says she won't make it past Friday without surgery. We've tried everything."

VAR_VET_BILL = Realistic-looking vet invoice or hospital bill. Itemised line items. Total circled in red pen. Handwritten annotation. Triggers the financial reality viscerally. Works for both animal and human campaigns.

VAR_MISSING_POSTER = Weathered paper flyer / missing person poster aesthetic. Staple holes, slight angle. Bold header text. Photo of subject. Torn pull-tabs at bottom. Feels grassroots, urgent, human. Like it was printed at a library and stapled to every pole in town.
`.trim();

const WINNING_PROMPTS = `
Hyper-realistic close-up of weathered hands holding a crumpled vet bill, red pen circle around the total, tears blurred in background, golden hour through a car window, Canon 5D photojournalism quality
iPhone Notes screenshot aesthetic: plain white, system font, dark text reading "Day 34. She asked me if she was going to die. I didn't know what to say." — nothing else in frame
Spotify Wrapped style: deep navy to electric blue gradient, large bold white stat centred, clean Helvetica, subtle medical cross icon, feels viral and data-driven
Storyboard 4-panel illustration: warm sunset normal life → hospital corridor harsh light → empty pet bed → family reunited, graphic novel linework, muted warm palette
Cinematic frozen motion: single tear mid-fall from closed eye, rim light from hospital window, teal-orange grade, feels like a documentary film frame, 85mm portrait lens
Missing poster aesthetic: weathered cream paper, staple holes top corners, candid subject photo, bold black header, handwritten donation URL on torn tab at bottom
Hospital bill closeup: printed itemised invoice, red pen circle around $12,400 total, sticky note "insurance denied" attached, raw financial reality, no people needed
Handwritten cardboard sign held at chest: thick black sharpie lettering "Please help us save Bella", background blurred street scene, authentic desperation
Split frame before/after: vibrant outdoor adventure photo left, stark white hospital room right, same subject, same location impossible, colour drains left to right
iMessage thread screenshot: blue bubble "The surgery is tomorrow. We're still $3,000 short." Grey bubble "I'm so sorry. What can we do?" Blue bubble "Share this if you can."
`.trim();

export async function POST(req: NextRequest) {
    if (!authOk(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = (prisma as any).creativeBrain;
    if (!db) return NextResponse.json({ error: "creativeBrain not available" }, { status: 500 });

    const existing = await db.findUnique({ where: { scope: "fundraiser" } });
    const existingPrompts = existing?.previousWinningPrompts?.trim() || "";
    const mergedPrompts = existingPrompts ? `${existingPrompts}\n${WINNING_PROMPTS}` : WINNING_PROMPTS;

    if (existing) {
        await db.update({
            where: { scope: "fundraiser" },
            data: { additionalInfo: ADDITIONAL_INFO, previousWinningPrompts: mergedPrompts },
        });
    } else {
        await db.create({
            data: { scope: "fundraiser", additionalInfo: ADDITIONAL_INFO, previousWinningPrompts: mergedPrompts, anglesList: "" },
        });
    }

    return NextResponse.json({
        ok: true,
        templates: 6,
        varModifiers: 13,
        winningPromptsAdded: 10,
    });
}
