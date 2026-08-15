import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, 
  ArrowLeft, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  FileText, 
  CheckCircle2, 
  Layers, 
  QrCode, 
  Building, 
  CreditCard,
  Scale
} from 'lucide-react';
import { FinalInvoiceData, BilledLineItem, CompanyVertical, CustomerParty } from '../../types/erp';
import { DMK_COMPANIES, MOCK_CUSTOMERS } from '../../data/multiCompanyData';
import { INITIAL_PLASTICS_CATALOG } from '../../data/plasticsCatalog';

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
  cumulativeSubtotal: number;
}

// Generates a mock invoice with arbitrary item count for testing multi-page layouts
const createMockInvoice = (itemCount: number): FinalInvoiceData => {
  const company = DMK_COMPANIES[0];
  const customer = MOCK_CUSTOMERS[0];
  const isIntraState = company.stateCode === customer.stateCode;
  
  const lineItems: BilledLineItem[] = [];
  for (let i = 0; i < itemCount; i++) {
    const prod = INITIAL_PLASTICS_CATALOG[i % INITIAL_PLASTICS_CATALOG.length];
    const qty = (i + 1) * 15;
    const price = prod.pricing.tier1_distributor;
    const taxable = qty * price;
    const gstRate = prod.gstRate || 18;
    const taxAmt = taxable * (gstRate / 100);

    lineItems.push({
      id: `mock-item-${i + 1}`,
      product: prod,
      selectedTier: 'tier1_distributor',
      unitPrice: price,
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
    invoiceNumber: `DPM/26-27/${Math.floor(1000 + Math.random() * 9000)}`,
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
    notes: 'Goods once sold will not be taken back. Subject to local Hosur / Chennai Jurisdiction.'
  };
};

export const DownloadableInvoiceViewer: React.FC<DownloadableInvoiceViewerProps> = ({
  invoiceData: initialInvoiceData,
  onBackToBilling
}) => {
  // Use passed invoice data or default to a standard 2-page sample if null
  const [activeInvoice, setActiveInvoice] = useState<FinalInvoiceData>(() => {
    return initialInvoiceData || createMockInvoice(10);
  });

  // Track active demo scenario
  const [demoPreset, setDemoPreset] = useState<'current' | 'single' | 'two_page' | 'three_page'>(
    initialInvoiceData ? 'current' : 'two_page'
  );

  // Zoom & Viewport Scale State
  const [zoomScale, setZoomScale] = useState<number>(0.85);
  const [fitMode, setFitMode] = useState<'fit_screen' | 'fit_width' | 'actual' | 'custom'>('fit_screen');
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronize when parent passes new invoice data
  useEffect(() => {
    if (initialInvoiceData) {
      setActiveInvoice(initialInvoiceData);
      setDemoPreset('current');
    }
  }, [initialInvoiceData]);

  // Compute responsive auto-fit scale
  const computeFitScale = (mode: 'fit_screen' | 'fit_width' | 'actual') => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = window.innerHeight - 200; // room for top bars
    
    // Standard A4 width in px at 96 DPI: 210mm = ~794px, height = ~1123px
    const a4WidthPx = 794;
    const a4HeightPx = 1123;

    if (mode === 'fit_screen') {
      const scaleX = (containerWidth - 48) / a4WidthPx;
      const scaleY = (containerHeight - 48) / a4HeightPx;
      const bestScale = Math.min(scaleX, scaleY, 1.05);
      setZoomScale(Math.max(0.45, Math.min(bestScale, 1.25)));
      setFitMode('fit_screen');
    } else if (mode === 'fit_width') {
      const scaleX = (containerWidth - 64) / a4WidthPx;
      setZoomScale(Math.max(0.5, Math.min(scaleX, 1.4)));
      setFitMode('fit_width');
    } else if (mode === 'actual') {
      setZoomScale(1.0);
      setFitMode('actual');
    }
  };

  // Auto-fit on initial render and on resize
  useEffect(() => {
    computeFitScale('fit_screen');
    const handleResize = () => {
      if (fitMode === 'fit_screen') computeFitScale('fit_screen');
      else if (fitMode === 'fit_width') computeFitScale('fit_width');
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitMode]);

  const handleZoomIn = () => {
    setZoomScale(prev => Math.min(prev + 0.1, 1.6));
    setFitMode('custom');
  };

  const handleZoomOut = () => {
    setZoomScale(prev => Math.max(prev - 0.1, 0.45));
    setFitMode('custom');
  };

  const handlePresetSwitch = (preset: 'single' | 'two_page' | 'three_page') => {
    setDemoPreset(preset);
    if (preset === 'single') setActiveInvoice(createMockInvoice(4));
    else if (preset === 'two_page') setActiveInvoice(createMockInvoice(10));
    else if (preset === 'three_page') setActiveInvoice(createMockInvoice(22));
  };

  const handlePrint = () => {
    window.print();
  };

  // Partition line items across A4 pages
  const partitionPages = (items: BilledLineItem[]): PagePartition[] => {
    const total = items.length;
    // Single page threshold
    if (total <= 6) {
      const subtotal = items.reduce((acc, it) => acc + it.taxableAmount, 0);
      return [{
        pageNumber: 1,
        totalPages: 1,
        items,
        startIndex: 0,
        isFirstPage: true,
        isLastPage: true,
        pageSubtotal: subtotal,
        cumulativeSubtotal: subtotal
      }];
    }

    // Multi-page splitting logic
    const pages: PagePartition[] = [];
    let remaining = [...items];
    let currentIndex = 0;
    let pageNum = 1;
    let runningTotal = 0;

    // Page 1 gets up to 8 items
    const p1Items = remaining.slice(0, 8);
    remaining = remaining.slice(8);
    const p1Sub = p1Items.reduce((acc, it) => acc + it.taxableAmount, 0);
    runningTotal += p1Sub;

    pages.push({
      pageNumber: 1,
      totalPages: 0,
      items: p1Items,
      startIndex: 0,
      isFirstPage: true,
      isLastPage: false,
      pageSubtotal: p1Sub,
      cumulativeSubtotal: runningTotal
    });
    currentIndex += p1Items.length;

    // Subsequent pages
    while (remaining.length > 0) {
      pageNum++;
      if (remaining.length <= 6) {
        // Fits comfortably on final page with complete tax summary and signatures
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
          cumulativeSubtotal: runningTotal
        });
        currentIndex += pItems.length;
      } else {
        // Intermediate page: take up to 10 items
        const countToTake = remaining.length <= 12 ? Math.max(remaining.length - 4, 6) : 10;
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
          cumulativeSubtotal: runningTotal
        });
        currentIndex += pItems.length;
      }
    }

    // Set totalPages
    const totalPages = pages.length;
    pages.forEach(p => { p.totalPages = totalPages; });
    return pages;
  };

  const { company, customer, lineItems } = activeInvoice;
  const isIntraState = company.stateCode === customer.stateCode;
  const pages = partitionPages(lineItems);

  return (
    <div className="invoice-preview-wrapper" ref={containerRef}>
      {/* Top Action & Viewport Controls Bar (Hidden during print) */}
      <div 
        className="glass-panel no-print"
        style={{
          width: '100%',
          padding: '12px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '14px',
          marginBottom: '16px',
          position: 'sticky',
          top: '12px',
          zIndex: 30
        }}
      >
        {/* Navigation & Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={onBackToBilling} 
            className="btn-secondary" 
            style={{ padding: '7px 14px', fontSize: '12px' }}
          >
            <ArrowLeft size={14} />
            <span>Back to Billing</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="status-pill status-pill-orange" style={{ fontSize: '11px' }}>
              <FileText size={12} />
              <span>A4 GST TAX INVOICE</span>
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Total: <strong style={{ color: '#FFF' }}>{pages.length} Page{pages.length > 1 ? 's' : ''}</strong> ({lineItems.length} items)
            </span>
          </div>
        </div>

        {/* Multi-Page Scenario Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-primary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', padding: '0 6px', fontWeight: 700 }}>
            TEST DEMO:
          </span>
          <button
            onClick={() => handlePresetSwitch('single')}
            className={demoPreset === 'single' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '4px 10px', fontSize: '11px' }}
            title="Preview standard 1-page invoice with 4 items"
          >
            1 Page (4 items)
          </button>
          <button
            onClick={() => handlePresetSwitch('two_page')}
            className={demoPreset === 'two_page' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '4px 10px', fontSize: '11px' }}
            title="Preview 2-page invoice spanning across pages with 10 items"
          >
            2 Pages (10 items)
          </button>
          <button
            onClick={() => handlePresetSwitch('three_page')}
            className={demoPreset === 'three_page' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '4px 10px', fontSize: '11px' }}
            title="Preview multi-page bulk enterprise invoice with 22 items"
          >
            3 Pages (22 items)
          </button>
        </div>

        {/* Viewport Zoom & Fit Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-subtle)', padding: '2px' }}>
            <button
              onClick={() => computeFitScale('fit_screen')}
              style={{
                background: fitMode === 'fit_screen' ? 'var(--accent-orange)' : 'transparent',
                color: fitMode === 'fit_screen' ? '#FFF' : 'var(--text-secondary)',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Fit entire A4 sheet to screen height & width"
            >
              <Maximize2 size={12} />
              <span>Fit Screen</span>
            </button>
            
            <button
              onClick={() => computeFitScale('fit_width')}
              style={{
                background: fitMode === 'fit_width' ? 'var(--accent-orange)' : 'transparent',
                color: fitMode === 'fit_width' ? '#FFF' : 'var(--text-secondary)',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Scale A4 sheet to fit container width"
            >
              Fit Width
            </button>

            <button
              onClick={() => computeFitScale('actual')}
              style={{
                background: fitMode === 'actual' ? 'var(--accent-orange)' : 'transparent',
                color: fitMode === 'actual' ? '#FFF' : 'var(--text-secondary)',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="View at 100% standard A4 scale"
            >
              100%
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button 
              onClick={handleZoomOut} 
              className="btn-secondary" 
              style={{ padding: '6px 8px' }}
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <span style={{ fontSize: '11px', fontWeight: 700, minWidth: '42px', textAlign: 'center', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
              {Math.round(zoomScale * 100)}%
            </span>
            <button 
              onClick={handleZoomIn} 
              className="btn-secondary" 
              style={{ padding: '6px 8px' }}
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          {/* Dedicated Print Button */}
          <button 
            onClick={handlePrint} 
            className="btn-primary" 
            style={{ padding: '8px 18px', fontSize: '13px' }}
            title="Prints strictly only the A4 invoice sheets with standard margins"
          >
            <Printer size={16} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* A4 Document Viewport Container */}
      <div className="a4-viewport-container">
        <div 
          className="a4-pages-stack"
          style={{
            transform: `scale(${zoomScale})`,
            marginBottom: `${(zoomScale - 1) * 1123 * pages.length}px` // preserve layout height on scale
          }}
          id="printable-invoice"
        >
          {pages.map((page) => {
            return (
              <div 
                key={`page-${page.pageNumber}`} 
                className="a4-page"
                id={`a4-page-${page.pageNumber}`}
              >
                {/* On-Screen Page Pill Indicator (Hidden in print) */}
                <div className="a4-page-header-pill no-print">
                  <span>A4 SHEET (210 × 297 mm)</span>
                  <span>•</span>
                  <span>PAGE {page.pageNumber} OF {page.totalPages}</span>
                </div>

                {/* ========================================================= */}
                {/* TOP SECTION: HEADER                                        */}
                {/* ========================================================= */}
                {page.isFirstPage ? (
                  /* --- FULL HEADER (PAGE 1) --- */
                  <div>
                    {/* Header Top Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #FF6B00', paddingBottom: '8px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#FF6B00', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '16px' }}>
                          {company.shortName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', fontWeight: 800, color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            TAX INVOICE (RULE 46 OF CGST RULES, 2017)
                          </div>
                          <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#111827', margin: '1px 0 0 0', lineHeight: 1.2 }}>
                            {company.companyName}
                          </h1>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '9px', fontWeight: 800, background: '#F3F4F6', color: '#374151', padding: '3px 8px', borderRadius: '4px', border: '1px solid #D1D5DB', letterSpacing: '0.05em' }}>
                          ORIGINAL FOR RECIPIENT
                        </span>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#111827', marginTop: '3px' }}>
                          GSTIN: <strong style={{ color: '#FF6B00' }}>{company.gstin}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Company Address & Contact */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#4B5563', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px', marginBottom: '10px' }}>
                      <div>
                        {company.registeredAddress}
                      </div>
                      <div>
                        State: <strong>Tamil Nadu (Code: {company.stateCode})</strong> • Phone: {company.contactPhone}
                      </div>
                    </div>

                    {/* Receiver (Billed To) & Invoice Meta Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', borderBottom: '1px solid #E5E7EB', paddingBottom: '10px', marginBottom: '10px' }}>
                      {/* Buyer Details */}
                      <div style={{ borderRight: '1px solid #E5E7EB', paddingRight: '12px' }}>
                        <div style={{ fontSize: '9px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
                          DETAILS OF RECEIVER / BILLED TO:
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#111827' }}>
                          {customer.partyName}
                        </div>
                        <div style={{ fontSize: '10px', color: '#4B5563', marginTop: '2px' }}>
                          {customer.city}, State Code: <strong>{customer.stateCode}</strong>
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#111827', marginTop: '3px' }}>
                          GSTIN / UIN: <span style={{ fontFamily: 'monospace', color: customer.gstin ? '#111827' : '#6B7280' }}>{customer.gstin || 'Unregistered Consumer'}</span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#4B5563' }}>
                          Contact Phone: {customer.phone}
                        </div>
                      </div>

                      {/* Invoice Metadata */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10.5px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#6B7280' }}>Invoice Number:</span>
                          <strong style={{ fontFamily: 'monospace', fontSize: '12px', color: '#FF6B00' }}>{activeInvoice.invoiceNumber}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#6B7280' }}>Invoice Date:</span>
                          <strong style={{ fontFamily: 'monospace' }}>{activeInvoice.invoiceDate}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#6B7280' }}>Place of Supply:</span>
                          <strong>State Code {customer.stateCode} ({isIntraState ? 'Intra-State' : 'Inter-State'})</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#6B7280' }}>Payment Terms:</span>
                          <strong>{activeInvoice.paymentMode.replace(/_/g, ' ')}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#6B7280' }}>Reverse Charge:</span>
                          <strong>NO</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* --- CONTINUATION HEADER (PAGES 2+) --- */
                  <div style={{ borderBottom: '2px solid #FF6B00', paddingBottom: '8px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '9px', fontWeight: 800, color: '#6B7280', letterSpacing: '0.08em' }}>
                          TAX INVOICE CONTINUATION SHEET
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>
                          {company.companyName}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', fontSize: '10px' }}>
                        <div>Invoice No: <strong style={{ fontFamily: 'monospace', color: '#FF6B00' }}>{activeInvoice.invoiceNumber}</strong></div>
                        <div style={{ color: '#6B7280' }}>Date: {activeInvoice.invoiceDate} • <strong>Page {page.pageNumber} of {page.totalPages}</strong></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* MIDDLE SECTION: LINE ITEMS TABLE                          */}
                {/* ========================================================= */}
                <div style={{ flex: 1 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginBottom: '8px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F3F4F6', borderTop: '1px solid #E5E7EB', borderBottom: '2px solid #D1D5DB' }}>
                        <th style={{ padding: '6px 4px', textAlign: 'left', width: '24px', fontWeight: 800, color: '#374151' }}>#</th>
                        <th style={{ padding: '6px 6px', textAlign: 'left', fontWeight: 800, color: '#374151' }}>Description of Goods (Plastic)</th>
                        <th style={{ padding: '6px 4px', textAlign: 'center', width: '65px', fontWeight: 800, color: '#374151' }}>HSN/SAC</th>
                        <th style={{ padding: '6px 4px', textAlign: 'center', width: '38px', fontWeight: 800, color: '#374151' }}>Qty</th>
                        <th style={{ padding: '6px 4px', textAlign: 'center', width: '36px', fontWeight: 800, color: '#374151' }}>UOM</th>
                        <th style={{ padding: '6px 6px', textAlign: 'right', width: '60px', fontWeight: 800, color: '#374151' }}>Rate (₹)</th>
                        <th style={{ padding: '6px 6px', textAlign: 'right', width: '70px', fontWeight: 800, color: '#374151' }}>Taxable (₹)</th>
                        <th style={{ padding: '6px 4px', textAlign: 'center', width: '45px', fontWeight: 800, color: '#374151' }}>GST %</th>
                        <th style={{ padding: '6px 6px', textAlign: 'right', width: '75px', fontWeight: 800, color: '#374151' }}>Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {page.items.map((item, idx) => {
                        const globalIndex = page.startIndex + idx + 1;
                        return (
                          <tr 
                            key={item.id} 
                            style={{ 
                              borderBottom: '1px solid #E5E7EB',
                              backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB'
                            }}
                          >
                            <td style={{ padding: '6px 4px', textAlign: 'left', color: '#6B7280', fontWeight: 600 }}>{globalIndex}</td>
                            <td style={{ padding: '6px 6px', textAlign: 'left' }}>
                              <div style={{ fontWeight: 700, color: '#111827', fontSize: '10.5px' }}>{item.product.name}</div>
                              <div style={{ fontSize: '9px', color: '#6B7280' }}>
                                SKU: {item.product.sku} • Tier: {item.selectedTier.replace('tier', 'T')}
                              </div>
                            </td>
                            <td style={{ padding: '6px 4px', textAlign: 'center', fontFamily: 'monospace', fontSize: '9.5px' }}>{item.product.hsnCode}</td>
                            <td style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                            <td style={{ padding: '6px 4px', textAlign: 'center', color: '#4B5563' }}>{item.unitOfMeasure}</td>
                            <td style={{ padding: '6px 6px', textAlign: 'right', fontFamily: 'monospace' }}>₹{item.unitPrice.toFixed(2)}</td>
                            <td style={{ padding: '6px 6px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>₹{item.taxableAmount.toFixed(2)}</td>
                            <td style={{ padding: '6px 4px', textAlign: 'center', color: '#4B5563' }}>{item.gstRate}%</td>
                            <td style={{ padding: '6px 6px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, color: '#111827' }}>
                              ₹{item.totalAmount.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Multi-Page Continuity Indicators */}
                  {!page.isLastPage && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      background: '#F3F4F6', 
                      border: '1px dashed #D1D5DB', 
                      padding: '6px 12px', 
                      borderRadius: '4px', 
                      fontSize: '10px', 
                      marginTop: '6px' 
                    }}>
                      <span style={{ color: '#4B5563', fontWeight: 600 }}>
                        Page {page.pageNumber} Subtotal ({page.items.length} items):
                      </span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#111827' }}>
                        ₹{page.pageSubtotal.toFixed(2)} (Taxable)
                      </span>
                      <span style={{ color: '#FF6B00', fontWeight: 700, fontStyle: 'italic' }}>
                        ...Continued on Page {page.pageNumber + 1} ➔
                      </span>
                    </div>
                  )}
                </div>

                {/* ========================================================= */}
                {/* BOTTOM SECTION: TAX TOTALS, BANK & SIGNATURES (FINAL PAGE) */}
                {/* ========================================================= */}
                {page.isLastPage && (
                  <div className="avoid-break" style={{ marginTop: 'auto', paddingTop: '8px' }}>
                    {/* Calculation & Bank Split Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', borderTop: '2px solid #E5E7EB', paddingTop: '10px' }}>
                      {/* Bank Details & Amount in Words */}
                      <div style={{ fontSize: '9.5px', color: '#374151', background: '#F9FAFB', padding: '10px', borderRadius: '4px', border: '1px solid #E5E7EB' }}>
                        <div style={{ fontWeight: 800, color: '#111827', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Building size={11} color="#FF6B00" />
                          <span>BANK PAYMENT DETAILS (NEFT / RTGS / IMPS):</span>
                        </div>
                        <div>Bank Name: <strong>{company.bankDetails.bankName}</strong></div>
                        <div>Account Number: <strong style={{ fontFamily: 'monospace' }}>{company.bankDetails.accountNumber}</strong></div>
                        <div>IFSC Code: <strong style={{ fontFamily: 'monospace' }}>{company.bankDetails.ifscCode}</strong></div>
                        <div>Branch: {company.bankDetails.branchName}</div>
                        <div style={{ marginTop: '6px', color: '#111827', fontSize: '9.5px', borderTop: '1px dashed #D1D5DB', paddingTop: '4px' }}>
                          Amount in Words: <strong style={{ textTransform: 'capitalize' }}>{activeInvoice.amountInWords}</strong>
                        </div>
                      </div>

                      {/* Tax Breakdown & Grand Total */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10.5px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#4B5563' }}>Taxable Value:</span>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>₹{activeInvoice.subtotalTaxable.toFixed(2)}</span>
                        </div>

                        {isIntraState ? (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#4B5563' }}>Central Tax (CGST):</span>
                              <span style={{ fontFamily: 'monospace' }}>₹{activeInvoice.totalCGST.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#4B5563' }}>State Tax (SGST):</span>
                              <span style={{ fontFamily: 'monospace' }}>₹{activeInvoice.totalSGST.toFixed(2)}</span>
                            </div>
                          </>
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#4B5563' }}>Integrated Tax (IGST):</span>
                            <span style={{ fontFamily: 'monospace' }}>₹{activeInvoice.totalIGST.toFixed(2)}</span>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280', fontSize: '9.5px' }}>
                          <span>Round Off:</span>
                          <span style={{ fontFamily: 'monospace' }}>₹{activeInvoice.roundOff.toFixed(2)}</span>
                        </div>

                        <div style={{ borderTop: '2px solid #111827', paddingTop: '4px', marginTop: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 900 }}>TOTAL INVOICE VALUE:</span>
                          <span style={{ fontSize: '16px', fontWeight: 900, color: '#FF6B00', fontFamily: 'monospace' }}>
                            ₹{activeInvoice.grandTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Declaration & Signatory Block */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #E5E7EB' }}>
                      <div style={{ fontSize: '9px', color: '#6B7280', lineHeight: 1.3 }}>
                        <strong>Terms & Conditions:</strong>
                        <div>1. Goods once sold will not be taken back or exchanged.</div>
                        <div>2. Payment is due strictly according to specified payment terms.</div>
                        <div>3. We declare that this invoice shows the actual price of the plastic goods described and that all particulars are true and correct.</div>
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#111827' }}>
                          For {company.companyName}
                        </div>
                        <div style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '8px', color: '#9CA3AF', fontStyle: 'italic' }}>[Digitally Authenticated]</span>
                        </div>
                        <div style={{ fontSize: '9.5px', borderTop: '1px solid #111827', paddingTop: '2px', fontWeight: 700 }}>
                          Authorized Signatory
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* PAGE FOOTER (EVERY PAGE)                                  */}
                {/* ========================================================= */}
                <div style={{ 
                  borderTop: '1px solid #E5E7EB', 
                  paddingTop: '6px', 
                  marginTop: '8px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  fontSize: '8.5px', 
                  color: '#9CA3AF' 
                }}>
                  <div>
                    This is a Computer Generated Tax Invoice • Powered by Algolsoft Enterprise ERP
                  </div>
                  <div style={{ fontWeight: 700, color: '#4B5563' }}>
                    Page {page.pageNumber} of {page.totalPages}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
