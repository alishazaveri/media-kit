import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password_hash: string;
  username: string;
  plan_id?: mongoose.Types.ObjectId;
  profile_image_url?: string;
  data_refresh_interval_hours: number;
  last_data_refreshed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    plan_id: { type: Schema.Types.ObjectId, ref: "Plan" },
    profile_image_url: { type: String },
    data_refresh_interval_hours: { type: Number, default: 24 },
    last_data_refreshed_at: { type: Date },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
