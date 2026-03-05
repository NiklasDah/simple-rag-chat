import { createAzure } from "@ai-sdk/azure";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const provider =
  process.env.AI_PROVIDER === "azure"
    ? createAzure({
        resourceName: process.env.AZURE_RESOURCE_NAME!,
        apiKey: process.env.AZURE_API_KEY!,
      })
    : createOpenAICompatible({
        name: "provider",
        baseURL: process.env.AI_BASE_URL!,
        apiKey: process.env.AI_API_KEY,
      });
