import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const provider = createOpenAICompatible({
  name: "provider",
  baseURL: process.env.AI_BASE_URL!,
  apiKey: process.env.AI_API_KEY,
});
