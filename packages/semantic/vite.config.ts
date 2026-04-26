/// <reference types="vitest" />
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [dts({ rollupTypes: true, include: ["src"] })],
  build: {
    lib: {
      entry: "src/index.ts",
      fileName: () => "index.js",
      formats: ["es"],
    },
    target: "node18",
    rollupOptions: {
      external: [/^node:/],
    },
  },
  test: {
    globals: true,
    environment: "node",
  },
});
