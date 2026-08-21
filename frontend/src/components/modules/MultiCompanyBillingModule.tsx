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
  Minus,
  User,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  PlasticProductItem, 
  PricingTierKey, 
  CompanyVertical, 
  CustomerParty, 
  BilledLineItem, 
  FinalInvoiceData,
  SalesReturn,
  SalesReturnItem,
  DamageDefectType
} from '../../types/erp';
import { useERPData } from '../../context/ERPContext';
import { formatDate, formatFullDate, getTodayISODate } from '../../utils/dateUtils';

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
    counterCustomers,
    addFastOrderBill, 
    addCustomer: addGlobalCustomer,
    addCounterCustomer,
    createSalesReturn,
    calculateBulkPricing
  } = useERPData();

  // Mode: B2B Enterprise Invoicing vs B2C Walk-in Counter Sales
  const [billingMode, setBillingMode] = useState<'B2B' | 'B2C_COUNTER'>('B2B');

  // Customer Selection (B2B)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || 'cust-01');
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  // B2C Walk-in Customer Selection
  const [counterSearchQuery, setCounterSearchQuery] = useState('');
  const [selectedCounterBuyer, setSelectedCounterBuyer] = useState<{ name: string; phone: string; city: string } | null>(null);
  const [showCounterBuyerDropdown, setShowCounterBuyerDropdown] = useState(false);

  // Quick Add B2C Customer Modal
  const [showAddCounterModal, setShowAddCounterModal] = useState(false);
  const [newCounterName, setNewCounterName] = useState('');
  const [newCounterPhone, setNewCounterPhone] = useState('');
  const [newCounterCity, setNewCounterCity] = useState('Local');

  // Sales Return (Damaged Goods) Modal
  const [showSalesReturnModal, setShowSalesReturnModal] = useState(false);
  const [srCustomerId, setSrCustomerId] = useState(customers[0]?.id || 'cust-01');
  const [srInvoiceRef, setSrInvoiceRef] = useState('DMK/26-27/4010');
  const [srDamageType, setSrDamageType] = useState<DamageDefectType>('CRACKED');
  const [srNotes, setSrNotes] = useState('Defective item returned by customer; quarantined to damaged stock');
  const [srLines, setSrLines] = useState<Array<{
    productId: string;
    productSku: string;
    productName: string;
    damagedQuantity: number;
    unitPrice: number;
    gstRate: number;
  }>>([
    {
      productId: catalog[0]?.id || 'p-01',
      productSku: catalog[0]?.sku || 'DMK-CHR-ROYAL',
      productName: catalog[0]?.name || 'DMK Royal High-Back Arm Chair',
      damagedQuantity: 2,
      unitPrice: catalog[0]?.pricing.tier2_wholesale || 420.00,
      gstRate: catalog[0]?.gstRate || 18
    }
  ]);

  // Invoice Metadata
  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    `${activeCompany.invoicePrefix}${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [invoiceDate, setInvoiceDate] = useState<string>(getTodayISODate());
  const [paymentMode, setPaymentMode] = useState<'CREDIT_30_DAYS' | 'CASH' | 'NEFT_RTGS' | 'UPI'>(
    billingMode === 'B2B' ? 'CREDIT_30_DAYS' : 'CASH'
  );

  // Customer Modal State (B2B)
  const [showAddCustomerModal, setShowAddCustomerModal] = useState<boolean>(false);
  const [newCustCity, setNewCustCity] = useState<string>('Latur');
  const [newCustRawName, setNewCustRawName] = useState<string>('');
  const [newCustGstin, setNewCustGstin] = useState<string>('');
  const [newCustStateCode, setNewCustStateCode] = useState<string>('27');
  const [newCustPhone, setNewCustPhone] = useState<string>('');
  const [newCustTier, setNewCustTier] = useState<PricingTierKey>('tier2_wholesale');
  const [newCustOpeningBal, setNewCustOpeningBal] = useState<number>(0);
  const [newCustCreditLimit, setNewCustCreditLimit] = useState<number>(250000);

  // Type-ahead product search state
  const [typeaheadQuery, setTypeaheadQuery] = useState<string>('');
  const [showTypeaheadDropdown, setShowTypeaheadDropdown] = useState<boolean>(false);

  // Initial Billed Lines
  const defaultTier: PricingTierKey = billingMode === 'B2B' ? (selectedCustomer?.assignedTier || 'tier2_wholesale') : 'tier5_mrp';
  const initBulk = calculateBulkPricing(catalog[0], defaultTier, 50);

  const [lines, setLines] = useState<BilledLineItem[]>([
    {
      id: '1',
      product: catalog[0],
      selectedTier: defaultTier,
      packagingFormat: initBulk.packagingFormat,
      unitPrice: initBulk.unitPrice,
      baseTierPrice: initBulk.baseTierPrice,
      bulkDiscountPct: initBulk.bulkDiscountPct,
      bulkSavingsRupees: initBulk.bulkSavingsRupees,
      quantity: 50,
      unitOfMeasure: catalog[0].unitOfMeasure,
      discountPct: 0,
      taxableAmount: initBulk.unitPrice * 50,
      gstRate: catalog[0].gstRate,
      cgstAmount: (initBulk.unitPrice * 50 * (catalog[0].gstRate / 100)) / 2,
      sgstAmount: (initBulk.unitPrice * 50 * (catalog[0].gstRate / 100)) / 2,
      igstAmount: 0,
      totalAmount: (initBulk.unitPrice * 50) * (1 + catalog[0].gstRate / 100)
    }
  ]);

  // Update payment mode default on mode change
  useEffect(() => {
    if (billingMode === 'B2C_COUNTER') {
      setPaymentMode('CASH');
    } else {
      setPaymentMode('CREDIT_30_DAYS');
    }
  }, [billingMode]);

  // Filtered Counter Buyers
  const filteredCounterBuyers = useMemo(() => {
    const q = counterSearchQuery.toLowerCase();
    if (!q) return counterCustomers;
    return counterCustomers.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.phone.includes(q) || 
      c.city.toLowerCase().includes(q)
    );
  }, [counterCustomers, counterSearchQuery]);

  // Calculations
  const calculations = useMemo(() => {
    let subtotalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let totalBulkSavings = 0;

    const isIntraState = selectedCustomer.stateCode === activeCompany.stateCode || billingMode === 'B2C_COUNTER';

    lines.forEach(line => {
      subtotalTaxable += line.taxableAmount;
      totalBulkSavings += (line.bulkSavingsRupees || 0);
      
      const lineGst = line.taxableAmount * (line.gstRate / 100);
      if (isIntraState) {
        totalCGST += lineGst / 2;
        totalSGST += lineGst / 2;
      } else {
        totalIGST += lineGst;
      }
    });

    const rawGrandTotal = subtotalTaxable + totalCGST + totalSGST + totalIGST;
    const grandTotal = Math.round(rawGrandTotal);
    const roundOff = Number((grandTotal - rawGrandTotal).toFixed(2));

    return {
      subtotalTaxable,
      totalCGST,
      totalSGST,
      totalIGST,
      totalBulkSavings,
      roundOff,
      grandTotal
    };
  }, [lines, selectedCustomer, activeCompany, billingMode]);

  // Update line quantity and recalculate volume-based bulk discount automatically
  const handleQuantityChange = (lineId: string, qty: number) => {
    const validQty = Math.max(1, qty);
    setLines(prev => prev.map(line => {
      if (line.id === lineId) {
        const bulk = calculateBulkPricing(line.product, line.selectedTier, validQty);
        const taxableAmount = bulk.unitPrice * validQty * (1 - line.discountPct / 100);
        const gstTotal = taxableAmount * (line.gstRate / 100);
        const isIntraState = selectedCustomer.stateCode === activeCompany.stateCode || billingMode === 'B2C_COUNTER';

        return {
          ...line,
          quantity: validQty,
          packagingFormat: bulk.packagingFormat,
          unitPrice: bulk.unitPrice,
          baseTierPrice: bulk.baseTierPrice,
          bulkDiscountPct: bulk.bulkDiscountPct,
          bulkSavingsRupees: bulk.bulkSavingsRupees,
          taxableAmount,
          cgstAmount: isIntraState ? gstTotal / 2 : 0,
          sgstAmount: isIntraState ? gstTotal / 2 : 0,
          igstAmount: !isIntraState ? gstTotal : 0,
          totalAmount: taxableAmount + gstTotal
        };
      }
      return line;
    }));
  };

  // Change Tier
  const handleTierChange = (lineId: string, tier: PricingTierKey) => {
    setLines(prev => prev.map(line => {
      if (line.id === lineId) {
        const bulk = calculateBulkPricing(line.product, tier, line.quantity);
        const taxableAmount = bulk.unitPrice * line.quantity * (1 - line.discountPct / 100);
        const gstTotal = taxableAmount * (line.gstRate / 100);
        const isIntraState = selectedCustomer.stateCode === activeCompany.stateCode || billingMode === 'B2C_COUNTER';

        return {
          ...line,
          selectedTier: tier,
          packagingFormat: bulk.packagingFormat,
          unitPrice: bulk.unitPrice,
          baseTierPrice: bulk.baseTierPrice,
          bulkDiscountPct: bulk.bulkDiscountPct,
          bulkSavingsRupees: bulk.bulkSavingsRupees,
          taxableAmount,
          cgstAmount: isIntraState ? gstTotal / 2 : 0,
          sgstAmount: isIntraState ? gstTotal / 2 : 0,
          igstAmount: !isIntraState ? gstTotal : 0,
          totalAmount: taxableAmount + gstTotal
        };
      }
      return line;
    }));
  };

  // Add Product from Typeahead
  const handleAddProductToCart = (prod: PlasticProductItem) => {
    const tier: PricingTierKey = billingMode === 'B2B' ? (selectedCustomer.assignedTier || 'tier2_wholesale') : 'tier5_mrp';
    const bulk = calculateBulkPricing(prod, tier, 10);
    const taxableAmount = bulk.unitPrice * 10;
    const gstTotal = taxableAmount * (prod.gstRate / 100);
    const isIntraState = selectedCustomer.stateCode === activeCompany.stateCode || billingMode === 'B2C_COUNTER';

    const newLine: BilledLineItem = {
      id: `line-${Date.now()}`,
      product: prod,
      selectedTier: tier,
      packagingFormat: bulk.packagingFormat,
      unitPrice: bulk.unitPrice,
      baseTierPrice: bulk.baseTierPrice,
      bulkDiscountPct: bulk.bulkDiscountPct,
      bulkSavingsRupees: bulk.bulkSavingsRupees,
      quantity: 10,
      unitOfMeasure: prod.unitOfMeasure,
      discountPct: 0,
      taxableAmount,
      gstRate: prod.gstRate,
      cgstAmount: isIntraState ? gstTotal / 2 : 0,
      sgstAmount: isIntraState ? gstTotal / 2 : 0,
      igstAmount: !isIntraState ? gstTotal : 0,
      totalAmount: taxableAmount + gstTotal
    };

    setLines(prev => [newLine, ...prev]);
    setTypeaheadQuery('');
    setShowTypeaheadDropdown(false);
  };

  // Save Final Invoice
  const handleGenerateInvoice = (isPrint: boolean = false) => {
    if (lines.length === 0) return;

    const invoiceData: FinalInvoiceData = {
      invoiceNumber,
      invoiceDate,
      company: activeCompany,
      customer: billingMode === 'B2B' ? selectedCustomer : {
        id: 'cust-08',
        partyName: selectedCounterBuyer ? `${selectedCounterBuyer.city} ${selectedCounterBuyer.name}` : 'B2C Walk-In Counter Sales',
        rawFirmName: selectedCounterBuyer?.name || 'Retail Counter Sales (General)',
        city: selectedCounterBuyer?.city || 'Counter',
        stateCode: activeCompany.stateCode,
        phone: selectedCounterBuyer?.phone || '9999900000',
        partyType: 'B2C_COUNTER_WALKIN',
        assignedTier: 'tier5_mrp',
        openingBalance: 0,
        closingBalance: 0,
        balanceType: 'Cr',
        creditLimit: 0,
        creditDays: 0
      },
      lineItems: lines,
      subtotalTaxable: calculations.subtotalTaxable,
      totalCGST: calculations.totalCGST,
      totalSGST: calculations.totalSGST,
      totalIGST: calculations.totalIGST,
      roundOff: calculations.roundOff,
      grandTotal: calculations.grandTotal,
      amountInWords: `Rupees ${calculations.grandTotal.toLocaleString('en-IN')} Only`,
      paymentMode,
      notes: billingMode === 'B2B' ? 'Payment due as per agreed credit terms.' : 'B2C Counter Retail Cash Settlement.',
      isCounterSale: billingMode === 'B2C_COUNTER',
      walkInCustomerDetails: selectedCounterBuyer || undefined
    };

    // Fast order bill records to accounting, updates stock, updates customer ledger
    addFastOrderBill(invoiceData);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });

    if (isPrint) {
      window.print();
    } else {
      onViewInvoice(invoiceData);
    }
  };

  // Quick Add B2C Customer
  const handleSaveCounterBuyer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCounterName || !newCounterPhone) return;

    const created = addCounterCustomer({
      name: newCounterName,
      phone: newCounterPhone,
      city: newCounterCity
    });

    setSelectedCounterBuyer({
      name: created.name,
      phone: created.phone,
      city: created.city
    });
    setCounterSearchQuery(`${created.name} (+91 ${created.phone})`);
    setShowAddCounterModal(false);
    setNewCounterName('');
    setNewCounterPhone('');
  };

  // Handle B2B Location-First Customer Creation
  const handleSaveB2BCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustRawName || !newCustCity) return;

    const formattedPartyName = `${newCustCity} ${newCustRawName}`;

    const newCust: CustomerParty = {
      id: `cust-${Date.now()}`,
      partyName: formattedPartyName, // Location-First format
      rawFirmName: newCustRawName,
      city: newCustCity,
      stateCode: newCustStateCode,
      gstin: newCustGstin,
      phone: newCustPhone,
      partyType: 'B2B_WHOLESALER',
      assignedTier: newCustTier,
      openingBalance: newCustOpeningBal,
      closingBalance: newCustOpeningBal,
      balanceType: 'Dr',
      creditLimit: newCustCreditLimit,
      creditDays: 30
    };

    addGlobalCustomer(newCust);
    setSelectedCustomerId(newCust.id);
    setShowAddCustomerModal(false);
    setNewCustRawName('');
    setNewCustGstin('');
    setNewCustPhone('');
  };

  // Handle Sales Return (Damaged/Broken Customer Return)
  const handleSaveSalesReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === srCustomerId) || customers[0];
    if (!cust || srLines.length === 0) return;

    let grandTotal = 0;
    const lineItems: SalesReturnItem[] = srLines.map((line, idx) => {
      const total = line.damagedQuantity * line.unitPrice * (1 + line.gstRate / 100);
      grandTotal += total;
      return {
        id: `sri-${Date.now()}-${idx}`,
        productId: line.productId,
        productSku: line.productSku,
        productName: line.productName,
        damagedQuantity: line.damagedQuantity,
        unitPrice: line.unitPrice,
        gstRate: line.gstRate,
        totalAmount: total,
        damageType: srDamageType,
        notes: srNotes
      };
    });

    const srPayload: SalesReturn = {
      id: `sr-${Date.now()}`,
      creditNoteNumber: `CN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceRefNumber: srInvoiceRef,
      customerId: cust.id,
      customerName: cust.partyName,
      returnDate: getTodayISODate(),
      lineItems,
      grandTotal,
      status: 'POSTED',
      refundMode: 'CREDIT_TO_LEDGER',
      notes: srNotes
    };

    createSalesReturn(srPayload);
    setShowSalesReturnModal(false);
    confetti({ particleCount: 45, spread: 60 });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Header Card */}
      <div 
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          padding: '22px 24px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(255, 107, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-orange)'
              }}
            >
              <Receipt size={20} />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Fast Billing & Invoicing Terminal
            </h1>
            <span 
              style={{
                background: billingMode === 'B2B' ? 'rgba(2, 132, 199, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: billingMode === 'B2B' ? '#38BDF8' : '#10B981',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                border: `1px solid ${billingMode === 'B2B' ? 'rgba(2, 132, 199, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
              }}
            >
              {billingMode === 'B2B' ? '🏢 B2B WHOLESALE & LOCATION-FIRST' : '🛒 B2C COUNTER CASH RETAIL'}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
            Autocomplete product search, automatic volume/bulk quantity discounts (Packets, Sets, Crates), multi-tier pricing, and live ledger synchronization.
          </p>
        </div>

        {/* Mode Switcher & Quick Sales Return */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Mode Toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-medium)' }}>
            <button
              onClick={() => setBillingMode('B2B')}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                background: billingMode === 'B2B' ? 'var(--accent-orange)' : 'transparent',
                color: billingMode === 'B2B' ? '#FFF' : 'var(--text-secondary)'
              }}
            >
              🏢 B2B Invoicing
            </button>
            <button
              onClick={() => setBillingMode('B2C_COUNTER')}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                background: billingMode === 'B2C_COUNTER' ? 'var(--accent-orange)' : 'transparent',
                color: billingMode === 'B2C_COUNTER' ? '#FFF' : 'var(--text-secondary)'
              }}
            >
              🛒 B2C Counter Sales
            </button>
          </div>

          <button
            onClick={() => setShowSalesReturnModal(true)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#EF4444',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={16} /> Sales Return (Broken Goods)
          </button>
        </div>
      </div>

      {/* Main Billing Canvas Grid */}
      <div className="responsive-billing-grid">
        
        {/* Left Column: Customer Details, Product Search & Line Items */}
        <div className="billing-left-col">
          
          {/* Customer / Buyer Selection Card */}
          <div style={{ background: 'var(--bg-secondary)', padding: '18px 20px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            
            {billingMode === 'B2B' ? (
              // B2B Customer Selector (Location-First format)
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={16} color="var(--accent-orange)" />
                    B2B Client Account (Location-First) *
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowAddCustomerModal(true)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent-orange)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <UserPlus size={14} /> + Add B2B Client
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', alignItems: 'center' }}>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.partyName} (City: {c.city}) — Bal: ₹{c.closingBalance.toLocaleString('en-IN')} (Dr)
                      </option>
                    ))}
                  </select>

                  <div 
                    style={{
                      background: 'var(--bg-tertiary)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      textAlign: 'right',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Current Outstanding Bal</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
                      ₹{selectedCustomer.closingBalance.toLocaleString('en-IN')} (Dr)
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // B2C Walk-In Counter Customer Selector (Phone / Name Search with 1-Click Quick Add)
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={16} color="#10B981" />
                    B2C Walk-in Buyer Search (Mobile / Name) *
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowAddCounterModal(true)}
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      color: '#10B981',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Plus size={14} /> + Create New Walk-in Customer
                  </button>
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search by Mobile # (e.g. 98234) or Customer Name..."
                    value={counterSearchQuery}
                    onFocus={() => setShowCounterBuyerDropdown(true)}
                    onChange={(e) => {
                      setCounterSearchQuery(e.target.value);
                      setShowCounterBuyerDropdown(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)',
                      fontSize: '13px'
                    }}
                  />

                  {showCounterBuyerDropdown && filteredCounterBuyers.length > 0 && (
                    <div 
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'var(--bg-tertiary)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-medium)',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 100,
                        maxHeight: '220px',
                        overflowY: 'auto',
                        marginTop: '4px'
                      }}
                    >
                      {filteredCounterBuyers.map(buyer => (
                        <div
                          key={buyer.id}
                          onClick={() => {
                            setSelectedCounterBuyer({ name: buyer.name, phone: buyer.phone, city: buyer.city });
                            setCounterSearchQuery(`${buyer.name} (+91 ${buyer.phone}) - ${buyer.city}`);
                            setShowCounterBuyerDropdown(false);
                          }}
                          style={{
                            padding: '10px 14px',
                            borderBottom: '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>{buyer.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>📱 +91 {buyer.phone} • City: {buyer.city}</div>
                          </div>
                          <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>
                            {buyer.totalPurchasesCount} Visits | ₹{buyer.totalSpent.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Type-Ahead Product Search */}
          <div style={{ background: 'var(--bg-secondary)', padding: '18px 20px', borderRadius: '10px', border: '1px solid var(--border-subtle)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Search size={16} color="var(--accent-orange)" />
                Quick Type-Ahead Product Search
              </label>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                Press enter or click to add product line item
              </span>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Type plastic product SKU (e.g. DMK-CHR-ROYAL) or keyword (chair, bucket, stool)..."
                value={typeaheadQuery}
                onFocus={() => setShowTypeaheadDropdown(true)}
                onChange={(e) => {
                  setTypeaheadQuery(e.target.value);
                  setShowTypeaheadDropdown(true);
                }}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontSize: '14px'
                }}
              />

              {showTypeaheadDropdown && typeaheadQuery.length > 0 && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-medium)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 100,
                    maxHeight: '260px',
                    overflowY: 'auto',
                    marginTop: '6px'
                  }}
                >
                  {catalog
                    .filter(p => 
                      p.name.toLowerCase().includes(typeaheadQuery.toLowerCase()) || 
                      p.sku.toLowerCase().includes(typeaheadQuery.toLowerCase()) ||
                      p.category.toLowerCase().includes(typeaheadQuery.toLowerCase())
                    )
                    .map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleAddProductToCart(p)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                            {p.sku} | {p.category} | Sourced: {p.manufacturerName || 'Direct'}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                            ₹{p.pricing.tier2_wholesale.toFixed(2)} (Wholesale)
                          </div>
                          <div style={{ fontSize: '11px', color: p.stockQuantity <= p.lowStockThreshold ? '#F59E0B' : 'var(--text-secondary)' }}>
                            Stock: {p.stockQuantity} {p.unitOfMeasure}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart Billed Line Items Table */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Billed Items in Cart ({lines.length})
              </h3>
              {calculations.totalBulkSavings > 0 && (
                <span 
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10B981',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  🎉 Bulk Volume Savings Applied: ₹{calculations.totalBulkSavings.toFixed(2)}
                </span>
              )}
            </div>

            <div className="cart-table-wrapper" style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', minWidth: '720px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-medium)' }}>
                    <th style={{ width: '30%', minWidth: '240px', padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Product</th>
                    <th style={{ width: '17%', minWidth: '130px', padding: '10px 10px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Price Tier</th>
                    <th style={{ width: '13%', minWidth: '105px', padding: '10px 10px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>Quantity</th>
                    <th style={{ width: '10%', minWidth: '75px', padding: '10px 10px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Unit Rate</th>
                    <th style={{ width: '10%', minWidth: '75px', padding: '10px 10px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Taxable</th>
                    <th style={{ width: '9%', minWidth: '65px', padding: '10px 10px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>GST</th>
                    <th style={{ width: '11%', minWidth: '85px', padding: '10px 10px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Total</th>
                    <th style={{ width: '36px', minWidth: '36px', padding: '10px 6px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'center' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => (
                    <tr key={line.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}>
                      
                      {/* Product Name & Info (3 Clean Vertical Rows: Title 2-lines, SKU | HSN 1-line, Discount Pill 1-line) */}
                      <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                        {/* 1. Product Name (Up to 2 lines max) */}
                        <div 
                          title={line.product.name}
                          style={{ 
                            fontWeight: 700, 
                            color: 'var(--text-primary)', 
                            fontSize: '13px', 
                            lineHeight: 1.35,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            wordBreak: 'break-word',
                            marginBottom: '3px'
                          }}
                        >
                          {line.product.name}
                        </div>

                        {/* 2. SKU and HSN code side by side with | on ONE line */}
                        <div 
                          style={{ 
                            fontSize: '11px', 
                            color: 'var(--text-tertiary)', 
                            whiteSpace: 'nowrap', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px',
                            marginBottom: (line.bulkDiscountPct || 0) > 0 ? '4px' : '0'
                          }}
                        >
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 600 }}>{line.product.sku}</span>
                          <span style={{ color: 'var(--border-medium)', fontWeight: 300 }}>|</span>
                          <span>HSN: {line.product.hsnCode}</span>
                        </div>
                        
                        {/* 3. Bulk volume discount tag on ONE line */}
                        {(line.bulkDiscountPct || 0) > 0 && (
                          <div 
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: 'rgba(255, 107, 0, 0.15)',
                              color: 'var(--accent-orange)',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 800,
                              whiteSpace: 'nowrap',
                              border: '1px solid rgba(255, 107, 0, 0.3)',
                              width: 'fit-content'
                            }}
                          >
                            <Sparkles size={10} />
                            <span>{(line.packagingFormat || 'BULK').replace('_', ' ')} (-{line.bulkDiscountPct}%) • Saved ₹{(line.bulkSavingsRupees || 0).toFixed(0)}</span>
                          </div>
                        )}
                      </td>

                      {/* Tier Selector */}
                      <td style={{ padding: '10px', verticalAlign: 'middle' }}>
                        <select
                          value={line.selectedTier}
                          onChange={(e) => handleTierChange(line.id, e.target.value as PricingTierKey)}
                          style={{
                            width: '100%',
                            padding: '6px 6px',
                            borderRadius: '5px',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-medium)',
                            color: 'var(--text-primary)',
                            fontSize: '11px',
                            fontWeight: 600
                          }}
                        >
                          <option value="tier1_distributor">Distributor (₹{line.product.pricing.tier1_distributor})</option>
                          <option value="tier2_wholesale">Wholesale (₹{line.product.pricing.tier2_wholesale})</option>
                          <option value="tier3_semi_wholesale">Semi-Wholesale (₹{line.product.pricing.tier3_semi_wholesale})</option>
                          <option value="tier4_retailer">Retailer (₹{line.product.pricing.tier4_retailer})</option>
                          <option value="tier5_mrp">MRP (₹{line.product.pricing.tier5_mrp})</option>
                        </select>
                      </td>

                      {/* Quantity Stepper */}
                      <td style={{ padding: '10px', textAlign: 'center', verticalAlign: 'middle' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: 'var(--bg-tertiary)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-medium)' }}>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(line.id, line.quantity - 1)}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '4px',
                              background: 'var(--bg-secondary)',
                              border: 'none',
                              color: 'var(--text-primary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '13px'
                            }}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) => handleQuantityChange(line.id, parseInt(e.target.value) || 1)}
                            style={{
                              width: '42px',
                              height: '24px',
                              padding: '0 2px',
                              background: 'transparent',
                              border: 'none',
                              color: '#FFFFFF',
                              fontSize: '12px',
                              fontWeight: 700,
                              textAlign: 'center',
                              fontFamily: 'var(--font-mono)'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(line.id, line.quantity + 1)}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '4px',
                              background: 'var(--bg-secondary)',
                              border: 'none',
                              color: 'var(--text-primary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '13px'
                            }}
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Bulk Unit Rate */}
                      <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', fontSize: '12.5px', fontWeight: 700, color: '#38BDF8', textAlign: 'right', verticalAlign: 'middle' }}>
                        ₹{line.unitPrice.toFixed(2)}
                      </td>

                      {/* Taxable */}
                      <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'right', verticalAlign: 'middle' }}>
                        ₹{line.taxableAmount.toFixed(2)}
                      </td>

                      {/* GST */}
                      <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'right', verticalAlign: 'middle' }}>
                        ₹{(line.cgstAmount + line.sgstAmount + line.igstAmount).toFixed(2)}
                        <div style={{ fontSize: '9px', color: 'var(--text-disabled)' }}>({line.gstRate}%)</div>
                      </td>

                      {/* Total */}
                      <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 800, color: '#10B981', textAlign: 'right', verticalAlign: 'middle' }}>
                        ₹{line.totalAmount.toFixed(2)}
                      </td>

                      {/* Delete */}
                      <td style={{ padding: '10px', textAlign: 'center', verticalAlign: 'middle' }}>
                        <button
                          type="button"
                          onClick={() => setLines(prev => prev.filter(l => l.id !== line.id))}
                          title="Remove Item"
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            borderRadius: '5px',
                            color: '#EF4444',
                            cursor: 'pointer',
                            padding: '5px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Checkout & Summary Card */}
        <div className="billing-right-col">
          
          {/* Invoice Summary Box */}
          <div 
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Invoice Overview</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--accent-orange)' }}>
                {invoiceNumber}
              </span>
            </div>

            {/* Date & Payment Mode */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontSize: '12px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Settlement & Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onChange={(e: any) => setPaymentMode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                >
                  <option value="CREDIT_30_DAYS">30 Days Credit (Ledger Debit)</option>
                  <option value="CASH">Counter Cash</option>
                  <option value="UPI">Corporate UPI / QR</option>
                  <option value="NEFT_RTGS">Bank NEFT / RTGS</option>
                </select>
              </div>
            </div>

            {/* Breakdown */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span>Taxable Amount</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{calculations.subtotalTaxable.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span>Output CGST</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{calculations.totalCGST.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span>Output SGST</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{calculations.totalSGST.toFixed(2)}</span>
              </div>

              {calculations.totalIGST > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <span>Output IGST</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>₹{calculations.totalIGST.toFixed(2)}</span>
                </div>
              )}

              {calculations.roundOff !== 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  <span>Round Off</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>₹{calculations.roundOff.toFixed(2)}</span>
                </div>
              )}

              <div 
                style={{
                  borderTop: '1px solid var(--border-medium)',
                  paddingTop: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>Grand Total</span>
                <span style={{ fontSize: '22px', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                  ₹{calculations.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => handleGenerateInvoice(false)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)',
                  border: 'none',
                  color: '#FFF',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(255, 107, 0, 0.35)'
                }}
              >
                <CheckCircle2 size={18} />
                Generate & Post Invoice
              </button>

              <button
                type="button"
                onClick={() => handleGenerateInvoice(true)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Printer size={16} />
                Generate & Print Tax Bill
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* ==================================================================== */}
      {/* MODAL: QUICK ADD B2C WALK-IN CUSTOMER                                */}
      {/* ==================================================================== */}
      {showAddCounterModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            style={{
              background: 'var(--bg-secondary)',
              width: '100%',
              maxWidth: '480px',
              borderRadius: '12px',
              border: '1px solid var(--border-medium)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Register New Walk-in Counter Buyer
              </h3>
              <button onClick={() => setShowAddCounterModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCounterBuyer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Pawar"
                  value={newCounterName}
                  onChange={(e) => setNewCounterName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Mobile Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9823411223"
                  value={newCounterPhone}
                  onChange={(e) => setNewCounterPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  City / Locality
                </label>
                <input
                  type="text"
                  placeholder="e.g. Latur, Solapur"
                  value={newCounterCity}
                  onChange={(e) => setNewCounterCity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddCounterModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '6px', background: 'transparent', border: '1px solid var(--border-medium)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '6px', background: 'var(--accent-orange)', border: 'none', color: '#FFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Buyer & Auto-Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD NEW B2B CLIENT (LOCATION-FIRST)                           */}
      {/* ==================================================================== */}
      {showAddCustomerModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            style={{
              background: 'var(--bg-secondary)',
              width: '100%',
              maxWidth: '560px',
              borderRadius: '12px',
              border: '1px solid var(--border-medium)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Add B2B Client (Location-First Naming)
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  Formatted automatically as [City] [Firm Name] (e.g. Latur Ishwar Mule)
                </span>
              </div>
              <button onClick={() => setShowAddCustomerModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveB2BCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    City / Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Latur"
                    value={newCustCity}
                    onChange={(e) => setNewCustCity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Firm / Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ishwar Mule"
                    value={newCustRawName}
                    onChange={(e) => setNewCustRawName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              {/* Live Preview of formatted name */}
              {newCustRawName && newCustCity && (
                <div style={{ background: 'rgba(2, 132, 199, 0.1)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(2, 132, 199, 0.3)', fontSize: '12px', color: '#38BDF8' }}>
                  🏷️ Display Name: <strong>{newCustCity} {newCustRawName}</strong>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    GSTIN
                  </label>
                  <input
                    type="text"
                    placeholder="27AAAP..."
                    value={newCustGstin}
                    onChange={(e) => setNewCustGstin(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98000 00000"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Assigned Price Tier
                  </label>
                  <select
                    value={newCustTier}
                    onChange={(e: any) => setNewCustTier(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px',
                      borderRadius: '6px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)',
                      fontSize: '13px'
                    }}
                  >
                    <option value="tier1_distributor">Tier 1: Master Distributor</option>
                    <option value="tier2_wholesale">Tier 2: Wholesaler</option>
                    <option value="tier3_semi_wholesale">Tier 3: Semi-Wholesale</option>
                    <option value="tier4_retailer">Tier 4: Retailer</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Opening Balance ₹
                  </label>
                  <input
                    type="number"
                    value={newCustOpeningBal}
                    onChange={(e) => setNewCustOpeningBal(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '6px', background: 'transparent', border: '1px solid var(--border-medium)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '6px', background: 'var(--accent-orange)', border: 'none', color: '#FFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save & Select Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: SALES RETURN (DAMAGED / DEFECTIVE GOODS)                      */}
      {/* ==================================================================== */}
      {showSalesReturnModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            style={{
              background: 'var(--bg-secondary)',
              width: '100%',
              maxWidth: '680px',
              borderRadius: '12px',
              border: '1px solid var(--border-medium)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#EF4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RotateCcw size={18} /> Sales Return & Credit Note (Broken Goods)
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  Returned items are placed into <strong>Damaged / Broken Stock</strong> (NOT main sellable stock) and credit customer account.
                </span>
              </div>
              <button onClick={() => setShowSalesReturnModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSalesReturn} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Customer Account *
                  </label>
                  <select
                    value={srCustomerId}
                    onChange={(e) => setSrCustomerId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px',
                      borderRadius: '6px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)',
                      fontSize: '13px'
                    }}
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.partyName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Original Invoice Ref #
                  </label>
                  <input
                    type="text"
                    value={srInvoiceRef}
                    onChange={(e) => setSrInvoiceRef(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              {/* Return Items */}
              {srLines.map((line, idx) => (
                <div key={idx} style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px', alignItems: 'center' }}>
                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Product</label>
                    <select
                      value={line.productId}
                      onChange={(e) => {
                        const p = catalog.find(prod => prod.id === e.target.value);
                        if (p) {
                          setSrLines(prev => prev.map((l, i) => i === idx ? {
                            ...l,
                            productId: p.id,
                            productSku: p.sku,
                            productName: p.name,
                            unitPrice: p.pricing.tier2_wholesale,
                            gstRate: p.gstRate
                          } : l));
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '6px',
                        borderRadius: '4px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-medium)',
                        color: 'var(--text-primary)',
                        fontSize: '12px'
                      }}
                    >
                      {catalog.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Damaged Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={line.damagedQuantity}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        setSrLines(prev => prev.map((l, i) => i === idx ? { ...l, damagedQuantity: val } : l));
                      }}
                      style={{
                        width: '100%',
                        padding: '6px',
                        borderRadius: '4px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-medium)',
                        color: 'var(--text-primary)',
                        fontSize: '12px',
                        textAlign: 'center'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Defect Type</label>
                    <select
                      value={srDamageType}
                      onChange={(e: any) => setSrDamageType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px',
                        borderRadius: '4px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-medium)',
                        color: 'var(--text-primary)',
                        fontSize: '12px'
                      }}
                    >
                      <option value="CRACKED">Cracked</option>
                      <option value="BROKEN">Broken Piece</option>
                      <option value="DEFECTIVE_MOULD">Defective Mould</option>
                      <option value="COLOR_DEFECT">Color Defect</option>
                    </select>
                  </div>
                </div>
              ))}

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Return Remarks
                </label>
                <input
                  type="text"
                  value={srNotes}
                  onChange={(e) => setSrNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontSize: '12px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowSalesReturnModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '6px', background: 'transparent', border: '1px solid var(--border-medium)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '6px', background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', border: 'none', color: '#FFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  Post Credit Note & Move to Damaged Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
