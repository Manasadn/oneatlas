import { PrismaClient, ModelType } from "@prisma/client";

const prisma = new PrismaClient();

const labs = [
  { name: "OpenAI", slug: "openai", country: "USA", website: "https://openai.com", description: "Creator of the GPT model family." },
  { name: "Anthropic", slug: "anthropic", country: "USA", website: "https://anthropic.com", description: "AI safety company behind the Claude models." },
  { name: "Google DeepMind", slug: "google", country: "USA", website: "https://deepmind.google", description: "Google's AI research lab, creator of Gemini." },
  { name: "Meta AI", slug: "meta", country: "USA", website: "https://ai.meta.com", description: "Meta's research lab, creator of the open Llama models." },
  { name: "Mistral AI", slug: "mistral", country: "France", website: "https://mistral.ai", description: "European AI lab known for efficient models." },
  { name: "DeepSeek", slug: "deepseek", country: "China", website: "https://deepseek.com", description: "Chinese lab focused on open, low-cost models." },
  { name: "Alibaba Qwen", slug: "qwen", country: "China", website: "https://qwenlm.github.io", description: "Alibaba's open-weight Qwen model family." },
];

const providers = [
  { name: "OpenAI API", slug: "openai-api", website: "https://platform.openai.com", description: "First-party API for OpenAI models." },
  { name: "Anthropic API", slug: "anthropic-api", website: "https://console.anthropic.com", description: "First-party API for Claude models." },
  { name: "Google AI / Vertex", slug: "google-vertex", website: "https://cloud.google.com/vertex-ai", description: "Google Cloud hosting for Gemini and others." },
  { name: "AWS Bedrock", slug: "aws-bedrock", website: "https://aws.amazon.com/bedrock", description: "Managed multi-model hosting on AWS." },
  { name: "Together AI", slug: "together-ai", website: "https://together.ai", description: "Fast inference for open-source models." },
  { name: "Groq", slug: "groq", website: "https://groq.com", description: "Very high-throughput inference on custom hardware." },
  { name: "Fireworks AI", slug: "fireworks-ai", website: "https://fireworks.ai", description: "Optimized inference for open models." },
  { name: "Mistral API", slug: "mistral-api", website: "https://console.mistral.ai", description: "First-party API for Mistral models." },
  { name: "DeepSeek API", slug: "deepseek-api", website: "https://platform.deepseek.com", description: "First-party API for DeepSeek models." },
];

const benchmarks = [
  { name: "MMLU", slug: "mmlu", category: "Knowledge", description: "Multitask language understanding across 57 subjects." },
  { name: "HumanEval", slug: "humaneval", category: "Coding", description: "Python code generation correctness." },
  { name: "GSM8K", slug: "gsm8k", category: "Math", description: "Grade-school math word problems." },
  { name: "MATH", slug: "math", category: "Math", description: "Competition-level math problems." },
  { name: "GPQA", slug: "gpqa", category: "Reasoning", description: "Graduate-level science questions." },
];

// offers: [providerSlug, inputPricePerM, outputPricePerM, latencyMs, throughputTps]
type Offer = [string, number, number, number, number];

