type ParseOk<T> = {
    ok: true;
    data: T;
    meta: { strategy: ParseStrategy; adCount?: number };
};
type ParseFail = {
    ok: false;
    error: string;
    preview: string;
    meta?: { strategy?: ParseStrategy; adCount?: number };
};

type ParseStrategy = "direct" | "code_fence" | "balanced_extract";

export type ClaudeAdsPayload = {
    ads: unknown[];
    [key: string]: unknown;
};

export type ParsedAd = {
    angle: string;
    hook: string;
    primaryText: string;
    headline: string;
    cta: string;
    visualPrompt: string;
    [key: string]: unknown;
};

export type ValidationOk = {
    ok: true;
    ads: ParsedAd[];
    warnings: string[];
};

export type ValidationFail = {
    ok: false;
    error: string;
};

export function sanitizeClaudeRawOutput(rawText: string) {
    let text = rawText ?? "";
    // Remove BOM if present.
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    return text.trim();
}

function safePreview(text: string, maxChars = 500) {
    const cleaned = sanitizeClaudeRawOutput(text);
    return cleaned.slice(0, maxChars);
}

function safeJsonParse(text: string) {
    try {
        return { ok: true as const, value: JSON.parse(text) };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { ok: false as const, error: message };
    }
}

function extractFromCodeFence(raw: string) {
    // Supports ```json ...``` and ``` ...```
    // Strategy: scan for fences and return the first block that parses as JSON (or at least contains {/[).
    const text = raw.replace(/\r\n/g, "\n");
    const fence = "```";
    const blocks: string[] = [];

    let i = 0;
    while (i < text.length) {
        const start = text.indexOf(fence, i);
        if (start === -1) break;
        const afterFence = start + fence.length;
        const lineEnd = text.indexOf("\n", afterFence);
        const headerEnd = lineEnd === -1 ? text.length : lineEnd;
        const blockStart = headerEnd + 1;
        const end = text.indexOf(fence, blockStart);
        if (end === -1) break;
        const inner = text.slice(blockStart, end).trim();
        if (inner) blocks.push(inner);
        i = end + fence.length;
    }

    for (const block of blocks) {
        if (!block.includes("{") && !block.includes("[")) continue;
        const parsed = safeJsonParse(block);
        if (parsed.ok) return { ok: true as const, extracted: block };
    }

    return { ok: false as const, error: "No JSON-parsable fenced code block found." };
}

function balancedExtractTopLevelJson(raw: string) {
    const text = raw;
    const firstObj = text.indexOf("{");
    const firstArr = text.indexOf("[");
    const start =
        firstObj === -1
            ? firstArr
            : firstArr === -1
                ? firstObj
                : Math.min(firstObj, firstArr);

    if (start === -1) {
        return { ok: false as const, error: "No '{' or '[' found in output." };
    }

    const openChar = text[start];
    const closeChar = openChar === "{" ? "}" : "]";

    let depth = 0;
    let inString = false;
    let escape = false;

    for (let i = start; i < text.length; i++) {
        const ch = text[i];

        if (inString) {
            if (escape) {
                escape = false;
                continue;
            }
            if (ch === "\\") {
                escape = true;
                continue;
            }
            if (ch === '"') {
                inString = false;
            }
            continue;
        }

        if (ch === '"') {
            inString = true;
            continue;
        }

        if (ch === openChar) depth += 1;
        if (ch === closeChar) depth -= 1;

        if (depth === 0) {
            const extracted = text.slice(start, i + 1);
            return { ok: true as const, extracted };
        }
    }

    return { ok: false as const, error: "Found JSON start but could not find matching close." };
}

function coercePayloadShape(value: unknown): ClaudeAdsPayload | null {
    if (Array.isArray(value)) {
        return { ads: value };
    }
    if (value && typeof value === "object") {
        const ads = (value as any).ads;
        if (Array.isArray(ads)) return value as ClaudeAdsPayload;
    }
    return null;
}

