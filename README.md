# Simple RAG Chat

Minimal CLI-based RAG chat using Vercel AI SDK, pgvector, and Drizzle ORM. Runs on bun.

## Prerequisites

- [bun](https://bun.sh)
- [pnpm](https://pnpm.io)
- [Docker](https://docs.docker.com/get-docker/)

## Setup

```bash
# Install dependencies
pnpm install

# Copy env file and adjust if needed
cp .env.example .env

# Start pgvector database
docker compose up -d

# Run database migration
pnpm db:generate
pnpm db:migrate
```

## Usage

### Ingest documents

Drop `.pdf` or `.txt` files into the `documents/` directory, then run:

```bash
pnpm ingest
```

### Chat

```bash
pnpm chat
```

Type your questions and the assistant will search the knowledge base for relevant context. Type `exit` to quit.

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/rag` |
| `AI_BASE_URL` | AI provider base URL | `http://localhost:11434/v1` |
| `AI_API_KEY` | AI provider API key | `ollama` |
| `CHAT_MODEL` | Model for chat | `llama3.2` |
| `EMBEDDING_MODEL` | Model for embeddings | `nomic-embed-text` |
| `EMBEDDING_DIMENSIONS` | Embedding vector dimensions | `768` |
