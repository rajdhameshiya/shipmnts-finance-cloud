import type { Bill } from '../../types';
import { InboxFilters, type InboxFilter } from './InboxFilters';
import { InboxRow } from './InboxRow';
import { IntakeSimulator } from './IntakeSimulator';

export function InboxList({
  bills,
  allCount,
  counts,
  selectedBillId,
  filter,
  onFilterChange,
  onSelect,
  onSimulateIntake,
}: {
  bills: Bill[];
  allCount: number;
  counts: Record<InboxFilter, number>;
  selectedBillId: string;
  filter: InboxFilter;
  onFilterChange: (filter: InboxFilter) => void;
  onSelect: (billId: string) => void;
  onSimulateIntake: (file: File) => void;
}) {
  return (
    <section className="flex h-full w-[360px] shrink-0 flex-col border-r border-borderSoft bg-white">
      <div className="border-b border-borderSoft px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-[20px] font-semibold">AP Inbox</h1>
          <span className="rounded-full bg-navy px-2 py-1 text-[11px] font-semibold text-white">{allCount}</span>
        </div>
        <InboxFilters active={filter} counts={counts} onChange={onFilterChange} />
        <IntakeSimulator onComplete={onSimulateIntake} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {bills.length ? (
          bills.map((bill) => <InboxRow key={bill.id} bill={bill} selected={selectedBillId === bill.id} onClick={() => onSelect(bill.id)} />)
        ) : allCount > 0 ? (
          <div className="p-5 text-[13px] text-slate-500">No bills match this filter.</div>
        ) : null}
      </div>
    </section>
  );
}
