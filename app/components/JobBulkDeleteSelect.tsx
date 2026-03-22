"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type JobRow = {
    id: string;
    url: string;
    status: string;
};

export default function JobBulkDeleteSelect({
    jobs,
}: {
    jobs: JobRow[];
}) {
    const [allSelected, setAllSelected] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    // Reset selection when the list changes.
    useEffect(() => {
        setAllSelected(false);
        setSelected(new Set());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jobs.length]);

    function toggleOne(jobId: string, checked: boolean) {
        setAllSelected(false);
        setSelected((prev) => {
            const next = new Set(prev);
            if (checked) next.add(jobId);
            else next.delete(jobId);
            return next;
        });
    }

    return (
        <>
            {jobs.length > 0 ? (
                <div style={{ marginBottom: 12, fontSize: 13, opacity: 0.85 }}>
                    <div style={{ marginBottom: 10 }}>
                        <label
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setAllSelected(checked);
                                    if (!checked) setSelected(new Set());
                                }}
                            />
                            Select all
                        </label>

                        <span style={{ marginLeft: 16 }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setAllSelected(false);
                                    setSelected(new Set());
                                }}
                                style={{
                                    padding: "6px 10px",
                                    borderRadius: 10,
                                    border: "1px solid var(--border)",
                                    background: "var(--surfaceElevated)",
                                    cursor: "pointer",
                                    color: "var(--foreground)",
                                }}
                            >
                                Clear
                            </button>
                        </span>
                    </div>

                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {jobs.map((job) => {
                            const checked = allSelected || selected.has(job.id);
                            return (
                                <li
                                    key={job.id}
                                    style={{
                                        marginBottom: 10,
                                        border: "1px solid var(--border)",
                                        borderRadius: 12,
                                        padding: 12,
                                        background: "var(--surfaceElevated)",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                        }}
                                    >
                                        <label
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 10,
                                                flex: 1,
                                                minWidth: 0,
                                                cursor: "pointer",
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                name="jobIds"
                                                value={job.id}
                                                checked={checked}
                                                onChange={(e) =>
                                                    toggleOne(
                                                        job.id,
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                            <div style={{ minWidth: 0 }}>
                                                <div
                                                    style={{
                                                        fontSize: 13,
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                                                    {job.url}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        opacity: 0.7,
                                                    }}
                                                >
                                                    {job.status}
                                                </div>
                                            </div>
                                        </label>

                                        <Link
                                            href={`/jobs/${job.id}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{
                                                fontSize: 13,
                                                padding: "6px 10px",
                                                borderRadius: 10,
                                                border: "1px solid var(--border)",
                                                background: "transparent",
                                                textDecoration: "none",
                                                color: "var(--foreground)",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            View Job
                                        </Link>

                                        <Link
                                            href={job.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{
                                                fontSize: 13,
                                                padding: "6px 10px",
                                                borderRadius: 10,
                                                border: "1px solid var(--border)",
                                                background: "transparent",
                                                textDecoration: "none",
                                                color: "var(--foreground)",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            Visit URL
                                        </Link>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ) : null}
        </>
    );
}

