import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export function useWallet() {
  const { address, isConnected, chain } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  return {
    address,
    isConnected,
    chain,
    isConnecting,
    connect: () => connect({ connector: injected() }),
    disconnect,
  };
}
