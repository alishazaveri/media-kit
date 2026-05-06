import mongoose, { Schema, Document } from "mongoose";

export interface IAccount extends Document {
  user_id: mongoose.Types.ObjectId;
  platform: string;
  platform_user_id: string;
  platform_username: string;
  followers: number;
  following: number;
  media_count: number;
  created_at: Date;
}

const AccountSchema = new Schema<IAccount>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    platform: {
      type: String,
      required: true,
    },
    platform_user_id: { type: String, required: true },
    platform_username: { type: String },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    media_count: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

export default mongoose.models.Account ||
  mongoose.model<IAccount>("Account", AccountSchema);
