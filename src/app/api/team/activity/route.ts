import { NextRequest, NextResponse } from "next/server";
import { gatewayCall } from "@/lib/openclaw";

export const dynamic = "force-dynamic";

interface Session {
  sessionId?: string;
  createdAt?: number;
  lastActive?: number;
  status?: string;
}

export async function GET(request: NextRequest) {
  const agentId = request.nextUrl.searchParams.get("agentId");

  if (!agentId) {
    return NextResponse.json(
      { error: "agentId is required" },
      { status: 400 }
    );
  }

  try {
    const sessions = await gatewayCall<Session[]>("sessions.list", { agentId }, 10000).catch(() => []);

    const activity = (sessions || []).slice(0, 10).map((session, idx) => ({
      id: session.sessionId || `session-${idx}`,
      agentId,
      action: session.status === "running" ? "Active session" : "Session ended",
      timestamp: session.lastActive || session.createdAt || Date.now(),
      summary: "Session " + (session.status || "unknown") + " - " + new Date(session.createdAt || Date.now()).toLocaleDateString(),
    }));

    return NextResponse.json({ activity });
  } catch (error) {
    console.error("Team activity API error:", error);
    return NextResponse.json({ activity: [] });
  }
}