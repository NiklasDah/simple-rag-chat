import { createAzure } from "@ai-sdk/azure";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const isAzure = process.env.AI_PROVIDER === "azure";
const proxyUrl =
  process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy;

const proxyFetch = proxyUrl
  ? (((url: RequestInfo | URL, init?: RequestInit) =>
      fetch(url, { ...init, proxy: proxyUrl } as any)) as typeof globalThis.fetch)
  : undefined;

const azure = isAzure
  ? createAzure({
      resourceName: process.env.AZURE_RESOURCE_NAME!,
      apiKey: process.env.AZURE_API_KEY!,
      fetch: proxyFetch,
    })
  : null;

const openai = !isAzure
  ? createOpenAICompatible({
      name: "provider",
      baseURL: process.env.AI_BASE_URL!,
      apiKey: process.env.AI_API_KEY,
      fetch: proxyFetch,
    })
  : null;

export const chatModel = (model: string) =>
  azure ? azure(model) : openai!.chatModel(model);

export const embeddingModel = (model: string) =>
  azure ? azure.embedding(model) : openai!.embeddingModel(model);

const dim = process.env.EMBEDDING_DIMENSIONS
  ? parseInt(process.env.EMBEDDING_DIMENSIONS)
  : undefined;

export const embeddingProviderOptions = dim
  ? isAzure
    ? { openai: { dimensions: dim } }
    : { openaiCompatible: { dimensions: dim } }
  : undefined;
