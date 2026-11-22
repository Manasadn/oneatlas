import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError, badRequest, csv } from "@/lib/api";
import { modelInclude, serializeModel } from "@/lib/models";

export async function GET(req: NextRequest) {
  try {
    const slugs = [...new Set(csv(req.nextUrl.searchParams.get("models") ?? ""))];
    if (slugs.length < 2 || slugs.length > 4) {
      return badRequest("Provide between 2 and 4 model slugs, e.g. ?models=gpt-4o,claude-3-5-sonnet");
    }

    const models = await prisma.model.findMany({
      where: { slug: { in: slugs } },
      include: { ...modelInclude, scores: { include: { benchmark: true } } },
    });

    const ordered = slugs
      .map((s) => models.find((m) => m.slug === s))
      .filter((m): m is NonNullable<typeof m> => Boolean(m));

    const benchMap = new Map<string, { slug: string; name: string; category: string }>();
    for (const m of ordered) {
      for (const s of m.scores) {
        benchMap.set(s.benchmark.slug, {
          slug: s.benchmark.slug,
          name: s.benchmark.name,
          category: s.benchmark.category,
        });
      }
    }

    return NextResponse.json({
      data: ordered.map((m) => ({
        ...serializeModel(m),
        benchmarks: Object.fromEntries(m.scores.map((s) => [s.benchmark.slug, s.score])),
      })),
      benchmarkList: [...benchMap.values()],
      missing: slugs.filter((s) => !models.some((m) => m.slug === s)),
    });
  } catch (e) {
    return handleError(e);
  }
}