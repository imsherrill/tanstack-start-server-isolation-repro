import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Full config matching main project
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tanstackStart({
      ssr: true,
    }),
    react(),
  ],
  server: {
    port: 3000,
  },
  optimizeDeps: {
    // Exact exclude list from main project
    exclude: [
      "dd-trace",
      "bullmq",
      "ioredis",
      "redis",
      "config",
      "hot-shots",
      "@mapbox/node-pre-gyp",
      "argon2",
      "next",
      "next-connect",
      "google-auth-library",
      "google-gax",
      "@grpc/grpc-js",
      "@azure/storage-blob",
      "playwright-core",
      "puppeteer",
      "express",
      "multer",
      "routing-controllers",
      "@slack/web-api",
      "@azure/msal-node",
      "pac-proxy-agent",
      "proxy-agent",
      "get-uri",
      "basic-ftp",
      "@tootallnate/quickjs-emscripten",
    ],
  },
  ssr: {
    noExternal: [
      "immer",
      "react-json-view",
      "hoist-non-react-statics",
    ],
    external: ["next", "next-connect", "argon2", "fs", "path", "fs/promises"],
    resolve: {
      conditions: ["node", "require"],
    },
  },
});
