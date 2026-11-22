import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError, notFound } from "@/lib/api";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const lab = await prisma.lab.findUnique({
      where: { slug },
      include: {
        models: {
          orderBy: { releaseDate: "desc" },
          select: { id: true, name: true, slug: true, modelType: true, contextWindow: true, releaseDate: true, isOpenSource: true },
        },
      },
    });
    if (!lab) return notFound("Lab");
    return NextResponse.json({ data: lab });
  } catch (e) {
    return handleError(e);
  }
}