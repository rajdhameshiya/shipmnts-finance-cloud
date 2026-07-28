import { differenceInMinutes, format, formatDistanceToNowStrict, isValid, parse, parseISO } from 'date-fns';

export const money = (value: number | null | undefined, currency = 'INR') => {
  if (value == null) return 'No accrual';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};

const parseDateValue = (value: string) => {
  const trimmed = value.trim();
  const iso = parseISO(trimmed);
  if (isValid(iso)) return iso;

  const formats = ['dd-MMM-yyyy', 'dd/MM/yyyy', 'MM/dd/yyyy', 'MMM d, yyyy', 'MMMM d, yyyy', 'dd MMM yyyy', 'MMMM dd, yyyy'];
  for (const pattern of formats) {
    const parsed = parse(trimmed, pattern, new Date());
    if (isValid(parsed)) return parsed;
  }

  const native = new Date(trimmed);
  return isValid(native) ? native : null;
};

export const shortTime = (value: string) => {
  const parsed = parseDateValue(value);
  return parsed ? format(parsed, 'HH:mm') : '-';
};

export const shortDate = (value: string) => {
  const parsed = parseDateValue(value);
  return parsed ? format(parsed, 'dd MMM') : value || '-';
};

export const ago = (value: string) => {
  const parsed = parseDateValue(value);
  return parsed ? `${formatDistanceToNowStrict(parsed, { addSuffix: true })}` : '-';
};

export const minutesTo = (value: string) => {
  const parsed = parseDateValue(value);
  return parsed ? differenceInMinutes(parsed, new Date()) : 0;
};

export const cn = (...classes: Array<string | false | undefined | null>) => classes.filter(Boolean).join(' ');
