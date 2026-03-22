/** Helpers for optional Kling video packs (KIE still + KLING animation strand). */

export function extractStaticVisualFromAdPrompt(combined: string): string {
    const t = (combined || "").trim();
    if (!t) return "";
    if (
        t.includes("KIE_IMAGE_PROMPT:") &&
        t.includes("|| KLING_ANIMATION_PROMPT:")
    ) {
        const after = t.split("KIE_IMAGE_PROMPT:")[1] || "";
        return after.split("|| KLING_ANIMATION_PROMPT:")[0].trim();
    }
    if (t.includes("KIE_IMAGE_PROMPT:")) {
        return (t.split("KIE_IMAGE_PROMPT:")[1] || "").trim();
    }
    return t;
}

export function extractKiePortionForImageGen(visualPrompt: string): string {
    const t = (visualPrompt || "").trim();
    if (
        t.includes("KIE_IMAGE_PROMPT:") &&
        t.includes("|| KLING_ANIMATION_PROMPT:")
    ) {
        const after = t.split("KIE_IMAGE_PROMPT:")[1] || "";
        return after.split("|| KLING_ANIMATION_PROMPT:")[0].trim();
    }
    return t;
}

export function buildKlingAngleLabel(previousAngle: string): string {
    const a = (previousAngle || "").trim();
    if (a.startsWith("KLING VIDEO READY")) return a;
    return a ? `KLING VIDEO READY — ${a}` : "KLING VIDEO READY";
}
