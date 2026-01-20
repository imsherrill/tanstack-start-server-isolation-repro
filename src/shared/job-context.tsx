// Shared context that imports server code at top level
// This pattern causes the build to fail
import { createContext, useContext, ReactNode } from "react";
import { enqueueJob } from "../server/queue"; // Top-level import of server module

interface JobContextValue {
  submitJob: (data: unknown) => Promise<void>;
}

const JobContext = createContext<JobContextValue | null>(null);

export function useJob() {
  const ctx = useContext(JobContext);
  if (!ctx) throw new Error("useJob must be used within JobProvider");
  return ctx;
}

export function JobProvider({ children }: { children: ReactNode }) {
  const submitJob = async (data: unknown) => {
    await enqueueJob(data);
  };

  return (
    <JobContext.Provider value={{ submitJob }}>
      {children}
    </JobContext.Provider>
  );
}
