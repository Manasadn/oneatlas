import { NextResponse } from "next/server";
import { connection } from "next/server";
import { ModelType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/api";

export async function GET() {
  try {
    await connection();
    const [labs, providers, caps] = await Promise.all([
      prisma.lab.findMany({ select: { name: true, slug: true }, orderBy: { name: "asc" } }),
      prisma.provider.findMany({ select: { name: true, slug: true }, orderBy: { name: "asc" } }),
      prisma.model.findMany({ select: { capabilities: true } }),
    ]);
    const capabilities = [...new Set(caps.flatMap((m) => m.capabilities))].sort();
    return NextResponse.json({
      data: { labs, providers, capabilities, types: Object.values(ModelType) },
    });
  } catch (e) {
    return handleError(e);
  }
}