import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div style={{ padding: "20px", fontFamily: "system-ui" }}>
      <h1>Static Imports Bug Reproduction</h1>
      <p>
        Testing if "static imports are safe" as documented:
        <br />
        <a href="https://tanstack.com/start/latest/docs/framework/react/guide/server-functions#static-imports-are-safe">
          TanStack Start Docs
        </a>
      </p>
      <h2>Test:</h2>
      <p>
        <Link to="/static-import-test">/static-import-test</Link>
        {" - "}Server function with static BullMQ import
      </p>
      <h2>Expected:</h2>
      <p>Build succeeds - static imports in server function files should be stripped from client bundle.</p>
      <h2>Actual:</h2>
      <pre style={{ background: "#f0f0f0", padding: "10px" }}>
        npm run build fails with:{"\n"}
        "EventEmitter" is not exported by "__vite-browser-external"
      </pre>
    </div>
  );
}
