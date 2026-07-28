import { useMemo, useState } from 'react';
import { ExceptionQueue } from '../components/exceptions/ExceptionQueue';
import { cn } from '../lib/format';
import { exceptionMatchesSearch } from '../lib/search';
import { useAppStore } from '../store/appStore';

type StatusFilter = 'all' | 'open' | 'resolved';
type SeverityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';
const statuses: StatusFilter[] = ['all', 'open', 'resolved'];

export function ExceptionsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('open');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const { bills, exceptions, role, searchQuery } = useAppStore();
  const scopedExceptions = role === 'Ops Executive' ? exceptions.filter((exception) => exception.type === 'no_accrual') : exceptions;
  const billsById = useMemo(() => new Map(bills.map((bill) => [bill.id, bill])), [bills]);
  const visible = useMemo(
    () =>
      scopedExceptions.filter((exception) => {
        const matchesStatus = statusFilter === 'all' || (statusFilter === 'open' ? exception.status !== 'resolved' : exception.status === 'resolved');
        const matchesSeverity = severityFilter === 'all' || exception.severity === severityFilter;
        return matchesStatus && matchesSeverity && exceptionMatchesSearch(exception, searchQuery, billsById.get(exception.billId));
      }),
    [billsById, severityFilter, statusFilter, scopedExceptions, searchQuery],
  );
  const open = scopedExceptions.filter((exception) => exception.status !== 'resolved').length;
  const resolved = scopedExceptions.length - open;

  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-semibold">Exception Queue</h1>
          <p className="mt-1 text-[13px] text-textSecondary">
            {scopedExceptions.length} exceptions - {open} open - {resolved} resolved
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border border-slate-200 bg-white p-0.5">
          {statuses.map((item) => (
            <button
              key={item}
              className={cn(
                'rounded px-2.5 py-1 text-[11px] font-medium capitalize transition',
                statusFilter === item ? 'bg-navy text-white' : 'text-slate-600 hover:bg-slate-50',
              )}
              onClick={() => setStatusFilter(item)}
            >
              {item}
            </button>
          ))}
          </div>
          <label className="flex items-center gap-2 text-[11px] font-medium text-textSecondary">
            Severity
            <select className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-textPrimary outline-none focus:border-orange" value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value as SeverityFilter)}>
              <option value="all">All levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
        </div>
      </div>
      <ExceptionQueue exceptions={visible} bills={bills} />
    </div>
  );
}
