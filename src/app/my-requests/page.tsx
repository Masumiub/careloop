import type { Metadata } from "next";
import { MyRequestsClient } from "@/components/my-requests-client";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "My Requests",
  description: "Track, edit and manage your CareLoop support requests.",
};

export default function MyRequestsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Participant portal"
        title="My requests"
        description="Everything you've asked for, all in one place. Edit, cancel or follow along as our team picks things up."
      />
      <div className="mt-8">
        <MyRequestsClient />
      </div>
    </div>
  );
}
