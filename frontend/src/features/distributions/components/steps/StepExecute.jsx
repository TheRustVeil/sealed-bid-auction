import { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui';
import { matchZamaError } from '@zama-fhe/react-sdk';

const ENC_STEPS = [
  'Generating encryption keys...',
  'Encrypting payload with Zama TFHE...',
  'Signing transaction...',
  'Sending ciphertext to Sepolia...',
];

export function StepExecute({ execute, isExecuting, executeError, executeData, onReset }) {
  const [started, setStarted] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);

  const handleExecute = () => {
    setStarted(true);
    setStepIdx(0);
    execute();
  };

  useEffect(() => {
    if (!isExecuting) return;
    if (stepIdx >= ENC_STEPS.length - 1) return;
    const t = setTimeout(() => setStepIdx(s => s + 1), 950);
    return () => clearTimeout(t);
  }, [isExecuting, stepIdx]);

  if (executeData) {
    return (
      <div className="space-y-6 text-center">
        <div className="text-5xl animate-bounce">🎉</div>
        <h2 className="text-xl font-bold text-white">Distribution sent!</h2>
        <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-2 text-xs font-mono text-green-400 text-center tracking-widest">
          ✓ STORED ON CHAIN
        </div>
        <div className="bg-panel border border-white/10 rounded-lg p-3 text-xs font-mono text-gray-300 break-all text-left">
          tx: {executeData.hash}
        </div>
        <p className="text-gray-400 text-sm">
          Recipients can now claim and privately decrypt their allocation.
        </p>
        <Button variant="secondary" onClick={onReset}>
          New distribution
        </Button>
      </div>
    );
  }

  if (started && executeError) {
    const message = matchZamaError(executeError, {
      SIGNING_REJECTED: () => 'Transaction cancelled — please approve in your wallet.',
      ENCRYPTION_FAILED: () => 'Encryption failed — please try again.',
      TRANSACTION_REVERTED: () => 'Transaction failed on-chain — check your balance and approval.',
      _: () => executeError?.message ?? 'An unexpected error occurred.',
    });

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">Execution failed</h2>
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-400 text-sm">{message}</p>
        </div>
        <Button variant="ghost" onClick={handleExecute} loading={isExecuting}>
          Retry
        </Button>
      </div>
    );
  }

  if (isExecuting) {
    return (
      <div className="space-y-4 py-2">
        <h2 className="text-lg font-bold text-white">Encrypting &amp; Broadcasting</h2>
        <div className="bg-black/60 border border-confidential/20 rounded-lg p-4 font-mono text-sm space-y-2.5">
          {ENC_STEPS.map((step, i) =>
            i <= stepIdx ? (
              <div
                key={step}
                className="flex items-center gap-2 animate-type-in"
                style={{ animationFillMode: 'both' }}
              >
                {i < stepIdx ? (
                  <span className="text-green-400 text-xs w-3">✓</span>
                ) : (
                  <span className="text-confidential text-xs w-3 animate-pulse">›</span>
                )}
                <span className={i < stepIdx ? 'text-gray-500' : 'text-confidential-light'}>
                  {step}
                </span>
              </div>
            ) : null
          )}
        </div>
        <p className="text-gray-500 text-xs text-center">
          Please approve the transaction in your wallet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Ready to execute</h2>
        <p className="text-gray-400 mt-2 text-sm">
          This will encrypt all allocations with Zama TFHE, register your wallet pair if needed,
          then broadcast the disperse transaction to Sepolia.
        </p>
      </div>
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 text-sm text-yellow-300">
        <p className="font-semibold mb-1">Before you proceed</p>
        <p>Ensure your wallet holds enough token balance and ETH for gas fees.</p>
      </div>
      <Button onClick={handleExecute} className="w-full" size="lg">
        Execute distribution
      </Button>
    </div>
  );
}
