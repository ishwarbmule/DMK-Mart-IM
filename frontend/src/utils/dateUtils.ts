/**
 * DMK Mart Enterprise ERP - Universal Dynamic Date Formatting & Filtering Utility
 * Automatically synchronizes with the system's real-time date (Today / Yesterday / Current Month / FY)
 */

export const getTodayISODate = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getOffsetISODate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayFormatted = (): string => {
  return formatDate(new Date());
};

export const getYesterdayFormatted = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDate(d);
};

export const getCurrentMonthFormatted = (): string => {
  return new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

export const getCurrentFinancialYear = (): string => {
  const d = new Date();
  const currentYear = d.getFullYear();
  const currentMonth = d.getMonth(); // 0 = Jan, 3 = Apr
  const startYear = currentMonth >= 3 ? currentYear : currentYear - 1;
  const endYear = (startYear + 1) % 100;
  return `FY ${startYear}-${endYear.toString().padStart(2, '0')}`;
};

export const formatDate = (dateStr: string | Date | undefined): string => {
  if (!dateStr) return formatDate(new Date());
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return String(dateStr);
    
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }); // e.g. "16 Aug 2026"
  } catch {
    return String(dateStr);
  }
};

export const formatFullDate = (dateStr: string | Date | undefined): string => {
  if (!dateStr) return formatFullDate(new Date());
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return String(dateStr);
    
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }); // e.g. "Sun, 16 August 2026"
  } catch {
    return String(dateStr);
  }
};

export const formatTaxInvoiceDate = (dateStr: string | undefined): string => {
  try {
    const d = dateStr ? new Date(dateStr) : new Date();
    if (isNaN(d.getTime())) return String(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`; // e.g. "16/08/2026"
  } catch {
    return dateStr || '';
  }
};

export const getRelativeDateLabel = (dateStr: string | undefined): string => {
  if (!dateStr) return 'Today';
  const todayStr = getTodayISODate();
  if (dateStr === todayStr) return 'Today';
  
  const yestStr = getOffsetISODate(-1);
  if (dateStr === yestStr) return 'Yesterday';

  return formatDate(dateStr);
};

export type DateFilterPreset = 'ALL' | 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'THIS_MONTH' | 'CUSTOM';

export const isDateInPreset = (dateStr: string | undefined, preset: DateFilterPreset, customFrom?: string, customTo?: string): boolean => {
  if (preset === 'ALL') return true;
  if (!dateStr) return false;

  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (preset === 'TODAY') {
    return targetDate.getTime() === today.getTime();
  }

  if (preset === 'YESTERDAY') {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return targetDate.getTime() === yesterday.getTime();
  }

  if (preset === 'LAST_7_DAYS') {
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return targetDate.getTime() >= sevenDaysAgo.getTime() && targetDate.getTime() <= today.getTime();
  }

  if (preset === 'THIS_MONTH') {
    return targetDate.getMonth() === today.getMonth() && targetDate.getFullYear() === today.getFullYear();
  }

  if (preset === 'CUSTOM') {
    if (customFrom && targetDate.getTime() < new Date(customFrom).setHours(0,0,0,0)) return false;
    if (customTo && targetDate.getTime() > new Date(customTo).setHours(23,59,59,999)) return false;
    return true;
  }

  return true;
};
