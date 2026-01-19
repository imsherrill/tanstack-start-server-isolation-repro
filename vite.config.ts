import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Plugin to alias Node.js built-ins: stubs for client, node: prefix for SSR
// Copied from main project to test if this breaks server isolation
function nodeBuiltinsClientAlias(): Plugin {
  return {
    name: "node-builtins-client-alias",
    enforce: "pre",
    resolveId(id, importer, options) {
      // For SSR, map bare fs/path imports to node: prefixed versions
      if (options?.ssr) {
        if (id === "fs") {
          return { id: "node:fs", external: true };
        }
        if (id === "path") {
          return { id: "node:path", external: true };
        }
        if (id === "fs/promises") {
          return { id: "node:fs/promises", external: true };
        }
        return null;
      }

      // For client bundles, mark as external (will fail if actually used)
      if (id === "fs" || id === "fs/promises" || id === "path") {
        // Return empty for client - this makes it fail if actually imported
        return null; // Let Vite handle it (will externalize for browser)
      }
      return null;
    },
  };
}

// Matching more of the main project's config to reproduce the issue
export default defineConfig({
  plugins: [
    nodeBuiltinsClientAlias(), // Added from main project
    tsconfigPaths(),
    tanstackStart({
      ssr: true,
    }),
    react(),
  ],
  server: {
    port: 3000,
  },
  // Adding SSR config similar to main project
  ssr: {
    noExternal: [
      "immer",
      "hoist-non-react-statics",
    ],
    external: ["fs", "path", "fs/promises"],
    resolve: {
      conditions: ["node", "require"],
    },
  },
});
