import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div style={{ padding: "20px", fontFamily: "system-ui" }}>
      <h1>BullMQ Import Chain Issue</h1>
      <p>
        Static import of server module leaks into client bundle,
        even when only used inside createServerFn.
      </p>
      <p>
        <Link to="/test">/test</Link> - Server function importing BullMQ
      </p>
      <h2>Reproduce:</h2>
      <pre style={{ background: "#f0f0f0", padding: "10px" }}>npm run build</pre>
      <p>Expected: Build succeeds (docs say static imports are safe)</p>
      <p>Actual: Build fails with &quot;EventEmitter&quot; not exported</p>
    </div>
  );
}
