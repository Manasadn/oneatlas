import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatContext, formatPrice, typeLabel } from "@/lib/format";

export default function ProviderDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-slate-200" />}>
      <ProviderDetail params={params} />
    </Suspense>
  );
}

async function ProviderDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const provider = await prisma.provider.findUnique({
    where: { slug },
    include: {
      models: {
        include: { model: { include: { lab: true, providers: true } } },
      },
    },
  });
  if (!provider) notFound();

  const rows = provider.models
    .map((mp) => {
      const input = Number(mp.inputPricePerM);
      const cheapestInput = Math.min(...mp.model.providers.map((x) => Number(x.inputPricePerM)));
      return {
        name: mp.model.name,
        slug: mp.model.slug,
        lab: mp.model.lab.name,
        type: mp.model.modelType,
        context: mp.model.contextWindow,
        input,
        output: Number(mp.outputPricePerM),
        latencyMs: mp.latencyMs,
        throughputTps: mp.throughputTps,
        isCheapest: mp.model.providers.length > 1 && input === cheapestInput,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-8">
      <nav className="text-sm text-slate-500">
        <Link href="/providers" className="hover:text-indigo-600">Providers</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800">{provider.name}</span>
      </nav>

      <header className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-2xl font-bold text-emerald-600">
          {provider.name.charAt(0)}
        </span>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">{provider.name}</h1>
          <p className="text-slate-500">
            {rows.length} supported model{rows.length === 1 ? "" : "s"}
          </p>
          <p className="mt-3 max-w-2xl text-slate-700">{provider.description}</p>
        </div>
        {provider.website && (
          <a
            href={provider.website}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Visit website
          </a>
        )}
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Supported models <span className="text-sm font-normal text-slate-500">(price per 1M tokens)</span>
        </h2>
        {rows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            No models listed for this provider yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Lab</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Context</th>
                  <th className="px-4 py-3">Input</th>
                  <th className="px-4 py-3">Output</th>
                  <th className="px-4 py-3">Latency</th>
                  <th className="px-4 py-3">Throughput</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.slug}>
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/models/${r.slug}`} className="text-slate-900 hover:text-indigo-600">
                        {r.name}
                      </Link>
                      {r.isCheapest && (
                        <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
                          Cheapest
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.lab}</td>
                    <td className="px-4 py-3 text-slate-600">{typeLabel(r.type)}</td>
                    <td className="px-4 py-3">{formatContext(r.context)}</td>
                    <td className="px-4 py-3">{formatPrice(r.input)}</td>
                    <td className="px-4 py-3">{formatPrice(r.output)}</td>
                    <td className="px-4 py-3">{r.latencyMs ? `${r.latencyMs} ms` : "\u2014"}</td>
                    <td className="px-4 py-3">{r.throughputTps ? `${r.throughputTps} tok/s` : "\u2014"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}