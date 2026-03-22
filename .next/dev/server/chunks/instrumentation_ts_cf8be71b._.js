module.exports = [
"[project]/instrumentation.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Runs once per server process (Node). Surfaces misconfiguration early in logs.
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */ __turbopack_context__.s([
    "register",
    ()=>register
]);
async function register() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const missing = [];
    if (!process.env.DATABASE_URL?.trim()) missing.push("DATABASE_URL");
    if (!process.env.ANTHROPIC_API_KEY?.trim()) missing.push("ANTHROPIC_API_KEY");
    if (!process.env.KIE_API_KEY?.trim()) missing.push("KIE_API_KEY");
    if (missing.length > 0) {
        console.error(`[my-ai-crm] Missing environment variables: ${missing.join(", ")}. ` + "API and database calls will fail until they are set on your host (e.g. Railway Variables).");
    }
}
}),
];

//# sourceMappingURL=instrumentation_ts_cf8be71b._.js.map