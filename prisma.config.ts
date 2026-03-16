import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

// Load .env for local development (on Vercel the var is a real env var)
dotenv.config();

function resolveDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.DIRECT_DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ""
  );
}

function resolveDirectDatabaseUrl() {
  return (
    process.env.DIRECT_DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    ""
  );
}

export default defineConfig({
  datasource: {
    url: resolveDatabaseUrl(),
    directUrl: resolveDirectDatabaseUrl(),
  },
});
