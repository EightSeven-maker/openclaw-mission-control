import { NextResponse } from "next/server";
import { getTeamMembers } from "@/lib/openclaw";
import { fetchConfig, extractAgentsList } from "@/lib/gateway-config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const teamConfig = getTeamMembers();
    const configData = await fetchConfig();
    const agents = extractAgentsList(configData);

    // Merge static team config with live gateway status
    const members = teamConfig.map((member) => {
      const agent = agents.find((a) => a.id === member.id);
      return {
        ...member,
        status: agent?.heartbeat ? "active" : "idle",
        lastActive: agent?.heartbeat ? Date.now() : null,
        workspace: agent?.workspace || "",
        agentDir: agent?.workspace ? `${agent.workspace}/.openclaw/agents/${member.id}` : "",
      };
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Team members API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}