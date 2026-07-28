import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Bill, Exception } from '../../types';
import { money } from '../../lib/format';
import { useAppStore } from '../../store/appStore';
import { AgentProgressLine } from './AgentSteps';
import { ApprovalPanel } from './ApprovalPanel';
import { BillSummary } from './BillSummary';
import { DetailSection } from './DetailSection';
import { DiscrepancyTable } from './DiscrepancyTable';
import { ExtractionFields } from './ExtractionFields';
import { GSTPanel } from './GSTPanel';
import { JobMatchCard } from './JobMatchCard';

export function BillDetail({ bill, exceptions }: { bill: Bill; exceptions: Exception[] }) {
  const navigate = useNavigate();
  const updateExtractedField = useAppStore((state) => state.updateExtractedField);
  const flaggedLines = bill.chargeLineItems.filter((line) => ['overbilled', 'underbilled', 'no_accrual', 'not_billed'].includes(line.matchStatus)).length;
  const openExceptions = exceptions.filter((exception) => exception.status !== 'resolved').length;

  return (
    <section className="min-w-0 flex-1 overflow-y-auto bg-appBg">
      <div className="mx-auto max-w-6xl space-y-3 p-4">
        <button
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-navy hover:text-orange lg:hidden"
          onClick={() => navigate('/inbox')}
        >
          <ArrowLeft size={15} /> Back to inbox
        </button>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[12px] text-textSecondary">
                From: {bill.senderEmail} - {format(new Date(bill.receivedAt), 'MMM dd, HH:mm')}
              </div>
              <h1 className="mt-1 truncate text-[18px] font-semibold">{bill.invoiceNumber}</h1>
              <div className="mt-1 text-[12px] text-textSecondary">
                {bill.vendorName} - <span className="font-mono text-textPrimary">{bill.fileName}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-medium uppercase tracking-[0.05em] text-textMuted">Total</div>
              <div className="font-mono text-[20px] font-semibold">{money(bill.totalAmount, bill.currency)}</div>
            </div>
          </div>
          {bill.isSoa && (
            <div className="mt-4 rounded border border-violet-200 bg-violet-50 px-3 py-2 text-[13px] font-medium text-violet-800">
              Statement of Account: {bill.soaLineCount} lines split - {bill.soaFlaggedCount} flagged lines require review.
            </div>
          )}
          <AgentProgressLine steps={bill.agentSteps} />
        </div>

        <BillSummary bill={bill} />
        <ApprovalPanel bill={bill} exceptions={exceptions} />
        <DiscrepancyTable bill={bill} />

        {bill.jobMatch && (
          <DetailSection title="Shipment match" summary={`${bill.jobMatch.jobReference} - ${bill.jobMatch.confidence}% match`}>
            <div className="p-4">
              <JobMatchCard job={bill.jobMatch} compact />
            </div>
          </DetailSection>
        )}

        <DetailSection title="Extracted fields" summary={bill.extractedFields.length ? `${bill.extractedFields.length} fields captured with confidence` : 'Extraction pending'}>
          <ExtractionFields fields={bill.extractedFields} compact onFieldChange={(fieldName, value) => updateExtractedField(bill.id, fieldName, value)} />
        </DetailSection>

        <DetailSection title="GST / TDS details" summary={bill.gstDetails ? 'Tax details captured' : 'No tax details captured'}>
          <div className="p-4">
            <GSTPanel gst={bill.gstDetails} tds={bill.tdsDetails} compact />
          </div>
        </DetailSection>

        {openExceptions > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] font-medium text-amber-900">
            {openExceptions} open exception{openExceptions > 1 ? 's' : ''} needs review before this bill can move to Draft.
          </div>
        )}
        {!openExceptions && flaggedLines > 0 && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-[13px] font-medium text-green-800">
            Review is complete. This bill is ready for approval.
          </div>
        )}
      </div>
    </section>
  );
}
