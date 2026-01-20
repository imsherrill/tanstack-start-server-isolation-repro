// Page route that imports from shared context
// This causes the BullMQ import chain to leak into client bundle
import { createFileRoute } from "@tanstack/react-router";
import { useData, DataProvider } from "../shared/data-context";

export const Route = createFileRoute("/import-chain-test")({
  component: ImportChainTestPage,
});

function ImportChainTestPage() {
  return (
    <DataProvider>
      <TestContent />
    </DataProvider>
  );
}

function TestContent() {
  const { getUsers } = useData();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Import Chain Test</h1>
      <p>If you can see this page, the import chain issue did NOT occur.</p>
      <p>If Vite shows an error about &quot;fs&quot; module, the issue reproduced.</p>
      <button onClick={() => getUsers()}>Fetch Users</button>
    </div>
  );
}
