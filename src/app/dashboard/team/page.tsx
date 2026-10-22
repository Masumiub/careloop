import type { Metadata } from "next";
import { TeamClient } from "@/components/team-client";

export const metadata: Metadata = {
  title: "Our Team",
};

export default function TeamPage() {
  return <TeamClient />;
}
