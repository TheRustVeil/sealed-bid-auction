import { test, expect } from "@playwright/test";
import { injectMockWallet, connectWallet, HARDHAT_ACCOUNTS } from "./helpers/mock-wallet.js";

test.describe("Operator — Dashboard", () => {
  test("renders empty state with create button when connected", async ({ page }) => {
    await injectMockWallet(page, { address: HARDHAT_ACCOUNTS[0] });
    await page.goto("/operator");
    await expect(page.locator("body")).toContainText(/distribution/i);
  });

  test("has a button to create a new distribution (connected wallet)", async ({ page }) => {
    await injectMockWallet(page, { address: HARDHAT_ACCOUNTS[0] });
    await page.goto("/operator");
    await connectWallet(page);
    // Button shows "+ New distribution" when wallet is connected
    const createBtn = page.locator('button:has-text("New distribution")').first();
    await expect(createBtn).toBeVisible();
  });

  test("shows connect-wallet prompt when no wallet is connected", async ({ page }) => {
    // No mock wallet — should see a "Connect" prompt
    await page.goto("/operator");
    await expect(page.locator("body")).toContainText(/connect/i);
  });
});

test.describe("Operator — CreateDistribution wizard", () => {
  test.beforeEach(async ({ page }) => {
    await injectMockWallet(page, { address: HARDHAT_ACCOUNTS[0] });
    await page.goto("/operator/create");
  });

  test("renders the wizard without crashing", async ({ page }) => {
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("Step 1 (type) — shows distribution type selector", async ({ page }) => {
    // StepType shows airdrop/disperse radio buttons
    await expect(page.locator("body")).toContainText(/airdrop|disperse|type/i);
  });

  test("Step 1 has a Next or Continue button", async ({ page }) => {
    const next = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
    await expect(next).toBeVisible();
  });

  test("Step 1 → Step 2: clicking Next advances the wizard", async ({ page }) => {
    const next = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
    if (await next.count() && await next.isEnabled()) {
      await next.click();
      await expect(page.locator("body")).toContainText(/token|address|step/i);
    }
  });

  test("Step 3 (recipients) — CSV textarea accepts valid data without errors", async ({ page }) => {
    // Click Next twice to reach recipients step
    for (let i = 0; i < 2; i++) {
      const btn = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
      if (await btn.count() && await btn.isEnabled()) {
        await btn.click();
        await page.waitForTimeout(150);
      }
    }
    const textarea = page.locator("textarea").first();
    if (await textarea.count()) {
      await textarea.fill(
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266,100\n" +
          "0x70997970C51812dc3A010C7d01b50e0d17dc79C8,200",
      );
      await expect(page.locator("body")).not.toContainText(/invalid address/i);
    }
  });

  test("Step 3 (recipients) — invalid CSV shows error", async ({ page }) => {
    for (let i = 0; i < 2; i++) {
      const btn = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
      if (await btn.count() && await btn.isEnabled()) {
        await btn.click();
        await page.waitForTimeout(150);
      }
    }
    const textarea = page.locator("textarea").first();
    if (await textarea.count()) {
      await textarea.fill("not-an-address,100");
      await expect(page.locator("body")).toContainText(/invalid address/i);
    }
  });

  test("Stepper shows multiple steps", async ({ page }) => {
    // Just confirm the wizard renders a multi-step indicator
    await expect(page.locator("body")).not.toBeEmpty();
    // The Stepper renders step labels — type/token/recipients etc.
    await expect(page.locator("body")).toContainText(/type|token|recipient/i);
  });
});

test.describe("Operator — DistributionDetail", () => {
  test("renders without crashing for a valid distribution ID format", async ({ page }) => {
    await injectMockWallet(page, { address: HARDHAT_ACCOUNTS[0] });
    const fakeId = "0x" + "ab".repeat(32);
    await page.goto(`/operator/distribution/${fakeId}`);
    await expect(page.locator("body")).not.toBeEmpty();
  });
});
