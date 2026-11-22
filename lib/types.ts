export type ProviderOffer = {
  id: string;
  name: string;
  slug: string;
  inputPricePerM: number;
  outputPricePerM: number;
  latencyMs: number | null;
  throughputTps: number | null;
};

export type ModelItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  modelType: string;
  contextWindow: number;
  maxOutput: number | null;
  releaseDate: string;
  modalities: string[];
  capabilities: string[];
  isOpenSource: boolean;
  lab: { id: string; name: string; slug: string };
  pricing: { minInputPerM: number | null; minOutputPerM: number | null };
  providers: ProviderOffer[];
};

export type ModelsResponse = {
  data: ModelItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type FilterOptions = {
  labs: { name: string; slug: string }[];
  providers: { name: string; slug: string }[];
  capabilities: string[];
  types: string[];
};