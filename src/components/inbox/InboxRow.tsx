import { CheckCircle2, Circle, CircleDot, Loader2, XCircle } from 'lucide-react';
import { cn, money, shortTime } from '../../lib/format';
import type { Bill } from '../../types';
import { Tag } from '../common/Tag';

const statusMeta = (bill: Bill) => {
  if (bill.status === 'duplicate_blocked') return { icon: XCircle, color: 'text-danger', text: 'Agent blocked duplicate' };
  if (bill.status === 'processing') return { icon: Loader2, color: 'text-warning', text: 'Agent processing' };
  if (bill.status === 'flagged' || bill.status === 'unmatched' || bill.status === 'disputed') {
    return { icon: CircleDot, color: 'text-warning', text: 'Agent flagged review' };
  }
  return { icon: CheckCircle2, color: 'text-success', text: 'Agent processed' };
};

export function InboxRow({ bill, selected, onClick }: { bill: Bill; selected: boolean; onClick: () => void }) {
  const meta = statusMeta(bill);
  const Icon = meta.icon;
  const unread = bill.status === 'flagged' || bill.status === 'unmatched' || bill.status === 'processing';
  return (
    <button
      className={cn(
        'w-full border-b border-slate-100 px-4 py-3 text-left transition duration-150 hover:bg-slate-50',
        selected ? 'border-l-4 border-l-orange bg-blue-50/70 pl-3' : 'border-l-4 border-l-transparent',
        bill.flash && 'row-flash',
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        {unread ? <Circle className="fill-orange text-orange" size={8} /> : <span className="w-2" />}
        <div className="min-w-0 flex-1 truncate text-[13px] font-medium text-textPrimary">{bill.senderName}</div>
        <div className="text-[11px] text-textMuted">{shortTime(bill.receivedAt)}</div>
      </div>
      <div className="mt-1 flex items-center justify-between gap-3 pl-4">
        <div className="min-w-0 truncate font-mono text-[12px] text-textSecondary">{bill.invoiceNumber}</div>
        <div className="shrink-0 font-mono text-[12px] font-semibold text-textPrimary">{money(bill.totalAmount, bill.currency)}</div>
      </div>
      <div className="mt-2 flex max-h-6 flex-wrap gap-1 overflow-hidden pl-4">
        {bill.tags.slice(0, 2).map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1.5 pl-4 text-[11px] text-textMuted">
        <Icon size={12} className={meta.color} />
        <span>{meta.text}</span>
      </div>
    </button>
  );
}
