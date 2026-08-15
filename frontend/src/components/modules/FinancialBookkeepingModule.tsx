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
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LedgerEntry, VoucherType, CompanyVertical, CustomerParty } from '../../types/erp';
import { MOCK_CUSTOMERS } from '../../data/multiCompanyData';

interface FinancialBookkeepingProps {
  activeCompany: CompanyVertical;
}

export const FinancialBookkeepingModule: React.FC<FinancialBookkeepingProps> = ({ activeCompany }) => {
  const [activeTab, setActiveTab] = useState<'party_ledger' | 'voucher_entry' | 'trial_balance'>('party_ledger');
  const [selectedPartyId, setSelectedPartyId] = useState<string>(MOCK_CUSTOMERS[0].id);

  // Vouchers state (Tally format)
  const [voucherType, setVoucherType] = useState<VoucherType>('RECEIPT');
  const [voucherNo, setVoucherNo] = useState<string>(`REC-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [voucherDate, setVoucherDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [debitAccount, setDebitAccount] = useState<string>('HDFC Current Account (Bank)');
  const [creditAccount, setCreditAccount] = useState<string>(MOCK_CUSTOMERS[0].partyName);
  const [voucherAmount, setVoucherAmount] = useState<number>(50000);
  const [narration, setNarration] = useState<string>('Being payment received via NEFT against Invoice DPM/26-27/4011');
  const [voucherSuccessNotice, setVoucherSuccessNotice] = useState<string | null>(null);

  // Mock Ledger Entries
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([
    {
      id: 'led-01',
      voucherNumber: `${activeCompany.invoicePrefix}4010`,
      voucherType: 'SALES',
      date: '2026-08-01',
      particulars: 'Sales - 100 Pcs Royal High-Back Chairs',
      accountName: MOCK_CUSTOMERS[0].partyName,
      accountGroup: 'Current Assets (Sundry Debtors)',
      debitAmount: 145000,
      creditAmount: 0,
      runningBalance: 145000,
      balanceType: 'Dr',
      narration: 'Sold on 30 days credit terms with 18% GST',
      companyId: activeCompany.id
    },
    {
      id: 'led-02',
      voucherNumber: 'REC-2026-1088',
      voucherType: 'RECEIPT',
      date: '2026-08-08',
      particulars: 'Bank Receipt - HDFC Bank NEFT/RTGS',
      accountName: MOCK_CUSTOMERS[0].partyName,
      accountGroup: 'Current Assets (Sundry Debtors)',
      debitAmount: 0,
      creditAmount: 75000,
      runningBalance: 70000,
      balanceType: 'Dr',
      narration: 'Part payment cleared via NEFT UTR #HDFCN2608081290',
      companyId: activeCompany.id
    },
    {
      id: 'led-03',
      voucherNumber: `${activeCompany.invoicePrefix}4019`,
      voucherType: 'SALES',
      date: '2026-08-14',
      particulars: 'Sales - 200 Pcs Heavy-Duty 20L Buckets',
      accountName: MOCK_CUSTOMERS[0].partyName,
      accountGroup: 'Current Assets (Sundry Debtors)',
      debitAmount: 75000,
      creditAmount: 0,
      runningBalance: 145000,
      balanceType: 'Dr',
      narration: 'Dispatched via Road Freight Transport',
      companyId: activeCompany.id
    }
  ]);

  const selectedParty = MOCK_CUSTOMERS.find(c => c.id === selectedPartyId) || MOCK_CUSTOMERS[0];
  const partyLedger = ledgerEntries.filter(e => e.accountName === selectedParty.partyName);

  const totalDr = partyLedger.reduce((acc, e) => acc + e.debitAmount, 0);
  const totalCr = partyLedger.reduce((acc, e) => acc + e.creditAmount, 0);
  const closingBalance = totalDr - totalCr;

  const handlePostVoucher = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      colors: ['#FF6B00', '#10B981', '#FFFFFF']
    });

    const isDr = voucherType === 'SALES' || voucherType === 'PAYMENT';
    const newEntry: LedgerEntry = {
      id: `led-${Date.now()}`,
      voucherNumber: voucherNo,
      voucherType,
      date: voucherDate,
      particulars: narration,
      accountName: creditAccount,
      accountGroup: 'Current Assets (Sundry Debtors)',
      debitAmount: isDr ? voucherAmount : 0,
      creditAmount: !isDr ? voucherAmount : 0,
      runningBalance: isDr ? closingBalance + voucherAmount : closingBalance - voucherAmount,
      balanceType: 'Dr',
      narration,
      companyId: activeCompany.id
    };

    setLedgerEntries(prev => [...prev, newEntry]);
    setVoucherSuccessNotice(`Voucher ${voucherNo} (${voucherType}) posted successfully to Tally-grade ledger.`);
    setTimeout(() => setVoucherSuccessNotice(null), 5000);

    setVoucherNo(`VOUCH-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div 
        className="glass-panel"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderLeft: `4px solid ${activeCompany.themeAccent}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div 
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              boxShadow: '0 0 12px rgba(255, 107, 0, 0.4)'
            }}
          >
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
              {activeCompany.companyName} — Financial Bookkeeping & Ledgers
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Tally-Grade Double-Entry Bookkeeping, Running Debit/Credit Balances & Month-End Closing
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-primary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <button 
            onClick={() => setActiveTab('party_ledger')}
            className={activeTab === 'party_ledger' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            Party Ledger Accounts
          </button>
          <button 
            onClick={() => setActiveTab('voucher_entry')}
            className={activeTab === 'voucher_entry' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            Voucher Entry (F5-F9)
          </button>
          <button 
            onClick={() => setActiveTab('trial_balance')}
            className={activeTab === 'trial_balance' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            Month-End Trial Balance
          </button>
        </div>
      </div>

      {voucherSuccessNotice && (
        <div 
          className="glass-panel"
          style={{
            padding: '12px 18px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            borderColor: '#10B981',
            color: '#10B981',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          <CheckCircle2 size={18} />
          <span>{voucherSuccessNotice}</span>
        </div>
      )}

      {/* Tab 1: Party Ledger (Sundry Debtors & Creditors) */}
      {activeTab === 'party_ledger' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Party Selector & Account Card */}
          <div className="glass-panel" style={{ padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700 }}>SELECT PARTY / ACCOUNT LEDGER</label>
                <select 
                  value={selectedPartyId}
                  onChange={e => setSelectedPartyId(e.target.value)}
                  style={{ minWidth: '320px', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--accent-orange-border)', borderRadius: '6px', color: '#FFF', fontSize: '13px', marginTop: '4px', fontWeight: 700 }}
                >
                  {MOCK_CUSTOMERS.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.partyName} ({c.city}) — {c.partyType}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Account Classification</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFF' }}>Current Assets &gt; Sundry Debtors</div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>CURRENT CLOSING BALANCE</div>
              <div className="font-mono" style={{ fontSize: '24px', fontWeight: 900, color: closingBalance >= 0 ? '#EF4444' : '#10B981' }}>
                ₹{Math.abs(closingBalance).toLocaleString('en-IN')} {closingBalance >= 0 ? 'Dr (Receivable)' : 'Cr (Advance)'}
              </div>
            </div>
          </div>

          {/* Tally-Style T-Account Statement */}
          <div className="enterprise-table-container">
            <div style={{ padding: '12px 18px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '13px', color: '#FFF' }}>
                Ledger Account Statement: {selectedParty.partyName} (1-Aug-2026 to 31-Aug-2026)
              </span>
              <span className="status-pill status-pill-cyan" style={{ fontSize: '9px' }}>
                GSTIN: {selectedParty.gstin || 'Unregistered'}
              </span>
            </div>

            <table className="enterprise-table">
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Date</th>
                  <th>Particulars & Narration</th>
                  <th style={{ width: '130px' }}>Voucher Type</th>
                  <th style={{ width: '140px' }}>Voucher No</th>
                  <th style={{ width: '130px', textAlign: 'right' }}>Debit (Dr ₹)</th>
                  <th style={{ width: '130px', textAlign: 'right' }}>Credit (Cr ₹)</th>
                  <th style={{ width: '150px', textAlign: 'right' }}>Running Balance</th>
                </tr>
              </thead>
              <tbody>
                {/* Opening Balance */}
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', fontWeight: 600 }}>
                  <td>01-Aug-2026</td>
                  <td colSpan={3} style={{ color: 'var(--text-secondary)' }}>To Opening Balance b/f</td>
                  <td className="font-mono" style={{ textAlign: 'right' }}>-</td>
                  <td className="font-mono" style={{ textAlign: 'right' }}>-</td>
                  <td className="font-mono" style={{ textAlign: 'right', fontWeight: 700 }}>₹0.00 Dr</td>
                </tr>

                {partyLedger.map((entry, idx) => (
                  <tr key={entry.id}>
                    <td className="font-mono" style={{ fontSize: '11px' }}>{entry.date}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#FFF' }}>{entry.particulars}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{entry.narration}</div>
                    </td>
                    <td>
                      <span className={entry.voucherType === 'SALES' ? 'status-pill-orange' : 'status-pill-success'} style={{ fontSize: '8px' }}>
                        {entry.voucherType}
                      </span>
                    </td>
                    <td className="font-mono" style={{ color: 'var(--accent-orange-bright)', fontSize: '11px' }}>
                      {entry.voucherNumber}
                    </td>
                    <td className="font-mono" style={{ textAlign: 'right', color: entry.debitAmount > 0 ? '#FFF' : 'var(--text-tertiary)', fontWeight: entry.debitAmount > 0 ? 700 : 400 }}>
                      {entry.debitAmount > 0 ? `₹${entry.debitAmount.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="font-mono" style={{ textAlign: 'right', color: entry.creditAmount > 0 ? '#10B981' : 'var(--text-tertiary)', fontWeight: entry.creditAmount > 0 ? 700 : 400 }}>
                      {entry.creditAmount > 0 ? `₹${entry.creditAmount.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="font-mono" style={{ textAlign: 'right', fontWeight: 800, color: '#FFF' }}>
                      ₹{entry.runningBalance.toLocaleString('en-IN')} {entry.balanceType}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'var(--bg-tertiary)', fontWeight: 800 }}>
                  <td colSpan={4} style={{ textAlign: 'right', padding: '12px 16px', color: '#FFF' }}>TOTAL CUMULATIVE:</td>
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

      {/* Tab 2: Voucher Entry (Tally Shortcuts F5-F9) */}
      {activeTab === 'voucher_entry' && (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFF' }}>
              Voucher Creation (Tally Quick Entry)
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['SALES', 'PURCHASE', 'RECEIPT', 'PAYMENT', 'JOURNAL'] as VoucherType[]).map(vt => (
                <button
                  key={vt}
                  onClick={() => setVoucherType(vt)}
                  className={voucherType === vt ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '6px 12px', fontSize: '11px' }}
                >
                  {vt}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>VOUCHER NUMBER</label>
              <input 
                type="text" 
                value={voucherNo}
                onChange={e => setVoucherNo(e.target.value)}
                className="font-mono"
                style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#FFF', marginTop: '4px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>VOUCHER DATE</label>
              <input 
                type="date" 
                value={voucherDate}
                onChange={e => setVoucherDate(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#FFF', marginTop: '4px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>AMOUNT (₹)</label>
              <input 
                type="number" 
                value={voucherAmount}
                onChange={e => setVoucherAmount(parseFloat(e.target.value) || 0)}
                className="font-mono"
                style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#10B981', fontWeight: 700, marginTop: '4px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>ACCOUNT TO DEBIT (DR)</label>
              <input 
                type="text" 
                value={debitAccount}
                onChange={e => setDebitAccount(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#FFF', marginTop: '4px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>ACCOUNT TO CREDIT (CR)</label>
              <select 
                value={creditAccount}
                onChange={e => setCreditAccount(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#FFF', marginTop: '4px' }}
              >
                {MOCK_CUSTOMERS.map(c => (
                  <option key={c.id} value={c.partyName}>{c.partyName}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>NARRATION / REMARKS</label>
            <input 
              type="text" 
              value={narration}
              onChange={e => setNarration(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#FFF', marginTop: '4px' }}
            />
          </div>

          <button 
            onClick={handlePostVoucher}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '8px' }}
          >
            <ShieldCheck size={16} />
            <span>Commit Voucher to Ledger</span>
          </button>
        </div>
      )}

      {/* Tab 3: Month-End Trial Balance Closing */}
      {activeTab === 'trial_balance' && (
        <div className="enterprise-table-container">
          <div style={{ padding: '14px 18px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '14px', color: '#FFF' }}>
                {activeCompany.companyName} — Monthly Trial Balance Closing
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Double-Entry Balance Verification for Month Ended August 2026
              </div>
            </div>
            <span className="status-pill status-pill-success">
              100% IN EQUILIBRIUM (0.00 DIFFERENCE)
            </span>
          </div>

          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Account Head Code</th>
                <th>Particulars / Ledger Account</th>
                <th>Classification</th>
                <th style={{ textAlign: 'right' }}>Debit Balance (₹)</th>
                <th style={{ textAlign: 'right' }}>Credit Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { code: '1010', name: 'HDFC Operating Bank Account', group: 'Current Assets', dr: 3450000, cr: 0 },
                { code: '1020', name: 'Cash-in-Hand (Factory Counter)', group: 'Current Assets', dr: 185000, cr: 0 },
                { code: '1100', name: 'Sundry Debtors (Customer Receivables)', group: 'Current Assets', dr: 4820000, cr: 0 },
                { code: '1200', name: 'Polypropylene Granules Raw Material Stock', group: 'Current Assets', dr: 2150000, cr: 0 },
                { code: '1300', name: 'Finished Plastic Goods Inventory (Chairs/Buckets)', group: 'Current Assets', dr: 3900000, cr: 0 },
                { code: '2010', name: 'Sundry Creditors (Polymer Suppliers Payables)', group: 'Current Liabilities', dr: 0, cr: 2850000 },
                { code: '2050', name: 'Output GST Payable (CGST + SGST + IGST)', group: 'Duties & Taxes', dr: 0, cr: 685000 },
                { code: '3010', name: 'Share Capital & Reserves', group: 'Capital Account', dr: 0, cr: 5500000 },
                { code: '4010', name: 'Domestic Plastic Sales Account', group: 'Sales Accounts', dr: 0, cr: 7850000 },
                { code: '5010', name: 'Power, Fuel & Injection Moulding Machinery Expense', group: 'Direct Expenses', dr: 2380000, cr: 0 }
              ].map((row, idx) => (
                <tr key={idx}>
                  <td className="font-mono" style={{ color: 'var(--accent-orange-bright)', fontWeight: 600 }}>{row.code}</td>
                  <td style={{ fontWeight: 600 }}>{row.name}</td>
                  <td>
                    <span className="status-pill status-pill-cyan" style={{ fontSize: '8px' }}>
                      {row.group}
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
                <td className="font-mono" style={{ textAlign: 'right', color: '#10B981', fontSize: '14px' }}>₹1,68,85,000</td>
                <td className="font-mono" style={{ textAlign: 'right', color: '#10B981', fontSize: '14px' }}>₹1,68,85,000</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};
