// Route that uses server.handlers but imports logger at top level
// This pattern SHOULD work according to TanStack Start docs - server.handlers
// should isolate server code from client bundles
import { createFileRoute } from "@tanstack/react-router";
import logger from "../server/logger"; // Top-level server import
import { appRouter } from "../server/trpc";

export const Route = createFileRoute("/api/with-logger")({
  server: {
    handlers: {
      GET: async () => {
        logger.info({}, "Health check requested");
        const caller = appRouter.createCaller({});
        const health = await caller.health();
        logger.info({ health }, "Health check completed");
        return new Response(JSON.stringify(health), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
