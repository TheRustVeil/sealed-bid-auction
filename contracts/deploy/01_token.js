async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying ConfidentialToken with:", deployer.address);

  const name = process.env.TOKEN_NAME ?? "ConfidentialToken";
  const symbol = process.env.TOKEN_SYMBOL ?? "CTOK";
  const decimals = Number(process.env.TOKEN_DECIMALS ?? "18");

  const Token = await ethers.getContractFactory("ConfidentialToken");
  const token = await Token.deploy(name, symbol, decimals, deployer.address);
  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log("ConfidentialToken deployed to:", address);
  console.log(`  name=${name}  symbol=${symbol}  decimals=${decimals}  owner=${deployer.address}`);
}

main().catch((err) => { console.error(err); process.exitCode = 1; });
