import mongoose, { Schema, Document } from "mongoose";

export interface ITrialLink extends Document {
  token: string;
  label: string;
  duration_days: number;
  max_uses: number;
  uses_count: number;
  expires_at?: Date;
  created_at: Date;
}

const TrialLinkSchema = new Schema<ITrialLink>(
  {
    token: { type: String, required: true, unique: true },
    label: { type: String, default: "" },
    duration_days: { type: Number, required: true },
    max_uses: { type: Number, required: true },
    uses_count: { type: Number, default: 0 },
    expires_at: { type: Date },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

export default mongoose.models.TrialLink ||
  mongoose.model<ITrialLink>("TrialLink", TrialLinkSchema);
