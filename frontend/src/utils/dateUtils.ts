/**
 * DMK Mart Enterprise ERP - Universal Date Formatting & Filtering Utility
 */

export const formatDate = (dateStr: string | Date | undefined): string => {
  if (!dateStr) return 'N/A';
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return String(dateStr);
    
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }); // e.g. "15 Aug 2026"
  } catch {
    return String(dateStr);
  }
};

export const formatFullDate = (dateStr: string | Date | undefined): string => {
  if (!dateStr) return 'N/A';
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return String(dateStr);
    
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }); // e.g. "Sat, 15 August 2026"
  } catch {
    return String(dateStr);
  }
};

export const formatTaxInvoiceDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '15-08-2026';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`; // e.g. "15/08/2026"
  } catch {
    return dateStr;
  }
};

export const getRelativeDateLabel = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  const todayStr = new Date().toISOString().split('T')[0];
  if (dateStr === todayStr) return 'Today';
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yestStr = yesterday.toISOString().split('T')[0];
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
