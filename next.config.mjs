const nextConfig = {
  reactStrictMode: true,
  // Canonical domain: send legacy and www hosts to olfactivedna.com (SEO-safe 308).
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "fragrance-dna.vercel.app" }],
        destination: "https://olfactivedna.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.olfactivedna.com" }],
        destination: "https://olfactivedna.com/:path*",
        permanent: true,
      },
    ];
  },
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
    outputFileTracingIncludes: {
      "/studio": ["./data/generated/fragrancedna.sqlite"],
      "/studio/master-database": ["./data/generated/fragrancedna.sqlite"],
      "/api/studio/master-database/record": ["./data/generated/fragrancedna.sqlite"],
      "/api/test/user-dna-pool": ["./data/generated/fragrancedna.sqlite"],
      "/api/recommendations": ["./data/generated/fragrancedna.sqlite"],
      "/api/fragrances/search": ["./data/generated/fragrancedna.sqlite"],
      "/api/fragrances/brands": ["./data/generated/fragrancedna.sqlite"],
      "/api/downloads/user-flow-handoff": ["./docs/FRAGRANCEDNA_USER_FLOW_AND_NEON_HANDOFF_2026-10-19.json"],
      "/api/collection/catalog": ["./data/generated/fragrancedna.sqlite"],
      "/api/collection/import": ["./data/generated/fragrancedna.sqlite"],
    },
  },
};

export default nextConfig;
