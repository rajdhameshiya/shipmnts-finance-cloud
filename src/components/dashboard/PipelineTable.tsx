import { useNavigate } from 'react-router-dom';
import { money, shortDate } from '../../lib/format';
import { useAppStore } from '../../store/appStore';
import type { Bill } from '../../types';

const statusLabel = (status: string) => {
  if (status === 'flagged') return 'Flagged';
  if (status === 'pending_approval') return 'Pending approval';
  if (status === 'approved') return 'Approved';
  if (status === 'draft') return 'Draft ready';
  if (status === 'payment_processing') return 'Payment process';
  if (status === 'paid') return 'Paid';
  if (status === 'failed') return 'Processing failed';
  if (status === 'duplicate_blocked') return 'Duplicate blocked';
  if (status === 'unmatched') return 'Unmatched';
  if (status === 'disputed') return 'Disputed';
  return status;
};

const risk = (bill: Bill) => {
  if (bill.status === 'duplicate_blocked' || bill.status === 'failed') return 'High';
  if (bill.status === 'flagged' || bill.status === 'unmatched' || bill.status === 'disputed') return 'High';
  if (bill.status === 'pending_approval') return 'Medium';
  return 'Low';
};

export function PipelineTable({ bills }: { bills: Bill[] }) {
  const navigate = useNavigate();
  const selectBill = useAppStore((state) => state.selectBill);
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-[14px] font-semibold">AP Pipeline</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead className="bg-slate-50 text-[11px] font-medium uppercase tracking-[0.05em] text-textMuted">
            <tr>
              <th className="px-4 py-2">Invoice</th>
              <th className="px-4 py-2">Vendor</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Job</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Due date</th>
              <th className="px-4 py-2">Risk</th>
            </tr>
          </thead>
          <tbody>
            {!bills.length && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-[13px] text-textSecondary">No invoices are available in the current view.</td></tr>
            )}
            {bills.map((bill) => (
              <tr
                key={bill.id}
                className="cursor-pointer border-b border-slate-100 hover:bg-blue-50"
                onClick={() => {
                  selectBill(bill.id);
                  navigate(`/inbox/${bill.id}`);
                }}
              >
                <td className="px-4 py-3 font-mono font-medium">{bill.invoiceNumber}</td>
                <td className="px-4 py-3">{bill.vendorName}</td>
                <td className="px-4 py-3 font-mono">{money(bill.totalAmount, bill.currency)}</td>
                <td className="px-4 py-3 font-mono">{bill.jobMatch?.jobReference ?? '-'}</td>
                <td className="px-4 py-3">{statusLabel(bill.status)}</td>
                <td className="px-4 py-3">{bill.dueDate ? shortDate(bill.dueDate) : '-'}</td>
                <td className="px-4 py-3">{risk(bill)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
