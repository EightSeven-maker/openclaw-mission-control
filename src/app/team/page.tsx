import type { Metadata } from "next";
import { TeamView } from "@/components/team-view";

export const metadata: Metadata = {
  title: "87 Team — 87 Command Center",
  description: "Meet the 87 PropFirmMart team",
};

export default function TeamPage() {
  return <TeamView />;
}