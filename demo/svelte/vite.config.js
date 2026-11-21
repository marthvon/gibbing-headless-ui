import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { frontail } from "../frontail.js";

export default defineConfig({
  plugins: [tailwindcss(), svelte()],
  publicDir: "../public",
  server: { port: 5181 },
  preview: { port: 5181 },
  build: { chunkSizeWarningLimit: 1000 },
  resolve: { dedupe: ["svelte"], alias: frontail }
});
