// Route that uses server import OUTSIDE of server.handlers
// This should break - using db in component or loader without createServerFn

import { createFileRoute } from "@tanstack/react-router";
// Static import of db - which has extension that imports BullMQ
import { db } from "../server/db";

export const Route = createFileRoute("/users-broken")({
  component: UsersBrokenPage,
  // Using db in loader without createServerFn
  loader: async () => {
    const users = await db.user.findMany({ take: 10 });
    return { users };
  },
});

function UsersBrokenPage() {
  const { users } = Route.useLoaderData();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Users (Broken Pattern)</h1>
      <p>This uses db in a loader without createServerFn</p>
      <ul>
        {users.map((u: any) => (
          <li key={u.id}>{u.email}</li>
        ))}
      </ul>
    </div>
  );
}
