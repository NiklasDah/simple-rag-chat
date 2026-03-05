import { index, pgTable, serial, text, vector } from "drizzle-orm/pg-core";

const dimensions = parseInt(process.env.EMBEDDING_DIMENSIONS || "768");

export const embeddings = pgTable(
  "embeddings",
  {
    id: serial("id").primaryKey(),
    content: text("content").notNull(),
    source: text("source").notNull(),
    embedding: vector("embedding", { dimensions }).notNull(),
  },
  (table) => [
    index("embedding_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  ]
);
