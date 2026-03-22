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
"[project]/src/lib/kie.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateImageWithKie",
    ()=>generateImageWithKie,
    "uploadReferenceFilesToKie",
    ()=>uploadReferenceFilesToKie
]);
const KIE_API_BASE = "https://api.kie.ai";
const KIE_UPLOAD_BASE = "https://kieai.redpandaai.co";
function getKieApiKey() {
    const key = process.env.KIE_API_KEY;
    if (!key) {
        throw new Error("Missing KIE_API_KEY in .env");
    }
    return key;
}
async function sleep(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms));
}
async function uploadReferenceFilesToKie(files) {
    const apiKey = getKieApiKey();
    const uploaded = [];
    for (const file of files){
        if (!(file instanceof File) || file.size === 0) continue;
        const form = new FormData();
        form.set("file", file, file.name);
        form.set("uploadPath", "images/user-uploads");
        form.set("fileName", file.name);
        const res = await fetch(`${KIE_UPLOAD_BASE}/api/file-stream-upload`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`
            },
            body: form
        });
        const json = await res.json();
        if (!res.ok || json?.code !== 200 || !json?.data?.downloadUrl) {
            throw new Error(`Kie file upload failed: ${JSON.stringify(json)}`);
        }
        uploaded.push({
            filePath: json.data.downloadUrl,
            originalName: json.data.originalName || file.name,
            mimeType: json.data.mimeType || file.type || null
        });
    }
    return uploaded;
}
async function generateImageWithKie(prompt, referenceImages = []) {
    const apiKey = getKieApiKey();
    const createRes = await fetch(`${KIE_API_BASE}/api/v1/jobs/createTask`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "nano-banana-2",
            input: {
                prompt,
                image_input: referenceImages,
                google_search: true,
                aspect_ratio: "auto",
                resolution: "1K",
                output_format: "png"
            }
        })
    });
    const createJson = await createRes.json();
    if (!createRes.ok || createJson?.code !== 200 || !createJson?.data?.taskId) {
        throw new Error(`Kie task creation failed: ${JSON.stringify(createJson)}`);
    }
    const taskId = createJson.data.taskId;
    for(let attempt = 0; attempt < 30; attempt++){
        await sleep(3000);
        const statusRes = await fetch(`${KIE_API_BASE}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        });
        const statusJson = await statusRes.json();
        if (!statusRes.ok || statusJson?.code !== 200) {
            throw new Error(`Kie status check failed: ${JSON.stringify(statusJson)}`);
        }
        const data = statusJson.data;
        const state = data?.state;
        if (state === "success") {
            let parsedResult = data?.resultJson;
            if (typeof parsedResult === "string") {
                try {
                    parsedResult = JSON.parse(parsedResult);
                } catch  {}
            }
            return {
                taskId,
                state,
                raw: statusJson,
                result: parsedResult
            };
        }
        if (state === "fail") {
            throw new Error(`Kie generation failed: ${data?.failMsg || "Unknown failure"}`);
        }
    }
    throw new Error("Kie generation timed out.");
}
}),
"[project]/src/lib/claudeAds.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "extractJsonObject",
    ()=>extractJsonObject,
    "normalizeRequestedAdCount",
    ()=>normalizeRequestedAdCount,
    "validateAds",
    ()=>validateAds
]);
function normalizeRequestedAdCount(value) {
    if (!value) return 6;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 6;
    if (parsed < 1) return 1;
    if (parsed > 1000) return 1000;
    return Math.floor(parsed);
}
function extractJsonObject(text) {
    const trimmed = text.trim();
    try {
        return JSON.parse(trimmed);
    } catch  {}
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
        const possible = trimmed.slice(start, end + 1);
        try {
            return JSON.parse(possible);
        } catch  {}
    }
    return null;
}
function validateAds(parsed, requestedCount) {
    if (!parsed || typeof parsed !== "object") {
        throw new Error("Claude did not return a valid JSON object.");
    }
    const ads = parsed.ads;
    if (!Array.isArray(ads)) {
        throw new Error("Claude response is missing the ads array.");
    }
    if (ads.length !== requestedCount) {
        throw new Error(`Claude returned ${ads.length} ads but ${requestedCount} were requested.`);
    }
    const requiredFields = [
        "angle",
        "hook",
        "primaryText",
        "headline",
        "cta",
        "visualPrompt"
    ];
    ads.forEach((ad, index)=>{
        const adNum = index + 1;
        if (!ad || typeof ad !== "object") {
            throw new Error(`Ad ${adNum} is not a valid object.`);
        }
        for (const field of requiredFields){
            const value = ad[field];
            if (typeof value !== "string" || !value.trim()) {
                throw new Error(`Ad ${adNum} is missing required field: ${String(field)}`);
            }
        }
    });
    return ads;
}
}),
"[project]/src/lib/scrape.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeAndValidatePublicUrl",
    ()=>normalizeAndValidatePublicUrl,
    "scrapeUrlToHtml",
    ()=>scrapeUrlToHtml
]);
function isPrivateIpLiteral(hostname) {
    const lower = hostname.toLowerCase();
    if (lower === "localhost") return true;
    if (lower === "::1") return true;
    const ipv4Match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (!ipv4Match) return false;
    const parts = ipv4Match.slice(1).map((n)=>Number(n));
    if (parts.some((p)=>!Number.isInteger(p) || p < 0 || p > 255)) return true;
    const [a, b] = parts;
    if (a === 127) return true;
    if (a === 10) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 169 && b === 254) return true;
    return false;
}
function normalizeAndValidatePublicUrl(input) {
    const raw = input.trim();
    if (!raw) throw new Error("URL is required");
    const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw);
    const normalizedInput = hasScheme ? raw : `https://${raw}`;
    let url;
    try {
        url = new URL(normalizedInput);
    } catch  {
        throw new Error("Invalid URL (check formatting)");
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("URL must start with http:// or https://");
    }
    if (isPrivateIpLiteral(url.hostname)) {
        throw new Error("Refusing to fetch private/local URLs");
    }
    // Return the caller-facing normalized input (trim + scheme injection only).
    // This avoids unexpected canonicalization changes like trailing slashes.
    return normalizedInput;
}
async function fetchWithTimeout(url, init, timeoutMs) {
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), timeoutMs);
    try {
        return await fetch(url, {
            ...init,
            signal: controller.signal
        });
    } finally{
        clearTimeout(timeout);
    }
}
async function fetchHtmlOnce(url) {
    const response = await fetchWithTimeout(url, {
        method: "GET",
        cache: "no-store",
        redirect: "follow",
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "no-cache",
            Pragma: "no-cache"
        }
    }, 15000);
    const contentType = response.headers.get("content-type");
    const html = await response.text();
    const imageUrls = extractImageUrlsFromHtml(html);
    return {
        finalUrl: response.url || url,
        html,
        status: response.status,
        contentType,
        imageUrls
    };
}
function extractImageUrlsFromHtml(html) {
    const urls = new Set();
    const text = html ?? "";
    // <img src="...">
    const imgSrcRe = /<img[^>]+src\s*=\s*["']([^"']+)["']/gi;
    let match;
    while((match = imgSrcRe.exec(text)) !== null){
        const url = match[1];
        if (typeof url !== "string") continue;
        const lower = url.toLowerCase();
        if ((url.startsWith("http://") || url.startsWith("https://")) && (lower.includes(".png") || lower.includes(".jpg") || lower.includes(".jpeg") || lower.includes(".webp") || lower.includes("image"))) {
            urls.add(url);
        }
    }
    // <meta property="og:image" content="...">
    const ogImageRe = /<meta[^>]+property\s*=\s*["']og:image["'][^>]+content\s*=\s*["']([^"']+)["'][^>]*>/i;
    const ogMatch = text.match(ogImageRe);
    if (ogMatch?.[1]) {
        const url = ogMatch[1];
        const lower = url.toLowerCase();
        if ((url.startsWith("http://") || url.startsWith("https://")) && (lower.includes(".png") || lower.includes(".jpg") || lower.includes(".jpeg") || lower.includes(".webp") || lower.includes("image"))) {
            urls.add(url);
        }
    }
    return Array.from(urls);
}
function buildJinaReaderUrl(targetUrl) {
    // Jina "reader" style endpoint which returns extracted text/HTML-ish output.
    // It’s a pragmatic fallback when sites block direct fetches.
    return `https://r.jina.ai/${targetUrl}`;
}
async function scrapeUrlToHtml(urlInput) {
    const url = normalizeAndValidatePublicUrl(urlInput);
    let lastError = null;
    // Attempt 1: direct fetch
    try {
        const result = await fetchHtmlOnce(url);
        if (result.html && result.html.length > 300) return result;
    } catch (err) {
        lastError = err;
    }
    // Attempt 2: fallback (often bypasses bot protections)
    try {
        const fallbackUrl = buildJinaReaderUrl(url);
        const result = await fetchHtmlOnce(fallbackUrl);
        if (result.html && result.html.length > 300) return result;
    } catch (err) {
        lastError = err;
    }
    const message = lastError instanceof Error ? lastError.message : String(lastError || "Unknown error");
    throw new Error(`Failed to fetch URL content. ${message}`);
}
}),
"[project]/src/lib/claude/parseClaudeJson.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeAdsCount",
    ()=>normalizeAdsCount,
    "parseClaudeAdPayload",
    ()=>parseClaudeAdPayload,
    "parseValidateAndNormalizeClaudeAds",
    ()=>parseValidateAndNormalizeClaudeAds,
    "sanitizeClaudeRawOutput",
    ()=>sanitizeClaudeRawOutput,
    "validateClaudeAdsPayload",
    ()=>validateClaudeAdsPayload
]);
function sanitizeClaudeRawOutput(rawText) {
    let text = rawText ?? "";
    // Remove BOM if present.
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    return text.trim();
}
function safePreview(text, maxChars = 500) {
    const cleaned = sanitizeClaudeRawOutput(text);
    return cleaned.slice(0, maxChars);
}
function safeJsonParse(text) {
    try {
        return {
            ok: true,
            value: JSON.parse(text)
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
            ok: false,
            error: message
        };
    }
}
function extractFromCodeFence(raw) {
    // Supports ```json ...``` and ``` ...```
    // Strategy: scan for fences and return the first block that parses as JSON (or at least contains {/[).
    const text = raw.replace(/\r\n/g, "\n");
    const fence = "```";
    const blocks = [];
    let i = 0;
    while(i < text.length){
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
    for (const block of blocks){
        if (!block.includes("{") && !block.includes("[")) continue;
        const parsed = safeJsonParse(block);
        if (parsed.ok) return {
            ok: true,
            extracted: block
        };
    }
    return {
        ok: false,
        error: "No JSON-parsable fenced code block found."
    };
}
function balancedExtractTopLevelJson(raw) {
    const text = raw;
    const firstObj = text.indexOf("{");
    const firstArr = text.indexOf("[");
    const start = firstObj === -1 ? firstArr : firstArr === -1 ? firstObj : Math.min(firstObj, firstArr);
    if (start === -1) {
        return {
            ok: false,
            error: "No '{' or '[' found in output."
        };
    }
    const openChar = text[start];
    const closeChar = openChar === "{" ? "}" : "]";
    let depth = 0;
    let inString = false;
    let escape = false;
    for(let i = start; i < text.length; i++){
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
            return {
                ok: true,
                extracted
            };
        }
    }
    return {
        ok: false,
        error: "Found JSON start but could not find matching close."
    };
}
function coercePayloadShape(value) {
    if (Array.isArray(value)) {
        return {
            ads: value
        };
    }
    if (value && typeof value === "object") {
        const ads = value.ads;
        if (Array.isArray(ads)) return value;
    }
    return null;
}
function recoverAdsArrayFromNearMissObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const obj = value;
    const candidates = Object.entries(obj).filter(([, v])=>Array.isArray(v)).map(([k, v])=>({
            key: k,
            arr: v
        })).filter(({ arr })=>arr.length > 0 && arr.every((item)=>item && typeof item === "object" && !Array.isArray(item)));
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
        "adsPayload"
    ];
    const preferred = candidates.find((c)=>preferredKeys.includes(c.key));
    const picked = preferred || candidates[0];
    return {
        recoveredKey: picked.key,
        ads: picked.arr
    };
}
function listTopLevelKeys(value) {
    if (!value || typeof value !== "object") return [];
    if (Array.isArray(value)) return [];
    return Object.keys(value);
}
function extractAdsArrayFromParsedValue(value) {
    // Implements ordered fallbacks from the request:
    // - root array → ads
    // - data.data array → ads
    // - data.results array → ads
    // - object has only one array field → ads
    // - if array items look like ads (contain "hook" or "headline") → accept
    const detectedKeys = listTopLevelKeys(value);
    const looksLikeAd = (item)=>item && typeof item === "object" && !Array.isArray(item) && (typeof item.hook === "string" || typeof item.headline === "string" || typeof item.primaryText === "string");
    if (Array.isArray(value)) {
        return {
            ok: true,
            ads: value,
            extractedFrom: "root_array",
            detectedKeys
        };
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
        const obj = value;
        if (Array.isArray(obj.ads)) {
            return {
                ok: true,
                ads: obj.ads,
                extractedFrom: "ads",
                detectedKeys
            };
        }
        if (Array.isArray(obj.data)) {
            return {
                ok: true,
                ads: obj.data,
                extractedFrom: "data",
                detectedKeys
            };
        }
        if (obj.data && typeof obj.data === "object" && Array.isArray(obj.data.data)) {
            return {
                ok: true,
                ads: obj.data.data,
                extractedFrom: "data.data",
                detectedKeys
            };
        }
        if (Array.isArray(obj.results)) {
            return {
                ok: true,
                ads: obj.results,
                extractedFrom: "results",
                detectedKeys
            };
        }
        const arrayFields = Object.entries(obj).filter(([, v])=>Array.isArray(v));
        if (arrayFields.length === 1) {
            return {
                ok: true,
                ads: arrayFields[0][1],
                extractedFrom: `only_array_field:${arrayFields[0][0]}`,
                detectedKeys
            };
        }
        const recovered = recoverAdsArrayFromNearMissObject(value);
        if (recovered) {
            return {
                ok: true,
                ads: recovered.ads,
                extractedFrom: `near_miss:${recovered.recoveredKey}`,
                detectedKeys
            };
        }
    }
    // If we found *some* array earlier but it didn't match the above, we don't attempt deeper heuristics.
    return {
        ok: false,
        error: "No ads array found",
        detectedKeys
    };
}
function detectAdCount(value) {
    if (Array.isArray(value)) return value.length;
    if (value && typeof value === "object") {
        const ads = value.ads;
        if (Array.isArray(ads)) return ads.length;
    }
    return undefined;
}
function parseClaudeAdPayload(rawText) {
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
                meta: {
                    strategy: "direct",
                    adCount: detectAdCount(direct.value)
                }
            };
        }
        return {
            ok: true,
            data: {
                ...direct.value,
                ads: extracted.ads
            },
            meta: {
                strategy: "direct",
                adCount: extracted.ads.length
            }
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
                    meta: {
                        strategy: "code_fence",
                        adCount: detectAdCount(parsed.value)
                    }
                };
            }
            return {
                ok: true,
                data: {
                    ...parsed.value,
                    ads: extracted.ads
                },
                meta: {
                    strategy: "code_fence",
                    adCount: extracted.ads.length
                }
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
                    meta: {
                        strategy: "balanced_extract",
                        adCount: detectAdCount(parsed.value)
                    }
                };
            }
            return {
                ok: true,
                data: {
                    ...parsed.value,
                    ads: extractedAds.ads
                },
                meta: {
                    strategy: "balanced_extract",
                    adCount: extractedAds.ads.length
                }
            };
        }
        return {
            ok: false,
            error: `Extracted JSON candidate but JSON.parse failed: ${parsed.error}`,
            preview,
            meta: {
                strategy: "balanced_extract"
            }
        };
    }
    return {
        ok: false,
        error: `Could not parse JSON. Direct parse error: ${direct.error}. Fence: ${fenced.ok ? "ok" : fenced.error}. Extract: ${extracted.ok ? "ok" : extracted.error}`,
        preview
    };
}
function validateClaudeAdsPayload(payload) {
    if (!payload || typeof payload !== "object") {
        return {
            ok: false,
            error: "Payload must be an object."
        };
    }
    if (!Array.isArray(payload.ads)) {
        return {
            ok: false,
            error: 'Payload is missing required field "ads" (must be an array).'
        };
    }
    if (payload.ads.length === 0) {
        return {
            ok: false,
            error: 'Payload "ads" array is empty. Expected at least 1 ad.'
        };
    }
    const requiredFields = [
        "angle",
        "hook",
        "primaryText",
        "headline",
        "cta",
        "visualPrompt"
    ];
    const warnings = [];
    const validAds = [];
    let invalidCount = 0;
    payload.ads.forEach((ad, index)=>{
        const adNum = index + 1;
        if (!ad || typeof ad !== "object" || Array.isArray(ad)) {
            invalidCount += 1;
            warnings.push(`Ad ${adNum} is not a valid object; skipped.`);
            return;
        }
        const missing = [];
        for (const field of requiredFields){
            const value = ad[field];
            if (typeof value !== "string" || !value.trim()) missing.push(String(field));
        }
        if (missing.length) {
            invalidCount += 1;
            warnings.push(`Ad ${adNum} missing/invalid fields: ${missing.join(", ")}; skipped.`);
            return;
        }
        validAds.push(ad);
    });
    if (invalidCount > 0) {
        warnings.unshift(`Skipped ${invalidCount} invalid ads due to missing required fields.`);
    }
    // IMPORTANT: caller will treat 0 valid ads as an error (not warnings).
    return {
        ok: true,
        ads: validAds,
        warnings
    };
}
function normalizeAdsCount(ads, requestedCount) {
    const warnings = [];
    if (ads.length > requestedCount) {
        warnings.push(`Model returned ${ads.length} ads; trimming to requested ${requestedCount}.`);
        return {
            ads: ads.slice(0, requestedCount),
            warnings
        };
    }
    if (ads.length < requestedCount) {
        warnings.push(`Model returned ${ads.length} ads; fewer than requested ${requestedCount}.`);
        return {
            ads,
            warnings
        };
    }
    return {
        ads,
        warnings
    };
}
function parseValidateAndNormalizeClaudeAds(rawText, requestedCount) {
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
                warnings: []
            }
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
                warnings: []
            }
        };
    }
    const normalized = normalizeAdsCount(validation.ads, requestedCount);
    const warnings = [
        ...validation.warnings || [],
        ...normalized.warnings || []
    ];
    const sampleItemPreview = Array.isArray(parsed.data?.ads) && parsed.data.ads.length > 0 ? JSON.stringify(parsed.data.ads[0], null, 2).slice(0, 500) : "";
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
                parsedAdCount: parsed.meta.adCount ?? parsed.data?.ads?.length,
                returnedAdCount: 0,
                warnings,
                detectedKeys,
                invalidCount: (parsed.meta.adCount || 0) - 0,
                sampleItemPreview
            }
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
            parsedAdCount: parsed.meta.adCount ?? parsed.data?.ads?.length ?? validation.ads.length,
            returnedAdCount: normalized.ads.length,
            warnings,
            detectedKeys: listTopLevelKeys(parsed.data),
            invalidCount: (parsed.meta.adCount ?? parsed.data?.ads?.length ?? 0) - validation.ads.length,
            sampleItemPreview
        }
    };
}
}),
"[project]/app/jobs/[id]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
    "default",
    ()=>JobDetailPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"40163adf6e526e8b5daf9df8dfd98135b45720999b":"$$RSC_SERVER_ACTION_0","4017e7700eafc8c40397f642ec8db7fbc5d8bf413b":"$$RSC_SERVER_ACTION_3","40ae0eedb2783eb623d89ce87f72ca5fbf7344c59f":"$$RSC_SERVER_ACTION_1","40e7df428217a28d413bdcaba894785ade6e877651":"$$RSC_SERVER_ACTION_2"},"",""] */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$kie$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/kie.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claudeAds$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/claudeAds.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scrape$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/scrape.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claude$2f$parseClaudeJson$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/claude/parseClaudeJson.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
