import { useMemo } from 'react';
import { PipelineTable } from '../components/dashboard/PipelineTable';
import { StatCards } from '../components/dashboard/StatCards';
import { WorkloadPanel } from '../components/dashboard/WorkloadPanel';
import { billMatchesSearch } from '../lib/search';
import { useAppStore } from '../store/appStore';

export function DashboardPage() {
  const { bills, exceptions, searchQuery } = useAppStore();
  const visibleBills = useMemo(() => bills.filter((bill) => billMatchesSearch(bill, searchQuery)), [bills, searchQuery]);
  const visibleBillIds = useMemo(() => new Set(visibleBills.map((bill) => bill.id)), [visibleBills]);
  const visibleExceptions = useMemo(() => exceptions.filter((exception) => visibleBillIds.has(exception.billId)), [exceptions, visibleBillIds]);
  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="mb-5">
        <h1 className="text-[20px] font-semibold">AP operations dashboard</h1>
        <p className="mt-1 text-[13px] text-textSecondary">Current invoice workload, payment readiness, and accrual variance. Updated {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}.</p>
      </div>
      <div className="space-y-4">
        <StatCards bills={visibleBills} exceptions={visibleExceptions} />
        <PipelineTable bills={visibleBills} />
        {visibleBills.length > 0 ? (
          <WorkloadPanel bills={visibleBills} />
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-[13px] text-textSecondary">
            {searchQuery.trim() ? 'No dashboard records match the current search.' : 'Upload bills to populate accrual analytics and payment workload.'}
          </div>
        )}
      </div>
    </div>
  );
}
