import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Bill, Exception, Role } from '../types';

export interface UploadedBillFile {
  name: string;
  size: number;
  type: string;
}

interface AppState {
  bills: Bill[];
  exceptions: Exception[];
  selectedBillId: string;
  role: Role;
  searchQuery: string;
  selectBill: (billId: string) => void;
  setRole: (role: Role) => void;
  setSearchQuery: (query: string) => void;
  approveBill: (billId: string) => void;
  moveBillsToPayment: (billIds: string[]) => void;
  completePaymentBatch: (batchId: string) => void;
  approveAsIs: (billId: string, note: string) => void;
  raiseDispute: (billId: string) => void;
  acceptAccrualUpdate: (billId: string) => void;
  resolveException: (exceptionId: string, mode: 'dispute' | 'accept' | 'confirm_duplicate', note?: string) => void;
  updateExtractedField: (billId: string, fieldName: string, value: string) => void;
  addSimulatedIntakeBill: (file: UploadedBillFile) => string;
  addProcessingUpload: (file: UploadedBillFile) => string;
  completeUploadedBill: (temporaryBillId: string, bill: Bill, exception?: Exception | null) => void;
  failUploadedBill: (temporaryBillId: string, message: string) => void;
}

const stamp = () =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

const cleanFlash = (bill: Bill) => ({ ...bill, flash: true });

const fileSizeLabel = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const invoiceFromFileName = (fileName: string, fallbackNumber: number) => {
  const base = fileName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-]/g, '-').toUpperCase();
  const compact = base.replace(/-+/g, '-').replace(/^-|-$/g, '');
  return compact.length >= 6 ? compact.slice(0, 22) : `INV-UPLOAD-${String(7000 + fallbackNumber).padStart(4, '0')}`;
};

const shouldAutoDraft = (fileName: string) => /\b(clean|matched|ok|valid|approved)\b/i.test(fileName.replace(/[^a-zA-Z0-9]+/g, ' '));

