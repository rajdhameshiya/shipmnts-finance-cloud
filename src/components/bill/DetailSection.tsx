import { ChevronDown, ChevronRight } from 'lucide-react';
import { type ReactNode, useState } from 'react';

export function DetailSection({ title, summary, children, defaultOpen = false }: { title: string; summary?: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <button className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50" onClick={() => setOpen((value) => !value)}>
        <div className="min-w-0">
          <div className="text-[14px] font-semibold text-textPrimary">{title}</div>
          {summary && <div className="mt-0.5 truncate text-[12px] text-textSecondary">{summary}</div>}
        </div>
        {open ? <ChevronDown size={16} className="text-textMuted" /> : <ChevronRight size={16} className="text-textMuted" />}
      </button>
      {open && <div className="border-t border-slate-200">{children}</div>}
    </section>
  );
}