function tryParseJson(value) {
    if (!value) return null;
    try {
        return JSON.parse(value);
    } catch  {
        return null;
    }
}
function stripHtml(html) {
    return html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function extractImageUrlsFromResult(result) {
    const urls = new Set();
    function walk(value) {
        if (!value) return;
        if (typeof value === "string") {
            const lower = value.toLowerCase();
            if ((value.startsWith("http://") || value.startsWith("https://")) && (lower.includes(".png") || lower.includes(".jpg") || lower.includes(".jpeg") || lower.includes(".webp") || lower.includes("image"))) {
                urls.add(value);
            }
            return;
        }
        if (Array.isArray(value)) {
            for (const item of value)walk(item);
            return;
        }
        if (typeof value === "object") {
            for (const nested of Object.values(value)){
                walk(nested);
            }
        }
    }
    walk(result);
    return Array.from(urls);
}
const $$RSC_SERVER_ACTION_0 = async function scrapeAndGenerateAds(formData) {
    const jobId = formData.get("jobId")?.toString();
    if (!jobId) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/?error=missing_job_id");
    const job = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.findUnique({
        where: {
            id: jobId
        }
    });
    if (!job) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/?error=job_not_found");
    const requestedCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claudeAds$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeRequestedAdCount"])(job.numberOfAds);
    try {
        // 1) Scrape saved job URL
        const scraped = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scrape$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["scrapeUrlToHtml"])(job.url);
        const rawText = stripHtml(scraped.html).slice(0, 15000);
        if (!rawText.trim()) {
            throw new Error("Scrape produced empty text.");
        }
        // 2) Website intelligence + memory-backed strategy + ad-tab generation
        const intelligenceRaw = await extractWebsiteIntelligence({
            rawText,
            imageUrls: scraped.imageUrls || [],
            campaignTypeHint: job.campaignType === "donation" ? "donation" : "product"
        });
        const intelligenceParsed = extractJsonObject(intelligenceRaw);
        if (!intelligenceParsed) {
            throw new Error("Claude returned invalid website intelligence JSON.");
        }
        const websiteIntelligence = intelligenceParsed;
        const effectiveCampaignType = job.campaignType === "donation" ? "donation" : "product";
        const strategyRaw = await generateCreativeStrategy({
            websiteIntelligence,
            campaignType: effectiveCampaignType,
            platform: job.platform || "Meta",
            funnelStage: job.funnelStage || "Mix",
            primaryAngles: job.primaryAngles || "Problem/Solution, Lifestyle, Urgency",
            testimonialUsage: job.testimonialUsage || "Mix",
            ctaStyle: job.ctaStyle || "Mix",
            visualStyle: job.visualStyle || "Mix",
            referenceImageTypes: job.referenceImageTypes || "Product only",
            rawTextForIntentTokens: rawText
        });
        const claudeOutput = await generateAdTabs({
            creativeStrategyJson: strategyRaw,
            requestedAdCount: requestedCount
        });
        const parsedAdsResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claude$2f$parseClaudeJson$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseValidateAndNormalizeClaudeAds"])(claudeOutput, requestedCount);
        const diagnostics = parsedAdsResult.diagnostics;
        const diagJson = JSON.stringify(diagnostics, null, 2);
        if (!parsedAdsResult.ok) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.update({
                where: {
                    id: jobId
                },
                data: {
                    status: "ad_parse_error",
                    rawText,
                    claudeOutput: `${claudeOutput || ""}

__CLAUDE_PARSE_DIAGNOSTICS__
${diagJson}
__END_CLAUDE_PARSE_DIAGNOSTICS__`,
                    kieResult: JSON.stringify({
                        strategyRaw,
                        intelligenceRaw
                    }, null, 2)
                }
            });
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}?parseError=1`);
        }
        // 3) Persist shared reference images for Kie
        const uniqueImageUrls = Array.from(new Set((scraped.imageUrls || []).filter(Boolean))).slice(0, 25);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.deleteMany({
            where: {
                jobId,
                adId: null
            }
        });
        if (uniqueImageUrls.length > 0) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.createMany({
                data: uniqueImageUrls.map((url, index)=>({
                        jobId,
                        adId: null,
                        filePath: url,
                        originalName: `scraped-image-${index + 1}`,
                        mimeType: null
                    }))
            });
        }
        // 4) Persist ads (tabs)
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.deleteMany({
            where: {
                jobId
            }
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.createMany({
            data: parsedAdsResult.ads.map((ad, index)=>({
                    jobId,
                    adNumber: index + 1,
                    title: ad.angle || ad.headline || `Ad ${index + 1}`,
                    sourceBlock: JSON.stringify(ad, null, 2),
                    editedPrompt: String(ad.visualPrompt || "").trim(),
                    status: "ready"
                }))
        });
        const returnedCount = diagnostics.returnedAdCount ?? parsedAdsResult.ads.length;
        const finalStatus = returnedCount === 0 ? "ad_parse_error" : returnedCount < requestedCount ? "processed_with_warnings" : "success";
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.update({
            where: {
                id: jobId
            },
            data: {
                status: finalStatus,
                rawText,
                claudeOutput: `${claudeOutput || ""}

__CLAUDE_PARSE_DIAGNOSTICS__
${diagJson}
__END_CLAUDE_PARSE_DIAGNOSTICS__`,
                kieResult: JSON.stringify({
                    websiteIntelligence,
                    creativeStrategy: strategyRaw
                }, null, 2)
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}?ad=1`);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.update({
            where: {
                id: jobId
            },
            data: {
                status: "claude_error",
                claudeOutput: JSON.stringify({
                    stage: "scrape_and_generate_ads",
                    error: message
                }, null, 2)
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}?stageError=1&stage=${encodeURIComponent("scrape_and_generate_ads")}`);
    }
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_0, "40163adf6e526e8b5daf9df8dfd98135b45720999b", null);
var scrapeAndGenerateAds = $$RSC_SERVER_ACTION_0;
const $$RSC_SERVER_ACTION_1 = async function buildAdsFromClaude(formData) {
    const jobId = formData.get("jobId")?.toString();
    if (!jobId) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/?error=missing_job_id");
    const job = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.findUnique({
        where: {
            id: jobId
        }
    });
    if (!job) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/?error=job_not_found`);
    const rawOutput = job.claudeOutput || "";
    const requestedCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claudeAds$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeRequestedAdCount"])(job.numberOfAds);
    const logBase = {
        jobId,
        requestedCount,
        rawLength: rawOutput.length
    };
    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claude$2f$parseClaudeJson$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseValidateAndNormalizeClaudeAds"])(rawOutput, requestedCount);
    const diagnostics = result.diagnostics;
    const diagJson = JSON.stringify(diagnostics, null, 2);
    const safePreview = diagnostics.preview.slice(0, 200);
    if (!result.ok) {
        console.warn("[buildAdsFromClaude] failed", {
            ...logBase,
            strategy: diagnostics.strategy,
            error: diagnostics.error,
            parsedAdCount: diagnostics.parsedAdCount,
            preview: safePreview,
            finalStatus: "ad_parse_error"
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.update({
            where: {
                id: jobId
            },
            data: {
                status: "ad_parse_error",
                claudeOutput: `${rawOutput || ""}

__CLAUDE_PARSE_DIAGNOSTICS__
${diagJson}
__END_CLAUDE_PARSE_DIAGNOSTICS__`
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}?parseError=1`);
    }
    const warnings = diagnostics.warnings || [];
    const returnedCount = typeof diagnostics.returnedAdCount === "number" ? diagnostics.returnedAdCount : result.ads.length;
    const finalStatus = returnedCount === 0 ? "ad_parse_error" : returnedCount < requestedCount ? "processed_with_warnings" : returnedCount === requestedCount ? "success" : "processed_with_warnings";
    console.info("[buildAdsFromClaude] ok", {
        ...logBase,
        strategy: diagnostics.strategy,
        parsedAdCount: diagnostics.parsedAdCount,
        returnedAdCount: diagnostics.returnedAdCount,
        warnings,
        preview: safePreview,
        finalStatus
    });
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.deleteMany({
        where: {
            jobId
        }
    });
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.createMany({
        data: result.ads.map((ad, index)=>({
                jobId,
                adNumber: index + 1,
                title: ad.angle || ad.headline || `Ad ${index + 1}`,
                sourceBlock: JSON.stringify(ad, null, 2),
                editedPrompt: String(ad.visualPrompt || "").trim(),
                status: "ready"
            }))
    });
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.update({
        where: {
            id: jobId
        },
        data: {
            status: finalStatus,
            claudeOutput: `${rawOutput || ""}

__CLAUDE_PARSE_DIAGNOSTICS__
${diagJson}
__END_CLAUDE_PARSE_DIAGNOSTICS__`
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}?ad=1`);
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_1, "40ae0eedb2783eb623d89ce87f72ca5fbf7344c59f", null);
var buildAdsFromClaude = $$RSC_SERVER_ACTION_1;
const $$RSC_SERVER_ACTION_2 = async function saveAdPromptAndReferences(formData) {
    const jobId = formData.get("jobId")?.toString();
    const adId = formData.get("adId")?.toString();
    const editedPrompt = formData.get("editedPrompt")?.toString() || "";
    const addToAll = formData.get("addToAll") === "on";
    const rawFiles = formData.getAll("referenceFiles");
    const files = rawFiles.filter((item)=>item instanceof File && item.size > 0);
    if (!jobId || !adId) throw new Error("Missing jobId or adId");
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.update({
        where: {
            id: adId
        },
        data: {
            editedPrompt
        }
    });
    if (files.length > 0) {
        const uploaded = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$kie$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["uploadReferenceFilesToKie"])(files);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.createMany({
            data: uploaded.map((file)=>({
                    jobId,
                    adId: addToAll ? null : adId,
                    filePath: file.filePath,
                    originalName: file.originalName,
                    mimeType: file.mimeType
                }))
        });
    }
    const ad = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.findUnique({
        where: {
            id: adId
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}?ad=${ad?.adNumber || 1}`);
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_2, "40e7df428217a28d413bdcaba894785ade6e877651", null);
var saveAdPromptAndReferences = $$RSC_SERVER_ACTION_2;
const $$RSC_SERVER_ACTION_3 = async function generateAdImages(formData) {
    const jobId = formData.get("jobId")?.toString();
    const adId = formData.get("adId")?.toString();
    if (!jobId || !adId) throw new Error("Missing jobId or adId");
    const ad = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.findUnique({
        where: {
            id: adId
        }
    });
    if (!ad) throw new Error("Ad not found");
    const prompt = (ad.editedPrompt || ad.sourceBlock || "").trim();
    if (!prompt) throw new Error("No prompt available");
    const referenceAssets = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].referenceAsset.findMany({
        where: {
            jobId,
            OR: [
                {
                    adId: null
                },
                {
                    adId
                }
            ]
        },
        orderBy: {
            createdAt: "asc"
        }
    });
    const referenceImages = referenceAssets.map((asset)=>asset.filePath);
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.update({
        where: {
            id: adId
        },
        data: {
            status: "generating_images"
        }
    });
    try {
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$kie$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generateImageWithKie"])(prompt, referenceImages);
        const urls = extractImageUrlsFromResult(result);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].image.deleteMany({
            where: {
                adId
            }
        });
        if (urls.length > 0) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].image.createMany({
                data: urls.map((url)=>({
                        adId,
                        url,
                        prompt
                    }))
            });
        }
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.update({
            where: {
                id: adId
            },
            data: {
                status: "images_generated",
                kieResult: JSON.stringify(result, null, 2)
            }
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.update({
            where: {
                id: adId
            },
            data: {
                status: "kie_error",
                kieResult: `Kie generation failed:\n\n${message}`
            }
        });
    }
    const refreshed = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].ad.findUnique({
        where: {
            id: adId
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${jobId}?ad=${refreshed?.adNumber || 1}`);
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_3, "4017e7700eafc8c40397f642ec8db7fbc5d8bf413b", null);
var generateAdImages = $$RSC_SERVER_ACTION_3;
function extractStageFailure(claudeOutput) {
    const parsed = tryParseJson(claudeOutput);
    if (!parsed || typeof parsed !== "object") return null;
    const maybeStage = parsed.stage;
    const maybeError = parsed.error;
    if (typeof maybeStage === "string" && typeof maybeError === "string") {
        return {
            stage: maybeStage,
            message: maybeError
        };
    }
    return null;
}
function extractLatestClaudeDiagnostics(claudeOutput) {
    const text = claudeOutput || "";
    const startMarker = "__CLAUDE_PARSE_DIAGNOSTICS__";
    const endMarker = "__END_CLAUDE_PARSE_DIAGNOSTICS__";
    const start = text.lastIndexOf(startMarker);
    if (start === -1) return null;
    const afterStart = start + startMarker.length;
    const end = text.indexOf(endMarker, afterStart);
    if (end === -1) return null;
    const jsonText = text.slice(afterStart, end).trim();
    const parsed = tryParseJson(jsonText);
    return parsed && typeof parsed === "object" ? parsed : null;
}
async function JobDetailPage({ params, searchParams }) {
    const { id } = await params;
    const { ad: selectedAdParam, parseError, stageError, stage } = await searchParams;
    const job = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.findUnique({
        where: {
            id
        },
        include: {
            ads: {
                include: {
                    images: {
                        orderBy: {
                            createdAt: "desc"
                        }
                    },
                    referenceAssets: {
                        orderBy: {
                            createdAt: "desc"
                        }
                    }
                },
                orderBy: {
                    adNumber: "asc"
                }
            },
            referenceAssets: {
                where: {
                    adId: null
                },
                orderBy: {
                    createdAt: "desc"
                }
            }
        }
    });
    if (!job) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    const diagnostics = extractLatestClaudeDiagnostics(job.claudeOutput);
    const requestedCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$claudeAds$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeRequestedAdCount"])(job.numberOfAds);
    const stageFailure = stageError ? extractStageFailure(job.claudeOutput) : null;
    const selectedAdNumber = Number(selectedAdParam || 1);
    const selectedAd = job.ads.find((ad)=>ad.adNumber === selectedAdNumber) || job.ads[0];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        style: {
            padding: 40,
            maxWidth: 1250
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                children: "Campaign Details"
            }, void 0, false, {
                fileName: "[project]/app/jobs/[id]/page.tsx",
                lineNumber: 538,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 20,
                    border: "1px solid #333",
                    padding: 16
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "ID:"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 541,
                                columnNumber: 20
                            }, this),
                            " ",
                            job.id
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 541,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "URL:"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 542,
                                columnNumber: 20
                            }, this),
                            " ",
                            job.url
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 542,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Campaign Type:"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 543,
                                columnNumber: 20
                            }, this),
                            " ",
                            job.campaignType
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 543,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Platform:"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 544,
                                columnNumber: 20
                            }, this),
                            " ",
                            job.platform || "Meta"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 544,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Funnel Stage:"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 545,
                                columnNumber: 20
                            }, this),
                            " ",
                            job.funnelStage || "Mix"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 545,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Format Ratio:"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 546,
                                columnNumber: 20
                            }, this),
                            " ",
                            job.formatRatio || ""
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 546,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Requested Ads:"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 547,
                                columnNumber: 20
                            }, this),
                            " ",
                            job.numberOfAds || ""
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 547,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Reference Types:"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 548,
                                columnNumber: 20
                            }, this),
                            " ",
                            job.referenceImageTypes || ""
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 548,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Status:"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 549,
                                columnNumber: 20
                            }, this),
                            " ",
                            job.status
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 549,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Total Ads:"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 550,
                                columnNumber: 20
                            }, this),
                            " ",
                            job.ads.length
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 550,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/page.tsx",
                lineNumber: 540,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 24,
                    border: "1px solid #333",
                    padding: 16
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Scraped Website Content"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 554,
                        columnNumber: 17
                    }, this),
                    parseError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 12,
                            padding: 12,
                            border: "1px solid #7a1d1d",
                            background: "#1a0b0b",
                            color: "#ffb4b4",
                            whiteSpace: "pre-wrap"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontWeight: 700,
                                    marginBottom: 6
                                },
                                children: "Claude returned output that could not be parsed into the required ad JSON format."
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 567,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    opacity: 0.95
                                },
                                children: "Check the details below, then try “Scrape + Generate Ad Tabs” again."
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 570,
                                columnNumber: 25
                            }, this),
                            diagnostics ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 10,
                                    opacity: 0.95
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontWeight: 700,
                                            marginBottom: 6
                                        },
                                        children: "Diagnostics"
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 575,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: 13,
                                            lineHeight: 1.4
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Reason:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 578,
                                                        columnNumber: 41
                                                    }, this),
                                                    " ",
                                                    typeof diagnostics.error === "string" ? diagnostics.error : "Unknown parse/validation error"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 577,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Strategy:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 584,
                                                        columnNumber: 41
                                                    }, this),
                                                    " ",
                                                    typeof diagnostics.strategy === "string" ? diagnostics.strategy : "unknown"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 583,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Expected ads:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 590,
                                                        columnNumber: 41
                                                    }, this),
                                                    " ",
                                                    requestedCount
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 589,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Parsed ad count:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 593,
                                                        columnNumber: 41
                                                    }, this),
                                                    " ",
                                                    typeof diagnostics.parsedAdCount === "number" ? diagnostics.parsedAdCount : "n/a"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 592,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginTop: 8
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Safe preview:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 599,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            marginTop: 6,
                                                            padding: 8,
                                                            border: "1px solid #7a1d1d"
                                                        },
                                                        children: typeof diagnostics.preview === "string" ? diagnostics.preview : (job.claudeOutput || "").slice(0, 500)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                                        lineNumber: 600,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 598,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 576,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 574,
                                columnNumber: 29
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 557,
                        columnNumber: 21
                    }, this) : null,
                    stageError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 12,
                            padding: 12,
                            border: "1px solid #7a1d1d",
                            background: "#1a0b0b",
                            color: "#ffb4b4",
                            whiteSpace: "pre-wrap"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontWeight: 700,
                                    marginBottom: 6
                                },
                                children: [
                                    "Pipeline stage failed:",
                                    " ",
                                    stage && typeof stage === "string" && stage.length ? stage : stageFailure?.stage || "unknown"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 623,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    opacity: 0.95
                                },
                                children: stageFailure?.message ? stageFailure.message : "Check job.claudeOutput for details."
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 629,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 613,
                        columnNumber: 21
                    }, this) : null,
                    !parseError && diagnostics && Array.isArray(diagnostics.warnings) && diagnostics.warnings.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 12,
                            padding: 12,
                            border: "1px solid #6a4b00",
                            background: "#1a1406",
                            color: "#ffe2a8",
                            whiteSpace: "pre-wrap"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontWeight: 700,
                                    marginBottom: 6
                                },
                                children: [
                                    "Claude returned fewer ads than requested. Parsed",
                                    " ",
                                    typeof diagnostics.returnedAdCount === "number" ? diagnostics.returnedAdCount : job.ads.length,
                                    " ",
                                    "of ",
                                    requestedCount,
                                    "."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 651,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 13
                                },
                                children: diagnostics.warnings.join("\n")
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 658,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 641,
                        columnNumber: 21
                    }, this) : null,
                    !parseError && diagnostics && typeof diagnostics.returnedAdCount === "number" && diagnostics.returnedAdCount === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 12,
                            padding: 12,
                            border: "1px solid #7a1d1d",
                            background: "#1a0b0b",
                            color: "#ffb4b4",
                            whiteSpace: "pre-wrap"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontWeight: 700,
                                    marginBottom: 6
                                },
                                children: "Parsed JSON but no valid ads matched required schema."
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 678,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 13,
                                    lineHeight: 1.4
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "Detected keys:"
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 683,
                                                columnNumber: 33
                                            }, this),
                                            " ",
                                            Array.isArray(diagnostics.detectedKeys) ? diagnostics.detectedKeys.join(", ") : "n/a"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 682,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 8
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "First item preview:"
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 689,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginTop: 6,
                                                    padding: 8,
                                                    border: "1px solid #7a1d1d"
                                                },
                                                children: typeof diagnostics.sampleItemPreview === "string" && diagnostics.sampleItemPreview ? diagnostics.sampleItemPreview : "n/a"
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 690,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 688,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 681,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 668,
                        columnNumber: 21
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 14
                        },
                        children: [
                            job.rawText ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    whiteSpace: "pre-wrap",
                                    lineHeight: 1.5,
                                    marginTop: 12,
                                    maxHeight: 320,
                                    overflow: "auto",
                                    border: "1px solid #333",
                                    padding: 12
                                },
                                children: job.rawText
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 703,
                                columnNumber: 25
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    opacity: 0.85
                                },
                                children: "No scraped content yet."
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 717,
                                columnNumber: 25
                            }, this),
                            job.ads.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                action: scrapeAndGenerateAds,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "hidden",
                                        name: "jobId",
                                        value: job.id
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 722,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "submit",
                                        style: {
                                            marginTop: 12
                                        },
                                        children: "Scrape + Generate Ad Tabs"
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 723,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 721,
                                columnNumber: 25
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 701,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/page.tsx",
                lineNumber: 553,
                columnNumber: 13
            }, this),
            job.ads.length > 0 && selectedAd ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 24,
                            border: "1px solid #333",
                            padding: 16
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: "Ads"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 734,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    gap: 10,
                                    flexWrap: "wrap",
                                    marginTop: 12
                                },
                                children: job.ads.map((ad)=>{
                                    const active = ad.id === selectedAd.id;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                        href: `/jobs/${job.id}?ad=${ad.adNumber}`,
                                        style: {
                                            padding: "8px 12px",
                                            border: "1px solid #444",
                                            textDecoration: "none",
                                            background: active ? "#222" : "transparent"
                                        },
                                        children: [
                                            "Ad ",
                                            ad.adNumber
                                        ]
                                    }, ad.id, true, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 739,
                                        columnNumber: 37
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 735,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 733,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 24,
                            border: "1px solid #333",
                            padding: 16
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: [
                                    "Ad ",
                                    selectedAd.adNumber,
                                    ": ",
                                    selectedAd.title || "Untitled"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 757,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: "Ad Status:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 760,
                                        columnNumber: 28
                                    }, this),
                                    " ",
                                    selectedAd.status
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 760,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 16
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "Original Ad Block"
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 763,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            whiteSpace: "pre-wrap",
                                            lineHeight: 1.5,
                                            maxHeight: 220,
                                            overflow: "auto",
                                            border: "1px solid #333",
                                            padding: 12
                                        },
                                        children: selectedAd.sourceBlock || "No source block"
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 764,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 762,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 756,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 24,
                            border: "1px solid #333",
                            padding: 16
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: "Edited Prompt + Reference Files"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 780,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                action: saveAdPromptAndReferences,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "hidden",
                                        name: "jobId",
                                        value: job.id
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 783,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "hidden",
                                        name: "adId",
                                        value: selectedAd.id
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 784,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                        name: "editedPrompt",
                                        defaultValue: selectedAd.editedPrompt || selectedAd.sourceBlock || "",
                                        style: {
                                            width: "100%",
                                            minHeight: 220,
                                            padding: 12,
                                            background: "black",
                                            color: "white",
                                            border: "1px solid #444"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 786,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 18
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: "Drop reference files here"
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 800,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    opacity: 0.8
                                                },
                                                children: "You can drag files from Downloads into this box or click to select."
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 801,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "file",
                                                name: "referenceFiles",
                                                multiple: true,
                                                accept: "image/*",
                                                style: {
                                                    width: "100%",
                                                    padding: 20,
                                                    border: "2px dashed #555",
                                                    background: "#111"
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 805,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 799,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: {
                                            display: "block",
                                            marginTop: 12
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "checkbox",
                                                name: "addToAll",
                                                defaultChecked: true
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 820,
                                                columnNumber: 33
                                            }, this),
                                            " Add these files to all ads in this campaign"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 819,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 14
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            children: "Save Prompt + Upload Files"
                                        }, void 0, false, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 824,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 823,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 782,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 779,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 24,
                            border: "1px solid #333",
                            padding: 16
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: "Shared Reference Files (All Ads)"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 830,
                                columnNumber: 25
                            }, this),
                            job.referenceAssets.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "No shared files uploaded yet."
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 832,
                                columnNumber: 29
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                children: job.referenceAssets.map((asset)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: asset.filePath,
                                            target: "_blank",
                                            rel: "noreferrer",
                                            children: asset.originalName
                                        }, void 0, false, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 837,
                                            columnNumber: 41
                                        }, this)
                                    }, asset.id, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 836,
                                        columnNumber: 37
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 834,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: {
                                    marginTop: 20
                                },
                                children: "Ad-Specific Reference Files"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 845,
                                columnNumber: 25
                            }, this),
                            selectedAd.referenceAssets.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "No ad-specific files uploaded yet."
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 847,
                                columnNumber: 29
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                children: selectedAd.referenceAssets.map((asset)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: asset.filePath,
                                            target: "_blank",
                                            rel: "noreferrer",
                                            children: asset.originalName
                                        }, void 0, false, {
                                            fileName: "[project]/app/jobs/[id]/page.tsx",
                                            lineNumber: 852,
                                            columnNumber: 41
                                        }, this)
                                    }, asset.id, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 851,
                                        columnNumber: 37
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 849,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 829,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 24,
                            border: "1px solid #333",
                            padding: 16
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: [
                                    "Generate Images for Ad ",
                                    selectedAd.adNumber
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 862,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                action: generateAdImages,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "hidden",
                                        name: "jobId",
                                        value: job.id
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 864,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "hidden",
                                        name: "adId",
                                        value: selectedAd.id
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 865,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "submit",
                                        children: "Generate This Ad with Kie"
                                    }, void 0, false, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 866,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 863,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 861,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 24,
                            border: "1px solid #333",
                            padding: 16
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: "Image Gallery"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 871,
                                columnNumber: 25
                            }, this),
                            selectedAd.images.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "No generated images for this ad yet."
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 873,
                                columnNumber: 29
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                                    gap: 16,
                                    marginTop: 12
                                },
                                children: selectedAd.images.map((image)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            border: "1px solid #333",
                                            padding: 12
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: image.url,
                                                alt: `Ad ${selectedAd.adNumber}`,
                                                style: {
                                                    width: "100%",
                                                    height: "auto",
                                                    display: "block"
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 885,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginTop: 8,
                                                    fontSize: 12,
                                                    wordBreak: "break-all"
                                                },
                                                children: image.url
                                            }, void 0, false, {
                                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                                lineNumber: 890,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, image.id, true, {
                                        fileName: "[project]/app/jobs/[id]/page.tsx",
                                        lineNumber: 884,
                                        columnNumber: 37
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 875,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 870,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 24,
                            border: "1px solid #333",
                            padding: 16
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: "Kie Result"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 900,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    whiteSpace: "pre-wrap",
                                    lineHeight: 1.4,
                                    marginTop: 12,
                                    maxHeight: 320,
                                    overflow: "auto"
                                },
                                children: (()=>{
                                    const parsed = tryParseJson(selectedAd.kieResult);
                                    return typeof parsed === "object" && parsed !== null ? JSON.stringify(parsed, null, 2) : selectedAd.kieResult || "No Kie result yet.";
                                })()
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/page.tsx",
                                lineNumber: 901,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/page.tsx",
                        lineNumber: 899,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true) : null
        ]
    }, void 0, true, {
        fileName: "[project]/app/jobs/[id]/page.tsx",
        lineNumber: 537,
        columnNumber: 9
    }, this);
}
}),
"[project]/.next-internal/server/app/jobs/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/jobs/[id]/page.tsx [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/jobs/[id]/page.tsx [app-rsc] (ecmascript)");
;
;
;
;
}),
"[project]/.next-internal/server/app/jobs/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/jobs/[id]/page.tsx [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "40163adf6e526e8b5daf9df8dfd98135b45720999b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_0"],
    "4017e7700eafc8c40397f642ec8db7fbc5d8bf413b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_3"],
    "40ae0eedb2783eb623d89ce87f72ca5fbf7344c59f",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_1"],
    "40e7df428217a28d413bdcaba894785ade6e877651",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_2"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$jobs$2f5b$id$5d2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/jobs/[id]/page/actions.js { ACTIONS_MODULE0 => "[project]/app/jobs/[id]/page.tsx [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/jobs/[id]/page.tsx [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_f42eab85._.js.map