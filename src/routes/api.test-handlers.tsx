import { createFileRoute } from "@tanstack/react-router";
import { appRouter } from "../server/trpc"; // Server import at top level

// Testing the EXACT pattern from main project: server.handlers.GET
export const Route = createFileRoute("/api/test-handlers")({
  server: {
    handlers: {
      GET: async () => {
        const caller = appRouter.createCaller({});
        const health = await caller.health();
        return new Response(JSON.stringify(health), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
