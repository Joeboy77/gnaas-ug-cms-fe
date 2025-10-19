import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./__tests__/e2e",
  use: { baseURL: "http://localhost:5173" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
