const config = {
  APP_ID: process.env.INSTAGRAM_APP_ID || "",
  APP_SECRET: process.env.INSTAGRAM_APP_SECRET || "",
  REDIRECT_URL: process.env.REDIRECT_URI || "",
  PUBLIC_URL: process.env.NEXT_PUBLIC_APP_URL || "",
  MONGODB_URI: process.env.MONGODB_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",

  // Subdomain URLs — set via env, fallback to localhost subdomains for dev
  CREATOR_APP_URL: process.env.NEXT_PUBLIC_CREATOR_APP_URL || "http://app.localhost:3000",
  ADMIN_URL: process.env.NEXT_PUBLIC_ADMIN_URL || "http://admin.localhost:3000",
};

export default config;