function recoverAdsArrayFromNearMissObject(value: unknown) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;

    const obj = value as Record<string, unknown>;

    const candidates = Object.entries(obj)
        .filter(([, v]) => Array.isArray(v))
        .map(([k, v]) => ({ key: k, arr: v as unknown[] }))
        .filter(({ arr }) => arr.length > 0 && arr.every((item) => item && typeof item === "object" && !Array.isArray(item)));

    if (candidates.length === 0) return null;

    const preferredKeys = [
        "adIdeas",
        "ad_ideas",
        "adConcepts",
        "ad_concepts",
        "concepts",
        "creatives",
        "creative",
        "variants",
        "results",
        "items",
        "outputAds",
        "adsPayload",
    ];

    const preferred = candidates.find((c) => preferredKeys.includes(c.key));
    const picked = preferred || candidates[0];

    return { recoveredKey: picked.key, ads: picked.arr };
}

function listTopLevelKeys(value: unknown) {
    if (!value || typeof value !== "object") return [];
    if (Array.isArray(value)) return [];
    return Object.keys(value as Record<string, unknown>);
}

function extractAdsArrayFromParsedValue(value: unknown) {
    // Implements ordered fallbacks from the request:
    // - root array → ads
    // - data.data array → ads
    // - data.results array → ads
    // - object has only one array field → ads
    // - if array items look like ads (contain "hook" or "headline") → accept
    const detectedKeys = listTopLevelKeys(value);

    const looksLikeAd = (item: any) =>
        item &&
        typeof item === "object" &&
        !Array.isArray(item) &&
        (typeof item.hook === "string" ||
            typeof item.headline === "string" ||
            typeof item.primaryText === "string");

    if (Array.isArray(value)) {
        return { ok: true as const, ads: value, extractedFrom: "root_array", detectedKeys };
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
        const obj = value as any;
        if (Array.isArray(obj.ads)) {
            return { ok: true as const, ads: obj.ads as unknown[], extractedFrom: "ads", detectedKeys };
        }
        if (Array.isArray(obj.data)) {
            return { ok: true as const, ads: obj.data as unknown[], extractedFrom: "data", detectedKeys };
        }
        if (obj.data && typeof obj.data === "object" && Array.isArray(obj.data.data)) {
            return {
                ok: true as const,
                ads: obj.data.data as unknown[],
                extractedFrom: "data.data",
                detectedKeys,
            };
        }
        if (Array.isArray(obj.results)) {
            return { ok: true as const, ads: obj.results as unknown[], extractedFrom: "results", detectedKeys };
        }

        const arrayFields = Object.entries(obj).filter(([, v]) => Array.isArray(v)) as Array<
            [string, unknown[]]
        >;
        if (arrayFields.length === 1) {
            return {
                ok: true as const,
                ads: arrayFields[0][1],
                extractedFrom: `only_array_field:${arrayFields[0][0]}`,
                detectedKeys,
            };
        }

        const recovered = recoverAdsArrayFromNearMissObject(value);
        if (recovered) {
            return {
                ok: true as const,
                ads: recovered.ads,
                extractedFrom: `near_miss:${recovered.recoveredKey}`,
                detectedKeys,
            };
        }
    }

    // If we found *some* array earlier but it didn't match the above, we don't attempt deeper heuristics.
    return { ok: false as const, error: "No ads array found", detectedKeys };
}

function detectAdCount(value: unknown) {
    if (Array.isArray(value)) return value.length;
    if (value && typeof value === "object") {
        const ads = (value as any).ads;
        if (Array.isArray(ads)) return ads.length;
    }
    return undefined;
}

