import { config } from "dotenv";
import { relative, resolve } from "node:path";
import { defineConfig } from "drizzle-kit";

const root = __dirname;
config({ path: resolve(root, ".env") });

export default defineConfig({
  dialect: "postgresql",
  schema: resolve(root, "apps/api/src/db/schema.ts"),
  out: relative(process.cwd(), resolve(root, "drizzle")),
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
