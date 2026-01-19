import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div>
      <h1>TanStack Start Reproduction</h1>
      <p>Testing server code isolation</p>
    </div>
  );
}
