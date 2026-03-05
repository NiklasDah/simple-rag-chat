import { createAzure } from "@ai-sdk/azure";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const isAzure = process.env.AI_PROVIDER === "azure";

const azure = isAzure
  ? createAzure({
      resourceName: process.env.AZURE_RESOURCE_NAME!,
      apiKey: process.env.AZURE_API_KEY!,
    })
  : null;

const openai = !isAzure
  ? createOpenAICompatible({
      name: "provider",
      baseURL: process.env.AI_BASE_URL!,
      apiKey: process.env.AI_API_KEY,
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
  ? { openaiCompatible: { dimensions: dim } }
  : undefined;
