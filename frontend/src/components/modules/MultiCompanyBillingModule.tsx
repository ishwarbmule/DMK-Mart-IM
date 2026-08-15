import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Receipt, 
  Printer, 
  FileText,
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
  Filter
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
import { useERPData } from '../../context/ERPContext';
import { ExportDropdown } from '../common/ExportDropdown';
import { ExportOptions } from '../../utils/exportUtils';
import { formatDate, formatFullDate, getRelativeDateLabel, isDateInPreset, DateFilterPreset } from '../../utils/dateUtils';

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
    bills: pastBills, 
    addFastOrderBill, 
    addCustomer: addGlobalCustomer,
    feedbackBanner
  } = useERPData();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || 'cust-01');
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    `${activeCompany.invoicePrefix}${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<'CREDIT_30_DAYS' | 'CASH' | 'NEFT_RTGS' | 'UPI'>('CREDIT_30_DAYS');

  // PRD Section 8.2: Two Views (New Bill & Bills List)
  const [activeBillingView, setActiveBillingView] = useState<'new_bill' | 'bills_list'>('new_bill');
  const [billSearch, setBillSearch] = useState('');
  const [billTypeFilter, setBillTypeFilter] = useState<'ALL' | 'Sales' | 'Purchase'>('ALL');
  const [dateFilter, setDateFilter] = useState<DateFilterPreset>('ALL');
  const [customFromDate, setCustomFromDate] = useState<string>('');
  const [customToDate, setCustomToDate] = useState<string>('');

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
           p.hsnCode.includes(q);
  });

  const handleSelectProduct = (product: PlasticProductItem) => {
    const defaultTier = selectedCustomer?.assignedTier || 'tier1_distributor';
    const rate = product.pricing[defaultTier];
    const rawTaxable = rate * 1;
    const taxAmt = rawTaxable * (product.gstRate / 100);

    const newLine: BilledLineItem = {
      id: `line-${Date.now()}-${Math.random()}`,
      product,
      selectedTier: defaultTier,
      unitPrice: rate,
      quantity: 1,
      unitOfMeasure: product.unitOfMeasure,
      discountPct: 0,
      taxableAmount: rawTaxable,
      gstRate: product.gstRate,
      cgstAmount: isIntraState ? taxAmt / 2 : 0,
      sgstAmount: isIntraState ? taxAmt / 2 : 0,
      igstAmount: isIntraState ? 0 : taxAmt,
      totalAmount: rawTaxable + taxAmt
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

    // Universal Cross-Module Synchronization
    addFastOrderBill(invoiceData);
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

      {/* Two Views Switcher (PRD Section 8.2) */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveBillingView('new_bill')}
          className={activeBillingView === 'new_bill' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '12px' }}
        >
          <Receipt size={14} />
          <span>New Bill Entry Form</span>
        </button>
        <button
          onClick={() => setActiveBillingView('bills_list')}
          className={activeBillingView === 'bills_list' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '12px' }}
        >
          <FileText size={14} />
          <span>Bills List History ({pastBills.length})</span>
        </button>
      </div>

      {activeBillingView === 'bills_list' ? (
        /* Bills List History Table View (PRD Section 8.2 View 2) */
        (() => {
          const filteredBills = pastBills.filter(b => {
            const matchQ = b.billNumber.toLowerCase().includes(billSearch.toLowerCase()) || b.customer.partyName.toLowerCase().includes(billSearch.toLowerCase());
            const matchT = billTypeFilter === 'ALL' || b.type === billTypeFilter;
            const matchD = isDateInPreset(b.date, dateFilter, customFromDate, customToDate);
            return matchQ && matchT && matchD;
          });

          const totalTaxableSum = filteredBills.reduce((acc, b) => acc + b.taxableAmount, 0);
          const totalGstSum = filteredBills.reduce((acc, b) => acc + b.totalGst, 0);
          const totalGrandSum = filteredBills.reduce((acc, b) => acc + b.grandTotal, 0);

          const billsExportOptions: ExportOptions = {
            filename: `DMK_Bills_History_${activeCompany.companyCode}_${new Date().toISOString().split('T')[0]}`,
            title: `${activeCompany.companyName} — Invoices & Bills Register`,
            companyName: activeCompany.companyName,
            companyGstin: activeCompany.gstin,
            subtitle: `Filter: ${billTypeFilter} Bills | Date: ${dateFilter} (${filteredBills.length} records)`,
            columns: [
              { header: 'Bill / Inv Number', key: 'billNumber', width: 16 },
              { header: 'Invoice Date', key: 'date', format: v => formatDate(v), width: 14 },
              { header: 'Customer Party Name', key: 'customer', format: (_, b) => b.customer.partyName, width: 30 },
              { header: 'Customer GSTIN', key: 'customer', format: (_, b) => b.customer.gstin || 'Unregistered', width: 18 },
              { header: 'Customer City', key: 'customer', format: (_, b) => b.customer.city, width: 14 },
              { header: 'Voucher Type', key: 'type', width: 12, align: 'center' },
              { header: 'Line Items', key: 'itemCount', width: 10, align: 'center' },
              { header: 'Taxable Amount (₹)', key: 'taxableAmount', width: 16, align: 'right' },
              { header: 'Total GST (₹)', key: 'totalGst', width: 14, align: 'right' },
              { header: 'Grand Total (₹)', key: 'grandTotal', width: 16, align: 'right' },
              { header: 'Payment Mode', key: 'paymentMode', width: 16 },
              { header: 'Invoice Status', key: 'status', width: 12, align: 'center' }
            ],
            data: filteredBills,
            summaryRows: [
              {
                label: 'Grand Total (Filtered Bills)',
                values: {
                  taxableAmount: totalTaxableSum,
                  totalGst: totalGstSum,
                  grandTotal: totalGrandSum
                }
              }
            ]
          };

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Search, Type Filter & Export */}
              <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
                  <Search size={15} color="var(--text-secondary)" />
                  <input
                    type="text"
                    placeholder="Search bills by number, customer, date..."
                    value={billSearch}
                    onChange={e => setBillSearch(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', maxWidth: '320px' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(['ALL', 'Sales', 'Purchase'] as const).map(bt => (
                      <button
                        key={bt}
                        onClick={() => setBillTypeFilter(bt)}
                        className={billTypeFilter === bt ? 'btn-primary' : 'btn-secondary'}
                        style={{ padding: '5px 12px', fontSize: '11px' }}
                      >
                        {bt}
                      </button>
                    ))}
                  </div>
                  <ExportDropdown options={billsExportOptions} buttonLabel="Export Bills" />
                </div>
              </div>

              {/* Date Filter Bar */}
              <div className="glass-panel" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', background: 'rgba(255, 107, 0, 0.03)', borderColor: 'rgba(255, 107, 0, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 700, color: 'var(--accent-orange-bright)', marginRight: '4px' }}>
                    <Calendar size={14} /> FILTER BY DATE:
                  </div>
                  {(
                    [
                      { key: 'ALL', label: 'All Dates' },
                      { key: 'TODAY', label: 'Today (15 Aug)' },
                      { key: 'YESTERDAY', label: 'Yesterday (14 Aug)' },
                      { key: 'LAST_7_DAYS', label: 'Last 7 Days' },
                      { key: 'THIS_MONTH', label: 'This Month (Aug 2026)' },
                      { key: 'CUSTOM', label: '📅 Custom Date' }
                    ] as const
                  ).map(d => (
                    <button
                      key={d.key}
                      onClick={() => setDateFilter(d.key)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: dateFilter === d.key ? 700 : 500,
                        borderRadius: '6px',
                        border: dateFilter === d.key ? '1px solid var(--accent-orange)' : '1px solid var(--border-subtle)',
                        background: dateFilter === d.key ? 'rgba(255, 107, 0, 0.2)' : 'var(--bg-secondary)',
                        color: dateFilter === d.key ? '#FFF' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                {dateFilter === 'CUSTOM' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>From:</span>
                    <input 
                      type="date" 
                      value={customFromDate} 
                      onChange={e => setCustomFromDate(e.target.value)} 
                      className="form-input" 
                      style={{ height: '30px', fontSize: '11px', padding: '0 8px' }} 
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>To:</span>
                    <input 
                      type="date" 
                      value={customToDate} 
                      onChange={e => setCustomToDate(e.target.value)} 
                      className="form-input" 
                      style={{ height: '30px', fontSize: '11px', padding: '0 8px' }} 
                    />
                  </div>
                )}

                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Showing <strong style={{ color: '#FFF' }}>{filteredBills.length}</strong> transaction(s)
                </div>
              </div>

              {/* Bills Register Table */}
              <div className="enterprise-table-container">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Bill Number</th>
                      <th>Transaction Date</th>
                      <th>Customer / Party Name</th>
                      <th>Type</th>
                      <th>Items</th>
                      <th style={{ textAlign: 'right' }}>Taxable (₹)</th>
                      <th style={{ textAlign: 'right' }}>GST (₹)</th>
                      <th style={{ textAlign: 'right' }}>Grand Total (₹)</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                          No bills found matching the selected date filter or search query.
                        </td>
                      </tr>
                    ) : (
                      filteredBills.map((b, idx) => (
                        <tr key={idx}>
                          <td className="font-mono" style={{ color: 'var(--accent-orange-bright)', fontWeight: 700 }}>
                            {b.billNumber}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Calendar size={13} color="var(--accent-orange)" />
                              <span style={{ fontWeight: 600, color: '#FFF' }}>{formatDate(b.date)}</span>
                            </div>
                            <div style={{ fontSize: '10.5px', color: 'var(--accent-orange-bright)', marginTop: '2px', fontWeight: 500 }}>
                              {getRelativeDateLabel(b.date)}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#FFF' }}>{b.customer.partyName}</div>
                            <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>{b.customer.city}</div>
                          </td>
                          <td>
                            <span className={`status-pill ${b.type === 'Sales' ? 'status-pill-orange' : 'status-pill-cyan'}`} style={{ fontSize: '9px' }}>
                              {b.type}
                            </span>
                          </td>
                          <td>{b.itemCount} Items</td>
                          <td className="font-mono" style={{ textAlign: 'right' }}>₹{b.taxableAmount.toLocaleString('en-IN')}</td>
                          <td className="font-mono" style={{ textAlign: 'right', color: '#00E5FF' }}>₹{b.totalGst.toLocaleString('en-IN')}</td>
                          <td className="font-mono" style={{ textAlign: 'right', fontWeight: 800, color: '#FFF' }}>₹{b.grandTotal.toLocaleString('en-IN')}</td>
                          <td>
                            <span className={`status-pill ${b.status === 'Invoiced' ? 'status-pill-success' : b.status === 'Confirmed' ? 'status-pill-cyan' : 'status-pill-warning'}`} style={{ fontSize: '9px' }}>
                              {b.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => handleGenerateInvoice()}
                              className="btn-secondary"
                              style={{ padding: '5px 10px', fontSize: '11px' }}
                            >
                              <Printer size={13} />
                              <span>View A4 Invoice</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()
      ) : (
        <>

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
      <div className="glass-panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
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
              style={{ fontWeight: 600 }}
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.partyName} ({c.city}) — Tier: {c.assignedTier.replace('tier', 'T')}
                </option>
              ))}
            </select>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
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
            <div style={{ fontSize: '11px', color: 'var(--accent-orange-bright)', marginTop: '4px', fontWeight: 600 }}>
              📅 {formatFullDate(invoiceDate)}
            </div>
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
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderColor: 'var(--accent-orange-border)',
            boxShadow: '0 0 16px rgba(255, 107, 0, 0.12)'
          }}
        >
          <Search size={18} color="var(--accent-orange)" />
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
              fontSize: '13.5px',
              fontWeight: 500
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

        <table className="enterprise-table" style={{ tableLayout: 'auto' }}>
          <thead>
            <tr>
              <th style={{ width: '48px', minWidth: '48px', textAlign: 'center' }}>#</th>
              <th style={{ minWidth: '220px' }}>Product Description</th>
              <th style={{ width: '90px', minWidth: '90px' }}>HSN</th>
              <th style={{ width: '220px', minWidth: '220px' }}>Pricing Tier</th>
              <th style={{ width: '130px', minWidth: '130px', textAlign: 'right' }}>Unit Rate (₹)</th>
              <th style={{ width: '150px', minWidth: '150px', textAlign: 'center' }}>Quantity</th>
              <th style={{ width: '70px', minWidth: '70px', textAlign: 'center' }}>UOM</th>
              <th style={{ width: '100px', minWidth: '100px', textAlign: 'center' }}>Disc %</th>
              <th style={{ width: '130px', minWidth: '130px', textAlign: 'right' }}>Taxable Val (₹)</th>
              <th style={{ width: '80px', minWidth: '80px', textAlign: 'center' }}>GST %</th>
              <th style={{ width: '140px', minWidth: '140px', textAlign: 'right' }}>Total (₹)</th>
              <th style={{ width: '50px', minWidth: '50px', textAlign: 'center' }}></th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td colSpan={12} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                  No items added yet. Type a product name in the search bar above to add items.
                </td>
              </tr>
            ) : (
              lines.map((line, idx) => (
                <tr key={line.id}>
                  <td style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontWeight: 700 }}>{idx + 1}</td>
                  <td>
                    <div style={{ fontWeight: 800, color: '#FFF', fontSize: '13.5px' }}>{line.product.name}</div>
                    <div className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-orange-bright)', marginTop: '2px' }}>{line.product.sku}</div>
                  </td>
                  <td className="font-mono" style={{ fontSize: '12px' }}>{line.product.hsnCode}</td>
                  
                  {/* Tier Dropdown */}
                  <td>
                    <select 
                      value={line.selectedTier}
                      onChange={e => handleUpdateLine(line.id, { selectedTier: e.target.value as PricingTierKey })}
                      className="table-input"
                      style={{ fontWeight: 600 }}
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
                      className="table-input font-mono"
                      style={{ textAlign: 'right', fontWeight: 700 }}
                    />
                  </td>

                  {/* Roomy Quantity Stepper with Large Legible Digits */}
                  <td>
                    <div className="qty-stepper-box">
                      <button
                        type="button"
                        onClick={() => handleUpdateLine(line.id, { quantity: Math.max(1, line.quantity - 1) })}
                        className="qty-stepper-btn"
                        title="Decrease quantity"
                      >
                        -
                      </button>
                      <input 
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={e => handleUpdateLine(line.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="qty-stepper-input"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateLine(line.id, { quantity: line.quantity + 1 })}
                        className="qty-stepper-btn"
                        title="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </td>

                  <td style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>{line.unitOfMeasure}</td>

                  <td>
                    <input 
                      type="number"
                      value={line.discountPct}
                      onChange={e => handleUpdateLine(line.id, { discountPct: parseFloat(e.target.value) || 0 })}
                      className="table-input font-mono"
                      style={{ textAlign: 'center', fontWeight: 700 }}
                    />
                  </td>

                  <td className="font-mono" style={{ textAlign: 'right', fontWeight: 700 }}>
                    ₹{line.taxableAmount.toFixed(2)}
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <span className="status-pill status-pill-cyan">
                      {line.gstRate}%
                    </span>
                  </td>

                  <td className="font-mono" style={{ textAlign: 'right', fontWeight: 900, color: '#10B981', fontSize: '14px' }}>
                    ₹{line.totalAmount.toFixed(2)}
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <button 
                      type="button"
                      onClick={() => handleRemoveLine(line.id)}
                      style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '6px' }}
                      title="Remove line item"
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
          padding: '18px 20px',
          display: 'grid',
          gridTemplateColumns: '1.3fr 1fr',
          gap: '20px',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFF', marginBottom: '8px' }}>
            Automated Double-Entry Ledger Posting Impact
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '12px 14px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
            <span>Total Taxable Value:</span>
            <span className="font-mono" style={{ color: '#FFF', fontWeight: 700 }}>₹{subtotalTaxable.toFixed(2)}</span>
          </div>

          {isIntraState ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                <span>Central GST (CGST Output):</span>
                <span className="font-mono">₹{totalCGST.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                <span>State GST (SGST Output):</span>
                <span className="font-mono">₹{totalSGST.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              <span>Integrated GST (IGST Output):</span>
              <span className="font-mono">₹{totalIGST.toFixed(2)}</span>
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--border-medium)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFF' }}>FINAL INVOICE TOTAL:</span>
            <span className="font-mono" style={{ fontSize: '22px', fontWeight: 900, color: 'var(--accent-orange-bright)' }}>
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>

          <button 
            onClick={handleGenerateInvoice}
            disabled={lines.length === 0}
            className="btn-primary"
            style={{ width: '100%', height: '40px', fontSize: '13.5px', fontWeight: 700 }}
          >
            <Printer size={16} /> Generate & View Official Tax Invoice
          </button>
        </div>
      </div>
      </>
      )}

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
