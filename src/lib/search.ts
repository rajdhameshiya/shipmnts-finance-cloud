import type { Bill, Exception } from '../types';

const normalize = (value: unknown) => String(value ?? '').toLowerCase().trim();

const includesQuery = (values: unknown[], query: string) => {
  const needle = normalize(query);
  if (!needle) return true;
  return values.some((value) => normalize(value).includes(needle));
};

export const billMatchesSearch = (bill: Bill, query: string) =>
  includesQuery(
    [
      bill.invoiceNumber,
      bill.vendorName,
      bill.fileName,
      bill.senderName,
      bill.senderEmail,
      bill.subject,
      bill.status,
      bill.channel,
      bill.totalAmount,
      bill.currency,
      bill.jobMatch?.jobReference,
      bill.jobMatch?.jobId,
      bill.jobMatch?.customerName,
      bill.jobMatch?.route,
      bill.jobMatch?.vessel,
      bill.jobMatch?.blNumber,
      bill.jobMatch?.containerType,
      bill.blockReason,
      bill.resolutionSummary,
      ...bill.tags,
      ...bill.extractedFields.flatMap((field) => [field.displayLabel, field.fieldName, field.value]),
      ...bill.chargeLineItems.flatMap((line) => [line.chargeCode, line.chargeDescription, line.matchStatus, line.billedAmount, line.accrualAmount]),
    ],
    query,
  );

export const exceptionMatchesSearch = (exception: Exception, query: string, bill?: Bill) =>
  includesQuery(
    [
      exception.title,
      exception.description,
      exception.type,
      exception.severity,
      exception.status,
      exception.assignedTo,
      exception.shipmentRef,
      exception.fieldName,
      exception.existingValue,
      exception.conflictingValue,
      exception.resolutionNote,
      bill?.invoiceNumber,
      bill?.vendorName,
      bill?.fileName,
      bill?.jobMatch?.jobReference,
    ],
    query,
  );
