import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { modelInclude, serializeModel } from "@/lib/models";
import ModelCard from "@/components/ModelCard";

export default function LabDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-slate-200" />}>
      <LabDetail params={params} />
    </Suspense>
  );
}

async function LabDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lab = await prisma.lab.findUnique({
    where: { slug },
    include: {
      models: { include: modelInclude, orderBy: { releaseDate: "desc" } },
    },
  });
  if (!lab) notFound();

  const models = lab.models.map((m) => {
    const s = serializeModel(m);
    return { ...s, releaseDate: s.releaseDate.toISOString() };
  });

  return (
    <div className="space-y-8">
      <nav className="text-sm text-slate-500">
        <Link href="/labs" className="hover:text-indigo-600">Labs</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800">{lab.name}</span>
      </nav>

      <header className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-2xl font-bold text-indigo-600">
          {lab.name.charAt(0)}
        </span>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">{lab.name}</h1>
          <p className="text-slate-500">
            {lab.country ?? "Unknown location"} &middot; {models.length} model{models.length === 1 ? "" : "s"}
          </p>
          <p className="mt-3 max-w-2xl text-slate-700">{lab.description}</p>
        </div>
        {lab.website && (
          <a
            href={lab.website}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Visit website
          </a>
        )}
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Models &amp; releases</h2>
        {models.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            No models listed for this lab yet.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {models.map((m) => (
              <ModelCard key={m.id} model={m} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}