// Pure API route - no component, no React, just server handlers
import { createFileRoute } from "@tanstack/react-router";
import { appRouter } from "../server/trpc";

export const Route = createFileRoute("/api/pure")({
  server: {
    GET: async () => {
      const caller = appRouter.createCaller({});
      const health = await caller.health();
      return new Response(JSON.stringify(health), {
        headers: { "Content-Type": "application/json" },
      });
    },
    POST: async ({ request }) => {
      const body = await request.json();
      return new Response(JSON.stringify({ received: body }), {
        headers: { "Content-Type": "application/json" },
      });
    },
  },
});
