"use client";

import type { FilterOptions } from "@/lib/types";
import { typeLabel } from "@/lib/format";

type Props = {
  options: FilterOptions | null;
  current: {
    lab: string[];
    provider: string[];
    capability: string[];
    type: string;
    openSource: string;
  };
  activeCount: number;
  onToggle: (key: "lab" | "provider" | "capability", value: string) => void;
  onSet: (key: "type" | "openSource", value: string) => void;
  onClear: () => void;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-100 py-4 last:border-0">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h4>
      {children}
    </div>
  );
}

function CheckList({
  items,
  selected,
  onToggle,
}: {
  items: { value: string; label: string }[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
      {items.map((i) => (
        <label key={i.value} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={selected.includes(i.value)}
            onChange={() => onToggle(i.value)}
            className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
          />
          {i.label}
        </label>
      ))}
    </div>
  );
}

const selectClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500";

export default function FiltersPanel({ options, current, activeCount, onToggle, onSet, onClear }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Filters</h3>
        {activeCount > 0 && (
          <button onClick={onClear} className="text-sm font-medium text-indigo-600 hover:underline">
            Clear all ({activeCount})
          </button>
        )}
      </div>

      {!options ? (
        <p className="py-6 text-sm text-slate-400">Loading filters...</p>
      ) : (
        <>
          <Section title="Model type">
            <select value={current.type} onChange={(e) => onSet("type", e.target.value)} className={selectClass}>
              <option value="">All types</option>
              {options.types.map((t) => (
                <option key={t} value={t}>
                  {typeLabel(t)}
                </option>
              ))}
            </select>
          </Section>

          <Section title="License">
            <select
              value={current.openSource}
              onChange={(e) => onSet("openSource", e.target.value)}
              className={selectClass}
            >
              <option value="">Any</option>
              <option value="true">Open source</option>
              <option value="false">Proprietary</option>
            </select>
          </Section>

          <Section title="Company / Lab">
            <CheckList
              items={options.labs.map((l) => ({ value: l.slug, label: l.name }))}
              selected={current.lab}
              onToggle={(v) => onToggle("lab", v)}
            />
          </Section>

          <Section title="Provider">
            <CheckList
              items={options.providers.map((p) => ({ value: p.slug, label: p.name }))}
              selected={current.provider}
              onToggle={(v) => onToggle("provider", v)}
            />
          </Section>

          <Section title="Capabilities">
            <CheckList
              items={options.capabilities.map((c) => ({ value: c, label: c }))}
              selected={current.capability}
              onToggle={(v) => onToggle("capability", v)}
            />
          </Section>
        </>
      )}
    </div>
  );
}