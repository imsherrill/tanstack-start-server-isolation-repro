import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { appRouter } from "../server/trpc";
import { trpc } from "../client/trpc";
import { useState } from "react";

// Server function to demonstrate server-side tRPC calls work
const getServerHealth = createServerFn({ method: "GET" }).handler(async () => {
  const caller = appRouter.createCaller({});
  const health = await caller.health();
  return health;
});

export const Route = createFileRoute("/users")({
  loader: () => getServerHealth(),
  component: UsersPage,
});

function UsersPage() {
  const serverHealth = Route.useLoaderData();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  // Client-side tRPC query
  const { data: users, refetch, isLoading } = trpc.getUsers.useQuery();

  const createUser = trpc.createUser.useMutation({
    onSuccess: () => {
      refetch();
      setEmail("");
      setName("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      createUser.mutate({ email, name: name || undefined });
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "system-ui" }}>
      <h1>Users (tRPC + Server Loader Demo)</h1>

      <div style={{ marginBottom: "20px", padding: "10px", background: "#f0f0f0" }}>
        <strong>Server Health (from loader):</strong>{" "}
        <span data-testid="server-status">{serverHealth.status}</span>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="email-input"
            style={{ padding: "8px", marginRight: "10px" }}
          />
          <input
            type="text"
            placeholder="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-testid="name-input"
            style={{ padding: "8px", marginRight: "10px" }}
          />
          <button
            type="submit"
            disabled={createUser.isPending || !email}
            data-testid="create-user-btn"
            style={{ padding: "8px 16px" }}
          >
            {createUser.isPending ? "Creating..." : "Create User"}
          </button>
        </div>
        {createUser.error && (
          <div style={{ color: "red" }} data-testid="error-message">
            Error: {createUser.error.message}
          </div>
        )}
      </form>

      <h2>User List</h2>
      <div data-testid="user-list">
        {isLoading ? (
          <p>Loading users...</p>
        ) : users && users.length > 0 ? (
          <ul>
            {users.map((user) => (
              <li key={user.id} data-testid="user-item">
                {user.email} {user.name && `(${user.name})`}
              </li>
            ))}
          </ul>
        ) : (
          <p data-testid="no-users">No users yet. Create one above!</p>
        )}
      </div>
    </div>
  );
}
