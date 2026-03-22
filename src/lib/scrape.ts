type ScrapeResult = {
    finalUrl: string;
    html: string;
    status: number;
    contentType: string | null;
    imageUrls: string[];
};

function isPrivateIpLiteral(hostname: string) {
    const lower = hostname.toLowerCase();
    if (lower === "localhost") return true;
    if (lower === "::1") return true;

    const ipv4Match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (!ipv4Match) return false;

    const parts = ipv4Match.slice(1).map((n) => Number(n));
    if (parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) return true;

    const [a, b] = parts;

    if (a === 127) return true;
    if (a === 10) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 169 && b === 254) return true;

    return false;
}

export function normalizeAndValidatePublicUrl(input: string) {
    const raw = input.trim();
    if (!raw) throw new Error("URL is required");

    const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw);
    const normalizedInput = hasScheme ? raw : `https://${raw}`;

    let url: URL;
    try {
        url = new URL(normalizedInput);
    } catch {
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

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(timeout);
    }
}

async function fetchHtmlOnce(url: string): Promise<ScrapeResult> {
    const response = await fetchWithTimeout(
        url,
        {
            method: "GET",
            cache: "no-store",
            redirect: "follow",
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
                Accept:
                    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
            },
        },
        15000
    );

    const contentType = response.headers.get("content-type");
    const html = await response.text();
    const imageUrls = extractImageUrlsFromHtml(html);
    return {
        finalUrl: response.url || url,
        html,
        status: response.status,
        contentType,
        imageUrls,
    };
}

function extractImageUrlsFromHtml(html: string): string[] {
    const urls = new Set<string>();
    const text = html ?? "";

    // <img src="...">
    const imgSrcRe = /<img[^>]+src\s*=\s*["']([^"']+)["']/gi;
    let match: RegExpExecArray | null;
    while ((match = imgSrcRe.exec(text)) !== null) {
        const url = match[1];
        if (typeof url !== "string") continue;
        const lower = url.toLowerCase();
        if (
            (url.startsWith("http://") || url.startsWith("https://")) &&
            (lower.includes(".png") ||
                lower.includes(".jpg") ||
                lower.includes(".jpeg") ||
                lower.includes(".webp") ||
                lower.includes("image"))
        ) {
            urls.add(url);
        }
    }

    // <meta property="og:image" content="...">
    const ogImageRe =
        /<meta[^>]+property\s*=\s*["']og:image["'][^>]+content\s*=\s*["']([^"']+)["'][^>]*>/i;
    const ogMatch = text.match(ogImageRe);
    if (ogMatch?.[1]) {
        const url = ogMatch[1];
        const lower = url.toLowerCase();
        if (
            (url.startsWith("http://") || url.startsWith("https://")) &&
            (lower.includes(".png") ||
                lower.includes(".jpg") ||
                lower.includes(".jpeg") ||
                lower.includes(".webp") ||
                lower.includes("image"))
        ) {
            urls.add(url);
        }
    }

    return Array.from(urls);
}

function buildJinaReaderUrl(targetUrl: string) {
    // Jina "reader" style endpoint which returns extracted text/HTML-ish output.
    // It’s a pragmatic fallback when sites block direct fetches.
    return `https://r.jina.ai/${targetUrl}`;
}

export async function scrapeUrlToHtml(urlInput: string) {
    const url = normalizeAndValidatePublicUrl(urlInput);

    let lastError: unknown = null;

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

    const message =
        lastError instanceof Error ? lastError.message : String(lastError || "Unknown error");
    throw new Error(`Failed to fetch URL content. ${message}`);
}

