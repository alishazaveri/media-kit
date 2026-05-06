import config from "@/lib/config";
import mongoose from "mongoose";

const MONGODB_URI = config.MONGODB_URI as string;

if (!MONGODB_URI)
  throw new Error("MONGODB_URI is not defined in environment variables");

let cached = (global as any).__mongoose ?? { conn: null, promise: null };
(global as any).__mongoose = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
