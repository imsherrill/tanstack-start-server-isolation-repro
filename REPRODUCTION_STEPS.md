# TanStack Start Server Code Leaking to Client Bundle - Reproduction

## Issue Summary

When using TanStack Start, server-only code leaks into the client bundle **if imported outside of `createServerFn`**. Even if the import is only used within a loader, Vite will bundle server code into the client if the import statement is at the top level of a route file.

## Root Cause

**Server code is only isolated when:**
1. It's imported inside a `createServerFn().handler()` callback
2. It's dynamically imported inside a server function

**Server code LEAKS to client when:**
1. It's imported at the top level of a route file and used in a `loader` directly
2. It's re-exported from a shared module that's imported by a route

## Environment

- Node.js: 20.19.0
- @tanstack/react-start: 1.149.3
- @tanstack/react-router: 1.149.3
- vite: 7.3.1
- typescript: 5.9.0-beta

---

## WORKING Pattern ✅

Server code is properly isolated when wrapped in `createServerFn`:

```tsx
// src/routes/api.health.tsx
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { appRouter } from "../server/trpc"; // Server-only import IS OK at top level

// The handler function isolates the server code
const getData = createServerFn({ method: "GET" }).handler(async () => {
  const caller = appRouter.createCaller({});
  return caller.health();
});

export const Route = createFileRoute("/api/health")({
  loader: () => getData(), // Call the server function
  component: HealthPage,
});
```

**Result**: ✅ Client bundle is clean, server code stays on server.

---

## BREAKING Pattern ❌

Server code leaks to client when used directly in a loader:

```tsx
// src/routes/api.data.tsx
import { createFileRoute } from "@tanstack/react-router";
import { appRouter } from "../server/trpc"; // Server-only import

export const Route = createFileRoute("/api/data")({
  loader: async () => {
    // PROBLEM: This runs during SSR but the import is bundled into client
    const caller = appRouter.createCaller({});
    return caller.health();
  },
  component: DataPage,
});
```

**Result**: ❌ Build fails with:
```
"EventEmitter" is not exported by "__vite-browser-external", imported by "node_modules/@openfeature/server-sdk/dist/esm/index.js".
```

---

## Packages Tested

The reproduction includes these server-only packages:
- `ioredis` - Redis client (uses `net`, `tls`, `fs`)
- `dd-trace` - DataDog tracing (uses `async_hooks`, `perf_hooks`)
- `bullmq` - Job queues (uses `child_process`, `events`)
- `@prisma/client` - Database client (uses `fs`, `path`)
- `@trpc/server` - TRPC router

All work correctly when wrapped in `createServerFn`. All fail when imported directly in loaders.

---

## How to Reproduce

1. Clone this repo
2. `npm install --legacy-peer-deps`
3. `npm run build` - Should succeed (routes use `createServerFn`)
4. Edit `src/routes/api.data.tsx` to remove `createServerFn` wrapper:

```tsx
// Change this:
const getData = createServerFn({ method: "GET" }).handler(async () => {
  const caller = appRouter.createCaller({});
  return caller.health();
});

export const Route = createFileRoute("/api/data")({
  loader: () => getData(),
  // ...
});

// To this:
import { appRouter } from "../server/trpc";

export const Route = createFileRoute("/api/data")({
  loader: async () => {
    const caller = appRouter.createCaller({});
    return caller.health();
  },
  // ...
});
```

5. `npm run build` - Will fail with EventEmitter not exported error

---

## Expected Behavior

Loaders run on the server during SSR, so server-only imports should be allowed in loader functions without needing to wrap everything in `createServerFn`.

Alternatively, better documentation should clarify that ALL server-only imports MUST be wrapped in `createServerFn`, even for SSR loaders.

## Impact on Migration

For teams migrating from Next.js, this is a significant issue because:
1. Next.js `getServerSideProps` allowed direct server imports
2. The mental model of "loaders run on server" suggests server imports should work
3. Every existing loader with server imports must be refactored to use `createServerFn`

---

## Workarounds

1. **Wrap all server code in `createServerFn`** - Works but verbose
2. **Use dynamic imports inside `createServerFn`** - Also works
3. **Add packages to `optimizeDeps.exclude`** - Only helps dev, not prod build
