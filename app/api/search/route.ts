import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 100);
    if (q.length < 2) return NextResponse.json({ data: { models: [], labs: [], providers: [] } });

    const like = { contains: q, mode: "insensitive" as const };
    const [models, labs, providers] = await Promise.all([
      prisma.model.findMany({ where: { name: like }, take: 5, select: { name: true, slug: true, lab: { select: { name: true } } } }),
      prisma.lab.findMany({ where: { name: like }, take: 3, select: { name: true, slug: true } }),
      prisma.provider.findMany({ where: { name: like }, take: 3, select: { name: true, slug: true } }),
    ]);

    return NextResponse.json({ data: { models, labs, providers } });
  } catch (e) {
    return handleError(e);
  }
}