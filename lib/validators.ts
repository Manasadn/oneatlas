import { z } from "zod";

export const modelsQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  lab: z.string().optional(),
  provider: z.string().optional(),
  capability: z.string().optional(),
  type: z.enum(["CHAT", "EMBEDDING", "IMAGE", "AUDIO", "VIDEO", "CODE", "MULTIMODAL"]).optional(),
  openSource: z.enum(["true", "false"]).optional(),
  sort: z.enum(["release", "context", "price", "name"]).default("release"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});