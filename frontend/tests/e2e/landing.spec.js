import { test, expect } from "@playwright/test";
import { injectMockWallet, HARDHAT_ACCOUNTS } from "./helpers/mock-wallet.js";

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await injectMockWallet(page, { address: HARDHAT_ACCOUNTS[0] });
    await page.goto("/");
  });

  test("page loads with a title", async ({ page }) => {
    // index.html title is "frontend"; just confirm the page loaded
    await expect(page).toHaveTitle(/.+/);
  });

  test("has ConfidentialDrop branding in the header", async ({ page }) => {
    await expect(page.locator("body")).toContainText(/ConfidentialDrop/i);
  });

  test("has an Operator call-to-action button", async ({ page }) => {
    const operatorBtn = page.locator('button:has-text("Launch Auction")').first();
    await expect(operatorBtn).toBeVisible();
  });

  test("has a Recipient call-to-action button", async ({ page }) => {
    const recipientBtn = page.locator('button:has-text("Check My Allocation")').first();
    await expect(recipientBtn).toBeVisible();
  });

  test("navigates to /operator when Operator button is clicked", async ({ page }) => {
    await page.locator('button:has-text("Launch Auction")').first().click();
    await expect(page).toHaveURL(/\/operator/);
  });

  test("navigates to /recipient when Recipient button is clicked", async ({ page }) => {
    await page.locator('button:has-text("Check My Allocation")').first().click();
    await expect(page).toHaveURL(/\/recipient/);
  });
});
