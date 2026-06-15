import { useState, useEffect, useCallback } from 'react';
import { useWatchContractEvent } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../app/config';
import { loadDistributionsLocally } from '../features/distributions/api/distributions.api';

const DISPERSE_ABI = [
  {
    name: 'DistributionCreated',
    type: 'event',
    inputs: [
      { name: 'id', type: 'bytes32', indexed: true },
      { name: 'operator', type: 'address', indexed: true },
      { name: 'token', type: 'address', indexed: false },
      { name: 'recipientCount', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'DistributionExecuted',
    type: 'event',
    inputs: [
      { name: 'id', type: 'bytes32', indexed: true },
      { name: 'recipientCount', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'AllocationClaimed',
    type: 'event',
    inputs: [
      { name: 'id', type: 'bytes32', indexed: true },
      { name: 'recipient', type: 'address', indexed: true },
      { name: 'amount', type: 'uint64', indexed: false },
    ],
  },
];

const MAX_TOASTS = 3;
const FINAL_HOUR_MS = 60 * 60 * 1000;
const AUCTION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function makeToast(message, icon = '🔒', variant = 'info') {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    message,
    icon,
    variant,
  };
}

export function useNotifications() {
  const [toasts, setToasts] = useState([]);
  const disperseAddress = CONTRACT_ADDRESSES.confidentialDisperse || undefined;

  function push(toast) {
    setToasts((prev) => [toast, ...prev].slice(0, MAX_TOASTS));
  }

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Bid activity — intensity-aware messages, never reveals amounts
  useWatchContractEvent({
    address: disperseAddress,
    abi: DISPERSE_ABI,
    eventName: 'DistributionCreated',
    onLogs: (logs) => {
      const count = Number(logs[0]?.args?.recipientCount ?? 0);
      if (count >= 15) {
        push(makeToast('🔒 Auction entering high activity', '🔥', 'warning'));
      } else if (count >= 5) {
        push(makeToast('🔒 Competition is increasing', '🟡', 'warning'));
      } else {
        push(makeToast('🔒 Your position may have changed', '🔒', 'info'));
      }
    },
  });

  useWatchContractEvent({
    address: disperseAddress,
    abi: DISPERSE_ABI,
    eventName: 'DistributionExecuted',
    onLogs: () => {
      push(makeToast('🔒 An auction has entered settlement', '🏁', 'activity'));
    },
  });

  useWatchContractEvent({
    address: disperseAddress,
    abi: DISPERSE_ABI,
    eventName: 'AllocationClaimed',
    onLogs: () => {
      push(makeToast('🔒 Winner selected — tokens claimed', '🏆', 'activity'));
    },
  });

  // Final-hour countdown — polls localStorage every 60 s
  useEffect(() => {
    const notified = new Set();

    function checkFinalHour() {
      const dists = loadDistributionsLocally();
      const now = Date.now();
      for (const d of dists) {
        if (d.executed || notified.has(d.id)) continue;
        const remaining = (d.createdAt ?? 0) + AUCTION_DURATION_MS - now;
        if (remaining > 0 && remaining <= FINAL_HOUR_MS) {
          notified.add(d.id);
          push(makeToast('🔒 Auction entering final hour', '⏳', 'warning'));
        }
      }
    }

    checkFinalHour();
    const id = setInterval(checkFinalHour, 60_000);
    return () => clearInterval(id);
  }, []);

  return { toasts, dismiss };
}
