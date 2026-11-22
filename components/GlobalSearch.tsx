"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/lib/useDebounce";

type Results = {
  models: { name: string; slug: string; lab: { name: string } }[];
  labs: { name: string; slug: string }[];
  providers: { name: string; slug: string }[];
};

export default function GlobalSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const debounced = useDebounce(q.trim(), 250);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (debounced.length < 2) return;
    const ctrl = new AbortController();
    fetch(`/api/search?q=${encodeURIComponent(debounced)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((j) => setResults(j.data))
      .catch(() => {});
    return () => ctrl.abort();
  }, [debounced]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const go = (href: string) => {
    router.push(href);
    setOpen(false);
    setQ("");
  };

  const show = open && q.trim().length >= 2;
  const hasResults = results && (results.models.length || results.labs.length || results.providers.length);

  return (
    <div ref={boxRef} className="relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) go(`/models?q=${encodeURIComponent(q.trim())}`);
        }}
      >
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search... (Ctrl+K)"
          className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-64"
        />
      </form>

      {show && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-lg sm:w-80">
          {!hasResults && <p className="px-3 py-2 text-sm text-slate-500">No results found</p>}
          {results && results.models.length > 0 && (
            <Group title="Models">
              {results.models.map((m) => (
                <Item key={m.slug} onClick={() => go(`/models/${m.slug}`)} main={m.name} sub={m.lab.name} />
              ))}
            </Group>
          )}
          {results && results.labs.length > 0 && (
            <Group title="Labs">
              {results.labs.map((l) => (
                <Item key={l.slug} onClick={() => go(`/labs/${l.slug}`)} main={l.name} />
              ))}
            </Group>
          )}
          {results && results.providers.length > 0 && (
            <Group title="Providers">
              {results.providers.map((p) => (
                <Item key={p.slug} onClick={() => go(`/providers/${p.slug}`)} main={p.name} />
              ))}
            </Group>
          )}
        </div>
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      {children}
    </div>
  );
}

function Item({ main, sub, onClick }: { main: string; sub?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"
    >
      <span className="font-medium text-slate-800">{main}</span>
      {sub && <span className="text-xs text-slate-500">{sub}</span>}
    </button>
  );
}