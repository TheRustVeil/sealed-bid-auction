import { test, expect } from "@playwright/test";
import { injectMockWallet, connectWallet, HARDHAT_ACCOUNTS } from "./helpers/mock-wallet.js";

const VALID_DIST_ID = "0x" + "64888de155452d21f3d29975fbd8142a26a97706f9cadb245711d3f75d0ec928";
const INVALID_ID    = "0xshort";

test.describe("Recipient — CheckAllocation", () => {
  test("renders without crashing", async ({ page }) => {
    await page.goto("/recipient");
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("shows connect-wallet prompt when no wallet is connected", async ({ page }) => {
    // No mock wallet injected — user is disconnected
    await page.goto("/recipient");
    await expect(page.locator("body")).toContainText(/connect/i);
  });

  test("shows distribution ID input when wallet is connected", async ({ page }) => {
    await injectMockWallet(page, { address: HARDHAT_ACCOUNTS[1] }); // alice
    await page.goto("/recipient");
    await connectWallet(page);
    const input = page.locator('input[type="text"]').first();
    await expect(input).toBeVisible({ timeout: 5000 });
  });

  test("shows validation error for a malformed distribution ID", async ({ page }) => {
    await injectMockWallet(page, { address: HARDHAT_ACCOUNTS[1] });
    await page.goto("/recipient");
    await connectWallet(page);
    const input = page.locator('input[type="text"]').first();
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill(INVALID_ID);
    await expect(page.locator("body")).toContainText(/32-byte|hex|0x/i);
  });

  test("accepts a valid 32-byte distribution ID format", async ({ page }) => {
    await injectMockWallet(page, { address: HARDHAT_ACCOUNTS[1] });
    await page.goto("/recipient");
    await connectWallet(page);
    const input = page.locator('input[type="text"]').first();
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill(VALID_DIST_ID);
    await expect(page.locator("body")).not.toContainText(/Must be a 32-byte/i);
  });

  test("Check Allocation button is disabled without a valid ID", async ({ page }) => {
    await injectMockWallet(page, { address: HARDHAT_ACCOUNTS[1] });
    await page.goto("/recipient");
    await connectWallet(page);
    const btn = page.locator('button:has-text("Decrypt My Allocation")').first();
    await expect(btn).toBeVisible({ timeout: 5000 });
    await expect(btn).toBeDisabled();
  });

  test("Check Allocation button becomes enabled with a valid ID", async ({ page }) => {
    await injectMockWallet(page, { address: HARDHAT_ACCOUNTS[1] });
    await page.goto("/recipient");
    await connectWallet(page);
    const input = page.locator('input[type="text"]').first();
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill(VALID_DIST_ID);
    const btn = page.locator('button:has-text("Decrypt My Allocation")');
    await expect(btn).toBeEnabled({ timeout: 3000 });
  });
});

test.describe("Recipient — MyAllocations", () => {
  test("renders without crashing", async ({ page }) => {
    await page.goto("/recipient/allocations");
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("shows appropriate content (empty list or allocation cards)", async ({ page }) => {
    await injectMockWallet(page, { address: HARDHAT_ACCOUNTS[1] });
    await page.goto("/recipient/allocations");
    // Should show either an empty state message or allocation cards
    await expect(page.locator("body")).toContainText(
      /allocation|no distribution|your allocation|portfolio/i,
    );
  });
});

test.describe("Recipient — VerifyProof", () => {
  test("renders without crashing", async ({ page }) => {
    await page.goto("/recipient/verify/0x1234");
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("contains verification-related content", async ({ page }) => {
    await page.goto("/recipient/verify/0x1234");
    await expect(page.locator("body")).toContainText(/verify|proof|claim|exist/i);
  });
});
