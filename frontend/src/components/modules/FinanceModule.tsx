import React, { useState } from 'react';
import { 
  DollarSign, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MOCK_TRIAL_BALANCE, MOCK_AP_MATCHES } from '../../data/mockData';
import { JournalEntry, JournalLine, APInvoiceMatch } from '../../types/erp';

export const FinanceModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trial_balance' | 'journal_creator' | 'ap_match'>('trial_balance');

  // Journal Entry Form State
  const [entryNumber, setEntryNumber] = useState(`JE-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [headerMemo, setHeaderMemo] = useState('Quarterly R&D Software Depreciation Adjustment');
  const [lines, setLines] = useState<JournalLine[]>([
    { id: '1', accountNumber: '6010', accountName: 'R&D Engineering & AI Infrastructure', entrySide: 'DEBIT', amount: 50000, memo: 'AWS GPU Cluster Amortization', costCenter: 'CC-AI-RESEARCH' },
    { id: '2', accountNumber: '1010', accountName: 'Operating Cash & Treasury', entrySide: 'CREDIT', amount: 50000, memo: 'Direct Clearing Transfer' }
  ]);

  const [apMatches, setApMatches] = useState<APInvoiceMatch[]>(MOCK_AP_MATCHES);
  const [postSuccessMessage, setPostSuccessMessage] = useState<string | null>(null);

  const totalDebits = lines.filter(l => l.entrySide === 'DEBIT').reduce((acc, l) => acc + (Number(l.amount) || 0), 0);
  const totalCredits = lines.filter(l => l.entrySide === 'CREDIT').reduce((acc, l) => acc + (Number(l.amount) || 0), 0);
  const isBalanced = totalDebits === totalCredits && totalDebits > 0;

  const handleAddLine = () => {
    setLines(prev => [
      ...prev,
      { id: String(Date.now()), accountNumber: '1010', accountName: 'Operating Cash & Treasury', entrySide: 'DEBIT', amount: 0, memo: '' }
    ]);
  };

  const handleUpdateLine = (id: string, field: keyof JournalLine, value: any) => {
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleRemoveLine = (id: string) => {
    if (lines.length <= 2) return;
    setLines(prev => prev.filter(l => l.id !== id));
  };

  const handleCommitJournal = () => {
    if (!isBalanced) return;

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#FF6B00', '#10B981', '#FFFFFF']
    });

    setPostSuccessMessage(`Journal Entry ${entryNumber} successfully committed with ACID double-entry integrity ($${totalDebits.toLocaleString()}).`);
    setTimeout(() => setPostSuccessMessage(null), 5000);

    setEntryNumber(`JE-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleApproveAPMatch = (id: string) => {
    confetti({ particleCount: 50, spread: 50 });
    setApMatches(prev => prev.map(m => m.id === id ? { ...m, status: 'AUTO_MATCHED' } : m));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Module Header & Tabs */}
      <div 
        className="glass-panel"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div 
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(255, 107, 0, 0.15)',
              border: '1px solid var(--accent-orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-orange)'
            }}
          >
            <DollarSign size={20} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
              Financial Management & Global Treasury
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Double-Entry General Ledger with Real-Time ClickHouse Rollups
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-primary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <button 
            onClick={() => setActiveTab('trial_balance')}
            className={activeTab === 'trial_balance' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            Live Trial Balance
          </button>
          <button 
            onClick={() => setActiveTab('journal_creator')}
            className={activeTab === 'journal_creator' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            Post Journal Entry
          </button>
          <button 
            onClick={() => setActiveTab('ap_match')}
            className={activeTab === 'ap_match' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            AP 3-Way Match ({apMatches.filter(m => m.status === 'AWAITING_APPROVAL' || m.status === 'FLAGGED_EXCEPTION').length})
          </button>
        </div>
      </div>

      {postSuccessMessage && (
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
          <span>{postSuccessMessage}</span>
        </div>
      )}

      {/* Tab 1: Live Trial Balance */}
      {activeTab === 'trial_balance' && (
        <div className="enterprise-table-container">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Account Code</th>
                <th>Account Name</th>
                <th>Classification</th>
                <th style={{ textAlign: 'right' }}>Total Debit ($)</th>
                <th style={{ textAlign: 'right' }}>Total Credit ($)</th>
                <th style={{ textAlign: 'right' }}>Net Base Balance ($)</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TRIAL_BALANCE.map((row, idx) => (
                <tr key={idx}>
                  <td className="font-mono" style={{ color: 'var(--accent-orange-bright)', fontWeight: 600 }}>{row.accountNumber}</td>
                  <td style={{ fontWeight: 500 }}>{row.accountName}</td>
                  <td>
                    <span className="status-pill status-pill-cyan" style={{ fontSize: '9px' }}>
                      {row.accountClass}
                    </span>
                  </td>
                  <td className="font-mono" style={{ textAlign: 'right' }}>${row.totalDebit.toLocaleString()}</td>
                  <td className="font-mono" style={{ textAlign: 'right' }}>${row.totalCredit.toLocaleString()}</td>
                  <td className="font-mono" style={{ textAlign: 'right', fontWeight: 700, color: row.netBalance >= 0 ? '#10B981' : '#EF4444' }}>
                    ${Math.abs(row.netBalance).toLocaleString()} {row.netBalance < 0 ? 'CR' : 'DR'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: 'var(--bg-tertiary)', fontWeight: 800 }}>
                <td colSpan={3} style={{ textAlign: 'right', padding: '14px 16px', color: '#FFF' }}>GRAND TOTAL EQUILIBRIUM:</td>
                <td className="font-mono" style={{ textAlign: 'right', color: '#10B981' }}>$63,950,000</td>
                <td className="font-mono" style={{ textAlign: 'right', color: '#10B981' }}>$63,950,000</td>
                <td style={{ textAlign: 'right', color: '#10B981' }}>
                  <span className="status-pill status-pill-success">BALANCED (0.00 VARIANCE)</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Tab 2: Journal Entry Creator */}
      {activeTab === 'journal_creator' && (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>ENTRY NUMBER</label>
              <input 
                type="text" 
                value={entryNumber}
                onChange={e => setEntryNumber(e.target.value)}
                className="font-mono"
                style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#FFF', marginTop: '4px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>HEADER MEMO</label>
              <input 
                type="text" 
                value={headerMemo}
                onChange={e => setHeaderMemo(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#FFF', marginTop: '4px' }}
              />
            </div>
          </div>

          {/* Line Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFF' }}>Journal Lines (Debits & Credits)</span>
              <button onClick={handleAddLine} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                <Plus size={14} /> Add Line
              </button>
            </div>

            {lines.map((line, idx) => (
              <div 
                key={line.id} 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '120px 2fr 100px 140px 2fr 40px', 
                  gap: '10px', 
                  alignItems: 'center', 
                  background: 'var(--bg-primary)', 
                  padding: '10px', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-subtle)' 
                }}
              >
                <input 
                  type="text" 
                  value={line.accountNumber} 
                  onChange={e => handleUpdateLine(line.id, 'accountNumber', e.target.value)}
                  placeholder="Acc #" 
                  className="font-mono"
                  style={{ padding: '6px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: 'var(--accent-orange-bright)' }}
                />
                <input 
                  type="text" 
                  value={line.accountName} 
                  onChange={e => handleUpdateLine(line.id, 'accountName', e.target.value)}
                  placeholder="Account Name" 
                  style={{ padding: '6px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#FFF' }}
                />
                <select 
                  value={line.entrySide}
                  onChange={e => handleUpdateLine(line.id, 'entrySide', e.target.value)}
                  style={{ padding: '6px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#FFF', fontWeight: 700 }}
                >
                  <option value="DEBIT">DEBIT</option>
                  <option value="CREDIT">CREDIT</option>
                </select>
                <input 
                  type="number" 
                  value={line.amount} 
                  onChange={e => handleUpdateLine(line.id, 'amount', parseFloat(e.target.value) || 0)}
                  placeholder="Amount" 
                  className="font-mono"
                  style={{ padding: '6px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#FFF', textAlign: 'right' }}
                />
                <input 
                  type="text" 
                  value={line.memo} 
                  onChange={e => handleUpdateLine(line.id, 'memo', e.target.value)}
                  placeholder="Line Memo" 
                  style={{ padding: '6px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: 'var(--text-secondary)' }}
                />
                <button 
                  onClick={() => handleRemoveLine(line.id)}
                  style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Balancing Check & Action */}
          <div 
            style={{
              padding: '16px',
              borderRadius: '8px',
              background: isBalanced ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${isBalanced ? '#10B981' : '#EF4444'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', gap: '24px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>TOTAL DEBITS: </span>
                <span className="font-mono" style={{ fontWeight: 700, color: '#FFF' }}>${totalDebits.toLocaleString()}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>TOTAL CREDITS: </span>
                <span className="font-mono" style={{ fontWeight: 700, color: '#FFF' }}>${totalCredits.toLocaleString()}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>IMBALANCE: </span>
                <span className="font-mono" style={{ fontWeight: 700, color: isBalanced ? '#10B981' : '#EF4444' }}>
                  ${Math.abs(totalDebits - totalCredits).toLocaleString()}
                </span>
              </div>
            </div>

            <button 
              onClick={handleCommitJournal}
              disabled={!isBalanced}
              className="btn-primary"
              style={{ opacity: isBalanced ? 1 : 0.4, cursor: isBalanced ? 'pointer' : 'not-allowed' }}
            >
              <ShieldCheck size={16} />
              <span>Commit ACID Transaction</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: AP 3-Way Match Console */}
      {activeTab === 'ap_match' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {apMatches.map(match => (
            <div 
              key={match.id}
              className="glass-panel"
              style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div 
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: match.status === 'AUTO_MATCHED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 176, 32, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: match.status === 'AUTO_MATCHED' ? '#10B981' : '#FFB020'
                  }}
                >
                  <FileText size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="font-mono" style={{ fontSize: '14px', fontWeight: 700, color: '#FFF' }}>{match.invoiceNumber}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>• {match.vendorName}</span>
                    <span className={match.status === 'AUTO_MATCHED' ? 'status-pill-success' : 'status-pill-warning'} style={{ fontSize: '9px' }}>
                      {match.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Matched against PO <strong>{match.poNumber}</strong> ($ {match.poAmount.toLocaleString()}) and GRN <strong>{match.grnNumber}</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div className="font-mono" style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
                    ${match.invoiceAmount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11px', color: match.varianceAmount === 0 ? '#10B981' : '#EF4444' }}>
                    Variance: ${match.varianceAmount.toFixed(2)}
                  </div>
                </div>

                {match.status !== 'AUTO_MATCHED' && (
                  <button 
                    onClick={() => handleApproveAPMatch(match.id)}
                    className="btn-primary"
                    style={{ padding: '8px 14px', fontSize: '12px' }}
                  >
                    <CheckCircle2 size={14} /> Authorize Post
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
