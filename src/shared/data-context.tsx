// Shared context that accidentally imports server code (db.ts)
// The import chain: this file -> db.ts -> queueExtension -> queue.ts -> bullmq -> fs
import { createContext, useContext, ReactNode } from "react";
import { db } from "../server/db";

interface DataContextValue {
  getUsers: () => Promise<unknown[]>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const getUsers = async () => {
    // @ts-expect-error - simplified for repro
    return db.user.findMany();
  };

  return (
    <DataContext.Provider value={{ getUsers }}>
      {children}
    </DataContext.Provider>
  );
}
