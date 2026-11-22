import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { modelInclude, serializeModel } from "@/lib/models";
import { formatContext, formatDate, formatPrice, typeLabel } from "@/lib/format";

export default function ModelDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ModelDetail params={params} />
    </Suspense>
  );
}

async function ModelDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const row = await prisma.model.findUnique({
    where: { slug },
    include: { ...modelInclude, scores: { include: { benchmark: true } } },
  });
  if (!row) notFound();

  const model = serializeModel(row);

  const benchmarks = await Promise.all(
    row.scores.map(async (s) => {
      const [higher, total] = await Promise.all([
        prisma.benchmarkScore.count({ where: { benchmarkId: s.benchmarkId, score: { gt: s.score } } }),
        prisma.benchmarkScore.count({ where: { benchmarkId: s.benchmarkId } }),
      ]);
      return {
        name: s.benchmark.name,
        slug: s.benchmark.slug,
        category: s.benchmark.category,
        score: s.score,
        rank: higher + 1,
        total,
      };
    })
  );

  const related = await prisma.model.findMany({
    where: { labId: row.labId, NOT: { id: row.id } },
    orderBy: { releaseDate: "desc" },
    take: 3,
    select: { name: true, slug: true, modelType: true, contextWindow: true },
  });

  const offers = [...model.providers].sort((a, b) => a.inputPricePerM - b.inputPricePerM);
  const cheapest = offers[0]?.slug;

  const specs = [
    { label: "Context window", value: `${formatContext(model.contextWindow)} tokens` },
    { label: "Max output", value: model.maxOutput ? `${formatContext(model.maxOutput)} tokens` : "\u2014" },
    { label: "Release date", value: formatDate(model.releaseDate) },
    { label: "Model type", value: typeLabel(model.modelType) },
    { label: "License", value: model.isOpenSource ? "Open source" : "Proprietary" },
    { label: "Modalities", value: model.modalities.join(", ") },
  ];

  return (
    <div className="space-y-8">
      <nav className="text-sm text-slate-500">
        <Link href="/models" className="hover:text-indigo-600">Models</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800">{model.name}</span>
      </nav>

      <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold text-slate-900">{model.name}</h1>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                {typeLabel(model.modelType)}
              </span>
              {model.isOpenSource && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  Open source
                </span>
              )}
            </div>
            <p className="mt-1 text-slate-500">
              by{" "}
              <Link href={`/labs/${model.lab.slug}`} className="font-medium text-indigo-600 hover:underline">
                {model.lab.name}
              </Link>
            </p>
            <p className="mt-4 max-w-2xl text-slate-700">{model.description}</p>
          </div>
          <Link
            href={`/compare?models=${model.slug}`}
            className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Compare this model
          </Link>
        </div>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Specifications</h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {specs.map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
              <dt className="text-xs uppercase tracking-wide text-slate-400">{s.label}</dt>
              <dd className="mt-1 font-semibold text-slate-900">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Capabilities</h2>
        <div className="flex flex-wrap gap-2">
          {model.capabilities.map((c) => (
            <span key={c} className="rounded-lg bg-white px-3 py-1.5 text-sm text-slate-700 ring-1 ring-slate-200">
              {c}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Providers &amp; pricing <span className="text-sm font-normal text-slate-500">(per 1M tokens)</span>
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Input</th>
                <th className="px-4 py-3">Output</th>
                <th className="px-4 py-3">Latency</th>
                <th className="px-4 py-3">Throughput</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {offers.map((o) => (
                <tr key={o.slug}>
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/providers/${o.slug}`} className="text-slate-900 hover:text-indigo-600">
                      {o.name}
                    </Link>
                    {o.slug === cheapest && offers.length > 1 && (
                      <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
                        Cheapest
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{formatPrice(o.inputPricePerM)}</td>
                  <td className="px-4 py-3">{formatPrice(o.outputPricePerM)}</td>
                  <td className="px-4 py-3">{o.latencyMs ? `${o.latencyMs} ms` : "\u2014"}</td>
                  <td className="px-4 py-3">{o.throughputTps ? `${o.throughputTps} tok/s` : "\u2014"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Benchmarks</h2>
        {benchmarks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
            No benchmark scores available for this model.
          </p>
        ) : (
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
            {benchmarks.map((b) => (
              <div key={b.slug}>
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span className="font-medium text-slate-800">
                    {b.name} <span className="font-normal text-slate-400">&middot; {b.category}</span>
                  </span>
                  <span className="text-slate-600">
                    <span className="font-semibold text-slate-900">{b.score}</span>
                    <span className="ml-2 text-xs text-slate-500">
                      Rank #{b.rank} of {b.total}
                    </span>
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${Math.min(b.score, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">More from {model.lab.name}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/models/${r.slug}`}
                className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-sm"
              >
                <p className="font-semibold text-slate-900">{r.name}</p>
                <p className="text-sm text-slate-500">
                  {typeLabel(r.modelType)} &middot; {formatContext(r.contextWindow)} context
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-4 w-40 rounded bg-slate-200" />
      <div className="h-40 rounded-xl bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-20 rounded-xl bg-slate-200" />
        <div className="h-20 rounded-xl bg-slate-200" />
        <div className="h-20 rounded-xl bg-slate-200" />
      </div>
      <div className="h-48 rounded-xl bg-slate-200" />
    </div>
  );
}