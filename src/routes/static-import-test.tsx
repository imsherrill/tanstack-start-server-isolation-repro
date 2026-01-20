// Client component that imports server functions
// The server functions import db which has a Prisma extension that imports BullMQ
// Import chain: this file → jobs.ts → db.ts → queue-on-mutation.ts → bullmq

import { createFileRoute } from "@tanstack/react-router";
import { createUser, getUsers } from "../server/jobs";

export const Route = createFileRoute("/static-import-test")({
  component: StaticImportTestPage,
});

function StaticImportTestPage() {
  const handleCreate = async () => {
    const user = await createUser({
      data: { email: `test-${Date.now()}@example.com` },
    });
    console.log("Created user:", user);
  };

  const handleFetch = async () => {
    const users = await getUsers();
    console.log("Users:", users);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Prisma + BullMQ Extension Test</h1>
      <p>
        This page imports server functions that use Prisma with an extension
        that queues BullMQ jobs on mutations.
      </p>
      <h2>Import chain:</h2>
      <pre style={{ background: "#f0f0f0", padding: "10px" }}>
{`static-import-test.tsx (client)
  → jobs.ts (server functions)
    → db.ts (Prisma client)
      → queue-on-mutation.ts (Prisma extension)
        → bullmq
          → Node.js built-ins (events, fs, etc.)`}
      </pre>
      <h2>Test:</h2>
      <button onClick={handleCreate} style={{ marginRight: "10px" }}>
        Create User (triggers queue)
      </button>
      <button onClick={handleFetch}>Fetch Users</button>
    </div>
  );
}
