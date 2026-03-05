import { streamText, stepCountIs, convertToModelMessages } from "ai";
import { chatModel } from "./provider.js";
import { getInformation } from "./rag.js";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const server = Bun.serve({
  port: 3000,
  fetch: async (req) => {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(req.url);

    if (url.pathname === "/api/chat" && req.method === "POST") {
      const { messages } = await req.json();

      const result = streamText({
        model: chatModel(process.env.CHAT_MODEL || "llama3.2"),
        system:
          "You are a helpful assistant. Use the getInformation tool to search the knowledge base before answering questions. Base your answers on the retrieved information.",
        messages: await convertToModelMessages(messages),
        tools: { getInformation },
        stopWhen: stepCountIs(3),
      });

      return result.toUIMessageStreamResponse({ headers: corsHeaders });
    }

    return new Response("Not found", { status: 404, headers: corsHeaders });
  },
});

console.log(`API server listening on http://localhost:${server.port}`);
