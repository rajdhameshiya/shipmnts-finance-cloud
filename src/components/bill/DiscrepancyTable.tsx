import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { money, cn } from '../../lib/format';
import { useAppStore } from '../../store/appStore';
import type { Bill, ChargeLineItem } from '../../types';
import { Modal } from '../common/Modal';

type ModalMode = null | 'dispute' | 'accept' | 'approve';

const rowClass = (line: ChargeLineItem) =>
  cn(
    'border-b border-slate-100',
    line.matchStatus === 'overbilled' && 'bg-red-50/70',
    line.matchStatus === 'underbilled' && 'bg-amber-50/70',
    line.matchStatus === 'no_accrual' && 'bg-amber-50/70',
    line.matchStatus === 'accepted' && 'bg-green-50/70',
  );

const diff = (line: ChargeLineItem) => {
  if (line.matchStatus === 'match' || line.matchStatus === 'accepted') return <span className="text-textMuted">-</span>;
  if (line.matchStatus === 'not_billed') return <span className="font-semibold text-warning">-₹6,000 MISS</span>;
  if (line.matchStatus === 'no_accrual') return <span className="font-semibold text-warning">NO ACCRUAL</span>;
  const positive = line.variance > 0;
  return <span className={positive ? 'font-semibold text-danger' : 'font-semibold text-warning'}>{`${positive ? '+' : ''}${money(line.variance)} ${positive ? 'OVER' : 'UNDER'}`}</span>;
};

