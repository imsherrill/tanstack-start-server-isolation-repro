// Page route that imports shared context
// The shared context imports server code at top level, causing build failure
import { createFileRoute } from "@tanstack/react-router";
import { useJob, JobProvider } from "../shared/job-context";

export const Route = createFileRoute("/test")({
  component: TestPage,
});

function TestPage() {
  return (
    <JobProvider>
      <TestContent />
    </JobProvider>
  );
}

function TestContent() {
  const { submitJob } = useJob();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Test Page</h1>
      <button onClick={() => submitJob({ test: true })}>Submit Job</button>
    </div>
  );
}
