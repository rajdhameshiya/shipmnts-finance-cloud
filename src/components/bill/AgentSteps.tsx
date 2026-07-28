import { AlertTriangle, CheckCircle2, Circle, XCircle } from 'lucide-react';
import type { AgentStep } from '../../types';
import { cn } from '../../lib/format';

const iconMap = {
  done: CheckCircle2,
  active: AlertTriangle,
  pending: Circle,
  failed: XCircle,
};

const shortStepLabel = (step: AgentStep, index: number) => {
  const stableLabels = ['Intake', 'Extract', 'Match', 'Review', 'Draft'];
  if (index < stableLabels.length) return stableLabels[index];

  const label = step.label;
  const lower = label.toLowerCase();
  if (lower.includes('upload')) return 'Intake';
  if (lower.includes('extract') || lower.includes('ocr') || /\bread\b/.test(lower)) return 'Extract';
  if (lower.includes('match')) return 'Match';
  if (lower.includes('exception') || lower.includes('duplicate') || lower.includes('dispute') || lower.includes('review')) return 'Review';
  if (lower.includes('draft') || lower.includes('payment') || lower.includes('ready')) return 'Draft';
  return label.split(/\s+/).slice(0, 2).join(' ');
};

const stepStatusLabel = (step: AgentStep) => {
  if (step.status === 'done') return 'Done';
  if (step.status === 'active') return 'In progress';
  if (step.status === 'failed') return 'Blocked';
  return 'Pending';
};

export function AgentProgressLine({ steps }: { steps: AgentStep[] }) {
  return (
    <div className="mt-4 border-t border-slate-100 pt-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {steps.map((step, index) => {
          const Icon = iconMap[step.status];
          return (
            <div key={step.id} className="flex min-w-[116px] flex-1 items-center gap-2" title={step.label}>
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-white',
                  step.status === 'done' && 'border-green-200 bg-green-50 text-success',
                  step.status === 'active' && 'border-amber-200 bg-amber-50 text-warning',
                  step.status === 'pending' && 'border-slate-200 text-textMuted',
                  step.status === 'failed' && 'border-red-200 bg-red-50 text-danger',
                )}
              >
                <Icon size={15} className={step.status === 'active' ? 'animate-pulse' : ''} />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[12px] font-semibold text-textPrimary">{shortStepLabel(step, index)}</div>
                <div className="truncate text-[11px] text-textMuted">{stepStatusLabel(step)}</div>
              </div>
              {index < steps.length - 1 && <div className="hidden h-px min-w-4 flex-1 bg-slate-200 md:block" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AgentSteps({ steps, compact = false }: { steps: AgentStep[]; compact?: boolean }) {
  const content = (
    <>
      {!compact && <h2 className="mb-3 text-[14px] font-semibold text-navy">Agent processed this bill automatically</h2>}
      <div className="space-y-3">
        {steps.map((step) => {
          const Icon = iconMap[step.status];
          return (
            <div key={step.id} className="flex items-start gap-3">
              <Icon
                size={17}
                className={cn(
                  'mt-0.5 shrink-0',
                  step.status === 'done' && 'fill-green-100 text-success',
                  step.status === 'active' && 'animate-pulse fill-amber-100 text-warning',
                  step.status === 'pending' && 'text-textMuted',
                  step.status === 'failed' && 'fill-red-100 text-danger',
                )}
              />
              <div className="min-w-0 flex-1 text-[13px] text-slate-700">{step.label}</div>
              {step.timestamp && <div className="font-mono text-[11px] text-textMuted">{step.timestamp}</div>}
            </div>
          );
        })}
      </div>
    </>
  );

  if (compact) return content;

  return (
    <section className="rounded-lg border border-blue-100 bg-blue-50/70 p-4">
      {content}
    </section>
  );
}
