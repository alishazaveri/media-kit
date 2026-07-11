import mongoose, { Schema, Document } from "mongoose";

export interface IAdminUser extends Document {
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
  },
  {
    collection: "admin_users",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export default mongoose.models.AdminUser ||
  mongoose.model<IAdminUser>("AdminUser", AdminUserSchema);
