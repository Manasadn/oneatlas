import Link from "next/link";
import type { ModelItem } from "@/lib/types";
import { formatContext, formatDate, formatPrice, typeLabel } from "@/lib/format";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="text-sm font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

export default function ModelCard({ model }: { model: ModelItem }) {
  const extra = model.capabilities.length - 4;
  return (
    <Link
      href={`/models/${model.slug}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-900 group-hover:text-indigo-600">
            {model.name}
          </h3>
          <p className="text-sm text-slate-500">{model.lab.name}</p>
        </div>
        <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
          {typeLabel(model.modelType)}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-slate-600">{model.description}</p>

      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
        <Stat label="Context" value={formatContext(model.contextWindow)} />
        <Stat label="Input / 1M" value={formatPrice(model.pricing.minInputPerM)} />
        <Stat label="Output / 1M" value={formatPrice(model.pricing.minOutputPerM)} />
      </dl>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {model.capabilities.slice(0, 4).map((c) => (
          <span key={c} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {c}
          </span>
        ))}
        {extra > 0 && <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">+{extra}</span>}
      </div>

      <div className="mt-auto flex items-center justify-between pt-4 text-xs text-slate-500">
        <span>
          {model.providers.length} provider{model.providers.length === 1 ? "" : "s"}
        </span>
        <span className="flex items-center gap-2">
          {model.isOpenSource && (
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-700">Open source</span>
          )}
          {formatDate(model.releaseDate)}
        </span>
      </div>
    </Link>
  );
}