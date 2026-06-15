import { Pill } from '../../../components/ui';
import { useWallet } from '../hooks/useWallet';

// Wrapper span is always in the DOM; we toggle its visibility with CSS.
// Returning null previously created a React comment placeholder that became
// a stale insertBefore reference after MetaMask mutated the DOM on connect.
export function NetworkBadge() {
  const { chain, isConnected } = useWallet();
  const isSepolia = chain?.id === 11155111;

  return (
    <span style={{ display: isConnected ? undefined : 'none' }}>
      <Pill variant={isSepolia ? 'success' : 'warning'}>
        {chain?.name ?? 'Unknown network'}
      </Pill>
    </span>
  );
}
