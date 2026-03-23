/**
 * Infer Kie API aspect_ratio from creative prompt text when the user has not
 * set an explicit override (Variation options).
 */
export function inferKieAspectRatioFromPrompt(
    prompt: string
): "1:1" | "9:16" {
    const p = (prompt || "").trim();
    if (!p) return "1:1";

    const tallHints =
        /\b9\s*:\s*16\b|\b1080\s*[x×]\s*1920\b|\b720\s*[x×]\s*1280\b|\breels?\b|\btik\s*tok\b|\bshorts\b|\bvertical\s+video\b|\bportrait\s+orientation\b|\bstories\b(?:\s+format)?/i;
    const squareHints =
        /\b1\s*:\s*1\b|\b1080\s*[x×]\s*1080\b|\b1x1\b|\bsquare\s+(?:format|frame|ratio|image)\b|\b1\s*×\s*1\b/i;

    const hasTall = tallHints.test(p);
    const hasSquare = squareHints.test(p);

    if (hasTall && !hasSquare) return "9:16";
    if (hasSquare && !hasTall) return "1:1";
    if (hasTall && hasSquare) {
        if (/\b(reels?|tik\s*tok|shorts|stories)\b/i.test(p)) return "9:16";
        return "1:1";
    }

    return "1:1";
}
