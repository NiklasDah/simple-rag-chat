import { embed, tool } from "ai";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { z } from "zod";
import { embeddingModel } from "./provider.js";
import { db } from "./db/index.js";
import { embeddings } from "./db/schema.js";

const embedding = embeddingModel(
  process.env.EMBEDDING_MODEL || "nomic-embed-text"
);

export const getInformation = tool({
  description:
    "Search the knowledge base for relevant information. Call this whenever you need facts to answer a question.",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
  }),
  execute: async ({ query }) => {
    const { embedding: vec } = await embed({ model: embedding, value: query });
    const similarity = sql<number>`1 - (${cosineDistance(embeddings.embedding, vec)})`;

    const results = await db
      .select({ content: embeddings.content, source: embeddings.source, similarity })
      .from(embeddings)
      .where(gt(similarity, 0.3))
      .orderBy(desc(similarity))
      .limit(4);

    return results.map((r) => `[${r.source}]: ${r.content}`).join("\n\n");
  },
});
