import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);

const GUEST_ONLY = ["/login"];
const PROTECTED = ["/dashboard", "/settings"];

async function isAuthenticated(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("access_token")?.value;
  if (token) {
    try {
      await jwtVerify(token, secret);
      return true;
    } catch {}
  }
  // Verify refresh token signature before trusting it — presence alone is not enough
  const refreshToken = req.cookies.get("refresh_token")?.value;
  if (refreshToken) {
    try {
      await jwtVerify(refreshToken, refreshSecret);
      return true;
    } catch {}
  }
  return false;
}

function applyAuthGuards(
  req: NextRequest,
  pathname: string,
  authed: boolean,
): NextResponse | null {
  const sp = req.nextUrl.searchParams;
  const loginUrl = new URL("/login", req.url);
  const dashboardUrl = new URL("/dashboard", req.url);

  if (authed) {
    if (GUEST_ONLY.includes(pathname)) {
      return NextResponse.redirect(dashboardUrl);
    }
    // Logged-in users hitting bare /onboarding are trying to sign up again — send to dashboard.
    // Allow through if they have mid-flow params: ?step=, ?connected=, ?error=
    if (
      pathname === "/onboarding" &&
      !sp.has("step") &&
      !sp.has("connected") &&
      !sp.has("error")
    ) {
      return NextResponse.redirect(dashboardUrl);
    }
  } else {
    if (PROTECTED.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(loginUrl);
    }
    // Bare /onboarding is the signup page (public).
    // Any param (?step=, ?connected=, ?error=) means they're past signup → require auth.
    if (
      pathname === "/onboarding" &&
      (sp.has("step") || sp.has("connected") || sp.has("error"))
    ) {
      return NextResponse.redirect(loginUrl);
    }
  }

  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const GUARDED_ROUTES = ["/onboarding", "/login", "/dashboard", "/settings"];
  if (GUARDED_ROUTES.some((r) => pathname.startsWith(r))) {
    const authed = await isAuthenticated(req);
    const guard = applyAuthGuards(req, pathname, authed);
    if (guard) return guard;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
