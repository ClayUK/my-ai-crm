"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
    mergeAdditionalInfoSections,
    splitAdditionalInfoSections,
    type VarKeyRow,
} from "@/src/lib/creativeBrain";
import { DONATION_SWIPE_BATCH_LIMIT } from "@/src/lib/swipeBrain";
import { saveFundraiserCreativeBrain } from "./actions";

type Row = VarKeyRow & { id: string };

function newRowId() {
    return typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Math.random()).slice(2);
}

export function CreativeBrainForm({
    initialBrain,
}: {
    initialBrain: {
        previousWinningPrompts: string;
        anglesList: string;
        additionalInfo: string;
    } | null;
}) {
    const initialSplit = useMemo(
        () =>
            splitAdditionalInfoSections(initialBrain?.additionalInfo || ""),
        [initialBrain?.additionalInfo]
    );

    const [previousWinningPrompts, setPreviousWinningPrompts] = useState(
        initialBrain?.previousWinningPrompts || ""
    );
    const [anglesList, setAnglesList] = useState(
        initialBrain?.anglesList || ""
    );
    const [globalAndTemplate, setGlobalAndTemplate] = useState(
        initialSplit.globalAndTemplateLines
    );
    const [varRows, setVarRows] = useState<Row[]>(() =>
        initialSplit.varKeyRows.map((r) => ({ ...r, id: newRowId() }))
    );
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const mergedAdditionalInfo = useMemo(
        () =>
            mergeAdditionalInfoSections(
                globalAndTemplate,
                varRows.map(({ key, value }) => ({ key, value }))
            ),
        [globalAndTemplate, varRows]
    );

    const addVarRow = () => {
        setVarRows((rows) => [
            ...rows,
            { id: newRowId(), key: "VAR_", value: "" },
        ]);
    };

    const removeVarRow = (id: string) => {
        setVarRows((rows) => rows.filter((r) => r.id !== id));
    };

    const updateVarRow = (id: string, patch: Partial<VarKeyRow>) => {
        setVarRows((rows) =>
            rows.map((r) => (r.id === id ? { ...r, ...patch } : r))
        );
    };

    const normalizeVarKey = (raw: string) => {
        let k = raw.trim().toUpperCase().replace(/\s+/g, "_");
        if (!k) return "";
        if (!k.startsWith("VAR_")) k = `VAR_${k.replace(/^VAR_/, "")}`;
        return k;
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget);
        fd.set("additionalInfo", mergedAdditionalInfo);
        startTransition(async () => {
            try {
                await saveFundraiserCreativeBrain(fd);
                router.refresh();
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to save."
                );
            }
        });
    };

    return (
        <form onSubmit={onSubmit}>
            <div
                style={{
                    display: "grid",
                    gap: 16,
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    padding: 16,
                    background: "var(--surface)",
                }}
            >
                <div>
                    <label
                        style={{
                            display: "block",
                            fontWeight: 800,
                            fontSize: 13,
                            marginBottom: 6,
                        }}
                    >
                        Previous winning prompts
                    </label>
                    <div
                        style={{
                            fontSize: 12,
                            opacity: 0.75,
                            marginBottom: 8,
                        }}
                    >
                        Paste example visual prompts or short descriptions that
                        performed well (one per line or freeform). Up to{" "}
                        {DONATION_SWIPE_BATCH_LIMIT} active donation swipe
                        entries also merge into the same seed pool + structured
                        context on <strong>Generate 5 ads</strong>.
                    </div>
                    <textarea
                        name="previousWinningPrompts"
                        value={previousWinningPrompts}
                        onChange={(e) => setPreviousWinningPrompts(e.target.value)}
                        rows={8}
                        style={{
                            width: "100%",
                            padding: 10,
                            borderRadius: 12,
                            border: "1px solid var(--border)",
                            background: "var(--surfaceElevated)",
                            color: "var(--foreground)",
                        }}
                    />
                </div>

                <div>
                    <label
                        style={{
                            display: "block",
                            fontWeight: 800,
                            fontSize: 13,
                            marginBottom: 6,
                        }}
                    >
                        Angles list
                    </label>
                    <div
                        style={{
                            fontSize: 12,
                            opacity: 0.75,
                            marginBottom: 8,
                        }}
                    >
                        One angle per line. Batches randomize from this list.
                    </div>
                    <textarea
                        name="anglesList"
                        value={anglesList}
                        onChange={(e) => setAnglesList(e.target.value)}
                        rows={10}
                        style={{
                            width: "100%",
                            padding: 10,
                            borderRadius: 12,
                            border: "1px solid var(--border)",
                            background: "var(--surfaceElevated)",
                            color: "var(--foreground)",
                        }}
                    />
                </div>

                <div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "baseline",
                            justifyContent: "space-between",
                            gap: 12,
                            flexWrap: "wrap",
                        }}
                    >
                        <label
                            style={{
                                display: "block",
                                fontWeight: 800,
                                fontSize: 13,
                            }}
                        >
                            Variation keys (batch mixer)
                        </label>
                        <button
                            type="button"
                            onClick={addVarRow}
                            style={{
                                padding: "6px 12px",
                                borderRadius: 10,
                                border: "1px solid var(--borderStrong)",
                                background: "var(--surfaceElevated)",
                                color: "var(--foreground)",
                                fontWeight: 700,
                                fontSize: 12,
                                cursor: "pointer",
                            }}
                        >
                            + Add variation key
                        </button>
                    </div>
                    <div
                        style={{
                            fontSize: 12,
                            opacity: 0.78,
                            marginTop: 6,
                            marginBottom: 10,
                            lineHeight: 1.5,
                        }}
                    >
                        Each row is saved as <code>KEY = definition</code>. Keys
                        must start with <code>VAR_</code>. On{" "}
                        <strong>Generate 5 ads</strong>, Claude randomly mixes
                        0–3 of these per slot with template keys (unless you
                        define keys here — then <em>only</em> your list is used).
                        <code> VAR_ADD_TEXT</code> and <code>VAR_NO_TEXT</code>{" "}
                        are never applied together on the same slot.
                    </div>
                    {varRows.length === 0 ? (
                        <div
                            style={{
                                fontSize: 12,
                                opacity: 0.65,
                                padding: 12,
                                borderRadius: 12,
                                border: "1px dashed var(--border)",
                            }}
                        >
                            No custom keys — batch uses built-in defaults (
                            <code>VAR_HIGHER_AGGRESSION</code>, … including{" "}
                            <code>VAR_NO_TEXT</code>).
                        </div>
                    ) : (
                        <div style={{ display: "grid", gap: 12 }}>
                            {varRows.map((row) => (
                                <div
                                    key={row.id}
                                    style={{
                                        display: "grid",
                                        gap: 8,
                                        padding: 12,
                                        borderRadius: 12,
                                        border: "1px solid var(--border)",
                                        background: "var(--surfaceElevated)",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: 8,
                                            flexWrap: "wrap",
                                            alignItems: "center",
                                        }}
                                    >
                                        <input
                                            aria-label="Variation key"
                                            value={row.key}
                                            onChange={(e) =>
                                                updateVarRow(row.id, {
                                                    key: e.target.value,
                                                })
                                            }
                                            onBlur={() =>
                                                updateVarRow(row.id, {
                                                    key: normalizeVarKey(
                                                        row.key
                                                    ),
                                                })
                                            }
                                            placeholder="VAR_ADD_TEXT"
                                            style={{
                                                flex: "1 1 180px",
                                                minWidth: 140,
                                                padding: 8,
                                                borderRadius: 10,
                                                border:
                                                    "1px solid var(--border)",
                                                background: "var(--surface)",
                                                color: "var(--foreground)",
                                                fontFamily:
                                                    "ui-monospace, monospace",
                                                fontSize: 12,
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeVarRow(row.id)
                                            }
                                            style={{
                                                padding: "8px 12px",
                                                borderRadius: 10,
                                                border:
                                                    "1px solid rgba(239,68,68,0.5)",
                                                background:
                                                    "rgba(239,68,68,0.12)",
                                                color: "#fecaca",
                                                fontWeight: 700,
                                                fontSize: 12,
                                                cursor: "pointer",
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <textarea
                                        aria-label="Definition for this key"
                                        value={row.value}
                                        onChange={(e) =>
                                            updateVarRow(row.id, {
                                                value: e.target.value,
                                            })
                                        }
                                        placeholder="Instructions injected when this VAR is selected for a slot…"
                                        rows={3}
                                        style={{
                                            width: "100%",
                                            padding: 10,
                                            borderRadius: 10,
                                            border:
                                                "1px solid var(--border)",
                                            background: "var(--surface)",
                                            color: "var(--foreground)",
                                            fontSize: 13,
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <label
                        style={{
                            display: "block",
                            fontWeight: 800,
                            fontSize: 13,
                            marginBottom: 6,
                        }}
                    >
                        Additional info (global notes + template keys)
                    </label>
                    <div
                        style={{
                            fontSize: 12,
                            opacity: 0.75,
                            marginBottom: 8,
                            lineHeight: 1.5,
                        }}
                    >
                        <strong>Global lines</strong> (no <code>=</code> on the
                        line): notes that apply broadly. Use{" "}
                        <code>KEY = value</code> per line for{" "}
                        <strong>template</strong> overrides only:{" "}
                        <code>UGC_SNAPCHAT</code>, <code>NATIVE_ORGANIC</code>,{" "}
                        <code>HYPER_CLICKBAIT</code>,{" "}
                        <code>CREATIVE_CONCEPT</code>, <code>ILLUSTRATED</code>
                        , <code>KLING_VIDEO</code>. Variation keys belong in the
                        section above.
                    </div>
                    <textarea
                        value={globalAndTemplate}
                        onChange={(e) => setGlobalAndTemplate(e.target.value)}
                        rows={10}
                        style={{
                            width: "100%",
                            padding: 10,
                            borderRadius: 12,
                            border: "1px solid var(--border)",
                            background: "var(--surfaceElevated)",
                            color: "var(--foreground)",
                            fontFamily: "ui-monospace, monospace",
                            fontSize: 12,
                        }}
                    />
                </div>

                {error ? (
                    <div
                        style={{
                            padding: 10,
                            borderRadius: 10,
                            background: "rgba(185, 28, 28, 0.12)",
                            color: "#fecaca",
                            fontSize: 13,
                        }}
                    >
                        {error}
                    </div>
                ) : null}

                <button
                    type="submit"
                    disabled={pending}
                    style={{
                        justifySelf: "start",
                        padding: "10px 18px",
                        borderRadius: 12,
                        border: "1px solid var(--borderStrong)",
                        background: "var(--accent)",
                        color: "#fff",
                        fontWeight: 700,
                        cursor: pending ? "wait" : "pointer",
                    }}
                >
                    {pending ? "Saving…" : "Save Creative Brain"}
                </button>
            </div>
        </form>
    );
}
