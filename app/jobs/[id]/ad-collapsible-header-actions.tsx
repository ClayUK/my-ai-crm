"use client";

import { type CSSProperties } from "react";
import SaveImageButton from "@/app/components/SaveImageButton";
import { PendingSubmitButton } from "@/app/components/PendingSubmitButton";

type Props = {
    jobId: string;
    adId: string;
    generateAdImages: (formData: FormData) => Promise<void>;
    /** First generated image (header Save image); omit if none yet. */
    firstImageUrl?: string | null;
    firstImageId?: string | null;
    firstImageDownloadName?: string;
};

function stopProp(e: React.SyntheticEvent) {
    e.stopPropagation();
}

const btnSm: CSSProperties = {
    padding: "6px 10px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    border: "1px solid var(--borderStrong)",
    whiteSpace: "nowrap",
};

export function AdCollapsibleHeaderActions({
    jobId,
    adId,
    generateAdImages,
    firstImageUrl,
    firstImageId,
    firstImageDownloadName,
}: Props) {
    const hasImage = Boolean(firstImageUrl?.trim());

    return (
        <div
            onClick={stopProp}
            onPointerDown={stopProp}
            style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 8,
                cursor: "default",
            }}
        >
            <form
                action={generateAdImages}
                style={{
                    display: "inline-flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 8,
                }}
            >
                <input type="hidden" name="jobId" value={jobId} />
                <input type="hidden" name="adId" value={adId} />
                <PendingSubmitButton
                    label="Generate Kie"
                    pendingLabel="Generating images…"
                    style={{
                        ...btnSm,
                        background: "var(--accent)",
                        color: "#fff",
                        border: "1px solid rgba(124, 58, 237, 0.35)",
                    }}
                />
            </form>
            {hasImage && firstImageDownloadName ? (
                <SaveImageButton
                    imageId={firstImageId ?? undefined}
                    imageUrl={firstImageUrl!}
                    downloadName={firstImageDownloadName}
                    compact
                />
            ) : (
                <button
                    type="button"
                    disabled
                    title="Generate an image with Kie first"
                    style={{
                        ...btnSm,
                        background: "var(--surfaceElevated)",
                        color: "var(--foreground)",
                        opacity: 0.45,
                        cursor: "not-allowed",
                    }}
                >
                    Save image
                </button>
            )}
        </div>
    );
}
