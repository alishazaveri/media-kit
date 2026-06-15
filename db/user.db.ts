import { connectDB } from "@/db";
import User from "@/db/models/user";
import { Types } from "mongoose";

type UserCreateInput = {
  name: string;
  email: string;
  username: string;
  password_hash: string;
};

type UserUpdateInput = Partial<{
  name: string;
  email: string;
  username: string;
  password_hash: string;
  plan_id: Types.ObjectId;
  profile_image_url: string;
  data_refresh_interval_hours: number;
  last_data_refreshed_at: Date;
}>;

export async function createUser(data: UserCreateInput) {
  await connectDB();
  return User.create(data);
}

export async function getUserById(id: string) {
  await connectDB();
  return User.findById(id).lean();
}

export async function getUserByEmail(email: string) {
  await connectDB();
  return User.findOne({ email }).lean();
}

export async function getUserByUsername(username: string) {
  await connectDB();
  return User.findOne({ username }).lean();
}

export async function getAllUsers() {
  await connectDB();
  return User.find().lean();
}

export async function updateUser(id: string, updates: UserUpdateInput) {
  await connectDB();
  return User.findByIdAndUpdate(id, updates, { new: true }).lean();
}

export async function deleteUser(id: string) {
  await connectDB();
  return User.findByIdAndDelete(id);
}

export async function getUsersDueForRefresh() {
  await connectDB();
  const now = new Date();
  return User.find({
    $or: [
      { last_data_refreshed_at: { $exists: false } },
      { last_data_refreshed_at: null },
      {
        $expr: {
          $lt: [
            "$last_data_refreshed_at",
            {
              $subtract: [
                now,
                { $multiply: ["$data_refresh_interval_hours", 3600000] },
              ],
            },
          ],
        },
      },
    ],
  }).lean();
}
