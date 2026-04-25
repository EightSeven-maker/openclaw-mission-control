/**
 * Primary OpenClaw client — all server-side code should import from here.
 *
 * Routes every call through the unified OpenClawClient which selects the
 * best transport automatically (HTTP to Gateway when available, CLI
 * subprocess as fallback). Works on Mac, Linux, and Docker.
 *
 * Internal modules (transports, openclaw-cli.ts) should NOT be imported
 * directly from API routes or lib helpers.
 */

import { getClient } from "./openclaw-client";
import type { RunCliResult } from "./openclaw-cli";

export type { RunCliResult } from "./openclaw-cli";
export { parseJsonFromCliOutput } from "./openclaw-cli";

export async function runCli(
  args: string[],
  timeout = 15000,
  stdin?: string,
): Promise<string> {
  const client = await getClient();
  return client.run(args, timeout, stdin);
}

export async function runCliJson<T>(
  args: string[],
  timeout = 15000,
): Promise<T> {
  const client = await getClient();
  return client.runJson<T>(args, timeout);
}

export async function runCliCaptureBoth(
  args: string[],
  timeout = 15000,
): Promise<RunCliResult> {
  const client = await getClient();
  return client.runCapture(args, timeout);
}

export async function gatewayCall<T>(
  method: string,
  params?: Record<string, unknown>,
  timeout = 15000,
): Promise<T> {
  const client = await getClient();
  return client.gatewayRpc<T>(method, params, timeout);
}

// ── Team Management Types ────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  emoji: string;
  role: string;
  reportsTo: string | null;
  status: "active" | "idle" | "unknown";
  lastActive: number | null;
  skills: string[];
  workspace: string;
  agentDir: string;
}

export interface TeamActivity {
  id: string;
  agentId: string;
  action: string;
  timestamp: number;
  summary: string;
}

export interface TeamTask {
  id: string;
  agentId: string;
  title: string;
  status: "pending" | "in_progress" | "completed";
  assignedAt: number;
}

// ── Team Helpers ───────────────────────────────────

const TEAM_CONFIG: Omit<TeamMember, "status" | "lastActive" | "workspace" | "agentDir">[] = [
  { id: "karan", name: "Karan", emoji: "👑", role: "CEO/Founder", reportsTo: null, skills: ["leadership"] },
  { id: "henry", name: "Henry", emoji: "🔍", role: "Quality & Strategy", reportsTo: "jarvis", skills: ["market-research", "quality-review"] },
  { id: "jarvis", name: "Jarvis", emoji: "🛠️", role: "CTO & COO", reportsTo: "karan", skills: ["orchestration", "task-management"] },
  { id: "piper", name: "Piper", emoji: "✍️", role: "Content Lead", reportsTo: "jarvis", skills: ["propfirmmart-social", "content-creation"] },
  { id: "quinn", name: "Quinn", emoji: "📊", role: "SEO Strategist", reportsTo: "jarvis", skills: ["seo", "content-creation"] },
  { id: "nova", name: "Nova", emoji: "📱", role: "Social Media", reportsTo: "piper", skills: ["propfirmmart-social"] },
  { id: "liam", name: "Liam", emoji: "🎨", role: "Frontend Specialist", reportsTo: "jarvis", skills: ["frontend-design"] },
  { id: "lucas", name: "Lucas", emoji: "⚙️", role: "Backend & Automation", reportsTo: "jarvis", skills: ["automation", "backend-patterns"] },
  { id: "noah", name: "Noah", emoji: "📈", role: "Data Research", reportsTo: "jarvis", skills: ["database-lookup", "research-lookup"] },
];

/**
 * Get all 9 PropFirmMart team members.
 * Status/workspace/agentDir are filled in at runtime by the API route from gateway data.
 */
export function getTeamMembers(): Omit<TeamMember, "status" | "lastActive" | "workspace" | "agentDir">[] {
  return TEAM_CONFIG;
}

/**
 * Get a single team member by ID.
 */
export function getTeamMember(id: string): Omit<TeamMember, "status" | "lastActive" | "workspace" | "agentDir"> | undefined {
  return TEAM_CONFIG.find(m => m.id === id);
}
