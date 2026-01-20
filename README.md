# TanStack Start - Server Code Isolation

This repo tests which patterns safely isolate server code from the client bundle.

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

| Pattern | Build Result | Notes |
|---------|-------------|-------|
| `createServerFn` | ✅ Succeeds | Server code properly stripped |
| `server.handlers` | ✅ Succeeds | Server code properly stripped |
| `loader` (no createServerFn) | ❌ **Fails** | Server imports leak to client |

## The Problem: `loader` without `createServerFn`

```typescript
// ❌ BROKEN - loader runs on client during navigation
import { db } from "../server/db";

export const Route = createFileRoute("/users")({
  loader: async () => {
    const users = await db.user.findMany();  // This leaks to client!
    return { users };
  },
});
```

Build fails with:
```
"EventEmitter" is not exported by "__vite-browser-external"
```

## Safe Patterns

### 1. Use `createServerFn` for loaders

```typescript
// ✅ SAFE - createServerFn isolates server code
import { createServerFn } from "@tanstack/react-start";
import { db } from "../server/db";

const getUsers = createServerFn({ method: "GET" }).handler(async () => {
  return db.user.findMany();
});

export const Route = createFileRoute("/users")({
  loader: () => getUsers(),
});
```

### 2. `server.handlers` is already safe

```typescript
// ✅ SAFE - server.handlers are server-only
import { db } from "../server/db";

export const Route = createFileRoute("/api/users")({
  server: {
    handlers: {
      GET: async () => {
        const users = await db.user.findMany();
        return json(users);
      },
    },
  },
});
```

## Reproduce

```bash
npm install
npm run build  # Fails due to users-broken.tsx
```

Remove `users-broken.tsx` and build succeeds.

## Files

- `src/routes/users-broken.tsx` - Demonstrates the broken pattern (loader with static import)
- `src/routes/static-import-test.tsx` - Safe pattern using createServerFn
- `src/server/extensions/queue-on-mutation.ts` - Prisma extension with BullMQ
- `src/server/db.ts` - Prisma client with extension
- `src/server/jobs.ts` - Server functions using createServerFn
