import mongoose, { Schema, Document } from "mongoose";

export interface IAnalytics extends Document {
  user_id: mongoose.Types.ObjectId;
  date: Date;
  platform: string;
  account_id: mongoose.Types.ObjectId;
  data: Record<string, any>;
  reach: number;
  created_at: Date;
  updated_at: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    platform: { type: String, required: true },
    account_id: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    data: { type: Schema.Types.Mixed },
    reach: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.models.Analytics || mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);
