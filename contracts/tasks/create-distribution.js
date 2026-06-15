const { task } = require("hardhat/config");

task("create-distribution", "Create a new distribution on ConfidentialDisperse")
  .addParam("contract", "ConfidentialDisperse contract address")
  .addParam("id", "Distribution ID as a 0x-prefixed bytes32 hex string")
  .addParam("token", "ERC-20 token contract address")
  .addParam("count", "Number of recipients")
  .setAction(async (taskArgs, hre) => {
    const [operator] = await hre.ethers.getSigners();
    console.log("Operator:", operator.address);

    const disperse = await hre.ethers.getContractAt("ConfidentialDisperse", taskArgs.contract);
    const tx = await disperse.createDistribution(
      taskArgs.id,
      taskArgs.token,
      BigInt(taskArgs.count)
    );
    const receipt = await tx.wait();

    console.log(`Distribution created.`);
    console.log(`  id=${taskArgs.id}`);
    console.log(`  token=${taskArgs.token}`);
    console.log(`  recipientCount=${taskArgs.count}`);
    console.log(`  tx=${receipt.hash}`);
  });
