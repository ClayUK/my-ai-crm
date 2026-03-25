import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

function authOk(req: NextRequest): boolean {
    const secret = process.env.CRM_AGENT_SECRET;
    if (!secret) return true;
    return req.headers.get("x-crm-secret") === secret;
}

// ─── TEMPLATE STYLES ────────────────────────────────────────────────────────
// Each key maps to a donation style template in the CRM batch planner

const ADDITIONAL_INFO = `
UGC_SNAPCHAT = Snapchat/iPhone vertical video still. Shot on iPhone 13 or older — slightly grainy, warm, imperfect framing. Person filming themselves or a loved one. Authentic, raw, unfiltered. Shaky camera feel. No studio lighting — natural window light or dim indoor. Subject looks directly into camera. Caption-style text overlay in bold white Impact or Helvetica. Feels like a real person's story, not an ad. Emotional but not produced. Shot in a hospital room, home, car, or backyard. NEVER polished. NEVER professional photography.

NATIVE_ORGANIC = Organic Facebook/Instagram post aesthetic. Shot on a mid-range phone, posted directly to social. Clean but candid — not a selfie, more like a friend took it. Natural light outdoors or soft indoor. Slightly overexposed or real-world colour grading. Subject in everyday clothing. No graphic design elements — just the raw image as if shared directly from camera roll. Caption text as if typed into a Facebook post. Feels like a real community member sharing, not a brand. Warm, relatable, documentary.

HYPER_CLICKBAIT = Maximum emotional impact, hyper-realistic, cinematic. DSLR or Red camera quality. Dramatic lighting — golden hour, harsh shadows, rim light. Subject mid-expression — tears streaming, mouth open in pain or joy, hands reaching. Photojournalism meets Hollywood drama. Deep colour grading — desaturated background, saturated subject. Close crop on face or hands. Text overlay in bold cinematic font — white with black stroke or all caps yellow. Designed to stop the scroll instantly. Think viral news photo meets movie poster.

CREATIVE_CONCEPT = Conceptual art direction. Not a photo — a designed visual narrative. Duotone colour wash, illustrated elements, geometric overlays, split-screen before/after, or symbolic imagery (broken heart, clock, empty bowl, hospital wristband). Bold typography as design element, not just caption. Instagram carousel aesthetic or editorial magazine layout. Could be minimalist (white space, one powerful image) or maximalist (collage, layered textures). Tells the story through visual metaphor. Think Spotify Wrapped meets a non-profit awareness campaign.

ILLUSTRATED = Digital illustration or stylised art. Painterly, watercolour, or bold graphic novel style. Subject rendered as illustration — warm colour palette, expressive linework. Could be storyboard-style panels showing timeline of events. Emotional but approachable — designed for people who scroll past photos but stop for art. Include subtle texture overlays. Caption integrated into illustration as handwritten or brushstroke text. Think Children's book meets campaign poster meets Instagram infographic.

KLING_VIDEO = Hyper-cinematic still optimised for video animation. Frozen motion — tears mid-fall, hair blowing, hand reaching toward camera. Subject in sharp focus, background motion-blurred. Dramatic depth of field. Colour grade: teal shadows, warm highlights. Feels like a frame from a high-budget documentary or short film. Everything in the frame should suggest movement about to happen. Designed so Kling AI can animate naturally.

# VARIATION MODIFIERS
VAR_HIGHER_AGGRESSION = Push the emotional intensity to maximum. Use the most devastating detail from the backstory. Lead with pain before hope. The hook should feel like a gut punch. Urgency language throughout — "right now", "today", "before it's too late". Imagery should show the worst moment, not the best.

VAR_LOWER_AGGRESSION = Warm, gentle, hopeful tone. Lead with love and community, not pain. Soft language — "together we can", "every little helps", "a small act of kindness". Imagery should show connection, warmth, human touch. Designed for donors who respond to positivity rather than guilt.

VAR_ADD_TEXT = Include bold text overlay on the image. Hook as headline text — short, punchy, 5 words max. Second line with donation ask. White text with drop shadow or dark background strip. Text should be readable at thumbnail size. Use Impact, Helvetica Bold, or Oswald font style.

VAR_NO_TEXT = Pure image, no text overlay. Let the visual do all the work. Maximum emotional power through composition alone. Image must communicate the story without any words.

VAR_STRONGER_CTA = End with unmissable call to action. "Donate now — link in bio", "Tap to help", "Every dollar counts — give today", "Don't scroll past". CTA should feel urgent and direct, not soft.

VAR_HIGHER_QUALITY = Elevate production quality. Perfect exposure, professional colour grade, precise composition following rule of thirds. Subject sharp, background beautifully bokeh'd. Feels like it was shot by a professional photographer for a major charity campaign.

VAR_BEFORE_AFTER = Split composition showing contrast. Left/top: the before (healthy, happy, normal life). Right/bottom: the after (current situation, difficulty, need). Clear visual transition. Powerful without needing words. Works as a swipe carousel or single split image.

VAR_SPOTIFY_WRAPPED = Spotify Wrapped / Year in Review aesthetic. Bold gradient background (deep purple to hot pink, or navy to electric blue). Large bold stat in centre ("47 days in hospital", "$12,400 needed", "1 surgery away from recovery"). Clean sans-serif typography. Feels data-driven and shareable. Modern, Gen-Z aesthetic. Designed to go viral through shareability not sadness.

VAR_STORYBOARD = Comic/storyboard panel layout. 3-4 panels telling the timeline: Panel 1 (before/normal life) → Panel 2 (the moment/diagnosis) → Panel 3 (current struggle) → Panel 4 (what your donation enables). Each panel has a caption. Illustrated or photo + graphic hybrid. Tells the whole story in one scroll-stopping image.

VAR_NEWS_HEADLINE = Breaking news / local news aesthetic. Ticker bar at bottom with headline. Network news lower-third graphic. "DEVELOPING STORY" or "COMMUNITY RALLIES FOR..." header. Makes the situation feel urgent and newsworthy. Journalistic credibility.

VAR_PHONE_NOTES = iPhone Notes app or text message screenshot aesthetic. Plain white background, black system font. Reads like a private note or text someone screenshotted and posted. Deeply intimate and authentic. The most raw, undesigned format possible — which makes it feel the most real.
`.trim();

