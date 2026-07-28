import { cn } from '../../lib/format';

export type InboxFilter = 'all' | 'processing' | 'review' | 'draft' | 'blocked';

const filters: Array<{ id: InboxFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'processing', label: 'Processing' },
  { id: 'review', label: 'Review' },
  { id: 'draft', label: 'Draft' },
  { id: 'blocked', label: 'Blocked' },
];

export function InboxFilters({ active, counts, onChange }: { active: InboxFilter; counts: Record<InboxFilter, number>; onChange: (filter: InboxFilter) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {filters.map((filter) => (
        <button
          key={filter.id}
          className={cn(
            'rounded-full border px-2.5 py-1 text-[11px] font-medium transition',
            active === filter.id ? 'border-orange bg-orange text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-orange/40',
          )}
          onClick={() => onChange(filter.id)}
        >
          {filter.label} <span className={active === filter.id ? 'text-white/80' : 'text-textMuted'}>{counts[filter.id]}</span>
        </button>
      ))}
    </div>
  );
}
