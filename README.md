# TanStack Start - Server Code Isolation

This repo proves that both `createServerFn` AND `server.handlers` properly strip server code from the client bundle.

## Test Case

Prisma client with an extension that queues BullMQ jobs on mutations.

### Import Chain

```
route file
  → db.ts (Prisma client)
    → queue-on-mutation.ts (Prisma extension)
      → bullmq
        → events, fs, worker_threads (Node.js built-ins)
```

## Results

| Pattern | Build Result | Client Bundle |
|---------|-------------|---------------|
| `createServerFn` | ✅ Succeeds | Server code stripped |
| `server.handlers` | ✅ Succeeds | Server code stripped |

Both patterns properly isolate server-only code from the client bundle.

## Build Test

```bash
npm install
npm run build
```

Output:
```
vite v7.3.1 building client environment for production...
✓ 154 modules transformed.
dist/client/assets/static-import-test-*.js    5.36 kB  # No BullMQ
dist/client/assets/main-*.js                264.65 kB
✓ built in 641ms
```

## Pattern 1: `createServerFn`

```typescript
// src/server/jobs.ts
import { createServerFn } from "@tanstack/react-start";
import { db } from "./db";  // Static import - safe!

export const createUser = createServerFn({ method: "POST" }).handler(async () => {
  return db.user.create({ data: { email: "test@example.com" } });
});
```

```typescript
// src/routes/static-import-test.tsx (client component)
import { createUser } from "../server/jobs";  // Safe to import

function Page() {
  return <button onClick={() => createUser()}>Create</button>;
}
```

## Pattern 2: `server.handlers`

```typescript
// src/routes/api.users.ts
import { db } from "../server/db";  // Static import - safe!

export const Route = createFileRoute("/api/users")({
  server: {
    handlers: {
      GET: async () => {
        const users = await db.user.findMany();
        return json(users);
      },
      POST: async ({ request }) => {
        const body = await request.json();
        return json(await db.user.create({ data: body }));
      },
    },
  },
});
```

## Files

- `src/routes/api.users.ts` - API route using `server.handlers` with static db import
- `src/routes/static-import-test.tsx` - Client component using `createServerFn`
- `src/server/jobs.ts` - Server functions using `createServerFn`
- `src/server/db.ts` - Prisma client with queue extension
- `src/server/extensions/queue-on-mutation.ts` - Prisma extension importing BullMQ

## Conclusion

Both `createServerFn` and `server.handlers` receive the same code-stripping treatment from the TanStack Start build plugin. Static imports of server-only modules (like BullMQ) are safe in both patterns.
