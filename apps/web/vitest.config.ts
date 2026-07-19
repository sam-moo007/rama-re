import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    // Only scan unit/integration tests inside src — never Playwright e2e specs
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/*.spec.ts", "src/**/*.spec.tsx"],
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
    environment: "node",
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
