import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";

const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";

const opts = {
  headless: !!process.env.CI || !!process.env.PLAYWRIGHT_HEADLESS,
  // collectCoverage: !!process.env.PLAYWRIGHT_HEADLESS
};

const config: PlaywrightTestConfig = {
  testDir: "./e2e",
  globalSetup: "./e2e/setup/global.ts",
  use: {
    ...devices["Desktop Chrome"],
    storageState: "./e2e/setup/storage-state.json",
    baseURL: baseUrl,
    headless: opts.headless,
  },
};

export default config;
