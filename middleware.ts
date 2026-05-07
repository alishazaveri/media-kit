import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

const APP_PROTECTED = [
  "/dashboard",
  "/settings",
  "/connect-instagram",
  "/syncing",
  "/connected",
  "/activate",
];

async function isAuthenticated(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("access_token")?.value;
  if (token) {
    try {
      await jwtVerify(token, secret);
      return true;
    } catch {}
  }
  return req.cookies.has("refresh_token");
}

function getSubdomain(host: string): string | null {
  const hostWithoutPort = host.split(":")[0];
  const parts = hostWithoutPort.split(".");
  const isLocalhost =
    hostWithoutPort === "localhost" || hostWithoutPort.endsWith(".localhost");

  if (isLocalhost) return parts.length >= 2 ? parts[0] : null;
  return parts.length >= 3 ? parts[0] : null;
}

export async function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const { pathname } = req.nextUrl;
  const sub = getSubdomain(host);

  // ── Creator app subdomain (app.localhost:3000 / app.domain.com) ──
  if (sub === "app") {
    // if (APP_PROTECTED.some((p) => pathname.startsWith(p))) {
    //   if (!(await isAuthenticated(req))) {
    //     return NextResponse.redirect(new URL("/signup", req.url));
    //   }
    // }
    const url = req.nextUrl.clone();
    url.pathname = `/app${pathname === "/" ? "/onboarding" : pathname}`;
    return NextResponse.rewrite(url);
  }

  // ── Admin subdomain ──
  if (sub === "admin") {
    const url = req.nextUrl.clone();
    url.pathname = `/admin${pathname}`;
    return NextResponse.rewrite(url);
  }

  // ── Creator public profile subdomain (username.domain.com) ──
  if (sub && sub !== "www") {
    const url = req.nextUrl.clone();
    url.pathname = `/username/${sub}`;
    return NextResponse.rewrite(url);
  }

  // ── Dev fallback: no subdomain but hitting app routes directly ──
  // Allows localhost:3000/onboarding, /login, /dashboard to work without app. subdomain
  const APP_ROUTES = ["/onboarding", "/login", "/dashboard", "/settings"];
  if (APP_ROUTES.some((r) => pathname.startsWith(r))) {
    const url = req.nextUrl.clone();
    url.pathname = `/app${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
