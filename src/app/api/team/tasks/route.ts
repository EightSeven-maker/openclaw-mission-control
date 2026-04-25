import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Mock task data — replace with real gateway task integration later
const MOCK_TASKS = [
  { id: "1", title: "Review competitor analysis", status: "pending", assignedAt: Date.now() - 86400000 },
  { id: "2", title: "Draft week 1 content plan", status: "in_progress", assignedAt: Date.now() - 43200000 },
  { id: "3", title: "Analyze Topstep pricing changes", status: "completed", assignedAt: Date.now() - 172800000 },
];

export async function GET(request: NextRequest) {
  const agentId = request.nextUrl.searchParams.get("agentId") || "jarvis";

  const tasks = MOCK_TASKS.map((t) => ({
    id: t.id,
    agentId,
    title: t.title,
    status: t.status,
    assignedAt: t.assignedAt,
  }));

  return NextResponse.json({ tasks });
}