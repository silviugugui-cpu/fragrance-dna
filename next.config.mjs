const nextConfig = {
  reactStrictMode: true,
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
