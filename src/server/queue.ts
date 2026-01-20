// Server-only module that exports BullMQ queue
import { Queue } from "bullmq";

export const jobQueue = new Queue("job-queue");

export async function queueJob(id: string, data: unknown) {
  await jobQueue.add("job", { id, data, timestamp: Date.now() });
}
