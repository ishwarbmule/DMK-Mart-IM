import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Receipt, 
  Printer, 
  CheckCircle2, 
  Building2, 
  UserPlus, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  X,
  Phone,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  PlasticProductItem, 
  PricingTierKey, 
  CompanyVertical, 
  CustomerParty, 
  BilledLineItem, 
  FinalInvoiceData 
} from '../../types/erp';
import { INITIAL_PLASTICS_CATALOG } from '../../data/plasticsCatalog';
import { DMK_COMPANIES, MOCK_CUSTOMERS } from '../../data/multiCompanyData';

interface MultiCompanyBillingModuleProps {
  activeCompany: CompanyVertical;
  onViewInvoice: (invoiceData: FinalInvoiceData) => void;
  onPostToLedger: (invoiceData: FinalInvoiceData) => void;
}

export const MultiCompanyBillingModule: React.FC<MultiCompanyBillingModuleProps> = ({
  activeCompany,
  onViewInvoice,
  onPostToLedger
}) => {
  const [catalog] = useState<PlasticProductItem[]>(INITIAL_PLASTICS_CATALOG);
  const [customers, setCustomers] = useState<CustomerParty[]>(MOCK_CUSTOMERS);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0].id);
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    `${activeCompany.invoicePrefix}${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<'CREDIT_30_DAYS' | 'CASH' | 'NEFT_RTGS' | 'UPI'>('CREDIT_30_DAYS');

  // Customer Modal State
  const [showAddCustomerModal, setShowAddCustomerModal] = useState<boolean>(false);
  const [newCustName, setNewCustName] = useState<string>('');
  const [newCustGstin, setNewCustGstin] = useState<string>('');
  const [newCustStateCode, setNewCustStateCode] = useState<string>('33');
  const [newCustPhone, setNewCustPhone] = useState<string>('');
  const [newCustCity, setNewCustCity] = useState<string>('');
  const [newCustType, setNewCustType] = useState<any>('WHOLESALER');
  const [newCustTier, setNewCustTier] = useState<PricingTierKey>('tier2_wholesale');
  const [newCustOpeningBal, setNewCustOpeningBal] = useState<number>(0);

  // Type-ahead search state
  const [typeaheadQuery, setTypeaheadQuery] = useState<string>('');
  const [showTypeaheadDropdown, setShowTypeaheadDropdown] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Billed Lines
  const [lines, setLines] = useState<BilledLineItem[]>([
    {
      id: '1',
      product: catalog[0],
      selectedTier: 'tier1_distributor',
      unitPrice: catalog[0].pricing.tier1_distributor,
      quantity: 50,
      unitOfMeasure: catalog[0].unitOfMeasure,
      discountPct: 0,
      taxableAmount: catalog[0].pricing.tier1_distributor * 50,
      gstRate: catalog[0].gstRate,
      cgstAmount: (catalog[0].pricing.tier1_distributor * 50 * 0.18) / 2,
      sgstAmount: (catalog[0].pricing.tier1_distributor * 50 * 0.18) / 2,
      igstAmount: 0,
      totalAmount: (catalog[0].pricing.tier1_distributor * 50) * 1.18
    }
  ]);

  const isIntraState = activeCompany.stateCode === selectedCustomer.stateCode;

  // Filter products as user types
  const matchingProducts = catalog.filter(p => {
    if (!typeaheadQuery.trim()) return false;
    const q = typeaheadQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || 
           p.sku.toLowerCase().includes(q) || 
           p.category.toLowerCase().includes(q) ||
           p.hsnCode.includes(q);
  });

  const handleSelectProduct = (product: PlasticProductItem) => {
    const defaultTier = selectedCustomer.assignedTier || 'tier1_distributor';
    const unitPrice = product.pricing[defaultTier];
    const qty = 10;
    const taxable = unitPrice * qty;
    const gstAmt = taxable * (product.gstRate / 100);

    const newLine: BilledLineItem = {
      id: String(Date.now()),
      product,
      selectedTier: defaultTier,
      unitPrice,
      quantity: qty,
      unitOfMeasure: product.unitOfMeasure,
      discountPct: 0,
      taxableAmount: taxable,
      gstRate: product.gstRate,
      cgstAmount: isIntraState ? gstAmt / 2 : 0,
      sgstAmount: isIntraState ? gstAmt / 2 : 0,
      igstAmount: isIntraState ? 0 : gstAmt,
      totalAmount: taxable + gstAmt
    };

    setLines(prev => [...prev, newLine]);
    setTypeaheadQuery('');
    setShowTypeaheadDropdown(false);
  };

  const handleUpdateLine = (id: string, updates: Partial<BilledLineItem>) => {
    setLines(prev => prev.map(line => {
      if (line.id !== id) return line;

      const merged = { ...line, ...updates };
      if (updates.selectedTier) {
        merged.unitPrice = merged.product.pricing[updates.selectedTier];
      }

      const rawAmount = merged.unitPrice * merged.quantity;
      const discountedTaxable = rawAmount * (1 - (merged.discountPct || 0) / 100);
      const taxAmt = discountedTaxable * (merged.gstRate / 100);

      merged.taxableAmount = discountedTaxable;
      merged.cgstAmount = isIntraState ? taxAmt / 2 : 0;
      merged.sgstAmount = isIntraState ? taxAmt / 2 : 0;
      merged.igstAmount = isIntraState ? 0 : taxAmt;
      merged.totalAmount = discountedTaxable + taxAmt;

      return merged;
    }));
  };

  const handleRemoveLine = (id: string) => {
    setLines(prev => prev.filter(l => l.id !== id));
  };

  // Add Customer Action
  const handleAddNewCustomer = () => {
    if (!newCustName.trim()) return;

    confetti({ particleCount: 50, spread: 60 });

    const newCust: CustomerParty = {
      id: `cust-${Date.now()}`,
      partyName: newCustName,
      gstin: newCustGstin || undefined,
      stateCode: newCustStateCode,
      phone: newCustPhone || '+91 90000 00000',
      city: newCustCity || 'Local City',
      partyType: newCustType,
      assignedTier: newCustTier,
      outstandingBalance: newCustOpeningBal,
      balanceType: 'Dr',
      creditLimit: 200000
    };

    setCustomers(prev => [newCust, ...prev]);
    setSelectedCustomerId(newCust.id);
    setShowAddCustomerModal(false);
    setFeedbackNotice(`Customer "${newCust.partyName}" added successfully and selected for billing.`);
    setTimeout(() => setFeedbackNotice(null), 5000);

    // Reset Form
    setNewCustName('');
    setNewCustGstin('');
    setNewCustPhone('');
    setNewCustCity('');
  };

  // Totals
  const subtotalTaxable = lines.reduce((acc, l) => acc + l.taxableAmount, 0);
  const totalCGST = lines.reduce((acc, l) => acc + l.cgstAmount, 0);
  const totalSGST = lines.reduce((acc, l) => acc + l.sgstAmount, 0);
  const totalIGST = lines.reduce((acc, l) => acc + l.igstAmount, 0);
  const rawGrandTotal = subtotalTaxable + totalCGST + totalSGST + totalIGST;
  const grandTotal = Math.round(rawGrandTotal);
  const roundOff = grandTotal - rawGrandTotal;

  const handleGenerateInvoice = () => {
    if (lines.length === 0) return;

    confetti({
      particleCount: 80,
      spread: 70,
      colors: ['#FF6B00', '#10B981', '#FFFFFF']
    });

    const invoiceData: FinalInvoiceData = {
      invoiceNumber,
      invoiceDate,
      company: activeCompany,
      customer: selectedCustomer,
      lineItems: lines,
      subtotalTaxable,
      totalCGST,
      totalSGST,
      totalIGST,
      roundOff,
      grandTotal,
      amountInWords: `Rupees ${grandTotal.toLocaleString('en-IN')} Only`,
      paymentMode,
      notes: 'Goods once sold will not be taken back. Subject to local Jurisdiction.'
    };

    onPostToLedger(invoiceData);
    onViewInvoice(invoiceData);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div 
        className="glass-panel"
        style={{
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderLeft: `5px solid ${activeCompany.themeAccent}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div 
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              boxShadow: '0 0 16px rgba(255, 107, 0, 0.45)'
            }}
          >
            <Receipt size={24} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#FFF' }}>
              {activeCompany.companyName}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              GSTIN: <span className="font-mono" style={{ color: 'var(--accent-orange-bright)', fontWeight: 700 }}>{activeCompany.gstin}</span> • State: {activeCompany.stateCode}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className={isIntraState ? 'status-pill status-pill-success' : 'status-pill-orange'}>
            {isIntraState ? 'INTRA-STATE (CGST + SGST)' : 'INTER-STATE (IGST)'}
          </span>
          <button 
            onClick={() => setShowAddCustomerModal(true)}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '12px' }}
          >
            <UserPlus size={15} />
            <span>+ Add New Customer</span>
          </button>
        </div>
      </div>

      {feedbackNotice && (
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
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Customer & Invoice Meta Form */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '18px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>BILLED TO CUSTOMER / DEBTOR</label>
              <button 
                onClick={() => setShowAddCustomerModal(true)}
                style={{ background: 'transparent', border: 'none', color: 'var(--accent-orange-bright)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
              >
                + New Customer
              </button>
            </div>
            <select 
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
              className="form-input"
              style={{ fontWeight: 700, fontSize: '13px' }}
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.partyName} ({c.city}) — Tier: {c.assignedTier.replace('tier', 'T')}
                </option>
              ))}
            </select>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '6px' }}>
              GSTIN: <strong style={{ color: '#FFF' }}>{selectedCustomer.gstin || 'Unregistered'}</strong> • Outstanding: <strong style={{ color: '#EF4444' }}>₹{selectedCustomer.outstandingBalance.toLocaleString()} {selectedCustomer.balanceType}</strong>
            </div>
          </div>

          <div>
            <label className="form-label">INVOICE NUMBER</label>
            <input 
              type="text" 
              value={invoiceNumber}
              onChange={e => setInvoiceNumber(e.target.value)}
              className="form-input font-mono"
            />
          </div>

          <div>
            <label className="form-label">INVOICE DATE</label>
            <input 
              type="date" 
              value={invoiceDate}
              onChange={e => setInvoiceDate(e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">PAYMENT TERMS</label>
            <select 
              value={paymentMode}
              onChange={e => setPaymentMode(e.target.value as any)}
              className="form-input"
            >
              <option value="CREDIT_30_DAYS">Credit (30 Days)</option>
              <option value="NEFT_RTGS">Bank NEFT / RTGS</option>
              <option value="UPI">Instant UPI</option>
              <option value="CASH">Cash Sale</option>
            </select>
          </div>
        </div>
      </div>

      {/* Type-Ahead Item Search */}
      <div style={{ position: 'relative' }}>
        <div 
          className="glass-panel"
          style={{
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            borderColor: 'var(--accent-orange-border)',
            boxShadow: '0 0 20px rgba(255, 107, 0, 0.15)'
          }}
        >
          <Search size={22} color="var(--accent-orange)" />
          <input 
            type="text"
            placeholder="Type plastic product name (e.g. 'chair', 'bucket', 'basin', 'mug', 'jar', 'crate', 'a', 'b')..."
            value={typeaheadQuery}
            onChange={e => {
              setTypeaheadQuery(e.target.value);
              setShowTypeaheadDropdown(true);
            }}
            onFocus={() => setShowTypeaheadDropdown(true)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#FFF',
              fontSize: '15px',
              fontWeight: 600
            }}
          />
          {typeaheadQuery && (
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
              {matchingProducts.length} items found
            </span>
          )}
        </div>

        {/* Live Type-Ahead Floating Dropdown */}
        {showTypeaheadDropdown && matchingProducts.length > 0 && (
          <div 
            className="glass-panel"
            style={{
              position: 'absolute',
              top: '64px',
              left: 0,
              right: 0,
              zIndex: 100,
              maxHeight: '360px',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--accent-orange-border)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
              padding: '8px'
            }}
          >
            {matchingProducts.map((p, idx) => (
              <div 
                key={p.id}
                onClick={() => handleSelectProduct(p)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: idx === highlightedIndex ? 'var(--bg-tertiary)' : 'transparent',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  transition: 'all 0.1s ease'
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-orange-bright)', fontWeight: 800 }}>
                      {p.sku}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFF' }}>
                      {p.name}
                    </span>
                    <span className="status-pill status-pill-cyan" style={{ fontSize: '8px' }}>
                      GST {p.gstRate}%
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    {p.category} • HSN: {p.hsnCode} • UOM: {p.unitOfMeasure} • Stock: {p.stockQuantity}
                  </div>
                </div>

                {/* 5-Tier Price Badges */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', background: 'rgba(255, 107, 0, 0.12)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(255, 107, 0, 0.25)' }}>
                    <div style={{ fontSize: '8px', color: 'var(--text-tertiary)' }}>T1: Dist</div>
                    <div className="font-mono" style={{ fontSize: '12px', fontWeight: 800, color: '#FFF' }}>₹{p.pricing.tier1_distributor}</div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.04)', padding: '4px 8px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '8px', color: 'var(--text-tertiary)' }}>T2: Whl</div>
                    <div className="font-mono" style={{ fontSize: '12px', fontWeight: 800, color: '#FFF' }}>₹{p.pricing.tier2_wholesale}</div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.04)', padding: '4px 8px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '8px', color: 'var(--text-tertiary)' }}>T4: Ret</div>
                    <div className="font-mono" style={{ fontSize: '12px', fontWeight: 800, color: '#FFF' }}>₹{p.pricing.tier4_retailer}</div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'rgba(16, 185, 129, 0.12)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                    <div style={{ fontSize: '8px', color: 'var(--text-tertiary)' }}>T5: MRP</div>
                    <div className="font-mono" style={{ fontSize: '12px', fontWeight: 800, color: '#10B981' }}>₹{p.pricing.tier5_mrp}</div>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--accent-orange-bright)', fontWeight: 800, marginLeft: '8px' }}>
                    + SELECT
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Billed Line Items Table */}
      <div className="enterprise-table-container">
        <div style={{ padding: '16px 20px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: '14px', color: '#FFF' }}>
            Invoice Line Items ({lines.length} Items)
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Adjust pricing tier or rate per item as needed
          </span>
        </div>

        <table className="enterprise-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th>Product Description</th>
              <th>HSN Code</th>
              <th style={{ width: '220px' }}>Pricing Tier</th>
              <th style={{ width: '110px', textAlign: 'right' }}>Unit Rate (₹)</th>
              <th style={{ width: '90px', textAlign: 'center' }}>Qty</th>
              <th style={{ width: '80px' }}>UOM</th>
              <th style={{ width: '70px', textAlign: 'center' }}>Disc %</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Taxable Val (₹)</th>
              <th style={{ width: '70px', textAlign: 'center' }}>GST %</th>
              <th style={{ width: '130px', textAlign: 'right' }}>Total (₹)</th>
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td colSpan={12} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-tertiary)' }}>
                  No items added yet. Type a product name in the search bar above to add items.
                </td>
              </tr>
            ) : (
              lines.map((line, idx) => (
                <tr key={line.id}>
                  <td style={{ color: 'var(--text-tertiary)', fontWeight: 700 }}>{idx + 1}</td>
                  <td>
                    <div style={{ fontWeight: 800, color: '#FFF' }}>{line.product.name}</div>
                    <div className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-orange-bright)' }}>{line.product.sku}</div>
                  </td>
                  <td className="font-mono" style={{ fontSize: '12px' }}>{line.product.hsnCode}</td>
                  
                  {/* Tier Dropdown */}
                  <td>
                    <select 
                      value={line.selectedTier}
                      onChange={e => handleUpdateLine(line.id, { selectedTier: e.target.value as PricingTierKey })}
                      className="form-input"
                      style={{ padding: '6px 8px', fontSize: '11px', fontWeight: 700 }}
                    >
                      <option value="tier1_distributor">T1: Distributor (₹{line.product.pricing.tier1_distributor})</option>
                      <option value="tier2_wholesale">T2: Wholesale (₹{line.product.pricing.tier2_wholesale})</option>
                      <option value="tier3_semi_wholesale">T3: Semi-Wholesale (₹{line.product.pricing.tier3_semi_wholesale})</option>
                      <option value="tier4_retailer">T4: Retailer (₹{line.product.pricing.tier4_retailer})</option>
                      <option value="tier5_mrp">T5: MRP (₹{line.product.pricing.tier5_mrp})</option>
                    </select>
                  </td>

                  <td>
                    <input 
                      type="number"
                      value={line.unitPrice}
                      onChange={e => handleUpdateLine(line.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                      className="form-input font-mono"
                      style={{ textAlign: 'right', padding: '6px 8px', fontSize: '12px' }}
                    />
                  </td>

                  <td>
                    <input 
                      type="number"
                      value={line.quantity}
                      onChange={e => handleUpdateLine(line.id, { quantity: parseInt(e.target.value) || 1 })}
                      className="form-input font-mono"
                      style={{ textAlign: 'center', padding: '6px 8px', fontSize: '12px', fontWeight: 800 }}
                    />
                  </td>

                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{line.unitOfMeasure}</td>

                  <td>
                    <input 
                      type="number"
                      value={line.discountPct}
                      onChange={e => handleUpdateLine(line.id, { discountPct: parseFloat(e.target.value) || 0 })}
                      className="form-input font-mono"
                      style={{ textAlign: 'center', padding: '6px 8px', fontSize: '12px' }}
                    />
                  </td>

                  <td className="font-mono" style={{ textAlign: 'right', fontWeight: 700 }}>
                    ₹{line.taxableAmount.toFixed(2)}
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <span className="status-pill status-pill-cyan" style={{ fontSize: '8px' }}>
                      {line.gstRate}%
                    </span>
                  </td>

                  <td className="font-mono" style={{ textAlign: 'right', fontWeight: 900, color: '#10B981', fontSize: '14px' }}>
                    ₹{line.totalAmount.toFixed(2)}
                  </td>

                  <td>
                    <button 
                      onClick={() => handleRemoveLine(line.id)}
                      style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bill Calculation & Action Card */}
      <div 
        className="glass-panel"
        style={{
          padding: '24px',
          display: 'grid',
          gridTemplateColumns: '1.3fr 1fr',
          gap: '28px',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFF', marginBottom: '10px' }}>
            Automated Double-Entry Ledger Posting Impact
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>Debit (Dr):</strong> {selectedCustomer.partyName} (Sundry Debtors)</span>
              <span className="font-mono" style={{ color: '#10B981', fontWeight: 800 }}>+₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>Credit (Cr):</strong> Domestic Sales Account (HSN 3924/3923)</span>
              <span className="font-mono" style={{ color: '#FFF' }}>-₹{subtotalTaxable.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>Credit (Cr):</strong> Output GST Liability ({isIntraState ? 'CGST + SGST' : 'IGST'})</span>
              <span className="font-mono" style={{ color: 'var(--accent-orange-bright)' }}>-₹{(totalCGST + totalSGST + totalIGST).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Totals & Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span>Total Taxable Value:</span>
            <span className="font-mono" style={{ color: '#FFF', fontWeight: 700 }}>₹{subtotalTaxable.toFixed(2)}</span>
          </div>

          {isIntraState ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span>Central GST (CGST Output):</span>
                <span className="font-mono">₹{totalCGST.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span>State GST (SGST Output):</span>
                <span className="font-mono">₹{totalSGST.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>Integrated GST (IGST Output):</span>
              <span className="font-mono">₹{totalIGST.toFixed(2)}</span>
            </div>
          )}

          <div style={{ borderTop: '2px solid var(--border-medium)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '15px', fontWeight: 900, color: '#FFF' }}>FINAL INVOICE TOTAL:</span>
            <span className="font-mono" style={{ fontSize: '28px', fontWeight: 900, color: 'var(--accent-orange-bright)' }}>
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>

          <button 
            onClick={handleGenerateInvoice}
            disabled={lines.length === 0}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', marginTop: '6px', fontSize: '14px' }}
          >
            <Printer size={16} />
            <span>Generate & Download Official GST Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
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
          onClick={() => setShowAddCustomerModal(false)}
        >
          <div 
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '560px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--accent-orange-border)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9)',
              padding: '24px',
              borderRadius: '14px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={18} color="var(--accent-orange)" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
                  Add New Customer / Debtor Account
                </h3>
              </div>
              <button onClick={() => setShowAddCustomerModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label">CUSTOMER / TRADING PARTY NAME *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mahavir Plastic Stores & Houseware"
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  className="form-input"
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">BUYER GSTIN (OPTIONAL)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 33AABCM1234E1Z8"
                    value={newCustGstin}
                    onChange={e => {
                      setNewCustGstin(e.target.value);
                      if (e.target.value.length >= 2) {
                        setNewCustStateCode(e.target.value.substring(0, 2));
                      }
                    }}
                    className="form-input font-mono"
                  />
                </div>
                <div>
                  <label className="form-label">STATE CODE</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 33 (TN), 29 (KA), 36 (TS)"
                    value={newCustStateCode}
                    onChange={e => setNewCustStateCode(e.target.value)}
                    className="form-input font-mono"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">CITY / LOCATION</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Coimbatore"
                    value={newCustCity}
                    onChange={e => setNewCustCity(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">PHONE NUMBER</label>
                  <input 
                    type="text" 
                    placeholder="e.g. +91 98400 11223"
                    value={newCustPhone}
                    onChange={e => setNewCustPhone(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">PARTY CLASSIFICATION</label>
                  <select 
                    value={newCustType}
                    onChange={e => setNewCustType(e.target.value as any)}
                    className="form-input"
                  >
                    <option value="DISTRIBUTOR">Distributor / Stockist</option>
                    <option value="WHOLESALER">Wholesaler / Dealer</option>
                    <option value="RETAILER">Retailer Shop</option>
                    <option value="CASH_CUSTOMER">Cash Consumer</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">DEFAULT PRICING TIER</label>
                  <select 
                    value={newCustTier}
                    onChange={e => setNewCustTier(e.target.value as any)}
                    className="form-input"
                  >
                    <option value="tier1_distributor">Tier 1 (Distributor)</option>
                    <option value="tier2_wholesale">Tier 2 (Wholesale)</option>
                    <option value="tier3_semi_wholesale">Tier 3 (Semi-Wholesale)</option>
                    <option value="tier4_retailer">Tier 4 (Retailer)</option>
                    <option value="tier5_mrp">Tier 5 (MRP)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">OPENING RECEIVABLE BALANCE (₹)</label>
                <input 
                  type="number" 
                  value={newCustOpeningBal}
                  onChange={e => setNewCustOpeningBal(parseFloat(e.target.value) || 0)}
                  className="form-input font-mono"
                  placeholder="0.00"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button onClick={handleAddNewCustomer} className="btn-primary" style={{ flex: 1, padding: '12px' }}>
                  <UserPlus size={15} /> Save & Select Customer
                </button>
                <button onClick={() => setShowAddCustomerModal(false)} className="btn-secondary" style={{ padding: '12px 18px' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
