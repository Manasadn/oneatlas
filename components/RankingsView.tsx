"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type RankRow = { rank: number; score: number; model: { name: string; slug: string; lab: string } };
type Board = { name: string; slug: string; category: string; description: string | null; rankings: RankRow[] };
type Result = { key: string; boards?: Board[]; error?: string };

const medal = (rank: number) =>
  rank === 1
    ? "bg-amber-100 text-amber-700"
    : rank === 2
      ? "bg-slate-200 text-slate-700"
      : rank === 3
        ? "bg-orange-100 text-orange-700"
        : "bg-slate-50 text-slate-500";

export default function RankingsView() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const category = sp.get("category") ?? "";
  const benchmark = sp.get("benchmark") ?? "";

  const qs = new URLSearchParams();
  if (category) qs.set("category", category);
  if (benchmark) qs.set("benchmark", benchmark);
  const key = qs.toString();

  const [all, setAll] = useState<Board[]>([]);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    fetch("/api/rankings")
      .then((r) => r.json())
      .then((j) => setAll(j.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/rankings?${key}`, { signal: ctrl.signal })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error ?? "Request failed");
        setResult({ key, boards: j.data });
      })
      .catch((e: unknown) => {
        if ((e as Error).name !== "AbortError") setResult({ key, error: (e as Error).message });
      });
    return () => ctrl.abort();
  }, [key]);

  const update = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const s = next.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  };

  const categories = [...new Set(all.map((b) => b.category))];
  const benchOptions = all.filter((b) => !category || b.category.toLowerCase() === category.toLowerCase());
  const loading = result?.key !== key;
  const boards = result?.key === key ? result.boards : undefined;
  const error = result?.key === key ? result.error : undefined;

  const chip = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-medium transition ${
      active ? "bg-indigo-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
    }`;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Rankings &amp; benchmarks</h1>
      <p className="text-sm text-slate-500">Leaderboards showing how models perform on standard benchmarks.</p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button className={chip(!category)} onClick={() => update({ category: null, benchmark: null })}>
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            className={chip(category.toLowerCase() === c.toLowerCase())}
            onClick={() => update({ category: c, benchmark: null })}
          >
            {c}
          </button>
        ))}
        <select
          value={benchmark}
          onChange={(e) => update({ benchmark: e.target.value || null })}
          className="ml-auto rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
        >
          <option value="">All benchmarks</option>
          {benchOptions.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Something went wrong: {error}
          </div>
        ) : !boards ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl bg-slate-200" />
            ))}
          </div>
        ) : boards.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
            No benchmarks match your filters.
          </div>
        ) : (
          <div
            className={`grid gap-4 transition-opacity ${boards.length > 1 ? "lg:grid-cols-2" : ""} ${
              loading ? "opacity-60" : ""
            }`}
          >
            {boards.map((b) => {
              const top3 = b.rankings.slice(0, 3).map((r) => r.model.slug);
              return (
                <section key={b.slug} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{b.name}</h2>
                      <p className="text-sm text-slate-500">{b.description}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                      {b.category}
                    </span>
                  </div>

                  <ol className="mt-4 space-y-3">
                    {b.rankings.map((r) => (
                      <li key={r.model.slug} className="flex items-center gap-3">
                        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${medal(r.rank)}`}>
                          {r.rank}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <Link
                              href={`/models/${r.model.slug}`}
                              className="truncate text-sm font-medium text-slate-900 hover:text-indigo-600"
                            >
                              {r.model.name}
                              <span className="ml-2 text-xs font-normal text-slate-400">{r.model.lab}</span>
                            </Link>
                            <span className="text-sm font-semibold text-slate-800">{r.score}</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-indigo-500"
                              style={{ width: `${Math.min(r.score, 100)}%` }}
                            />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>

                  {top3.length >= 2 && (
                    <Link
                      href={`/compare?models=${top3.join(",")}`}
                      className="mt-5 inline-block text-sm font-medium text-indigo-600 hover:underline"
                    >
                      Compare top {top3.length} &rarr;
                    </Link>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}