import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/web",
  testMatch: "*.spec.mjs",
  retries: 0,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4178",
    browserName: "chromium",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node tests/web/server.mjs",
    url: "http://127.0.0.1:4178",
    reuseExistingServer: false,
  },
});
