export type BillType =
  | 'shipping_invoice'
  | 'can_usa'
  | 'exception_charge'
  | 'credit_note'
  | 'reimbursement'
  | 'soa'
  | 'unclassified';

export type BillStatus =
  | 'processing'
  | 'failed'
  | 'matched'
  | 'flagged'
  | 'pending_approval'
  | 'approved'
  | 'posted'
  | 'draft'
  | 'payment_processing'
  | 'paid'
  | 'duplicate_blocked'
  | 'unmatched'
  | 'disputed';

export type Channel = 'email' | 'upload';

export type ExceptionType =
  | 'missing_field'
  | 'no_job_match'
  | 'overbilled'
  | 'underbilled'
  | 'no_accrual'
  | 'duplicate'
  | 'gst_mismatch'
  | 'unclassified';

export type ExceptionStatus = 'open' | 'in_review' | 'resolved' | 'escalated';
export type ExceptionSeverity = 'critical' | 'high' | 'medium' | 'low';
export type Role = 'AP Executive' | 'Ops Executive' | 'Finance Head';

export interface ChargeLineItem {
  chargeCode: string;
  chargeDescription: string;
  accrualAmount: number | null;
  billedAmount: number;
  currency: string;
  matchStatus: 'match' | 'overbilled' | 'underbilled' | 'no_accrual' | 'not_billed' | 'accepted';
  variance: number;
}

export interface ExtractedField {
  fieldName: string;
  displayLabel: string;
  value: string | number | null;
  confidence: number;
  status: 'extracted' | 'low_confidence' | 'missing' | 'conflict';
  mandatory: boolean;
}

export interface AgentStep {
  id: string;
  label: string;
  status: 'done' | 'active' | 'pending' | 'failed';
  timestamp?: string;
}

export interface GSTDetails {
  vendorGSTIN: string;
  gstType: 'IGST' | 'CGST+SGST';
  taxableAmount: number;
  gstRate: number;
  gstAmount: number;
  inputCreditEligible: boolean;
  gstinVerified: boolean;
}

export interface TDSDetails {
  applicable: boolean;
  section?: string;
  rate?: number;
  tdsAmount?: number;
  netPayable?: number;
}

export interface JobMatch {
  jobId: string;
  jobReference: string;
  customerName: string;
  route: string;
  vessel: string;
  blNumber: string;
  containerType: string;
  confidence: number;
  matchedBy: string;
}

export interface Exception {
  id: string;
  billId: string;
  shipmentRef?: string;
  type: ExceptionType;
  severity: ExceptionSeverity;
  status: ExceptionStatus;
  title: string;
  description: string;
  fieldName?: string;
  existingValue?: string;
  conflictingValue?: string;
  assignedTo: string;
  createdAt: string;
  slaDeadline: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface Bill {
  id: string;
  type: BillType;
  status: BillStatus;
  channel: Channel;
  senderName: string;
  senderEmail: string;
  subject: string;
  receivedAt: string;
  fileName: string;
  sourceUrl?: string;
  sourceMimeType?: string;
  vendorName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  currency: string;
  agentSteps: AgentStep[];
  extractedFields: ExtractedField[];
  chargeLineItems: ChargeLineItem[];
  jobMatch?: JobMatch;
  gstDetails?: GSTDetails;
  tdsDetails?: TDSDetails;
  exceptions: string[];
  approvalStatus: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  paymentBatchId?: string;
  paymentInitiatedAt?: string;
  paidAt?: string;
  isSoa?: boolean;
  soaLineCount?: number;
  soaFlaggedCount?: number;
  isBlocked?: boolean;
  blockReason?: string;
  originalBillId?: string;
  tags: string[];
  flash?: boolean;
  resolutionSummary?: string;
}

export interface AuditEvent {
  id: string;
  billId: string;
  eventType: string;
  actor: string;
  description: string;
  timestamp: string;
  fieldName?: string;
  previousValue?: string;
  newValue?: string;
}
