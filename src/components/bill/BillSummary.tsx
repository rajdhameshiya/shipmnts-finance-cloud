import { IndianRupee, Scale, Ship } from 'lucide-react';
import { money } from '../../lib/format';
import type { Bill } from '../../types';

export function BillSummary({ bill }: { bill: Bill }) {
  const matchedLines = bill.chargeLineItems.filter((line) => line.matchStatus === 'match' || line.matchStatus === 'accepted').length;
  const totalLines = bill.chargeLineItems.length;
  const variance = bill.chargeLineItems.reduce((sum, line) => sum + (line.matchStatus === 'overbilled' || line.matchStatus === 'underbilled' ? line.variance : 0), 0);

  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <Metric icon={IndianRupee} label="Amount" value={money(bill.totalAmount, bill.currency)} />
      <Metric icon={Ship} label="Shipment" value={bill.jobMatch?.jobReference ?? 'Not matched'} helper={bill.jobMatch ? `${bill.jobMatch.confidence}% confidence` : undefined} />
      <Metric icon={Scale} label="Accrual check" value={totalLines ? `${matchedLines}/${totalLines} matched` : 'Pending'} helper={variance ? `${money(variance)} variance` : 'No variance'} />
    </section>
  );
}

function Metric({ icon: Icon, label, value, helper }: { icon: typeof IndianRupee; label: string; value: string; helper?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-textMuted">
        <Icon size={12} />
        {label}
      </div>
      <div className="mt-1 truncate font-mono text-[15px] font-semibold text-textPrimary">{value}</div>
      {helper && <div className="mt-1 truncate text-[12px] text-textSecondary">{helper}</div>}
    </div>
  );
}
