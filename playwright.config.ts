import { defineConfig, devices } from "@playwright/test";

const isUnsupportedLocalWebKit =
  process.platform === "darwin" && process.arch === "arm64" && !process.env.CI;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [["html", { outputFolder: "reports/html" }], ["list"]],

  use: {
    baseURL: process.env.API_BASE_URL || "http://127.0.0.1:4010",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  webServer: {
    command: "npm run mock:api",
    url: "http://127.0.0.1:4010/health",
    reuseExistingServer: !process.env.CI,
    timeout: 10_000,
  },

  projects: [
    {
      name: "api",
      testMatch: /.*\/api\/.*\.spec\.ts/,
    },
    {
      name: "chromium",
      testMatch: /.*\/ui\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      testMatch: /.*\/ui\/.*\.spec\.ts/,
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      testMatch: /.*\/ui\/.*\.spec\.ts/,
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-chrome",
      testMatch: /.*\/ui\/.*\.spec\.ts/,
      use: { ...devices["Pixel 5"] },
    },
  ].filter((project) => project.name !== "webkit" || !isUnsupportedLocalWebKit),
});
