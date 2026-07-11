import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminUserByEmail } from "@/db/admin_user.db";
import { signAdminToken, setAdminSessionCookie } from "@/lib/admin-session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const admin = await getAdminUserByEmail(email) as any;

    // Always run bcrypt compare to avoid timing attacks
    const DUMMY_HASH = "$2b$12$dummyhashfordummycomparisononlyXXXXXXXXXXXXXXXXXXXXXX";
    const valid = admin
      ? await bcrypt.compare(password, admin.password_hash)
      : (await bcrypt.compare(password, DUMMY_HASH), false);

    if (!admin || !valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = signAdminToken({
      adminId: admin._id.toString(),
      email: admin.email,
      name: admin.name,
    });

    const cookie = setAdminSessionCookie(token);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(cookie as any);
    return res;
  } catch (err) {
    console.error("POST /api/admin/auth/login:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
