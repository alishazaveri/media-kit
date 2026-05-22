import mongoose, { Schema, Document } from "mongoose";

export interface ISubscription extends Document {
  user_id: mongoose.Types.ObjectId;
  plan_id: string;
  razorpay_subscription_id: string;
  razorpay_customer_id?: string;
  status?: string;
  current_period_start?: Date;
  current_period_end?: Date;
  cancel_at_cycle_end?: boolean;
  cancelled_at?: Date;
  last_payment_id?: string;
  webhook_last_processed_at?: Date;
  webhook_last_event_id?: string;
  meta?: any;
  created_at: Date;
  updated_at: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    plan_id: { type: String, required: true },
    razorpay_subscription_id: { type: String, required: true, index: true },
    razorpay_customer_id: { type: String },
    current_period_start: { type: Date },
    current_period_end: { type: Date, index: true },
    cancel_at_cycle_end: { type: Boolean, default: false },
    cancelled_at: { type: Date },
    last_payment_id: { type: String },
    webhook_last_processed_at: { type: Date },
    webhook_last_event_id: { type: String, index: true },
    status: { type: String, default: "created" },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.models.Subscription || mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
