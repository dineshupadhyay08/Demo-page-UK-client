import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    SYMPTOM_FINDER_PREVIEW: String(process.env["VERCEL_ENV"] === "preview" ||
      (!process.env["VERCEL_ENV"] && process.env.NODE_ENV === "development")),
  },
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: { root: __dirname },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), geolocation=(), microphone=(), payment=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
