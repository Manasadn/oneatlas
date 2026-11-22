import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const benchmark = req.nextUrl.searchParams.get("benchmark") ?? undefined;
    const category = req.nextUrl.searchParams.get("category") ?? undefined;

    const benchmarks = await prisma.benchmark.findMany({
      where: {
        ...(benchmark && { slug: benchmark }),
        ...(category && { category: { equals: category, mode: "insensitive" } }),
      },
      include: {
        scores: {
          orderBy: { score: "desc" },
          include: { model: { include: { lab: true } } },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      data: benchmarks.map((b) => ({
        name: b.name,
        slug: b.slug,
        category: b.category,
        description: b.description,
        rankings: b.scores.map((s, i) => ({
          rank: i + 1,
          score: s.score,
          model: { name: s.model.name, slug: s.model.slug, lab: s.model.lab.name },
        })),
      })),
    });
  } catch (e) {
    return handleError(e);
  }
}