const makeSimulatedBill = (billNumber: number, file: UploadedBillFile): { bill: Bill; exception: Exception } => {
  const now = new Date();
  const billId = `bill-ai-${billNumber}`;
  const exceptionId = `exc-ai-${billNumber}`;
  const invoiceNumber = invoiceFromFileName(file.name, billNumber);
  const cleanBill = shouldAutoDraft(file.name);

  return {
    bill: {
      id: billId,
      type: 'shipping_invoice',
      status: cleanBill ? 'draft' : 'flagged',
      channel: 'upload',
      senderName: 'Ocean Network Express',
      senderEmail: 'uploaded-by-ap@shipmnts.finance',
      subject: `${invoiceNumber} - uploaded bill processed for shipment SHIP-004`,
      receivedAt: now.toISOString(),
      fileName: file.name,
      vendorName: 'Ocean Network Express India Pvt Ltd',
      invoiceNumber,
      invoiceDate: now.toISOString().slice(0, 10),
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      totalAmount: 73500,
      currency: 'INR',
      agentSteps: [
        { id: 's1', label: `Sample bill uploaded - ${file.name} (${fileSizeLabel(file.size)}) queued for processing`, status: 'done', timestamp: 'Now' },
        { id: 's2', label: `AI/OCR simulated read complete - ${file.type || 'document'} processed with 95% average confidence`, status: 'done', timestamp: 'Now' },
        { id: 's3', label: 'Matched to job SHIP-004 using BL# ONEU778899 - 96% confidence', status: 'done', timestamp: 'Now' },
        cleanBill
          ? { id: 's4', label: 'Accrual comparison clean - bill moved directly to Draft', status: 'done', timestamp: 'Now' }
          : { id: 's4', label: 'Accrual comparison found 1 overbilled charge - dispute raised for team review', status: 'active', timestamp: 'Now' },
        cleanBill
          ? { id: 's5', label: 'Draft created - ready for payment batch selection', status: 'done', timestamp: 'Now' }
          : { id: 's5', label: 'Waiting for AP team member to resolve dispute', status: 'pending' },
      ],
      extractedFields: [
        { fieldName: 'invoiceNumber', displayLabel: 'Invoice Number', value: invoiceNumber, confidence: 99, status: 'extracted', mandatory: true },
        { fieldName: 'sourceFile', displayLabel: 'Source File', value: file.name, confidence: 100, status: 'extracted', mandatory: true },
        { fieldName: 'vendorGSTIN', displayLabel: 'Vendor GSTIN', value: '27AAACO1234B1ZS', confidence: 96, status: 'extracted', mandatory: true },
        { fieldName: 'blNumber', displayLabel: 'BL Number', value: 'ONEU778899', confidence: 98, status: 'extracted', mandatory: true },
        { fieldName: 'containerNumber', displayLabel: 'Container Number', value: 'ONEU4455667', confidence: 94, status: 'low_confidence', mandatory: true },
        { fieldName: 'totalAmount', displayLabel: 'Total Amount', value: '₹73,500', confidence: 99, status: 'extracted', mandatory: true },
        { fieldName: 'invoiceDate', displayLabel: 'Invoice Date', value: stamp(), confidence: 93, status: 'low_confidence', mandatory: true },
      ],
      chargeLineItems: [
        { chargeCode: 'OFR', chargeDescription: 'Ocean Freight', accrualAmount: 54000, billedAmount: 54000, currency: 'INR', matchStatus: 'match', variance: 0 },
        { chargeCode: 'DOC', chargeDescription: 'Documentation Fee', accrualAmount: 3000, billedAmount: 3000, currency: 'INR', matchStatus: 'match', variance: 0 },
        {
          chargeCode: 'PSS',
          chargeDescription: 'Peak Season Surcharge',
          accrualAmount: cleanBill ? 16500 : 12500,
          billedAmount: 16500,
          currency: 'INR',
          matchStatus: cleanBill ? 'match' : 'overbilled',
          variance: cleanBill ? 0 : 4000,
        },
      ],
      jobMatch: {
        jobId: 'job-004',
        jobReference: 'SHIP-004',
        customerName: 'Tata Auto Components',
        route: 'INNSA -> SGSIN',
        vessel: 'ONE Continuity - 028E',
        blNumber: 'ONEU778899',
        containerType: '40HC x 1',
        confidence: 96,
        matchedBy: 'BL Number',
      },
      gstDetails: {
        vendorGSTIN: '27AAACO1234B1ZS',
        gstType: 'IGST',
        taxableAmount: 73500,
        gstRate: 18,
        gstAmount: 13230,
        inputCreditEligible: true,
        gstinVerified: true,
      },
      tdsDetails: { applicable: false },
      exceptions: cleanBill ? [] : [exceptionId],
      approvalStatus: cleanBill ? 'approved' : 'not_submitted',
      approvedBy: cleanBill ? 'AI auto-validation' : undefined,
      approvedAt: cleanBill ? now.toISOString() : undefined,
      tags: cleanBill
        ? ['Uploaded bill', 'AI/OCR read', 'Clean match', 'Draft ready']
        : ['Uploaded bill', 'AI/OCR read', 'Dispute raised', '1 discrepancy'],
      flash: true,
      resolutionSummary: cleanBill ? 'AI validation clean. Draft created automatically for payment batching.' : undefined,
    },
    exception: {
      id: exceptionId,
      billId,
      shipmentRef: 'SHIP-004',
      type: 'overbilled',
      severity: 'high',
      status: 'open',
      title: 'Peak Season Surcharge overbilled by ₹4,000',
      description: `AI/OCR processed ${file.name}, matched the charge to SHIP-004, and found billed ₹16,500 against accrual ₹12,500.`,
      fieldName: 'Peak Season Surcharge',
      existingValue: '₹12,500 (accrual)',
      conflictingValue: '₹16,500 (billed)',
      assignedTo: 'Priya Sharma',
      createdAt: now.toISOString(),
      slaDeadline: new Date(now.getTime() + 45 * 60 * 1000).toISOString(),
    },
  };
};

