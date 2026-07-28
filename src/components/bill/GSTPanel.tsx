import { CheckCircle2, XCircle } from 'lucide-react';
import { money } from '../../lib/format';
import type { GSTDetails, TDSDetails } from '../../types';

export function GSTPanel({ gst, tds, compact = false }: { gst?: GSTDetails; tds?: TDSDetails; compact?: boolean }) {
  if (!gst && !tds) return null;
  const content = (
    <>
      {!compact && (
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-[14px] font-semibold">GST details</h2>
          {gst?.gstinVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[11px] font-semibold text-green-700">
              <CheckCircle2 size={12} /> GSTIN verified
            </span>
          )}
        </div>
      )}
      <div className={compact ? 'grid gap-2 text-[13px]' : 'grid gap-2 p-4 text-[13px]'}>
        {gst && (
          <>
            <Line label="Vendor GSTIN" value={gst.vendorGSTIN} />
            <Line label="Tax type" value={`${gst.gstType} ${gst.gstRate}%`} />
            <Line label="Taxable amount" value={money(gst.taxableAmount)} />
            <Line label="GST amount" value={money(gst.gstAmount)} />
            <div className="grid grid-cols-[140px_1fr] gap-3">
              <div className="text-textSecondary">Input credit</div>
              <div className={gst.inputCreditEligible ? 'font-medium text-green-700' : 'font-medium text-red-700'}>
                {gst.inputCreditEligible ? (
                  <span className="inline-flex items-center gap-1"><CheckCircle2 size={14} /> Eligible {money(gst.gstAmount)}</span>
                ) : (
                  <span className="inline-flex items-center gap-1"><XCircle size={14} /> Not eligible - customer's expense</span>
                )}
              </div>
            </div>
          </>
        )}
        {tds?.applicable ? (
          <>
            <Line label="TDS section" value={tds.section ?? '-'} />
            <Line label="TDS rate" value={`${tds.rate}%`} />
            <Line label="TDS amount" value={money(tds.tdsAmount)} />
            <Line label="Net payable" value={money(tds.netPayable)} />
          </>
        ) : (
          <Line label="TDS applicable" value="No - carrier" />
        )}
      </div>
    </>
  );

  if (compact) return content;

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      {content}
    </section>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3">
      <div className="text-textSecondary">{label}</div>
      <div className="font-mono font-medium">{value}</div>
    </div>
  );
}
