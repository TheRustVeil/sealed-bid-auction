import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected, walletConnect } from '@wagmi/connectors';
import { projectId } from '../../../lib/wagmi';

export function useWallet() {
  const { address, isConnected, chain } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  return {
    address,
    isConnected,
    chain,
    isConnecting,
    connectInjected: () => connect({ connector: injected() }),
    connectWC: () => connect({ connector: walletConnect({ projectId }) }),
    disconnect,
  };
}
