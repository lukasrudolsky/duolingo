import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["core/**/*.test.ts", "lib/**/*.test.ts", "db/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": import.meta.dirname },
  },
});