export function parseClaudeAdPayload(
    rawText: string
): ParseOk<ClaudeAdsPayload> | ParseFail {
    const sanitized = sanitizeClaudeRawOutput(rawText);
    const preview = safePreview(rawText);

    const direct = safeJsonParse(sanitized);
    if (direct.ok) {
        const extracted = extractAdsArrayFromParsedValue(direct.value);
        if (!extracted.ok) {
            return {
                ok: false,
                error: `${extracted.error}. Detected keys: ${extracted.detectedKeys.join(", ") || "none"}`,
                preview,
                meta: { strategy: "direct", adCount: detectAdCount(direct.value) },
            };
        }
        return {
            ok: true,
            data: { ...(direct.value as any), ads: extracted.ads } as ClaudeAdsPayload,
            meta: { strategy: "direct", adCount: extracted.ads.length },
        };
    }

    const fenced = extractFromCodeFence(sanitized);
    if (fenced.ok) {
        const parsed = safeJsonParse(fenced.extracted);
        if (parsed.ok) {
            const extracted = extractAdsArrayFromParsedValue(parsed.value);
            if (!extracted.ok) {
                return {
                    ok: false,
                    error: `${extracted.error}. Detected keys: ${extracted.detectedKeys.join(", ") || "none"}`,
                    preview,
                    meta: { strategy: "code_fence", adCount: detectAdCount(parsed.value) },
                };
            }
            return {
                ok: true,
                data: { ...(parsed.value as any), ads: extracted.ads } as ClaudeAdsPayload,
                meta: { strategy: "code_fence", adCount: extracted.ads.length },
            };
        }
    }

    const extracted = balancedExtractTopLevelJson(sanitized);
    if (extracted.ok) {
        const parsed = safeJsonParse(extracted.extracted);
        if (parsed.ok) {
            const extractedAds = extractAdsArrayFromParsedValue(parsed.value);
            if (!extractedAds.ok) {
                return {
                    ok: false,
                    error: `${extractedAds.error}. Detected keys: ${extractedAds.detectedKeys.join(", ") || "none"}`,
                    preview,
                    meta: { strategy: "balanced_extract", adCount: detectAdCount(parsed.value) },
                };
            }
            return {
                ok: true,
                data: { ...(parsed.value as any), ads: extractedAds.ads } as ClaudeAdsPayload,
                meta: { strategy: "balanced_extract", adCount: extractedAds.ads.length },
            };
        }
        return {
            ok: false,
            error: `Extracted JSON candidate but JSON.parse failed: ${parsed.error}`,
            preview,
            meta: { strategy: "balanced_extract" },
        };
    }

    return {
        ok: false,
        error: `Could not parse JSON. Direct parse error: ${direct.error}. Fence: ${fenced.ok ? "ok" : fenced.error}. Extract: ${extracted.ok ? "ok" : extracted.error}`,
        preview,
    };
}

export function validateClaudeAdsPayload(payload: ClaudeAdsPayload): ValidationOk | ValidationFail {
    if (!payload || typeof payload !== "object") {
        return { ok: false, error: "Payload must be an object." };
    }
    if (!Array.isArray(payload.ads)) {
        return { ok: false, error: 'Payload is missing required field "ads" (must be an array).' };
    }
    if (payload.ads.length === 0) {
        return { ok: false, error: 'Payload "ads" array is empty. Expected at least 1 ad.' };
    }

    const requiredNonEmptyFields: Array<
        Exclude<keyof ParsedAd, "primaryText">
    > = ["angle", "hook", "headline", "cta", "visualPrompt"];

    const warnings: string[] = [];
    const validAds: ParsedAd[] = [];
    let invalidCount = 0;

    payload.ads.forEach((ad: any, index: number) => {
        const adNum = index + 1;
        if (!ad || typeof ad !== "object" || Array.isArray(ad)) {
            invalidCount += 1;
            warnings.push(`Ad ${adNum} is not a valid object; skipped.`);
            return;
        }

        const missing: string[] = [];

        for (const field of requiredNonEmptyFields) {
            const value = ad[field];
            if (typeof value !== "string" || !value.trim()) missing.push(String(field));
        }

        // primaryText is allowed to be empty string to support true "no-text" ads.
        if (typeof ad.primaryText !== "string") {
            missing.push("primaryText");
        }

        if (missing.length) {
            invalidCount += 1;
            warnings.push(`Ad ${adNum} missing/invalid fields: ${missing.join(", ")}; skipped.`);
            return;
        }

        validAds.push(ad as ParsedAd);
    });

    if (invalidCount > 0) {
        warnings.unshift(`Skipped ${invalidCount} invalid ads due to missing required fields.`);
    }

    // IMPORTANT: caller will treat 0 valid ads as an error (not warnings).
    return { ok: true, ads: validAds, warnings };
}

