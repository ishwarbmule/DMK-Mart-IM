import React, { useState } from 'react';
import { 
  Receipt, 
  FileCheck2, 
  QrCode, 
  ShieldCheck, 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle2,
  Building,
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getTodayISODate } from '../../utils/dateUtils';

interface GSTInvoiceLine {
  id: string;
  itemDescription: string;
  hsnSacCode: string;
  qty: number;
  unitRate: number;
  gstRate: number; // e.g. 5, 12, 18, 28
}

export const GSTBillingModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invoice_gen' | 'gstr_summary' | 'e_way'>('invoice_gen');

  // Supplier & Customer Profile
  const [sellerStateCode, setSellerStateCode] = useState<string>('29'); // Karnataka
  const [buyerStateCode, setBuyerStateCode] = useState<string>('29'); // Intra-state by default
  const [buyerGSTIN, setBuyerGSTIN] = useState<string>('29AAACB1234F1Z0');
  const [buyerLegalName, setBuyerLegalName] = useState<string>('Apex Retail Supermarkets Private Limited');
  const [invoiceNumber, setInvoiceNumber] = useState<string>(`DMK-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [invoiceDate, setInvoiceDate] = useState<string>(getTodayISODate());

  const [lines, setLines] = useState<GSTInvoiceLine[]>([
    { id: '1', itemDescription: 'DMK Basmati Rice 5kg Commercial Packs', hsnSacCode: '10063010', qty: 100, unitRate: 450.00, gstRate: 5 },
    { id: '2', itemDescription: 'DMK Fast Charge 65W GaN Power Adaptors', hsnSacCode: '85044030', qty: 50, unitRate: 850.00, gstRate: 18 }
  ]);

  const [generatedEInvoice, setGeneratedEInvoice] = useState<any | null>(null);

  const isIntraState = sellerStateCode === buyerStateCode;

  // Add line item
  const handleAddLine = () => {
    setLines(prev => [
      ...prev,
      { id: String(Date.now()), itemDescription: '', hsnSacCode: '8504', qty: 1, unitRate: 0, gstRate: 18 }
    ]);
  };

  const handleUpdateLine = (id: string, field: keyof GSTInvoiceLine, val: any) => {
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: val } : l));
  };

  const handleRemoveLine = (id: string) => {
    if (lines.length <= 1) return;
    setLines(prev => prev.filter(l => l.id !== id));
  };

  // Calculations
  const taxableValue = lines.reduce((acc, l) => acc + (l.qty * l.unitRate), 0);
  
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;

  lines.forEach(l => {
    const lineVal = l.qty * l.unitRate;
    const taxAmt = lineVal * (l.gstRate / 100);
    if (isIntraState) {
      totalCGST += taxAmt / 2;
      totalSGST += taxAmt / 2;
    } else {
      totalIGST += taxAmt;
    }
  });

  const totalTax = totalCGST + totalSGST + totalIGST;
  const invoiceTotal = taxableValue + totalTax;

  const handleGenerateEInvoice = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      colors: ['#FF6B00', '#10B981', '#FFFFFF']
    });

    const irnHash = '7a8f9c4b2e1d0f5e6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f';
    const ackNumber = `1226${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    setGeneratedEInvoice({
      irn: irnHash,
      ackNo: ackNumber,
      ackDate: new Date().toISOString(),
      qrData: `NIC-IRN:${irnHash}:GSTIN:${buyerGSTIN}:TOTAL:${invoiceTotal.toFixed(2)}`,
      status: 'ACT_GENERATED'
    });
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
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div 
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              boxShadow: '0 0 12px rgba(255, 107, 0, 0.4)'
            }}
          >
            <Receipt size={20} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
              DMK Mart GST Invoicing & Compliance Engine
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Automated CGST/SGST/IGST Split, E-Invoice IRN QR Code & GSTR-1 / 3B Filing Portal
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-primary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <button 
            onClick={() => setActiveTab('invoice_gen')}
            className={activeTab === 'invoice_gen' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            GST Invoice & E-Invoice
          </button>
          <button 
            onClick={() => setActiveTab('gstr_summary')}
            className={activeTab === 'gstr_summary' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            GSTR-1 & 3B Summary
          </button>
        </div>
      </div>

      {activeTab === 'invoice_gen' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
          
          {/* Left Form: Invoice Builder */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFF', display: 'flex', justifyContent: 'space-between' }}>
              <span>Tax Invoice Header</span>
              <span className={isIntraState ? 'status-pill status-pill-success' : 'status-pill-orange'} style={{ fontSize: '9px' }}>
                {isIntraState ? 'INTRA-STATE (CGST + SGST)' : 'INTER-STATE (IGST APPLICABLE)'}
              </span>
            </div>

            {/* Buyer Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>BUYER LEGAL NAME</label>
                <input 
                  type="text" 
                  value={buyerLegalName}
                  onChange={e => setBuyerLegalName(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#FFF', fontSize: '12px', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>BUYER GSTIN (15 DIGIT)</label>
                <input 
                  type="text" 
                  value={buyerGSTIN}
                  onChange={e => {
                    setBuyerGSTIN(e.target.value);
                    if (e.target.value.length >= 2) {
                      setBuyerStateCode(e.target.value.substring(0, 2));
                    }
                  }}
                  className="font-mono"
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--accent-orange-bright)', fontSize: '12px', marginTop: '4px' }}
                />
              </div>
            </div>

            {/* Invoice Meta Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>INVOICE NUMBER</label>
                <input 
                  type="text" 
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  className="font-mono"
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#FFF', fontSize: '12px', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>INVOICE DATE</label>
                <input 
                  type="date" 
                  value={invoiceDate}
                  onChange={e => setInvoiceDate(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#FFF', fontSize: '12px', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>SUPPLIER GSTIN</label>
                <div className="font-mono" style={{ padding: '8px 10px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#10B981', fontSize: '12px', marginTop: '4px' }}>
                  29AAAAA0000A1Z5 (KA)
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFF' }}>Invoice Line Items & HSN Mapping</span>
                <button onClick={handleAddLine} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                  <Plus size={14} /> Add Line Item
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {lines.map((line, idx) => (
                  <div 
                    key={line.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 100px 70px 100px 90px 100px 30px',
                      gap: '8px',
                      alignItems: 'center',
                      background: 'var(--bg-primary)',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <input 
                      type="text"
                      placeholder="Item Description"
                      value={line.itemDescription}
                      onChange={e => handleUpdateLine(line.id, 'itemDescription', e.target.value)}
                      style={{ padding: '6px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#FFF', fontSize: '11px' }}
                    />
                    <input 
                      type="text"
                      placeholder="HSN/SAC"
                      value={line.hsnSacCode}
                      onChange={e => handleUpdateLine(line.id, 'hsnSacCode', e.target.value)}
                      className="font-mono"
                      style={{ padding: '6px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: 'var(--accent-orange-bright)', fontSize: '11px' }}
                    />
                    <input 
                      type="number"
                      placeholder="Qty"
                      value={line.qty}
                      onChange={e => handleUpdateLine(line.id, 'qty', parseFloat(e.target.value) || 0)}
                      className="font-mono"
                      style={{ padding: '6px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#FFF', fontSize: '11px', textAlign: 'center' }}
                    />
                    <input 
                      type="number"
                      placeholder="Rate (₹)"
                      value={line.unitRate}
                      onChange={e => handleUpdateLine(line.id, 'unitRate', parseFloat(e.target.value) || 0)}
                      className="font-mono"
                      style={{ padding: '6px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#FFF', fontSize: '11px', textAlign: 'right' }}
                    />
                    <select 
                      value={line.gstRate}
                      onChange={e => handleUpdateLine(line.id, 'gstRate', parseInt(e.target.value))}
                      style={{ padding: '6px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#FFF', fontSize: '11px', fontWeight: 700 }}
                    >
                      <option value={0}>0% GST</option>
                      <option value={5}>5% GST</option>
                      <option value={12}>12% GST</option>
                      <option value={18}>18% GST</option>
                      <option value={28}>28% GST</option>
                    </select>
                    <div className="font-mono" style={{ fontSize: '12px', fontWeight: 700, color: '#10B981', textAlign: 'right' }}>
                      ₹{(line.qty * line.unitRate).toFixed(2)}
                    </div>
                    <button 
                      onClick={() => handleRemoveLine(line.id)}
                      style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Summary & E-Invoice Generator */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFF', marginBottom: '14px' }}>
                Tax Computation & GST Summary
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Taxable Value:</span>
                  <span className="font-mono" style={{ fontWeight: 700, color: '#FFF' }}>₹{taxableValue.toFixed(2)}</span>
                </div>

                {isIntraState ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Central Tax (CGST):</span>
                      <span className="font-mono" style={{ color: 'var(--accent-orange-bright)' }}>₹{totalCGST.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>State Tax (SGST):</span>
                      <span className="font-mono" style={{ color: 'var(--accent-orange-bright)' }}>₹{totalSGST.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Integrated Tax (IGST):</span>
                    <span className="font-mono" style={{ color: 'var(--accent-orange-bright)' }}>₹{totalIGST.toFixed(2)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderTop: '1px dashed var(--border-subtle)', paddingTop: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total GST Amount:</span>
                  <span className="font-mono" style={{ fontWeight: 700, color: '#00E5FF' }}>₹{totalTax.toFixed(2)}</span>
                </div>

                <div style={{ borderTop: '2px solid var(--border-medium)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFF' }}>TOTAL INVOICE VALUE:</span>
                  <span className="font-mono" style={{ fontSize: '22px', fontWeight: 900, color: '#10B981' }}>
                    ₹{invoiceTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Generated E-Invoice Card */}
              {generatedEInvoice && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#10B981' }}>NIC E-INVOICE GENERATED</span>
                    <span className="status-pill status-pill-success" style={{ fontSize: '8px' }}>SIGNED</span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                    IRN: <strong className="font-mono" style={{ color: '#FFF', wordBreak: 'break-all' }}>{generatedEInvoice.irn}</strong>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                    Ack No: <strong className="font-mono" style={{ color: 'var(--accent-orange-bright)' }}>{generatedEInvoice.ackNo}</strong>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button 
                onClick={handleGenerateEInvoice}
                className="btn-primary"
                style={{ flex: 1, padding: '12px' }}
              >
                <QrCode size={16} />
                <span>Generate NIC E-Invoice IRN & QR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: GSTR-1 & 3B Compliance Portal */}
      {activeTab === 'gstr_summary' && (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
                Monthly GSTR-3B Tax Liability & Input Tax Credit (ITC) Reconciliation
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Filing Period: August 2026 • Return Status: READY FOR FILING
              </div>
            </div>
            <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>
              <FileSpreadsheet size={15} />
              <span>Export GSTR-1 JSON for Portal</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Total Outward Taxable Supplies (B2B + B2C)</div>
              <div className="font-mono" style={{ fontSize: '22px', fontWeight: 900, color: '#FFF', marginTop: '4px' }}>
                ₹48,25,000.00
              </div>
              <div style={{ fontSize: '11px', color: '#10B981', marginTop: '4px' }}>
                Output Tax: ₹6,85,500.00
              </div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Eligible Input Tax Credit (ITC from 2B)</div>
              <div className="font-mono" style={{ fontSize: '22px', fontWeight: 900, color: '#00E5FF', marginTop: '4px' }}>
                ₹5,12,000.00
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                100% matched with GSTR-2B
              </div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--accent-orange-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--accent-orange-bright)' }}>Net Cash Tax Payable (Electronic Cash Ledger)</div>
              <div className="font-mono" style={{ fontSize: '22px', fontWeight: 900, color: 'var(--accent-orange-bright)', marginTop: '4px' }}>
                ₹1,73,500.00
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Due on 20th August 2026
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
