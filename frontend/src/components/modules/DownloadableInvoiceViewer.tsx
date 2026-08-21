import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  FileText, 
  CheckCircle2, 
  QrCode, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Eye, 
  IndianRupee, 
  Plus, 
  ChevronRight,
  Maximize2,
  Building2,
  Landmark,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CreditCard,
  Layers,
  Sparkles
} from 'lucide-react';
import { FinalInvoiceData, BilledLineItem } from '../../types/erp';
import { DMK_MART_COMPANY, MOCK_CUSTOMERS } from '../../data/multiCompanyData';
import { INITIAL_PLASTICS_CATALOG } from '../../data/plasticsCatalog';
import { useERPData } from '../../context/ERPContext';
import { ExportDropdown } from '../common/ExportDropdown';

interface DownloadableInvoiceViewerProps {
  invoiceData: FinalInvoiceData | null;
  onBackToBilling: () => void;
}

interface PagePartition {
  pageNumber: number;
  totalPages: number;
  items: BilledLineItem[];
  startIndex: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  pageSubtotal: number;
  previousCumulativeSubtotal: number;
  cumulativeSubtotal: number;
}

// Generates dynamic mock invoice with N products for multi-page stress testing
const createDynamicMultiItemInvoice = (itemCount: number): FinalInvoiceData => {
  const company = DMK_MART_COMPANY;
  const customer = MOCK_CUSTOMERS[0];
  const isIntraState = true;
  
  const lineItems: BilledLineItem[] = [];
  for (let i = 0; i < itemCount; i++) {
    const prod = INITIAL_PLASTICS_CATALOG[i % INITIAL_PLASTICS_CATALOG.length];
    const qty = (i + 1) * 15;
    const price = prod.pricing.tier1_distributor;
    const taxable = qty * price;
    const gstRate = prod.gstRate || 18;
    const taxAmt = taxable * (gstRate / 100);

    lineItems.push({
      id: `dyn-item-${i + 1}`,
      product: prod,
      selectedTier: 'tier1_distributor',
      packagingFormat: 'PIECE',
      unitPrice: price,
      baseTierPrice: price,
      bulkDiscountPct: 0,
      bulkSavingsRupees: 0,
      quantity: qty,
      unitOfMeasure: prod.unitOfMeasure,
      discountPct: 0,
      taxableAmount: taxable,
      gstRate: gstRate,
      cgstAmount: isIntraState ? taxAmt / 2 : 0,
      sgstAmount: isIntraState ? taxAmt / 2 : 0,
      igstAmount: isIntraState ? 0 : taxAmt,
      totalAmount: taxable + taxAmt
    });
  }

  const subtotalTaxable = lineItems.reduce((acc, l) => acc + l.taxableAmount, 0);
  const totalCGST = lineItems.reduce((acc, l) => acc + l.cgstAmount, 0);
  const totalSGST = lineItems.reduce((acc, l) => acc + l.sgstAmount, 0);
  const totalIGST = lineItems.reduce((acc, l) => acc + l.igstAmount, 0);
  const rawGrandTotal = subtotalTaxable + totalCGST + totalSGST + totalIGST;
  const grandTotal = Math.round(rawGrandTotal);
  const roundOff = grandTotal - rawGrandTotal;

  return {
    invoiceNumber: `DMK/26-27/${Math.floor(4000 + Math.random() * 900)}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    company,
    customer,
    lineItems,
    subtotalTaxable,
    totalCGST,
    totalSGST,
    totalIGST,
    roundOff,
    grandTotal,
    amountInWords: `INR ${grandTotal.toLocaleString('en-IN')} Rupees Only`,
    paymentMode: 'CREDIT_30_DAYS',
    notes: 'Official Commercial B2B Tax Invoice under GST Rule 46. Goods dispatched via SIPCOT Express Logistics.'
  };
};

export const DownloadableInvoiceViewer: React.FC<DownloadableInvoiceViewerProps> = ({
  invoiceData: initialInvoiceData,
  onBackToBilling
}) => {
  const { allInvoices, currentInvoice, setCurrentInvoice } = useERPData();

  // Active Invoice for Preview
  const [activeInvoice, setActiveInvoice] = useState<FinalInvoiceData>(() => {
    return initialInvoiceData || (allInvoices && allInvoices.length > 0 ? allInvoices[0] : createDynamicMultiItemInvoice(4));
  });

  // Search & Filters for Left Column List
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<'ALL' | 'NEFT_RTGS' | 'UPI' | 'CREDIT_30_DAYS' | 'CASH'>('ALL');

  // Zoom Scale State - default 0.95 for high legibility
  const [zoomScale, setZoomScale] = useState<number>(0.95);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Sync when initialInvoiceData updates
  useEffect(() => {
    if (initialInvoiceData) {
      setActiveInvoice(initialInvoiceData);
    }
  }, [initialInvoiceData]);

  // Zoom Handlers
  const handleZoomIn = () => {
    setZoomScale(prev => Math.min(Number((prev + 0.1).toFixed(2)), 1.8));
  };

  const handleZoomOut = () => {
    setZoomScale(prev => Math.max(Number((prev - 0.1).toFixed(2)), 0.45));
  };

  const handleZoomActual = () => {
    setZoomScale(1.0);
  };

  const handleFitWidth = () => {
    if (!previewContainerRef.current) {
      setZoomScale(1.0);
      return;
    }
    const containerWidth = previewContainerRef.current.clientWidth;
    const scale = Math.max(0.5, Math.min((containerWidth - 48) / 820, 1.4));
    setZoomScale(Number(scale.toFixed(2)));
  };

  const handleFitPage = () => {
    if (!previewContainerRef.current) {
      setZoomScale(0.85);
      return;
    }
    const containerHeight = previewContainerRef.current.clientHeight || (window.innerHeight - 200);
    const scale = Math.max(0.45, Math.min((containerHeight - 48) / 1150, 1.1));
    setZoomScale(Number(scale.toFixed(2)));
  };

  const handlePrint = () => {
    window.print();
  };

  // Test scenario loader
  const handleLoadItemCountPreset = (count: number) => {
    const dynamicInv = createDynamicMultiItemInvoice(count);
    setActiveInvoice(dynamicInv);
    setCurrentInvoice(dynamicInv);
  };

  // Filtered Invoices for Left Column List
  const filteredInvoices = useMemo(() => {
    return allInvoices.filter(inv => {
      if (selectedPaymentFilter !== 'ALL' && inv.paymentMode !== selectedPaymentFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = inv.invoiceNumber.toLowerCase().includes(q);
        const matchCustomer = inv.customer.partyName.toLowerCase().includes(q) || (inv.customer.gstin && inv.customer.gstin.toLowerCase().includes(q)) || inv.customer.city.toLowerCase().includes(q);
        const matchItems = inv.lineItems.some(l => l.product.name.toLowerCase().includes(q) || l.product.sku.toLowerCase().includes(q));
        if (!matchNumber && !matchCustomer && !matchItems) {
          return false;
        }
      }
      return true;
    });
  }, [allInvoices, selectedPaymentFilter, searchQuery]);

  // Aggregate Metrics for Left Column
  const totalRevenue = useMemo(() => allInvoices.reduce((acc, inv) => acc + inv.grandTotal, 0), [allInvoices]);
  const totalTax = useMemo(() => allInvoices.reduce((acc, inv) => acc + (inv.totalCGST + inv.totalSGST + inv.totalIGST), 0), [allInvoices]);

  // Document Standard Multi-Page Partitioning Algorithm
  const partitionPages = (items: BilledLineItem[]): PagePartition[] => {
    const total = items.length;
    // Single page threshold: up to 5 items with full header, items table, and full bottom summary
    if (total <= 5) {
      const subtotal = items.reduce((acc, it) => acc + it.taxableAmount, 0);
      return [{
        pageNumber: 1,
        totalPages: 1,
        items,
        startIndex: 0,
        isFirstPage: true,
        isLastPage: true,
        pageSubtotal: subtotal,
        previousCumulativeSubtotal: 0,
        cumulativeSubtotal: subtotal
      }];
    }

    const pages: PagePartition[] = [];
    let remaining = [...items];
    let currentIndex = 0;
    let pageNum = 1;
    let runningTotal = 0;

    // Page 1 gets up to 7 items because it carries the primary corporate header and buyer metadata
    const p1Items = remaining.slice(0, 7);
    remaining = remaining.slice(7);
    const p1Sub = p1Items.reduce((acc, it) => acc + it.taxableAmount, 0);
    const prevCum1 = 0;
    runningTotal += p1Sub;

    pages.push({
      pageNumber: 1,
      totalPages: 0,
      items: p1Items,
      startIndex: 0,
      isFirstPage: true,
      isLastPage: false,
      pageSubtotal: p1Sub,
      previousCumulativeSubtotal: prevCum1,
      cumulativeSubtotal: runningTotal
    });
    currentIndex += p1Items.length;

    // Subsequent pages
    while (remaining.length > 0) {
      pageNum++;
      const prevCum = runningTotal;

      if (remaining.length <= 5) {
        // Fits comfortably on final summary page along with HSN box, Bank details, Grand Totals, and Signatures
        const pItems = remaining;
        remaining = [];
        const pSub = pItems.reduce((acc, it) => acc + it.taxableAmount, 0);
        runningTotal += pSub;
        pages.push({
          pageNumber: pageNum,
          totalPages: 0,
          items: pItems,
          startIndex: currentIndex,
          isFirstPage: false,
          isLastPage: true,
          pageSubtotal: pSub,
          previousCumulativeSubtotal: prevCum,
          cumulativeSubtotal: runningTotal
        });
        currentIndex += pItems.length;
      } else {
        // Intermediate page: take up to 10 items
        const countToTake = remaining.length <= 9 ? Math.max(remaining.length - 4, 5) : 10;
        const pItems = remaining.slice(0, countToTake);
        remaining = remaining.slice(countToTake);
        const pSub = pItems.reduce((acc, it) => acc + it.taxableAmount, 0);
        runningTotal += pSub;
        pages.push({
          pageNumber: pageNum,
          totalPages: 0,
          items: pItems,
          startIndex: currentIndex,
          isFirstPage: false,
          isLastPage: false,
          pageSubtotal: pSub,
          previousCumulativeSubtotal: prevCum,
          cumulativeSubtotal: runningTotal
        });
        currentIndex += pItems.length;
      }
    }

    const totalPages = pages.length;
    pages.forEach(p => { p.totalPages = totalPages; });
    return pages;
  };

  const { company, customer, lineItems } = activeInvoice;
  const isIntraState = company.stateCode === customer.stateCode;
  const pages = partitionPages(lineItems);

  // Group line items by HSN for the summary table
  const hsnSummary = useMemo(() => {
    const map: Record<string, { hsn: string; taxable: number; rate: number; cgst: number; sgst: number; igst: number; total: number }> = {};
    lineItems.forEach(l => {
      const hsn = l.product.hsnCode || '39241090';
      if (!map[hsn]) {
        map[hsn] = { hsn, taxable: 0, rate: l.gstRate, cgst: 0, sgst: 0, igst: 0, total: 0 };
      }
      map[hsn].taxable += l.taxableAmount;
      map[hsn].cgst += l.cgstAmount;
      map[hsn].sgst += l.sgstAmount;
      map[hsn].igst += l.igstAmount;
      map[hsn].total += (l.cgstAmount + l.sgstAmount + l.igstAmount);
    });
    return Object.values(map);
  }, [lineItems]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - var(--header-height) - 36px)' }}>
      
      {/* 2-Column Split Workspace */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '380px 1fr',
          gap: '18px',
          height: '100%',
          minHeight: 0
        }}
      >
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: ALL INVOICES & ORDERS LIST                                   */}
        {/* ========================================================================= */}
        <div 
          className="glass-panel no-print"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            padding: '16px'
          }}
        >
          {/* Header & Mini Stats */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div 
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF'
                }}
              >
                <FileText size={16} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFF' }}>
                  Tax Invoices & Orders
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                  {filteredInvoices.length} Registered Bills
                </div>
              </div>
            </div>

            <button
              onClick={onBackToBilling}
              className="btn-primary"
              style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={13} />
              <span>New Bill</span>
            </button>
          </div>

          {/* KPI Mini Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '9.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Billed Value</div>
              <div className="font-mono" style={{ fontSize: '14px', fontWeight: 800, color: '#FFF', marginTop: '1px' }}>
                ₹{totalRevenue.toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '9.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Total GST Tax</div>
              <div className="font-mono" style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '1px' }}>
                ₹{totalTax.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Search Input */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '7px 12px',
              marginBottom: '10px'
            }}
          >
            <Search size={14} color="var(--accent-orange)" />
            <input 
              type="text"
              placeholder="Search invoice #, customer, city, GSTIN..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#FFF',
                fontSize: '12px'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '11px' }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Payment Mode Filter Chips */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '8px' }}>
            {(['ALL', 'NEFT_RTGS', 'UPI', 'CREDIT_30_DAYS', 'CASH'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setSelectedPaymentFilter(mode)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: selectedPaymentFilter === mode ? '1px solid var(--accent-orange)' : '1px solid var(--border-subtle)',
                  background: selectedPaymentFilter === mode ? 'rgba(255, 107, 0, 0.15)' : 'var(--bg-primary)',
                  color: selectedPaymentFilter === mode ? 'var(--accent-orange-bright)' : 'var(--text-secondary)'
                }}
              >
                {mode === 'ALL' ? 'All' : mode === 'NEFT_RTGS' ? 'NEFT/RTGS' : mode === 'UPI' ? 'UPI' : mode === 'CREDIT_30_DAYS' ? 'Credit' : 'Cash'}
              </button>
            ))}
          </div>

          {/* Scrollable List of Invoices */}
          <div 
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              paddingRight: '4px'
            }}
          >
            {filteredInvoices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                No invoices match search criteria.
              </div>
            ) : (
              filteredInvoices.map((inv, idx) => {
                const isSelected = activeInvoice.invoiceNumber === inv.invoiceNumber;
                const isNeft = inv.paymentMode === 'NEFT_RTGS';
                const isUpi = inv.paymentMode === 'UPI';
                const isCash = inv.paymentMode === 'CASH';
                const totalQty = inv.lineItems.reduce((acc, l) => acc + l.quantity, 0);

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setActiveInvoice(inv);
                      setCurrentInvoice(inv);
                    }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(255, 107, 0, 0.12)' : 'var(--bg-primary)',
                      border: isSelected ? '1.5px solid var(--accent-orange)' : '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 0 16px rgba(255, 107, 0, 0.2)' : 'none'
                    }}
                  >
                    {/* Top Row: Invoice Number + Payment Status Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="font-mono" style={{ fontSize: '12.5px', fontWeight: 800, color: isSelected ? 'var(--accent-orange-bright)' : '#FFF' }}>
                        {inv.invoiceNumber}
                      </span>
                      <span 
                        className={isNeft || isUpi || isCash ? 'status-pill-success' : 'status-pill-warning'}
                        style={{ fontSize: '9px', padding: '2px 6px' }}
                      >
                        {isNeft ? 'PAID (NEFT)' : isUpi ? 'PAID (UPI)' : isCash ? 'PAID (CASH)' : 'CREDIT (30D)'}
                      </span>
                    </div>

                    {/* Customer Party */}
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFF' }}>
                      {inv.customer.partyName}
                    </div>

                    {/* Meta Subtext */}
                    <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{inv.customer.city} • {inv.lineItems.length} Items ({totalQty} Pcs)</span>
                      <span>{inv.invoiceDate}</span>
                    </div>

                    {/* Bottom Row: Grand Total & Selection Indicator */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '6px', marginTop: '2px' }}>
                      <div className="font-mono" style={{ fontSize: '13.5px', fontWeight: 900, color: '#10B981' }}>
                        ₹{inv.grandTotal.toLocaleString('en-IN')}
                      </div>

                      {isSelected && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: 'var(--accent-orange-bright)', fontWeight: 700 }}>
                          <span>Viewing</span>
                          <ChevronRight size={12} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: INTERACTIVE A4 INVOICE PREVIEW & ZOOM CONTROLS              */}
        {/* ========================================================================= */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Top Sticky Toolbar */}
          <div 
            className="glass-panel no-print"
            style={{
              padding: '10px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '12px',
              zIndex: 20
            }}
          >
            {/* Left: Active Invoice Info & Multi-Page Count Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span className="font-mono" style={{ fontSize: '14px', fontWeight: 900, color: 'var(--accent-orange-bright)' }}>
                {activeInvoice.invoiceNumber}
              </span>
              <span style={{ fontSize: '12px', color: '#FFF', fontWeight: 600 }}>
                {activeInvoice.customer.partyName}
              </span>
              <div className="status-pill status-pill-success" style={{ fontSize: '10px', padding: '2px 8px' }}>
                <CheckCircle2 size={11} style={{ marginRight: '4px', display: 'inline-block' }} />
                GST COMPLIANT
              </div>
              <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', background: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0, 229, 255, 0.3)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                {activeInvoice.lineItems.length} Products • {pages.length} Page{pages.length > 1 ? 's' : ''}
              </div>
            </div>

            {/* Middle: Multi-Product Demo Scenarios */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Test Items:</span>
              <button 
                onClick={() => handleLoadItemCountPreset(3)}
                className="btn-secondary"
                style={{ padding: '4px 8px', fontSize: '11px' }}
                title="Single Page Document (3 items)"
              >
                1 Page (3)
              </button>
              <button 
                onClick={() => handleLoadItemCountPreset(10)}
                className="btn-secondary"
                style={{ padding: '4px 8px', fontSize: '11px' }}
                title="2-Page Document Partition (10 items)"
              >
                2 Pages (10)
              </button>
              <button 
                onClick={() => handleLoadItemCountPreset(22)}
                className="btn-secondary"
                style={{ padding: '4px 8px', fontSize: '11px' }}
                title="3-Page Document Partition (22 items)"
              >
                3 Pages (22)
              </button>
            </div>

            {/* Right: Working Zoom Controls & Print Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Zoom Buttons Group */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-primary)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  padding: '2px 4px'
                }}
              >
                <button 
                  onClick={handleZoomOut}
                  className="btn-icon"
                  style={{ background: 'transparent', border: 'none', color: '#FFF', padding: '5px 8px', cursor: 'pointer' }}
                  title="Zoom Out (-10%)"
                >
                  <ZoomOut size={14} />
                </button>

                <button
                  onClick={handleZoomActual}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-orange-bright)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    padding: '0 6px',
                    minWidth: '46px',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                  title="Reset to 100%"
                >
                  {Math.round(zoomScale * 100)}%
                </button>

                <button 
                  onClick={handleZoomIn}
                  className="btn-icon"
                  style={{ background: 'transparent', border: 'none', color: '#FFF', padding: '5px 8px', cursor: 'pointer' }}
                  title="Zoom In (+10%)"
                >
                  <ZoomIn size={14} />
                </button>
              </div>

              {/* Fit Modes */}
              <button 
                onClick={handleFitWidth}
                className="btn-secondary"
                style={{ padding: '6px 10px', fontSize: '11px' }}
                title="Fit to Column Width"
              >
                Fit Width
              </button>

              <button 
                onClick={handleFitPage}
                className="btn-secondary"
                style={{ padding: '6px 10px', fontSize: '11px' }}
                title="Fit Page Height"
              >
                Fit Page
              </button>

              {/* Print Trigger */}
              <button 
                onClick={handlePrint}
                className="btn-primary"
                style={{ padding: '7px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 0 14px rgba(255, 107, 0, 0.4)' }}
              >
                <Printer size={15} />
                <span>Print Official A4</span>
              </button>
            </div>
          </div>

          {/* Scrollable A4 Document Viewport */}
          <div 
            ref={previewContainerRef}
            className="invoice-preview-viewport"
            style={{
              flex: 1,
              overflow: 'auto',
              background: '#0B0F19',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              padding: '32px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            {/* Scaled Multi-Page Container */}
            <div 
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: 'top center',
                transition: 'transform 0.12s ease-out',
                display: 'flex',
                flexDirection: 'column',
                gap: '36px',
                marginBottom: `calc((1130px * ${zoomScale}) - 1130px + 40px)`
              }}
            >
              {pages.map(page => (
                <div 
                  key={page.pageNumber}
                  className="a4-page-sheet"
                  style={{
                    width: '800px',
                    minHeight: '1130px',
                    boxSizing: 'border-box',
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    padding: '36px 42px',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  <div>
                    {/* 1. CORPORATE HEADER (PAGE 1 vs CONTINUATION PAGES) */}
                    {page.isFirstPage ? (
                      /* Page 1 Primary Header */
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2.5px solid #0F172A', paddingBottom: '16px', marginBottom: '18px' }}>
                        {/* Left: Brand Identity & Legal Details */}
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                          <div 
                            style={{
                              width: '50px',
                              height: '50px',
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)',
                              color: '#FFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 900,
                              fontSize: '24px',
                              boxShadow: '0 4px 12px rgba(255, 107, 0, 0.35)',
                              flexShrink: 0
                            }}
                          >
                            D
                          </div>
                          <div>
                            <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
                              {company.companyName}
                            </div>
                            <div style={{ fontSize: '10.5px', color: '#475569', marginTop: '3px', lineHeight: '1.4' }}>
                              {company.registeredAddress}
                            </div>
                            <div style={{ fontSize: '10.5px', color: '#334155', marginTop: '3px', fontWeight: 600 }}>
                              GSTIN: <strong style={{ color: '#0F172A' }}>{company.gstin}</strong> | State Code: <strong>{company.stateCode} (Tamil Nadu)</strong> | Phone: {company.contactPhone}
                            </div>
                          </div>
                        </div>

                        {/* Right: Modern TAX INVOICE Header Badge */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', letterSpacing: '0.04em' }}>
                            TAX INVOICE
                          </div>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: '#FF6B00', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Original for Recipient
                          </div>
                          <div style={{ fontSize: '9px', color: '#64748B', marginTop: '1px' }}>
                            Under Section 31 of CGST Act, 2017
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Page 2+ Continuation Header according to Official Document Standards */
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0F172A', paddingBottom: '10px', marginBottom: '16px' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>
                            {company.companyName}
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748B' }}>
                            GSTIN: <strong>{company.gstin}</strong> • Tax Invoice Continuation
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>
                            Invoice #{activeInvoice.invoiceNumber}
                          </div>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: '#FF6B00' }}>
                            Page {page.pageNumber} of {page.totalPages}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. METADATA GRID (Shown on Page 1) */}
                    {page.isFirstPage && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '18px' }}>
                        {/* Left Box: Customer Bill-To & Ship-To */}
                        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '12px 16px' }}>
                          <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                            BILLED TO (CUSTOMER / BUYER)
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                            {customer.partyName}
                          </div>
                          <div style={{ fontSize: '11px', color: '#475569', marginTop: '3px' }}>
                            {customer.city}, State Code: {customer.stateCode}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
                            <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>GSTIN:</span>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', background: '#EDF2F7', padding: '1px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                              {customer.gstin || 'UNREGISTERED'}
                            </span>
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#475569', marginTop: '4px' }}>
                            Phone: <strong>{customer.phone}</strong> | Delivery: <strong>Industrial Warehouse, {customer.city}</strong>
                          </div>
                        </div>

                        {/* Right Box: Invoice Particulars & Transport */}
                        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '12px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                              INVOICE & DISPATCH PARTICULARS
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: '11px' }}>
                              <div>
                                <span style={{ color: '#64748B' }}>Invoice No:</span>
                                <div style={{ fontWeight: 900, color: '#0F172A', fontFamily: 'monospace', fontSize: '12px' }}>
                                  {activeInvoice.invoiceNumber}
                                </div>
                              </div>

                              <div>
                                <span style={{ color: '#64748B' }}>Invoice Date:</span>
                                <div style={{ fontWeight: 800, color: '#0F172A' }}>
                                  {activeInvoice.invoiceDate}
                                </div>
                              </div>

                              <div>
                                <span style={{ color: '#64748B' }}>Place of Supply:</span>
                                <div style={{ fontWeight: 700, color: '#0F172A' }}>
                                  {customer.city} ({customer.stateCode})
                                </div>
                              </div>

                              <div>
                                <span style={{ color: '#64748B' }}>Payment Terms:</span>
                                <div style={{ fontWeight: 700, color: '#0F172A' }}>
                                  {activeInvoice.paymentMode}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '6px', marginTop: '6px', fontSize: '10px', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                            <span>E-Way: <strong style={{ color: '#0F172A' }}>291084920194</strong></span>
                            <span>Vehicle: <strong style={{ color: '#0F172A' }}>TN-70-AJ-8812</strong></span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Brought Forward (B/F) Subtotal Row for Intermediate Pages */}
                    {!page.isFirstPage && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '7px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, color: '#334155', marginBottom: '10px' }}>
                        <span>Brought Forward from Page {page.pageNumber - 1} (B/F):</span>
                        <span className="font-mono">₹{page.previousCumulativeSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    {/* 3. CLEAN & SPACIOUS LINE ITEMS TABLE */}
                    <div style={{ border: '1px solid #CBD5E1', borderRadius: '6px', overflow: 'hidden', marginBottom: '14px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: '#0F172A', color: '#FFFFFF' }}>
                            <th style={{ padding: '9px 10px', width: '32px', textAlign: 'center', fontWeight: 800, borderRight: '1px solid #1E293B' }}>#</th>
                            <th style={{ padding: '9px 12px', fontWeight: 800, borderRight: '1px solid #1E293B' }}>Product Description & Specifications</th>
                            <th style={{ padding: '9px 10px', width: '75px', textAlign: 'center', fontWeight: 800, borderRight: '1px solid #1E293B' }}>HSN</th>
                            <th style={{ padding: '9px 10px', width: '60px', textAlign: 'right', fontWeight: 800, borderRight: '1px solid #1E293B' }}>Qty</th>
                            <th style={{ padding: '9px 10px', width: '75px', textAlign: 'right', fontWeight: 800, borderRight: '1px solid #1E293B' }}>Rate (₹)</th>
                            <th style={{ padding: '9px 12px', width: '85px', textAlign: 'right', fontWeight: 800, borderRight: '1px solid #1E293B' }}>Taxable (₹)</th>
                            {isIntraState ? (
                              <>
                                <th style={{ padding: '9px 8px', width: '70px', textAlign: 'right', fontWeight: 800, borderRight: '1px solid #1E293B' }}>CGST (9%)</th>
                                <th style={{ padding: '9px 8px', width: '70px', textAlign: 'right', fontWeight: 800, borderRight: '1px solid #1E293B' }}>SGST (9%)</th>
                              </>
                            ) : (
                              <th style={{ padding: '9px 10px', width: '85px', textAlign: 'right', fontWeight: 800, borderRight: '1px solid #1E293B' }}>IGST (18%)</th>
                            )}
                            <th style={{ padding: '9px 12px', width: '90px', textAlign: 'right', fontWeight: 800 }}>Total (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {page.items.map((item, idx) => {
                            const globalIndex = page.startIndex + idx + 1;
                            const isEven = idx % 2 === 1;
                            return (
                              <tr key={item.id} style={{ background: isEven ? '#F8FAFC' : '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
                                <td style={{ padding: '10px', textAlign: 'center', fontWeight: 700, color: '#64748B', borderRight: '1px solid #E2E8F0' }}>
                                  {globalIndex}
                                </td>
                                <td style={{ padding: '10px 12px', borderRight: '1px solid #E2E8F0' }}>
                                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '11.5px' }}>
                                    {item.product.name}
                                  </div>
                                  <div style={{ fontSize: '9.5px', color: '#64748B', marginTop: '2px' }}>
                                    SKU: <span className="font-mono">{item.product.sku}</span> • Mat: {item.product.material}
                                  </div>
                                </td>
                                <td style={{ padding: '10px', textAlign: 'center', fontFamily: 'monospace', color: '#334155', fontWeight: 600, borderRight: '1px solid #E2E8F0' }}>
                                  {item.product.hsnCode || '39241090'}
                                </td>
                                <td style={{ padding: '10px', textAlign: 'right', fontWeight: 800, color: '#0F172A', borderRight: '1px solid #E2E8F0' }}>
                                  {item.quantity} <span style={{ fontSize: '9px', color: '#64748B', fontWeight: 500 }}>{item.unitOfMeasure}</span>
                                </td>
                                <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace', color: '#334155', borderRight: '1px solid #E2E8F0' }}>
                                  {item.unitPrice.toFixed(2)}
                                </td>
                                <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#0F172A', borderRight: '1px solid #E2E8F0' }}>
                                  {item.taxableAmount.toFixed(2)}
                                </td>
                                {isIntraState ? (
                                  <>
                                    <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'monospace', color: '#475569', borderRight: '1px solid #E2E8F0' }}>
                                      {item.cgstAmount.toFixed(2)}
                                    </td>
                                    <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'monospace', color: '#475569', borderRight: '1px solid #E2E8F0' }}>
                                      {item.sgstAmount.toFixed(2)}
                                    </td>
                                  </>
                                ) : (
                                  <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace', color: '#475569', borderRight: '1px solid #E2E8F0' }}>
                                    {item.igstAmount.toFixed(2)}
                                  </td>
                                )}
                                <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 900, color: '#0F172A' }}>
                                  {item.totalAmount.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 4. SUBSEQUENT PAGE CARRY FORWARD OR FINAL SUMMARY SECTION */}
                  {!page.isLastPage ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', background: '#FEF3C7', border: '1px solid #FDE68A', padding: '8px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, color: '#92400E', marginTop: '12px' }}>
                      <span>Page {page.pageNumber} Subtotal: <strong>₹{page.pageSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
                      <span>Cumulative Carried Forward to Page {page.pageNumber + 1} (C/F): <strong>₹{page.cumulativeSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
                    </div>
                  ) : (
                    <div>
                      {/* Summary Section Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginTop: '8px' }}>
                        {/* Left Column: Bank Details & HSN Table */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {/* Bank & Payment Card */}
                          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '12px 14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                  BANK REMITTANCE & NEFT/RTGS
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', marginTop: '3px' }}>
                                  {company.bankDetails.bankName} ({company.bankDetails.branchName})
                                </div>
                                <div style={{ fontSize: '11px', color: '#334155', marginTop: '2px' }}>
                                  Account No: <strong className="font-mono" style={{ color: '#0F172A' }}>{company.bankDetails.accountNumber}</strong>
                                </div>
                                <div style={{ fontSize: '11px', color: '#334155', marginTop: '1px' }}>
                                  IFSC Code: <strong className="font-mono" style={{ color: '#0F172A' }}>{company.bankDetails.ifscCode}</strong>
                                </div>
                              </div>

                              <div style={{ textAlign: 'center', paddingLeft: '12px', borderLeft: '1px solid #E2E8F0' }}>
                                <QrCode size={46} color="#0F172A" />
                                <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#475569', marginTop: '2px' }}>UPI Instant Pay</div>
                              </div>
                            </div>
                          </div>

                          {/* HSN Assessment Table */}
                          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 10px' }}>
                            <div style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                              HSN / SAC Tax Assessment Summary
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5px' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid #CBD5E1', color: '#475569' }}>
                                  <th style={{ textAlign: 'left', padding: '3px 0' }}>HSN</th>
                                  <th style={{ textAlign: 'right', padding: '3px 0' }}>Taxable Val</th>
                                  {isIntraState ? (
                                    <>
                                      <th style={{ textAlign: 'right', padding: '3px 0' }}>CGST</th>
                                      <th style={{ textAlign: 'right', padding: '3px 0' }}>SGST</th>
                                    </>
                                  ) : (
                                    <th style={{ textAlign: 'right', padding: '3px 0' }}>IGST</th>
                                  )}
                                  <th style={{ textAlign: 'right', padding: '3px 0', fontWeight: 800 }}>Total Tax</th>
                                </tr>
                              </thead>
                              <tbody>
                                {hsnSummary.map((h, i) => (
                                  <tr key={i} style={{ borderBottom: '1px solid #F1F5F9', color: '#1E293B' }}>
                                    <td style={{ fontFamily: 'monospace', padding: '3px 0' }}>{h.hsn} ({h.rate}%)</td>
                                    <td style={{ textAlign: 'right', fontFamily: 'monospace', padding: '3px 0' }}>₹{h.taxable.toFixed(2)}</td>
                                    {isIntraState ? (
                                      <>
                                        <td style={{ textAlign: 'right', fontFamily: 'monospace', padding: '3px 0' }}>₹{h.cgst.toFixed(2)}</td>
                                        <td style={{ textAlign: 'right', fontFamily: 'monospace', padding: '3px 0' }}>₹{h.sgst.toFixed(2)}</td>
                                      </>
                                    ) : (
                                      <td style={{ textAlign: 'right', fontFamily: 'monospace', padding: '3px 0' }}>₹{h.igst.toFixed(2)}</td>
                                    )}
                                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, padding: '3px 0', color: '#0F172A' }}>₹{h.total.toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Right Column: Financial Totals Card */}
                        <div style={{ background: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '8px', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
                            <span>Total Taxable Value:</span>
                            <span className="font-mono" style={{ fontWeight: 700, color: '#0F172A' }}>
                              ₹{activeInvoice.subtotalTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          {isIntraState ? (
                            <>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
                                <span>Output CGST (9%):</span>
                                <span className="font-mono" style={{ fontWeight: 700, color: '#0F172A' }}>
                                  ₹{activeInvoice.totalCGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
                                <span>Output SGST (9%):</span>
                                <span className="font-mono" style={{ fontWeight: 700, color: '#0F172A' }}>
                                  ₹{activeInvoice.totalSGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
                              <span>Output IGST (18%):</span>
                              <span className="font-mono" style={{ fontWeight: 700, color: '#0F172A' }}>
                                ₹{activeInvoice.totalIGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748B' }}>
                            <span>Round Off (±):</span>
                            <span className="font-mono">
                              {activeInvoice.roundOff >= 0 ? `+₹${activeInvoice.roundOff.toFixed(2)}` : `-₹${Math.abs(activeInvoice.roundOff).toFixed(2)}`}
                            </span>
                          </div>

                          {/* Grand Total Highlight */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0F172A', color: '#FFFFFF', padding: '10px 14px', borderRadius: '6px', marginTop: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Invoice Total:
                            </span>
                            <span className="font-mono" style={{ fontSize: '18px', fontWeight: 900, color: '#10B981' }}>
                              ₹{activeInvoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          {/* Amount in Words */}
                          <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', padding: '6px 10px', borderRadius: '4px', marginTop: '4px' }}>
                            <div style={{ fontSize: '9px', fontWeight: 700, color: '#92400E', textTransform: 'uppercase' }}>Amount in Words:</div>
                            <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#78350F', marginTop: '1px' }}>
                              {activeInvoice.amountInWords}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Terms & Conditions and Signature Section */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #CBD5E1', paddingTop: '12px', marginTop: '16px' }}>
                        {/* Terms */}
                        <div style={{ flex: 1, paddingRight: '20px' }}>
                          <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase' }}>
                            Terms & Conditions:
                          </div>
                          <div style={{ fontSize: '9px', color: '#475569', marginTop: '3px', lineHeight: '1.4' }}>
                            1. Goods once sold will not be taken back or exchanged.<br />
                            2. Interest @ 18% p.a. will be charged for bills delayed beyond credit terms.<br />
                            3. All disputes are subject to Hosur / Chennai Jurisdiction only.
                          </div>
                        </div>

                        {/* Signatory Box */}
                        <div style={{ width: '220px', textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', fontWeight: 800, color: '#0F172A' }}>
                            For {company.companyName}
                          </div>
                          <div style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '11px', fontStyle: 'italic', color: '#64748B', fontFamily: 'serif' }}>Digitally Signed by DSC</span>
                          </div>
                          <div style={{ borderTop: '1.5px solid #0F172A', paddingTop: '4px', fontSize: '10px', fontWeight: 800, color: '#0F172A' }}>
                            Authorised Signatory
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. FOOTER DIGITAL AUDIT TRAIL */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '8px', marginTop: '14px', fontSize: '8.5px', color: '#64748B' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={12} color="#10B981" />
                      <span>NIC GST E-Invoice IRN: <strong>8a4f9102c8172901a82b9910482019481726</strong> • Class 3 Digital Certificate Verified</span>
                    </div>
                    <div>
                      Page <strong>{page.pageNumber}</strong> of <strong>{page.totalPages}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
