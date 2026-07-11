import { connectDB } from "@/db";
import AdminUser from "@/db/models/admin_user";

export async function createAdminUser(data: { name: string; email: string; password_hash: string }) {
  await connectDB();
  return AdminUser.create(data);
}

export async function getAdminUserByEmail(email: string) {
  await connectDB();
  return AdminUser.findOne({ email: { $regex: `^${email.trim()}$`, $options: "i" } }).lean();
}
