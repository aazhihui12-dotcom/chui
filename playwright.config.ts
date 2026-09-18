import { defineConfig, devices } from "@playwright/test";

// The desktop shell may set NO_COLOR while Playwright forces worker colors.
// Prefer one setting so every worker does not emit a Node warning.
if (process.env.NO_COLOR !== undefined) delete process.env.NO_COLOR;
const staticPreview = process.env.PLAYWRIGHT_STATIC === "1";
const baseURL = `http://127.0.0.1:${staticPreview ? 3001 : 3000}`;

export default defineConfig({
  testDir: "./tests/e2e",
  snapshotPathTemplate: "{testDir}/../visual/baseline/{arg}{ext}",
  use: {
    baseURL,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
  webServer: {
    command: staticPreview ? "npm start -- -p 3001" : "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
