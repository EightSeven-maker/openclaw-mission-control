import { NextResponse } from "next/server";

const TOKEN_COOKIE = "mc_session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(TOKEN_COOKIE);
  return response;
}
