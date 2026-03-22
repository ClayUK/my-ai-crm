/**
 * Runs once per server process (Node). Surfaces misconfiguration early in logs.
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
    if (process.env.NEXT_RUNTIME !== "nodejs") return;

    const missing: string[] = [];
    if (!process.env.DATABASE_URL?.trim()) missing.push("DATABASE_URL");
    if (!process.env.ANTHROPIC_API_KEY?.trim()) missing.push("ANTHROPIC_API_KEY");
    if (!process.env.KIE_API_KEY?.trim()) missing.push("KIE_API_KEY");

    if (missing.length > 0) {
        console.error(
            `[my-ai-crm] Missing environment variables: ${missing.join(", ")}. ` +
                "API and database calls will fail until they are set on your host (e.g. Railway Variables)."
        );
    }
}