const WINNING_PROMPTS = `
Hyper-realistic close-up of a weathered hand holding a hospital wristband, golden hour light streaming through a window, photojournalism quality, tears visible on cheek in soft background blur, Canon 5D feel
Split-frame iPhone screenshot: left panel shows a happy family photo, right panel shows the same location now empty/sterile, no filter, grainy, raw
Spotify Wrapped style graphic: deep purple gradient, large white bold stat "62 days fighting" centred, clean modern typography, subtle heartbeat line graphic underneath
Storyboard panel: top-left happy moment, top-right the diagnosis day, bottom-left hospital bed, bottom-right donation link — graphic novel illustration style, warm muted palette
Documentary photography: parent slumped in hospital waiting room chair, institutional lighting, 35mm film grain, honest and unposed, deeply human
iPhone selfie style vertical video still: person looking directly into camera, eyes red from crying, dim bathroom lighting, caption overlay "I didn't think I'd have to ask for help but here we are"
Cinematic close-up: child's hand in adult's hand on hospital bed rail, depth of field blur on background medical equipment, golden hour through blinds, colour grade cool shadows warm highlights
Notes app screenshot aesthetic: plain white background, typed message "Day 47. The doctors say she's stable. We still owe $8,400. I don't know what to do."
Before/after split: vibrant active lifestyle photo on left, stark white hospital room on right, visual weight heavy on right side, no text needed
News lower-third graphic style: photo of subject with "COMMUNITY FUNDRAISER" ticker, journalistic treatment, makes it feel urgent and newsworthy
`.trim();

export async function POST(req: NextRequest) {
    if (!authOk(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = (prisma as any).creativeBrain;
    if (!db) return NextResponse.json({ error: "creativeBrain not available" }, { status: 500 });

    const existing = await db.findUnique({ where: { scope: "fundraiser" } });

    if (existing) {
        // Merge winning prompts
        const existingPrompts = (existing.previousWinningPrompts || "").trim();
        const mergedPrompts = existingPrompts
            ? `${existingPrompts}\n${WINNING_PROMPTS}`
            : WINNING_PROMPTS;

        await db.update({
            where: { scope: "fundraiser" },
            data: {
                additionalInfo: ADDITIONAL_INFO,
                previousWinningPrompts: mergedPrompts,
            },
        });
    } else {
        await db.create({
            data: {
                scope: "fundraiser",
                additionalInfo: ADDITIONAL_INFO,
                previousWinningPrompts: WINNING_PROMPTS,
                anglesList: "",
            },
        });
    }

    return NextResponse.json({
        ok: true,
        templates: ["UGC_SNAPCHAT", "NATIVE_ORGANIC", "HYPER_CLICKBAIT", "CREATIVE_CONCEPT", "ILLUSTRATED", "KLING_VIDEO"],
        varModifiers: ["VAR_HIGHER_AGGRESSION", "VAR_LOWER_AGGRESSION", "VAR_ADD_TEXT", "VAR_NO_TEXT", "VAR_STRONGER_CTA", "VAR_HIGHER_QUALITY", "VAR_BEFORE_AFTER", "VAR_SPOTIFY_WRAPPED", "VAR_STORYBOARD", "VAR_NEWS_HEADLINE", "VAR_PHONE_NOTES"],
        winningPrompts: 10,
    });
}
