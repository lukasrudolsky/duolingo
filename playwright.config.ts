import fs from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Some sandboxes preinstall Chromium at a fixed path outside Playwright's own managed
// browser cache; when present, use it instead of the version-pinned binary Playwright
// would otherwise expect (and which "playwright install" would need to fetch). CI and
// local dev without that path fall back to Playwright's normal resolution.
const SANDBOX_CHROMIUM_PATH = "/opt/pw-browsers/chromium";
const launchOptions = fs.existsSync(SANDBOX_CHROMIUM_PATH)
  ? { executablePath: SANDBOX_CHROMIUM_PATH }
  : undefined;

// The dev server logs magic links to stdout instead of emailing them (see lib/auth.config.ts,
// RESEND_API_KEY unset). Redirecting that to a fixed file lets e2e tests read the link back
// out and drive a real login, without a test email inbox.
export const DEV_SERVER_LOG_PATH = "/tmp/duolingo-e2e-dev-server.log";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], launchOptions },
    },
    // 375px viewport, per Definition of Done (SPEC.md section 16). Emulated on the same
    // Chromium engine rather than a WebKit-based device preset like "iPhone SE", since only
    // Chromium is guaranteed to be available (see SANDBOX_CHROMIUM_PATH above).
    {
      name: "mobile",
      use: {
        browserName: "chromium",
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
        launchOptions,
      },
    },
  ],
  webServer: {
    command: `pnpm exec next dev -p 3100 > ${DEV_SERVER_LOG_PATH} 2>&1`,
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
