import mongoose, { Schema, Document } from "mongoose";

export interface IInsight extends Document {
  user_id: mongoose.Types.ObjectId;
  social_channel_id: mongoose.Types.ObjectId;
  platform: string;
  data: Record<string, any>;
  reach: number;
  created_at: Date;
  updated_at: Date;
}

const InsightSchema = new Schema<IInsight>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    social_channel_id: { type: Schema.Types.ObjectId, ref: "SocialChannel", required: true },
    platform: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
    reach: { type: Number, default: 0 },
  },
  {
    collection: "insights",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

InsightSchema.index(
  { user_id: 1, social_channel_id: 1, platform: 1 },
  { unique: true }
);

export default mongoose.models.Insight ||
  mongoose.model<IInsight>("Insight", InsightSchema);
