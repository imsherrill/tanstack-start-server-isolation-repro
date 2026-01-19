# TanStack Start: Server Code Isolation Issue

## Summary

We're migrating a large Next.js application (~18000 modules) to TanStack Start. The production build (`vite build`) fails with server code leaking into the client bundle, specifically Node.js-only modules like `AsyncLocalStorage` from `async_hooks`.

This minimal reproduction demonstrates both working and failing patterns.

## The Problem

When using `server.handlers` for API routes, server code is properly isolated from the client bundle. However, in our main project, we're seeing server code leak into the client bundle despite using the correct patterns.

**Error:**
```
"AsyncLocalStorage" is not exported by "__vite-browser-external:async_hooks"
```

## What Works (In This Reproduction)

### Pattern 1: `server.handlers` with top-level server imports ✅

```tsx
// api.with-logger.ts
import { createFileRoute } from "@tanstack/react-router";
import logger from "../server/logger"; // Server import - uses AsyncLocalStorage

export const Route = createFileRoute("/api/with-logger")({
  server: {
    handlers: {
      GET: async () => {
        logger.info({}, "Request received");
        return new Response(JSON.stringify({ ok: true }));
      },
    },
  },
});
```

**Result:** Build succeeds! Server code is properly tree-shaken from client bundle.

### Pattern 2: `createServerFn` with server imports ✅

```tsx
// api.health.tsx
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { appRouter } from "../server/trpc";

const getHealth = createServerFn({ method: "GET" }).handler(async () => {
  const caller = appRouter.createCaller({});
  return caller.health();
});

export const Route = createFileRoute("/api/health")({
  loader: () => getHealth(),
  component: HealthPage,
});
```

**Result:** Build succeeds!

## What Fails

### Pattern 3: `loader` with direct server imports ❌

```tsx
// dashboard.tsx (NOT included in repo - would break build)
import { createFileRoute } from "@tanstack/react-router";
import logger from "../server/logger"; // Server import

export const Route = createFileRoute("/dashboard")({
  loader: async () => {
    logger.info({}, "Loading dashboard");
    return { data: "test" };
  },
  component: Dashboard,
});
```

**Result:** Build fails with `AsyncLocalStorage` error.

This is expected - loaders run on both client and server.

## The Mystery

Our main project (18000+ modules) uses Pattern 1 and Pattern 2 correctly for all API routes, but still fails with the same error.

In this small reproduction, Pattern 1 works perfectly. In our main project with the same pattern, it fails.

**Main project characteristics:**
- ~18000 modules transformed for client
- Many API routes using `server.handlers`
- Many page routes (no server imports)
- Custom Vite plugins for handling fs/path/Prisma

## To Reproduce

```bash
# Install dependencies
npm install

# Build (should succeed)
npm run build

# To see the failing pattern, uncomment dashboard.tsx in the repo
# and rebuild
```

## Questions

1. Why does `server.handlers` with top-level server imports work in this small reproduction but not in our larger codebase?

2. Is there a way to trace which file/import path is causing server code to leak into the client bundle?

3. Are there any known issues with `server.handlers` isolation in larger codebases?

## Environment

- TanStack React Router: 1.149.3
- TanStack React Start: 1.149.3
- Vite: 7.3.1
- Node: 22.x
