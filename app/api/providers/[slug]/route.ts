import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError, notFound } from "@/lib/api";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const provider = await prisma.provider.findUnique({
      where: { slug },
      include: { models: { include: { model: { include: { lab: true } } } } },
    });
    if (!provider) return notFound("Provider");

    const { models, ...rest } = provider;
    return NextResponse.json({
      data: {
        ...rest,
        models: models.map((mp) => ({
          name: mp.model.name,
          slug: mp.model.slug,
          lab: mp.model.lab.name,
          inputPricePerM: Number(mp.inputPricePerM),
          outputPricePerM: Number(mp.outputPricePerM),
          latencyMs: mp.latencyMs,
          throughputTps: mp.throughputTps,
        })),
      },
    });
  } catch (e) {
    return handleError(e);
  }
}