// Prisma 7 no longer auto-loads .env files for the CLI (Migrate, Studio, seed), unlike
// Next.js which loads .env.local on its own. Load it explicitly here so `prisma migrate`
// and `prisma db seed` see the same DATABASE_URL as `next dev`.
import { config as loadDotenv } from "dotenv";
loadDotenv({ path: ".env.local" });
loadDotenv();

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "db/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: "db/migrations",
    seed: "tsx db/seed.ts",
  },
});
