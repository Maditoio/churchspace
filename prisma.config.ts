import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

// Load .env for local development (on Vercel the var is a real env var)
dotenv.config();

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
