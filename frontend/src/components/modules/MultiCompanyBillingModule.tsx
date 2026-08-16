import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  MapPin, 
  Calendar, 
  Clock, 
  IndianRupee,
  RotateCcw,
  Zap,
  ShoppingBag,
  FileCheck,
  CreditCard,
  Percent,
  Layers,
  Scale,
  Minus
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
import { DMK_MART_COMPANY, MOCK_CUSTOMERS } from '../../data/multiCompanyData';
import { useERPData } from '../../context/ERPContext';
import { formatDate, formatFullDate } from '../../utils/dateUtils';

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
  const { 
    products: catalog, 
    customers, 
    addFastOrderBill, 
    addCustomer: addGlobalCustomer,
    setCurrentInvoice
  } = useERPData();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || 'cust-01');
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

  // Billed Lines Initial State
  const [lines, setLines] = useState<BilledLineItem[]>([
    {
      id: '1',
      product: catalog[0] || INITIAL_PLASTICS_CATALOG[0],
      selectedTier: 'tier1_distributor',
      unitPrice: (catalog[0] || INITIAL_PLASTICS_CATALOG[0]).pricing.tier1_distributor,
      quantity: 50,
      unitOfMeasure: (catalog[0] || INITIAL_PLASTICS_CATALOG[0]).unitOfMeasure,
      discountPct: 0,
      taxableAmount: (catalog[0] || INITIAL_PLASTICS_CATALOG[0]).pricing.tier1_distributor * 50,
      gstRate: (catalog[0] || INITIAL_PLASTICS_CATALOG[0]).gstRate,
      cgstAmount: ((catalog[0] || INITIAL_PLASTICS_CATALOG[0]).pricing.tier1_distributor * 50 * 0.18) / 2,
      sgstAmount: ((catalog[0] || INITIAL_PLASTICS_CATALOG[0]).pricing.tier1_distributor * 50 * 0.18) / 2,
      igstAmount: 0,
      totalAmount: ((catalog[0] || INITIAL_PLASTICS_CATALOG[0]).pricing.tier1_distributor * 50) * 1.18
    },
    {
      id: '2',
      product: catalog[1] || INITIAL_PLASTICS_CATALOG[1],
      selectedTier: 'tier1_distributor',
      unitPrice: (catalog[1] || INITIAL_PLASTICS_CATALOG[1]).pricing.tier1_distributor,
      quantity: 30,
      unitOfMeasure: (catalog[1] || INITIAL_PLASTICS_CATALOG[1]).unitOfMeasure,
      discountPct: 0,
      taxableAmount: (catalog[1] || INITIAL_PLASTICS_CATALOG[1]).pricing.tier1_distributor * 30,
      gstRate: (catalog[1] || INITIAL_PLASTICS_CATALOG[1]).gstRate,
      cgstAmount: ((catalog[1] || INITIAL_PLASTICS_CATALOG[1]).pricing.tier1_distributor * 30 * 0.18) / 2,
      sgstAmount: ((catalog[1] || INITIAL_PLASTICS_CATALOG[1]).pricing.tier1_distributor * 30 * 0.18) / 2,
      igstAmount: 0,
      totalAmount: ((catalog[1] || INITIAL_PLASTICS_CATALOG[1]).pricing.tier1_distributor * 30) * 1.18
    }
  ]);

  const isIntraState = selectedCustomer?.stateCode === activeCompany.stateCode;

  // Filter products as user types
  const matchingProducts = catalog.filter(p => {
    if (!typeaheadQuery.trim()) return false;
    const q = typeaheadQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || 
           p.sku.toLowerCase().includes(q) || 
           p.category.toLowerCase().includes(q) ||
           (p.barcode && p.barcode.toLowerCase().includes(q));
  }).slice(0, 8);

  const handleSelectProduct = (product: PlasticProductItem) => {
    const tier = selectedCustomer ? selectedCustomer.assignedTier : 'tier2_wholesale';
    const price = product.pricing[tier];
    const defaultQty = 20;
    const taxable = price * defaultQty;
    const taxAmt = taxable * (product.gstRate / 100);

    const newLine: BilledLineItem = {
      id: `${Date.now()}-${Math.random()}`,
      product,
      selectedTier: tier,
      unitPrice: price,
      quantity: defaultQty,
      unitOfMeasure: product.unitOfMeasure,
      discountPct: 0,
      taxableAmount: taxable,
      gstRate: product.gstRate,
      cgstAmount: isIntraState ? taxAmt / 2 : 0,
      sgstAmount: isIntraState ? taxAmt / 2 : 0,
      igstAmount: isIntraState ? 0 : taxAmt,
      totalAmount: taxable + taxAmt
    };

    setLines(prev => [...prev, newLine]);
    setTypeaheadQuery('');
    setShowTypeaheadDropdown(false);
    setFeedbackNotice(`Added "${product.name}" at Tier ${tier.replace('tier', 'T')} (₹${price}/unit)`);
    setTimeout(() => setFeedbackNotice(null), 3000);
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

  const handleAdjustQty = (id: string, delta: number) => {
    const target = lines.find(l => l.id === id);
    if (!target) return;
    const newQty = Math.max(1, target.quantity + delta);
    handleUpdateLine(id, { quantity: newQty });
  };

  const handleRemoveLine = (id: string) => {
    setLines(prev => prev.filter(l => l.id !== id));
  };

  const handleResetForm = () => {
    setLines([]);
    setInvoiceNumber(`${activeCompany.invoicePrefix}${Math.floor(1000 + Math.random() * 9000)}`);
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

    addGlobalCustomer(newCust);
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

  // Aggregated Financials
  const grossSubtotal = useMemo(() => lines.reduce((acc, l) => acc + (l.unitPrice * l.quantity), 0), [lines]);
  const subtotalTaxable = useMemo(() => lines.reduce((acc, l) => acc + l.taxableAmount, 0), [lines]);
  const totalDiscount = grossSubtotal - subtotalTaxable;
  const totalCGST = useMemo(() => lines.reduce((acc, l) => acc + l.cgstAmount, 0), [lines]);
  const totalSGST = useMemo(() => lines.reduce((acc, l) => acc + l.sgstAmount, 0), [lines]);
  const totalIGST = useMemo(() => lines.reduce((acc, l) => acc + l.igstAmount, 0), [lines]);
  const totalTax = totalCGST + totalSGST + totalIGST;
  const rawGrandTotal = subtotalTaxable + totalTax;
  const grandTotal = Math.round(rawGrandTotal);
  const roundOff = grandTotal - rawGrandTotal;
  const totalUnits = useMemo(() => lines.reduce((acc, l) => acc + l.quantity, 0), [lines]);

  // Projected closing balance for Debtor
  const projectedClosingBal = selectedCustomer.outstandingBalance + grandTotal;

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
      amountInWords: `INR ${grandTotal.toLocaleString('en-IN')} Rupees Only`,
      paymentMode,
      notes: 'Goods once sold will not be taken back. Subject to local Jurisdiction.'
    };

    // Universal Cross-Module Synchronization
    addFastOrderBill(invoiceData);
    setCurrentInvoice(invoiceData);
    onPostToLedger(invoiceData);
    onViewInvoice(invoiceData);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - var(--header-height) - 36px)' }}>
      
      {/* 2-Column Split Workspace */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '18px',
          height: '100%',
          minHeight: 0
        }}
      >
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: PRODUCT SEARCH, ADDING & LINE ITEMS LISTING                   */}
        {/* ========================================================================= */}
        <div 
          className="glass-panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            padding: '16px',
            gap: '14px'
          }}
        >
          {/* Header Row: Debtor Selection & Invoice Particulars */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr', gap: '12px' }}>
            {/* Customer Selector */}
            <div style={{ background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                  CUSTOMER / DEBTOR
                </span>
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
                style={{ fontWeight: 700, padding: '4px 8px', fontSize: '12.5px' }}
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.partyName} ({c.city}) — Tier {c.assignedTier.replace('tier', 'T')}
                  </option>
                ))}
              </select>
              <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span>GSTIN: <strong style={{ color: '#FFF' }}>{selectedCustomer.gstin || 'Unregistered'}</strong></span>
                <span>Balance: <strong style={{ color: '#EF4444' }}>₹{selectedCustomer.outstandingBalance.toLocaleString('en-IN')} {selectedCustomer.balanceType}</strong></span>
              </div>
            </div>

            {/* Invoice Number */}
            <div style={{ background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '3px' }}>
                INVOICE NUMBER
              </div>
              <input 
                type="text" 
                value={invoiceNumber}
                onChange={e => setInvoiceNumber(e.target.value)}
                className="form-input font-mono"
                style={{ fontWeight: 800, fontSize: '13px', padding: '4px 8px', color: 'var(--accent-orange-bright)' }}
              />
              <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Auto-assigned sequence
              </div>
            </div>

            {/* Invoice Date */}
            <div style={{ background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '3px' }}>
                INVOICE DATE
              </div>
              <input 
                type="date" 
                value={invoiceDate}
                onChange={e => setInvoiceDate(e.target.value)}
                className="form-input"
                style={{ fontWeight: 600, fontSize: '12px', padding: '4px 8px' }}
              />
              <div style={{ fontSize: '10.5px', color: 'var(--accent-orange-bright)', marginTop: '4px', fontWeight: 600 }}>
                {formatDate(invoiceDate)}
              </div>
            </div>
          </div>

          {/* Product Type-Ahead Search Input */}
          <div style={{ position: 'relative' }}>
            <div 
              style={{
                background: 'var(--bg-primary)',
                border: '1.5px solid var(--accent-orange)',
                borderRadius: '8px',
                padding: '9px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 0 16px rgba(255, 107, 0, 0.15)'
              }}
            >
              <Search size={16} color="var(--accent-orange-bright)" />
              <input 
                type="text"
                placeholder="Scan Barcode or Type SKU / Product Name to add line items..."
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
                  fontSize: '13px',
                  fontWeight: 600
                }}
              />
              {typeaheadQuery && (
                <button 
                  onClick={() => setTypeaheadQuery('')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown Menu */}
            {showTypeaheadDropdown && matchingProducts.length > 0 && (
              <div 
                className="glass-panel"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 50,
                  marginTop: '6px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  padding: '6px',
                  boxShadow: '0 16px 36px rgba(0, 0, 0, 0.8)'
                }}
              >
                {matchingProducts.map((prod, idx) => {
                  const custTier = selectedCustomer ? selectedCustomer.assignedTier : 'tier2_wholesale';
                  const tierPrice = prod.pricing[custTier];
                  return (
                    <div 
                      key={prod.id}
                      onClick={() => handleSelectProduct(prod)}
                      style={{
                        padding: '9px 14px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: highlightedIndex === idx ? 'rgba(255, 107, 0, 0.15)' : 'transparent',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: '#FFF', fontSize: '12.5px' }}>{prod.name}</div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                          SKU: {prod.sku} • HSN: {prod.hsnCode} • Available: {prod.stockQuantity} {prod.unitOfMeasure}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="font-mono" style={{ fontWeight: 800, color: 'var(--accent-orange-bright)', fontSize: '13px' }}>
                          ₹{tierPrice} / {prod.unitOfMeasure}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                          Tier {custTier.replace('tier', 'T')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick-Add Popular SKU Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap' }}>
              Quick Add:
            </span>
            {catalog.slice(0, 5).map(p => (
              <button
                key={p.id}
                onClick={() => handleSelectProduct(p)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '10.5px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title={`Click to add ${p.name}`}
              >
                <Plus size={11} color="var(--accent-orange)" />
                <span>{p.sku}</span>
              </button>
            ))}
          </div>

          {/* Line Items Table Container */}
          <div 
            style={{
              flex: 1,
              overflowY: 'auto',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              background: 'var(--bg-primary)'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                <tr>
                  <th style={{ padding: '10px 12px', fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 800 }}>ITEM / SPECIFICATION</th>
                  <th style={{ padding: '10px 8px', fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 800, width: '120px' }}>TIER</th>
                  <th style={{ padding: '10px 8px', fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 800, width: '85px', textAlign: 'right' }}>RATE (₹)</th>
                  <th style={{ padding: '10px 8px', fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 800, width: '95px', textAlign: 'center' }}>QTY</th>
                  <th style={{ padding: '10px 8px', fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 800, width: '65px', textAlign: 'right' }}>DISC%</th>
                  <th style={{ padding: '10px 8px', fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 800, width: '95px', textAlign: 'right' }}>TAXABLE</th>
                  <th style={{ padding: '10px 10px', fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 800, width: '100px', textAlign: 'right' }}>TOTAL (₹)</th>
                  <th style={{ padding: '10px 6px', width: '36px' }}></th>
                </tr>
              </thead>
              <tbody>
                {lines.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-tertiary)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <ShoppingBag size={28} color="var(--accent-orange)" />
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFF' }}>No items in bill</div>
                        <div style={{ fontSize: '11px' }}>Search by SKU or click quick-add chips above to add products.</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  lines.map((line, idx) => (
                    <tr key={line.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: idx % 2 === 1 ? 'rgba(255, 255, 255, 0.015)' : 'transparent' }}>
                      {/* Item description */}
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 700, color: '#FFF', fontSize: '12px' }}>{line.product.name}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                          SKU: <span className="font-mono">{line.product.sku}</span> • HSN: {line.product.hsnCode || '39241090'}
                        </div>
                      </td>

                      {/* Tier Selector */}
                      <td style={{ padding: '10px 8px' }}>
                        <select 
                          value={line.selectedTier}
                          onChange={e => handleUpdateLine(line.id, { selectedTier: e.target.value as PricingTierKey })}
                          className="form-input"
                          style={{ padding: '3px 6px', fontSize: '10.5px' }}
                        >
                          <option value="tier1_distributor">T1 Distributor</option>
                          <option value="tier2_wholesale">T2 Wholesale</option>
                          <option value="tier3_semi_wholesale">T3 Semi-Whl</option>
                          <option value="tier4_retailer">T4 Retailer</option>
                          <option value="tier5_mrp">T5 MRP</option>
                        </select>
                      </td>

                      {/* Rate */}
                      <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                        <input 
                          type="number"
                          value={line.unitPrice}
                          onChange={e => handleUpdateLine(line.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                          className="form-input font-mono"
                          style={{ width: '75px', textAlign: 'right', padding: '3px 6px', fontSize: '11.5px' }}
                        />
                      </td>

                      {/* Qty with +/- buttons */}
                      <td style={{ padding: '10px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                          <button 
                            onClick={() => handleAdjustQty(line.id, -5)}
                            style={{ width: '20px', height: '22px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Decrease 5"
                          >
                            -
                          </button>
                          <input 
                            type="number"
                            value={line.quantity}
                            onChange={e => handleUpdateLine(line.id, { quantity: parseInt(e.target.value) || 1 })}
                            className="form-input font-mono"
                            style={{ width: '48px', textAlign: 'center', padding: '3px 2px', fontSize: '11.5px', fontWeight: 700 }}
                          />
                          <button 
                            onClick={() => handleAdjustQty(line.id, 5)}
                            style={{ width: '20px', height: '22px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Increase 5"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Discount % */}
                      <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                        <input 
                          type="number"
                          value={line.discountPct}
                          onChange={e => handleUpdateLine(line.id, { discountPct: parseFloat(e.target.value) || 0 })}
                          className="form-input font-mono"
                          style={{ width: '50px', textAlign: 'right', padding: '3px 4px', fontSize: '11.5px' }}
                        />
                      </td>

                      {/* Taxable */}
                      <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600, fontSize: '11.5px' }}>
                        ₹{line.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Total */}
                      <td className="font-mono" style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 800, color: 'var(--accent-orange-bright)', fontSize: '12.5px' }}>
                        ₹{line.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Trash */}
                      <td style={{ padding: '10px 6px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleRemoveLine(line.id)}
                          className="btn-icon"
                          style={{ color: 'var(--accent-red)', padding: '4px' }}
                          title="Remove Line"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: FINANCIAL TOTALS & SETTLEMENT SIDEBAR                       */}
        {/* ========================================================================= */}
        <div 
          className="glass-panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflowY: 'auto',
            padding: '16px',
            gap: '14px'
          }}
        >
          {/* Section Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFF' }}>
              Financial & Settlement
            </div>
            <span className={isIntraState ? 'status-pill status-pill-success' : 'status-pill-orange'} style={{ fontSize: '9px', padding: '2px 6px' }}>
              {isIntraState ? 'CGST + SGST (9%+9%)' : 'IGST (18%)'}
            </span>
          </div>

          {/* Payment Terms Selector */}
          <div style={{ background: 'var(--bg-primary)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <label className="form-label" style={{ fontSize: '10px', marginBottom: '4px' }}>PAYMENT TERMS & MODE</label>
            <select 
              value={paymentMode}
              onChange={e => setPaymentMode(e.target.value as any)}
              className="form-input"
              style={{ fontWeight: 700, fontSize: '12px' }}
            >
              <option value="CREDIT_30_DAYS">Credit (30 Days)</option>
              <option value="NEFT_RTGS">Bank NEFT / RTGS</option>
              <option value="UPI">Instant UPI</option>
              <option value="CASH">Cash Sale</option>
            </select>
          </div>

          {/* Order Metrics Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Items</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFF', marginTop: '1px' }}>
                {lines.length} SKUs ({totalUnits} Pcs)
              </div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Tax</div>
              <div className="font-mono" style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '1px' }}>
                ₹{totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Breakdown Numerical Rows */}
          <div style={{ background: 'var(--bg-primary)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              <span>Gross Total:</span>
              <span className="font-mono" style={{ color: '#FFF' }}>₹{grossSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            {totalDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#10B981' }}>
                <span>Trade Discounts:</span>
                <span className="font-mono">-₹{totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              <span>Taxable Base:</span>
              <span className="font-mono" style={{ color: '#FFF', fontWeight: 700 }}>₹{subtotalTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            {isIntraState ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  <span>Output CGST (9%):</span>
                  <span className="font-mono" style={{ color: 'var(--accent-cyan)' }}>₹{totalCGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  <span>Output SGST (9%):</span>
                  <span className="font-mono" style={{ color: 'var(--accent-cyan)' }}>₹{totalSGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                <span>Output IGST (18%):</span>
                <span className="font-mono" style={{ color: 'var(--accent-cyan)' }}>₹{totalIGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)' }}>
              <span>Round Off:</span>
              <span className="font-mono" style={{ color: '#FFF' }}>{roundOff >= 0 ? `+₹${roundOff.toFixed(2)}` : `-₹${Math.abs(roundOff).toFixed(2)}`}</span>
            </div>
          </div>

          {/* Grand Total Prominent Highlight Card */}
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
              border: '1.5px solid var(--accent-orange)',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#FFF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                INVOICE GRAND TOTAL:
              </span>
              <span className="font-mono" style={{ fontSize: '20px', fontWeight: 900, color: 'var(--accent-orange-bright)' }}>
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ fontSize: '9.5px', color: 'var(--text-secondary)' }}>
              INR {grandTotal.toLocaleString('en-IN')} Rupees Only
            </div>
          </div>

          {/* Customer Ledger Projection */}
          <div style={{ background: 'var(--bg-primary)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '10.5px', color: 'var(--text-tertiary)' }}>
            <div style={{ fontWeight: 700, color: '#FFF', marginBottom: '2px' }}>Debtor Ledger Projection</div>
            <div>Current Bal: <span style={{ color: '#EF4444' }}>₹{selectedCustomer.outstandingBalance.toLocaleString('en-IN')} Dr</span></div>
            <div>Post-Bill Bal: <strong style={{ color: 'var(--accent-cyan)' }}>₹{projectedClosingBal.toLocaleString('en-IN')} Dr</strong></div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
            <button 
              onClick={handleGenerateInvoice}
              className="btn-primary"
              disabled={lines.length === 0}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 0 20px rgba(255, 107, 0, 0.4)'
              }}
            >
              <FileCheck size={16} />
              <span>Generate & Issue Tax Invoice →</span>
            </button>

            <button 
              onClick={handleResetForm}
              className="btn-secondary"
              style={{ width: '100%', padding: '8px', fontSize: '11px' }}
            >
              <RotateCcw size={12} />
              <span>Clear / Reset Bill</span>
            </button>
          </div>
        </div>

      </div>

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div 
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid var(--accent-orange-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255, 107, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-orange-bright)' }}>
                  <UserPlus size={18} />
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
                  Add New Debtor / Customer
                </div>
              </div>
              <button onClick={() => setShowAddCustomerModal(false)} className="btn-icon" style={{ color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label">CUSTOMER / TRADING ENTITY NAME *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sri Balaji Crockery Mart"
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">GSTIN (15-DIGIT)</label>
                  <input 
                    type="text" 
                    placeholder="33AAAAA0000A1Z5"
                    value={newCustGstin}
                    onChange={e => setNewCustGstin(e.target.value.toUpperCase())}
                    className="form-input font-mono"
                  />
                </div>
                <div>
                  <label className="form-label">STATE CODE</label>
                  <input 
                    type="text" 
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
