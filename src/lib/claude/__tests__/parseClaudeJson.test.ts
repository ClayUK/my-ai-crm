import { describe, expect, test } from "vitest";
import {
    normalizeAdsCount,
    parseClaudeAdPayload,
    parseValidateAndNormalizeClaudeAds,
    sanitizeClaudeRawOutput,
    validateClaudeAdsPayload,
} from "../parseClaudeJson";

function makeAd(overrides: Partial<Record<string, string>> = {}) {
    return {
        angle: "Angle",
        hook: "Hook",
        primaryText: "Primary text",
        headline: "Headline",
        cta: "Shop now",
        visualPrompt: "Very detailed visual prompt",
        ...overrides,
    };
}

describe("sanitizeClaudeRawOutput", () => {
    test("trims and removes BOM", () => {
        const withBom = "\uFEFF  {\"ads\":[]}  ";
        expect(sanitizeClaudeRawOutput(withBom)).toBe("{\"ads\":[]}");
    });
});

describe("parseClaudeAdPayload", () => {
    test("parses valid raw JSON object", () => {
        const raw = JSON.stringify({ ads: [makeAd()] });
        const result = parseClaudeAdPayload(raw);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(Array.isArray(result.data.ads)).toBe(true);
            expect(result.meta.strategy).toBe("direct");
        }
    });

    test("parses valid raw JSON array (coerced to payload)", () => {
        const raw = JSON.stringify([makeAd(), makeAd({ angle: "Angle2" })]);
        const result = parseClaudeAdPayload(raw);
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.data.ads).toHaveLength(2);
    });

    test("parses JSON inside ```json fenced block", () => {
        const json = JSON.stringify({ ads: [makeAd()] }, null, 2);
        const raw = `Here you go:\n\n\`\`\`json\n${json}\n\`\`\`\n`;
        const result = parseClaudeAdPayload(raw);
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.meta.strategy).toBe("code_fence");
    });

    test("parses JSON inside plain triple-backtick block", () => {
        const json = JSON.stringify({ ads: [makeAd()] }, null, 2);
        const raw = `\`\`\`\n${json}\n\`\`\``;
        const result = parseClaudeAdPayload(raw);
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.meta.strategy).toBe("code_fence");
    });

    test("parses JSON with prose before and after (balanced extract)", () => {
        const json = JSON.stringify({ ads: [makeAd()] }, null, 2);
        const raw = `Sure — here is the JSON:\n${json}\nThanks!`;
        const result = parseClaudeAdPayload(raw);
        expect(result.ok).toBe(true);
        if (result.ok) expect(["balanced_extract", "direct"]).toContain(result.meta.strategy);
    });

    test("handles nested JSON extraction", () => {
        const json = JSON.stringify({ ads: [makeAd()], other: { a: { b: [1, 2, 3] } } }, null, 2);
        const raw = `prefix\n${json}\nsuffix`;
        const result = parseClaudeAdPayload(raw);
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.data).toHaveProperty("ads");
    });

    test("fails cleanly on invalid JSON", () => {
        const raw = "```json\n{ not: valid }\n```";
        const result = parseClaudeAdPayload(raw);
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.length).toBeGreaterThan(0);
            expect(result.preview.length).toBeGreaterThan(0);
        }
    });

    test("recovers near-miss payload with wrong ads key", () => {
        const raw = JSON.stringify({ adIdeas: [makeAd()] });
        const result = parseClaudeAdPayload(raw);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(Array.isArray(result.data.ads)).toBe(true);
            expect(result.data.ads).toHaveLength(1);
        }
    });
});

describe("validateClaudeAdsPayload", () => {
    test("fails when schema is wrong", () => {
        const payload = { ads: [{ angle: "only angle" }] } as any;
        const result = validateClaudeAdsPayload(payload);
        // Validation returns ok:true with 0 valid ads + warnings; 0-valid-ads is handled as error by parseValidateAndNormalizeClaudeAds.
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.ads).toHaveLength(0);
    });

    test("passes when required fields exist", () => {
        const payload = { ads: [makeAd(), makeAd({ angle: "Angle2" })] };
        const result = validateClaudeAdsPayload(payload as any);
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.ads).toHaveLength(2);
    });
});

describe("normalizeAdsCount", () => {
    test("trims when more ads than requested", () => {
        const ads = [makeAd(), makeAd({ angle: "2" }), makeAd({ angle: "3" })] as any;
        const res = normalizeAdsCount(ads, 2);
        expect(res.ads).toHaveLength(2);
        expect(res.warnings[0]).toContain("trimming");
    });

    test("warns when fewer ads than requested", () => {
        const ads = [makeAd()] as any;
        const res = normalizeAdsCount(ads, 3);
        expect(res.ads).toHaveLength(1);
        expect(res.warnings[0]).toContain("fewer");
    });
});

describe("parseValidateAndNormalizeClaudeAds", () => {
    test("returns ok and trims when more ads than requested", () => {
        const raw = JSON.stringify({ ads: [makeAd(), makeAd({ angle: "2" }), makeAd({ angle: "3" })] });
        const res = parseValidateAndNormalizeClaudeAds(raw, 2);
        expect(res.ok).toBe(true);
        if (res.ok) {
            expect(res.ads).toHaveLength(2);
            expect(res.diagnostics.warnings.join("\n")).toContain("trimming");
            expect(res.diagnostics.strategy).toBe("direct");
        }
    });

    test("returns ok but warns when fewer ads than requested", () => {
        const raw = JSON.stringify({ ads: [makeAd()] });
        const res = parseValidateAndNormalizeClaudeAds(raw, 3);
        expect(res.ok).toBe(true);
        if (res.ok) {
            expect(res.ads).toHaveLength(1);
            expect(res.diagnostics.warnings.join("\n")).toContain("fewer");
            expect(res.diagnostics.returnedAdCount).toBe(1);
        }
    });

    test("fails when schema validation fails", () => {
        const raw = JSON.stringify({ ads: [{ angle: "only angle" }] });
        const res = parseValidateAndNormalizeClaudeAds(raw, 1);
        expect(res.ok).toBe(false);
        if (!res.ok) {
            expect(res.diagnostics.error || "").toContain("no valid ads");
            expect(res.diagnostics.strategy).toBe("direct");
        }
    });
});

