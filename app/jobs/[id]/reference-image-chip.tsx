import { deleteReferenceAsset } from "./reference-asset-actions";

type RefAsset = {
    id: string;
    filePath: string;
    originalName: string;
};

export function ReferenceImageChip({
    asset,
    jobId,
    adId,
}: {
    asset: RefAsset;
    jobId: string;
    /** null = job-level shared reference */
    adId: string | null;
}) {
    return (
        <div
            style={{
                position: "relative",
                width: 96,
                height: 96,
                borderRadius: 12,
                border: "1px solid var(--border)",
                overflow: "hidden",
                background: "var(--surfaceElevated)",
                flexShrink: 0,
            }}
        >
            <img
                src={asset.filePath}
                alt={asset.originalName || "Reference"}
                title={asset.originalName || ""}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                }}
            />
            <form
                action={deleteReferenceAsset}
                style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    margin: 0,
                }}
            >
                <input type="hidden" name="jobId" value={jobId} />
                <input type="hidden" name="referenceAssetId" value={asset.id} />
                {adId ? <input type="hidden" name="adId" value={adId} /> : null}
                <button
                    type="submit"
                    aria-label="Remove reference image"
                    title="Remove"
                    style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        border: "1px solid rgba(0,0,0,0.35)",
                        background: "rgba(0,0,0,0.65)",
                        color: "#fff",
                        fontSize: 16,
                        lineHeight: 1,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        fontWeight: 700,
                    }}
                >
                    ×
                </button>
            </form>
        </div>
    );
}
