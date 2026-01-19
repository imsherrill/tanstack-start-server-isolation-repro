import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { appRouter } from "../server/trpc";

const getHealthStatus = createServerFn({ method: "GET" }).handler(async () => {
  // This runs on the server - call the TRPC router directly
  const caller = appRouter.createCaller({});
  const health = await caller.health();
  return health;
});

export const Route = createFileRoute("/api/health")({
  loader: () => getHealthStatus(),
  component: HealthPage,
});

function HealthPage() {
  const data = Route.useLoaderData();
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
