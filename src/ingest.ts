import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { embedMany } from "ai";
import { provider } from "./provider.js";
import { db, client } from "./db/index.js";
import { embeddings } from "./db/schema.js";

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

function chunk(text: string): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
    chunks.push(text.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
}

async function extractText(filePath: string): Promise<string> {
  if (filePath.endsWith(".pdf")) {
    const { PDFParse } = await import("pdf-parse");
    const data = readFileSync(filePath);
    const pdf = new PDFParse({ data });
    const result = await pdf.getText();
    return result.text;
  }
  return readFileSync(filePath, "utf-8");
}

async function main() {
  const docsDir = join(import.meta.dirname, "../documents");
  const files = readdirSync(docsDir).filter(
    (f) => f.endsWith(".pdf") || f.endsWith(".txt")
  );

  if (files.length === 0) {
    console.log("No documents found in documents/. Add .pdf or .txt files.");
    process.exit(0);
  }

  const model = provider.embeddingModel(
    process.env.EMBEDDING_MODEL || "nomic-embed-text"
  );

  for (const file of files) {
    console.log(`Processing ${file}...`);
    const text = await extractText(join(docsDir, file));
    const chunks = chunk(text);
    console.log(`  ${chunks.length} chunks`);

    const { embeddings: vectors } = await embedMany({ model, values: chunks });

    const rows = chunks.map((content, i) => ({
      content,
      source: file,
      embedding: vectors[i],
    }));

    await db.insert(embeddings).values(rows);
    console.log(`  Inserted ${rows.length} embeddings`);
  }

  await client.end();
  console.log("Done.");
}

main();
