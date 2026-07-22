import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  var __prisma: PrismaClient | undefined;
  var __pgPool: Pool | undefined;
}

function createClient() {
  const pool =
    globalThis.__pgPool ??
    new Pool({ connectionString: process.env.DATABASE_URL });
  globalThis.__pgPool = pool;
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const db = globalThis.__prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = db;
}
