import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "AI Labs | OneAtlas" };

export default function LabsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">AI labs</h1>
      <p className="text-sm text-slate-500">Companies and research labs building AI models.</p>
      <Suspense fallback={<GridSkeleton />}>
        <LabsGrid />
      </Suspense>
    </div>
  );
}

async function LabsGrid() {
  await connection();
  const labs = await prisma.lab.findMany({
    include: { _count: { select: { models: true } } },
    orderBy: { name: "asc" },
  });

  if (labs.length === 0) {
    return <p className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">No labs yet.</p>;
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {labs.map((lab) => (
        <Link
          key={lab.id}
          href={`/labs/${lab.slug}`}
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-600">
              {lab.name.charAt(0)}
            </span>
            <div className="min-w-0">
              <h2 className="truncate font-semibold text-slate-900 group-hover:text-indigo-600">{lab.name}</h2>
              <p className="text-sm text-slate-500">{lab.country ?? "\u2014"}</p>
            </div>
          </div>
          <p className="mt-3 line-clamp-2 text-sm text-slate-600">{lab.description}</p>
          <p className="mt-4 text-sm font-medium text-indigo-600">
            {lab._count.models} model{lab._count.models === 1 ? "" : "s"} &rarr;
          </p>
        </Link>
      ))}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-40 animate-pulse rounded-xl bg-slate-200" />
      ))}
    </div>
  );
}