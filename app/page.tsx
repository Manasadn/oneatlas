import Link from "next/link";

const features = [
  { title: "Discover models", text: "Search and filter AI models by lab, provider, capability and type.", href: "/models" },
  { title: "Compare side by side", text: "Put pricing, context length and benchmarks next to each other.", href: "/compare" },
  { title: "Rankings", text: "See leaderboards across benchmarks like MMLU, HumanEval and GPQA.", href: "/rankings" },
  { title: "Labs & providers", text: "Explore who builds the models and who serves them.", href: "/labs" },
];

export default function Home() {
  return (
    <div className="py-10 sm:py-16">
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Find the right AI model, faster.
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          OneAtlas helps developers, AI engineers and researchers discover, compare and evaluate models across
          providers.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/models" className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700">
            Browse models
          </Link>
          <Link href="/rankings" className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50">
            View rankings
          </Link>
        </div>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-2">
        {features.map((f) => (
          <Link
            key={f.title}
            href={f.href}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
          >
            <h3 className="font-semibold text-slate-900">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{f.text}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}