"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ModelCard from "./ModelCard";
import FiltersPanel from "./FiltersPanel";
import Pagination from "./Pagination";
import { useDebounce } from "@/lib/useDebounce";
import { splitCsv } from "@/lib/format";
import type { FilterOptions, ModelsResponse } from "@/lib/types";

const SORTS = [
  { value: "release:desc", label: "Newest first" },
  { value: "release:asc", label: "Oldest first" },
  { value: "price:asc", label: "Price: low to high" },
  { value: "price:desc", label: "Price: high to low" },
  { value: "context:desc", label: "Context: longest" },
  { value: "context:asc", label: "Context: shortest" },
  { value: "name:asc", label: "Name: A to Z" },
];

type Result = { key: string; res?: ModelsResponse; error?: string };

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5">
      <div className="h-5 w-2/3 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-1/3 rounded bg-slate-100" />
      <div className="mt-4 h-10 rounded bg-slate-100" />
      <div className="mt-4 h-12 rounded bg-slate-100" />
      <div className="mt-4 h-6 w-3/4 rounded bg-slate-100" />
    </div>
  );
}

export default function ModelsExplorer() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const qs = sp.toString();
  const urlQ = sp.get("q") ?? "";

  const [search, setSearch] = useState(urlQ);
  const debouncedSearch = useDebounce(search, 350);
  const [options, setOptions] = useState<FilterOptions | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const update = useCallback(
    (updates: Record<string, string | null>, keepPage = false) => {
      const next = new URLSearchParams(qs);
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      }
      if (!keepPage) next.delete("page");
      const s = next.toString();
      router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
    },
    [qs, pathname, router]
  );

  // Push the debounced search text into the URL
  useEffect(() => {
    if (debouncedSearch.trim() !== urlQ) update({ q: debouncedSearch.trim() || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Load filter options once
  useEffect(() => {
    fetch("/api/filters")
      .then((r) => r.json())
      .then((j) => setOptions(j.data))
      .catch(() => {});
  }, []);

  // Fetch models whenever the URL query changes
  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/models?${qs}`, { signal: ctrl.signal })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error ?? "Request failed");
        return j as ModelsResponse;
      })
      .then((res) => setResult({ key: qs, res }))
      .catch((e: unknown) => {
        if ((e as Error).name !== "AbortError") setResult({ key: qs, error: (e as Error).message });
      });
    return () => ctrl.abort();
  }, [qs]);

  const current = {
    lab: splitCsv(sp.get("lab")),
    provider: splitCsv(sp.get("provider")),
    capability: splitCsv(sp.get("capability")),
    type: sp.get("type") ?? "",
    openSource: sp.get("openSource") ?? "",
  };
  const sortValue = `${sp.get("sort") ?? "release"}:${sp.get("order") ?? "desc"}`;
  const page = Number(sp.get("page") ?? 1) || 1;
  const activeCount =
    current.lab.length +
    current.provider.length +
    current.capability.length +
    (current.type ? 1 : 0) +
    (current.openSource ? 1 : 0);

  const toggle = (key: "lab" | "provider" | "capability", value: string) => {
    const list = splitCsv(sp.get(key));
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    update({ [key]: next.length ? next.join(",") : null });
  };

  const clearAll = () => {
    setSearch("");
    update({ q: null, lab: null, provider: null, capability: null, type: null, openSource: null });
  };

  const loading = result?.key !== qs;
  const res = result?.res;
  const error = result?.key === qs ? result.error : undefined;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Models</h1>
          <p className="text-sm text-slate-500">
            {res ? `${res.meta.total} model${res.meta.total === 1 ? "" : "s"} found` : "Loading models..."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search models, labs..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-64"
          />
          <select
            value={sortValue}
            onChange={(e) => {
              const [sort, order] = e.target.value.split(":");
              update({ sort, order });
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium lg:hidden"
          >
            Filters{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <aside className={`${showFilters ? "block" : "hidden"} lg:block`}>
          <FiltersPanel
            options={options}
            current={current}
            activeCount={activeCount}
            onToggle={toggle}
            onSet={(key, value) => update({ [key]: value || null })}
            onClear={clearAll}
          />
        </aside>

        <section>
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              Something went wrong: {error}
            </div>
          ) : !res ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : res.data.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="font-medium text-slate-800">No models match your filters</p>
              <button onClick={clearAll} className="mt-2 text-sm font-medium text-indigo-600 hover:underline">
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div
                className={`grid gap-4 transition-opacity md:grid-cols-2 xl:grid-cols-3 ${
                  loading ? "opacity-60" : ""
                }`}
              >
                {res.data.map((m) => (
                  <ModelCard key={m.id} model={m} />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={res.meta.totalPages}
                onChange={(p) => {
                  update({ page: String(p) }, true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}