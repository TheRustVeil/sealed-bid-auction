const { task } = require("hardhat/config");

task("grant-access", "Grant an auditor decrypt access to a distribution")
  .addParam("contract", "ConfidentialDisperse contract address")
  .addParam("id", "Distribution ID as a 0x-prefixed bytes32 hex string")
  .addParam("auditor", "Auditor wallet address to whitelist")
  .setAction(async (taskArgs, hre) => {
    const [operator] = await hre.ethers.getSigners();
    console.log("Operator:", operator.address);

    const disperse = await hre.ethers.getContractAt("ConfidentialDisperse", taskArgs.contract);
    const tx = await disperse.grantDecryptAccess(taskArgs.id, taskArgs.auditor);
    const receipt = await tx.wait();

    console.log(`Auditor access granted.`);
    console.log(`  distributionId=${taskArgs.id}`);
    console.log(`  auditor=${taskArgs.auditor}`);
    console.log(`  tx=${receipt.hash}`);
  });
