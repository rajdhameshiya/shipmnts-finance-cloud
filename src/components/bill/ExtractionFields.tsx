import { AlertTriangle, Check, CheckCircle2, CircleAlert, Pencil, X, XCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/format';
import type { ExtractedField } from '../../types';

const status = (field: ExtractedField) => {
  if (field.status === 'missing') return { label: 'Missing', icon: XCircle, cls: 'bg-red-50 text-red-700 border-red-200' };
  if (field.status === 'low_confidence') return { label: 'Low confidence', icon: AlertTriangle, cls: 'bg-amber-50 text-amber-700 border-amber-200' };
  if (field.status === 'conflict') return { label: 'Conflict', icon: CircleAlert, cls: 'bg-violet-50 text-violet-700 border-violet-200' };
  return { label: 'Extracted', icon: CheckCircle2, cls: 'bg-green-50 text-green-700 border-green-200' };
};

export function ExtractionFields({
  fields,
  compact = false,
  onFieldChange,
}: {
  fields: ExtractedField[];
  compact?: boolean;
  onFieldChange?: (fieldName: string, value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState('');
  if (!fields.length) return null;
  const visible = expanded ? fields : fields.slice(0, 4);
  const table = (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead className="bg-slate-50 text-[11px] font-medium uppercase tracking-[0.05em] text-textMuted">
            <tr>
              <th className="px-4 py-2">Field Name</th>
              <th className="px-4 py-2">Extracted Value</th>
              <th className="px-4 py-2">Confidence</th>
              <th className="px-4 py-2">Status</th>
              {onFieldChange && <th className="w-20 px-4 py-2 text-right">Action</th>}
            </tr>
          </thead>
          <tbody>
            {visible.map((field) => {
              const meta = status(field);
              const Icon = meta.icon;
              return (
                <tr key={field.fieldName} className={cn('border-b border-slate-100', field.status === 'missing' && field.mandatory && 'bg-red-50/60')}>
                  <td className="px-4 py-3 font-medium">{field.displayLabel}</td>
                  <td className="px-4 py-3 font-mono">
                    {editingField === field.fieldName ? (
                      <input
                        className="w-full min-w-[160px] rounded border border-orange px-2 py-1 text-[12px] outline-none"
                        value={draftValue}
                        onChange={(event) => setDraftValue(event.target.value)}
                        aria-label={`Correct ${field.displayLabel}`}
                      />
                    ) : field.value ?? '-'}
                  </td>
                  <td className="px-4 py-3 font-mono">{field.confidence}%</td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex items-center gap-1 rounded border px-2 py-1 text-[11px] font-medium', meta.cls)}>
                      <Icon size={12} /> {meta.label}
                    </span>
                  </td>
                  {onFieldChange && (
                    <td className="px-4 py-3 text-right">
                      {editingField === field.fieldName ? (
                        <span className="inline-flex gap-1">
                          <button
                            className="rounded p-1 text-success hover:bg-green-50"
                            aria-label={`Save ${field.displayLabel}`}
                            onClick={() => {
                              onFieldChange(field.fieldName, draftValue.trim());
                              setEditingField(null);
                            }}
                          >
                            <Check size={14} />
                          </button>
                          <button className="rounded p-1 text-textMuted hover:bg-slate-100" aria-label={`Cancel editing ${field.displayLabel}`} onClick={() => setEditingField(null)}>
                            <X size={14} />
                          </button>
                        </span>
                      ) : (
                        <button
                          className="rounded p-1 text-textMuted hover:bg-slate-100 hover:text-orange"
                          aria-label={`Edit ${field.displayLabel}`}
                          onClick={() => {
                            setEditingField(field.fieldName);
                            setDraftValue(field.value == null ? '' : String(field.value));
                          }}
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {fields.length > 4 && (
        <button className="px-4 py-3 text-[12px] font-semibold text-orange hover:underline" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show fewer fields' : `Show all ${fields.length} fields`}
        </button>
      )}
    </>
  );

  if (compact) return table;

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 className="text-[14px] font-semibold">Extracted fields</h2>
        <span className="text-[12px] text-textMuted">{fields.length} fields</span>
      </div>
      {table}
    </section>
  );
}
