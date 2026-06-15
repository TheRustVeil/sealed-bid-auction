import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { isAddress } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Button, Card, CardBody, CardHeader, Pill, Spinner, HeatScore } from '../../components/ui';
import { Navbar } from '../../components/layout/Navbar';
import { useDistribution } from '../../features/distributions/hooks/useDistribution';
import { ActivityFeed } from '../../features/distributions/components/ActivityFeed';
import { CONTRACT_ADDRESSES } from '../../app/config';

const PRIVACY_MODE_LABELS = {
  'fully-confidential': { label: 'Fully Confidential', icon: '🔒' },
  'reveal-winner': { label: 'Reveal Winner Only', icon: '🏆' },
  'reveal-highest-bid': { label: 'Reveal Highest Bid After End', icon: '📊' },
};

const GRANT_ACCESS_ABI = [
  {
    name: 'grantDecryptAccess', type: 'function', stateMutability: 'nonpayable',
    inputs: [
      { name: 'distributionId', type: 'bytes32' },
      { name: 'auditor',        type: 'address' },
    ],
    outputs: [],
  },
];

export function DistributionDetail() {
  const { id } = useParams();
  const { data: distribution, isLoading } = useDistribution(id);
  const [auditorAddress, setAuditorAddress] = useState('');

  const disperseAddress = CONTRACT_ADDRESSES.confidentialDisperse;
  const {
    writeContract,
    data: txHash,
    isPending: isSubmitting,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isGranted } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  function handleGrantAccess() {
    if (!isAddress(auditorAddress) || !id || !disperseAddress) return;
    resetWrite();
    writeContract({
      address: disperseAddress,
      abi: GRANT_ACCESS_ABI,
      functionName: 'grantDecryptAccess',
      args: [id, auditorAddress],
    });
  }

  const isPending = isSubmitting || isConfirming;

  return (
    <div className="min-h-screen bg-surface">
      <Navbar back={{ label: 'Operator', to: '/operator' }} />

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        )}

        {!isLoading && !distribution && (
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-gray-400">Distribution not found.</p>
            </CardBody>
          </Card>
        )}

        {!isLoading && distribution && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-semibold text-lg">
                    {distribution.label ?? 'Unnamed'}
                  </h2>
                  <div className="flex gap-2">
                    <Pill variant="confidential">{distribution.type ?? 'disperse'}</Pill>
                    {distribution.executed !== undefined && (
                      <Pill variant={distribution.executed ? 'success' : 'warning'}>
                        {distribution.executed ? 'executed' : 'pending'}
                      </Pill>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardBody className="space-y-3 text-sm">
                <Row label="Distribution ID" value={id} mono />
                <Row label="Token" value={distribution.token ?? '—'} mono />
                <Row
                  label="Recipients"
                  value={String(
                    distribution.recipientCount ?? distribution.recipients?.length ?? '—'
                  )}
                />
                <Row
                  label="Created"
                  value={
                    distribution.createdAt
                      ? new Date(distribution.createdAt).toLocaleString()
                      : '—'
                  }
                />
                <Row
                  label="Privacy mode"
                  value={
                    (() => {
                      const m = PRIVACY_MODE_LABELS[distribution.privacyMode] ?? PRIVACY_MODE_LABELS['fully-confidential'];
                      return `${m.icon} ${m.label}`;
                    })()
                  }
                />
                <div className="pt-2 border-t border-white/[0.06]">
                  <HeatScore
                    recipientCount={distribution.recipientCount ?? 0}
                    createdAt={distribution.createdAt}
                    variant="full"
                  />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-white font-semibold">Live Activity</h2>
              </CardHeader>
              <CardBody>
                <ActivityFeed distributionId={id} />
              </CardBody>
            </Card>

            {/* Selective Disclosure — only shown post-settlement when mode ≠ fully-confidential */}
            {distribution.executed && distribution.privacyMode && distribution.privacyMode !== 'fully-confidential' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <h2 className="text-white font-semibold">Selective Disclosure</h2>
                    <Pill variant="success">Active</Pill>
                  </div>
                </CardHeader>
                <CardBody className="space-y-3 text-sm">
                  {distribution.privacyMode === 'reveal-winner' && (
                    <>
                      <p className="text-white/50 text-xs">
                        Privacy mode: <span className="text-white/70">Reveal Winner Only</span>.
                        The winning address is publicly disclosed below.
                      </p>
                      <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06]">
                        <p className="text-emerald-400 text-xs font-mono">
                          🏆 Winner address publicly revealed on settlement
                        </p>
                        <p className="text-white/20 text-xs mt-1">
                          Allocation amount remains encrypted on-chain.
                        </p>
                      </div>
                    </>
                  )}
                  {distribution.privacyMode === 'reveal-highest-bid' && (
                    <>
                      <p className="text-white/50 text-xs">
                        Privacy mode: <span className="text-white/70">Reveal Highest Bid After End</span>.
                        The top bid amount is published for transparency.
                      </p>
                      <div className="p-3 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06]">
                        <p className="text-cyan-400 text-xs font-mono">
                          📊 Highest bid published after settlement
                        </p>
                        <p className="text-white/20 text-xs mt-1">
                          Individual bid amounts for other recipients remain encrypted.
                        </p>
                      </div>
                    </>
                  )}
                </CardBody>
              </Card>
            )}

            <Card>
              <CardHeader>
                <h2 className="text-white font-semibold">Grant auditor access</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <p className="text-gray-400 text-sm">
                  Grant a trusted address permission to decrypt all allocations in this
                  distribution. Calls{' '}
                  <span className="font-mono text-gray-300">grantDecryptAccess</span> on-chain.
                </p>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Auditor address</label>
                  <input
                    type="text"
                    value={auditorAddress}
                    onChange={(e) => {
                      setAuditorAddress(e.target.value);
                      resetWrite();
                    }}
                    placeholder="0x..."
                    className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 font-mono text-sm focus:outline-none focus:border-confidential"
                  />
                </div>

                {isGranted && (
                  <p className="text-green-400 text-sm">Auditor access granted.</p>
                )}
                {writeError && (
                  <p className="text-red-400 text-sm">{writeError.message}</p>
                )}

                <Button
                  disabled={!isAddress(auditorAddress) || isPending || !disperseAddress}
                  loading={isPending}
                  onClick={handleGrantAccess}
                >
                  Grant access
                </Button>
              </CardBody>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className={`text-white text-right break-all ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </span>
    </div>
  );
}
