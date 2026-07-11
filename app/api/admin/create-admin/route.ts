import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminUser, getAdminUserByEmail } from "@/db/admin_user.db";

const SALT_ROUNDS = 12;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "name, email and password are required" }, { status: 400 });
    }

    const existing = await getAdminUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Admin with this email already exists" }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const admin = await createAdminUser({ name, email: email.trim().toLowerCase(), password_hash });

    return NextResponse.json({ data: { id: admin._id, name: admin.name, email: admin.email } }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/create-admin:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
