/**
 * mock-wallet.js — inject a mock EIP-1193 provider into the page.
 *
 * Usage:
 *   await injectMockWallet(page, { address: '0xabc...', chainId: 1 });
 *   await page.goto('/some-route');
 *   await connectWallet(page); // clicks "Connect Wallet" so wagmi isConnected=true
 *
 * The wagmi injected() connector calls window.ethereum.request().  This stub
 * satisfies all method calls the app makes during smoke testing.  It is
 * deliberately minimal — it only needs to prevent crashes, not process txs.
 */

export const HARDHAT_ACCOUNTS = [
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // account #0 (operator)
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // account #1 (alice)
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // account #2 (bob)
];

/**
 * Inject a mock window.ethereum into the page before any scripts run.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ address?: string, chainId?: number }} options
 */
export async function injectMockWallet(page, { address = HARDHAT_ACCOUNTS[0], chainId = 31337 } = {}) {
  await page.addInitScript(
    ({ addr, cid }) => {
      const hexChainId = "0x" + cid.toString(16);
      window.ethereum = {
        isMetaMask: true,
        selectedAddress: addr,
        chainId: hexChainId,
        _events: {},
        request({ method }) {
          switch (method) {
            case "eth_accounts":
            case "eth_requestAccounts":
              return Promise.resolve([addr]);
            case "eth_chainId":
              return Promise.resolve(hexChainId);
            case "net_version":
              return Promise.resolve(String(cid));
            case "wallet_switchEthereumChain":
            case "wallet_addEthereumChain":
              return Promise.resolve(null);
            case "eth_sendTransaction":
              return Promise.resolve(
                "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
              );
            case "eth_getBlockByNumber":
              return Promise.resolve({ number: "0x1", hash: "0x" + "0".repeat(64) });
            case "eth_blockNumber":
              return Promise.resolve("0x1");
            case "eth_getBalance":
              return Promise.resolve("0x56bc75e2d63100000"); // 100 ETH
            case "eth_call":
              return Promise.resolve("0x");
            default:
              return Promise.resolve(null);
          }
        },
        on(event, handler) {
          this._events[event] = handler;
        },
        removeListener() {},
        emit(event, ...args) {
          if (this._events[event]) this._events[event](...args);
        },
      };
    },
    { addr: address, cid: chainId },
  );
}

/**
 * Click the "Connect Wallet" button so wagmi transitions isConnected→true.
 *
 * Call this after page.goto() for any test that needs the wallet-gated UI.
 * Idempotent: does nothing if the wallet is already connected.
 *
 * @param {import('@playwright/test').Page} page
 */
export async function connectWallet(page) {
  const btn = page.locator('button:has-text("Connect Wallet")').first();
  const isVisible = await btn.isVisible({ timeout: 4000 }).catch(() => false);
  if (!isVisible) return; // already connected or button absent
  await btn.click();
  // Wait for wagmi state update — the button switches to a truncated "0x…" address
  await page.waitForFunction(
    () =>
      Array.from(document.querySelectorAll("button")).some((b) =>
        /0x[0-9a-fA-F]{4,}/.test(b.textContent || ""),
      ),
    { timeout: 8000 },
  );
}
