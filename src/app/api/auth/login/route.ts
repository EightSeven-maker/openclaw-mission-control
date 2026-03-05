import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

const TOKEN_COOKIE = "mc_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function tokensMatch(submitted: string, required: string): boolean {
  try {
    const a = Buffer.from(submitted);
    const b = Buffer.from(required);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const requiredToken = process.env.DASHBOARD_TOKEN;

  // No token configured → auth not required
  if (!requiredToken) {
    return NextResponse.json({ ok: true });
  }

  const body = await request.json().catch(() => ({})) as { token?: string };
  const submitted = String(body.token ?? "");

  if (!tokensMatch(submitted, requiredToken)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(TOKEN_COOKIE, requiredToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return response;
}
