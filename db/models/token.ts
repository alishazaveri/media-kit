import mongoose, { Schema, Document } from "mongoose";

export interface IToken extends Document {
  user_id: mongoose.Types.ObjectId;
  token: string;
  type: string;
  platform?: string;
  account_id?: mongoose.Types.ObjectId;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

const TokenSchema = new Schema<IToken>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true },
    type: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
    },
    account_id: { type: Schema.Types.ObjectId, ref: "Account" },
    expires_at: { type: Date, required: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

export default mongoose.models.Token ||
  mongoose.model<IToken>("Token", TokenSchema);
