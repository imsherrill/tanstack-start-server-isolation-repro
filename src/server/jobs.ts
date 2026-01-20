// Server functions file that uses Prisma with queue extension
// The db import pulls in the queue extension which imports BullMQ

import { createServerFn } from "@tanstack/react-start";
// Static import of db - which has extension that imports BullMQ
import { db } from "./db";

// Server function that does a Prisma operation
// The extension will queue a job automatically on mutation
export const createUser = createServerFn({ method: "POST" }).handler(
  async (ctx: { data: { email: string; name?: string } }) => {
    const user = await db.user.create({
      data: {
        email: ctx.data.email,
        name: ctx.data.name,
      },
    });
    return user;
  }
);

export const getUsers = createServerFn({ method: "GET" }).handler(async () => {
  const users = await db.user.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
  });
  return users;
});
