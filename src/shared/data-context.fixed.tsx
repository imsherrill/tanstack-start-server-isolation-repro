// FIXED: Shared context that does NOT import server code at top level
// Instead, server operations are wrapped in createServerFn

import { createContext, useContext, ReactNode, useState } from "react";
import { createServerFn } from "@tanstack/react-start";

// Server function wraps the import - it stays server-side only
const getUsers = createServerFn({ method: "GET" }).handler(async () => {
  // Import inside the handler - this code is stripped from client bundle
  const { db } = await import("../server/db");
  return db.user.findMany();
});

interface DataContextValue {
  users: unknown[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await getUsers();
      setUsers(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DataContext.Provider value={{ users, loading, fetchUsers }}>
      {children}
    </DataContext.Provider>
  );
}
