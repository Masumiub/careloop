import type { ReactNode } from "react";
import type { Metadata } from "next";
import { DashboardTabs } from "@/components/dashboard-tabs";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Staff Dashboard",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Staff & admin"
        title="Coordinator dashboard"
        description="The live pulse of every support request — triage, assign workers, and keep participants in the loop."
      />
      <DashboardTabs />
      <div className="mt-6">{children}</div>
    </div>
  );
}
