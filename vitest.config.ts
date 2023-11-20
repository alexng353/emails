import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "istanbul", // or 'v8'
      reporter: ["lcov", "text-summary", "json", "html"],
    },
  },
});
