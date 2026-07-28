import { CheckCircle2, FileText, SearchCheck, UploadCloud, X } from 'lucide-react';
import { type ChangeEvent, useRef, useState } from 'react';
import type { UploadedBillFile } from '../../store/appStore';

export function IntakeSimulator({ onComplete }: { onComplete: (file: File) => void }) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedBillFile | null>(null);
  const [selectedRawFile, setSelectedRawFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedRawFile(file);
    setSelectedFile({ name: file.name, size: file.size, type: file.type || 'application/octet-stream' });
  };

  const close = () => {
    setOpen(false);
    setSelectedRawFile(null);
    setSelectedFile(null);
  };

  const fileSizeLabel = selectedFile
    ? selectedFile.size < 1024 * 1024
      ? `${Math.max(1, Math.round(selectedFile.size / 1024))} KB`
      : `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
    : '';

  return (
    <>
      <button
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-orange px-3 py-2 text-[12px] font-semibold text-white hover:bg-red-600"
        onClick={() => setOpen(true)}
      >
        <UploadCloud size={15} />
        Upload bill for AI processing
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-[560px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.05em] text-textMuted">Bill intake</div>
                <h2 className="mt-1 text-[17px] font-semibold text-textPrimary">Upload bill</h2>
                <p className="mt-1 text-[13px] text-textSecondary">PDF or image invoices are read, matched, and routed automatically.</p>
              </div>
              <button className="rounded p-1 text-slate-500 hover:bg-slate-100" onClick={close} aria-label="Close upload modal">
                <X size={17} />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <input ref={inputRef} className="hidden" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.tif,.tiff" onChange={chooseFile} />
              <button
                className="flex w-full items-center gap-4 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-4 text-left transition hover:border-orange hover:bg-orange/5"
                onClick={() => inputRef.current?.click()}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-50 text-navy ring-1 ring-slate-200">
                  {selectedFile ? <FileText size={19} /> : <UploadCloud size={19} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-textPrimary">{selectedFile ? selectedFile.name : 'Choose invoice file'}</span>
                  <span className="mt-1 block text-[12px] font-medium text-textMuted">
                    {selectedFile ? `${fileSizeLabel} - ${selectedFile.type || 'Document'}` : 'PDF, PNG, JPG, WEBP or TIFF'}
                  </span>
                </span>
                <span className="shrink-0 rounded border border-slate-200 px-2.5 py-1.5 text-[12px] font-semibold text-slate-700">
                  {selectedFile ? 'Change' : 'Browse'}
                </span>
              </button>
              {selectedFile && (
                <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-[12px] font-medium text-green-800">
                  <CheckCircle2 size={14} />
                  Ready to process. The bill will appear in AP Inbox immediately.
                </div>
              )}
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <div className="text-[11px] font-bold uppercase tracking-[0.05em] text-textMuted">After upload</div>
                <div className="mt-3 space-y-3">
                  <ProcessStep icon={FileText} label="Extract fields" helper="Invoice values and confidence are captured from the file." />
                  <ProcessStep icon={SearchCheck} label="Match costs" helper="The bill is matched to the job and expected accruals." />
                  <ProcessStep icon={CheckCircle2} label="Route bill" helper="Clean bills go to Draft. Exceptions go to team review." />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <button className="rounded border border-slate-300 px-3 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50" onClick={close}>
                Cancel
              </button>
              <button
                className="rounded bg-orange px-3 py-2 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!selectedRawFile}
                onClick={() => {
                  if (!selectedRawFile) return;
                  onComplete(selectedRawFile);
                  close();
                }}
              >
                Run AI processing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ProcessStep({ icon: Icon, label, helper }: { icon: typeof FileText; label: string; helper: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-navy ring-1 ring-slate-200">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <div className="text-[12px] font-semibold text-textPrimary">{label}</div>
        <div className="mt-0.5 text-[12px] leading-5 text-textSecondary">{helper}</div>
      </div>
    </div>
  );
}
