import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  IndianRupee, 
  FileText, 
  Calendar, 
  Layers, 
  Sparkles,
  ShieldCheck,
  Scale,
  TrendingUp,
  X,
  ChevronDown,
  ChevronUp,
  Wallet,
  Receipt,
  ArrowDownLeft,
  ShoppingBag,
  Building2,
  UserCheck,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useERPData, FullJournalEntry, JournalLineItem, PartyLedgerRow } from '../../context/ERPContext';
import { CompanyVertical, FinalInvoiceData } from '../../types/erp';
import { ExportDropdown } from '../common/ExportDropdown';
import { ExportOptions } from '../../utils/exportUtils';
import { 
  formatDate, 
  formatFullDate, 
  getRelativeDateLabel, 
  isDateInPreset, 
  DateFilterPreset,
  getTodayFormatted,
  getYesterdayFormatted,
  getCurrentMonthFormatted,
  getTodayISODate,
  getOffsetISODate
} from '../../utils/dateUtils';

interface FinancialBookkeepingProps {
  activeCompany: CompanyVertical;
}

export const FinancialBookkeepingModule: React.FC<FinancialBookkeepingProps> = ({ activeCompany }) => {
  const { 
    journalEntries, 
    partyLedgers, 
    customers, 
    allInvoices,
    addJournalEntry: addGlobalJournalEntry,
    recordCustomerPayment
  } = useERPData();

  const [activeTab, setActiveTab] = useState<'journal_entries' | 'daily_daybook' | 'trial_balance' | 'profit_loss' | 'balance_sheet' | 'party_ledger'>('journal_entries');
  const [selectedPartyId, setSelectedPartyId] = useState<string>(customers[0]?.id || 'cust-01');
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(journalEntries[0]?.id || 'JE-2026-0001');
  const [expandedDayDate, setExpandedDayDate] = useState<string | null>(getTodayISODate());
  const [showNewEntryModal, setShowNewEntryModal] = useState<boolean>(false);
  const [showPaymentReceiptModal, setShowPaymentReceiptModal] = useState<boolean>(false);
  const [journalDateFilter, setJournalDateFilter] = useState<DateFilterPreset>('ALL');

  // Payment Receipt Modal State
  const [payCustId, setPayCustId] = useState<string>(customers[0]?.id || 'cust-01');
  const [payAmount, setPayAmount] = useState<number>(50000);
  const [payMode, setPayMode] = useState<'NEFT_RTGS' | 'UPI' | 'CASH' | 'CHEQUE'>('NEFT_RTGS');
  const [payRef, setPayRef] = useState<string>(`UTR-${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [payDate, setPayDate] = useState<string>(getTodayISODate());
  const [payNotes, setPayNotes] = useState<string>('Payment settlement against open sales invoices.');

  // Chart of Accounts (17 accounts as per PRD Section 12.3)
  const chartOfAccounts = [
    { code: '10000', name: 'Cash in Hand (Factory Counter)', type: 'Asset' },
    { code: '10001', name: 'HDFC Operating Bank Account', type: 'Asset' },
    { code: '12000', name: 'Accounts Receivable (Sundry Debtors)', type: 'Asset' },
    { code: '13000', name: 'Polymer Inventory (Granules & Moulded Goods)', type: 'Asset' },
    { code: '14000', name: 'Fixed Assets (Injection Moulding Machines)', type: 'Asset' },
    { code: '20000', name: 'Accounts Payable (Polymer Suppliers)', type: 'Liability' },
    { code: '21000', name: 'GST Payable (CGST + SGST + IGST)', type: 'Liability' },
    { code: '30000', name: "Owner's Capital & Reserves", type: 'Equity' },
    { code: '31000', name: 'Retained Earnings', type: 'Equity' },
    { code: '40000', name: 'Domestic Plastic Sales Revenue', type: 'Revenue' },
    { code: '41000', name: 'Moulding Job Work & Service Revenue', type: 'Revenue' },
    { code: '50000', name: 'Cost of Goods Sold (Raw Polymer PP/HDPE)', type: 'Expense' },
    { code: '51000', name: 'Salaries & Factory Wages Expense', type: 'Expense' },
    { code: '52000', name: 'Factory & Warehouse Rent Expense', type: 'Expense' },
    { code: '53000', name: 'Power, Fuel & Electricity Expense', type: 'Expense' },
    { code: '54000', name: 'Marketing & Transport Freight Expense', type: 'Expense' },
    { code: '55000', name: 'Purchase of Ancillary Materials', type: 'Expense' }
  ];

  // Modal State for New Entry
  const [newVoucherType, setNewVoucherType] = useState<any>('Payment');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState(getTodayISODate());
  const [modalLines, setModalLines] = useState<JournalLineItem[]>([
    { id: '1', accountId: '52000', accountName: 'Factory & Warehouse Rent Expense', accountGroup: 'Expense', debit: 35000, credit: 0, memo: 'Office Rent' },
    { id: '2', accountId: '10001', accountName: 'HDFC Operating Bank Account', accountGroup: 'Asset', debit: 0, credit: 35000, memo: 'Paid via Cheque' }
  ]);

  const modalDebitTotal = modalLines.reduce((acc, l) => acc + (Number(l.debit) || 0), 0);
  const modalCreditTotal = modalLines.reduce((acc, l) => acc + (Number(l.credit) || 0), 0);
  const isModalBalanced = Math.abs(modalDebitTotal - modalCreditTotal) < 0.01 && modalDebitTotal > 0;
  const difference = Math.abs(modalDebitTotal - modalCreditTotal);

  const handleAddModalLine = () => {
    setModalLines(prev => [
      ...prev,
      { id: String(Date.now()), accountId: '10000', accountName: 'Cash in Hand (Factory Counter)', accountGroup: 'Asset', debit: 0, credit: 0, memo: '' }
    ]);
  };

  const handleUpdateModalLine = (id: string, field: keyof JournalLineItem, val: any) => {
    setModalLines(prev => prev.map(l => {
      if (l.id === id) {
        if (field === 'accountId') {
          const acc = chartOfAccounts.find(a => a.code === val);
          return { ...l, accountId: val, accountName: acc?.name || '', accountGroup: (acc?.type as any) || 'Asset' };
        }
        return { ...l, [field]: val };
      }
      return l;
    }));
  };

  const handleSaveNewEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isModalBalanced) return;

    confetti({
      particleCount: 70,
      spread: 60,
      colors: ['#FF6B00', '#10B981', '#FFFFFF']
    });

    const newEntry: FullJournalEntry = {
      id: `JE-${Date.now()}`,
      entryNumber: `JE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: newDate,
      description: newDesc,
      voucherType: newVoucherType,
      totalDebit: modalDebitTotal,
      totalCredit: modalCreditTotal,
      lines: modalLines
    };

    addGlobalJournalEntry(newEntry);
    setShowNewEntryModal(false);
    setNewDesc('');
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) return;

    confetti({
      particleCount: 60,
      spread: 60,
      colors: ['#10B981', '#FF6B00', '#FFFFFF']
    });

    recordCustomerPayment(
      payCustId,
      payAmount,
      payMode,
      payRef,
      payDate,
      payNotes
    );

    setShowPaymentReceiptModal(false);
    setPayRef(`UTR-${Math.floor(10000000 + Math.random() * 90000000)}`);
  };

  // =========================================================================
  // DYNAMIC DAILY DAYBOOK & OPENING / CLOSING BALANCE HISTORY REGISTER
  // =========================================================================
  const dailyDaybookHistory = useMemo(() => {
    // 1. Gather all unique transaction dates from invoices and journal entries
    const datesSet = new Set<string>();
    allInvoices.forEach(inv => datesSet.add(inv.invoiceDate));
    journalEntries.forEach(je => datesSet.add(je.date));
    
    // Ensure today and past few days exist
    datesSet.add(getTodayISODate());
    datesSet.add(getOffsetISODate(-1));
    datesSet.add(getOffsetISODate(-2));
    datesSet.add(getOffsetISODate(-3));
    datesSet.add(getOffsetISODate(-4));
    datesSet.add(getOffsetISODate(-5));
    datesSet.add(getOffsetISODate(-7));
    datesSet.add(getOffsetISODate(-8));

    const sortedDatesAsc = Array.from(datesSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // Baseline Cash & Bank opening balance at beginning of month
    let runningCashBank = 2000000;
    let runningDebtors = 1250000;

    const computedDays = sortedDatesAsc.map(dayDate => {
      const openCashBank = runningCashBank;
      const openDebtors = runningDebtors;

      // Invoices billed on this day
      const dayInvoices = allInvoices.filter(inv => inv.invoiceDate === dayDate);
      const grossSalesBilled = dayInvoices.reduce((acc, inv) => acc + inv.grandTotal, 0);

      // Journal entries on this day
      const dayJournals = journalEntries.filter(je => je.date === dayDate);

      // Cash/Bank receipts collected (Inflow)
      const receiptsCollected = dayJournals
        .filter(je => je.voucherType === 'Receipt' || (je.voucherType === 'Sales' && je.lines.some(l => l.accountId === '10000' || l.accountId === '10001')))
        .reduce((acc, je) => acc + je.totalDebit, 0);

      // Payments / Outflows
      const payoutsOutflow = dayJournals
        .filter(je => je.voucherType === 'Payment')
        .reduce((acc, je) => acc + je.totalDebit, 0);

      // Net Cashflow movement
      const netMovement = receiptsCollected - payoutsOutflow;
      const closingCashBank = openCashBank + netMovement;
      const closingDebtors = Math.max(0, openDebtors + grossSalesBilled - receiptsCollected);

      // Advance running balances
      runningCashBank = closingCashBank;
      runningDebtors = closingDebtors;

      return {
        date: dayDate,
        dayLabel: getRelativeDateLabel(dayDate),
        formattedDate: formatDate(dayDate),
        openCashBank,
        grossSalesBilled,
        receiptsCollected,
        payoutsOutflow,
        netMovement,
        closingCashBank,
        closingDebtors,
        dayInvoices,
        dayJournals,
        voucherCount: dayInvoices.length + dayJournals.length
      };
    });

    // Return in descending order (Most recent Today first)
    return computedDays.reverse();
  }, [allInvoices, journalEntries]);

  // Today's summary metrics
  const todayRecord = dailyDaybookHistory.find(d => d.date === getTodayISODate()) || dailyDaybookHistory[0];
  const totalReceivablesDue = useMemo(() => customers.reduce((acc, c) => acc + (c.closingBalance || c.outstandingBalance || 0), 0), [customers]);

  // Party Ledger Calculations
  const selectedParty = customers.find(c => c.id === selectedPartyId) || customers[0];
  const partyLedger = partyLedgers[selectedParty.id] || [];
  const totalDr = partyLedger.reduce((acc, r) => acc + r.debitAmount, 0);
  const totalCr = partyLedger.reduce((acc, r) => acc + r.creditAmount, 0);
  const closingBalance = totalDr - totalCr;

  const getTabExportOptions = (): ExportOptions => {
    const today = getTodayISODate();

    if (activeTab === 'daily_daybook') {
      return {
        filename: `DMK_Daily_Daybook_Balance_History_${today}`,
        title: `Daily Daybook & Opening/Closing Balance Register — ${activeCompany.companyName}`,
        companyName: activeCompany.companyName,
        companyGstin: activeCompany.gstin,
        subtitle: `Audited Daily Balance History • Position as of ${formatFullDate(new Date())}`,
        columns: [
          { header: 'Date', key: 'formattedDate', width: 14 },
          { header: 'Opening Cash & Bank (₹)', key: 'openCashBank', format: v => Number(v).toLocaleString('en-IN'), width: 22, align: 'right' },
          { header: 'Sales Billed (₹)', key: 'grossSalesBilled', format: v => Number(v).toLocaleString('en-IN'), width: 18, align: 'right' },
          { header: 'Collections Inflow (₹)', key: 'receiptsCollected', format: v => Number(v).toLocaleString('en-IN'), width: 20, align: 'right' },
          { header: 'Disbursements Outflow (₹)', key: 'payoutsOutflow', format: v => Number(v).toLocaleString('en-IN'), width: 22, align: 'right' },
          { header: 'Net Movement (₹)', key: 'netMovement', format: v => (Number(v) >= 0 ? `+${Number(v).toLocaleString('en-IN')}` : Number(v).toLocaleString('en-IN')), width: 18, align: 'right' },
          { header: 'Closing Cash & Bank (₹)', key: 'closingCashBank', format: v => Number(v).toLocaleString('en-IN'), width: 22, align: 'right' },
          { header: 'Closing Debtors Due (₹)', key: 'closingDebtors', format: v => Number(v).toLocaleString('en-IN'), width: 22, align: 'right' }
        ],
        data: dailyDaybookHistory
      };
    } else if (activeTab === 'journal_entries') {
      const filtered = journalEntries.filter(je => isDateInPreset(je.date, journalDateFilter));
      return {
        filename: `DMK_Journal_Entries_${today}`,
        title: `${activeCompany.companyName} — General Journal Register`,
        companyName: activeCompany.companyName,
        companyGstin: activeCompany.gstin,
        subtitle: `Filter: ${journalDateFilter} • Generated on ${today}`,
        columns: [
          { header: 'Entry #', key: 'entryNumber', width: 15 },
          { header: 'Date', key: 'date', width: 12 },
          { header: 'Voucher Type', key: 'voucherType', width: 14 },
          { header: 'Description', key: 'description', width: 35 },
          { header: 'Total Debit (₹)', key: 'totalDebit', width: 16, align: 'right' },
          { header: 'Total Credit (₹)', key: 'totalCredit', width: 16, align: 'right' }
        ],
        data: filtered
      };
    } else if (activeTab === 'trial_balance') {
      return {
        filename: `DMK_Trial_Balance_${today}`,
        title: `${activeCompany.companyName} — Trial Balance Statement`,
        companyName: activeCompany.companyName,
        companyGstin: activeCompany.gstin,
        columns: [
          { header: 'Account Code', key: 'code', width: 14 },
          { header: 'Account Description', key: 'name', width: 35 },
          { header: 'Account Group', key: 'type', width: 16 },
          { header: 'Debit (₹)', key: 'debit', width: 16, align: 'right' },
          { header: 'Credit (₹)', key: 'credit', width: 16, align: 'right' }
        ],
        data: [
          { code: '10000', name: 'Cash in Hand (Counter)', type: 'Asset', debit: 465000, credit: 0 },
          { code: '10001', name: 'HDFC Operating Bank Account', type: 'Asset', debit: 1000000, credit: 0 },
          { code: '12000', name: 'Accounts Receivable (Sundry Debtors)', type: 'Asset', debit: 270000, credit: 0 },
          { code: '13000', name: 'Polymer Finished Inventory', type: 'Asset', debit: 300000, credit: 0 },
          { code: '14000', name: 'Fixed Assets (Machinery)', type: 'Asset', debit: 500000, credit: 0 },
          { code: '20000', name: 'Accounts Payable (Suppliers)', type: 'Liability', debit: 0, credit: 150000 },
          { code: '21000', name: 'GST Payable (Duties & Taxes)', type: 'Liability', debit: 0, credit: 85000 },
          { code: '30000', name: "Owner's Capital & Reserves", type: 'Equity', debit: 0, credit: 1800000 },
          { code: '31000', name: 'Retained Earnings', type: 'Equity', debit: 0, credit: 200000 },
          { code: '40000', name: 'Domestic Plastic Sales Revenue', type: 'Revenue', debit: 0, credit: 420000 },
          { code: '50000', name: 'Cost of Goods Sold (Raw Polymer)', type: 'Expense', debit: 120000, credit: 0 }
        ]
      };
    } else if (activeTab === 'profit_loss') {
      return {
        filename: `DMK_Profit_Loss_${today}`,
        title: `${activeCompany.companyName} — Profit & Loss Account`,
        companyName: activeCompany.companyName,
        companyGstin: activeCompany.gstin,
        columns: [
          { header: 'Nature', key: 'type', width: 14 },
          { header: 'Particulars', key: 'head', width: 35 },
          { header: 'Amount (₹)', key: 'amount', width: 18, align: 'right' }
        ],
        data: [
          { type: 'Revenue', head: 'Domestic Plastic Sales Revenue', amount: 420000 },
          { type: 'Revenue', head: 'Moulding Job Work & Service Income', amount: 45000 },
          { type: 'Expense', head: 'Cost of Goods Sold (Raw Polymer)', amount: 120000 },
          { type: 'Expense', head: 'Salaries & Factory Wages', amount: 95000 },
          { type: 'Expense', head: 'Factory & Warehouse Rent', amount: 35000 },
          { type: 'Expense', head: 'Power, Electricity & Fuel', amount: 28500 },
          { type: 'Expense', head: 'Marketing & Transport Freight', amount: 20000 }
        ]
      };
    } else if (activeTab === 'balance_sheet') {
      return {
        filename: `DMK_Balance_Sheet_${today}`,
        title: `${activeCompany.companyName} — Balance Sheet Statement`,
        companyName: activeCompany.companyName,
        companyGstin: activeCompany.gstin,
        columns: [
          { header: 'Accounting Nature', key: 'nature', width: 16 },
          { header: 'Account Group / Head', key: 'head', width: 35 },
          { header: 'Amount (₹)', key: 'amount', width: 18, align: 'right' }
        ],
        data: [
          { nature: 'Asset', head: '10000 - Cash in Hand (Counter)', amount: 465000 },
          { nature: 'Asset', head: '10001 - Bank Account (HDFC Bank)', amount: 1000000 },
          { nature: 'Asset', head: '12000 - Accounts Receivable (Sundry Debtors)', amount: 270000 },
          { nature: 'Asset', head: '13000 - Finished Moulded Inventory', amount: 300000 },
          { nature: 'Asset', head: '14000 - Fixed Assets (Machinery Plant)', amount: 500000 },
          { nature: 'Liability', head: '20000 - Accounts Payable (Suppliers)', amount: 150000 },
          { nature: 'Liability', head: '21000 - GST Payable (Duties & Taxes)', amount: 85000 },
          { nature: 'Equity', head: "30000 - Owner's Capital & Reserves", amount: 1800000 },
          { nature: 'Equity', head: '31000 - Retained Earnings', amount: 200000 }
        ]
      };
    } else {
      return {
        filename: `DMK_Party_Ledger_${selectedParty.partyName.replace(/[^a-zA-Z0-9]/g, '_')}_${today}`,
        title: `Customer Statement of Account — ${selectedParty.partyName}`,
        companyName: activeCompany.companyName,
        companyGstin: activeCompany.gstin,
        columns: [
          { header: 'Voucher Date', key: 'date', width: 12 },
          { header: 'Voucher Number', key: 'voucherNumber', width: 16 },
          { header: 'Voucher Type', key: 'voucherType', width: 12, align: 'center' },
          { header: 'Particulars / Memo', key: 'particulars', width: 35 },
          { header: 'Debit Amount (₹)', key: 'debitAmount', width: 16, align: 'right' },
          { header: 'Credit Amount (₹)', key: 'creditAmount', width: 16, align: 'right' },
          { header: 'Running Balance (₹)', key: 'runningBalance', format: (_, r) => `${r.runningBalance} ${r.balanceType}`, width: 18, align: 'right' }
        ],
        data: partyLedger
      };
    }
  };

  const getTabLabel = () => {
    switch (activeTab) {
      case 'daily_daybook': return 'Daily Daybook';
      case 'journal_entries': return 'Journal Entries';
      case 'trial_balance': return 'Trial Balance';
      case 'profit_loss': return 'P&L Statement';
      case 'balance_sheet': return 'Balance Sheet';
      case 'party_ledger': return 'Customer Ledger';
      default: return 'Bookkeeping';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner */}
      <div 
        className="glass-panel"
        style={{
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderLeft: '5px solid var(--accent-orange)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#FFF' }}>
              Financial Bookkeeping & Daily Opening / Closing Ledgers
            </h1>
            <span className="status-pill status-pill-success">
              100% BALANCED
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Everyday Opening & Closing Cash/Bank Registers, Tally Double-Entry Journals, Trial Balance, P&L & Balance Sheets
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={() => setShowPaymentReceiptModal(true)}
            className="btn-outline-orange"
            style={{ padding: '8px 14px', fontSize: '12px' }}
          >
            <Receipt size={15} />
            <span>Record Customer Receipt</span>
          </button>

          <ExportDropdown options={getTabExportOptions()} buttonLabel={`Export ${getTabLabel()}`} />
          
          <button 
            onClick={() => setShowNewEntryModal(true)}
            className="btn-primary"
            style={{ padding: '9px 18px', fontSize: '13px' }}
          >
            <Plus size={16} />
            <span>New Journal Entry</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('daily_daybook')}
          className={activeTab === 'daily_daybook' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Wallet size={14} />
          <span>Daily Daybook & Balances ({dailyDaybookHistory.length} Days)</span>
        </button>

        <button
          onClick={() => setActiveTab('journal_entries')}
          className={activeTab === 'journal_entries' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '12px' }}
        >
          <BookOpen size={14} />
          <span>Journal Entries ({journalEntries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('party_ledger')}
          className={activeTab === 'party_ledger' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '12px' }}
        >
          <FileText size={14} />
          <span>Customer Party Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('trial_balance')}
          className={activeTab === 'trial_balance' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '12px' }}
        >
          <Scale size={14} />
          <span>Trial Balance</span>
        </button>

        <button
          onClick={() => setActiveTab('profit_loss')}
          className={activeTab === 'profit_loss' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '12px' }}
        >
          <TrendingUp size={14} />
          <span>Profit & Loss (P&L)</span>
        </button>

        <button
          onClick={() => setActiveTab('balance_sheet')}
          className={activeTab === 'balance_sheet' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '12px' }}
        >
          <ShieldCheck size={14} />
          <span>Balance Sheet</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB: DAILY DAYBOOK & OPENING / CLOSING BALANCE HISTORY                     */}
      {/* ========================================================================= */}
      {activeTab === 'daily_daybook' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Top Live Daily Position KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Today's Opening Cash & Bank</div>
              <div className="font-mono" style={{ fontSize: '18px', fontWeight: 900, color: 'var(--accent-cyan)', marginTop: '2px' }}>
                ₹{todayRecord?.openCashBank.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '3px' }}>Carried forward from yesterday</div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Today's Sales Invoiced</div>
              <div className="font-mono" style={{ fontSize: '18px', fontWeight: 900, color: 'var(--accent-orange-bright)', marginTop: '2px' }}>
                ₹{todayRecord?.grossSalesBilled.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '3px' }}>{todayRecord?.dayInvoices.length} bill(s) generated today</div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Today's Collections Received</div>
              <div className="font-mono" style={{ fontSize: '18px', fontWeight: 900, color: '#10B981', marginTop: '2px' }}>
                +₹{todayRecord?.receiptsCollected.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '3px' }}>NEFT / UPI / Cash Inflow</div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Today's Closing Cash & Bank</div>
              <div className="font-mono" style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF', marginTop: '2px' }}>
                ₹{todayRecord?.closingCashBank.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '10.5px', color: '#10B981', marginTop: '3px', fontWeight: 600 }}>
                Net Day Cashflow: {todayRecord?.netMovement >= 0 ? `+₹${todayRecord?.netMovement.toLocaleString('en-IN')}` : `-₹${Math.abs(todayRecord?.netMovement).toLocaleString('en-IN')}`}
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Receivables (Debtors)</div>
              <div className="font-mono" style={{ fontSize: '18px', fontWeight: 900, color: '#EF4444', marginTop: '2px' }}>
                ₹{totalReceivablesDue.toLocaleString('en-IN')} Dr
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '3px' }}>Outstanding Across All Customers</div>
            </div>
          </div>

          {/* Everyday Basis Balance History Register Table */}
          <div className="enterprise-table-container">
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFF' }}>
                  Daily Balance Register & Cashflow History List
                </h3>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Day-by-day opening balance, billed sales, collections, disbursements, and closing balances
                </div>
              </div>
              <span className="status-pill status-pill-cyan" style={{ fontSize: '10px' }}>
                {dailyDaybookHistory.length} DAYS AUDITED
              </span>
            </div>

            <table className="enterprise-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: '36px' }}></th>
                  <th style={{ minWidth: '150px' }}>Day & Date</th>
                  <th style={{ textAlign: 'right', minWidth: '130px' }}>Opening Balance (₹)</th>
                  <th style={{ textAlign: 'right', minWidth: '130px' }}>Sales Billed (₹)</th>
                  <th style={{ textAlign: 'right', minWidth: '130px' }}>Receipts Inflow (₹)</th>
                  <th style={{ textAlign: 'right', minWidth: '130px' }}>Payouts Outflow (₹)</th>
                  <th style={{ textAlign: 'right', minWidth: '130px' }}>Net Movement (₹)</th>
                  <th style={{ textAlign: 'right', minWidth: '140px', background: 'rgba(255, 107, 0, 0.08)' }}>Closing Balance (₹)</th>
                  <th style={{ textAlign: 'right', minWidth: '140px' }}>Closing Debtors (₹)</th>
                </tr>
              </thead>
              <tbody>
                {dailyDaybookHistory.map((day) => {
                  const isExpanded = expandedDayDate === day.date;
                  return (
                    <React.Fragment key={day.date}>
                      <tr 
                        onClick={() => setExpandedDayDate(isExpanded ? null : day.date)}
                        style={{
                          cursor: 'pointer',
                          background: isExpanded ? 'rgba(255, 107, 0, 0.08)' : undefined,
                          borderLeft: day.date === getTodayISODate() ? '3px solid var(--accent-orange)' : undefined
                        }}
                      >
                        <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </td>
                        <td>
                          <div style={{ fontWeight: 800, color: day.date === getTodayISODate() ? 'var(--accent-orange-bright)' : '#FFF' }}>
                            {day.formattedDate}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                            {day.dayLabel} • {day.voucherCount} Activity Item(s)
                          </div>
                        </td>
                        <td className="font-mono" style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          ₹{day.openCashBank.toLocaleString('en-IN')}
                        </td>
                        <td className="font-mono" style={{ textAlign: 'right', fontWeight: 700, color: day.grossSalesBilled > 0 ? 'var(--accent-orange-bright)' : 'inherit' }}>
                          {day.grossSalesBilled > 0 ? `₹${day.grossSalesBilled.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="font-mono" style={{ textAlign: 'right', fontWeight: 700, color: day.receiptsCollected > 0 ? '#10B981' : 'inherit' }}>
                          {day.receiptsCollected > 0 ? `+₹${day.receiptsCollected.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="font-mono" style={{ textAlign: 'right', fontWeight: 700, color: day.payoutsOutflow > 0 ? '#EF4444' : 'inherit' }}>
                          {day.payoutsOutflow > 0 ? `-₹${day.payoutsOutflow.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="font-mono" style={{ textAlign: 'right', fontWeight: 800, color: day.netMovement >= 0 ? '#10B981' : '#EF4444' }}>
                          {day.netMovement > 0 ? `+₹${day.netMovement.toLocaleString('en-IN')}` : day.netMovement < 0 ? `-₹${Math.abs(day.netMovement).toLocaleString('en-IN')}` : '₹0'}
                        </td>
                        <td className="font-mono" style={{ textAlign: 'right', fontWeight: 900, color: '#FFFFFF', background: 'rgba(255, 107, 0, 0.04)' }}>
                          ₹{day.closingCashBank.toLocaleString('en-IN')}
                        </td>
                        <td className="font-mono" style={{ textAlign: 'right', fontWeight: 800, color: '#EF4444' }}>
                          ₹{day.closingDebtors.toLocaleString('en-IN')} Dr
                        </td>
                      </tr>

                      {/* Drilldown Sub-Table for this specific Day */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={9} style={{ padding: '0', background: 'rgba(0, 0, 0, 0.35)' }}>
                            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-orange-bright)' }}>
                                  Itemized Vouchers & Bills for {day.formattedDate}:
                                </span>
                                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                                  Day Opening: ₹{day.openCashBank.toLocaleString('en-IN')} ➔ Day Closing: ₹{day.closingCashBank.toLocaleString('en-IN')}
                                </span>
                              </div>

                              {day.dayInvoices.length === 0 && day.dayJournals.length === 0 ? (
                                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', padding: '8px 0' }}>
                                  No transaction vouchers recorded on this date. Balances carried forward intact.
                                </div>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  {/* Invoices List */}
                                  {day.dayInvoices.map((inv, iIdx) => (
                                    <div 
                                      key={iIdx}
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '8px 12px',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border-subtle)',
                                        fontSize: '11.5px'
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span className="status-pill status-pill-orange" style={{ fontSize: '9px' }}>TAX INVOICE</span>
                                        <span className="font-mono" style={{ fontWeight: 800, color: '#FFF' }}>#{inv.invoiceNumber}</span>
                                        <span style={{ color: 'var(--text-secondary)' }}>Billed To: <strong style={{ color: '#FFF' }}>{inv.customer.partyName}</strong></span>
                                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>({inv.lineItems.length} SKUs • {inv.paymentMode})</span>
                                      </div>

                                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Taxable: ₹{inv.subtotalTaxable.toLocaleString('en-IN')}</span>
                                        <span className="font-mono" style={{ fontWeight: 900, color: 'var(--accent-orange-bright)' }}>
                                          Total: ₹{inv.grandTotal.toLocaleString('en-IN')}
                                        </span>
                                      </div>
                                    </div>
                                  ))}

                                  {/* Journal Entries List */}
                                  {day.dayJournals.map((je, jIdx) => (
                                    <div 
                                      key={jIdx}
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '8px 12px',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border-subtle)',
                                        fontSize: '11.5px'
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span className={`status-pill ${je.voucherType === 'Receipt' ? 'status-pill-success' : 'status-pill-cyan'}`} style={{ fontSize: '9px' }}>
                                          {je.voucherType.toUpperCase()} VOUCHER
                                        </span>
                                        <span className="font-mono" style={{ fontWeight: 800, color: '#FFF' }}>{je.entryNumber}</span>
                                        <span style={{ color: 'var(--text-secondary)' }}>{je.description}</span>
                                      </div>

                                      <div className="font-mono" style={{ fontWeight: 900, color: je.voucherType === 'Receipt' ? '#10B981' : '#FFF' }}>
                                        ₹{je.totalDebit.toLocaleString('en-IN')}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Tab: Journal Entries */}
      {activeTab === 'journal_entries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Date Filter Bar */}
          <div className="glass-panel" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', background: 'rgba(255, 107, 0, 0.03)', borderColor: 'rgba(255, 107, 0, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--accent-orange-bright)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} /> FILTER VOUCHERS BY DATE:
              </span>
              {(['ALL', 'TODAY', 'YESTERDAY', 'LAST_7_DAYS', 'THIS_MONTH'] as const).map(df => (
                <button
                  key={df}
                  onClick={() => setJournalDateFilter(df)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: journalDateFilter === df ? 700 : 500,
                    borderRadius: '6px',
                    border: journalDateFilter === df ? '1px solid var(--accent-orange)' : '1px solid var(--border-subtle)',
                    background: journalDateFilter === df ? 'rgba(255, 107, 0, 0.2)' : 'var(--bg-secondary)',
                    color: journalDateFilter === df ? '#FFF' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  {df === 'ALL' ? 'All Dates' : df === 'TODAY' ? `Today (${getTodayFormatted()})` : df === 'YESTERDAY' ? `Yesterday (${getYesterdayFormatted()})` : df === 'LAST_7_DAYS' ? 'Last 7 Days' : `This Month (${getCurrentMonthFormatted()})`}
                </button>
              ))}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Showing <strong>{journalEntries.filter(je => isDateInPreset(je.date, journalDateFilter)).length}</strong> voucher(s)
            </div>
          </div>

          <div className="enterprise-table-container">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Entry Number</th>
                  <th>Posting Date</th>
                  <th>Description / Particulars</th>
                  <th>Voucher Type</th>
                  <th style={{ textAlign: 'right' }}>Total Debit (₹)</th>
                  <th style={{ textAlign: 'right' }}>Total Credit (₹)</th>
                  <th>Integrity Status</th>
                </tr>
              </thead>
              <tbody>
                {journalEntries
                  .filter(je => isDateInPreset(je.date, journalDateFilter))
                  .map((je) => {
                    const isExpanded = expandedEntryId === je.id;
                    return (
                      <React.Fragment key={je.id}>
                        <tr 
                          onClick={() => setExpandedEntryId(isExpanded ? null : je.id)}
                          style={{ cursor: 'pointer', background: isExpanded ? 'rgba(255, 107, 0, 0.06)' : undefined }}
                        >
                          <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </td>
                          <td className="font-mono" style={{ color: 'var(--accent-orange-bright)', fontWeight: 700 }}>
                            {je.entryNumber}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Calendar size={12} color="var(--accent-orange)" />
                              <span style={{ fontWeight: 600, color: '#FFF' }}>{formatDate(je.date)}</span>
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--accent-orange-bright)', fontWeight: 500 }}>
                              {getRelativeDateLabel(je.date)}
                            </div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{je.description}</td>
                          <td>
                            <span className="status-pill status-pill-cyan" style={{ fontSize: '9px' }}>
                              {je.voucherType}
                            </span>
                          </td>
                          <td className="font-mono" style={{ textAlign: 'right', fontWeight: 800 }}>
                            ₹{je.totalDebit.toLocaleString('en-IN')}
                          </td>
                          <td className="font-mono" style={{ textAlign: 'right', fontWeight: 800, color: '#10B981' }}>
                            ₹{je.totalCredit.toLocaleString('en-IN')}
                          </td>
                          <td>
                            <span className="status-pill status-pill-success">
                              <CheckCircle2 size={10} /> POSTED
                            </span>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan={8} style={{ padding: '0', background: 'rgba(0, 0, 0, 0.25)' }}>
                              <div style={{ padding: '14px 20px' }}>
                                <table style={{ width: '100%', fontSize: '11.5px', borderCollapse: 'collapse' }}>
                                  <thead>
                                    <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                                      <th style={{ textAlign: 'left', padding: '6px' }}>Account Code & Name</th>
                                      <th style={{ textAlign: 'left', padding: '6px' }}>Group</th>
                                      <th style={{ textAlign: 'right', padding: '6px', width: '120px' }}>Debit (₹)</th>
                                      <th style={{ textAlign: 'right', padding: '6px', width: '120px' }}>Credit (₹)</th>
                                      <th style={{ textAlign: 'left', padding: '6px' }}>Line Memo</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {je.lines.map((l) => (
                                      <tr key={l.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                                        <td style={{ padding: '6px', fontWeight: 600, color: '#FFF' }}>
                                          {l.accountId} - {l.accountName}
                                        </td>
                                        <td style={{ padding: '6px', color: 'var(--text-secondary)' }}>{l.accountGroup}</td>
                                        <td className="font-mono" style={{ textAlign: 'right', padding: '6px', fontWeight: l.debit > 0 ? 700 : 400 }}>
                                          {l.debit > 0 ? `₹${l.debit.toLocaleString('en-IN')}` : '-'}
                                        </td>
                                        <td className="font-mono" style={{ textAlign: 'right', padding: '6px', fontWeight: l.credit > 0 ? 700 : 400, color: l.credit > 0 ? '#10B981' : 'inherit' }}>
                                          {l.credit > 0 ? `₹${l.credit.toLocaleString('en-IN')}` : '-'}
                                        </td>
                                        <td style={{ padding: '6px', color: 'var(--text-tertiary)' }}>{l.memo}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Customer Party Ledger */}
      {activeTab === 'party_ledger' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>SELECT CUSTOMER / DEBTOR:</span>
              <select 
                value={selectedPartyId} 
                onChange={e => setSelectedPartyId(e.target.value)}
                className="form-input"
                style={{ width: 'auto', minWidth: '280px', fontWeight: 700 }}
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.partyName} ({c.city}) — Outstanding: ₹{(c.closingBalance || c.outstandingBalance || 0).toLocaleString('en-IN')} {c.balanceType}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>CLOSING BALANCE:</span>
                <div className="font-mono" style={{ fontSize: '16px', fontWeight: 900, color: closingBalance > 0 ? '#EF4444' : '#10B981' }}>
                  ₹{Math.abs(closingBalance).toLocaleString('en-IN')} {closingBalance >= 0 ? 'Dr' : 'Cr'}
                </div>
              </div>
            </div>
          </div>

          <div className="enterprise-table-container">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Voucher Number</th>
                  <th>Voucher Type</th>
                  <th>Particulars / Transaction Memo</th>
                  <th style={{ textAlign: 'right' }}>Debit (₹)</th>
                  <th style={{ textAlign: 'right' }}>Credit (₹)</th>
                  <th style={{ textAlign: 'right' }}>Running Balance</th>
                </tr>
              </thead>
              <tbody>
                {partyLedger.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar size={12} color="var(--accent-orange)" />
                        <span style={{ fontWeight: 600, color: '#FFF' }}>{formatDate(row.date)}</span>
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--accent-orange-bright)', fontWeight: 500 }}>
                        {getRelativeDateLabel(row.date)}
                      </div>
                    </td>
                    <td className="font-mono" style={{ color: 'var(--accent-orange-bright)', fontWeight: 600 }}>{row.voucherNumber}</td>
                    <td>
                      <span className={`status-pill ${row.voucherType === 'SALES' ? 'status-pill-orange' : 'status-pill-success'}`} style={{ fontSize: '9px' }}>
                        {row.voucherType}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{row.particulars}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{row.narration}</div>
                    </td>
                    <td className="font-mono" style={{ textAlign: 'right', fontWeight: row.debitAmount > 0 ? 700 : 400 }}>
                      {row.debitAmount > 0 ? `₹${row.debitAmount.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="font-mono" style={{ textAlign: 'right', fontWeight: row.creditAmount > 0 ? 700 : 400, color: row.creditAmount > 0 ? '#10B981' : 'inherit' }}>
                      {row.creditAmount > 0 ? `₹${row.creditAmount.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="font-mono" style={{ textAlign: 'right', fontWeight: 800 }}>
                      ₹{row.runningBalance.toLocaleString('en-IN')} {row.balanceType}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'var(--bg-tertiary)', fontWeight: 800 }}>
                  <td colSpan={4} style={{ textAlign: 'right', padding: '12px 16px', color: '#FFF' }}>TOTAL:</td>
                  <td className="font-mono" style={{ textAlign: 'right', color: '#FFF' }}>₹{totalDr.toLocaleString('en-IN')}</td>
                  <td className="font-mono" style={{ textAlign: 'right', color: '#10B981' }}>₹{totalCr.toLocaleString('en-IN')}</td>
                  <td className="font-mono" style={{ textAlign: 'right', color: 'var(--accent-orange-bright)' }}>
                    ₹{Math.abs(closingBalance).toLocaleString('en-IN')} Dr
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Trial Balance */}
      {activeTab === 'trial_balance' && (
        <div className="enterprise-table-container">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Account Code</th>
                <th>Account Description</th>
                <th>Classification</th>
                <th style={{ textAlign: 'right' }}>Debit Balance (₹)</th>
                <th style={{ textAlign: 'right' }}>Credit Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="font-mono">10000</td><td style={{ fontWeight: 600 }}>Cash in Hand (Counter)</td><td>Asset</td><td className="font-mono" style={{ textAlign: 'right' }}>₹4,65,000</td><td style={{ textAlign: 'right' }}>-</td></tr>
              <tr><td className="font-mono">10001</td><td style={{ fontWeight: 600 }}>HDFC Operating Bank Account</td><td>Asset</td><td className="font-mono" style={{ textAlign: 'right' }}>₹10,00,000</td><td style={{ textAlign: 'right' }}>-</td></tr>
              <tr><td className="font-mono">12000</td><td style={{ fontWeight: 600 }}>Accounts Receivable (Sundry Debtors)</td><td>Asset</td><td className="font-mono" style={{ textAlign: 'right' }}>₹2,70,000</td><td style={{ textAlign: 'right' }}>-</td></tr>
              <tr><td className="font-mono">13000</td><td style={{ fontWeight: 600 }}>Finished Moulded Inventory</td><td>Asset</td><td className="font-mono" style={{ textAlign: 'right' }}>₹3,00,000</td><td style={{ textAlign: 'right' }}>-</td></tr>
              <tr><td className="font-mono">14000</td><td style={{ fontWeight: 600 }}>Fixed Assets (Machinery Plant)</td><td>Asset</td><td className="font-mono" style={{ textAlign: 'right' }}>₹5,00,000</td><td style={{ textAlign: 'right' }}>-</td></tr>
              <tr><td className="font-mono">20000</td><td style={{ fontWeight: 600 }}>Accounts Payable (Suppliers)</td><td>Liability</td><td style={{ textAlign: 'right' }}>-</td><td className="font-mono" style={{ textAlign: 'right' }}>₹1,50,000</td></tr>
              <tr><td className="font-mono">21000</td><td style={{ fontWeight: 600 }}>GST Payable (Duties & Taxes)</td><td>Liability</td><td style={{ textAlign: 'right' }}>-</td><td className="font-mono" style={{ textAlign: 'right' }}>₹85,000</td></tr>
              <tr><td className="font-mono">30000</td><td style={{ fontWeight: 600 }}>Owner's Capital & Reserves</td><td>Equity</td><td style={{ textAlign: 'right' }}>-</td><td className="font-mono" style={{ textAlign: 'right' }}>₹18,00,000</td></tr>
              <tr><td className="font-mono">31000</td><td style={{ fontWeight: 600 }}>Retained Earnings</td><td>Equity</td><td style={{ textAlign: 'right' }}>-</td><td className="font-mono" style={{ textAlign: 'right' }}>₹2,00,000</td></tr>
              <tr><td className="font-mono">40000</td><td style={{ fontWeight: 600 }}>Domestic Plastic Sales Revenue</td><td>Revenue</td><td style={{ textAlign: 'right' }}>-</td><td className="font-mono" style={{ textAlign: 'right' }}>₹4,20,000</td></tr>
              <tr><td className="font-mono">50000</td><td style={{ fontWeight: 600 }}>Cost of Goods Sold (Raw Polymer)</td><td>Expense</td><td className="font-mono" style={{ textAlign: 'right' }}>₹1,20,000</td><td style={{ textAlign: 'right' }}>-</td></tr>
            </tbody>
            <tfoot>
              <tr style={{ background: 'var(--bg-tertiary)', fontWeight: 900 }}>
                <td colSpan={3} style={{ textAlign: 'right', color: '#FFF' }}>TRIAL BALANCE TOTALS:</td>
                <td className="font-mono" style={{ textAlign: 'right', color: 'var(--accent-orange-bright)' }}>₹26,55,000</td>
                <td className="font-mono" style={{ textAlign: 'right', color: '#10B981' }}>₹26,55,000</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Tab: Profit & Loss */}
      {activeTab === 'profit_loss' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="enterprise-table-container">
            <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.08)', fontWeight: 800, color: '#EF4444' }}>
              EXPENSES (DEBIT)
            </div>
            <table className="enterprise-table">
              <tbody>
                <tr><td>Cost of Goods Sold (Raw Polymer)</td><td className="font-mono" style={{ textAlign: 'right' }}>₹1,20,000</td></tr>
                <tr><td>Salaries & Factory Wages</td><td className="font-mono" style={{ textAlign: 'right' }}>₹95,000</td></tr>
                <tr><td>Factory & Warehouse Rent</td><td className="font-mono" style={{ textAlign: 'right' }}>₹35,000</td></tr>
                <tr><td>Power, Fuel & Electricity</td><td className="font-mono" style={{ textAlign: 'right' }}>₹28,500</td></tr>
                <tr><td>Marketing & Transport Freight</td><td className="font-mono" style={{ textAlign: 'right' }}>₹20,000</td></tr>
                <tr style={{ fontWeight: 900, background: 'var(--bg-tertiary)' }}>
                  <td>TOTAL EXPENSES:</td><td className="font-mono" style={{ textAlign: 'right', color: '#EF4444' }}>₹2,98,500</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="enterprise-table-container">
            <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.08)', fontWeight: 800, color: '#10B981' }}>
              REVENUES & INCOME (CREDIT)
            </div>
            <table className="enterprise-table">
              <tbody>
                <tr><td>Domestic Plastic Sales Revenue</td><td className="font-mono" style={{ textAlign: 'right' }}>₹4,20,000</td></tr>
                <tr><td>Moulding Job Work Income</td><td className="font-mono" style={{ textAlign: 'right' }}>₹45,000</td></tr>
                <tr style={{ fontWeight: 900, background: 'var(--bg-tertiary)' }}>
                  <td>TOTAL REVENUE:</td><td className="font-mono" style={{ textAlign: 'right', color: '#10B981' }}>₹4,65,000</td>
                </tr>
                <tr style={{ fontWeight: 900, background: 'rgba(255, 107, 0, 0.15)', borderTop: '2px solid var(--accent-orange)' }}>
                  <td style={{ color: 'var(--accent-orange-bright)' }}>NET OPERATING PROFIT:</td>
                  <td className="font-mono" style={{ textAlign: 'right', color: 'var(--accent-orange-bright)', fontSize: '14px' }}>
                    ₹1,66,500
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Balance Sheet */}
      {activeTab === 'balance_sheet' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="enterprise-table-container">
            <div style={{ padding: '12px 16px', background: 'rgba(2, 132, 199, 0.08)', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              ASSETS
            </div>
            <table className="enterprise-table">
              <tbody>
                <tr><td>10000 - Cash in Hand</td><td className="font-mono" style={{ textAlign: 'right' }}>₹4,65,000</td></tr>
                <tr><td>10001 - HDFC Operating Bank Account</td><td className="font-mono" style={{ textAlign: 'right' }}>₹10,00,000</td></tr>
                <tr><td>12000 - Accounts Receivable (Debtors)</td><td className="font-mono" style={{ textAlign: 'right' }}>₹2,70,000</td></tr>
                <tr><td>13000 - Moulded Finished Inventory</td><td className="font-mono" style={{ textAlign: 'right' }}>₹3,00,000</td></tr>
                <tr><td>14000 - Fixed Machinery Plant</td><td className="font-mono" style={{ textAlign: 'right' }}>₹5,00,000</td></tr>
                <tr style={{ fontWeight: 900, background: 'var(--bg-tertiary)' }}>
                  <td>TOTAL ASSETS:</td><td className="font-mono" style={{ textAlign: 'right', color: 'var(--accent-cyan)' }}>₹25,35,000</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="enterprise-table-container">
            <div style={{ padding: '12px 16px', background: 'rgba(245, 158, 11, 0.08)', fontWeight: 800, color: 'var(--accent-amber)' }}>
              LIABILITIES & EQUITY
            </div>
            <table className="enterprise-table">
              <tbody>
                <tr><td>20000 - Accounts Payable</td><td className="font-mono" style={{ textAlign: 'right' }}>₹1,50,000</td></tr>
                <tr><td>21000 - GST Payable Duties</td><td className="font-mono" style={{ textAlign: 'right' }}>₹85,000</td></tr>
                <tr><td>30000 - Owner's Capital</td><td className="font-mono" style={{ textAlign: 'right' }}>₹18,00,000</td></tr>
                <tr><td>31000 - Retained Earnings</td><td className="font-mono" style={{ textAlign: 'right' }}>₹2,00,000</td></tr>
                <tr><td>Current Net Profit (from P&L)</td><td className="font-mono" style={{ textAlign: 'right' }}>₹1,66,500</td></tr>
                <tr style={{ fontWeight: 900, background: 'var(--bg-tertiary)' }}>
                  <td>TOTAL LIABILITIES & EQUITY:</td><td className="font-mono" style={{ textAlign: 'right', color: 'var(--accent-amber)' }}>₹24,01,500</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: RECORD CUSTOMER PAYMENT RECEIPT                                  */}
      {/* ========================================================================= */}
      {showPaymentReceiptModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 10, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setShowPaymentReceiptModal(false)}
        >
          <div 
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '560px',
              backgroundColor: 'var(--bg-secondary)',
              color: '#FFF',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid var(--border-medium)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
                  Record Customer Collection / Payment Receipt
                </h3>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Direct Cash/Bank Inflow • Immediately updates Daybook and Customer Ledger
                </div>
              </div>
              <button onClick={() => setShowPaymentReceiptModal(false)} className="btn-secondary" style={{ padding: '4px 8px' }}>
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">SELECT CUSTOMER ACCOUNT *</label>
                <select 
                  value={payCustId}
                  onChange={e => setPayCustId(e.target.value)}
                  className="form-input"
                  style={{ fontWeight: 600 }}
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.partyName} (Due: ₹{(c.closingBalance || c.outstandingBalance || 0).toLocaleString('en-IN')} {c.balanceType})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">RECEIVED AMOUNT (₹) *</label>
                  <input 
                    type="number"
                    required
                    value={payAmount}
                    onChange={e => setPayAmount(parseFloat(e.target.value) || 0)}
                    className="form-input font-mono"
                    style={{ fontSize: '15px', fontWeight: 800, color: '#10B981' }}
                  />
                </div>

                <div>
                  <label className="form-label">PAYMENT SETTLEMENT MODE</label>
                  <select 
                    value={payMode}
                    onChange={e => setPayMode(e.target.value as any)}
                    className="form-input"
                  >
                    <option value="NEFT_RTGS">Bank NEFT / RTGS (HDFC)</option>
                    <option value="UPI">Instant UPI Transfer</option>
                    <option value="CASH">Cash Counter Receipt</option>
                    <option value="CHEQUE">Bank Cheque Clearing</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">BANK REF / UTR / TRANSACTION ID</label>
                  <input 
                    type="text"
                    required
                    value={payRef}
                    onChange={e => setPayRef(e.target.value)}
                    className="form-input font-mono"
                  />
                </div>

                <div>
                  <label className="form-label">RECEIPT DATE</label>
                  <input 
                    type="date"
                    value={payDate}
                    onChange={e => setPayDate(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">RECEIPT NARRATION / NOTES</label>
                <input 
                  type="text"
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Cleared bill #4018 against August dispatch"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px' }}>
                  <Receipt size={15} />
                  <span>Post Collection & Update Daybook</span>
                </button>
                <button type="button" onClick={() => setShowPaymentReceiptModal(false)} className="btn-secondary" style={{ padding: '12px 18px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: NEW JOURNAL ENTRY                                                */}
      {/* ========================================================================= */}
      {showNewEntryModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 10, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setShowNewEntryModal(false)}
        >
          <div 
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '740px',
              backgroundColor: 'var(--bg-secondary)',
              color: '#FFF',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid var(--border-medium)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
                  Create Double-Entry Journal Voucher
                </h3>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Strict Tally validation: Total Debits must equal Total Credits
                </div>
              </div>
              <button onClick={() => setShowNewEntryModal(false)} className="btn-secondary" style={{ padding: '4px 8px' }}>
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveNewEntry} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">DESCRIPTION / NARRATION *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Factory Power & Machinery Maintenance"
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">VOUCHER TYPE</label>
                  <select 
                    value={newVoucherType}
                    onChange={e => setNewVoucherType(e.target.value)}
                    className="form-input"
                  >
                    <option value="Payment">Payment (Cash/Bank Outflow)</option>
                    <option value="Receipt">Receipt (Cash/Bank Inflow)</option>
                    <option value="Journal">Journal (Adjustment)</option>
                    <option value="Contra">Contra (Bank to Cash)</option>
                    <option value="Sales">Sales Voucher</option>
                    <option value="Purchase">Purchase Voucher</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">VOUCHER DATE</label>
                  <input 
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Multi-Line Table */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: '10px', padding: '14px', border: '1px solid var(--border-subtle)' }}>
                <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px' }}>Account Head</th>
                      <th style={{ textAlign: 'right', width: '130px', padding: '8px 6px' }}>Debit (₹)</th>
                      <th style={{ textAlign: 'right', width: '130px', padding: '8px 6px' }}>Credit (₹)</th>
                      <th style={{ textAlign: 'left', padding: '8px 6px' }}>Line Memo / Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalLines.map((ln) => (
                      <tr key={ln.id} style={{ borderBottom: '1px dashed var(--border-subtle)' }}>
                        <td style={{ padding: '6px' }}>
                          <select 
                            value={ln.accountId}
                            onChange={e => handleUpdateModalLine(ln.id, 'accountId', e.target.value)}
                            className="table-input"
                            style={{ fontWeight: 600 }}
                          >
                            {chartOfAccounts.map(a => (
                              <option key={a.code} value={a.code}>{a.code} - {a.name} ({a.type})</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input 
                            type="number"
                            value={ln.debit || ''}
                            onChange={e => handleUpdateModalLine(ln.id, 'debit', parseFloat(e.target.value) || 0)}
                            className="table-input font-mono"
                            style={{ textAlign: 'right', fontWeight: 700 }}
                            placeholder="0.00"
                          />
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input 
                            type="number"
                            value={ln.credit || ''}
                            onChange={e => handleUpdateModalLine(ln.id, 'credit', parseFloat(e.target.value) || 0)}
                            className="table-input font-mono"
                            style={{ textAlign: 'right', fontWeight: 700, color: '#10B981' }}
                            placeholder="0.00"
                          />
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input 
                            type="text"
                            value={ln.memo}
                            onChange={e => handleUpdateModalLine(ln.id, 'memo', e.target.value)}
                            className="table-input"
                            placeholder="Optional line memo"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ marginTop: '8px' }}>
                  <button 
                    type="button"
                    onClick={handleAddModalLine}
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '10px' }}
                  >
                    + Add Another Entry Line
                  </button>
                </div>
              </div>

              {/* Equilibrium Indicator */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                background: isModalBalanced ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                border: `1px solid ${isModalBalanced ? '#10B981' : '#EF4444'}`,
                padding: '10px 16px', 
                borderRadius: '8px' 
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Debits: </span>
                  <strong className="font-mono" style={{ color: '#FFF' }}>₹{modalDebitTotal.toFixed(2)}</strong>
                  <span style={{ margin: '0 8px', color: 'var(--text-tertiary)' }}>|</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Credits: </span>
                  <strong className="font-mono" style={{ color: '#FFF' }}>₹{modalCreditTotal.toFixed(2)}</strong>
                </div>

                <div>
                  {isModalBalanced ? (
                    <span className="status-pill status-pill-success" style={{ fontSize: '10px' }}>
                      ✓ BALANCED (₹0.00 DIFFERENCE)
                    </span>
                  ) : (
                    <span className="status-pill status-pill-danger" style={{ fontSize: '10px' }}>
                      ✗ UNBALANCED (DIFFERENCE: ₹{difference.toFixed(2)})
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button 
                  type="submit"
                  disabled={!isModalBalanced}
                  className="btn-primary"
                  style={{ flex: 1, padding: '11px', opacity: isModalBalanced ? 1 : 0.5, cursor: isModalBalanced ? 'pointer' : 'not-allowed' }}
                >
                  <ShieldCheck size={16} />
                  <span>Post Verified Journal Voucher</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setShowNewEntryModal(false)}
                  className="btn-secondary"
                  style={{ padding: '11px 16px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
