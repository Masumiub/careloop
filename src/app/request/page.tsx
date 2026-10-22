import { Suspense } from "react";
import type { Metadata } from "next";
import { RequestForm, RequestPageSkeleton } from "@/components/request-form";

export const metadata: Metadata = {
  title: "Request help",
  description: "Request disability support services from CareLoop — personal care, transport, meals and more, matched within the hour.",
};

export default async function RequestPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-coral-600">Request support</p>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tight text-pine-950 sm:text-5xl">
          What do you need a hand with?
        </h1>
        <p className="mt-4 text-lg text-ink-500">
          Fill this out in under two minutes. A real coordinator reads every single request.
        </p>
      </div>
      <div className="mt-10">
        <Suspense fallback={<RequestPageSkeleton />}>
          <RequestForm initialService={service} />
        </Suspense>
      </div>
    </div>
  );
}
