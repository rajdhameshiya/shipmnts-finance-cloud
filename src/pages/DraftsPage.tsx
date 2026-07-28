import { CheckCircle2, CreditCard, Eye, FileCheck2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { money, shortDate } from '../lib/format';
import { billMatchesSearch } from '../lib/search';
import { useAppStore } from '../store/appStore';
import type { Bill } from '../types';
import { Modal } from '../components/common/Modal';

type PaymentTab = 'drafts' | 'processing' | 'paid';

export function DraftsPage() {
  const navigate = useNavigate();
  const { bills, searchQuery, moveBillsToPayment, completePaymentBatch, selectBill } = useAppStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [tab, setTab] = useState<PaymentTab>('drafts');
  const [confirmMove, setConfirmMove] = useState(false);
  const [confirmBatch, setConfirmBatch] = useState<string | null>(null);
  const drafts = useMemo(() => bills.filter((bill) => bill.status === 'draft' && billMatchesSearch(bill, searchQuery)), [bills, searchQuery]);
  const paymentBills = useMemo(
    () => bills.filter((bill) => bill.status === 'payment_processing' && billMatchesSearch(bill, searchQuery)),
    [bills, searchQuery],
  );
  const paidBills = useMemo(() => bills.filter((bill) => bill.status === 'paid' && billMatchesSearch(bill, searchQuery)), [bills, searchQuery]);
  const selectedIds = selected.filter((id) => drafts.some((bill) => bill.id === id));
  const selectedBills = drafts.filter((bill) => selectedIds.includes(bill.id));
  const selectedTotal = selectedBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const selectedCurrencies = new Set(selectedBills.map((bill) => bill.currency));
  const batches = useMemo(() => groupBatches(paymentBills), [paymentBills]);

  useEffect(() => {
    const visibleIds = new Set(drafts.map((bill) => bill.id));
    setSelected((current) => current.filter((id) => visibleIds.has(id)));
  }, [drafts]);

  const toggle = (billId: string) => {
    setSelected((current) => (current.includes(billId) ? current.filter((id) => id !== billId) : [...current, billId]));
  };

  const openBill = (bill: Bill) => {
    selectBill(bill.id);
    navigate(`/inbox/${bill.id}`);
  };

  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-semibold">Drafts and payments</h1>
          <p className="mt-1 text-[13px] text-textSecondary">Create payment batches from approved bills and track them through completion.</p>
        </div>
        {tab === 'drafts' && (
        <button
          className="inline-flex items-center gap-2 rounded bg-orange px-3 py-2 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={selectedIds.length === 0 || selectedCurrencies.size > 1}
          onClick={() => setConfirmMove(true)}
        >
          <CreditCard size={15} />
          Create payment batch {selectedIds.length ? `(${selectedIds.length})` : ''}
        </button>
        )}
      </div>

      <div className="mb-4 flex w-fit rounded-md border border-slate-200 bg-white p-0.5" role="tablist" aria-label="Payment stages">
        {([
          ['drafts', `Drafts ${drafts.length}`],
          ['processing', `In process ${paymentBills.length}`],
          ['paid', `Paid ${paidBills.length}`],
        ] as Array<[PaymentTab, string]>).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={`rounded px-3 py-1.5 text-[12px] font-semibold ${tab === id ? 'bg-navy text-white' : 'text-textSecondary hover:bg-slate-50'}`} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Summary icon={FileCheck2} label="Draft bills" value={drafts.length.toString()} />
        <Summary icon={CreditCard} label="Selected amount" value={money(selectedTotal, selectedBills[0]?.currency || 'INR')} />
        <Summary icon={CheckCircle2} label="Paid bills" value={paidBills.length.toString()} />
      </div>

      {selectedCurrencies.size > 1 && <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-medium text-amber-800">Create separate payment batches for each currency.</div>}

      {tab === 'drafts' && <section className="rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-[14px] font-semibold">Draft bills ready for payment</h2>
          <button
            className="text-[12px] font-semibold text-orange disabled:text-textMuted"
            disabled={!drafts.length}
            onClick={() => setSelected(selectedIds.length === drafts.length ? [] : drafts.map((bill) => bill.id))}
          >
            {selectedIds.length === drafts.length && drafts.length ? 'Clear selection' : 'Select all'}
          </button>
        </div>
        <Table
          bills={drafts}
          empty="No draft bills yet. Clean uploads and approved resolved bills will appear here."
          selectable
          selected={selected}
          onToggle={toggle}
          onOpen={openBill}
        />
      </section>}

      {tab === 'processing' && (
        <div className="space-y-3">
          {batches.length ? batches.map((batch) => (
            <section key={batch.id} className="rounded-lg border border-slate-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                <div>
                  <h2 className="font-mono text-[13px] font-semibold">{batch.id}</h2>
                  <p className="mt-0.5 text-[12px] text-textSecondary">{batch.bills.length} bills · {money(batch.total, batch.currency)}</p>
                </div>
                <button className="rounded bg-navy px-3 py-2 text-[12px] font-semibold text-white" onClick={() => setConfirmBatch(batch.id)}>Mark payment complete</button>
              </div>
              <Table bills={batch.bills} empty="" selected={[]} onToggle={toggle} onOpen={openBill} showBatch />
            </section>
          )) : <EmptyStage text="No payment batches are currently in process." />}
        </div>
      )}

      {tab === 'paid' && (
        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3"><h2 className="text-[14px] font-semibold">Completed payments</h2></div>
          <Table bills={paidBills} empty="No completed payment batches yet." selected={[]} onToggle={toggle} onOpen={openBill} showBatch />
        </section>
      )}

      {confirmMove && (
        <Modal title="Create payment batch" confirmLabel="Create batch" onClose={() => setConfirmMove(false)} onConfirm={() => { moveBillsToPayment(selectedIds); setSelected([]); setConfirmMove(false); setTab('processing'); }}>
          Create one payment batch containing {selectedIds.length} bill{selectedIds.length === 1 ? '' : 's'} totalling {money(selectedTotal, selectedBills[0]?.currency || 'INR')}.
        </Modal>
      )}
      {confirmBatch && (
        <Modal title="Complete payment batch" tone="green" confirmLabel="Mark as paid" onClose={() => setConfirmBatch(null)} onConfirm={() => { completePaymentBatch(confirmBatch); setConfirmBatch(null); setTab('paid'); }}>
          Mark every bill in {confirmBatch} as paid. This records completion for the demo payment workflow.
        </Modal>
      )}
    </div>
  );
}

function Summary({ icon: Icon, label, value }: { icon: typeof FileCheck2; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 inline-flex rounded bg-blue-50 p-2 text-blue-700">
        <Icon size={18} />
      </div>
      <div className="font-mono text-[22px] font-semibold">{value}</div>
      <div className="text-[12px] text-textSecondary">{label}</div>
    </div>
  );
}

function Table({
  bills,
  empty,
  selectable = false,
  selected,
  onToggle,
  onOpen,
  showBatch = false,
}: {
  bills: Bill[];
  empty: string;
  selectable?: boolean;
  selected: string[];
  onToggle: (billId: string) => void;
  onOpen: (bill: Bill) => void;
  showBatch?: boolean;
}) {
  if (!bills.length) return <div className="p-5 text-[13px] text-textSecondary">{empty}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[12px]">
        <thead className="bg-slate-50 text-[11px] font-medium uppercase tracking-[0.05em] text-textMuted">
          <tr>
            {selectable && <th className="w-10 px-4 py-2" />}
            <th className="px-4 py-2">Invoice</th>
            <th className="px-4 py-2">Vendor</th>
            <th className="px-4 py-2">Source file</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Job</th>
            <th className="px-4 py-2">Due date</th>
            {showBatch && <th className="px-4 py-2">Batch</th>}
            <th className="px-4 py-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((bill) => (
            <tr key={bill.id} className="border-b border-slate-100 hover:bg-blue-50">
              {selectable && (
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.includes(bill.id)} onChange={() => onToggle(bill.id)} aria-label={`Select invoice ${bill.invoiceNumber}`} />
                </td>
              )}
              <td className="px-4 py-3 font-mono font-semibold">
                <button className="text-left hover:text-orange" onClick={() => onOpen(bill)}>{bill.invoiceNumber}</button>
              </td>
              <td className="px-4 py-3">{bill.vendorName}</td>
              <td className="max-w-[220px] truncate px-4 py-3 font-mono">{bill.fileName}</td>
              <td className="px-4 py-3 font-mono">{money(bill.totalAmount, bill.currency)}</td>
              <td className="px-4 py-3 font-mono">{bill.jobMatch?.jobReference ?? '-'}</td>
              <td className="px-4 py-3">{shortDate(bill.dueDate)}</td>
              {showBatch && <td className="px-4 py-3 font-mono">{bill.paymentBatchId ?? '-'}</td>}
              <td className="px-4 py-3 text-right">
                <button
                  className="inline-flex items-center gap-1 rounded border border-slate-300 px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 hover:border-orange hover:bg-orange/5 hover:text-orange"
                  onClick={() => onOpen(bill)}
                >
                  <Eye size={13} />
                  View bill
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function groupBatches(bills: Bill[]) {
  const groups = new Map<string, Bill[]>();
  bills.forEach((bill) => {
    const id = bill.paymentBatchId || 'Unassigned batch';
    groups.set(id, [...(groups.get(id) || []), bill]);
  });
  return Array.from(groups, ([id, batchBills]) => ({
    id,
    bills: batchBills,
    total: batchBills.reduce((sum, bill) => sum + bill.totalAmount, 0),
    currency: batchBills[0]?.currency || 'INR',
  }));
}

function EmptyStage({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-[13px] text-textSecondary">{text}</div>;
}
