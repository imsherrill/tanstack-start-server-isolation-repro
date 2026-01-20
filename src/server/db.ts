import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
// THIS IMPORT CHAIN CAUSES THE ISSUE:
// db.ts -> queueExtension -> queue.ts -> bullmq -> fs
import { queueExtension } from "./prisma-extensions/queueExtension";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
};

// Create PostgreSQL pool
const pool = globalForPrisma.pool ?? new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Create base Prisma client with adapter for Prisma 7
const basePrisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

// Extend with queue extension (which imports BullMQ)
export const db = globalForPrisma.prisma ?? basePrisma.$extends(queueExtension);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db as unknown as PrismaClient;
  globalForPrisma.pool = pool;
}
