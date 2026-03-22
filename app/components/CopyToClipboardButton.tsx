"use client";

import { useState } from "react";

export default function CopyToClipboardButton({
    text,
    label = "Copy",
}: {
    text: string;
    label?: string;
}) {
    const [copied, setCopied] = useState(false);

    async function onCopy() {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
        } catch {
            // If clipboard is blocked, do nothing (user can still manually select/copy).
        }
    }

    return (
        <button
            type="button"
            onClick={onCopy}
            style={{
                padding: "6px 10px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--foreground)",
                cursor: "pointer",
                fontSize: 12,
            }}
        >
            {copied ? "Copied" : label}
        </button>
    );
}

