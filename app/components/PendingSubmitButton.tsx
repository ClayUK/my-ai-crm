"use client";

import { useFormStatus } from "react-dom";
import type { CSSProperties, ReactNode } from "react";

/**
 * Submit button that shows a spinner while its parent <form> server action is in flight.
 * Must be rendered inside the form (React 19 / Next useFormStatus).
 */
export function PendingSubmitButton({
    label,
    pendingLabel = "Working…",
    style,
    disabled: disabledProp = false,
}: {
    label: ReactNode;
    pendingLabel?: ReactNode;
    style?: CSSProperties;
    /** e.g. no images to evaluate — still disables submit when not pending */
    disabled?: boolean;
}) {
    const { pending } = useFormStatus();
    const disabled = disabledProp || pending;

    return (
        <button
            type="submit"
            disabled={disabled}
            style={{
                ...style,
                cursor: pending
                    ? "wait"
                    : disabledProp
                      ? "not-allowed"
                      : (style?.cursor ?? "pointer"),
            }}
        >
            {pending ? (
                <span
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        width: style?.width === "100%" ? "100%" : undefined,
                    }}
                >
                    <span
                        className="ss-pending-spinner"
                        style={{ width: 18, height: 18 }}
                        aria-hidden
                    />
                    <span>{pendingLabel}</span>
                </span>
            ) : (
                label
            )}
        </button>
    );
}
