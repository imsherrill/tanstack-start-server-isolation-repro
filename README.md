# TanStack Start - Static Imports Are Safe

This repo proves that **static imports ARE safe** when using `createServerFn`, as documented in the [TanStack Start docs](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions#static-imports-are-safe).

## Test Case

A realistic production pattern: Prisma client with an extension that queues BullMQ jobs on mutations.

### Import Chain

```
src/routes/static-import-test.tsx (client component)
  → src/server/jobs.ts (server functions via createServerFn)
    → src/server/db.ts (Prisma client)
      → src/server/extensions/queue-on-mutation.ts (Prisma extension)
        → bullmq
          → events, fs, worker_threads (Node.js built-ins)
```

### Files

- `src/server/extensions/queue-on-mutation.ts` - Prisma extension with **static** BullMQ import at top level
- `src/server/db.ts` - Prisma client extended with the queue extension
- `src/server/jobs.ts` - Server functions using `createServerFn` that import db
- `src/routes/static-import-test.tsx` - Client component importing server functions

## Build Test

```bash
npm install
npm run build
```

### Result: ✅ Build Succeeds

```
vite v7.3.1 building client environment for production...
✓ 152 modules transformed.
dist/client/assets/static-import-test-AKyKUMw-.js    5.36 kB
✓ built in 660ms
```

BullMQ and its Node.js dependencies are **NOT** included in the client bundle.

## Key Insight

The `createServerFn` wrapper is what makes static imports safe. It marks the code path as server-only, allowing the bundler to strip it from the client build.

### Safe Pattern ✅

```typescript
// server/jobs.ts
import { createServerFn } from "@tanstack/react-start";
import { db } from "./db"; // Static import - this is safe!

export const createUser = createServerFn({ method: "POST" }).handler(async () => {
  return db.user.create({ data: { email: "test@example.com" } });
});
```

```typescript
// routes/page.tsx (client)
import { createUser } from "../server/jobs"; // Safe - importing server function
```

### Unsafe Pattern ❌

```typescript
// shared/context.tsx
import { db } from "../server/db"; // Direct import without createServerFn

export function DataProvider({ children }) {
  // Using db directly in client code - this will fail!
  const users = db.user.findMany();
}
```

## Conclusion

The TanStack Start documentation is correct: **static imports are safe** when you use `createServerFn`. The build process properly strips server-only code from the client bundle, even with deep import chains involving Node.js-only dependencies like BullMQ.