export function normalizeAdsCount(
    ads: ParsedAd[],
    requestedCount: number
): { ads: ParsedAd[]; warnings: string[] } {
    const warnings: string[] = [];
    if (ads.length > requestedCount) {
        warnings.push(`Model returned ${ads.length} ads; trimming to requested ${requestedCount}.`);
        return { ads: ads.slice(0, requestedCount), warnings };
    }
    if (ads.length < requestedCount) {
        warnings.push(`Model returned ${ads.length} ads; fewer than requested ${requestedCount}.`);
        return { ads, warnings };
    }
    return { ads, warnings };
}

export type ClaudeParseDiagnostics = {
    ok: boolean;
    error?: string;
    preview: string;
    strategy?: ParseStrategy;
    requestedCount: number;
    parsedAdCount?: number;
    returnedAdCount?: number;
    warnings: string[];
    detectedKeys?: string[];
    invalidCount?: number;
    sampleItemPreview?: string;
};

export function parseValidateAndNormalizeClaudeAds(
    rawText: string,
    requestedCount: number
):
    | { ok: true; ads: ParsedAd[]; diagnostics: ClaudeParseDiagnostics }
    | { ok: false; diagnostics: ClaudeParseDiagnostics } {
    const sanitized = sanitizeClaudeRawOutput(rawText);
    const parsed = parseClaudeAdPayload(sanitized);

    if (!parsed.ok) {
        return {
            ok: false,
            diagnostics: {
                ok: false,
                error: parsed.error,
                preview: parsed.preview,
                strategy: parsed.meta?.strategy,
                requestedCount,
                parsedAdCount: parsed.meta?.adCount,
                warnings: [],
            },
        };
    }

    const validation = validateClaudeAdsPayload(parsed.data);
    if (!validation.ok) {
        return {
            ok: false,
            diagnostics: {
                ok: false,
                error: validation.error,
                preview: sanitized.slice(0, 500),
                strategy: parsed.meta.strategy,
                requestedCount,
                parsedAdCount: parsed.meta.adCount,
                warnings: [],
            },
        };
    }

    const normalized = normalizeAdsCount(validation.ads, requestedCount);
    const warnings = [...(validation.warnings || []), ...(normalized.warnings || [])];
    const sampleItemPreview =
        Array.isArray((parsed.data as any)?.ads) && (parsed.data as any).ads.length > 0
            ? JSON.stringify((parsed.data as any).ads[0], null, 2).slice(0, 500)
            : "";

    if (normalized.ads.length === 0) {
        const detectedKeys = listTopLevelKeys(parsed.data);
        return {
            ok: false,
            diagnostics: {
                ok: false,
                error: "Parsed JSON but no valid ads matched schema",
                preview: sanitized.slice(0, 500),
                strategy: parsed.meta.strategy,
                requestedCount,
                parsedAdCount: parsed.meta.adCount ?? (parsed.data as any)?.ads?.length,
                returnedAdCount: 0,
                warnings,
                detectedKeys,
                invalidCount: (parsed.meta.adCount || 0) - 0,
                sampleItemPreview,
            },
        };
    }

    return {
        ok: true,
        ads: normalized.ads,
        diagnostics: {
            ok: true,
            preview: sanitized.slice(0, 500),
            strategy: parsed.meta.strategy,
            requestedCount,
            parsedAdCount: parsed.meta.adCount ?? (parsed.data as any)?.ads?.length ?? validation.ads.length,
            returnedAdCount: normalized.ads.length,
            warnings,
            detectedKeys: listTopLevelKeys(parsed.data),
            invalidCount: (parsed.meta.adCount ?? (parsed.data as any)?.ads?.length ?? 0) - validation.ads.length,
            sampleItemPreview,
        },
    };
}

