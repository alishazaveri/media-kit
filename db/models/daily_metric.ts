import mongoose, { Schema, Document } from "mongoose";

export interface IDailyMetric extends Document {
  type: string;
  date: Date;
  subscriptions?: {
    activeINR: number;
    activeUSD: number;
    newINR: number;
    newUSD: number;
    cancelledINR: number;
    cancelledUSD: number;
  };
  created_at: Date;
  updated_at: Date;
}

const DailyMetricSchema = new Schema<IDailyMetric>(
  {
    type: { type: String, required: true },
    date: { type: Date, required: true },
    subscriptions: {
      activeINR: { type: Number },
      activeUSD: { type: Number },
      newINR: { type: Number },
      newUSD: { type: Number },
      cancelledINR: { type: Number },
      cancelledUSD: { type: Number },
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

DailyMetricSchema.index({ type: 1, date: 1 }, { unique: true });

export default mongoose.models.DailyMetric ||
  mongoose.model<IDailyMetric>("DailyMetric", DailyMetricSchema);
