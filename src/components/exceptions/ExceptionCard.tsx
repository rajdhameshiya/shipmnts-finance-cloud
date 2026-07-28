import { AlertTriangle, CheckCircle2, Clock, ExternalLink, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { minutesTo, cn, money } from '../../lib/format';
import { useAppStore } from '../../store/appStore';
import type { Bill, Exception } from '../../types';
import { Modal } from '../common/Modal';

type ReviewMode = null | 'dispute' | 'accept' | 'confirm_duplicate';

const severityClass = (severity: string) => {
  if (severity === 'critical') return 'bg-red-50 text-red-700 border-red-200';
  if (severity === 'high') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (severity === 'medium') return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
};

function countdown(deadline: string) {
  const minutes = minutesTo(deadline);
  if (minutes <= 0) return 'Overdue';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m remaining` : `${mins}m remaining`;
}

export function ExceptionCard({ exception, bill }: { exception: Exception; bill?: Bill }) {
  const [tick, setTick] = useState(0);
  const [mode, setMode] = useState<ReviewMode>(null);
  const [note, setNote] = useState('');
  const resolveException = useAppStore((state) => state.resolveException);
  const urgent = exception.status !== 'resolved' && minutesTo(exception.slaDeadline) < 30;
  const isDuplicate = exception.type === 'duplicate';
  const isEscalated = exception.status === 'escalated';

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const finish = () => {
    if (!mode) return;
    resolveException(exception.id, mode, note.trim());
    setMode(null);
    setNote('');
  };

  return (
    <article className={cn('rounded-lg border bg-white p-4 transition', exception.status === 'resolved' ? 'border-slate-200 bg-slate-50/70' : 'border-slate-200')}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={cn('rounded border px-2 py-1 text-[10px] font-bold uppercase', severityClass(exception.severity))}>{exception.severity}</span>
            <span className="rounded border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold uppercase text-slate-600">
              {exception.status === 'in_review' ? 'In review' : exception.status}
            </span>
            <span className="font-mono text-[11px] text-textMuted">{exception.shipmentRef ?? 'No shipment match'}</span>
          </div>
          <h2 className="text-[14px] font-semibold">{exception.title}</h2>
          <p className="mt-1 max-w-3xl text-[13px] leading-5 text-textSecondary">{exception.description}</p>

          {bill && (
            <div className="mt-3 grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-[12px] sm:grid-cols-3">
              <div><span className="text-textMuted">Invoice</span><div className="mt-0.5 truncate font-mono font-semibold">{bill.invoiceNumber}</div></div>
              <div><span className="text-textMuted">Vendor</span><div className="mt-0.5 truncate font-medium">{bill.vendorName}</div></div>
              <div><span className="text-textMuted">Amount</span><div className="mt-0.5 font-mono font-semibold">{money(bill.totalAmount, bill.currency)}</div></div>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-textSecondary">
            <span>Assigned: <strong className="text-textPrimary">{exception.assignedTo}</strong></span>
            <span className={cn('inline-flex items-center gap-1', urgent && 'font-semibold text-danger')}>
              <Clock size={13} /> SLA: {exception.status === 'resolved' ? 'Resolved' : countdown(exception.slaDeadline)}
              <span className="hidden">{tick}</span>
            </span>
          </div>
          {exception.resolutionNote && (
            <p className="mt-3 rounded border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-700">{exception.resolutionNote}</p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {bill && (
            <Link to={`/inbox/${bill.id}`} className="inline-flex items-center gap-1 rounded border border-slate-300 px-3 py-2 text-[12px] font-semibold text-slate-700 hover:border-orange hover:text-orange">
              <ExternalLink size={13} /> View bill
            </Link>
          )}
          {exception.status !== 'resolved' && isDuplicate && (
            <button className="inline-flex items-center gap-1 rounded bg-navy px-3 py-2 text-[12px] font-semibold text-white" onClick={() => setMode('confirm_duplicate')}>
              <ShieldCheck size={13} /> Confirm duplicate
            </button>
          )}
          {exception.status !== 'resolved' && !isDuplicate && !isEscalated && (
            <>
              <button className="rounded border border-danger px-3 py-2 text-[12px] font-semibold text-danger hover:bg-red-50" onClick={() => setMode('dispute')}>
                Raise dispute
              </button>
              <button className="rounded bg-navy px-3 py-2 text-[12px] font-semibold text-white hover:bg-slate-800" onClick={() => setMode('accept')}>
                Accept & update
              </button>
            </>
          )}
          {isEscalated && (
            <button className="rounded bg-navy px-3 py-2 text-[12px] font-semibold text-white hover:bg-slate-800" onClick={() => setMode('accept')}>
              Resolve vendor response
            </button>
          )}
        </div>
      </div>

      {mode && (
        <Modal
          title={mode === 'dispute' ? 'Raise dispute' : mode === 'confirm_duplicate' ? 'Confirm duplicate' : 'Resolve and update accrual'}
          tone={mode === 'dispute' ? 'red' : 'navy'}
          confirmLabel={mode === 'dispute' ? 'Raise dispute' : mode === 'confirm_duplicate' ? 'Keep payment blocked' : 'Resolve exception'}
          confirmDisabled={mode !== 'confirm_duplicate' && !note.trim()}
          onClose={() => { setMode(null); setNote(''); }}
          onConfirm={finish}
        >
          <p>
            {mode === 'dispute'
              ? 'Payment will remain on hold while the vendor response is reviewed.'
              : mode === 'confirm_duplicate'
                ? 'This closes the review while keeping the invoice permanently blocked from payment.'
                : 'The accepted outcome will update the accrual and move the bill toward approval.'}
          </p>
          {mode !== 'confirm_duplicate' && (
            <label className="mt-4 block text-[12px] font-medium text-slate-700">
              Resolution note
              <textarea
                className="mt-2 h-24 w-full resize-none rounded border border-slate-300 p-2 text-[13px] outline-none focus:border-orange"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add evidence or the reason for this decision"
              />
            </label>
          )}
        </Modal>
      )}
    </article>
  );
}
