import { useState } from 'react';
import { useWatchContractEvent } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../../../app/config';

const ACTIVITY_ABI = [
  {
    name: 'DistributionCreated', type: 'event',
    inputs: [
      { name: 'id', type: 'bytes32', indexed: true },
      { name: 'operator', type: 'address', indexed: true },
      { name: 'token', type: 'address', indexed: false },
      { name: 'recipientCount', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'DistributionFunded', type: 'event',
    inputs: [
      { name: 'id', type: 'bytes32', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'newTotal', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'DistributionExecuted', type: 'event',
    inputs: [
      { name: 'id', type: 'bytes32', indexed: true },
      { name: 'recipientCount', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'AllocationClaimed', type: 'event',
    inputs: [
      { name: 'id', type: 'bytes32', indexed: true },
      { name: 'recipient', type: 'address', indexed: true },
      { name: 'amount', type: 'uint64', indexed: false },
    ],
  },
];

const MAX_ENTRIES = 20;

function makeEntry(message) {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, message, ts: Date.now() };
}

/**
 * Subscribes to ConfidentialDisperse events and returns a privacy-safe activity feed.
 * All messages are generic — no amounts or addresses are revealed.
 *
 * @param {{ distributionId?: string }} options - Optional bytes32 ID to scope events to one auction.
 * @returns {{ id, message, ts }[]} Up to 20 entries, newest first.
 */
export function useActivityFeed({ distributionId } = {}) {
  const [entries, setEntries] = useState([]);
  const disperseAddress = CONTRACT_ADDRESSES.confidentialDisperse || undefined;

  function push(message) {
    setEntries((prev) => [makeEntry(message), ...prev].slice(0, MAX_ENTRIES));
  }

  // Indexed arg filter — scopes events to a specific distribution when provided.
  const args = distributionId ? { id: distributionId } : undefined;

  useWatchContractEvent({
    address: disperseAddress,
    abi: ACTIVITY_ABI,
    eventName: 'DistributionCreated',
    args,
    onLogs: () => push('🔒 New auction created'),
  });

  useWatchContractEvent({
    address: disperseAddress,
    abi: ACTIVITY_ABI,
    eventName: 'DistributionFunded',
    args,
    onLogs: () => push('🔒 Auction funded — tokens locked'),
  });

  useWatchContractEvent({
    address: disperseAddress,
    abi: ACTIVITY_ABI,
    eventName: 'DistributionExecuted',
    args,
    onLogs: () => push('🔒 Bids sealed — auction entering settlement'),
  });

  useWatchContractEvent({
    address: disperseAddress,
    abi: ACTIVITY_ABI,
    eventName: 'AllocationClaimed',
    args,
    onLogs: () => push('🔒 Winner selected — tokens claimed'),
  });

  return entries;
}
