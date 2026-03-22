"use client";

import { useState, useTransition, type CSSProperties } from "react";
import type { ParsedAd } from "@/src/lib/claude/parseClaudeJson";
import type { VariationCheckboxFlags } from "@/src/lib/adVariationCore";
import {
    commitVariationAdsAction,
    previewVariationPromptAction,
} from "./variation-preview-actions";

const defaultFlags: VariationCheckboxFlags = {
    klingFormat: false,
};

function cloneAds(ads: ParsedAd[]): ParsedAd[] {
    return ads.map((a) => ({ ...a }));
}

export function AdVariationPanel({
    jobId,
    adId,
    showKlingOption,
}: {
    jobId: string;
    adId: string;
    showKlingOption: boolean;
}) {
    const [instruction, setInstruction] = useState("");
    const [flags, setFlags] = useState<VariationCheckboxFlags>({ ...defaultFlags });
    const [draftAds, setDraftAds] = useState<ParsedAd[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pendingPreview, startPreview] = useTransition();
    const [pendingCommit, startCommit] = useTransition();

    const patchAd = (index: number, field: keyof ParsedAd, value: string) => {
        setDraftAds((prev) => {
            if (!prev) return prev;
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const runPreview = () => {
        setError(null);
        startPreview(async () => {
            const res = await previewVariationPromptAction({
                jobId,
                baseAdId: adId,
                variationInstruction: instruction,
                flags,
            });
            if (!res.ok) {
                setError(res.error);
                setDraftAds(null);
                return;
            }
            setDraftAds(cloneAds(res.ads));
        });
    };

    const runCommit = () => {
        if (!draftAds?.length) return;
        setError(null);
        startCommit(async () => {
            await commitVariationAdsAction({
                jobId,
                baseAdId: adId,
                ads: draftAds,
            });
        });
    };

    const inputStyle: CSSProperties = {
        width: "100%",
        padding: 8,
        marginTop: 4,
        borderRadius: 8,
        border: "1px solid var(--border)",
        background: "var(--surface)",
        color: "var(--foreground)",
        fontSize: 13,
    };

    const labelStyle: CSSProperties = {
        fontSize: 12,
        fontWeight: 700,
        opacity: 0.9,
        display: "block",
        marginTop: 8,
    };

    return (
        <details
            style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--surface)",
            }}
        >
            <summary
                style={{
                    cursor: "pointer",
                    fontWeight: 800,
                    fontSize: 14,
                }}
            >
                Variation options → preview → new ad tab
            </summary>
            <div
                style={{
                    marginTop: 12,
                    fontSize: 12,
                    opacity: 0.82,
                    lineHeight: 1.45,
                    marginBottom: 12,
                }}
            >
                Step 1: describe what to change (and optional Kling format).{" "}
                <strong>Generate 5 ads</strong> uses Memory variation keys; this
                panel is free-text only. Step 2: edit the preview, then{" "}
                <strong>save as new ad tab</strong>. Open that tab and run Kie.
            </div>

            <label style={labelStyle}>Optional: what to change</label>
            <input
                type="text"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder='e.g. "more aggressive", "remove text", "add urgency"'
                style={inputStyle}
            />

            {showKlingOption ? (
                <label
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 12,
                        fontSize: 13,
                        opacity: 0.92,
                    }}
                >
                    <input
                        type="checkbox"
                        checked={flags.klingFormat}
                        onChange={(e) =>
                            setFlags((f) => ({
                                ...f,
                                klingFormat: e.target.checked,
                            }))
                        }
                    />
                    Kling-ready pack (KIE still + KLING video strand)
                </label>
            ) : null}

            <button
                type="button"
                onClick={runPreview}
                disabled={pendingPreview}
                style={{
                    marginTop: 14,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--borderStrong)",
                    background: "var(--accent)",
                    color: "#fff",
                    cursor: pendingPreview ? "wait" : "pointer",
                    fontWeight: 700,
                    width: "100%",
                }}
            >
                {pendingPreview ? "Generating preview…" : "Generate variation prompt"}
            </button>

            {error ? (
                <div
                    style={{
                        marginTop: 12,
                        padding: 10,
                        borderRadius: 10,
                        background: "rgba(185, 28, 28, 0.12)",
                        color: "#fecaca",
                        fontSize: 13,
                        whiteSpace: "pre-wrap",
                    }}
                >
                    {error}
                </div>
            ) : null}

            {draftAds && draftAds.length > 0 ? (
                <div style={{ marginTop: 16 }}>
                    <div
                        style={{
                            fontWeight: 800,
                            marginBottom: 10,
                            fontSize: 14,
                        }}
                    >
                        Preview — edit before saving
                    </div>
                    {draftAds.map((ad, idx) => (
                        <div
                            key={idx}
                            style={{
                                marginBottom: 16,
                                padding: 12,
                                borderRadius: 10,
                                border: "1px solid var(--border)",
                                background: "var(--surfaceElevated)",
                            }}
                        >
                            {draftAds.length > 1 ? (
                                <div
                                    style={{
                                        fontWeight: 700,
                                        marginBottom: 8,
                                        fontSize: 13,
                                    }}
                                >
                                    Variation {idx + 1}
                                </div>
                            ) : null}
                            <label style={labelStyle}>Angle</label>
                            <textarea
                                value={ad.angle}
                                onChange={(e) =>
                                    patchAd(idx, "angle", e.target.value)
                                }
                                rows={2}
                                style={{ ...inputStyle, minHeight: 48 }}
                            />
                            <label style={labelStyle}>Hook</label>
                            <textarea
                                value={ad.hook}
                                onChange={(e) =>
                                    patchAd(idx, "hook", e.target.value)
                                }
                                rows={2}
                                style={{ ...inputStyle, minHeight: 48 }}
                            />
                            <label style={labelStyle}>Headline</label>
                            <textarea
                                value={ad.headline}
                                onChange={(e) =>
                                    patchAd(idx, "headline", e.target.value)
                                }
                                rows={2}
                                style={{ ...inputStyle, minHeight: 48 }}
                            />
                            <label style={labelStyle}>Primary text</label>
                            <textarea
                                value={ad.primaryText}
                                onChange={(e) =>
                                    patchAd(idx, "primaryText", e.target.value)
                                }
                                rows={2}
                                style={{ ...inputStyle, minHeight: 48 }}
                            />
                            <label style={labelStyle}>CTA</label>
                            <textarea
                                value={ad.cta}
                                onChange={(e) =>
                                    patchAd(idx, "cta", e.target.value)
                                }
                                rows={2}
                                style={{ ...inputStyle, minHeight: 48 }}
                            />
                            <label style={labelStyle}>Visual prompt (Kie)</label>
                            <textarea
                                value={ad.visualPrompt}
                                onChange={(e) =>
                                    patchAd(idx, "visualPrompt", e.target.value)
                                }
                                rows={8}
                                style={{
                                    ...inputStyle,
                                    fontFamily: "ui-monospace, monospace",
                                    fontSize: 12,
                                }}
                            />
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={runCommit}
                        disabled={pendingCommit}
                        style={{
                            marginTop: 4,
                            padding: "10px 14px",
                            borderRadius: 10,
                            border: "1px solid var(--borderStrong)",
                            background: "var(--surfaceElevated)",
                            color: "var(--foreground)",
                            cursor: pendingCommit ? "wait" : "pointer",
                            fontWeight: 700,
                            width: "100%",
                        }}
                    >
                        {pendingCommit
                            ? "Saving…"
                            : draftAds.length > 1
                              ? `Save ${draftAds.length} new ad tabs`
                              : "Save as new ad tab"}
                    </button>
                </div>
            ) : null}
        </details>
    );
}
