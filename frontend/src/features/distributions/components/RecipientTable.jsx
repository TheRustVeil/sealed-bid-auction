import { ConfidentialChip } from '../../../components/ui';

export function RecipientTable({ recipients }) {
  if (!recipients?.length) {
    return <p className="text-gray-400 text-sm">No recipients added yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-gray-400 text-left">
            <th className="pb-2 pr-4 font-medium">#</th>
            <th className="pb-2 pr-4 font-medium">Address</th>
            <th className="pb-2 font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {recipients.map((r, i) => (
            <tr key={r.address} className="border-b border-white/5">
              <td className="py-2 pr-4 text-gray-500">{i + 1}</td>
              <td className="py-2 pr-4 font-mono text-gray-300 text-xs">
                {r.address.slice(0, 8)}…{r.address.slice(-6)}
              </td>
              <td className="py-2">
                <ConfidentialChip label="amount" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
