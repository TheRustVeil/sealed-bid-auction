import { Card, CardBody, Pill } from '../../../components/ui';
import { DecryptReveal } from './DecryptReveal';

export function AllocationCard({ distributionId, account }) {
  const shortId = `${distributionId.slice(0, 10)}…${distributionId.slice(-8)}`;

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-white font-semibold text-sm">Distribution</p>
            <p className="text-gray-400 text-xs font-mono mt-0.5">{shortId}</p>
          </div>
          <Pill variant="confidential">disperse</Pill>
        </div>

        <DecryptReveal distributionId={distributionId} account={account} />
      </CardBody>
    </Card>
  );
}
