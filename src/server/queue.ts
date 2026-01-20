// Server-only module that imports BullMQ
import { Queue } from "bullmq";

export const jobQueue = new Queue("jobs");

export async function enqueueJob(data: unknown) {
  await jobQueue.add("job", data);
}
