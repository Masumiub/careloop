import type { Metadata } from "next";
import { ParticipantsClient } from "@/components/participants-client";

export const metadata: Metadata = {
  title: "Participants",
};

export default function ParticipantsPage() {
  return <ParticipantsClient />;
}
