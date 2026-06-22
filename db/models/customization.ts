import mongoose, { Schema, Document } from "mongoose";

export type CustomizationStatus = "draft" | "published";

export interface ICustomization extends Document {
  theme_identifier: string;
  dark_mode: boolean;
  user_id: mongoose.Types.ObjectId;
  status: CustomizationStatus;
  created_at: Date;
  updated_at: Date;
}

const CustomizationSchema = new Schema<ICustomization>(
  {
    theme_identifier: { type: String, required: true, default: "default" },
    dark_mode: { type: Boolean, default: false },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["draft", "published"], required: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

CustomizationSchema.index({ user_id: 1, status: 1 }, { unique: true });

// Delete cached model so schema changes are always picked up after hot-reload
delete (mongoose.models as any)["Customization"];
export default mongoose.model<ICustomization>("Customization", CustomizationSchema);
