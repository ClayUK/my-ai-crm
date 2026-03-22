import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Donation reference images are posted via Server Actions; default ~1mb causes
  // "An unexpected response was received from the server" when uploads are larger.
  experimental: {
    serverActions: {
      bodySizeLimit: "32mb",
    },
  },
};

export default nextConfig;
