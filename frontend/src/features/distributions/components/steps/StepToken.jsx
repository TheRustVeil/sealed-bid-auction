import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { isAddress } from 'viem';
import { Button, Spinner } from '../../../../components/ui';
import { getTokenMeta } from '../../../../lib/erc7984';
import { CONTRACT_ADDRESSES } from '../../../../app/config';

export function StepToken({ token, setToken, onNext, onPrev }) {
  const publicClient = usePublicClient();
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canContinue = isAddress(token) && !!meta;

  useEffect(() => {
    if (!isAddress(token)) {
      setMeta(null);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    getTokenMeta(publicClient, token)
      .then((m) => setMeta(m))
      .catch(() => setError('Could not fetch token info — check the address.'))
      .finally(() => setLoading(false));
  }, [token, publicClient]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Select token</h2>
        <p className="text-gray-400 mt-1 text-sm">Enter the ERC-20 / ERC-7984 token address.</p>
      </div>

      {CONTRACT_ADDRESSES.confidentialToken && (
        <button
          className="text-sm text-confidential hover:underline"
          onClick={() => setToken(CONTRACT_ADDRESSES.confidentialToken)}
        >
          Use deployed ConfidentialToken ↗
        </button>
      )}

      <div>
        <label className="block text-gray-400 text-sm mb-1">Token address</label>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="0x..."
          className="w-full bg-panel border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 font-mono text-sm focus:outline-none focus:border-confidential"
        />
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
      </div>

      {loading && <Spinner size="sm" />}

      {meta && (
        <div className="bg-panel border border-confidential/30 rounded-lg p-3 text-sm space-y-1">
          <p className="text-gray-400 text-xs">Token detected</p>
          <p className="text-white font-semibold">
            {meta.name} ({meta.symbol})
          </p>
          <p className="text-gray-400">{meta.decimals} decimals</p>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onPrev}>
          ← Back
        </Button>
        <Button onClick={onNext} disabled={!canContinue}>
          Next →
        </Button>
      </div>
    </div>
  );
}
