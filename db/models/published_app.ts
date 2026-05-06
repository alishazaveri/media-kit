import mongoose, { Schema, Document } from "mongoose";

export interface IPublishedApp extends Document {
  user_id: mongoose.Types.ObjectId;
  username_slug: string;
  status: string;
  subscription_id?: mongoose.Types.ObjectId;
  customization_snapshot?: Record<string, any>;
  published_at?: Date;
  updated_at: Date;
}

const PublishedAppSchema = new Schema<IPublishedApp>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    username_slug: { type: String, required: true, unique: true },
    status: {
      type: String,
      default: "draft",
    },
    subscription_id: { type: Schema.Types.ObjectId, ref: "Subscription" },
    customization_snapshot: { type: Schema.Types.Mixed },
    published_at: { type: Date },
  },
  { timestamps: { createdAt: false, updatedAt: "updated_at" } },
);

export default mongoose.models.PublishedApp ||
  mongoose.model<IPublishedApp>("PublishedApp", PublishedAppSchema);
