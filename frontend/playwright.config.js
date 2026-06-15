import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E configuration.
 *
 * These smoke tests run against the Vite dev server with VITE_SKIP_ZAMA=true
 * (i.e. no real ZamaProvider / FHE operations). They verify:
 *   - All 7 pages render without crashing
 *   - Navigation flows (landing → operator / recipient)
 *   - Form validation feedback (CSV errors, bad distribution ID format)
 *   - Wallet-connect gate (recipient pages show connect prompt when no wallet)
 *   - Privacy boundary: UI never leaks a wallet's allocation to another wallet
 *
 * For tests that exercise real contract interactions against a local Hardhat node,
 * run:  cd contracts && npx hardhat run scripts/e2e-local.js --network hardhat
 */
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.js",
  timeout: 30_000,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  // Start the Vite dev server with VITE_SKIP_ZAMA=true before running tests.
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    env: { VITE_SKIP_ZAMA: "true" },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
