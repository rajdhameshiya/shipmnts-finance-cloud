import { Inbox } from 'lucide-react';
import type { Bill, Exception } from '../../types';
import { ExceptionCard } from './ExceptionCard';

export function ExceptionQueue({ exceptions, bills }: { exceptions: Exception[]; bills: Bill[] }) {
  const billsById = new Map(bills.map((bill) => [bill.id, bill]));

  if (!exceptions.length) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <div>
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <Inbox size={19} />
          </div>
          <h2 className="mt-3 text-[15px] font-semibold text-textPrimary">No exceptions in this view</h2>
          <p className="mt-1 text-[13px] text-textSecondary">Change the filters or process another invoice.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {exceptions.map((exception) => (
        <ExceptionCard key={exception.id} exception={exception} bill={billsById.get(exception.billId)} />
      ))}
    </div>
  );
}
