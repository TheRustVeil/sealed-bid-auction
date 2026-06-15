const [signer] = await ethers.getSigners();
console.log("Deployer:", signer.address);
const bal = await ethers.provider.getBalance(signer.address);
console.log("Balance:", ethers.formatEther(bal), "ETH");
