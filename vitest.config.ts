import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import path from "path";

export default defineConfig(({ mode }) => ({
  // tsconfig uses "jsx": "preserve" (Next requirement), so esbuild would fall back
  // to the classic runtime and fail on `React is not defined` when a test
  // server-renders a .tsx component.
  esbuild: { jsx: "automatic" },
  test: {
    environment: "node",
    globals: true,
    include: ["src/__tests__/**/*.test.ts", "src/features/**/*.test.ts"],
    env: loadEnv(mode ?? "test", process.cwd(), ""),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
