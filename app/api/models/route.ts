import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { handleError, csv } from "@/lib/api";
import { modelInclude, serializeModel } from "@/lib/models";
import { modelsQuerySchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    const p = modelsQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));

    const filters: Prisma.ModelWhereInput[] = [];
    if (p.q) {
      filters.push({
        OR: [
          { name: { contains: p.q, mode: "insensitive" } },
          { description: { contains: p.q, mode: "insensitive" } },
          { lab: { name: { contains: p.q, mode: "insensitive" } } },
        ],
      });
    }
    if (p.lab) filters.push({ lab: { slug: { in: csv(p.lab) } } });
    if (p.provider) filters.push({ providers: { some: { provider: { slug: { in: csv(p.provider) } } } } });
    if (p.capability) filters.push({ capabilities: { hasEvery: csv(p.capability) } });
    if (p.type) filters.push({ modelType: p.type });
    if (p.openSource) filters.push({ isOpenSource: p.openSource === "true" });

    const where: Prisma.ModelWhereInput = { AND: filters };
    const total = await prisma.model.count({ where });

    let rows;
    if (p.sort === "price") {
      // Price lives in a related table, so sort in memory (fine at MVP scale).
      const all = await prisma.model.findMany({ where, include: modelInclude });
      const key = (m: (typeof all)[number]) =>
        m.providers.length ? Math.min(...m.providers.map((x) => Number(x.inputPricePerM))) : Infinity;
      all.sort((a, b) => (p.order === "asc" ? key(a) - key(b) : key(b) - key(a)));
      rows = all.slice((p.page - 1) * p.limit, p.page * p.limit);
    } else {
      const field = { release: "releaseDate", context: "contextWindow", name: "name" }[p.sort] as
        | "releaseDate" | "contextWindow" | "name";
      rows = await prisma.model.findMany({
        where,
        include: modelInclude,
        orderBy: { [field]: p.order },
        skip: (p.page - 1) * p.limit,
        take: p.limit,
      });
    }

    return NextResponse.json({
      data: rows.map(serializeModel),
      meta: { page: p.page, limit: p.limit, total, totalPages: Math.ceil(total / p.limit) },
    });
  } catch (e) {
    return handleError(e);
  }
}