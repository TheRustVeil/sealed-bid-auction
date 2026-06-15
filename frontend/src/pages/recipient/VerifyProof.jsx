import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isAddress } from 'viem';
import { Button, Card, CardBody, Pill, Spinner } from '../../components/ui';
import { ConnectButton } from '../../features/wallet/components/ConnectButton';
import { NetworkBadge } from '../../features/wallet/components/NetworkBadge';
import { useWallet } from '../../features/wallet/hooks/useWallet';
import { useAllocation } from '../../features/allocations/hooks/useAllocation';
import { ZERO_BYTES32 } from '../../lib/erc7984';

export function VerifyProof() {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const { address, isConnected } = useWallet();
  const [distributionId, setDistributionId] = useState(routeId ?? '');
  const [verifyAddress, setVerifyAddress] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const targetAddress = submitted
    ? (isAddress(verifyAddress) ? verifyAddress : address)
    : undefined;

  const { data: allocation, isLoading } = useAllocation({
    distributionId: submitted ? distributionId : undefined,
    account: targetAddress,
  });

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="text-white font-bold text-lg">
          ConfidentialDrop
        </button>
        <div className="flex items-center gap-3">
          <NetworkBadge />
          <ConnectButton />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-12 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Verify allocation</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Verify that an address holds an on-chain encrypted allocation without revealing the
            amount.
          </p>
        </div>

        <Card>
          <CardBody className="space-y-4">
            {!routeId && (
              <div>
                <label className="block text-gray-400 text-sm mb-1">Distribution ID</label>
                <input
                  type="text"
                  value={distributionId}
                  onChange={(e) => {
                    setDistributionId(e.target.value);
                    setSubmitted(false);
                  }}
                  placeholder="0x..."
                  className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 font-mono text-sm focus:outline-none focus:border-confidential"
                />
              </div>
            )}

            {routeId && (
              <div className="bg-surface border border-white/10 rounded-lg p-3 text-sm">
                <p className="text-gray-400 text-xs mb-1">Distribution</p>
                <p className="text-white font-mono text-xs break-all">{routeId}</p>
              </div>
            )}

            <div>
              <label className="block text-gray-400 text-sm mb-1">
                Address to verify (optional — defaults to connected wallet)
              </label>
              <input
                type="text"
                value={verifyAddress}
                onChange={(e) => {
                  setVerifyAddress(e.target.value);
                  setSubmitted(false);
                }}
                placeholder="0x... (leave blank for connected wallet)"
                className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 font-mono text-sm focus:outline-none focus:border-confidential"
              />
            </div>

            <Button
              disabled={!distributionId || (!isConnected && !isAddress(verifyAddress))}
              onClick={() => setSubmitted(true)}
              className="w-full"
            >
              Verify
            </Button>

            {submitted && isLoading && (
              <div className="flex justify-center pt-2">
                <Spinner size="sm" />
              </div>
            )}

            {submitted && !isLoading && allocation && (
              <div className="pt-2 border-t border-white/10 space-y-3">
                <VerifyRow
                  label="Allocation exists"
                  ok={allocation.handle !== ZERO_BYTES32}
                  trueText="yes"
                  falseText="no"
                  falseVariant="error"
                />
                <VerifyRow
                  label="Claimed"
                  ok={allocation.claimed}
                  trueText="yes"
                  falseText="no"
                  falseVariant="warning"
                />
                <p className="text-gray-500 text-xs pt-1">
                  {allocation.handle !== ZERO_BYTES32
                    ? 'An encrypted allocation exists on-chain. The exact amount remains confidential.'
                    : 'No encrypted allocation found for this address in this distribution.'}
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </main>
    </div>
  );
}

function VerifyRow({
  label,
  ok,
  trueText,
  falseText,
  trueVariant = 'success',
  falseVariant = 'default',
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400 text-sm">{label}</span>
      <Pill variant={ok ? trueVariant : falseVariant}>{ok ? trueText : falseText}</Pill>
    </div>
  );
}
