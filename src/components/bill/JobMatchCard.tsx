import { CheckCircle2 } from 'lucide-react';
import type { JobMatch } from '../../types';

export function JobMatchCard({ job, compact = false }: { job: JobMatch; compact?: boolean }) {
  return (
    <section className={compact ? '' : 'rounded-lg border border-green-200 bg-green-50/70'}>
      <div className={`flex items-center justify-between ${compact ? 'pb-3' : 'border-b border-green-200 px-4 py-3'}`}>
        <div>
          <div className="text-[14px] font-semibold text-green-900">Matched job</div>
          <div className="mt-1 text-[13px] text-green-800">
            {job.jobReference} - {job.customerName}
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 py-1 text-[11px] font-semibold text-white">
          <CheckCircle2 size={13} /> {job.confidence}% match
        </span>
      </div>
      <div className={`grid grid-cols-2 gap-4 md:grid-cols-4 ${compact ? '' : 'px-4 py-3'}`}>
        {[
          ['BL Number', job.blNumber],
          ['Vessel', job.vessel],
          ['Route', job.route],
          ['Container', job.containerType],
        ].map(([label, value]) => (
          <div key={label}>
            <div className="text-[11px] font-medium uppercase tracking-[0.05em] text-green-700">{label}</div>
            <div className="mt-1 truncate font-mono text-[12px] text-green-950">{value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
