// Prisma extension that queues BullMQ jobs on mutations
// This is a minimal version of a common pattern

import { Prisma } from "@prisma/client";
import { Queue } from "bullmq";

// BullMQ queue for background jobs
const jobQueue = new Queue("mutations", {
  connection: { host: "localhost", port: 6379 },
});

interface JobParams {
  model: string;
  operation: string;
  where?: unknown;
}

async function queueJob(params: JobParams) {
  await jobQueue.add("mutation", params, {
    removeOnComplete: true,
    removeOnFail: 100,
  });
}

export function queueOnMutationExtension() {
  return Prisma.defineExtension((prisma) =>
    prisma.$extends({
      query: {
        user: {
          async create({ args, query }) {
            const result = await query(args);
            await queueJob({
              model: "user",
              operation: "create",
              where: { id: result.id },
            });
            return result;
          },
          async update({ args, query }) {
            const result = await query(args);
            await queueJob({
              model: "user",
              operation: "update",
              where: args.where,
            });
            return result;
          },
        },
      },
    })
  );
}
