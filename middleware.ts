import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_PREFIXES = ["/dashboard", "/settings", "/connect-instagram"];

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const accessToken = req.cookies.get("access_token")?.value;

  if (accessToken) {
    try {
      await jwtVerify(accessToken, secret);
      return NextResponse.next();
    } catch {
      // expired — fall through
    }
  }

  // Refresh token exists — let the Server Component call getSession() to handle refresh
  if (req.cookies.has("refresh_token")) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/connect-instagram/:path*"],
};
