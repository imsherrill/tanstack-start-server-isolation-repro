import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { appRouter } from "../server/trpc";

// MUST use createServerFn to properly isolate server code
const getData = createServerFn({ method: "GET" }).handler(async () => {
  const caller = appRouter.createCaller({});
  return caller.health();
});

export const Route = createFileRoute("/api/data")({
  loader: () => getData(),
  component: DataPage,
});

function DataPage() {
  const data = Route.useLoaderData();
  return (
    <div>
      <h1>Data Page</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
