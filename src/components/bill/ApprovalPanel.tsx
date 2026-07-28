import { AlertTriangle, CheckCircle2, ExternalLink, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAppStore } from '../../store/appStore';
import type { Bill, Exception } from '../../types';
import { Modal } from '../common/Modal';
import { money } from '../../lib/format';

export function ApprovalPanel({ bill, exceptions }: { bill: Bill; exceptions: Exception[] }) {
  const [confirming, setConfirming] = useState(false);
  const approveBill = useAppStore((state) => state.approveBill);
  const originalBill = useAppStore((state) =>
    state.bills.find((candidate) => candidate.id === bill.originalBillId) ??
    state.bills.find(
      (candidate) =>
        candidate.id !== bill.id &&
        candidate.status !== 'duplicate_blocked' &&
        candidate.invoiceNumber.toUpperCase() === bill.invoiceNumber.toUpperCase(),
    ),
  );
  const openExceptions = exceptions.filter((exception) => exception.status !== 'resolved');

  if (bill.status === 'processing') {
    return (
      <section className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h2 className="flex items-center gap-2 text-[14px] font-semibold text-blue-900">
          <AlertTriangle size={18} className="animate-pulse" /> AI/OCR processing in progress
        </h2>
        <p className="mt-1 text-[13px] text-blue-800">The uploaded bill is being read, matched to a job, and compared with accruals. It will update automatically.</p>
      </section>
    );
  }

  if (bill.status === 'failed') {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h2 className="flex items-center gap-2 text-[14px] font-semibold text-amber-900">
          <AlertTriangle size={18} /> Processing could not be completed
        </h2>
        <p className="mt-1 text-[13px] text-amber-800">
          {bill.resolutionSummary || 'The file could not be read. Upload the source invoice again to retry.'}
        </p>
      </section>
    );
  }

  if (bill.status === 'duplicate_blocked') {
    return (
      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-4 p-4">
          <div className="flex min-w-0 gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-danger ring-1 ring-slate-200">
              <ShieldAlert size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[14px] font-semibold text-textPrimary">Duplicate evidence</h2>
                <span className="rounded-full border border-red-200 bg-white px-2 py-0.5 text-[10px] font-bold uppercase text-red-700">Payment stopped</span>
              </div>
              <p className="mt-1 max-w-3xl text-[13px] text-textSecondary">
                {bill.blockReason || 'This invoice matches an existing bill and cannot move to approval or payment.'}
              </p>
            </div>
          </div>
          <div className="shrink-0">
            {originalBill ? (
              <Link
                to={`/inbox/${originalBill.id}`}
                className="inline-flex items-center gap-1.5 rounded bg-navy px-3 py-2 text-[12px] font-semibold text-white hover:bg-slate-800"
              >
                <ExternalLink size={13} /> View original invoice
              </Link>
            ) : (
              <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] font-medium text-slate-700">
                Original invoice is not in the current saved inbox.
              </div>
            )}
          </div>
        </div>
        <div className="grid border-t border-slate-100 bg-slate-50 text-[12px] sm:grid-cols-3">
          <DuplicateMetric label="Duplicate invoice" value={bill.invoiceNumber} />
          <DuplicateMetric label="Original bill" value={originalBill ? originalBill.invoiceNumber : 'Not available'} />
          <DuplicateMetric label="Amount" value={money(bill.totalAmount, bill.currency)} />
        </div>
      </section>
    );
  }

  if (bill.status === 'disputed') {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h2 className="flex items-center gap-2 text-[14px] font-semibold text-amber-900">
          <ShieldAlert size={18} /> Dispute open - payment on hold
        </h2>
        <p className="mt-1 text-[13px] text-amber-800">
          The bill cannot move to approval until the vendor response and exception are resolved.
        </p>
        <Link to="/exceptions" className="mt-3 inline-flex rounded bg-navy px-3 py-2 text-[12px] font-semibold text-white">
          Review dispute
        </Link>
      </section>
    );
  }

  if (bill.status === 'paid') {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="flex items-center gap-2 text-[14px] font-semibold text-textPrimary">
          <CheckCircle2 size={18} className="text-success" /> Payment completed
        </h2>
        <p className="mt-1 text-[13px] text-textSecondary">
          Paid in batch {bill.paymentBatchId ?? '-'}{bill.paidAt ? ` on ${format(new Date(bill.paidAt), 'dd MMM yyyy HH:mm')}` : ''}.
        </p>
      </section>
    );
  }

  if (bill.approvalStatus === 'approved' || bill.status === 'approved' || bill.status === 'posted') {
    if (bill.status === 'payment_processing') {
      return (
        <section className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h2 className="flex items-center gap-2 text-[14px] font-semibold text-blue-900">
            <CheckCircle2 size={18} /> In payment process
          </h2>
          <p className="mt-1 text-[13px] text-blue-800">This bill has been moved from Draft into a payment batch.</p>
        </section>
      );
    }

    if (bill.status === 'draft') {
      return (
        <section className="rounded-lg border border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-success ring-1 ring-slate-200">
                <CheckCircle2 size={17} />
              </div>
              <div className="min-w-0">
                <h2 className="text-[13px] font-semibold text-textPrimary">Next step</h2>
                <p className="mt-0.5 text-[12px] text-textSecondary">Select this bill in Drafts when creating the payment batch.</p>
              </div>
            </div>
            <Link to="/drafts" className="inline-flex rounded bg-navy px-3 py-2 text-[12px] font-semibold text-white hover:bg-slate-800">
              Open Drafts
            </Link>
          </div>
        </section>
      );
    }

    return (
      <section className="rounded-lg border border-green-200 bg-green-50 p-4">
        <h2 className="flex items-center gap-2 text-[14px] font-semibold text-green-900">
          <CheckCircle2 size={18} /> Approved by {bill.approvedBy ?? 'Suresh Menon'} - {bill.approvedAt ? format(new Date(bill.approvedAt), 'dd MMM yyyy HH:mm') : '15 Jan 2024 09:47'}
        </h2>
        <p className="mt-1 text-[13px] text-green-800">Posted to Finance Cloud - Ready for payment run</p>
      </section>
    );
  }

  if ((bill.status === 'flagged' || bill.status === 'unmatched') && openExceptions.length > 0) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h2 className="flex items-center gap-2 text-[14px] font-semibold text-amber-900">
          <AlertTriangle size={18} /> Cannot approve - {openExceptions.length} open exceptions must be resolved
        </h2>
        <Link to="/exceptions" className="mt-3 inline-flex rounded bg-navy px-3 py-2 text-[12px] font-semibold text-white">
          Go to exceptions
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-green-200 bg-white p-4">
      <h2 className="flex items-center gap-2 text-[14px] font-semibold text-green-900">
        <CheckCircle2 size={18} /> Ready for approval
      </h2>
      <p className="mt-1 text-[13px] text-textSecondary">All charges validated - No open exceptions</p>
      <p className="mt-2 text-[13px]">
        Approver: <span className="font-semibold">Suresh Menon (Finance Head)</span>
      </p>
      <div className="mt-4 flex gap-2">
        <button className="rounded bg-success px-3 py-2 text-[12px] font-semibold text-white hover:bg-green-600" onClick={() => setConfirming(true)}>
          Approve bill
        </button>
      </div>
      {confirming && (
        <Modal
          title="Approve bill"
          tone="green"
          confirmLabel="Approve and post"
          onClose={() => setConfirming(false)}
          onConfirm={() => {
            approveBill(bill.id);
            setConfirming(false);
          }}
        >
          This will approve {bill.invoiceNumber} and move it to Drafts for payment batch selection.
        </Modal>
      )}
    </section>
  );
}

function DuplicateMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-slate-200 px-4 py-3 sm:border-r sm:last:border-r-0">
      <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-textMuted">{label}</div>
      <div className="mt-1 truncate font-mono text-[13px] font-semibold text-slate-900">{value}</div>
    </div>
  );
}
