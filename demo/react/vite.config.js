import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { frontail } from "../frontail.js";

const source = fileURLToPath(new URL("../../packages/react/src/", import.meta.url));

export default defineConfig({
  plugins: [tailwindcss(), react()],
  publicDir: "../public",
  server: { port: 5180 },
  preview: { port: 5180 },
  build: { chunkSizeWarningLimit: 1000 },
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: [
      ...Object.entries(frontail).map(([find, replacement]) => ({ find, replacement })),
      { find: /^@marthvon\/gibbing-headless-ui\/(filters|phone|sorts)$/, replacement: `${source}_internal/$1` },
      { find: /^@marthvon\/gibbing-headless-ui\/(.+)$/, replacement: `${source}$1` }
    ]
  }
});
