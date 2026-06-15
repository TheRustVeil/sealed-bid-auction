import { Button, ConfidentialChip } from '../../../../components/ui';

export function StepReview({ state, onNext, onPrev }) {
  const { type, token, recipients } = state;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Review</h2>
        <p className="text-gray-400 mt-1 text-sm">
          All amounts will be encrypted on-chain. Only recipients can decrypt their own allocation.
        </p>
      </div>

      <div className="bg-panel border border-white/10 rounded-lg p-4 space-y-3 text-sm">
        <Row label="Type" value={type} />
        <Row label="Token" value={`${token.slice(0, 10)}…${token.slice(-8)}`} mono />
        <Row label="Label" value={state.label || '(none)'} />
        <Row label="Recipients" value={String(recipients.length)} />
        <div className="flex items-center justify-between border-t border-white/10 pt-3">
          <span className="text-gray-400">Total (encrypted)</span>
          <ConfidentialChip label="total" />
        </div>
      </div>

      <div className="bg-confidential/10 border border-confidential/30 rounded-lg p-3 text-sm text-gray-300">
        <p className="font-semibold text-confidential mb-1">Privacy guarantee</p>
        <p>
          Amounts are encrypted using Zama TFHE before leaving your browser. The contract stores
          only ciphertext — even the operator cannot see individual allocations after execution.
        </p>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onPrev}>
          ← Back
        </Button>
        <Button onClick={onNext}>Confirm & Execute →</Button>
      </div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400">{label}</span>
      <span className={`text-white ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  );
}
