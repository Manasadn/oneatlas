"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ModelItem, ModelsResponse } from "@/lib/types";
import { formatContext, formatDate, formatPrice, splitCsv, typeLabel } from "@/lib/format";

type CompareModel = ModelItem & { benchmarks: Record<string, number> };
type BenchMeta = { slug: string; name: string; category: string };
type Result = { key: string; models?: CompareModel[]; benchmarkList?: BenchMeta[]; error?: string };

type Row = {
  label: string;
  text: (m: CompareModel) => string;
  num?: (m: CompareModel) => number | null;
  best?: "high" | "low";
};

const positive = (n: number | null | undefined) => (n !== null && n !== undefined && n > 0 ? n : null);
const minOf = (xs: (number | null)[]) => {
  const v = xs.filter((x): x is number => positive(x) !== null);
  return v.length ? Math.min(...v) : null;
};
const maxOf = (xs: (number | null)[]) => {
  const v = xs.filter((x): x is number => positive(x) !== null);
  return v.length ? Math.max(...v) : null;
};

const GROUPS: { title: string; rows: Row[] }[] = [
  {
    title: "General",
    rows: [
      { label: "Lab", text: (m) => m.lab.name },
      { label: "Type", text: (m) => typeLabel(m.modelType) },
      { label: "License", text: (m) => (m.isOpenSource ? "Open source" : "Proprietary") },
      { label: "Release date", text: (m) => formatDate(m.releaseDate) },
      { label: "Modalities", text: (m) => m.modalities.join(", ") },
    ],
  },
  {
    title: "Limits",
    rows: [
      {
        label: "Context window",
        text: (m) => `${formatContext(m.contextWindow)} tokens`,
        num: (m) => m.contextWindow,
        best: "high",
      },
      {
        label: "Max output",
        text: (m) => (m.maxOutput ? `${formatContext(m.maxOutput)} tokens` : "\u2014"),
        num: (m) => m.maxOutput,
        best: "high",
      },
    ],
  },
  {
    title: "Pricing (per 1M tokens, cheapest provider)",
    rows: [
      {
        label: "Input price",
        text: (m) => formatPrice(m.pricing.minInputPerM),
        num: (m) => positive(m.pricing.minInputPerM),
        best: "low",
      },
      {
        label: "Output price",
        text: (m) => formatPrice(m.pricing.minOutputPerM),
        num: (m) => positive(m.pricing.minOutputPerM),
        best: "low",
      },
      { label: "Providers", text: (m) => m.providers.map((p) => p.name).join(", ") || "\u2014" },
    ],
  },
  {
    title: "Performance (best available provider)",
    rows: [
      {
        label: "Latency",
        text: (m) => {
          const n = minOf(m.providers.map((p) => p.latencyMs));
          return n ? `${n} ms` : "\u2014";
        },
        num: (m) => minOf(m.providers.map((p) => p.latencyMs)),
        best: "low",
      },
      {
        label: "Throughput",
        text: (m) => {
          const n = maxOf(m.providers.map((p) => p.throughputTps));
          return n ? `${n} tok/s` : "\u2014";
        },
        num: (m) => maxOf(m.providers.map((p) => p.throughputTps)),
        best: "high",
      },
    ],
  },
];

function bestValue(nums: (number | null)[], mode?: "high" | "low") {
  if (!mode) return null;
  const v = nums.filter((n): n is number => n !== null);
  if (v.length < 2 || new Set(v).size < 2) return null;
  return mode === "high" ? Math.max(...v) : Math.min(...v);
}

const labelCell = "sticky left-0 z-10 bg-white px-4 py-3 text-slate-500 font-medium whitespace-nowrap";

function MetricRow({ row, models }: { row: Row; models: CompareModel[] }) {
  const nums = row.num ? models.map(row.num) : [];
  const best = bestValue(nums, row.best);
  return (
    <tr className="border-t border-slate-100">
      <td className={labelCell}>{row.label}</td>
      {models.map((m, i) => {
        const isBest = best !== null && nums[i] === best;
        return (
          <td
            key={m.slug}
            className={`px-4 py-3 ${isBest ? "bg-emerald-50 font-semibold text-emerald-700" : "text-slate-800"}`}
          >
            {row.text(m)}
          </td>
        );
      })}
    </tr>
  );
}

function GroupHeader({ title, span }: { title: string; span: number }) {
  return (
    <tr>
      <td colSpan={span} className="bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </td>
    </tr>
  );
}

const QUICK = [
  { label: "GPT-4o vs Claude 3.5 Sonnet", models: "gpt-4o,claude-3-5-sonnet" },
  { label: "Open source: Llama 3.1 405B vs DeepSeek V3 vs Qwen 2.5 72B", models: "llama-3-1-405b,deepseek-v3,qwen-2-5-72b" },
  { label: "Budget: GPT-4o mini vs Gemini 1.5 Flash vs Claude 3.5 Haiku", models: "gpt-4o-mini,gemini-1-5-flash,claude-3-5-haiku" },
];

