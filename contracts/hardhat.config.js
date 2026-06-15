require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("./tasks/create-distribution");
require("./tasks/grant-access");

const { subtask } = require("hardhat/config");
const { TASK_TEST_SETUP_TEST_ENVIRONMENT } = require("hardhat/builtin-tasks/task-names");

// Fix pnpm dual-chai issue: hardhat-toolbox is a Junction to the pnpm store, so
// its chai.use() call lands on the store's chai instance, not the one that test
// files load from contracts/node_modules/chai.  Override the no-op setup subtask
// to re-register the matchers on the correct chai instance before mocha runs.
subtask(TASK_TEST_SETUP_TEST_ENVIRONMENT).setAction(async () => {
  const chai            = require("chai");
  const chaiAsPromised  = require("chai-as-promised");
  const { hardhatChaiMatchers } = require(
    "@nomicfoundation/hardhat-chai-matchers/internal/hardhatChaiMatchers"
  );
  chai.use(hardhatChaiMatchers);
  chai.use(chaiAsPromised);
});

const MNEMONIC = process.env.MNEMONIC ?? "test test test test test test test test test test test junk";
const INFURA_KEY = process.env.INFURA_API_KEY ?? "";
const SEPOLIA_RPC =
  process.env.SEPOLIA_RPC_URL ||
  (INFURA_KEY ? `https://sepolia.infura.io/v3/${INFURA_KEY}` : null) ||
  "https://ethereum-sepolia-rpc.publicnode.com";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: SEPOLIA_RPC,
      accounts: { mnemonic: MNEMONIC },
      chainId: 11155111,
      timeout: 120000,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY ?? "",
  },
  mocha: {
    timeout: 60000,
  },
};
