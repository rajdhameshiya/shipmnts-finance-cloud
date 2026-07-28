import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { money } from '../../lib/format';
import type { Bill } from '../../types';

const payableStatuses = new Set(['draft', 'payment_processing', 'paid', 'pending_approval', 'approved', 'posted']);

export function WorkloadPanel({ bills }: { bills: Bill[] }) {
  const activeBills = bills.filter((bill) => !['processing', 'failed', 'duplicate_blocked', 'disputed'].includes(bill.status));
  const chartData = Array.from(
    activeBills
      .flatMap((bill) => bill.chargeLineItems)
      .reduce((map, line) => {
        const current = map.get(line.chargeCode) || { charge: line.chargeCode, description: line.chargeDescription, accrual: 0, actual: 0 };
        current.accrual += line.accrualAmount || 0;
        current.actual += line.billedAmount || 0;
        map.set(line.chargeCode, current);
        return map;
      }, new Map<string, { charge: string; description: string; accrual: number; actual: number }>())
      .values(),
  )
    .sort((a, b) => b.actual - a.actual)
    .slice(0, 6);

  const eligibleCredit = bills
    .filter((bill) => payableStatuses.has(bill.status) && bill.gstDetails?.inputCreditEligible)
    .reduce((sum, bill) => sum + (bill.gstDetails?.gstAmount || 0), 0);
  const blockedCredit = bills
    .filter((bill) => bill.status === 'duplicate_blocked' || bill.status === 'disputed')
    .reduce((sum, bill) => sum + (bill.gstDetails?.gstAmount || 0), 0);
  const pendingCredit = bills
    .filter((bill) => bill.status === 'flagged' || bill.status === 'pending_approval')
    .reduce((sum, bill) => sum + (bill.gstDetails?.gstAmount || 0), 0);

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-[14px] font-semibold">Accrual vs billed by charge</h2>
        <p className="mb-4 mt-1 text-[12px] text-textSecondary">Top six charge types by billed amount. Hover a bar to see the full charge name and value.</p>
        <div className="h-72">
          {chartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="charge" fontSize={11} />
                <YAxis fontSize={11} tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
                <Tooltip formatter={(value) => money(Number(value))} labelFormatter={(label) => chartData.find((item) => item.charge === label)?.description || label} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="accrual" name="Accrual" fill="#1B2B4B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Billed" fill="#E8533A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded border border-dashed border-slate-200 text-[13px] text-textSecondary">
              Upload bills with charge lines to populate this chart.
            </div>
          )}
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-[14px] font-semibold">GST input credit</h2>
        <div className="mt-4 space-y-3 text-[13px]">
          <Row label="Eligible from payable bills" value={money(eligibleCredit)} tone="text-green-700" />
          <Row label="Held by blocked/disputed bills" value={money(blockedCredit)} tone="text-red-700" />
          <Row label="Pending verification" value={money(pendingCredit)} tone="text-amber-700" />
        </div>
      </div>
    </section>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <span className="text-textSecondary">{label}</span>
      <span className={`font-mono font-semibold ${tone}`}>{value}</span>
    </div>
  );
}
