import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "sacrament-cymbal-language.ngrok-free.dev",
    "app.localhost",
    "admin.localhost",
  ],
};

export default nextConfig;
