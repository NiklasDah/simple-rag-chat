import { createInterface } from "readline";
import { streamText, embed, tool, stepCountIs } from "ai";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { z } from "zod";
import { provider } from "./provider.js";
import { db } from "./db/index.js";
import { embeddings } from "./db/schema.js";

const embeddingModel = provider.embeddingModel(
  process.env.EMBEDDING_MODEL || "nomic-embed-text"
);

const getInformation = tool({
  description:
    "Search the knowledge base for relevant information. Call this whenever you need facts to answer a question.",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
  }),
  execute: async ({ query }) => {
    const { embedding } = await embed({ model: embeddingModel, value: query });
    const similarity = sql<number>`1 - (${cosineDistance(embeddings.embedding, embedding)})`;

    const results = await db
      .select({ content: embeddings.content, source: embeddings.source, similarity })
      .from(embeddings)
      .where(gt(similarity, 0.3))
      .orderBy(desc(similarity))
      .limit(4);

    return results.map((r) => `[${r.source}]: ${r.content}`).join("\n\n");
  },
});

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const messages: { role: "user" | "assistant"; content: string }[] = [];

  console.log("RAG Chat (type 'exit' to quit)\n");

  const ask = () => {
    rl.question("> ", async (input) => {
      if (input.trim().toLowerCase() === "exit") {
        rl.close();
        process.exit(0);
      }

      messages.push({ role: "user", content: input });

      const result = streamText({
        model: provider.chatModel(process.env.CHAT_MODEL || "llama3.2"),
        system:
          "You are a helpful assistant. Use the getInformation tool to search the knowledge base before answering questions. Base your answers on the retrieved information.",
        messages,
        tools: { getInformation },
        stopWhen: stepCountIs(3),
      });

      let fullResponse = "";
      process.stdout.write("\n");
      for await (const chunk of result.textStream) {
        process.stdout.write(chunk);
        fullResponse += chunk;
      }
      process.stdout.write("\n\n");

      messages.push({ role: "assistant", content: fullResponse });
      ask();
    });
  };

  ask();
}

main();
