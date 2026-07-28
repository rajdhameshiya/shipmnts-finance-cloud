import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BillDetail } from '../components/bill/BillDetail';
import { InboxList } from '../components/inbox/InboxList';
import type { InboxFilter } from '../components/inbox/InboxFilters';
import { billMatchesSearch } from '../lib/search';
import { useAppStore } from '../store/appStore';
import { UploadCloud } from 'lucide-react';

const matchesFilter = (status: string, filter: InboxFilter) => {
  if (filter === 'all') return true;
  if (filter === 'blocked') return status === 'duplicate_blocked';
  if (filter === 'review') return ['flagged', 'unmatched', 'disputed', 'failed'].includes(status);
  return status === filter;
};

export function InboxPage() {
  const navigate = useNavigate();
  const { billId } = useParams();
  const [filter, setFilter] = useState<InboxFilter>('all');
  const { bills, exceptions, selectedBillId, searchQuery, setSearchQuery, selectBill, addProcessingUpload, completeUploadedBill, failUploadedBill } = useAppStore();

  useEffect(() => {
    if (billId && billId !== selectedBillId) selectBill(billId);
  }, [billId, selectedBillId, selectBill]);

  const visibleBills = useMemo(
    () => bills.filter((bill) => matchesFilter(bill.status, filter) && billMatchesSearch(bill, searchQuery)),
    [bills, filter, searchQuery],
  );
  const routeBill = billId ? bills.find((bill) => bill.id === billId && billMatchesSearch(bill, searchQuery)) : undefined;
  const selected = billId ? routeBill ?? null : bills.find((bill) => bill.id === selectedBillId && billMatchesSearch(bill, searchQuery)) ?? visibleBills[0] ?? null;
  const billExceptions = selected ? exceptions.filter((exception) => selected.exceptions.includes(exception.id)) : [];
  const counts = useMemo(
    () => ({
      all: bills.length,
      processing: bills.filter((bill) => bill.status === 'processing').length,
      review: bills.filter((bill) => ['flagged', 'unmatched', 'disputed', 'failed'].includes(bill.status)).length,
      draft: bills.filter((bill) => bill.status === 'draft').length,
      blocked: bills.filter((bill) => bill.status === 'duplicate_blocked').length,
    }),
    [bills],
  );

  return (
    <div className="flex h-full min-h-0">
      <InboxList
        bills={visibleBills}
        allCount={bills.length}
        counts={counts}
        selectedBillId={selected?.id ?? ''}
        filter={filter}
        onFilterChange={setFilter}
        onSelect={(nextBillId) => {
          selectBill(nextBillId);
          navigate(`/inbox/${nextBillId}`);
        }}
        onSimulateIntake={async (file) => {
          const temporaryBillId = addProcessingUpload({ name: file.name, size: file.size, type: file.type || 'application/octet-stream' });
          setFilter('all');
          navigate(`/inbox/${temporaryBillId}`);

          try {
            const formData = new FormData();
            formData.append('bill', file);
            const response = await fetch('/api/bills/upload', {
              method: 'POST',
              body: formData,
            });
            const responseText = await response.text();
            let result: { bill?: Parameters<typeof completeUploadedBill>[1]; exception?: Parameters<typeof completeUploadedBill>[2]; error?: string };

            try {
              result = JSON.parse(responseText);
            } catch {
              throw new Error(
                response.ok
                  ? 'The server returned an unreadable response. Please try the upload again.'
                  : responseText.trim() || `Upload failed with server status ${response.status}.`,
              );
            }

            if (!response.ok) throw new Error(result.error || `Unable to process uploaded bill (${response.status})`);
            if (!result.bill) throw new Error('The server completed processing without returning the bill.');
            completeUploadedBill(temporaryBillId, result.bill, result.exception);
            navigate(`/inbox/${result.bill.id}`);
          } catch (error) {
            failUploadedBill(temporaryBillId, error instanceof Error ? error.message : 'Unable to process uploaded bill');
          }
        }}
        hideOnCompact={Boolean(selected)}
      />
      {selected ? (
        <BillDetail bill={selected} exceptions={billExceptions} />
      ) : (
        <section className="hidden min-w-0 flex-1 items-center justify-center bg-appBg p-6 lg:flex">
          <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange/10 text-orange">
              <UploadCloud size={20} />
            </div>
            <h2 className="text-[16px] font-semibold text-textPrimary">
              {billId && !bills.some((bill) => bill.id === billId) ? 'Bill not found' : bills.length ? 'No bills match this view' : 'No bills uploaded yet'}
            </h2>
            <p className="mt-2 text-[13px] leading-6 text-textSecondary">
              {bills.length
                ? 'Clear the search or change the Inbox filter to continue.'
                : 'Use the upload button in the AP Inbox to add the first invoice. It will appear here while processing.'}
            </p>
            {bills.length > 0 && searchQuery.trim() && (
              <button className="mt-3 rounded bg-navy px-3 py-2 text-[12px] font-semibold text-white" onClick={() => { setSearchQuery(''); setFilter('all'); }}>
                Clear search and filters
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
