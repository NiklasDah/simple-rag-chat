import { streamText, stepCountIs, convertToModelMessages } from "ai";
import { chatModel } from "./provider.js";
import { getInformation } from "./rag.js";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, User-Agent",
};

function withCors(res: Response) {
  for (const [k, v] of Object.entries(corsHeaders)) {
    res.headers.set(k, v);
  }
  return res;
}

const server = Bun.serve({
  port: 3000,
  idleTimeout: 0,
  routes: {
    "/api/chat": {
      OPTIONS: () => withCors(new Response(null)),
      POST: async (req, server) => {
        server.timeout(req, 0);
        const { messages } = await req.json();

        const result = streamText({
          model: chatModel(process.env.CHAT_MODEL || "llama3.2"),
          system:
            "You are a helpful assistant. Use the getInformation tool to search the knowledge base before answering questions. Base your answers on the retrieved information.",
          messages: await convertToModelMessages(messages),
          tools: { getInformation },
          stopWhen: stepCountIs(3),
        });

        return withCors(result.toUIMessageStreamResponse());
      },
    },
  },
  fetch() {
    return withCors(new Response("Not found", { status: 404 }));
  },
});

console.log(`API server listening on http://localhost:${server.port}`);
