import type { NextConfig } from "next";

/**
 * Comma- or space-separated origins for Server Actions CSRF checks when the
 * app is served under multiple public URLs (e.g. Railway default + custom domain).
 * Example: https://app.up.railway.app,https://ads.example.com
 * Set at build time on the platform so it matches your deployment hostnames.
 */
const serverActionsAllowedOrigins = (process.env.SERVER_ACTIONS_ALLOWED_ORIGINS ?? "")
  .split(/[\s,]+/)
  .map((s) => s.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@prisma/client"],
  experimental: {
    serverActions: {
      bodySizeLimit: "32mb",
      ...(serverActionsAllowedOrigins.length > 0
        ? { allowedOrigins: serverActionsAllowedOrigins }
        : {}),
    },
  },
};

export default nextConfig;
