import { cn } from '../../lib/format';

const tagColor = (label: string) => {
  const text = label.toLowerCase();
  if (text.includes('duplicate') || text.includes('discrep') || text.includes('no accrual') || text.includes('no job') || text.includes('dispute')) {
    return 'border-red-200 bg-red-50 text-red-700';
  }
  if (text.includes('flagged') || text.includes('pending') || text.includes('tds') || text.includes('manual') || text.includes('posted')) {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }
  if (text.includes('credit') || text.includes('reimbursement') || text.includes('soa') || text.includes('customer')) {
    return 'border-violet-200 bg-violet-50 text-violet-700';
  }
  if (text.includes('clean') || text.includes('approved') || text.includes('matched') || text.includes('gst') || text.includes('updated')) {
    return 'border-green-200 bg-green-50 text-green-700';
  }
  return 'border-slate-200 bg-slate-50 text-slate-600';
};

export function Tag({ children, className }: { children: string; className?: string }) {
  return <span className={cn('inline-flex max-w-full items-center rounded border px-1.5 py-0.5 text-[10px] font-medium leading-4', tagColor(children), className)}>{children}</span>;
}
