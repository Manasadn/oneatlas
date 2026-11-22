import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/api";

export async function GET() {
  try {
    const labs = await prisma.lab.findMany({
      include: { _count: { select: { models: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({
      data: labs.map(({ _count, ...l }) => ({ ...l, modelCount: _count.models })),
    });
  } catch (e) {
    return handleError(e);
  }
}