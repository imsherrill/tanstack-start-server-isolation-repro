// API route using server.handlers directly
// This proves server.handlers gets the same stripping treatment as createServerFn

import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
// Static import of db - which has extension that imports BullMQ
import { db } from "../server/db";

export const Route = createFileRoute("/api/users")({
  server: {
    handlers: {
      GET: async () => {
        const users = await db.user.findMany({ take: 10 });
        return json(users);
      },
      POST: async ({ request }) => {
        const body = await request.json();
        const user = await db.user.create({
          data: { email: body.email, name: body.name },
        });
        return json(user);
      },
    },
  },
});
