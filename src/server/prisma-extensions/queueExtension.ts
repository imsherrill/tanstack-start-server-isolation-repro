// Prisma extension that queues BullMQ jobs on mutations
import { Prisma } from "@prisma/client";
import { queueJob } from "../queue";

export const queueExtension = Prisma.defineExtension({
  name: "queueExtension",
  query: {
    user: {
      async create({ args, query }) {
        const result = await query(args);
        await queueJob(result.id, { action: "create" });
        return result;
      },
    },
  },
});
