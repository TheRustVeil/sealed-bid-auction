import { Button } from '../../../../components/ui';
import { RecipientTable } from '../RecipientTable';

export function StepRecipients({
  recipientsText,
  setRecipientsText,
  recipients,
  parseErrors,
  onNext,
  onPrev,
}) {
  const canContinue = recipients.length > 0 && parseErrors.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Add recipients</h2>
        <p className="text-gray-400 mt-1 text-sm">
          Paste CSV or plain text — one{' '}
          <span className="font-mono text-gray-300">address,amount</span> per line. Amounts are in
          token units (e.g. <span className="font-mono text-gray-300">1.5</span> = 1.5 tokens).
        </p>
      </div>

      <div>
        <label className="block text-gray-400 text-sm mb-1">Recipient list</label>
        <textarea
          value={recipientsText}
          onChange={(e) => setRecipientsText(e.target.value)}
          rows={8}
          placeholder={'0xRecipient1,100\n0xRecipient2,250\n0xRecipient3,75'}
          className="w-full bg-panel border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 font-mono text-sm focus:outline-none focus:border-confidential resize-none"
        />
      </div>

      {parseErrors.length > 0 && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 space-y-1">
          {parseErrors.map((e, i) => (
            <p key={i} className="text-red-400 text-sm">
              {e}
            </p>
          ))}
        </div>
      )}

      {recipients.length > 0 && (
        <div>
          <p className="text-gray-400 text-sm mb-2">{recipients.length} valid recipient(s)</p>
          <RecipientTable recipients={recipients} />
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
