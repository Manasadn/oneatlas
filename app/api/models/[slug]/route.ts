import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError, notFound } from "@/lib/api";
import { modelInclude, serializeModel } from "@/lib/models";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const model = await prisma.model.findUnique({
      where: { slug },
      include: { ...modelInclude, scores: { include: { benchmark: true } } },
    });
    if (!model) return notFound("Model");

    return NextResponse.json({
      data: {
        ...serializeModel(model),
        benchmarks: model.scores.map((s) => ({
          name: s.benchmark.name,
          slug: s.benchmark.slug,
          category: s.benchmark.category,
          score: s.score,
        })),
      },
    });
  } catch (e) {
    return handleError(e);
  }
}