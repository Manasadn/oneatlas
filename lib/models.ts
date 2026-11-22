import { Prisma } from "@prisma/client";

export const modelInclude = {
  lab: true,
  providers: { include: { provider: true } },
} satisfies Prisma.ModelInclude;

export type ModelWithRelations = Prisma.ModelGetPayload<{ include: typeof modelInclude }>;

export function serializeModel(m: ModelWithRelations) {
  const providers = m.providers.map((p) => ({
    id: p.provider.id,
    name: p.provider.name,
    slug: p.provider.slug,
    inputPricePerM: Number(p.inputPricePerM),
    outputPricePerM: Number(p.outputPricePerM),
    latencyMs: p.latencyMs,
    throughputTps: p.throughputTps,
  }));

  return {
    id: m.id,
    name: m.name,
    slug: m.slug,
    description: m.description,
    modelType: m.modelType,
    contextWindow: m.contextWindow,
    maxOutput: m.maxOutput,
    releaseDate: m.releaseDate,
    modalities: m.modalities,
    capabilities: m.capabilities,
    isOpenSource: m.isOpenSource,
    lab: { id: m.lab.id, name: m.lab.name, slug: m.lab.slug },
    pricing: {
      minInputPerM: providers.length ? Math.min(...providers.map((p) => p.inputPricePerM)) : null,
      minOutputPerM: providers.length ? Math.min(...providers.map((p) => p.outputPricePerM)) : null,
    },
    providers,
  };
}