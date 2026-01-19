import { initTRPC } from "@trpc/server";
import Redis from "ioredis";
import tracer from "dd-trace";
import { Queue } from "bullmq";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { db } from "./db";

// Server-only imports at top level
const redis = typeof Redis === "function" ? "Redis available" : "Redis not available";
const tracing = typeof tracer !== "undefined" ? "Tracer available" : "Tracer not available";
const queues = typeof Queue === "function" ? "BullMQ available" : "BullMQ not available";
const prisma = typeof PrismaClient === "function" ? "Prisma available" : "Prisma not available";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = t.router({
  health: t.procedure.query(() => {
    return {
      status: "ok",
      timestamp: Date.now(),
      serverDeps: { redis, tracing, queues, prisma },
    };
  }),
  echo: t.procedure.input(z.string()).query(({ input }) => {
    return `Echo: ${input}`;
  }),
  getUsers: t.procedure.query(async () => {
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return users;
  }),
  createUser: t.procedure
    .input(z.object({ email: z.string().email(), name: z.string().optional() }))
    .mutation(async ({ input }) => {
      const user = await db.user.create({
        data: input,
      });
      return user;
    }),
});

export type AppRouter = typeof appRouter;
