/**
 * setup.js — Mocha setup file loaded via hardhat.config.js mocha.require.
 *
 * Root cause: hardhat-toolbox is a pnpm Junction pointing to the pnpm store.
 * When the Junction's own require("chai") executes, Node resolves chai from the
 * store, producing a DIFFERENT module-cache entry than the chai that test files
 * load from contracts/node_modules/chai.  chai.use() in the toolbox registers
 * matchers on the store's instance; tests use the local instance → matchers
 * appear missing at test time.
 *
 * Fix: load hardhatChaiMatchers from the local contracts/node_modules path
 * (not through the Junction) and call chai.use() explicitly here, so both the
 * plugin code and the test files operate on the same chai instance.
 */

"use strict";

const chai            = require("chai");
const chaiAsPromised  = require("chai-as-promised");

// Load the plugin factory from the contracts-local copy of hardhat-chai-matchers.
// Resolved relative to this file → contracts/node_modules/@nomicfoundation/...
// (NOT the pnpm-store Junction), so its internal require("chai") also resolves
// to the same contracts/node_modules/chai instance.
const { hardhatChaiMatchers } = require(
  "@nomicfoundation/hardhat-chai-matchers/internal/hardhatChaiMatchers"
);

chai.use(hardhatChaiMatchers);
chai.use(chaiAsPromised);
