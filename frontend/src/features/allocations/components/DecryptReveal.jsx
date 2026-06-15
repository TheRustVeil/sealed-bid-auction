import { useState, useEffect } from 'react';
import { Button, ConfidentialChip, Spinner } from '../../../components/ui';
import { useAllocation } from '../hooks/useAllocation';
import { useClaimReveal } from '../hooks/useDecrypt';
import { ZERO_BYTES32 } from '../../../lib/erc7984';
import { PersonalAnalytics } from './PersonalAnalytics';

const CIPHER_CHARS = 'X#A@$P2K1J!%&*?8B6M3N7≈≠∑∂√∆';

function useCipherScramble(active, length = 10) {
  const [cipher, setCipher] = useState('');
  useEffect(() => {
    if (!active) { setCipher(''); return; }
    const tick = () =>
      setCipher(
        Array.from({ length }, () =>
          CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)]
        ).join('')
      );
    tick();
    const id = setInterval(tick, 80);
    return () => clearInterval(id);
  }, [active, length]);
  return cipher;
}

function formatAmount(raw) {
  return (Number(raw) / 1e6).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

/**
 * @param {{ distributionId: string, account: string, distribution?: object }} props
 * `distribution` is optional — when provided, PersonalAnalytics shows richer stats.
 */
export function DecryptReveal({ distributionId, account, distribution }) {
  const { data: allocation, isLoading: allocLoading } = useAllocation({ distributionId, account });
  const { claimAndReveal, plaintext, isClaiming, isClaimed, error } = useClaimReveal({
    distributionId,
    handle: allocation?.handle,
    account,
  });
  const cipherText = useCipherScramble(isClaiming);
  const [showGranted, setShowGranted] = useState(false);

  useEffect(() => {
    if (plaintext != null) setShowGranted(true);
  }, [plaintext]);

  if (allocLoading) return <Spinner size="sm" />;

  if (!allocation?.handle || allocation.handle === ZERO_BYTES32) {
    return (
      <p className="text-gray-400 text-sm">No allocation found for this address.</p>
    );
  }

  const alreadyClaimed = allocation.claimed || isClaimed;

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 flex-wrap">
        <span className="text-gray-400 text-sm mt-0.5">Your allocation:</span>

        {isClaiming ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-mono">Decrypting...</span>
              <span className="text-xs font-mono text-confidential tracking-widest animate-pulse select-none">
                {cipherText}
              </span>
            </div>
            <div className="w-40 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-confidential to-cyan-400 animate-[progressBar_2s_ease-in-out_infinite]" />
            </div>
          </div>
        ) : plaintext != null ? (
          <div className="flex flex-col gap-1">
            {showGranted && (
              <span className="text-xs font-mono text-green-400 tracking-widest animate-access-granted">
                🔓 ACCESS GRANTED
              </span>
            )}
            <ConfidentialChip value={formatAmount(plaintext)} revealed={true} />
          </div>
        ) : (
          <ConfidentialChip label="amount" revealed={false} />
        )}

        {alreadyClaimed && (
          <span className="text-green-400 text-xs mt-0.5">· claimed</span>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-xs">{error.message}</p>
      )}

      {plaintext == null && !isClaiming && !alreadyClaimed && (
        <Button
          size="sm"
          variant="secondary"
          onClick={claimAndReveal}
        >
          Claim &amp; Reveal
        </Button>
      )}

      <PersonalAnalytics
        plaintext={plaintext}
        isClaimed={alreadyClaimed}
        distribution={distribution}
      />
    </div>
  );
}
