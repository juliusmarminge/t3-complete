import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";

const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";

const opts = {
  headless: !!process.env.CI || !!process.env.PLAYWRIGHT_HEADLESS,
  // collectCoverage: !!process.env.PLAYWRIGHT_HEADLESS
};

const config: PlaywrightTestConfig = {
  testDir: "./test",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: baseUrl,
    headless: opts.headless,
  },
};

export default config;
