// Mimicking the main project's API route pattern with problematic packages
import { createFileRoute } from "@tanstack/react-router";
import { WebClient } from "@slack/web-api";
import { ConfidentialClientApplication } from "@azure/msal-node";
import gracefulFs from "graceful-fs";

export const Route = createFileRoute("/api/slack")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // These are just type checks - not actually using them
        const slackExists = typeof WebClient === "function";
        const msalExists = typeof ConfidentialClientApplication === "function";
        const fsExists = typeof gracefulFs.readFileSync === "function";

        return new Response(JSON.stringify({
          slackExists,
          msalExists,
          fsExists
        }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
