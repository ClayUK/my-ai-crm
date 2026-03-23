module.exports = [
"[project]/app/components/PendingSubmitButton.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PendingSubmitButton",
    ()=>PendingSubmitButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
"use client";
;
;
function PendingSubmitButton({ label, pendingLabel = "Working…", style, disabled: disabledProp = false }) {
    const { pending } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFormStatus"])();
    const disabled = disabledProp || pending;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "submit",
        disabled: disabled,
        style: {
            ...style,
            cursor: pending ? "wait" : disabledProp ? "not-allowed" : style?.cursor ?? "pointer"
        },
        children: pending ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            style: {
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                width: style?.width === "100%" ? "100%" : undefined
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
}),
"[project]/app/jobs/[id]/data:3bdf39 [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "commitVariationAdsAction",
    ()=>$$RSC_SERVER_ACTION_1
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"40a3088bbcaae3f7f0ff7ccce12a1a44a0019bb119":"commitVariationAdsAction"},"app/jobs/[id]/variation-preview-actions.ts",""] */ "use turbopack no side effects";
;
const $$RSC_SERVER_ACTION_1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("40a3088bbcaae3f7f0ff7ccce12a1a44a0019bb119", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "commitVariationAdsAction");
;
 //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vdmFyaWF0aW9uLXByZXZpZXctYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzZXJ2ZXJcIjtcblxuaW1wb3J0IHsgcmVkaXJlY3QgfSBmcm9tIFwibmV4dC9uYXZpZ2F0aW9uXCI7XG5pbXBvcnQgeyBwcmlzbWEgfSBmcm9tIFwiQC9zcmMvbGliL3ByaXNtYVwiO1xuaW1wb3J0IHtcbiAgICBydW5WYXJpYXRpb25DbGF1ZGVPbmx5LFxuICAgIHBlcnNpc3RWYXJpYXRpb25BZHMsXG4gICAgcGFyc2VDbGllbnRBZFBheWxvYWQsXG4gICAgdHlwZSBWYXJpYXRpb25DaGVja2JveEZsYWdzLFxufSBmcm9tIFwiQC9zcmMvbGliL2FkVmFyaWF0aW9uQ29yZVwiO1xuaW1wb3J0IHR5cGUgeyBQYXJzZWRBZCB9IGZyb20gXCJAL3NyYy9saWIvY2xhdWRlL3BhcnNlQ2xhdWRlSnNvblwiO1xuXG5leHBvcnQgdHlwZSBWYXJpYXRpb25QcmV2aWV3UmVzdWx0ID1cbiAgICB8IHsgb2s6IHRydWU7IGFkczogUGFyc2VkQWRbXSB9XG4gICAgfCB7IG9rOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJldmlld1ZhcmlhdGlvblByb21wdEFjdGlvbihpbnB1dDoge1xuICAgIGpvYklkOiBzdHJpbmc7XG4gICAgYmFzZUFkSWQ6IHN0cmluZztcbiAgICB2YXJpYXRpb25JbnN0cnVjdGlvbjogc3RyaW5nO1xuICAgIGZsYWdzOiBWYXJpYXRpb25DaGVja2JveEZsYWdzO1xufSk6IFByb21pc2U8VmFyaWF0aW9uUHJldmlld1Jlc3VsdD4ge1xuICAgIGNvbnN0IHJvdyA9IGF3YWl0IHByaXNtYS5qb2IuZmluZFVuaXF1ZSh7XG4gICAgICAgIHdoZXJlOiB7IGlkOiBpbnB1dC5qb2JJZCB9LFxuICAgICAgICBzZWxlY3Q6IHsgaWQ6IHRydWUgfSxcbiAgICB9KTtcbiAgICBpZiAoIXJvdykge1xuICAgICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBcIkpvYiBub3QgZm91bmQuXCIgfTtcbiAgICB9XG5cbiAgICBjb25zdCBhZFJvdyA9IGF3YWl0IHByaXNtYS5hZC5maW5kRmlyc3Qoe1xuICAgICAgICB3aGVyZTogeyBpZDogaW5wdXQuYmFzZUFkSWQsIGpvYklkOiBpbnB1dC5qb2JJZCB9LFxuICAgICAgICBzZWxlY3Q6IHsgaWQ6IHRydWUgfSxcbiAgICB9KTtcbiAgICBpZiAoIWFkUm93KSB7XG4gICAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IFwiQWQgbm90IGZvdW5kIG9uIHRoaXMgam9iLlwiIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHJ1blZhcmlhdGlvbkNsYXVkZU9ubHkoe1xuICAgICAgICBqb2JJZDogaW5wdXQuam9iSWQsXG4gICAgICAgIGJhc2VBZElkOiBpbnB1dC5iYXNlQWRJZCxcbiAgICAgICAgdmFyaWF0aW9uSW5zdHJ1Y3Rpb246IGlucHV0LnZhcmlhdGlvbkluc3RydWN0aW9uLFxuICAgICAgICBmbGFnczogaW5wdXQuZmxhZ3MsXG4gICAgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb21taXRWYXJpYXRpb25BZHNBY3Rpb24oaW5wdXQ6IHtcbiAgICBqb2JJZDogc3RyaW5nO1xuICAgIGJhc2VBZElkOiBzdHJpbmc7XG4gICAgYWRzOiB1bmtub3duW107XG59KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGlucHV0LmFkcykgfHwgaW5wdXQuYWRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZWRpcmVjdChcbiAgICAgICAgICAgIGAvam9icy8ke2lucHV0LmpvYklkfT92YXJpYXRpb25FcnJvcj0ke2VuY29kZVVSSUNvbXBvbmVudChcIk5vdGhpbmcgdG8gc2F2ZSDigJQgZ2VuZXJhdGUgYSBwcmV2aWV3IGZpcnN0LlwiKX1gXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgdmFsaWRhdGVkOiBQYXJzZWRBZFtdID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dC5hZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VDbGllbnRBZFBheWxvYWQoaW5wdXQuYWRzW2ldKTtcbiAgICAgICAgaWYgKCFwYXJzZWQub2spIHtcbiAgICAgICAgICAgIHJlZGlyZWN0KFxuICAgICAgICAgICAgICAgIGAvam9icy8ke2lucHV0LmpvYklkfT92YXJpYXRpb25FcnJvcj0ke2VuY29kZVVSSUNvbXBvbmVudChgQWQgJHtpICsgMX06ICR7cGFyc2VkLmVycm9yfWApfWBcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsaWRhdGVkLnB1c2gocGFyc2VkLmFkKTtcbiAgICB9XG5cbiAgICBjb25zdCBqb2IgPSBhd2FpdCBwcmlzbWEuam9iLmZpbmRVbmlxdWUoe1xuICAgICAgICB3aGVyZTogeyBpZDogaW5wdXQuam9iSWQgfSxcbiAgICAgICAgc2VsZWN0OiB7IGlkOiB0cnVlIH0sXG4gICAgfSk7XG4gICAgaWYgKCFqb2IpIHtcbiAgICAgICAgcmVkaXJlY3QoXG4gICAgICAgICAgICBgL2pvYnMvJHtpbnB1dC5qb2JJZH0/dmFyaWF0aW9uRXJyb3I9JHtlbmNvZGVVUklDb21wb25lbnQoXCJKb2Igbm90IGZvdW5kLlwiKX1gXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgYmFzZSA9IGF3YWl0IHByaXNtYS5hZC5maW5kRmlyc3Qoe1xuICAgICAgICB3aGVyZTogeyBpZDogaW5wdXQuYmFzZUFkSWQsIGpvYklkOiBpbnB1dC5qb2JJZCB9LFxuICAgICAgICBzZWxlY3Q6IHsgaWQ6IHRydWUgfSxcbiAgICB9KTtcbiAgICBpZiAoIWJhc2UpIHtcbiAgICAgICAgcmVkaXJlY3QoXG4gICAgICAgICAgICBgL2pvYnMvJHtpbnB1dC5qb2JJZH0/dmFyaWF0aW9uRXJyb3I9JHtlbmNvZGVVUklDb21wb25lbnQoXCJCYXNlIGFkIG5vdCBmb3VuZC5cIil9YFxuICAgICAgICApO1xuICAgIH1cblxuICAgIGF3YWl0IHBlcnNpc3RWYXJpYXRpb25BZHMoe1xuICAgICAgICBqb2JJZDogaW5wdXQuam9iSWQsXG4gICAgICAgIGJhc2VBZElkOiBpbnB1dC5iYXNlQWRJZCxcbiAgICAgICAgYWRzOiB2YWxpZGF0ZWQsXG4gICAgfSk7XG5cbiAgICByZWRpcmVjdChgL2pvYnMvJHtpbnB1dC5qb2JJZH1gKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoidVRBOENzQixxTUFBQSJ9
}),
"[project]/app/jobs/[id]/data:993091 [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "previewVariationPromptAction",
    ()=>$$RSC_SERVER_ACTION_0
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"40bad6b049d3cdbd0e4623e3c6712746f1b06bcd3f":"previewVariationPromptAction"},"app/jobs/[id]/variation-preview-actions.ts",""] */ "use turbopack no side effects";
;
const $$RSC_SERVER_ACTION_0 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("40bad6b049d3cdbd0e4623e3c6712746f1b06bcd3f", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "previewVariationPromptAction");
;
 //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vdmFyaWF0aW9uLXByZXZpZXctYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzZXJ2ZXJcIjtcblxuaW1wb3J0IHsgcmVkaXJlY3QgfSBmcm9tIFwibmV4dC9uYXZpZ2F0aW9uXCI7XG5pbXBvcnQgeyBwcmlzbWEgfSBmcm9tIFwiQC9zcmMvbGliL3ByaXNtYVwiO1xuaW1wb3J0IHtcbiAgICBydW5WYXJpYXRpb25DbGF1ZGVPbmx5LFxuICAgIHBlcnNpc3RWYXJpYXRpb25BZHMsXG4gICAgcGFyc2VDbGllbnRBZFBheWxvYWQsXG4gICAgdHlwZSBWYXJpYXRpb25DaGVja2JveEZsYWdzLFxufSBmcm9tIFwiQC9zcmMvbGliL2FkVmFyaWF0aW9uQ29yZVwiO1xuaW1wb3J0IHR5cGUgeyBQYXJzZWRBZCB9IGZyb20gXCJAL3NyYy9saWIvY2xhdWRlL3BhcnNlQ2xhdWRlSnNvblwiO1xuXG5leHBvcnQgdHlwZSBWYXJpYXRpb25QcmV2aWV3UmVzdWx0ID1cbiAgICB8IHsgb2s6IHRydWU7IGFkczogUGFyc2VkQWRbXSB9XG4gICAgfCB7IG9rOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJldmlld1ZhcmlhdGlvblByb21wdEFjdGlvbihpbnB1dDoge1xuICAgIGpvYklkOiBzdHJpbmc7XG4gICAgYmFzZUFkSWQ6IHN0cmluZztcbiAgICB2YXJpYXRpb25JbnN0cnVjdGlvbjogc3RyaW5nO1xuICAgIGZsYWdzOiBWYXJpYXRpb25DaGVja2JveEZsYWdzO1xufSk6IFByb21pc2U8VmFyaWF0aW9uUHJldmlld1Jlc3VsdD4ge1xuICAgIGNvbnN0IHJvdyA9IGF3YWl0IHByaXNtYS5qb2IuZmluZFVuaXF1ZSh7XG4gICAgICAgIHdoZXJlOiB7IGlkOiBpbnB1dC5qb2JJZCB9LFxuICAgICAgICBzZWxlY3Q6IHsgaWQ6IHRydWUgfSxcbiAgICB9KTtcbiAgICBpZiAoIXJvdykge1xuICAgICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBcIkpvYiBub3QgZm91bmQuXCIgfTtcbiAgICB9XG5cbiAgICBjb25zdCBhZFJvdyA9IGF3YWl0IHByaXNtYS5hZC5maW5kRmlyc3Qoe1xuICAgICAgICB3aGVyZTogeyBpZDogaW5wdXQuYmFzZUFkSWQsIGpvYklkOiBpbnB1dC5qb2JJZCB9LFxuICAgICAgICBzZWxlY3Q6IHsgaWQ6IHRydWUgfSxcbiAgICB9KTtcbiAgICBpZiAoIWFkUm93KSB7XG4gICAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IFwiQWQgbm90IGZvdW5kIG9uIHRoaXMgam9iLlwiIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHJ1blZhcmlhdGlvbkNsYXVkZU9ubHkoe1xuICAgICAgICBqb2JJZDogaW5wdXQuam9iSWQsXG4gICAgICAgIGJhc2VBZElkOiBpbnB1dC5iYXNlQWRJZCxcbiAgICAgICAgdmFyaWF0aW9uSW5zdHJ1Y3Rpb246IGlucHV0LnZhcmlhdGlvbkluc3RydWN0aW9uLFxuICAgICAgICBmbGFnczogaW5wdXQuZmxhZ3MsXG4gICAgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb21taXRWYXJpYXRpb25BZHNBY3Rpb24oaW5wdXQ6IHtcbiAgICBqb2JJZDogc3RyaW5nO1xuICAgIGJhc2VBZElkOiBzdHJpbmc7XG4gICAgYWRzOiB1bmtub3duW107XG59KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGlucHV0LmFkcykgfHwgaW5wdXQuYWRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZWRpcmVjdChcbiAgICAgICAgICAgIGAvam9icy8ke2lucHV0LmpvYklkfT92YXJpYXRpb25FcnJvcj0ke2VuY29kZVVSSUNvbXBvbmVudChcIk5vdGhpbmcgdG8gc2F2ZSDigJQgZ2VuZXJhdGUgYSBwcmV2aWV3IGZpcnN0LlwiKX1gXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgdmFsaWRhdGVkOiBQYXJzZWRBZFtdID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dC5hZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VDbGllbnRBZFBheWxvYWQoaW5wdXQuYWRzW2ldKTtcbiAgICAgICAgaWYgKCFwYXJzZWQub2spIHtcbiAgICAgICAgICAgIHJlZGlyZWN0KFxuICAgICAgICAgICAgICAgIGAvam9icy8ke2lucHV0LmpvYklkfT92YXJpYXRpb25FcnJvcj0ke2VuY29kZVVSSUNvbXBvbmVudChgQWQgJHtpICsgMX06ICR7cGFyc2VkLmVycm9yfWApfWBcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsaWRhdGVkLnB1c2gocGFyc2VkLmFkKTtcbiAgICB9XG5cbiAgICBjb25zdCBqb2IgPSBhd2FpdCBwcmlzbWEuam9iLmZpbmRVbmlxdWUoe1xuICAgICAgICB3aGVyZTogeyBpZDogaW5wdXQuam9iSWQgfSxcbiAgICAgICAgc2VsZWN0OiB7IGlkOiB0cnVlIH0sXG4gICAgfSk7XG4gICAgaWYgKCFqb2IpIHtcbiAgICAgICAgcmVkaXJlY3QoXG4gICAgICAgICAgICBgL2pvYnMvJHtpbnB1dC5qb2JJZH0/dmFyaWF0aW9uRXJyb3I9JHtlbmNvZGVVUklDb21wb25lbnQoXCJKb2Igbm90IGZvdW5kLlwiKX1gXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgYmFzZSA9IGF3YWl0IHByaXNtYS5hZC5maW5kRmlyc3Qoe1xuICAgICAgICB3aGVyZTogeyBpZDogaW5wdXQuYmFzZUFkSWQsIGpvYklkOiBpbnB1dC5qb2JJZCB9LFxuICAgICAgICBzZWxlY3Q6IHsgaWQ6IHRydWUgfSxcbiAgICB9KTtcbiAgICBpZiAoIWJhc2UpIHtcbiAgICAgICAgcmVkaXJlY3QoXG4gICAgICAgICAgICBgL2pvYnMvJHtpbnB1dC5qb2JJZH0/dmFyaWF0aW9uRXJyb3I9JHtlbmNvZGVVUklDb21wb25lbnQoXCJCYXNlIGFkIG5vdCBmb3VuZC5cIil9YFxuICAgICAgICApO1xuICAgIH1cblxuICAgIGF3YWl0IHBlcnNpc3RWYXJpYXRpb25BZHMoe1xuICAgICAgICBqb2JJZDogaW5wdXQuam9iSWQsXG4gICAgICAgIGJhc2VBZElkOiBpbnB1dC5iYXNlQWRJZCxcbiAgICAgICAgYWRzOiB2YWxpZGF0ZWQsXG4gICAgfSk7XG5cbiAgICByZWRpcmVjdChgL2pvYnMvJHtpbnB1dC5qb2JJZH1gKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiMlRBZ0JzQix5TUFBQSJ9
}),
"[project]/app/jobs/[id]/ad-variation-panel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdVariationPanel",
    ()=>AdVariationPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$PendingSubmitButton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/PendingSubmitButton.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$data$3a$3bdf39__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/jobs/[id]/data:3bdf39 [app-ssr] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$data$3a$993091__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/jobs/[id]/data:993091 [app-ssr] (ecmascript) <text/javascript>");
