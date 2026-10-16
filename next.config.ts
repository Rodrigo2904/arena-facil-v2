import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  webpack(config, { dev }) {
    if (dev) {
      // O banco SQLite (prisma/dev.db) muda a cada reserva; sem isso o servidor de
      // desenvolvimento recompila a cada escrita e requisições no meio falham.
      config.watchOptions = { ...config.watchOptions, ignored: ["**/node_modules/**", "**/.git/**", "**/prisma/**"] };
    }
    return config;
  },
};

export default nextConfig;