export function DiscrepancyTable({ bill }: { bill: Bill }) {
  const flagged = bill.chargeLineItems.filter((line) => ['overbilled', 'underbilled', 'no_accrual', 'not_billed'].includes(line.matchStatus));
  const shouldOpenDetails =
    flagged.length > 0 || (bill.exceptions.length > 0 && ['flagged', 'disputed', 'duplicate_blocked', 'unmatched'].includes(bill.status));
  const [mode, setMode] = useState<ModalMode>(null);
  const [note, setNote] = useState('');
  const [showLines, setShowLines] = useState(shouldOpenDetails);
  const { raiseDispute, acceptAccrualUpdate, approveAsIs } = useAppStore();
  const canResolveCharges = bill.status === 'flagged' || bill.status === 'unmatched';
  const netOverbilled = bill.chargeLineItems.filter((line) => line.matchStatus === 'overbilled').reduce((sum, line) => sum + line.variance, 0);
  const notBilled = bill.chargeLineItems.filter((line) => line.matchStatus === 'not_billed').length;

  useEffect(() => {
    setShowLines(shouldOpenDetails);
  }, [bill.id, shouldOpenDetails]);

  if (!bill.chargeLineItems.length) return null;
  if (flagged.length === 0) {
    return (
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-success ring-1 ring-slate-200">
              <CheckCircle2 size={17} />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-textPrimary">Charges validated</h2>
              <p className="mt-1 text-[12px] text-textSecondary">
                All {bill.chargeLineItems.length} charge lines match the expected accruals. No discrepancy review is needed.
              </p>
            </div>
          </div>
          <button className="inline-flex items-center gap-1 text-[12px] font-semibold text-navy hover:text-orange" onClick={() => setShowLines((value) => !value)}>
            {showLines ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {showLines ? 'Hide charge lines' : 'View charge lines'}
          </button>
        </div>
        {showLines && <ChargeLines bill={bill} />}
        {!showLines && bill.resolutionSummary && (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-[12px] font-medium text-slate-700">
            {bill.resolutionSummary}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <h2 className="flex items-center gap-2 text-[14px] font-semibold">
            <AlertTriangle size={17} className="text-warning" />
            Action needed on charges
          </h2>
          <p className="mt-1 text-[12px] text-textSecondary">
            {flagged.length} of {bill.chargeLineItems.length} lines need review - net variance {money(netOverbilled)}
          </p>
        </div>
        <button className="inline-flex items-center gap-1 text-[12px] font-semibold text-orange" onClick={() => setShowLines((value) => !value)}>
          {showLines ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          {showLines ? 'Hide details' : 'View details'}
        </button>
      </div>
      {showLines && <ChargeLines bill={bill} />}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 px-4 py-3">
        <div className="text-[12px] font-medium text-slate-700">
          {bill.resolutionSummary || `Net overbilled: +${money(netOverbilled)} - ${notBilled} charge not yet billed`}
        </div>
        {flagged.length > 0 && canResolveCharges && (
          <div className="flex flex-wrap gap-2">
            <button className="rounded border border-danger px-3 py-2 text-[12px] font-semibold text-danger hover:bg-red-50" onClick={() => setMode('dispute')}>
              Raise dispute
            </button>
            <button className="rounded bg-navy px-3 py-2 text-[12px] font-semibold text-white hover:bg-slate-800" onClick={() => setMode('accept')}>
              Accept & update
            </button>
            <button className="rounded bg-success px-3 py-2 text-[12px] font-semibold text-white hover:bg-green-600" onClick={() => setMode('approve')}>
              Approve as-is
            </button>
          </div>
        )}
        {flagged.length > 0 && !canResolveCharges && (
          <div className="text-[12px] font-medium text-textSecondary">
            {bill.status === 'duplicate_blocked' ? 'Charge actions are disabled for duplicate invoices.' : 'Resolve the open dispute before taking another action.'}
          </div>
        )}
      </div>
      {mode === 'dispute' && (
        <Modal
          title="Raise dispute"
          tone="red"
          confirmLabel="Confirm dispute"
          onClose={() => setMode(null)}
          onConfirm={() => {
            raiseDispute(bill.id);
            setMode(null);
          }}
        >
          You are raising a dispute for {money(netOverbilled)} with {bill.senderName}. A dispute notice will be logged and the overbilled amount will be held.
        </Modal>
      )}
      {mode === 'accept' && (
        <Modal
          title="Accept & update accrual"
          confirmLabel="Update accrual"
          onClose={() => setMode(null)}
          onConfirm={() => {
            acceptAccrualUpdate(bill.id);
            setMode(null);
          }}
        >
          The job file accruals will be updated to match the validated vendor invoice. The bill will move to pending approval.
        </Modal>
      )}
      {mode === 'approve' && (
        <Modal
          title="Approve as-is"
          tone="green"
          confirmLabel="Move to approval"
          onClose={() => setMode(null)}
          onConfirm={() => {
            approveAsIs(bill.id, note || 'Approved by finance user');
            setMode(null);
            setNote('');
          }}
        >
          <label className="block text-[12px] font-medium text-slate-600">Reason note</label>
          <textarea
            className="mt-2 h-24 w-full resize-none rounded border border-slate-300 p-2 text-[13px] outline-none focus:border-orange"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Business reason for approving this variance"
          />
        </Modal>
      )}
    </section>
  );
}

function ChargeLines({ bill }: { bill: Bill }) {
  return (
    <table className="w-full text-left text-[12px]">
      <thead className="bg-slate-50 text-[11px] font-medium uppercase tracking-[0.05em] text-textMuted">
        <tr>
          <th className="px-4 py-2">Charge</th>
          <th className="px-4 py-2">Accrual</th>
          <th className="px-4 py-2">Billed</th>
          <th className="px-4 py-2">Difference</th>
        </tr>
      </thead>
      <tbody>
        {bill.chargeLineItems.map((line) => (
          <tr key={line.chargeCode} className={rowClass(line)}>
            <td className="px-4 py-3 font-medium">{line.chargeDescription}</td>
            <td className="px-4 py-3 font-mono">{money(line.accrualAmount, line.currency)}</td>
            <td className="px-4 py-3 font-mono">{line.billedAmount === 0 ? 'Not billed' : money(line.billedAmount, line.currency)}</td>
            <td className="px-4 py-3 font-mono">{diff(line)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
