import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "packages/**/src/**/*.test.ts",
      "packages/**/tests/**/*.test.ts",
      "apps/web/**/*.test.ts",
      "apps/web/**/*.test.tsx",
      "apps/api/**/*.test.ts",
    ],
    environment: "node",
    reporters: ["default"],
  },
});