const models: {
  name: string; slug: string; lab: string; description: string;
  modelType: ModelType; contextWindow: number; maxOutput: number;
  release: string; modalities: string[]; capabilities: string[];
  isOpenSource: boolean; offers: Offer[]; scores: Record<string, number>;
}[] = [
  {
    name: "GPT-4o", slug: "gpt-4o", lab: "openai",
    description: "Flagship multimodal model with strong general performance.",
    modelType: ModelType.MULTIMODAL, contextWindow: 128000, maxOutput: 16384,
    release: "2024-05-13", modalities: ["text", "image", "audio"],
    capabilities: ["function-calling", "json-mode", "vision", "streaming"],
    isOpenSource: false,
    offers: [["openai-api", 2.5, 10, 450, 90]],
    scores: { mmlu: 88.7, humaneval: 90.2, gsm8k: 95.0, math: 76.6, gpqa: 53.6 },
  },
  {
    name: "GPT-4o mini", slug: "gpt-4o-mini", lab: "openai",
    description: "Small, fast and cheap model for high-volume tasks.",
    modelType: ModelType.MULTIMODAL, contextWindow: 128000, maxOutput: 16384,
    release: "2024-07-18", modalities: ["text", "image"],
    capabilities: ["function-calling", "json-mode", "vision", "streaming"],
    isOpenSource: false,
    offers: [["openai-api", 0.15, 0.6, 350, 120]],
    scores: { mmlu: 82.0, humaneval: 87.2, gsm8k: 91.3, math: 70.2, gpqa: 40.2 },
  },
  {
    name: "text-embedding-3-large", slug: "text-embedding-3-large", lab: "openai",
    description: "High-quality text embedding model for search and RAG.",
    modelType: ModelType.EMBEDDING, contextWindow: 8191, maxOutput: 3072,
    release: "2024-01-25", modalities: ["text"], capabilities: ["embeddings"],
    isOpenSource: false,
    offers: [["openai-api", 0.13, 0, 120, 0]],
    scores: {},
  },
  {
    name: "Claude 3.5 Sonnet", slug: "claude-3-5-sonnet", lab: "anthropic",
    description: "Strong all-round model, especially good at coding and analysis.",
    modelType: ModelType.MULTIMODAL, contextWindow: 200000, maxOutput: 8192,
    release: "2024-06-20", modalities: ["text", "image"],
    capabilities: ["function-calling", "vision", "streaming", "prompt-caching"],
    isOpenSource: false,
    offers: [
      ["anthropic-api", 3, 15, 600, 75],
      ["aws-bedrock", 3, 15, 700, 65],
      ["google-vertex", 3, 15, 680, 68],
    ],
    scores: { mmlu: 88.7, humaneval: 92.0, gsm8k: 96.4, math: 71.1, gpqa: 59.4 },
  },
  {
    name: "Claude 3.5 Haiku", slug: "claude-3-5-haiku", lab: "anthropic",
    description: "Fast, affordable Claude model for lightweight tasks.",
    modelType: ModelType.CHAT, contextWindow: 200000, maxOutput: 8192,
    release: "2024-10-22", modalities: ["text"],
    capabilities: ["function-calling", "streaming", "prompt-caching"],
    isOpenSource: false,
    offers: [["anthropic-api", 0.8, 4, 400, 110], ["aws-bedrock", 0.8, 4, 450, 100]],
    scores: { mmlu: 80.9, humaneval: 88.1, gsm8k: 90.0, math: 69.4, gpqa: 41.6 },
  },
  {
    name: "Gemini 1.5 Pro", slug: "gemini-1-5-pro", lab: "google",
    description: "Long-context multimodal model with up to 2M tokens.",
    modelType: ModelType.MULTIMODAL, contextWindow: 2000000, maxOutput: 8192,
    release: "2024-05-14", modalities: ["text", "image", "audio", "video"],
    capabilities: ["function-calling", "json-mode", "vision", "long-context"],
    isOpenSource: false,
    offers: [["google-vertex", 1.25, 5, 650, 60]],
    scores: { mmlu: 85.9, humaneval: 84.1, gsm8k: 91.7, math: 67.7, gpqa: 46.2 },
  },
  {
    name: "Gemini 1.5 Flash", slug: "gemini-1-5-flash", lab: "google",
    description: "Fast, low-cost multimodal model with 1M context.",
    modelType: ModelType.MULTIMODAL, contextWindow: 1000000, maxOutput: 8192,
    release: "2024-05-14", modalities: ["text", "image", "audio", "video"],
    capabilities: ["function-calling", "json-mode", "vision", "long-context"],
    isOpenSource: false,
    offers: [["google-vertex", 0.075, 0.3, 300, 150]],
    scores: { mmlu: 78.9, humaneval: 74.3, gsm8k: 86.2, math: 54.9, gpqa: 39.5 },
  },
  {
    name: "Llama 3.1 405B", slug: "llama-3-1-405b", lab: "meta",
    description: "Largest open-weight Llama model, competitive with frontier models.",
    modelType: ModelType.CHAT, contextWindow: 128000, maxOutput: 4096,
    release: "2024-07-23", modalities: ["text"],
    capabilities: ["function-calling", "streaming", "multilingual"],
    isOpenSource: true,
    offers: [
      ["together-ai", 3.5, 3.5, 700, 45],
      ["fireworks-ai", 3.0, 3.0, 650, 55],
      ["aws-bedrock", 5.32, 16, 900, 35],
    ],
    scores: { mmlu: 88.6, humaneval: 89.0, gsm8k: 96.8, math: 73.8, gpqa: 50.7 },
  },
  {
    name: "Llama 3.1 70B", slug: "llama-3-1-70b", lab: "meta",
    description: "Balanced open-weight model with strong quality for its size.",
    modelType: ModelType.CHAT, contextWindow: 128000, maxOutput: 4096,
    release: "2024-07-23", modalities: ["text"],
    capabilities: ["function-calling", "streaming", "multilingual"],
    isOpenSource: true,
    offers: [
      ["together-ai", 0.88, 0.88, 400, 90],
      ["fireworks-ai", 0.9, 0.9, 380, 95],
      ["groq", 0.59, 0.79, 150, 300],
    ],
    scores: { mmlu: 86.0, humaneval: 80.5, gsm8k: 95.1, math: 68.0, gpqa: 41.7 },
  },
  {
    name: "Mistral Large 2", slug: "mistral-large-2", lab: "mistral",
    description: "Flagship Mistral model with strong coding and multilingual skills.",
    modelType: ModelType.CHAT, contextWindow: 128000, maxOutput: 8192,
    release: "2024-07-24", modalities: ["text"],
    capabilities: ["function-calling", "json-mode", "multilingual", "code"],
    isOpenSource: false,
    offers: [["mistral-api", 2, 6, 500, 70], ["aws-bedrock", 2, 6, 600, 60]],
    scores: { mmlu: 84.0, humaneval: 92.0, gsm8k: 93.0, math: 69.0, gpqa: 46.0 },
  },
  {
    name: "DeepSeek V3", slug: "deepseek-v3", lab: "deepseek",
    description: "Open mixture-of-experts model with very low pricing.",
    modelType: ModelType.CHAT, contextWindow: 128000, maxOutput: 8192,
    release: "2024-12-26", modalities: ["text"],
    capabilities: ["function-calling", "json-mode", "code", "streaming"],
    isOpenSource: true,
    offers: [["deepseek-api", 0.27, 1.1, 800, 50], ["together-ai", 1.25, 1.25, 600, 60]],
    scores: { mmlu: 88.5, humaneval: 82.6, gsm8k: 89.3, math: 90.2, gpqa: 59.1 },
  },
  {
    name: "Qwen 2.5 72B", slug: "qwen-2-5-72b", lab: "qwen",
    description: "Strong open-weight multilingual model from Alibaba.",
    modelType: ModelType.CHAT, contextWindow: 131072, maxOutput: 8192,
    release: "2024-09-19", modalities: ["text"],
    capabilities: ["function-calling", "multilingual", "code", "streaming"],
    isOpenSource: true,
    offers: [["together-ai", 1.2, 1.2, 450, 80], ["fireworks-ai", 0.9, 0.9, 420, 85]],
    scores: { mmlu: 86.1, humaneval: 86.6, gsm8k: 91.5, math: 83.1, gpqa: 49.0 },
  },
];

