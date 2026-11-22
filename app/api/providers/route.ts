import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/api";

export async function GET() {
  try {
    const providers = await prisma.provider.findMany({
      include: { _count: { select: { models: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({
      data: providers.map(({ _count, ...p }) => ({ ...p, modelCount: _count.models })),
    });
  } catch (e) {
    return handleError(e);
  }
}