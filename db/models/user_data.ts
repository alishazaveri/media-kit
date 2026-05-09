import mongoose, { Schema, Document } from "mongoose";

export interface IUserData extends Document {
  user_id: mongoose.Types.ObjectId;
  insights_id?: mongoose.Types.ObjectId;
  platform: string;
  draft_data: Record<string, any>;
  published_data: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

const UserDataSchema = new Schema<IUserData>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    insights_id: { type: Schema.Types.ObjectId, ref: "Insight" },
    platform: { type: String, required: true },
    draft_data: { type: Schema.Types.Mixed, default: {} },
    published_data: { type: Schema.Types.Mixed, default: {} },
  },
  {
    collection: "user_data",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

UserDataSchema.index({ user_id: 1, platform: 1 }, { unique: true });

export default mongoose.models.UserData ||
  mongoose.model<IUserData>("UserData", UserDataSchema);
