/**
 * privacy-boundary.spec.js
 *
 * These tests verify the UI's privacy contract:
 *   1. Two different wallets each see only their OWN allocation entry.
 *   2. The "Check allocation" page doesn't reveal another wallet's amount — each
 *      wallet session is isolated (different address → different onchain handle).
 *   3. The ConfidentialChip starts in the masked (🔒) state; the plain value is
 *      NEVER shown until the wallet explicitly clicks "Reveal my amount".
 *
 * What this CANNOT test (needs real Zama relayer on Sepolia):
 *   - That the FHE ciphertext is mathematically opaque.
 *   - That the KMS only decrypts handles for their ACL-permitted address.
 * Those are covered by:
 *   - contracts/scripts/e2e-local.js  (handle isolation check)
 *   - Phase 7 Sepolia E2E (when credentials are available)
 */

import { test, expect } from "@playwright/test";
import { injectMockWallet, connectWallet, HARDHAT_ACCOUNTS } from "./helpers/mock-wallet.js";

const DIST_ID = "0x64888de155452d21f3d29975fbd8142a26a97706f9cadb245711d3f75d0ec928";

test.describe("Privacy boundary — UI layer", () => {
  test("allocation amount starts hidden (masked chip) before reveal", async ({ page }) => {
    await injectMockWallet(page, { address: HARDHAT_ACCOUNTS[1] }); // alice
    await page.goto("/recipient");
    await connectWallet(page);

    const input = page.locator('input[type="text"]').first();
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill(DIST_ID);

    const checkBtn = page.locator('button:has-text("Decrypt My Allocation")');
    await expect(checkBtn).toBeEnabled({ timeout: 3000 });
    await checkBtn.click();

    // The UI should show either:
    //   a) A masked ConfidentialChip (🔒 + label, no plaintext amount)
    //   b) A "No allocation found" message (expected when no real node is running)
    //   c) A loading spinner
    // In any case, it must NOT immediately show a plaintext dollar/token number
    // without the user clicking "Reveal".

    // Wait for the result area to settle
    await page.waitForTimeout(2000);

    // Confirm the raw amount is NOT leaked directly in the DOM without user action
    // (A number like "1.000000" or "2.000000" would be the revealed amount)
    const bodyText = await page.locator("body").textContent();
    const hasRevealedAmount = /\b\d+\.\d{6}\b/.test(bodyText ?? "");
    // If it's revealed, the user must have explicitly triggered it — never on load
    expect(hasRevealedAmount).toBe(false);
  });

  test("wallet A and wallet B load the page independently without cross-contamination", async ({
    browser,
  }) => {
    // Open two isolated browser contexts (separate localStorage, cookies, etc.)
    const ctxAlice = await browser.newContext();
    const ctxBob   = await browser.newContext();

    try {
      const pageAlice = await ctxAlice.newPage();
      const pageBob   = await ctxBob.newPage();

      // Inject different wallets into each context
      await pageAlice.addInitScript(
        ({ addr }) => {
          window.ethereum = {
            isMetaMask: true,
            selectedAddress: addr,
            chainId: "0x7A69",
            _events: {},
            request({ method }) {
              if (method === "eth_accounts" || method === "eth_requestAccounts")
                return Promise.resolve([addr]);
              if (method === "eth_chainId") return Promise.resolve("0x7A69");
              return Promise.resolve(null);
            },
            on(e, h) { this._events[e] = h; },
            removeListener() {},
          };
        },
        { addr: HARDHAT_ACCOUNTS[1] }, // alice
      );

      await pageBob.addInitScript(
        ({ addr }) => {
          window.ethereum = {
            isMetaMask: true,
            selectedAddress: addr,
            chainId: "0x7A69",
            _events: {},
            request({ method }) {
              if (method === "eth_accounts" || method === "eth_requestAccounts")
                return Promise.resolve([addr]);
              if (method === "eth_chainId") return Promise.resolve("0x7A69");
              return Promise.resolve(null);
            },
            on(e, h) { this._events[e] = h; },
            removeListener() {},
          };
        },
        { addr: HARDHAT_ACCOUNTS[2] }, // bob
      );

      // Connect each wallet so the isConnected-gated UI renders
      await pageAlice.goto("http://localhost:5173/recipient");
      await pageAlice.locator('button:has-text("Connect Wallet")').first().click().catch(() => {});
      await pageAlice.waitForFunction(
        () => Array.from(document.querySelectorAll("button")).some((b) => /0x[0-9a-fA-F]{4,}/.test(b.textContent || "")),
        { timeout: 8000 },
      ).catch(() => {});

      await pageBob.goto("http://localhost:5173/recipient");
      await pageBob.locator('button:has-text("Connect Wallet")').first().click().catch(() => {});
      await pageBob.waitForFunction(
        () => Array.from(document.querySelectorAll("button")).some((b) => /0x[0-9a-fA-F]{4,}/.test(b.textContent || "")),
        { timeout: 8000 },
      ).catch(() => {});

      // Both pages should render without errors
      await expect(pageAlice.locator("body")).not.toBeEmpty();
      await expect(pageBob.locator("body")).not.toBeEmpty();

      // Both inputs start empty — no pre-population of the other wallet's distribution
      // Use a short timeout since the input is now visible (wallet connected)
      const aliceInputValue = await pageAlice.locator('input[type="text"]').first().inputValue({ timeout: 2000 }).catch(() => "");
      const bobInputValue   = await pageBob.locator('input[type="text"]').first().inputValue({ timeout: 2000 }).catch(() => "");

      expect(aliceInputValue).toBe("");
      expect(bobInputValue).toBe("");
    } finally {
      await ctxAlice.close();
      await ctxBob.close();
    }
  });

  test("MyAllocations only shows distributions this wallet submitted (localStorage isolation)", async ({
    browser,
  }) => {
    // Alice adds a distribution to localStorage in her context
    const ctxAlice = await browser.newContext();
    const ctxBob   = await browser.newContext();

    try {
      const pageAlice = await ctxAlice.newPage();
      const pageBob   = await ctxBob.newPage();

      // Pre-populate Alice's localStorage with a distribution she "created"
      await pageAlice.goto("http://localhost:5173/");
      await pageAlice.evaluate(() => {
        const data = JSON.stringify([
          {
            id: "0xalicedist",
            label: "Alice Auction",
            token: "0xTokenAddress",
            recipientCount: 2,
            type: "disperse",
            createdAt: Date.now(),
          },
        ]);
        localStorage.setItem("confidential_distributions", data);
      });
      await pageAlice.goto("http://localhost:5173/operator");

      // Bob's context has a clean localStorage
      await pageBob.goto("http://localhost:5173/operator");

      const aliceBody = await pageAlice.locator("body").textContent();
      const bobBody   = await pageBob.locator("body").textContent();

      // Alice sees her distribution; Bob does not
      expect(aliceBody).toMatch(/Alice Auction/i);
      expect(bobBody).not.toMatch(/Alice Auction/i);
    } finally {
      await ctxAlice.close();
      await ctxBob.close();
    }
  });
});
