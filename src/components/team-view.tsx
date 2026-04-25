"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  Activity,
  CheckCircle2,
  Clock,
  ChevronRight,
  RefreshCw,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionBody, SectionHeader, SectionLayout } from "@/components/section-layout";

/* ─── Types ───────────────────────────────────────── */

interface TeamMember {
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

interface ActivityEntry {
  id: string;
  agentId: string;
  action: string;
  timestamp: number;
  summary: string;
}

interface Task {
  id: string;
  agentId: string;
  title: string;
  status: "pending" | "in_progress" | "completed";
  assignedAt: number;
}

/* ─── Helpers ─────────────────────────────────────── */

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-400",
  idle: "bg-amber-400",
  unknown: "bg-zinc-500",
};

function formatAgo(ms: number | null): string {
  if (!ms) return "Never";
  const diff = Date.now() - ms;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

/* ─── Sub-components ──────────────────────────────── */

function MemberCard({
  member,
  selected,
  onClick,
}: {
  member: TeamMember;
  selected: boolean;
  onClick: () => void;
}) {
  const sc = STATUS_COLORS[member.status] || STATUS_COLORS.unknown;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border p-4 text-left transition-all",
        "border-stone-200 dark:border-[#2d353e]",
        "hover:border-[var(--accent-brand,theme)] hover:shadow-sm",
        selected && [
          "border-[var(--accent-brand,theme)]",
          "bg-[var(--accent-brand-subtle,theme)]",
          "shadow-sm",
        ]
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-stone-100 dark:bg-[#1a2026] text-xl">
          {member.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-stone-900 dark:text-[#f5f7fa]">{member.name}</h3>
            <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", sc)} />
          </div>
          <p className="truncate text-sm text-stone-500 dark:text-[#a8b0ba]">{member.role}</p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-stone-400 dark:text-[#7a8591]" />
      </div>
    </button>
  );
}

function ActivityItem({ entry }: { entry: ActivityEntry }) {
  return (
    <div className="flex gap-3 py-3">
      <div className="mt-0.5 shrink-0">
        <Activity className="h-4 w-4 text-stone-400 dark:text-[#7a8591]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-stone-700 dark:text-[#e0e6ed]">{entry.summary}</p>
        <p className="text-xs text-stone-400 dark:text-[#7a8591]">{formatAgo(entry.timestamp)}</p>
      </div>
    </div>
  );
}

function TaskItem({ task }: { task: Task }) {
  const icons = {
    pending: <Clock className="h-3.5 w-3.5 text-stone-400 dark:text-[#7a8591]" />,
    in_progress: <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400" />,
    completed: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />,
  };
  return (
    <div className="flex items-center gap-3 py-3">
      {icons[task.status]}
      <p className="flex-1 text-sm text-stone-700 dark:text-[#e0e6ed]">{task.title}</p>
    </div>
  );
}

function DetailPanel({
  member,
  activity,
  tasks,
  loading,
}: {
  member: TeamMember;
  activity: ActivityEntry[];
  tasks: Task[];
  loading: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-stone-100 dark:bg-[#1a2026] text-2xl">
          {member.emoji}
        </div>
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-[#f5f7fa]">{member.name}</h2>
          <p className="text-sm text-stone-500 dark:text-[#a8b0ba]">{member.role}</p>
          {member.reportsTo && (
            <p className="mt-1 text-xs text-stone-400 dark:text-[#7a8591]">
              Reports to: <span className="font-medium capitalize text-stone-600 dark:text-[#c4cdd8]">{member.reportsTo}</span>
            </p>
          )}
        </div>
      </div>

      {/* Status row */}
      <div className="flex items-center gap-2 text-sm">
        <span className={cn("h-2.5 w-2.5 rounded-full", STATUS_COLORS[member.status] || STATUS_COLORS.unknown)} />
        <span className="font-medium capitalize text-stone-700 dark:text-[#e0e6ed]">{member.status}</span>
        <span className="text-stone-400 dark:text-[#7a8591]">· Last active: {formatAgo(member.lastActive)}</span>
      </div>

      {/* Skills */}
      {member.skills.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-[#7a8591]">Skills</h3>
          <div className="flex flex-wrap gap-1.5">
            {member.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 dark:bg-[#1a2026] dark:text-[#c4cdd8]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Activity */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-[#e0e6ed]">
          <Activity className="h-4 w-4" />
          Recent Activity
        </h3>
        {loading ? (
          <p className="text-sm text-stone-400 dark:text-[#7a8591]">Loading...</p>
        ) : activity.length === 0 ? (
          <p className="text-sm text-stone-400 dark:text-[#7a8591]">No recent activity</p>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-[#2d353e] border-t border-stone-100 dark:border-[#2d353e]">
            {activity.slice(0, 5).map((a) => (
              <ActivityItem key={a.id} entry={a} />
            ))}
          </div>
        )}
      </div>

      {/* Tasks */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-[#e0e6ed]">
          <CheckCircle2 className="h-4 w-4" />
          Tasks
        </h3>
        {loading ? (
          <p className="text-sm text-stone-400 dark:text-[#7a8591]">Loading...</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-stone-400 dark:text-[#7a8591]">No tasks assigned</p>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-[#2d353e] border-t border-stone-100 dark:border-[#2d353e]">
            {tasks.slice(0, 5).map((t) => (
              <TaskItem key={t.id} task={t} />
            ))}
          </div>
        )}
      </div>

      {/* Chat button */}
      <a
        href={`/chat?agent=${member.id}`}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg",
          "bg-[var(--accent-brand,#18181b)] px-4 py-2.5",
          "font-medium text-white transition-opacity hover:opacity-90"
        )}
      >
        <Bot className="h-4 w-4" />
        Chat with {member.name}
      </a>
    </div>
  );
}

/* ─── Main Export ─────────────────────────────────── */

export function TeamView() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const selectedMember = members.find((m) => m.id === selectedId) ?? null;

  /* Fetch team members on mount */
  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch("/api/team/members");
        const data = await res.json();
        const list: TeamMember[] = data.members ?? [];
        setMembers(list);
        if (list.length > 0) {
          setSelectedId(list[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch team members:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, []);

  /* Fetch activity + tasks when selection changes */
  useEffect(() => {
    if (!selectedId) return;

    async function fetchDetails() {
      setDetailLoading(true);
      try {
        const [activityRes, tasksRes] = await Promise.all([
          fetch(`/api/team/activity?agentId=${selectedId}`),
          fetch(`/api/team/tasks?agentId=${selectedId}`),
        ]);
        const [activityData, tasksData] = await Promise.all([
          activityRes.json(),
          tasksRes.json(),
        ]);
        setActivity(activityData.activity ?? []);
        setTasks(tasksData.tasks ?? []);
      } catch (error) {
        console.error("Failed to fetch member details:", error);
      } finally {
        setDetailLoading(false);
      }
    }
    fetchDetails();
  }, [selectedId]);

  return (
    <SectionLayout>
      <SectionHeader
        title="Team Management"
        description={`${members.length} PropFirmMart team members`}
      />
      <SectionBody>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-stone-400 dark:text-[#7a8591]" />
          </div>
        ) : (
          <div className="flex h-full gap-6">
            {/* Member Grid — left column */}
            <div className="w-80 shrink-0 space-y-3 overflow-y-auto">
              <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-stone-500 dark:text-[#a8b0ba]">
                <Users className="h-4 w-4" />
                Team Members ({members.length})
              </div>
              {members.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  selected={member.id === selectedId}
                  onClick={() => setSelectedId(member.id)}
                />
              ))}
            </div>

            {/* Detail Panel — right column */}
            <div className="flex-1 overflow-y-auto">
              {selectedMember ? (
                <div className="rounded-xl border border-stone-200 dark:border-[#2d353e] bg-white dark:bg-[#14171a] p-6">
                  <DetailPanel
                    member={selectedMember}
                    activity={activity}
                    tasks={tasks}
                    loading={detailLoading}
                  />
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center text-stone-400 dark:text-[#7a8591]">
                  Select a team member to view details
                </div>
              )}
            </div>
          </div>
        )}
      </SectionBody>
    </SectionLayout>
  );
}