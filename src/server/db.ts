// Database client with queue extension
// The extension imports BullMQ at the top level

import { PrismaClient } from "@prisma/client";
import { queueOnMutationExtension } from "./extensions/queue-on-mutation";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function createPrismaClient() {
  const base = new PrismaClient();
  // Extend with the queue extension (which imports BullMQ)
  return base.$extends(queueOnMutationExtension());
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
