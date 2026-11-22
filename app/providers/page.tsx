import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Providers | OneAtlas" };

export default function ProvidersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Providers</h1>
      <p className="text-sm text-slate-500">Platforms and APIs where you can run these models.</p>
      <Suspense fallback={<GridSkeleton />}>
        <ProvidersGrid />
      </Suspense>
    </div>
  );
}

async function ProvidersGrid() {
  await connection();
  const providers = await prisma.provider.findMany({
    include: { _count: { select: { models: true } } },
    orderBy: { name: "asc" },
  });

  if (providers.length === 0) {
    return <p className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">No providers yet.</p>;
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {providers.map((p) => (
        <Link
          key={p.id}
          href={`/providers/${p.slug}`}
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-lg font-bold text-emerald-600">
              {p.name.charAt(0)}
            </span>
            <h2 className="truncate font-semibold text-slate-900 group-hover:text-indigo-600">{p.name}</h2>
          </div>
          <p className="mt-3 line-clamp-2 text-sm text-slate-600">{p.description}</p>
          <p className="mt-4 text-sm font-medium text-indigo-600">
            {p._count.models} model{p._count.models === 1 ? "" : "s"} supported &rarr;
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
        <div key={i} className="h-36 animate-pulse rounded-xl bg-slate-200" />
      ))}
    </div>
  );
}