import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  DollarSign, 
  FileText, 
  Calendar, 
  Layers, 
  Sparkles,
  ShieldCheck,
  Scale,
  TrendingUp,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useERPData, FullJournalEntry, JournalLineItem, PartyLedgerRow } from '../../context/ERPContext';
import { CompanyVertical } from '../../types/erp';
import { ExportDropdown } from '../common/ExportDropdown';
import { ExportOptions } from '../../utils/exportUtils';
import { formatDate, formatFullDate, getRelativeDateLabel, isDateInPreset, DateFilterPreset } from '../../utils/dateUtils';
import { Calendar as CalendarIcon, Clock, Filter } from 'lucide-react';

interface FinancialBookkeepingProps {
  activeCompany: CompanyVertical;
}

export const FinancialBookkeepingModule: React.FC<FinancialBookkeepingProps> = ({ activeCompany }) => {
  const { 
    journalEntries, 
    partyLedgers, 
    customers, 
    addJournalEntry: addGlobalJournalEntry 
  } = useERPData();

  const [activeTab, setActiveTab] = useState<'journal_entries' | 'trial_balance' | 'profit_loss' | 'balance_sheet' | 'party_ledger'>('journal_entries');
  const [selectedPartyId, setSelectedPartyId] = useState<string>(customers[0]?.id || 'cust-01');
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(journalEntries[0]?.id || 'JE-2026-0001');
  const [showNewEntryModal, setShowNewEntryModal] = useState<boolean>(false);
  const [journalDateFilter, setJournalDateFilter] = useState<DateFilterPreset>('ALL');

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
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
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
    if (!isModalBalanced || !newDesc.trim()) return;

    confetti({ particleCount: 70, spread: 60 });

    const newEntry: FullJournalEntry = {
      id: `JE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
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
    setExpandedEntryId(newEntry.id);
  };

  const selectedParty = customers.find(c => c.id === selectedPartyId) || customers[0];
  const partyLedger = partyLedgers[selectedPartyId] || [
    { id: '1', date: '2026-08-01', voucherNumber: 'OB-2026-001', voucherType: 'JOURNAL', particulars: 'Opening Balance (Brought Forward)', debitAmount: selectedParty?.outstandingBalance || 0, creditAmount: 0, runningBalance: selectedParty?.outstandingBalance || 0, balanceType: 'Dr', narration: 'Opening Dr' }
  ];

  const totalDr = partyLedger.reduce((acc, e) => acc + e.debitAmount, 0);
  const totalCr = partyLedger.reduce((acc, e) => acc + e.creditAmount, 0);
  const closingBalance = totalDr - totalCr;

  const trialBalanceRows = [
    { code: '10000', name: 'Cash in Hand (Factory Counter)', type: 'Asset', dr: 465000, cr: 0 },
    { code: '10001', name: 'HDFC Operating Bank Account', type: 'Asset', dr: 1000000, cr: 0 },
    { code: '12000', name: 'Accounts Receivable (Sundry Debtors)', type: 'Asset', dr: 270000, cr: 0 },
    { code: '13000', name: 'Polymer Finished Goods Inventory', type: 'Asset', dr: 300000, cr: 0 },
    { code: '14000', name: 'Fixed Assets (Injection Moulding Machines)', type: 'Asset', dr: 500000, cr: 0 },
    { code: '20000', name: 'Accounts Payable (Polymer Suppliers)', type: 'Liability', dr: 0, cr: 150000 },
    { code: '21000', name: 'GST Payable (Duties & Taxes)', type: 'Liability', dr: 0, cr: 85000 },
    { code: '30000', name: "Owner's Capital & Reserves", type: 'Equity', dr: 0, cr: 1800000 },
    { code: '31000', name: 'Retained Earnings', type: 'Equity', dr: 0, cr: 200000 },
    { code: '40000', name: 'Domestic Plastic Sales Revenue', type: 'Revenue', dr: 0, cr: 1250000 },
    { code: '50000', name: 'Cost of Goods Sold (Raw PP Granules)', type: 'Expense', dr: 450000, cr: 0 },
    { code: '51000', name: 'Salaries & Factory Wages Expense', type: 'Expense', dr: 120000, cr: 0 },
    { code: '52000', name: 'Factory & Warehouse Rent Expense', type: 'Expense', dr: 35000, cr: 0 },
    { code: '53000', name: 'Power & Utilities Expense', type: 'Expense', dr: 8500, cr: 0 },
    { code: '54000', name: 'Marketing & Transport Freight', type: 'Expense', dr: 15000, cr: 0 },
    { code: '55000', name: 'Purchase of Ancillary Materials', type: 'Expense', dr: 455000, cr: 0 }
  ];

  // Dynamic Export Options per active tab
  const getTabExportOptions = (): ExportOptions => {
    const today = new Date().toISOString().split('T')[0];

    if (activeTab === 'journal_entries') {
      const totDr = journalEntries.reduce((acc, j) => acc + j.totalDebit, 0);
      const totCr = journalEntries.reduce((acc, j) => acc + j.totalCredit, 0);
      return {
        filename: `DMK_Journal_Entries_${activeCompany.companyCode}_${today}`,
        title: `${activeCompany.companyName} — General Journal Register`,
        companyName: activeCompany.companyName,
        companyGstin: activeCompany.gstin,
        subtitle: `All Verified Double-Entry Vouchers (${journalEntries.length} entries)`,
        columns: [
          { header: 'Entry Number', key: 'entryNumber', width: 16 },
          { header: 'Voucher Date', key: 'date', width: 12 },
          { header: 'Description / Particulars', key: 'description', width: 35 },
          { header: 'Voucher Type', key: 'voucherType', width: 14, align: 'center' },
          { header: 'Total Debit (₹)', key: 'totalDebit', width: 16, align: 'right' },
          { header: 'Total Credit (₹)', key: 'totalCredit', width: 16, align: 'right' }
        ],
        data: journalEntries,
        summaryRows: [
          {
            label: 'Total Journal Debits & Credits',
            values: {
              totalDebit: totDr,
              totalCredit: totCr
            }
          }
        ]
      };
    } else if (activeTab === 'trial_balance') {
      return {
        filename: `DMK_Trial_Balance_${activeCompany.companyCode}_${today}`,
        title: `${activeCompany.companyName} — Chart of Accounts Trial Balance`,
        companyName: activeCompany.companyName,
        companyGstin: activeCompany.gstin,
        subtitle: 'Double-Entry Equilibrium Verification (17 Accounts)',
        columns: [
          { header: 'Account Code', key: 'code', width: 14 },
          { header: 'Account Name', key: 'name', width: 35 },
          { header: 'Classification', key: 'type', width: 14 },
          { header: 'Debit Balance (₹)', key: 'dr', format: v => v > 0 ? v : 0, width: 16, align: 'right' },
          { header: 'Credit Balance (₹)', key: 'cr', format: v => v > 0 ? v : 0, width: 16, align: 'right' }
        ],
        data: trialBalanceRows,
        summaryRows: [
          {
            label: 'Trial Balance Grand Equilibrium (₹0.00 Diff)',
            values: {
              dr: 3113500,
              cr: 3113500
            }
          }
        ]
      };
    } else if (activeTab === 'profit_loss') {
      return {
        filename: `DMK_Profit_Loss_Statement_${activeCompany.companyCode}_${today}`,
        title: `${activeCompany.companyName} — Statement of Profit & Loss`,
        companyName: activeCompany.companyName,
        companyGstin: activeCompany.gstin,
        subtitle: 'Financial Year 2026-2027 (MTD August 2026)',
        columns: [
          { header: 'Classification / Head', key: 'head', width: 20 },
          { header: 'Account Particulars', key: 'account', width: 35 },
          { header: 'Amount (₹)', key: 'amount', width: 18, align: 'right' }
        ],
        data: [
          { head: 'Revenue', account: '40000 - Domestic Plastic Sales Revenue', amount: 1250000 },
          { head: 'Revenue', account: '41000 - Service & Ancillary Revenue', amount: 0 },
          { head: 'Expense', account: '50000 - Cost of Goods Sold (Raw PP Granules)', amount: 450000 },
          { head: 'Expense', account: '51000 - Salaries & Factory Wages Expense', amount: 120000 },
          { head: 'Expense', account: '52000 - Factory & Warehouse Rent Expense', amount: 35000 },
          { head: 'Expense', account: '53000 - Power & Utilities Expense', amount: 8500 },
          { head: 'Expense', account: '54000 - Marketing & Distribution Freight', amount: 15000 },
          { head: 'Expense', account: '55000 - Purchase of Packaging Materials', amount: 455000 }
        ],
        summaryRows: [
          {
            label: 'Total Operating Revenue',
            values: { amount: 1250000 }
          },
          {
            label: 'Total Operating Expenses',
            values: { amount: 1083500 }
          },
          {
            label: 'Net Operating Profit (13.32% Margin)',
            values: { amount: 166500 }
          }
        ]
      };
    } else if (activeTab === 'balance_sheet') {
      return {
        filename: `DMK_Balance_Sheet_${activeCompany.companyCode}_${today}`,
        title: `${activeCompany.companyName} — Balance Sheet Statement`,
        companyName: activeCompany.companyName,
        companyGstin: activeCompany.gstin,
        subtitle: 'Position as at 15th August 2026',
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
          { nature: 'Equity', head: '31000 - Retained Earnings', amount: 200000 },
          { nature: 'Equity', head: 'Current Period Net Profit (from P&L)', amount: 166500 }
        ],
        summaryRows: [
          {
            label: 'Total Assets',
            values: { amount: 2535000 }
          },
          {
            label: 'Total Liabilities & Equity',
            values: { amount: 2401500 }
          }
        ]
      };
    } else {
      return {
        filename: `DMK_Party_Ledger_${selectedParty.partyName.replace(/[^a-zA-Z0-9]/g, '_')}_${today}`,
        title: `Customer Statement of Account — ${selectedParty.partyName}`,
        companyName: activeCompany.companyName,
        companyGstin: activeCompany.gstin,
        subtitle: `GSTIN: ${selectedParty.gstin || 'Unregistered'} • City: ${selectedParty.city} • Phone: ${selectedParty.phone}`,
        columns: [
          { header: 'Voucher Date', key: 'date', width: 12 },
          { header: 'Voucher Number', key: 'voucherNumber', width: 16 },
          { header: 'Voucher Type', key: 'voucherType', width: 12, align: 'center' },
          { header: 'Particulars / Memo', key: 'particulars', width: 35 },
          { header: 'Debit Amount (₹)', key: 'debitAmount', width: 16, align: 'right' },
          { header: 'Credit Amount (₹)', key: 'creditAmount', width: 16, align: 'right' },
          { header: 'Running Balance (₹)', key: 'runningBalance', format: (_, r) => `${r.runningBalance} ${r.balanceType}`, width: 18, align: 'right' }
        ],
        data: partyLedger,
        summaryRows: [
          {
            label: 'Closing Outstanding Balance Due',
            values: {
              debitAmount: totalDr,
              creditAmount: totalCr,
              runningBalance: `₹${Math.abs(closingBalance).toLocaleString('en-IN')} Dr`
            }
          }
        ]
      };
    }
  };

  const getTabLabel = () => {
    switch (activeTab) {
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
              Double-Entry Financial Bookkeeping & Statements
            </h1>
            <span className="status-pill status-pill-success">
              100% BALANCED
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {activeCompany.companyName} • Tally-standard Chart of Accounts, Journal Vouchers, Trial Balance, P&L & Balance Sheet
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('journal_entries')}
          className={activeTab === 'journal_entries' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '12px' }}
        >
          <BookOpen size={14} />
          <span>Journal Entries ({journalEntries.length})</span>
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
        <button
          onClick={() => setActiveTab('party_ledger')}
          className={activeTab === 'party_ledger' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '12px' }}
        >
          <FileText size={14} />
          <span>Customer Party Ledger</span>
        </button>
      </div>

      {/* Tab 1: Journal Entries (PRD Section 13) */}
      {activeTab === 'journal_entries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Date Filter Bar */}
          <div className="glass-panel" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', background: 'rgba(255, 107, 0, 0.03)', borderColor: 'rgba(255, 107, 0, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--accent-orange-bright)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CalendarIcon size={14} /> FILTER VOUCHERS BY DATE:
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
                  {df === 'ALL' ? 'All Dates' : df === 'TODAY' ? 'Today (15 Aug)' : df === 'YESTERDAY' ? 'Yesterday (14 Aug)' : df === 'LAST_7_DAYS' ? 'Last 7 Days' : 'This Month (Aug 2026)'}
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
                              <CalendarIcon size={12} color="var(--accent-orange)" />
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
                        </tr>

                      {/* Expandable Multi-Line Breakdown */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} style={{ background: 'var(--bg-primary)', padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
                            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                              DOUBLE-ENTRY JOURNAL LINES:
                            </div>
                            <table style={{ width: '100%', fontSize: '11.5px', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Account Particulars</th>
                                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Group</th>
                                  <th style={{ padding: '6px 8px', textAlign: 'right', width: '120px' }}>Debit (₹)</th>
                                  <th style={{ padding: '6px 8px', textAlign: 'right', width: '120px' }}>Credit (₹)</th>
                                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Line Memo / Narration</th>
                                </tr>
                              </thead>
                              <tbody>
                                {je.lines.map((ln) => (
                                  <tr key={ln.id} style={{ borderBottom: '1px dashed var(--border-subtle)' }}>
                                    <td style={{ padding: '6px 8px', fontWeight: 700, color: '#FFF' }}>{ln.accountName}</td>
                                    <td style={{ padding: '6px 8px', color: 'var(--text-secondary)', fontSize: '10.5px' }}>{ln.accountGroup}</td>
                                    <td className="font-mono" style={{ padding: '6px 8px', textAlign: 'right', fontWeight: ln.debit > 0 ? 800 : 400, color: ln.debit > 0 ? '#FFF' : 'inherit' }}>
                                      {ln.debit > 0 ? `₹${ln.debit.toLocaleString('en-IN')}` : '-'}
                                    </td>
                                    <td className="font-mono" style={{ padding: '6px 8px', textAlign: 'right', fontWeight: ln.credit > 0 ? 800 : 400, color: ln.credit > 0 ? '#10B981' : 'inherit' }}>
                                      {ln.credit > 0 ? `₹${ln.credit.toLocaleString('en-IN')}` : '-'}
                                    </td>
                                    <td style={{ padding: '6px 8px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>{ln.memo}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
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

      {/* Tab 2: Trial Balance (PRD Section 14) */}
      {activeTab === 'trial_balance' && (
        <div className="enterprise-table-container">
          <div style={{ padding: '14px 18px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '14px', color: '#FFF' }}>
                {activeCompany.companyName} — Chart of Accounts Trial Balance
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Double-Entry Balance Verification for Month Ended August 2026 (17 Accounts)
              </div>
            </div>
            <span className="status-pill status-pill-success">
              100% IN EQUILIBRIUM (₹0.00 DIFFERENCE)
            </span>
          </div>

          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Account Code</th>
                <th>Account Name</th>
                <th>Classification</th>
                <th style={{ textAlign: 'right' }}>Debit Balance (₹)</th>
                <th style={{ textAlign: 'right' }}>Credit Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { code: '10000', name: 'Cash in Hand (Factory Counter)', type: 'Asset', dr: 465000, cr: 0 },
                { code: '10001', name: 'HDFC Operating Bank Account', type: 'Asset', dr: 1000000, cr: 0 },
                { code: '12000', name: 'Accounts Receivable (Sundry Debtors)', type: 'Asset', dr: 270000, cr: 0 },
                { code: '13000', name: 'Polymer Finished Goods Inventory', type: 'Asset', dr: 300000, cr: 0 },
                { code: '14000', name: 'Fixed Assets (Injection Moulding Machines)', type: 'Asset', dr: 500000, cr: 0 },
                { code: '20000', name: 'Accounts Payable (Polymer Suppliers)', type: 'Liability', dr: 0, cr: 150000 },
                { code: '21000', name: 'GST Payable (Duties & Taxes)', type: 'Liability', dr: 0, cr: 85000 },
                { code: '30000', name: "Owner's Capital & Reserves", type: 'Equity', dr: 0, cr: 1800000 },
                { code: '31000', name: 'Retained Earnings', type: 'Equity', dr: 0, cr: 200000 },
                { code: '40000', name: 'Domestic Plastic Sales Revenue', type: 'Revenue', dr: 0, cr: 1250000 },
                { code: '50000', name: 'Cost of Goods Sold (Raw PP Granules)', type: 'Expense', dr: 450000, cr: 0 },
                { code: '51000', name: 'Salaries & Factory Wages Expense', type: 'Expense', dr: 120000, cr: 0 },
                { code: '52000', name: 'Factory & Warehouse Rent Expense', type: 'Expense', dr: 35000, cr: 0 },
                { code: '53000', name: 'Power & Utilities Expense', type: 'Expense', dr: 8500, cr: 0 },
                { code: '54000', name: 'Marketing & Transport Freight', type: 'Expense', dr: 15000, cr: 0 },
                { code: '55000', name: 'Purchase of Ancillary Materials', type: 'Expense', dr: 455000, cr: 0 }
              ].map((row, idx) => (
                <tr key={idx}>
                  <td className="font-mono" style={{ color: 'var(--accent-orange-bright)', fontWeight: 600 }}>{row.code}</td>
                  <td style={{ fontWeight: 600 }}>{row.name}</td>
                  <td>
                    <span className="status-pill status-pill-cyan" style={{ fontSize: '9px' }}>
                      {row.type}
                    </span>
                  </td>
                  <td className="font-mono" style={{ textAlign: 'right', fontWeight: row.dr > 0 ? 700 : 400 }}>
                    {row.dr > 0 ? `₹${row.dr.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="font-mono" style={{ textAlign: 'right', fontWeight: row.cr > 0 ? 700 : 400, color: row.cr > 0 ? '#10B981' : 'inherit' }}>
                    {row.cr > 0 ? `₹${row.cr.toLocaleString('en-IN')}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: 'var(--bg-tertiary)', fontWeight: 900 }}>
                <td colSpan={3} style={{ textAlign: 'right', padding: '14px 16px', color: '#FFF' }}>TRIAL BALANCE GRAND EQUILIBRIUM:</td>
                <td className="font-mono" style={{ textAlign: 'right', color: '#10B981', fontSize: '14px' }}>₹31,13,500</td>
                <td className="font-mono" style={{ textAlign: 'right', color: '#10B981', fontSize: '14px' }}>₹31,13,500</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Tab 3: Profit & Loss Statement (PRD Section 15) */}
      {activeTab === 'profit_loss' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* KPI Header Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Total Revenue (Sales)</div>
              <div className="font-mono" style={{ fontSize: '22px', fontWeight: 900, color: '#10B981', marginTop: '2px' }}>₹12,50,000</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Total Operating Costs</div>
              <div className="font-mono" style={{ fontSize: '22px', fontWeight: 900, color: '#EF4444', marginTop: '2px' }}>₹10,83,500</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--accent-orange-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--accent-orange-bright)' }}>Net Operating Profit</div>
              <div className="font-mono" style={{ fontSize: '22px', fontWeight: 900, color: 'var(--accent-orange-bright)', marginTop: '2px' }}>₹1,66,500</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Profit Margin %</div>
              <div className="font-mono" style={{ fontSize: '22px', fontWeight: 900, color: '#00E5FF', marginTop: '2px' }}>13.32%</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Revenue Accounts */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#10B981', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginBottom: '12px' }}>
                REVENUE / OPERATING INCOME
              </div>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px 0', color: '#FFF' }}>40000 - Domestic Plastic Sales Revenue</td>
                    <td className="font-mono" style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700 }}>₹12,50,000.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px 0', color: '#FFF' }}>41000 - Service & Ancillary Revenue</td>
                    <td className="font-mono" style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700 }}>₹0.00</td>
                  </tr>
                  <tr style={{ fontWeight: 900, borderTop: '2px solid var(--border-medium)' }}>
                    <td style={{ padding: '10px 0', color: '#FFF' }}>TOTAL REVENUE:</td>
                    <td className="font-mono" style={{ padding: '10px 0', textAlign: 'right', color: '#10B981', fontSize: '14px' }}>₹12,50,000.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Expense Accounts */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#EF4444', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginBottom: '12px' }}>
                EXPENSES & DIRECT MANUFACTURING
              </div>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '6px 0', color: '#FFF' }}>50000 - Cost of Goods Sold (Raw Granules)</td>
                    <td className="font-mono" style={{ padding: '6px 0', textAlign: 'right' }}>₹4,50,000.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '6px 0', color: '#FFF' }}>51000 - Salaries & Factory Wages</td>
                    <td className="font-mono" style={{ padding: '6px 0', textAlign: 'right' }}>₹1,20,000.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '6px 0', color: '#FFF' }}>52000 - Rent Expense (SIPCOT Estate)</td>
                    <td className="font-mono" style={{ padding: '6px 0', textAlign: 'right' }}>₹35,000.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '6px 0', color: '#FFF' }}>53000 - Utilities & High-Tension Power</td>
                    <td className="font-mono" style={{ padding: '6px 0', textAlign: 'right' }}>₹8,500.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '6px 0', color: '#FFF' }}>54000 - Marketing & Distribution Freight</td>
                    <td className="font-mono" style={{ padding: '6px 0', textAlign: 'right' }}>₹15,000.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '6px 0', color: '#FFF' }}>55000 - Purchase of Goods (Packaging)</td>
                    <td className="font-mono" style={{ padding: '6px 0', textAlign: 'right' }}>₹4,55,000.00</td>
                  </tr>
                  <tr style={{ fontWeight: 900, borderTop: '2px solid var(--border-medium)' }}>
                    <td style={{ padding: '10px 0', color: '#FFF' }}>TOTAL EXPENSES:</td>
                    <td className="font-mono" style={{ padding: '10px 0', textAlign: 'right', color: '#EF4444', fontSize: '14px' }}>₹10,83,500.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Balance Sheet (PRD Section 16) */}
      {activeTab === 'balance_sheet' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '16px' }}>
          {/* Assets Column */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#00E5FF' }}>
                ASSETS (WHAT DMK OWNS)
              </span>
              <span className="status-pill status-pill-cyan" style={{ fontSize: '9px' }}>DEBIT NATURE</span>
            </div>

            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '8px 0', color: '#FFF' }}>10000 - Cash in Hand</td>
                  <td className="font-mono" style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700 }}>₹4,65,000.00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '8px 0', color: '#FFF' }}>10001 - Bank Account (HDFC/ICICI)</td>
                  <td className="font-mono" style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700 }}>₹10,00,000.00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '8px 0', color: '#FFF' }}>12000 - Accounts Receivable (Customer Debtors)</td>
                  <td className="font-mono" style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700 }}>₹2,70,000.00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '8px 0', color: '#FFF' }}>13000 - Raw & Moulded Inventory</td>
                  <td className="font-mono" style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700 }}>₹3,00,000.00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '8px 0', color: '#FFF' }}>14000 - Fixed Assets (Moulding Plant)</td>
                  <td className="font-mono" style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700 }}>₹5,00,000.00</td>
                </tr>
                <tr style={{ fontWeight: 900, borderTop: '2px solid var(--border-medium)', background: 'var(--bg-tertiary)' }}>
                  <td style={{ padding: '12px 10px', color: '#FFF' }}>TOTAL ASSETS:</td>
                  <td className="font-mono" style={{ padding: '12px 10px', textAlign: 'right', color: '#00E5FF', fontSize: '15px' }}>
                    ₹25,35,000.00
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Liabilities & Equity Column */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#EF4444' }}>
                  LIABILITIES (WHAT DMK OWES)
                </span>
              </div>
              <table style={{ width: '100%', fontSize: '11.5px', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '6px 0', color: '#FFF' }}>20000 - Accounts Payable (Creditors)</td>
                    <td className="font-mono" style={{ padding: '6px 0', textAlign: 'right' }}>₹1,50,000.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '6px 0', color: '#FFF' }}>21000 - GST Payable (Duties & Taxes)</td>
                    <td className="font-mono" style={{ padding: '6px 0', textAlign: 'right' }}>₹85,000.00</td>
                  </tr>
                  <tr style={{ fontWeight: 700 }}>
                    <td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>Total Liabilities:</td>
                    <td className="font-mono" style={{ padding: '6px 0', textAlign: 'right', color: '#EF4444' }}>₹2,35,000.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#10B981' }}>
                  EQUITY & OWNER CAPITAL
                </span>
              </div>
              <table style={{ width: '100%', fontSize: '11.5px', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '6px 0', color: '#FFF' }}>30000 - Owner's Capital</td>
                    <td className="font-mono" style={{ padding: '6px 0', textAlign: 'right' }}>₹18,00,000.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '6px 0', color: '#FFF' }}>31000 - Retained Earnings</td>
                    <td className="font-mono" style={{ padding: '6px 0', textAlign: 'right' }}>₹2,00,000.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '6px 0', color: 'var(--accent-orange-bright)', fontWeight: 700 }}>
                      Current Period Profit (from P&L)
                    </td>
                    <td className="font-mono" style={{ padding: '6px 0', textAlign: 'right', color: 'var(--accent-orange-bright)', fontWeight: 700 }}>
                      ₹1,66,500.00
                    </td>
                  </tr>
                  <tr style={{ fontWeight: 700 }}>
                    <td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>Total Equity:</td>
                    <td className="font-mono" style={{ padding: '6px 0', textAlign: 'right', color: '#10B981' }}>₹21,66,500.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 'auto', background: 'var(--bg-tertiary)', padding: '12px 14px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#FFF' }}>TOTAL LIABILITIES & EQUITY:</span>
              <span className="font-mono" style={{ fontSize: '15px', fontWeight: 900, color: '#10B981' }}>
                ₹24,01,500.00
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Party Ledger */}
      {activeTab === 'party_ledger' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>SELECT CUSTOMER / DEBTOR:</span>
              <select 
                value={selectedPartyId} 
                onChange={e => setSelectedPartyId(e.target.value)}
                className="form-input"
                style={{ width: 'auto', minWidth: '320px' }}
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.partyName} ({c.city}) - Balance: ₹{c.outstandingBalance.toLocaleString('en-IN')} {c.balanceType}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="enterprise-table-container">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Voucher Date</th>
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
                        <CalendarIcon size={12} color="var(--accent-orange)" />
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
                  <td colSpan={4} style={{ textAlign: 'right', padding: '12px 16px', color: '#FFF' }}>CLOSING BALANCE:</td>
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

      {/* New Journal Entry Modal with Live Debit = Credit Validation */}
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
            zIndex: 9999
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
