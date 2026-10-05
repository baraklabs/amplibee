import type { NextConfig } from "next";

const ENV_FILE_NAMES: Record<string, string> = { development: "dev", production: "prod" };
const APP_ENV = process.env.APP_ENV ?? process.env.NODE_ENV ?? "development";
const envFileName = ENV_FILE_NAMES[APP_ENV] ?? APP_ENV;
try {
  process.loadEnvFile(`env/${envFileName}.env`);
} catch {
  // No file for this APP_ENV — expected when a deploy sets everything at the platform level.
}

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/channels", destination: "/platforms", permanent: true }];
  },
};

export default nextConfig;