"use client";
;
;
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
function AdVariationPanel({ jobId, adId, showKlingOption, kieAspectOverride, saveKieAspectOverride, showKieAspectControls = true }) {
    const [instruction, setInstruction] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [flags, setFlags] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        ...defaultFlags
    });
    const [draftAds, setDraftAds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [pendingPreview, startPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTransition"])();
    const [pendingCommit, startCommit] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTransition"])();
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
            const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$data$3a$993091__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["previewVariationPromptAction"])({
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
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$jobs$2f5b$id$5d2f$data$3a$3bdf39__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["commitVariationAdsAction"])({
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
        style: {
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--surface)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                style: {
                    cursor: "pointer",
                    fontWeight: 800,
                    fontSize: 14
                },
                children: "Variation options → preview → new ad tab"
            }, void 0, false, {
                fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                lineNumber: 111,
                columnNumber: 13
            }, this),
            showKieAspectControls ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                action: saveKieAspectOverride,
                style: {
                    marginTop: 12,
                    marginBottom: 14,
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid var(--borderStrong)",
                    background: "var(--surfaceElevated)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "hidden",
                        name: "jobId",
                        value: jobId
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                        lineNumber: 132,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "hidden",
                        name: "adId",
                        value: adId
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                        lineNumber: 133,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: 12,
                            fontWeight: 800,
                            marginBottom: 8
                        },
                        children: "Kie aspect (next generation only)"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                        lineNumber: 134,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: 11,
                            opacity: 0.82,
                            lineHeight: 1.45,
                            marginBottom: 10
                        },
                        children: "Default: match your prompt (e.g. 9:16 vs 1:1). Set a fixed ratio here when you want this tab to always hit Kie in that shape."
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                        lineNumber: 143,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        style: {
                            ...labelStyle,
                            marginTop: 0
                        },
                        children: "Aspect for next Kie run"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                        lineNumber: 155,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        name: "kieAspectOverride",
                        defaultValue: kieAspectOverride ?? "",
                        style: {
                            ...inputStyle,
                            marginTop: 6,
                            maxWidth: 280
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: "From prompt (auto)"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                lineNumber: 167,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "1:1",
                                children: "1:1 / 1080×1080"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                lineNumber: 168,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "9:16",
                                children: "9:16 (vertical)"
                            }, void 0, false, {
                                fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                lineNumber: 169,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                        lineNumber: 158,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$PendingSubmitButton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PendingSubmitButton"], {
                        label: "Save aspect choice",
                        pendingLabel: "Saving…",
                        style: {
                            marginTop: 12,
                            padding: "8px 12px",
                            borderRadius: 10,
                            border: "1px solid var(--borderStrong)",
                            background: "var(--accent)",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: "pointer"
                        }
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                        lineNumber: 171,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                lineNumber: 121,
                columnNumber: 17
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 12,
                    marginBottom: 10,
                    fontSize: 11,
                    opacity: 0.78,
                    lineHeight: 1.45
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "Kie aspect"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                        lineNumber: 197,
                        columnNumber: 21
                    }, this),
                    " (1:1 vs 9:16) is set under",
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "Variation options"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                        lineNumber: 198,
                        columnNumber: 21
                    }, this),
                    " on the",
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "first"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                        lineNumber: 199,
                        columnNumber: 21
                    }, this),
                    " image in this ad tab."
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                lineNumber: 188,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "Generate 5 ads"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                        lineNumber: 213,
                        columnNumber: 17
                    }, this),
                    " uses Memory variation keys; this panel is free-text only. Step 2: edit the preview, then",
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "save as new ad tab"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                        lineNumber: 215,
                        columnNumber: 17
                    }, this),
                    ". Open that tab and run Kie."
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                lineNumber: 203,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                style: labelStyle,
                children: "Optional: what to change"
            }, void 0, false, {
                fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                lineNumber: 218,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "text",
                value: instruction,
                onChange: (e)=>setInstruction(e.target.value),
                placeholder: 'e.g. "more aggressive", "remove text", "add urgency"',
                style: inputStyle
            }, void 0, false, {
                fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                lineNumber: 219,
                columnNumber: 13
            }, this),
            showKlingOption ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 12,
                    fontSize: 13,
                    opacity: 0.92
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "checkbox",
                        checked: flags.klingFormat,
                        onChange: (e)=>setFlags((f)=>({
                                    ...f,
                                    klingFormat: e.target.checked
                                }))
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                        lineNumber: 238,
                        columnNumber: 21
                    }, this),
                    "Kling-ready pack (KIE still + KLING video strand)"
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                lineNumber: 228,
                columnNumber: 17
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                lineNumber: 252,
                columnNumber: 13
            }, this),
            error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                lineNumber: 272,
                columnNumber: 17
            }, this) : null,
            draftAds && draftAds.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 16
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontWeight: 800,
                            marginBottom: 10,
                            fontSize: 14
                        },
                        children: "Preview — edit before saving"
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                        lineNumber: 289,
                        columnNumber: 21
                    }, this),
                    draftAds.map((ad, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                marginBottom: 16,
                                padding: 12,
                                borderRadius: 10,
                                border: "1px solid var(--border)",
                                background: "var(--surfaceElevated)"
                            },
                            children: [
                                draftAds.length > 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                    lineNumber: 310,
                                    columnNumber: 33
                                }, this) : null,
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: labelStyle,
                                    children: "Angle"
                                }, void 0, false, {
                                    fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                    lineNumber: 320,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    value: ad.angle,
                                    onChange: (e)=>patchAd(idx, "angle", e.target.value),
                                    rows: 2,
                                    style: {
                                        ...inputStyle,
                                        minHeight: 48
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                    lineNumber: 321,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: labelStyle,
                                    children: "Hook"
                                }, void 0, false, {
                                    fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                    lineNumber: 329,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    value: ad.hook,
                                    onChange: (e)=>patchAd(idx, "hook", e.target.value),
                                    rows: 2,
                                    style: {
                                        ...inputStyle,
                                        minHeight: 48
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                    lineNumber: 330,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: labelStyle,
                                    children: "Headline"
                                }, void 0, false, {
                                    fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                    lineNumber: 338,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    value: ad.headline,
                                    onChange: (e)=>patchAd(idx, "headline", e.target.value),
                                    rows: 2,
                                    style: {
                                        ...inputStyle,
                                        minHeight: 48
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                    lineNumber: 339,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: labelStyle,
                                    children: "Primary text"
                                }, void 0, false, {
                                    fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                    lineNumber: 347,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    value: ad.primaryText,
                                    onChange: (e)=>patchAd(idx, "primaryText", e.target.value),
                                    rows: 2,
                                    style: {
                                        ...inputStyle,
                                        minHeight: 48
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                    lineNumber: 348,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: labelStyle,
                                    children: "CTA"
                                }, void 0, false, {
                                    fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                    lineNumber: 356,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    value: ad.cta,
                                    onChange: (e)=>patchAd(idx, "cta", e.target.value),
                                    rows: 2,
                                    style: {
                                        ...inputStyle,
                                        minHeight: 48
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                    lineNumber: 357,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: labelStyle,
                                    children: "Visual prompt (Kie)"
                                }, void 0, false, {
                                    fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                                    lineNumber: 365,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
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
                                    lineNumber: 366,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, idx, true, {
                            fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                            lineNumber: 299,
                            columnNumber: 25
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                        lineNumber: 380,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
                lineNumber: 288,
                columnNumber: 17
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/app/jobs/[id]/ad-variation-panel.tsx",
        lineNumber: 102,
        columnNumber: 9
    }, this);
}
}),
"[project]/app/components/SaveImageButton.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SaveImageButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function buildFileName(downloadName) {
    const base = downloadName.replace(/\.(png|jpe?g|webp)$/i, "") || "sacredstatics-ad";
    return /\.(png|jpe?g|webp)$/i.test(downloadName) ? downloadName : `${base}.png`;
}
function SaveImageButton({ imageId, imageUrl, downloadName, compact = false }) {
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [lastError, setLastError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    async function handleSave() {
        if (!imageUrl?.trim() && !imageId) return;
        setBusy(true);
        setLastError(null);
        const fileName = buildFileName(downloadName);
        try {
            if (imageId?.trim()) {
                const u = new URL(`/api/ad-images/${encodeURIComponent(imageId)}/download`, window.location.origin);
                u.searchParams.set("filename", fileName);
                const res = await fetch(u.toString());
                if (!res.ok) {
                    const j = await res.json().catch(()=>null);
                    throw new Error((j && typeof j === "object" && "error" in j ? String(j.error) : null) || `Download failed (${res.status})`);
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
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Could not download image.";
            setLastError(msg);
        } finally{
            setBusy(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: compact ? undefined : {
            width: "100%"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                lineNumber: 94,
                columnNumber: 13
            }, this),
            lastError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 6,
                    fontSize: 11,
                    color: "var(--danger)",
                    lineHeight: 1.35
                },
                children: lastError
            }, void 0, false, {
                fileName: "[project]/app/components/SaveImageButton.tsx",
                lineNumber: 128,
                columnNumber: 17
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/SaveImageButton.tsx",
        lineNumber: 93,
        columnNumber: 9
    }, this);
}
}),
"[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdCollapsibleHeaderActions",
    ()=>AdCollapsibleHeaderActions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$SaveImageButton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/SaveImageButton.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$PendingSubmitButton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/PendingSubmitButton.tsx [app-ssr] (ecmascript)");
"use client";
;
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
function AdCollapsibleHeaderActions({ jobId, adId, generateAdImages, firstImageUrl, firstImageId, firstImageDownloadName }) {
    const hasImage = Boolean(firstImageUrl?.trim());
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                action: generateAdImages,
                style: {
                    display: "inline-flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 8
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "hidden",
                        name: "jobId",
                        value: jobId
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx",
                        lineNumber: 62,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "hidden",
                        name: "adId",
                        value: adId
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx",
                        lineNumber: 63,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$PendingSubmitButton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PendingSubmitButton"], {
                        label: "Generate Kie",
                        pendingLabel: "Generating images…",
                        style: {
                            ...btnSm,
                            background: "var(--accent)",
                            color: "#fff",
                            border: "1px solid rgba(124, 58, 237, 0.35)"
                        }
                    }, void 0, false, {
                        fileName: "[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx",
                        lineNumber: 64,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx",
                lineNumber: 53,
                columnNumber: 13
            }, this),
            hasImage && firstImageDownloadName ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$SaveImageButton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                imageId: firstImageId ?? undefined,
                imageUrl: firstImageUrl,
                downloadName: firstImageDownloadName,
                compact: true
            }, void 0, false, {
                fileName: "[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx",
                lineNumber: 76,
                columnNumber: 17
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                lineNumber: 83,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/jobs/[id]/ad-collapsible-header-actions.tsx",
        lineNumber: 42,
        columnNumber: 9
    }, this);
}
}),
"[project]/app/components/CopyToClipboardButton.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CopyToClipboardButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function CopyToClipboardButton({ text, label = "Copy" }) {
    const [copied, setCopied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    async function onCopy() {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            window.setTimeout(()=>setCopied(false), 1200);
        } catch  {
        // If clipboard is blocked, do nothing (user can still manually select/copy).
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactDOM; //# sourceMappingURL=react-dom.js.map
}),
"[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
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
const _appcallserver = __turbopack_context__.r("[project]/node_modules/next/dist/client/app-call-server.js [app-ssr] (ecmascript)");
const _appfindsourcemapurl = __turbopack_context__.r("[project]/node_modules/next/dist/client/app-find-source-map-url.js [app-ssr] (ecmascript)");
const _client = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-server-dom-turbopack-client.js [app-ssr] (ecmascript)"); //# sourceMappingURL=action-client-wrapper.js.map
}),
];

//# sourceMappingURL=_cbc3e90a._.js.map