async function main() {
  // Clear in dependency order so the seed can be re-run safely
  await prisma.benchmarkScore.deleteMany();
  await prisma.modelProvider.deleteMany();
  await prisma.model.deleteMany();
  await prisma.benchmark.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.lab.deleteMany();

  await prisma.lab.createMany({ data: labs });
  await prisma.provider.createMany({ data: providers });
  await prisma.benchmark.createMany({ data: benchmarks });

  const labId = Object.fromEntries((await prisma.lab.findMany()).map((l) => [l.slug, l.id]));
  const provId = Object.fromEntries((await prisma.provider.findMany()).map((p) => [p.slug, p.id]));
  const benchId = Object.fromEntries((await prisma.benchmark.findMany()).map((b) => [b.slug, b.id]));

  for (const m of models) {
    await prisma.model.create({
      data: {
        name: m.name,
        slug: m.slug,
        description: m.description,
        modelType: m.modelType,
        contextWindow: m.contextWindow,
        maxOutput: m.maxOutput,
        releaseDate: new Date(m.release),
        modalities: m.modalities,
        capabilities: m.capabilities,
        isOpenSource: m.isOpenSource,
        labId: labId[m.lab],
        providers: {
          create: m.offers.map(([p, inP, outP, lat, tps]) => ({
            providerId: provId[p],
            inputPricePerM: inP,
            outputPricePerM: outP,
            latencyMs: lat,
            throughputTps: tps,
          })),
        },
        scores: {
          create: Object.entries(m.scores).map(([b, score]) => ({
            benchmarkId: benchId[b],
            score,
          })),
        },
      },
    });
  }

  console.log(`Seeded ${labs.length} labs, ${providers.length} providers, ${benchmarks.length} benchmarks, ${models.length} models`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());