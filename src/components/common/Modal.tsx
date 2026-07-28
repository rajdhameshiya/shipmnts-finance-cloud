import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalProps {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  tone?: 'navy' | 'red' | 'green';
  onClose: () => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
}

export function Modal({ title, children, confirmLabel, tone = 'navy', onClose, onConfirm, confirmDisabled = false }: ModalProps) {
  const color = tone === 'red' ? 'bg-danger hover:bg-red-600' : tone === 'green' ? 'bg-success hover:bg-green-600' : 'bg-navy hover:bg-slate-800';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 animate-[fadeIn_.2s_ease-out]" role="presentation">
      <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 id="modal-title" className="text-[15px] font-semibold">{title}</h2>
          <button className="rounded p-1 text-slate-500 hover:bg-slate-100" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>
        <div className="px-5 py-4 text-[13px] leading-6 text-slate-700">{children}</div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button className="rounded border border-slate-300 px-3 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50" onClick={onClose}>
            Cancel
          </button>
          <button className={`${color} rounded px-3 py-2 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50`} onClick={onConfirm} disabled={confirmDisabled}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
