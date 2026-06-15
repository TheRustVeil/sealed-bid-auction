async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying distributors with:", deployer.address);

  const Disperse = await ethers.getContractFactory("ConfidentialDisperse");
  const disperse = await Disperse.deploy(deployer.address);
  await disperse.waitForDeployment();
  const disperseAddress = await disperse.getAddress();
  console.log("ConfidentialDisperse deployed to:", disperseAddress);

  const Airdrop = await ethers.getContractFactory("ConfidentialAirdrop");
  const airdrop = await Airdrop.deploy(deployer.address);
  await airdrop.waitForDeployment();
  const airdropAddress = await airdrop.getAddress();
  console.log("ConfidentialAirdrop  deployed to:", airdropAddress);
}

main().catch((err) => { console.error(err); process.exitCode = 1; });
