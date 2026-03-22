"use client";

import { useState } from "react";

type Props = {
    imageUrl: string;
    /** Suggested filename (with or without extension) */
    downloadName: string;
    /** Smaller inline button (e.g. ad row header). */
    compact?: boolean;
};

/**
 * Downloads a generated ad image. Uses blob download when CORS allows;
 * otherwise opens the image in a new tab so the user can save from the browser.
 */
export default function SaveImageButton({
    imageUrl,
    downloadName,
    compact = false,
}: Props) {
    const [busy, setBusy] = useState(false);

    async function handleSave() {
        if (!imageUrl?.trim()) return;
        setBusy(true);
        const base =
            downloadName.replace(/\.(png|jpe?g|webp)$/i, "") || "sacredstatics-ad";
        const fileName = /\.(png|jpe?g|webp)$/i.test(downloadName)
            ? downloadName
            : `${base}.png`;

        try {
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
        } catch {
            window.open(imageUrl, "_blank", "noopener,noreferrer");
        } finally {
            setBusy(false);
        }
    }

    return (
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
    );
}
