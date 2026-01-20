// FIXED: Page route using the fixed context pattern
// Server code is wrapped in createServerFn, not imported at top level
import { createFileRoute } from "@tanstack/react-router";
import { useData, DataProvider } from "../shared/data-context.fixed";

export const Route = createFileRoute("/import-chain-fixed")({
  component: ImportChainFixedPage,
});

function ImportChainFixedPage() {
  return (
    <DataProvider>
      <TestContent />
    </DataProvider>
  );
}

function TestContent() {
  const { users, loading, fetchUsers } = useData();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Import Chain Fixed</h1>
      <p>This page uses the FIXED pattern - server code wrapped in createServerFn.</p>
      <p>The build should succeed because server imports are inside the handler.</p>
      <button onClick={fetchUsers} disabled={loading}>
        {loading ? "Loading..." : "Fetch Users"}
      </button>
      {users.length > 0 && (
        <ul>
          {users.map((u: any) => (
            <li key={u.id}>{u.email}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
