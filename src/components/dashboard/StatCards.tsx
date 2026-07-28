import { AlertTriangle, CheckCircle2, CreditCard, FileStack } from 'lucide-react';
import { money } from '../../lib/format';
import type { Bill, Exception } from '../../types';
import { Link } from 'react-router-dom';

export function StatCards({ bills, exceptions }: { bills: Bill[]; exceptions: Exception[] }) {
  const readyBills = bills.filter((bill) => bill.status === 'draft');
  const paymentBills = bills.filter((bill) => bill.status === 'payment_processing');
  const readyAmount = readyBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const paymentAmount = paymentBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const paidBills = bills.filter((bill) => bill.status === 'paid');
  const stats = [
    { label: 'Total invoices', value: bills.length, helper: 'In the current view', icon: FileStack, tone: 'bg-blue-50 text-blue-700', to: '/inbox' },
    {
      label: 'Ready for payment',
      value: readyBills.length,
      helper: `${money(readyAmount)} awaiting batch`,
      icon: CheckCircle2,
      tone: 'bg-green-50 text-green-700',
      to: '/drafts',
    },
    {
      label: 'Open exceptions',
      value: exceptions.filter((exception) => exception.status !== 'resolved').length,
      helper: 'Needs team action',
      icon: AlertTriangle,
      tone: 'bg-amber-50 text-amber-700',
      to: '/exceptions',
    },
    { label: 'In payment process', value: paymentBills.length, helper: `${money(paymentAmount)} · ${paidBills.length} paid`, icon: CreditCard, tone: 'bg-blue-50 text-blue-700', to: '/drafts' },
  ];

  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Link key={stat.label} to={stat.to} className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm">
            <div className={`mb-3 inline-flex rounded p-2 ${stat.tone}`}>
              <Icon size={18} />
            </div>
            <div className="text-[24px] font-semibold">{stat.value}</div>
            <div className="text-[12px] text-textSecondary">{stat.label}</div>
            <div className="mt-1 truncate text-[11px] text-textMuted">{stat.helper}</div>
          </Link>
        );
      })}
    </section>
  );
}
