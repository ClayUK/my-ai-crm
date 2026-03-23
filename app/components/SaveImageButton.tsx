"use client";

import { useState } from "react";

type Props = {
    /** Prefer this: server proxies the image so the browser always downloads (no new tab). */
    imageId?: string;
    imageUrl: string;
    /** Suggested filename (with or without extension) */
    downloadName: string;
    /** Smaller inline button (e.g. ad row header). */
    compact?: boolean;
};

function buildFileName(downloadName: string) {
    const base =
        downloadName.replace(/\.(png|jpe?g|webp)$/i, "") || "sacredstatics-ad";
    return /\.(png|jpe?g|webp)$/i.test(downloadName)
        ? downloadName
        : `${base}.png`;
}

/**
 * Downloads a generated ad image. Uses the app download API when `imageId`
 * is set (recommended); otherwise attempts a direct blob fetch.
 */
export default function SaveImageButton({
    imageId,
    imageUrl,
    downloadName,
    compact = false,
}: Props) {
    const [busy, setBusy] = useState(false);
    const [lastError, setLastError] = useState<string | null>(null);

    async function handleSave() {
        if (!imageUrl?.trim() && !imageId) return;
        setBusy(true);
        setLastError(null);
        const fileName = buildFileName(downloadName);

        try {
            if (imageId?.trim()) {
                const u = new URL(
                    `/api/ad-images/${encodeURIComponent(imageId)}/download`,
                    window.location.origin
                );
                u.searchParams.set("filename", fileName);
                const res = await fetch(u.toString());
                if (!res.ok) {
                    const j = await res.json().catch(() => null);
                    throw new Error(
                        (j && typeof j === "object" && "error" in j
                            ? String((j as { error?: string }).error)
                            : null) || `Download failed (${res.status})`
                    );
                }
                const blob = await res.blob();
                const objectUrl = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = objectUrl;
                a.download = fileName;
                a.rel = "noopener";
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(objectUrl);
                return;
            }

            const res = await fetch(imageUrl, { mode: "cors" });
            if (!res.ok) throw new Error("fetch failed");
            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = objectUrl;
            a.download = fileName;
            a.rel = "noopener";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(objectUrl);
        } catch (e) {
            const msg =
                e instanceof Error ? e.message : "Could not download image.";
            setLastError(msg);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div style={compact ? undefined : { width: "100%" }}>
            <button
                type="button"
                onClick={handleSave}
                disabled={busy}
                style={
                    compact
                        ? {
                              padding: "6px 10px",
                              borderRadius: 8,
                              border: "1px solid var(--borderStrong)",
                              background: "var(--surfaceElevated)",
                              color: "var(--foreground)",
                              cursor: busy ? "wait" : "pointer",
                              fontSize: 12,
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                          }
                        : {
                              marginTop: 10,
                              padding: "8px 14px",
                              borderRadius: 10,
                              border: "1px solid var(--borderStrong)",
                              background: "var(--surfaceElevated)",
                              color: "var(--foreground)",
                              cursor: busy ? "wait" : "pointer",
                              fontSize: 13,
                              fontWeight: 700,
                              width: "100%",
                          }
                }
            >
                {busy ? "Saving…" : "Save image"}
            </button>
            {lastError ? (
                <div
                    style={{
                        marginTop: 6,
                        fontSize: 11,
                        color: "var(--danger)",
                        lineHeight: 1.35,
                    }}
                >
                    {lastError}
                </div>
            ) : null}
        </div>
    );
}
