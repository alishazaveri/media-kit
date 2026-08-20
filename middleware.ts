import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);

async function isAdminAuthenticated(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("admin_session")?.value;
  if (!token) return false;
  try {
    const adminSecret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET);
    await jwtVerify(token, adminSecret);
    return true;
  } catch {
    return false;
  }
}

const GUEST_ONLY = ["/app/login"];
const PROTECTED = ["/app/dashboard", "/settings"];

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
  const loginUrl = new URL("/app/login", req.url);
  const dashboardUrl = new URL("/app/dashboard", req.url);

  if (authed) {
    if (GUEST_ONLY.includes(pathname)) {
      return NextResponse.redirect(dashboardUrl);
    }
    // Logged-in users hitting bare /onboarding are trying to sign up again — send to dashboard.
    // Allow through if they have mid-flow params: ?step=, ?connected=, ?error=
    if (
      pathname === "/app/onboarding" &&
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
      pathname === "/app/onboarding" &&
      (sp.has("step") || sp.has("connected") || sp.has("error"))
    ) {
      return NextResponse.redirect(loginUrl);
    }
  }

  return null;
}

function applyCountryHeader(req: NextRequest): NextResponse {
  const country = req.headers.get("x-vercel-ip-country") ?? "";

  // Allow ?country= override in non-production for testing
  const override = process.env.NODE_ENV !== "production"
    ? req.nextUrl.searchParams.get("country")
    : null;

  const value = override ?? country;
  const headers = new Headers(req.headers);
  headers.set("x-kloot-country", value);
  const response = NextResponse.next({ request: { headers } });

  // Persist referral code as a 30-day cookie from any page that carries ?ref=
  const ref = req.nextUrl.searchParams.get("ref");
  if (ref && /^[a-zA-Z0-9_.-]{1,50}$/.test(ref)) {
    response.cookies.set("kloot_ref", ref, {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin route protection
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    const authed = await isAdminAuthenticated(req);
    if (!authed) return NextResponse.redirect(new URL("/admin/login", req.url));
    return NextResponse.next();
  }

  const GUARDED_ROUTES = ["/app/onboarding", "/app/login", "/app/dashboard", "/settings"];
  if (GUARDED_ROUTES.some((r) => pathname.startsWith(r))) {
    const authed = await isAuthenticated(req);
    const guard = applyAuthGuards(req, pathname, authed);
    if (guard) return guard;
  }

  return applyCountryHeader(req);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
