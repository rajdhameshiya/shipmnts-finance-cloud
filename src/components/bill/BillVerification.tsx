import { FileSearch } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import type { Bill } from '../../types';
import { ExtractionFields } from './ExtractionFields';

export function BillVerification({ bill }: { bill: Bill }) {
  const updateExtractedField = useAppStore((state) => state.updateExtractedField);
  const isImage = bill.sourceMimeType?.startsWith('image/');

  if (!bill.sourceUrl || !bill.extractedFields.length) return null;

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <div>
          <h2 className="flex items-center gap-2 text-[14px] font-semibold text-textPrimary"><FileSearch size={17} /> Invoice verification</h2>
          <p className="mt-0.5 text-[12px] text-textSecondary">Compare the uploaded document with the extracted values. Correct any field before approval.</p>
        </div>
        <a href={bill.sourceUrl} target="_blank" rel="noreferrer" className="text-[12px] font-semibold text-orange hover:underline">Open source file</a>
      </div>
      <div className="grid min-h-[480px] xl:grid-cols-[minmax(0,1fr)_minmax(460px,0.9fr)]">
        <div className="min-h-[480px] border-b border-slate-200 bg-slate-100 p-3 xl:border-b-0 xl:border-r">
          {isImage ? (
            <div className="flex h-full items-start justify-center overflow-auto rounded bg-white p-3">
              <img src={bill.sourceUrl} alt={`Uploaded invoice ${bill.invoiceNumber}`} className="max-w-full object-contain" />
            </div>
          ) : (
            <iframe src={bill.sourceUrl} title={`Uploaded invoice ${bill.invoiceNumber}`} className="h-full min-h-[456px] w-full rounded bg-white" />
          )}
        </div>
        <div className="min-w-0 overflow-auto">
          <ExtractionFields fields={bill.extractedFields} compact onFieldChange={(fieldName, value) => updateExtractedField(bill.id, fieldName, value)} />
        </div>
      </div>
    </section>
  );
}
