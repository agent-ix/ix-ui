/// <reference types="vitest" />
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [dts({ rollupTypes: true, include: ["src"] })],
  esbuild: {
    jsx: "automatic",
  },
  build: {
    lib: {
      entry: "src/index.ts",
      fileName: () => "index.js",
      formats: ["es"],
    },
    target: "node18",
    rollupOptions: {
      external: [
        /^node:/,
        /^react($|\/)/,
        /^ink($|-)/,
        "@agent-ix/ix-ui-semantic",
        "picocolors",
      ],
    },
  },
  test: {
    globals: true,
    environment: "node",
  },
});
