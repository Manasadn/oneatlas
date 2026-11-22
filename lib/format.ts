export function formatContext(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return String(n);
}

export function formatPrice(n: number | null | undefined) {
  if (n === null || n === undefined || n === 0) return "\u2014";
  return `$${n.toFixed(n < 0.1 ? 3 : 2)}`;
}

export function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

export function typeLabel(t: string) {
  return t.charAt(0) + t.slice(1).toLowerCase();
}

export function splitCsv(v: string | null) {
  return v ? v.split(",").filter(Boolean) : [];
}