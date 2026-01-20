# TanStack Start - BullMQ Import Chain Issue

Minimal reproduction showing that static imports of server-only modules leak into the client bundle when imported in shared/client files.

## The Issue

According to [TanStack Start docs](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions#static-imports-are-safe), static imports are safe:

> Server functions can be statically imported in any file, including client components. The build process handles environment shaking safely.

But when a shared context file imports a server module that uses BullMQ, the build fails because those imports leak into the client bundle.

## Reproduce

```bash
npm install
npm run build
```

## Expected

Build succeeds - server code should be stripped from client bundle.

## Actual

Build fails with:

```
"EventEmitter" is not exported by "__vite-browser-external"
```

## Files

- `src/server/queue.ts` - Server module that imports BullMQ
- `src/shared/job-context.tsx` - Shared context that imports the queue module
- `src/routes/test.tsx` - Page that uses the shared context

## Import Chain

```
src/routes/test.tsx (page component)
  → src/shared/job-context.tsx (shared context)
    → src/server/queue.ts (server module)
      → bullmq
        → events, fs, worker_threads (Node.js built-ins)
          → ❌ Build fails
```

The shared context imports the server module at the top level, causing BullMQ's Node.js dependencies to leak into the client bundle.
