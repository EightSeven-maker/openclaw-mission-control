import { NextRequest, NextResponse } from "next/server";

const TOKEN_COOKIE = "mc_session";

const PUBLIC_API_PATHS = new Set(["/api/auth/login", "/api/auth/logout"]);

function isPublic(pathname: string): boolean {
  if (pathname === "/login" || pathname === "/favicon.ico" || pathname === "/manifest.json") {
    return true;
  }
  if (PUBLIC_API_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/_next/") || pathname.startsWith("/icons/")) return true;
  return false;
}

/** Constant-time string comparison (Edge-runtime safe — no Node.js crypto). */
function safeEqual(a: string, b: string): boolean {
  const aLen = a.length;
  const bLen = b.length;
  // Always iterate over `a` to avoid length-based timing leak
  let diff = aLen ^ bLen;
  for (let i = 0; i < aLen; i++) {
    diff |= a.charCodeAt(i) ^ (b.charCodeAt(i % bLen) || 0);
  }
  return diff === 0;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Forward pathname so the root layout can detect the login page
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const requiredToken = process.env.DASHBOARD_TOKEN;

  // No token configured → open access (default localhost-only mode)
  if (!requiredToken) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (isPublic(pathname)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Accept Authorization: Bearer <token> header
  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader.startsWith("Bearer ") && safeEqual(authHeader.slice(7), requiredToken)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Accept session cookie
  const cookieToken = request.cookies.get(TOKEN_COOKIE)?.value ?? "";
  if (cookieToken && safeEqual(cookieToken, requiredToken)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // API routes → 401
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Page routes → redirect to login
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