export default function CompareView() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const selected = splitCsv(sp.get("models"));
  const key = selected.join(",");

  const [options, setOptions] = useState<ModelItem[]>([]);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    fetch("/api/models?limit=50&sort=name&order=asc")
      .then((r) => r.json())
      .then((j: ModelsResponse) => setOptions(j.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const slugs = splitCsv(key || null);
    if (slugs.length < 2) return;
    const ctrl = new AbortController();
    fetch(`/api/compare?models=${encodeURIComponent(key)}`, { signal: ctrl.signal })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error ?? "Request failed");
        setResult({ key, models: j.data, benchmarkList: j.benchmarkList });
      })
      .catch((e: unknown) => {
        if ((e as Error).name !== "AbortError") setResult({ key, error: (e as Error).message });
      });
    return () => ctrl.abort();
  }, [key]);

  const setSelected = (list: string[]) => {
    const next = new URLSearchParams(sp.toString());
    if (list.length) next.set("models", list.join(","));
    else next.delete("models");
    const s = next.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  };

  const nameOf = (slug: string) => options.find((o) => o.slug === slug)?.name ?? slug;
  const available = options.filter((o) => !selected.includes(o.slug));
  const ready = selected.length >= 2;
  const loading = ready && result?.key !== key;
  const current = result?.key === key ? result : null;
  const models = current?.models ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Compare models</h1>
      <p className="text-sm text-slate-500">Select 2 to 4 models to compare side by side.</p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {selected.map((slug) => (
          <span
            key={slug}
            className="flex items-center gap-2 rounded-full bg-indigo-50 py-1.5 pl-3 pr-2 text-sm font-medium text-indigo-700"
          >
            {nameOf(slug)}
            <button
              onClick={() => setSelected(selected.filter((s) => s !== slug))}
              aria-label={`Remove ${nameOf(slug)}`}
              className="grid h-5 w-5 place-items-center rounded-full text-indigo-500 hover:bg-indigo-100"
            >
              &times;
            </button>
          </span>
        ))}
        <select
          value=""
          disabled={selected.length >= 4}
          onChange={(e) => e.target.value && setSelected([...selected, e.target.value])}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 disabled:opacity-50"
        >
          <option value="">{selected.length >= 4 ? "Maximum 4 models" : "+ Add a model"}</option>
          {available.map((o) => (
            <option key={o.slug} value={o.slug}>
              {o.name}
            </option>
          ))}
        </select>
        {selected.length > 0 && (
          <button onClick={() => setSelected([])} className="text-sm font-medium text-indigo-600 hover:underline">
            Clear all
          </button>
        )}
      </div>

      <div className="mt-6">
        {!ready ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8">
            <p className="font-medium text-slate-800">
              {selected.length === 1 ? "Add one more model to start comparing." : "Pick models above, or try a quick comparison:"}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {QUICK.map((q) => (
                <Link
                  key={q.models}
                  href={`/compare?models=${q.models}`}
                  className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
                >
                  {q.label}
                </Link>
              ))}
            </div>
          </div>
        ) : current?.error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Something went wrong: {current.error}
          </div>
        ) : loading || !current ? (
          <div className="h-80 animate-pulse rounded-xl bg-slate-200" />
        ) : models.length < 2 ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Some selected models could not be found. Remove them and try again.
          </div>
        ) : (
          <>
            <p className="mb-2 text-xs text-slate-500">
              <span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-emerald-200 align-middle" />
              Green marks the best value in each row.
            </p>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead>
                  <tr className="bg-white">
                    <th className="sticky left-0 z-10 w-40 bg-white px-4 py-4" />
                    {models.map((m) => (
                      <th key={m.slug} className="px-4 py-4 align-top">
                        <Link
                          href={`/models/${m.slug}`}
                          className="text-base font-semibold text-slate-900 hover:text-indigo-600"
                        >
                          {m.name}
                        </Link>
                        <p className="text-xs font-normal text-slate-500">{m.lab.name}</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {GROUPS.map((g) => (
                    <GroupRows key={g.title} title={g.title} rows={g.rows} models={models} />
                  ))}

                  <GroupHeader title="Capabilities" span={models.length + 1} />
                  <tr className="border-t border-slate-100">
                    <td className={labelCell}>Features</td>
                    {models.map((m) => (
                      <td key={m.slug} className="px-4 py-3 align-top">
                        <div className="flex flex-wrap gap-1.5">
                          {m.capabilities.map((c) => (
                            <span key={c} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {current.benchmarkList && current.benchmarkList.length > 0 && (
                    <>
                      <GroupHeader title="Benchmarks (higher is better)" span={models.length + 1} />
                      {current.benchmarkList.map((b) => (
                        <MetricRow
                          key={b.slug}
                          models={models}
                          row={{
                            label: b.name,
                            text: (m) => (m.benchmarks[b.slug] !== undefined ? String(m.benchmarks[b.slug]) : "\u2014"),
                            num: (m) => m.benchmarks[b.slug] ?? null,
                            best: "high",
                          }}
                        />
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function GroupRows({ title, rows, models }: { title: string; rows: Row[]; models: CompareModel[] }) {
  return (
    <>
      <GroupHeader title={title} span={models.length + 1} />
      {rows.map((r) => (
        <MetricRow key={r.label} row={r} models={models} />
      ))}
    </>
  );
}