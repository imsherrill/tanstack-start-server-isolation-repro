// Database client with queue extension
// The extension imports BullMQ at the top level

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { queueOnMutationExtension } from "./extensions/queue-on-mutation";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
  pool: pg.Pool | undefined;
};

function createPrismaClient() {
  const pool = globalForPrisma.pool ?? new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  globalForPrisma.pool = pool;

  const adapter = new PrismaPg(pool);
  const base = new PrismaClient({ adapter });

  // Extend with the queue extension (which imports BullMQ)
  return base.$extends(queueOnMutationExtension());
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