const makeProcessingBill = (finalBill: Bill): Bill => ({
  ...finalBill,
  status: 'processing',
  approvalStatus: 'not_submitted',
  approvedBy: undefined,
  approvedAt: undefined,
  exceptions: [],
  extractedFields: [],
  chargeLineItems: [],
  jobMatch: undefined,
  gstDetails: undefined,
  tdsDetails: undefined,
  tags: ['Uploaded bill', 'AI/OCR processing'],
  resolutionSummary: 'Bill uploaded. AI/OCR extraction, job matching, and accrual comparison are running.',
  agentSteps: [
    finalBill.agentSteps[0],
    { id: 's2', label: 'AI/OCR is reading invoice fields', status: 'active', timestamp: 'Now' },
    { id: 's3', label: 'Waiting to match BL/container against shipment jobs', status: 'pending' },
    { id: 's4', label: 'Waiting to compare charge lines with accruals', status: 'pending' },
    { id: 's5', label: 'Draft or dispute decision pending', status: 'pending' },
  ],
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      bills: [],
      exceptions: [],
      selectedBillId: '',
      role: 'AP Executive',
      searchQuery: '',
      selectBill: (billId) => set({ selectedBillId: billId }),
      setRole: (role) => set({ role }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      updateExtractedField: (billId, fieldName, value) =>
        set((state) => ({
          bills: state.bills.map((bill) =>
            bill.id === billId
              ? cleanFlash({
                  ...bill,
                  extractedFields: bill.extractedFields.map((field) =>
                    field.fieldName === fieldName ? { ...field, value, status: 'extracted', confidence: 100 } : field,
                  ),
                  resolutionSummary: `Field corrected by ${state.role}: ${fieldName}.`,
                })
              : bill,
          ),
        })),
      approveBill: (billId) =>
        set((state) => ({
      bills: state.bills.map((bill) =>
        bill.id === billId
          ? cleanFlash({
              ...bill,
              status: 'draft',
              approvalStatus: 'approved',
              approvedBy: 'Suresh Menon',
              approvedAt: new Date().toISOString(),
              tags: Array.from(new Set([...bill.tags.filter((tag) => !tag.includes('Pending')), 'Approved', 'Draft ready'])),
              agentSteps: bill.agentSteps.map((step) => (step.status === 'active' ? { ...step, status: 'done' } : step)),
            })
          : bill,
      ),
    })),
      moveBillsToPayment: (billIds) => {
        const batchId = `PAY-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-4)}`;
        const initiatedAt = new Date().toISOString();
        set((state) => ({
          bills: state.bills.map((bill) =>
            billIds.includes(bill.id) && bill.status === 'draft'
              ? cleanFlash({
                  ...bill,
                  status: 'payment_processing',
                  paymentBatchId: batchId,
                  paymentInitiatedAt: initiatedAt,
                  tags: Array.from(new Set([...bill.tags.filter((tag) => tag !== 'Draft ready'), 'Payment process'])),
                  resolutionSummary: `Added to payment batch ${batchId}.`,
                })
              : bill,
          ),
        }));
      },
      completePaymentBatch: (batchId) =>
        set((state) => ({
          bills: state.bills.map((bill) =>
            bill.paymentBatchId === batchId && bill.status === 'payment_processing'
              ? cleanFlash({
                  ...bill,
                  status: 'paid',
                  paidAt: new Date().toISOString(),
                  tags: Array.from(new Set([...bill.tags.filter((tag) => tag !== 'Payment process'), 'Paid'])),
                  resolutionSummary: `Payment completed in batch ${batchId}.`,
                })
              : bill,
          ),
        })),
      approveAsIs: (billId, note) =>
        set((state) => ({
      bills: state.bills.map((bill) =>
        bill.id === billId
          ? cleanFlash({
              ...bill,
              status: 'pending_approval',
              approvalStatus: 'pending',
              resolutionSummary: `Approved as-is for finance review: ${note}`,
              tags: Array.from(new Set([...bill.tags.filter((tag) => !tag.includes('discrepancies')), 'Pending approval'])),
              agentSteps: bill.agentSteps.map((step) => (step.status === 'active' ? { ...step, status: 'done' } : step)),
            })
          : bill,
      ),
    })),
      raiseDispute: (billId) =>
        set((state) => ({
      bills: state.bills.map((bill) =>
        bill.id === billId
          ? cleanFlash({
              ...bill,
              status: 'disputed',
              resolutionSummary: 'Dispute notice logged. Overbilled amount is on hold.',
              tags: Array.from(new Set([...bill.tags.filter((tag) => !tag.includes('discrepancies')), 'Dispute raised', 'Amount on hold'])),
              agentSteps: bill.agentSteps.map((step) =>
                step.status === 'active' ? { ...step, status: 'done', label: 'Dispute notice logged - variance held from payment' } : step,
              ),
            })
          : bill,
      ),
      exceptions: state.exceptions.map((exception) =>
        exception.billId === billId && exception.status !== 'resolved'
          ? {
              ...exception,
              status: 'escalated',
              resolutionNote: `Dispute raised on ${stamp()}. Payment remains on hold pending resolution.`,
            }
          : exception,
      ),
    })),
      acceptAccrualUpdate: (billId) =>
        set((state) => ({
      bills: state.bills.map((bill) =>
        bill.id === billId
          ? cleanFlash({
              ...bill,
              status: 'pending_approval',
              approvalStatus: 'pending',
              resolutionSummary: 'Accruals updated on the job file. Bill is ready for approval.',
              tags: Array.from(new Set([...bill.tags.filter((tag) => !tag.includes('discrepancies')), 'Accrual updated', 'Pending approval'])),
              chargeLineItems: bill.chargeLineItems.map((line) =>
                line.matchStatus === 'overbilled' || line.matchStatus === 'not_billed'
                  ? { ...line, accrualAmount: line.billedAmount, variance: 0, matchStatus: 'accepted' }
                  : line,
              ),
              agentSteps: bill.agentSteps.map((step) => (step.status === 'active' ? { ...step, status: 'done' } : step)),
            })
          : bill,
      ),
      exceptions: state.exceptions.map((exception) =>
        exception.billId === billId && exception.status !== 'resolved'
          ? {
              ...exception,
              status: 'resolved',
              resolvedAt: new Date().toISOString(),
              resolutionNote: `Accrual accepted and updated on ${stamp()}.`,
            }
          : exception,
      ),
    })),
      resolveException: (exceptionId, mode, note) => {
    const target = get().exceptions.find((exception) => exception.id === exceptionId);
    if (!target) return;
    set((state) => ({
      exceptions: state.exceptions.map((exception) => {
        if (exception.id !== exceptionId) return exception;
        if (mode === 'dispute') {
          return {
            ...exception,
            status: 'escalated',
            resolutionNote: `${note || 'Dispute raised'} - ${stamp()}. Payment remains on hold pending resolution.`,
          };
        }
        return {
          ...exception,
          status: 'resolved',
          resolvedAt: new Date().toISOString(),
          resolutionNote:
            mode === 'confirm_duplicate'
              ? `Duplicate confirmed on ${stamp()}. Payment remains blocked.`
              : `${note || 'Accepted and updated'} - ${stamp()}.`,
        };
      }),
      bills: state.bills.map((bill) => {
        if (bill.id !== target.billId) return bill;
        if (mode === 'dispute') {
          return cleanFlash({
            ...bill,
            status: 'disputed',
            approvalStatus: 'not_submitted',
            resolutionSummary: 'Dispute raised. Payment is on hold while the vendor response is reviewed.',
          });
        }
        if (mode === 'confirm_duplicate' || target.type === 'duplicate') {
          return cleanFlash({
            ...bill,
            status: 'duplicate_blocked',
            approvalStatus: 'not_submitted',
            resolutionSummary: 'Human review confirmed this invoice is a duplicate. Payment remains blocked.',
          });
        }
        const stillOpen = state.exceptions.some((exception) => exception.billId === bill.id && exception.id !== exceptionId && exception.status !== 'resolved');
        return cleanFlash({
          ...bill,
          status: stillOpen ? bill.status : 'pending_approval',
          approvalStatus: stillOpen ? bill.approvalStatus : 'pending',
          chargeLineItems:
            mode === 'accept' && !stillOpen
              ? bill.chargeLineItems.map((line) =>
                  line.matchStatus === 'overbilled' || line.matchStatus === 'underbilled' || line.matchStatus === 'not_billed'
                    ? { ...line, accrualAmount: line.billedAmount, variance: 0, matchStatus: 'accepted' }
                    : line,
                )
              : bill.chargeLineItems,
          resolutionSummary: stillOpen ? bill.resolutionSummary : mode === 'accept' ? 'Human review complete. Accrual updated and bill is ready for approval.' : bill.resolutionSummary,
          tags: stillOpen ? bill.tags : Array.from(new Set([...bill.tags, 'Pending approval'])),
        });
      }),
    }));
      },
      addSimulatedIntakeBill: (file) => {
    const billNumber = get().bills.length + 1;
    const { bill, exception } = makeSimulatedBill(billNumber, file);
    const processingBill = makeProcessingBill(bill);

    set((state) => ({
      bills: [processingBill, ...state.bills],
      selectedBillId: bill.id,
    }));

    window.setTimeout(() => {
      set((state) => ({
        bills: state.bills.map((existingBill) => (existingBill.id === bill.id ? cleanFlash(bill) : existingBill)),
        exceptions: bill.exceptions.length && !state.exceptions.some((existingException) => existingException.id === exception.id)
          ? [exception, ...state.exceptions]
          : state.exceptions,
        selectedBillId: bill.id,
      }));
    }, 3200);

    return bill.id;
      },
      addProcessingUpload: (file) => {
    const now = new Date();
    const temporaryBillId = `bill-processing-${Date.now()}`;
    const invoiceNumber = invoiceFromFileName(file.name, get().bills.length + 1);
    const processingBill: Bill = {
      id: temporaryBillId,
      type: 'shipping_invoice',
      status: 'processing',
      channel: 'upload',
      senderName: 'Uploaded bill',
      senderEmail: 'uploaded-by-ap@shipmnts.finance',
      subject: `${invoiceNumber} - processing uploaded bill`,
      receivedAt: now.toISOString(),
      fileName: file.name,
      vendorName: 'Reading vendor...',
      invoiceNumber,
      invoiceDate: now.toISOString().slice(0, 10),
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      totalAmount: 0,
      currency: 'INR',
      agentSteps: [
        { id: 's1', label: `Uploaded ${file.name} (${fileSizeLabel(file.size)})`, status: 'done', timestamp: 'Now' },
        { id: 's2', label: 'Extracting real bill data from the uploaded file', status: 'active', timestamp: 'Now' },
        { id: 's3', label: 'Waiting for job and accrual matching', status: 'pending' },
        { id: 's4', label: 'Waiting for draft/dispute decision', status: 'pending' },
        { id: 's5', label: 'Draft creation pending', status: 'pending' },
      ],
      extractedFields: [],
      chargeLineItems: [],
      exceptions: [],
      approvalStatus: 'not_submitted',
      tags: ['Uploaded bill', 'Reading file'],
      flash: true,
      resolutionSummary: 'The backend is reading the actual uploaded file.',
    };

    set((state) => ({
      bills: [processingBill, ...state.bills],
      selectedBillId: temporaryBillId,
    }));

    return temporaryBillId;
      },
      completeUploadedBill: (temporaryBillId, bill, exception) =>
        set((state) => {
          const originalBill = state.bills.find(
            (existingBill) =>
              existingBill.id !== temporaryBillId &&
              existingBill.id !== bill.id &&
              existingBill.status !== 'processing' &&
              existingBill.status !== 'duplicate_blocked' &&
              existingBill.invoiceNumber.toUpperCase() === bill.invoiceNumber.toUpperCase(),
          );
          const duplicateDetected = Boolean(originalBill) || bill.status === 'duplicate_blocked';
          const duplicateExceptionId = exception?.id ?? `exc-duplicate-${Date.now()}`;
          const duplicateBill = duplicateDetected
            ? cleanFlash({
                ...bill,
                status: 'duplicate_blocked' as const,
                approvalStatus: 'not_submitted' as const,
                originalBillId: originalBill?.id ?? bill.originalBillId,
                blockReason: originalBill
                  ? `Duplicate of ${originalBill.invoiceNumber} already in AP Inbox from ${originalBill.vendorName}.`
                  : bill.blockReason || 'Duplicate invoice blocked. No matching original bill is available in this browser session.',
                exceptions: [duplicateExceptionId],
                tags: Array.from(new Set([...bill.tags, 'Duplicate blocked'])),
              })
            : cleanFlash(bill);
          const duplicateException =
            duplicateDetected
              ? {
                  ...(exception || {
                    id: duplicateExceptionId,
                    billId: duplicateBill.id,
                    shipmentRef: duplicateBill.jobMatch?.jobReference,
                    type: 'duplicate' as const,
                    severity: 'high' as const,
                    status: 'open' as const,
                    title: 'Duplicate invoice blocked',
                    description: '',
                    assignedTo: 'Priya Sharma',
                    createdAt: new Date().toISOString(),
                    slaDeadline: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
                  }),
                  id: duplicateExceptionId,
                  billId: duplicateBill.id,
                  shipmentRef: duplicateBill.jobMatch?.jobReference ?? exception?.shipmentRef,
                  description: originalBill
                    ? `Invoice ${duplicateBill.invoiceNumber} matches original bill ${originalBill.invoiceNumber}. Open the original bill to verify the posted/draft record.`
                    : exception?.description || 'Duplicate invoice blocked, but the original bill is not present in this browser session.',
                }
              : exception;

          return {
            bills: state.bills.map((existingBill) => (existingBill.id === temporaryBillId ? duplicateBill : existingBill)),
            exceptions: duplicateException
              ? [duplicateException, ...state.exceptions.filter((existingException) => existingException.id !== duplicateException.id)]
              : state.exceptions,
            selectedBillId: duplicateBill.id,
          };
        }),
      failUploadedBill: (temporaryBillId, message) =>
        set((state) => ({
      bills: state.bills.map((bill) =>
        bill.id === temporaryBillId
          ? cleanFlash({
              ...bill,
              status: 'failed',
              tags: ['Upload failed', 'Needs review'],
              resolutionSummary: message,
              agentSteps: bill.agentSteps.map((step) =>
                step.status === 'active' ? { ...step, status: 'failed', label: message } : step,
              ),
            })
          : bill,
      ),
    })),
    }),
    {
      name: 'shipmnts-ap-automation-state-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        bills: state.bills,
        exceptions: state.exceptions,
        selectedBillId: state.bills.some((bill) => bill.id === state.selectedBillId) ? state.selectedBillId : '',
        role: state.role,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<AppState>;
        return {
          ...current,
          ...saved,
          bills: (saved.bills || []).map((bill) =>
            bill.status === 'processing'
              ? {
                  ...bill,
                  status: 'failed' as const,
                  resolutionSummary: 'Processing was interrupted by a refresh. Upload the source file again to retry.',
                  agentSteps: bill.agentSteps.map((step) =>
                    step.status === 'active' ? { ...step, status: 'failed' as const, label: 'Processing interrupted. Upload the file again.' } : step,
                  ),
                }
              : bill,
          ),
        };
      },
      version: 1,
    },
  ),
);
