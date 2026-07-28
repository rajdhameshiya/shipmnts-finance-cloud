import { Search } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

export function TopBar() {
  const { searchQuery, setSearchQuery } = useAppStore();
  return (
    <header className="flex h-14 items-center gap-4 border-b border-borderSoft bg-white px-4 sm:justify-between sm:px-5">
      <div className="hidden sm:block">
        <div className="text-[11px] font-medium uppercase tracking-[0.05em] text-textMuted">Workspace</div>
        <div className="text-[13px] font-semibold text-textPrimary">AP Automation Command Center</div>
      </div>
      <div className="flex min-w-0 flex-1 items-center sm:flex-none">
        <label className="flex w-full min-w-0 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-500 focus-within:border-orange/50 focus-within:bg-white sm:w-[320px]">
          <Search size={15} className="shrink-0" />
          <input
            className="w-full bg-transparent text-[12px] text-textPrimary outline-none placeholder:text-slate-500"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search invoices, vendors, jobs"
            aria-label="Search invoices, vendors, jobs"
          />
        </label>
      </div>
    </header>
  );
}
