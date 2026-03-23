(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/components/PendingSubmitButton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PendingSubmitButton",
    ()=>PendingSubmitButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function PendingSubmitButton({ label, pendingLabel = "Working…", style, disabled: disabledProp = false }) {
    _s();
    const { pending } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFormStatus"])();
    const disabled = disabledProp || pending;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "submit",
        disabled: disabled,
        style: {
            ...style,
            cursor: pending ? "wait" : disabledProp ? "not-allowed" : style?.cursor ?? "pointer"
        },
        children: pending ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            style: {
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                width: style?.width === "100%" ? "100%" : undefined
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "ss-pending-spinner",
                    style: {
                        width: 18,
                        height: 18
                    },
                    "aria-hidden": true
                }, void 0, false, {
                    fileName: "[project]/app/components/PendingSubmitButton.tsx",
                    lineNumber: 48,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: pendingLabel
                }, void 0, false, {
                    fileName: "[project]/app/components/PendingSubmitButton.tsx",
                    lineNumber: 53,
                    columnNumber: 21
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/PendingSubmitButton.tsx",
            lineNumber: 39,
            columnNumber: 17
        }, this) : label
    }, void 0, false, {
        fileName: "[project]/app/components/PendingSubmitButton.tsx",
        lineNumber: 26,
        columnNumber: 9
    }, this);
}
_s(PendingSubmitButton, "ChN3pfldoIBH4a0f1nBGB7ED+p0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFormStatus"]
    ];
});
_c = PendingSubmitButton;
var _c;
__turbopack_context__.k.register(_c, "PendingSubmitButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/jobs/[id]/data:3bdf39 [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "commitVariationAdsAction",
    ()=>$$RSC_SERVER_ACTION_1
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"40a3088bbcaae3f7f0ff7ccce12a1a44a0019bb119":"commitVariationAdsAction"},"app/jobs/[id]/variation-preview-actions.ts",""] */ "use turbopack no side effects";
;
const $$RSC_SERVER_ACTION_1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("40a3088bbcaae3f7f0ff7ccce12a1a44a0019bb119", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "commitVariationAdsAction");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
 //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vdmFyaWF0aW9uLXByZXZpZXctYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzZXJ2ZXJcIjtcblxuaW1wb3J0IHsgcmVkaXJlY3QgfSBmcm9tIFwibmV4dC9uYXZpZ2F0aW9uXCI7XG5pbXBvcnQgeyBwcmlzbWEgfSBmcm9tIFwiQC9zcmMvbGliL3ByaXNtYVwiO1xuaW1wb3J0IHtcbiAgICBydW5WYXJpYXRpb25DbGF1ZGVPbmx5LFxuICAgIHBlcnNpc3RWYXJpYXRpb25BZHMsXG4gICAgcGFyc2VDbGllbnRBZFBheWxvYWQsXG4gICAgdHlwZSBWYXJpYXRpb25DaGVja2JveEZsYWdzLFxufSBmcm9tIFwiQC9zcmMvbGliL2FkVmFyaWF0aW9uQ29yZVwiO1xuaW1wb3J0IHR5cGUgeyBQYXJzZWRBZCB9IGZyb20gXCJAL3NyYy9saWIvY2xhdWRlL3BhcnNlQ2xhdWRlSnNvblwiO1xuXG5leHBvcnQgdHlwZSBWYXJpYXRpb25QcmV2aWV3UmVzdWx0ID1cbiAgICB8IHsgb2s6IHRydWU7IGFkczogUGFyc2VkQWRbXSB9XG4gICAgfCB7IG9rOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJldmlld1ZhcmlhdGlvblByb21wdEFjdGlvbihpbnB1dDoge1xuICAgIGpvYklkOiBzdHJpbmc7XG4gICAgYmFzZUFkSWQ6IHN0cmluZztcbiAgICB2YXJpYXRpb25JbnN0cnVjdGlvbjogc3RyaW5nO1xuICAgIGZsYWdzOiBWYXJpYXRpb25DaGVja2JveEZsYWdzO1xufSk6IFByb21pc2U8VmFyaWF0aW9uUHJldmlld1Jlc3VsdD4ge1xuICAgIGNvbnN0IHJvdyA9IGF3YWl0IHByaXNtYS5qb2IuZmluZFVuaXF1ZSh7XG4gICAgICAgIHdoZXJlOiB7IGlkOiBpbnB1dC5qb2JJZCB9LFxuICAgICAgICBzZWxlY3Q6IHsgaWQ6IHRydWUgfSxcbiAgICB9KTtcbiAgICBpZiAoIXJvdykge1xuICAgICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBcIkpvYiBub3QgZm91bmQuXCIgfTtcbiAgICB9XG5cbiAgICBjb25zdCBhZFJvdyA9IGF3YWl0IHByaXNtYS5hZC5maW5kRmlyc3Qoe1xuICAgICAgICB3aGVyZTogeyBpZDogaW5wdXQuYmFzZUFkSWQsIGpvYklkOiBpbnB1dC5qb2JJZCB9LFxuICAgICAgICBzZWxlY3Q6IHsgaWQ6IHRydWUgfSxcbiAgICB9KTtcbiAgICBpZiAoIWFkUm93KSB7XG4gICAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IFwiQWQgbm90IGZvdW5kIG9uIHRoaXMgam9iLlwiIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHJ1blZhcmlhdGlvbkNsYXVkZU9ubHkoe1xuICAgICAgICBqb2JJZDogaW5wdXQuam9iSWQsXG4gICAgICAgIGJhc2VBZElkOiBpbnB1dC5iYXNlQWRJZCxcbiAgICAgICAgdmFyaWF0aW9uSW5zdHJ1Y3Rpb246IGlucHV0LnZhcmlhdGlvbkluc3RydWN0aW9uLFxuICAgICAgICBmbGFnczogaW5wdXQuZmxhZ3MsXG4gICAgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb21taXRWYXJpYXRpb25BZHNBY3Rpb24oaW5wdXQ6IHtcbiAgICBqb2JJZDogc3RyaW5nO1xuICAgIGJhc2VBZElkOiBzdHJpbmc7XG4gICAgYWRzOiB1bmtub3duW107XG59KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGlucHV0LmFkcykgfHwgaW5wdXQuYWRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZWRpcmVjdChcbiAgICAgICAgICAgIGAvam9icy8ke2lucHV0LmpvYklkfT92YXJpYXRpb25FcnJvcj0ke2VuY29kZVVSSUNvbXBvbmVudChcIk5vdGhpbmcgdG8gc2F2ZSDigJQgZ2VuZXJhdGUgYSBwcmV2aWV3IGZpcnN0LlwiKX1gXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgdmFsaWRhdGVkOiBQYXJzZWRBZFtdID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dC5hZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VDbGllbnRBZFBheWxvYWQoaW5wdXQuYWRzW2ldKTtcbiAgICAgICAgaWYgKCFwYXJzZWQub2spIHtcbiAgICAgICAgICAgIHJlZGlyZWN0KFxuICAgICAgICAgICAgICAgIGAvam9icy8ke2lucHV0LmpvYklkfT92YXJpYXRpb25FcnJvcj0ke2VuY29kZVVSSUNvbXBvbmVudChgQWQgJHtpICsgMX06ICR7cGFyc2VkLmVycm9yfWApfWBcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsaWRhdGVkLnB1c2gocGFyc2VkLmFkKTtcbiAgICB9XG5cbiAgICBjb25zdCBqb2IgPSBhd2FpdCBwcmlzbWEuam9iLmZpbmRVbmlxdWUoe1xuICAgICAgICB3aGVyZTogeyBpZDogaW5wdXQuam9iSWQgfSxcbiAgICAgICAgc2VsZWN0OiB7IGlkOiB0cnVlIH0sXG4gICAgfSk7XG4gICAgaWYgKCFqb2IpIHtcbiAgICAgICAgcmVkaXJlY3QoXG4gICAgICAgICAgICBgL2pvYnMvJHtpbnB1dC5qb2JJZH0/dmFyaWF0aW9uRXJyb3I9JHtlbmNvZGVVUklDb21wb25lbnQoXCJKb2Igbm90IGZvdW5kLlwiKX1gXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgYmFzZSA9IGF3YWl0IHByaXNtYS5hZC5maW5kRmlyc3Qoe1xuICAgICAgICB3aGVyZTogeyBpZDogaW5wdXQuYmFzZUFkSWQsIGpvYklkOiBpbnB1dC5qb2JJZCB9LFxuICAgICAgICBzZWxlY3Q6IHsgaWQ6IHRydWUgfSxcbiAgICB9KTtcbiAgICBpZiAoIWJhc2UpIHtcbiAgICAgICAgcmVkaXJlY3QoXG4gICAgICAgICAgICBgL2pvYnMvJHtpbnB1dC5qb2JJZH0/dmFyaWF0aW9uRXJyb3I9JHtlbmNvZGVVUklDb21wb25lbnQoXCJCYXNlIGFkIG5vdCBmb3VuZC5cIil9YFxuICAgICAgICApO1xuICAgIH1cblxuICAgIGF3YWl0IHBlcnNpc3RWYXJpYXRpb25BZHMoe1xuICAgICAgICBqb2JJZDogaW5wdXQuam9iSWQsXG4gICAgICAgIGJhc2VBZElkOiBpbnB1dC5iYXNlQWRJZCxcbiAgICAgICAgYWRzOiB2YWxpZGF0ZWQsXG4gICAgfSk7XG5cbiAgICByZWRpcmVjdChgL2pvYnMvJHtpbnB1dC5qb2JJZH1gKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoidVRBOENzQixxTUFBQSJ9
}),
"[project]/app/jobs/[id]/data:993091 [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "previewVariationPromptAction",
    ()=>$$RSC_SERVER_ACTION_0
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"40bad6b049d3cdbd0e4623e3c6712746f1b06bcd3f":"previewVariationPromptAction"},"app/jobs/[id]/variation-preview-actions.ts",""] */ "use turbopack no side effects";
;
const $$RSC_SERVER_ACTION_0 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("40bad6b049d3cdbd0e4623e3c6712746f1b06bcd3f", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "previewVariationPromptAction");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
 //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vdmFyaWF0aW9uLXByZXZpZXctYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzZXJ2ZXJcIjtcblxuaW1wb3J0IHsgcmVkaXJlY3QgfSBmcm9tIFwibmV4dC9uYXZpZ2F0aW9uXCI7XG5pbXBvcnQgeyBwcmlzbWEgfSBmcm9tIFwiQC9zcmMvbGliL3ByaXNtYVwiO1xuaW1wb3J0IHtcbiAgICBydW5WYXJpYXRpb25DbGF1ZGVPbmx5LFxuICAgIHBlcnNpc3RWYXJpYXRpb25BZHMsXG4gICAgcGFyc2VDbGllbnRBZFBheWxvYWQsXG4gICAgdHlwZSBWYXJpYXRpb25DaGVja2JveEZsYWdzLFxufSBmcm9tIFwiQC9zcmMvbGliL2FkVmFyaWF0aW9uQ29yZVwiO1xuaW1wb3J0IHR5cGUgeyBQYXJzZWRBZCB9IGZyb20gXCJAL3NyYy9saWIvY2xhdWRlL3BhcnNlQ2xhdWRlSnNvblwiO1xuXG5leHBvcnQgdHlwZSBWYXJpYXRpb25QcmV2aWV3UmVzdWx0ID1cbiAgICB8IHsgb2s6IHRydWU7IGFkczogUGFyc2VkQWRbXSB9XG4gICAgfCB7IG9rOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJldmlld1ZhcmlhdGlvblByb21wdEFjdGlvbihpbnB1dDoge1xuICAgIGpvYklkOiBzdHJpbmc7XG4gICAgYmFzZUFkSWQ6IHN0cmluZztcbiAgICB2YXJpYXRpb25JbnN0cnVjdGlvbjogc3RyaW5nO1xuICAgIGZsYWdzOiBWYXJpYXRpb25DaGVja2JveEZsYWdzO1xufSk6IFByb21pc2U8VmFyaWF0aW9uUHJldmlld1Jlc3VsdD4ge1xuICAgIGNvbnN0IHJvdyA9IGF3YWl0IHByaXNtYS5qb2IuZmluZFVuaXF1ZSh7XG4gICAgICAgIHdoZXJlOiB7IGlkOiBpbnB1dC5qb2JJZCB9LFxuICAgICAgICBzZWxlY3Q6IHsgaWQ6IHRydWUgfSxcbiAgICB9KTtcbiAgICBpZiAoIXJvdykge1xuICAgICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBcIkpvYiBub3QgZm91bmQuXCIgfTtcbiAgICB9XG5cbiAgICBjb25zdCBhZFJvdyA9IGF3YWl0IHByaXNtYS5hZC5maW5kRmlyc3Qoe1xuICAgICAgICB3aGVyZTogeyBpZDogaW5wdXQuYmFzZUFkSWQsIGpvYklkOiBpbnB1dC5qb2JJZCB9LFxuICAgICAgICBzZWxlY3Q6IHsgaWQ6IHRydWUgfSxcbiAgICB9KTtcbiAgICBpZiAoIWFkUm93KSB7XG4gICAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IFwiQWQgbm90IGZvdW5kIG9uIHRoaXMgam9iLlwiIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHJ1blZhcmlhdGlvbkNsYXVkZU9ubHkoe1xuICAgICAgICBqb2JJZDogaW5wdXQuam9iSWQsXG4gICAgICAgIGJhc2VBZElkOiBpbnB1dC5iYXNlQWRJZCxcbiAgICAgICAgdmFyaWF0aW9uSW5zdHJ1Y3Rpb246IGlucHV0LnZhcmlhdGlvbkluc3RydWN0aW9uLFxuICAgICAgICBmbGFnczogaW5wdXQuZmxhZ3MsXG4gICAgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb21taXRWYXJpYXRpb25BZHNBY3Rpb24oaW5wdXQ6IHtcbiAgICBqb2JJZDogc3RyaW5nO1xuICAgIGJhc2VBZElkOiBzdHJpbmc7XG4gICAgYWRzOiB1bmtub3duW107XG59KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGlucHV0LmFkcykgfHwgaW5wdXQuYWRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZWRpcmVjdChcbiAgICAgICAgICAgIGAvam9icy8ke2lucHV0LmpvYklkfT92YXJpYXRpb25FcnJvcj0ke2VuY29kZVVSSUNvbXBvbmVudChcIk5vdGhpbmcgdG8gc2F2ZSDigJQgZ2VuZXJhdGUgYSBwcmV2aWV3IGZpcnN0LlwiKX1gXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgdmFsaWRhdGVkOiBQYXJzZWRBZFtdID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dC5hZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VDbGllbnRBZFBheWxvYWQoaW5wdXQuYWRzW2ldKTtcbiAgICAgICAgaWYgKCFwYXJzZWQub2spIHtcbiAgICAgICAgICAgIHJlZGlyZWN0KFxuICAgICAgICAgICAgICAgIGAvam9icy8ke2lucHV0LmpvYklkfT92YXJpYXRpb25FcnJvcj0ke2VuY29kZVVSSUNvbXBvbmVudChgQWQgJHtpICsgMX06ICR7cGFyc2VkLmVycm9yfWApfWBcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsaWRhdGVkLnB1c2gocGFyc2VkLmFkKTtcbiAgICB9XG5cbiAgICBjb25zdCBqb2IgPSBhd2FpdCBwcmlzbWEuam9iLmZpbmRVbmlxdWUoe1xuICAgICAgICB3aGVyZTogeyBpZDogaW5wdXQuam9iSWQgfSxcbiAgICAgICAgc2VsZWN0OiB7IGlkOiB0cnVlIH0sXG4gICAgfSk7XG4gICAgaWYgKCFqb2IpIHtcbiAgICAgICAgcmVkaXJlY3QoXG4gICAgICAgICAgICBgL2pvYnMvJHtpbnB1dC5qb2JJZH0/dmFyaWF0aW9uRXJyb3I9JHtlbmNvZGVVUklDb21wb25lbnQoXCJKb2Igbm90IGZvdW5kLlwiKX1gXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgYmFzZSA9IGF3YWl0IHByaXNtYS5hZC5maW5kRmlyc3Qoe1xuICAgICAgICB3aGVyZTogeyBpZDogaW5wdXQuYmFzZUFkSWQsIGpvYklkOiBpbnB1dC5qb2JJZCB9LFxuICAgICAgICBzZWxlY3Q6IHsgaWQ6IHRydWUgfSxcbiAgICB9KTtcbiAgICBpZiAoIWJhc2UpIHtcbiAgICAgICAgcmVkaXJlY3QoXG4gICAgICAgICAgICBgL2pvYnMvJHtpbnB1dC5qb2JJZH0/dmFyaWF0aW9uRXJyb3I9JHtlbmNvZGVVUklDb21wb25lbnQoXCJCYXNlIGFkIG5vdCBmb3VuZC5cIil9YFxuICAgICAgICApO1xuICAgIH1cblxuICAgIGF3YWl0IHBlcnNpc3RWYXJpYXRpb25BZHMoe1xuICAgICAgICBqb2JJZDogaW5wdXQuam9iSWQsXG4gICAgICAgIGJhc2VBZElkOiBpbnB1dC5iYXNlQWRJZCxcbiAgICAgICAgYWRzOiB2YWxpZGF0ZWQsXG4gICAgfSk7XG5cbiAgICByZWRpcmVjdChgL2pvYnMvJHtpbnB1dC5qb2JJZH1gKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiMlRBZ0JzQix5TUFBQSJ9
}),
"[project]/app/jobs/[id]/ad-variation-panel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdVariationPanel",
    ()=>AdVariationPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$data$3a$3bdf39__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/jobs/[id]/data:3bdf39 [app-client] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$data$3a$993091__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/jobs/[id]/data:993091 [app-client] (ecmascript) <text/javascript>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const defaultFlags = {
    klingFormat: false
};
function cloneAds(ads) {
    return ads.map((a)=>({
            ...a
        }));
}
function AdVariationPanel({ jobId, adId, showKlingOption }) {
    _s();
    const [instruction, setInstruction] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [flags, setFlags] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        ...defaultFlags
    });
    const [draftAds, setDraftAds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [pendingPreview, startPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransition"])();
    const [pendingCommit, startCommit] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransition"])();
    const patchAd = (index, field, value)=>{
        setDraftAds((prev)=>{
            if (!prev) return prev;
            const next = [
                ...prev
            ];
            next[index] = {
                ...next[index],
                [field]: value
            };
            return next;
        });
    };
    const runPreview = ()=>{
        setError(null);
        startPreview(async ()=>{
            const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$data$3a$993091__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["previewVariationPromptAction"])({
                jobId,
                baseAdId: adId,
                variationInstruction: instruction,
                flags
            });
            if (!res.ok) {
                setError(res.error);
                setDraftAds(null);
                return;
            }
            setDraftAds(cloneAds(res.ads));
        });
    };
    const runCommit = ()=>{
        if (!draftAds?.length) return;
        setError(null);
        startCommit(async ()=>{
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$data$3a$3bdf39__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["commitVariationAdsAction"])({
                jobId,
                baseAdId: adId,
                ads: draftAds
            });
        });
    };
    const inputStyle = {
        width: "100%",
        padding: 8,
        marginTop: 4,
        borderRadius: 8,
        border: "1px solid var(--border)",
        background: "var(--surface)",
        color: "var(--foreground)",
        fontSize: 13
    };
    const labelStyle = {
        fontSize: 12,
        fontWeight: 700,
        opacity: 0.9,
        display: "block",
        marginTop: 8
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
        style: {
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--surface)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                style: {
                    cursor: "pointer",
                    fontWeight: 800,
                    fontSize: 14
                },
                children: "Variation options → preview → new ad tab"
            }, void 0, false, {
                fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                lineNumber: 103,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 12,
                    fontSize: 12,
                    opacity: 0.82,
                    lineHeight: 1.45,
                    marginBottom: 12
                },
                children: [
                    "Step 1: describe what to change (and optional Kling format).",
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "Generate 5 ads"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                        lineNumber: 122,
                        columnNumber: 17
                    }, this),
                    " uses Memory variation keys; this panel is free-text only. Step 2: edit the preview, then",
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "save as new ad tab"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                        lineNumber: 124,
                        columnNumber: 17
                    }, this),
                    ". Open that tab and run Kie."
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                lineNumber: 112,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                style: labelStyle,
                children: "Optional: what to change"
            }, void 0, false, {
                fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                lineNumber: 127,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "text",
                value: instruction,
                onChange: (e)=>setInstruction(e.target.value),
                placeholder: 'e.g. "more aggressive", "remove text", "add urgency"',
                style: inputStyle
            }, void 0, false, {
                fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                lineNumber: 128,
                columnNumber: 13
            }, this),
            showKlingOption ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 12,
                    fontSize: 13,
                    opacity: 0.92
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "checkbox",
                        checked: flags.klingFormat,
                        onChange: (e)=>setFlags((f)=>({
                                    ...f,
                                    klingFormat: e.target.checked
                                }))
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                        lineNumber: 147,
                        columnNumber: 21
                    }, this),
                    "Kling-ready pack (KIE still + KLING video strand)"
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                lineNumber: 137,
                columnNumber: 17
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: runPreview,
                disabled: pendingPreview,
                style: {
                    marginTop: 14,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--borderStrong)",
                    background: "var(--accent)",
                    color: "#fff",
                    cursor: pendingPreview ? "wait" : "pointer",
                    fontWeight: 700,
                    width: "100%"
                },
                children: pendingPreview ? "Generating preview…" : "Generate variation prompt"
            }, void 0, false, {
                fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                lineNumber: 161,
                columnNumber: 13
            }, this),
            error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 12,
                    padding: 10,
                    borderRadius: 10,
                    background: "rgba(185, 28, 28, 0.12)",
                    color: "#fecaca",
                    fontSize: 13,
                    whiteSpace: "pre-wrap"
                },
                children: error
            }, void 0, false, {
                fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                lineNumber: 181,
                columnNumber: 17
            }, this) : null,
            draftAds && draftAds.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 16
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontWeight: 800,
                            marginBottom: 10,
                            fontSize: 14
                        },
                        children: "Preview — edit before saving"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                        lineNumber: 198,
                        columnNumber: 21
                    }, this),
                    draftAds.map((ad, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                marginBottom: 16,
                                padding: 12,
                                borderRadius: 10,
                                border: "1px solid var(--border)",
                                background: "var(--surfaceElevated)"
                            },
                            children: [
                                draftAds.length > 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontWeight: 700,
                                        marginBottom: 8,
                                        fontSize: 13
                                    },
                                    children: [
                                        "Variation ",
                                        idx + 1
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                    lineNumber: 219,
                                    columnNumber: 33
                                }, this) : null,
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: labelStyle,
                                    children: "Angle"
                                }, void 0, false, {
                                    fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                    lineNumber: 229,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    value: ad.angle,
                                    onChange: (e)=>patchAd(idx, "angle", e.target.value),
                                    rows: 2,
                                    style: {
                                        ...inputStyle,
                                        minHeight: 48
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                    lineNumber: 230,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: labelStyle,
                                    children: "Hook"
                                }, void 0, false, {
                                    fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                    lineNumber: 238,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    value: ad.hook,
                                    onChange: (e)=>patchAd(idx, "hook", e.target.value),
                                    rows: 2,
                                    style: {
                                        ...inputStyle,
                                        minHeight: 48
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                    lineNumber: 239,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: labelStyle,
                                    children: "Headline"
                                }, void 0, false, {
                                    fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                    lineNumber: 247,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    value: ad.headline,
                                    onChange: (e)=>patchAd(idx, "headline", e.target.value),
                                    rows: 2,
                                    style: {
                                        ...inputStyle,
                                        minHeight: 48
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                    lineNumber: 248,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: labelStyle,
                                    children: "Primary text"
                                }, void 0, false, {
                                    fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                    lineNumber: 256,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    value: ad.primaryText,
                                    onChange: (e)=>patchAd(idx, "primaryText", e.target.value),
                                    rows: 2,
                                    style: {
                                        ...inputStyle,
                                        minHeight: 48
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                    lineNumber: 257,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: labelStyle,
                                    children: "CTA"
                                }, void 0, false, {
                                    fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                    lineNumber: 265,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    value: ad.cta,
                                    onChange: (e)=>patchAd(idx, "cta", e.target.value),
                                    rows: 2,
                                    style: {
                                        ...inputStyle,
                                        minHeight: 48
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                    lineNumber: 266,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: labelStyle,
                                    children: "Visual prompt (Kie)"
                                }, void 0, false, {
                                    fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                    lineNumber: 274,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    value: ad.visualPrompt,
                                    onChange: (e)=>patchAd(idx, "visualPrompt", e.target.value),
                                    rows: 8,
                                    style: {
                                        ...inputStyle,
                                        fontFamily: "ui-monospace, monospace",
                                        fontSize: 12
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                    lineNumber: 275,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, idx, true, {
                            fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                            lineNumber: 208,
                            columnNumber: 25
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: runCommit,
                        disabled: pendingCommit,
                        style: {
                            marginTop: 4,
                            padding: "10px 14px",
                            borderRadius: 10,
                            border: "1px solid var(--borderStrong)",
                            background: "var(--surfaceElevated)",
                            color: "var(--foreground)",
                            cursor: pendingCommit ? "wait" : "pointer",
                            fontWeight: 700,
                            width: "100%"
                        },
                        children: pendingCommit ? "Saving…" : draftAds.length > 1 ? `Save ${draftAds.length} new ad tabs` : "Save as new ad tab"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                        lineNumber: 289,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                lineNumber: 197,
                columnNumber: 17
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
        lineNumber: 94,
        columnNumber: 9
    }, this);
}
_s(AdVariationPanel, "4W/mvVhXNKLTozIkvGfiRmNZ0ps=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransition"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransition"]
    ];
});
_c = AdVariationPanel;
var _c;
__turbopack_context__.k.register(_c, "AdVariationPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/SaveImageButton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SaveImageButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function SaveImageButton({ imageUrl, downloadName, compact = false }) {
    _s();
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    async function handleSave() {
        if (!imageUrl?.trim()) return;
        setBusy(true);
        const base = downloadName.replace(/\.(png|jpe?g|webp)$/i, "") || "sacredstatics-ad";
        const fileName = /\.(png|jpe?g|webp)$/i.test(downloadName) ? downloadName : `${base}.png`;
        try {
            const res = await fetch(imageUrl, {
                mode: "cors"
            });
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
        } catch  {
            window.open(imageUrl, "_blank", "noopener,noreferrer");
        } finally{
            setBusy(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: handleSave,
        disabled: busy,
        style: compact ? {
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid var(--borderStrong)",
            background: "var(--surfaceElevated)",
            color: "var(--foreground)",
            cursor: busy ? "wait" : "pointer",
            fontSize: 12,
            fontWeight: 700,
            whiteSpace: "nowrap"
        } : {
            marginTop: 10,
            padding: "8px 14px",
            borderRadius: 10,
            border: "1px solid var(--borderStrong)",
            background: "var(--surfaceElevated)",
            color: "var(--foreground)",
            cursor: busy ? "wait" : "pointer",
            fontSize: 13,
            fontWeight: 700,
            width: "100%"
        },
        children: busy ? "Saving…" : "Save image"
    }, void 0, false, {
        fileName: "[project]/app/components/SaveImageButton.tsx",
        lineNumber: 54,
        columnNumber: 9
    }, this);
}
_s(SaveImageButton, "1xb9mZubXs1SxY/cOnjkSF8CKNw=");
_c = SaveImageButton;
var _c;
__turbopack_context__.k.register(_c, "SaveImageButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdCollapsibleHeaderActions",
    ()=>AdCollapsibleHeaderActions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$SaveImageButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/SaveImageButton.tsx [app-client] (ecmascript)");
"use client";
;
;
function stopProp(e) {
    e.stopPropagation();
}
const btnSm = {
    padding: "6px 10px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    border: "1px solid var(--borderStrong)",
    whiteSpace: "nowrap"
};
function AdCollapsibleHeaderActions({ jobId, adId, aspectSelectHeaderId, generateAdImages, firstImageUrl, firstImageDownloadName }) {
    const hasImage = Boolean(firstImageUrl?.trim());
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        onClick: stopProp,
        onPointerDown: stopProp,
        style: {
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 8,
            cursor: "default"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                action: generateAdImages,
                style: {
                    display: "inline-flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 8
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "hidden",
                        name: "jobId",
                        value: jobId
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx",
                        lineNumber: 61,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "hidden",
                        name: "adId",
                        value: adId
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx",
                        lineNumber: 62,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        htmlFor: aspectSelectHeaderId,
                        style: {
                            fontSize: 11,
                            fontWeight: 700,
                            opacity: 0.85,
                            margin: 0
                        },
                        children: "Aspect"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx",
                        lineNumber: 63,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        id: aspectSelectHeaderId,
                        name: "adAspectRatio",
                        defaultValue: "1:1",
                        style: {
                            padding: "5px 8px",
                            borderRadius: 8,
                            border: "1px solid var(--border)",
                            background: "var(--surfaceElevated)",
                            color: "var(--foreground)",
                            fontSize: 12
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "1:1",
                                children: "1:1"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx",
                                lineNumber: 87,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "9:16",
                                children: "9:16"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx",
                                lineNumber: 88,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx",
                        lineNumber: 74,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "submit",
                        style: {
                            ...btnSm,
                            background: "var(--accent)",
                            color: "#fff",
                            border: "1px solid rgba(124, 58, 237, 0.35)"
                        },
                        children: "Generate Kie"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx",
                        lineNumber: 90,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx",
                lineNumber: 52,
                columnNumber: 13
            }, this),
            hasImage && firstImageDownloadName ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$SaveImageButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                imageUrl: firstImageUrl,
                downloadName: firstImageDownloadName,
                compact: true
            }, void 0, false, {
                fileName: "[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx",
                lineNumber: 103,
                columnNumber: 17
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                disabled: true,
                title: "Generate an image with Kie first",
                style: {
                    ...btnSm,
                    background: "var(--surfaceElevated)",
                    color: "var(--foreground)",
                    opacity: 0.45,
                    cursor: "not-allowed"
                },
                children: "Save image"
            }, void 0, false, {
                fileName: "[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx",
                lineNumber: 109,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx",
        lineNumber: 41,
        columnNumber: 9
    }, this);
}
_c = AdCollapsibleHeaderActions;
var _c;
__turbopack_context__.k.register(_c, "AdCollapsibleHeaderActions");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/CopyToClipboardButton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CopyToClipboardButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function CopyToClipboardButton({ text, label = "Copy" }) {
    _s();
    const [copied, setCopied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    async function onCopy() {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            window.setTimeout(()=>setCopied(false), 1200);
        } catch  {
        // If clipboard is blocked, do nothing (user can still manually select/copy).
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: onCopy,
        style: {
            padding: "6px 10px",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--foreground)",
            cursor: "pointer",
            fontSize: 12
        },
        children: copied ? "Copied" : label
    }, void 0, false, {
        fileName: "[project]/app/components/CopyToClipboardButton.tsx",
        lineNumber: 25,
        columnNumber: 9
    }, this);
}
_s(CopyToClipboardButton, "NE86rL3vg4NVcTTWDavsT0hUBJs=");
_c = CopyToClipboardButton;
var _c;
__turbopack_context__.k.register(_c, "CopyToClipboardButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
                return "Activity";
            case REACT_VIEW_TRANSITION_TYPE:
                return "ViewTransition";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_CONTEXT_TYPE:
                return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
        try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
        } catch (x) {
            return "<...>";
        }
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
        return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.defineProperty(type, "_debugStack", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
            for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren]);
            Object.freeze && Object.freeze(children);
        } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
        else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
    }
    function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
    }
    function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    var React = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
    };
    React = {
        react_stack_bottom_frame: function(callStackForError) {
            return callStackForError();
        }
    };
    var specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutKeySpread = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        if (trackActualOwner) {
            var previousStackTraceLimit = Error.stackTraceLimit;
            Error.stackTraceLimit = 10;
            var debugStackDEV = Error("react-stack-top-frame");
            Error.stackTraceLimit = previousStackTraceLimit;
        } else debugStackDEV = unknownOwnerDebugStack;
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStackDEV, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
}();
}),
"[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}),
"[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// This file must be bundled in the app's client layer, it shouldn't be directly
// imported by the server.
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    callServer: null,
    createServerReference: null,
    findSourceMapURL: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    callServer: function() {
        return _appcallserver.callServer;
    },
    createServerReference: function() {
        return _client.createServerReference;
    },
    findSourceMapURL: function() {
        return _appfindsourcemapurl.findSourceMapURL;
    }
});
const _appcallserver = __turbopack_context__.r("[project]/node_modules/next/dist/client/app-call-server.js [app-client] (ecmascript)");
const _appfindsourcemapurl = __turbopack_context__.r("[project]/node_modules/next/dist/client/app-find-source-map-url.js [app-client] (ecmascript)");
const _client = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react-server-dom-turbopack/client.js [app-client] (ecmascript)"); //# sourceMappingURL=action-client-wrapper.js.map
}),
]);

//# sourceMappingURL=_5ae430fb._.js.map