import { defineConfig, devices } from "@playwright/test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const external = process.env.APOWER_TEST_ORIGIN;
const baseURL = external ?? "http://127.0.0.1:3110";
export default defineConfig({
  testDir: "tests/live",
  workers: 1,
  timeout: 60000,
  use: {
    baseURL,
    ...devices["Desktop Chrome"],
    channel: "chrome",
    reducedMotion: "reduce",
  },
  reporter: "list",
  webServer: external
    ? undefined
    : {
        command:
          "node node_modules/next/dist/bin/next start runtime --hostname 127.0.0.1 --port 3110",
        url: baseURL + "/admin/",
        reuseExistingServer: false,
        env: {
          APOWER_PUBLIC_ORIGIN: baseURL,
          APOWER_BOOTSTRAP_PASSWORD: "LocalTestOnly!12345",
          APOWER_DATA_DIR: mkdtempSync(join(tmpdir(), "apower-admin-browser-")),
        },
      },
});
