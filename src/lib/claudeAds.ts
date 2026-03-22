export function normalizeRequestedAdCount(value?: string | null) {
    if (!value) return 6;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 6;
    if (parsed < 1) return 1;
    if (parsed > 1000) return 1000;
    return Math.floor(parsed);
}

export function extractJsonObject(text: string) {
    const trimmed = text.trim();

    try {
        return JSON.parse(trimmed);
    } catch { }

    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");

    if (start !== -1 && end !== -1 && end > start) {
        const possible = trimmed.slice(start, end + 1);
        try {
            return JSON.parse(possible);
        } catch { }
    }

    return null;
}

type ValidatedAd = {
    angle: string;
    hook: string;
    primaryText: string;
    headline: string;
    cta: string;
    visualPrompt: string;
    [key: string]: unknown;
};

export function validateAds(parsed: unknown, requestedCount: number) {
    if (!parsed || typeof parsed !== "object") {
        throw new Error("Claude did not return a valid JSON object.");
    }

    const ads = (parsed as any).ads;
    if (!Array.isArray(ads)) {
        throw new Error("Claude response is missing the ads array.");
    }

    if (ads.length !== requestedCount) {
        throw new Error(
            `Claude returned ${ads.length} ads but ${requestedCount} were requested.`
        );
    }

    const requiredFields: Array<keyof ValidatedAd> = [
        "angle",
        "hook",
        "primaryText",
        "headline",
        "cta",
        "visualPrompt",
    ];

    ads.forEach((ad: any, index: number) => {
        const adNum = index + 1;

        if (!ad || typeof ad !== "object") {
            throw new Error(`Ad ${adNum} is not a valid object.`);
        }

        for (const field of requiredFields) {
            const value = ad[field];
            if (typeof value !== "string" || !value.trim()) {
                throw new Error(`Ad ${adNum} is missing required field: ${String(field)}`);
            }
        }
    });

    return ads as ValidatedAd[];
}

