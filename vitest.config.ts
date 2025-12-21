import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    // Note: happy-dom/jsdom environments have path resolution issues with Vitest v4.
    // Using node environment since current tests don't require DOM.
    // See: https://github.com/vitest-dev/vitest/issues/8431
    environment: "node",
    setupFiles: ["./test/test-setup.ts"],
  },
});
