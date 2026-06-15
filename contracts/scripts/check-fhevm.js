const { ethers } = require("hardhat");
const EIP1967_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
const ADDRS = {
  ACL: "0xFee8407e2f5e3Ee68ad77cAE98c434e637f516e5",
  TFHEExecutor: "0x687408aB54661ba0b4aeF3a44156c616c6955E07",
  Gateway: "0x33347831500F1e73f0ccCBb95c9f86B94d7b1123",
};
async function main() {
  for (const [name, proxy] of Object.entries(ADDRS)) {
    const raw = await ethers.provider.getStorage(proxy, EIP1967_SLOT);
    const impl = "0x" + raw.slice(-40);
    const implCode = await ethers.provider.getCode(impl);
    console.log(`${name}: impl=${impl} (${(implCode.length-2)/2} bytes)`);
  }
}
main().catch(console.error);
