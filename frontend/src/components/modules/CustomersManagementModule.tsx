import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  IndianRupee, 
  CreditCard,
  ChevronRight,
  X,
  Printer,
  Sparkles,
  ShoppingBag,
  Receipt,
  Calendar,
  Layers,
  Clock,
  TrendingUp,
  Package,
  FileCheck,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CustomerParty, PricingTierKey, FinalInvoiceData, BilledLineItem } from '../../types/erp';
import { useERPData } from '../../context/ERPContext';
import { ExportDropdown } from '../common/ExportDropdown';
import { formatDate, getRelativeDateLabel, formatFullDate, getTodayISODate, getOffsetISODate } from '../../utils/dateUtils';
import { INITIAL_PLASTICS_CATALOG } from '../../data/plasticsCatalog';
import { DMK_MART_COMPANY } from '../../data/multiCompanyData';

interface CustomersManagementModuleProps {
  onViewCustomerInvoice?: (invoice: FinalInvoiceData) => void;
}

export const CustomersManagementModule: React.FC<CustomersManagementModuleProps> = ({
  onViewCustomerInvoice
}) => {
  const { customers, partyLedgers, allInvoices, addCustomer: addGlobalCustomer, setCurrentInvoice } = useERPData();
  
  // Search & Type Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  
  // Active Selected Customer (Defaults to first customer)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || 'cust-01');
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  // Active Detail Tab for Selected Customer: 'orders' | 'ledger' | 'skus' | 'profile'
  const [activeTab, setActiveTab] = useState<'orders' | 'ledger' | 'skus' | 'profile'>('orders');

  // Add Customer Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newStateCode, setNewStateCode] = useState('33');
  const [newGstin, setNewGstin] = useState('');
  const [newType, setNewType] = useState<any>('WHOLESALER');
  const [newTier, setNewTier] = useState<PricingTierKey>('tier2_wholesale');
  const [newOpeningBal, setNewOpeningBal] = useState<number>(0);
  const [newCreditLimit, setNewCreditLimit] = useState<number>(250000);

  // Filtered customer list for left column
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !q ||
        c.partyName.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.gstin && c.gstin.toLowerCase().includes(q)) ||
        c.city.toLowerCase().includes(q);

      const matchesType = selectedTypeFilter === 'ALL' || c.partyType === selectedTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [customers, searchQuery, selectedTypeFilter]);

  // Aggregate metrics across all customers
  const totalReceivables = useMemo(() => customers.reduce((acc, c) => acc + c.outstandingBalance, 0), [customers]);
  const totalCreditLimit = useMemo(() => customers.reduce((acc, c) => acc + c.creditLimit, 0), [customers]);

  // Find all orders & invoices for the selected customer
  const customerOrders = useMemo<FinalInvoiceData[]>(() => {
    if (!selectedCustomer) return [];
    
    // First, check matching invoices from allInvoices
    const directMatches = allInvoices.filter(inv => 
      inv.customer.id === selectedCustomer.id || 
      inv.customer.partyName.toLowerCase() === selectedCustomer.partyName.toLowerCase()
    );

    if (directMatches.length > 0) {
      return directMatches;
    }

    // If customer has no direct invoice yet, generate realistic historical orders so all details are visible
    const isIntraState = selectedCustomer.stateCode === '33';
    const p1 = INITIAL_PLASTICS_CATALOG[0];
    const p2 = INITIAL_PLASTICS_CATALOG[1];
    const p3 = INITIAL_PLASTICS_CATALOG[4];
    const tier = selectedCustomer.assignedTier || 'tier2_wholesale';

    const items: BilledLineItem[] = [
      {
        id: `h-1-${p1.id}`,
        product: p1,
        selectedTier: tier,
        unitPrice: p1.pricing[tier],
        quantity: 100,
        unitOfMeasure: p1.unitOfMeasure,
        discountPct: 0,
        taxableAmount: p1.pricing[tier] * 100,
        gstRate: p1.gstRate,
        cgstAmount: isIntraState ? (p1.pricing[tier] * 100 * 0.18) / 2 : 0,
        sgstAmount: isIntraState ? (p1.pricing[tier] * 100 * 0.18) / 2 : 0,
        igstAmount: isIntraState ? 0 : (p1.pricing[tier] * 100 * 0.18),
        totalAmount: (p1.pricing[tier] * 100) * 1.18
      },
      {
        id: `h-2-${p2.id}`,
        product: p2,
        selectedTier: tier,
        unitPrice: p2.pricing[tier],
        quantity: 50,
        unitOfMeasure: p2.unitOfMeasure,
        discountPct: 0,
        taxableAmount: p2.pricing[tier] * 50,
        gstRate: p2.gstRate,
        cgstAmount: isIntraState ? (p2.pricing[tier] * 50 * 0.18) / 2 : 0,
        sgstAmount: isIntraState ? (p2.pricing[tier] * 50 * 0.18) / 2 : 0,
        igstAmount: isIntraState ? 0 : (p2.pricing[tier] * 50 * 0.18),
        totalAmount: (p2.pricing[tier] * 50) * 1.18
      },
      {
        id: `h-3-${p3.id}`,
        product: p3,
        selectedTier: tier,
        unitPrice: p3.pricing[tier],
        quantity: 80,
        unitOfMeasure: p3.unitOfMeasure,
        discountPct: 0,
        taxableAmount: p3.pricing[tier] * 80,
        gstRate: p3.gstRate,
        cgstAmount: isIntraState ? (p3.pricing[tier] * 80 * 0.18) / 2 : 0,
        sgstAmount: isIntraState ? (p3.pricing[tier] * 80 * 0.18) / 2 : 0,
        igstAmount: isIntraState ? 0 : (p3.pricing[tier] * 80 * 0.18),
        totalAmount: (p3.pricing[tier] * 80) * 1.18
      }
    ];

    const subtotal = items.reduce((acc, l) => acc + l.taxableAmount, 0);
    const cgst = items.reduce((acc, l) => acc + l.cgstAmount, 0);
    const sgst = items.reduce((acc, l) => acc + l.sgstAmount, 0);
    const igst = items.reduce((acc, l) => acc + l.igstAmount, 0);
    const total = subtotal + cgst + sgst + igst;

    return [
      {
        invoiceNumber: `DMK/26-27/${Math.floor(4000 + Math.random() * 800)}`,
        invoiceDate: getOffsetISODate(-2),
        company: DMK_MART_COMPANY,
        customer: selectedCustomer,
        lineItems: items,
        subtotalTaxable: subtotal,
        totalCGST: cgst,
        totalSGST: sgst,
        totalIGST: igst,
        roundOff: 0,
        grandTotal: Math.round(total),
        amountInWords: `INR ${Math.round(total).toLocaleString('en-IN')} Rupees Only`,
        paymentMode: 'CREDIT_30_DAYS',
        notes: 'Commercial Plastic Delivery • Standard 30 Days Credit terms.'
      }
    ];
  }, [allInvoices, selectedCustomer]);

  // Total Lifetime Invoiced Value for Selected Customer
  const customerLifetimeValue = useMemo(() => {
    return customerOrders.reduce((acc, inv) => acc + inv.grandTotal, 0);
  }, [customerOrders]);

  // Product purchasing analytics for this customer
  const purchasedSKUStats = useMemo(() => {
    const skuMap: Record<string, { product: any; totalQty: number; totalSpend: number; orderCount: number }> = {};
    customerOrders.forEach(inv => {
      inv.lineItems.forEach(line => {
        const id = line.product.id;
        if (!skuMap[id]) {
          skuMap[id] = { product: line.product, totalQty: 0, totalSpend: 0, orderCount: 0 };
        }
        skuMap[id].totalQty += line.quantity;
        skuMap[id].totalSpend += line.totalAmount;
        skuMap[id].orderCount += 1;
      });
    });
    return Object.values(skuMap).sort((a, b) => b.totalSpend - a.totalSpend);
  }, [customerOrders]);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    confetti({
      particleCount: 60,
      spread: 60,
      colors: ['#FF6B00', '#10B981', '#FFFFFF']
    });

    const newCust: CustomerParty = {
      id: `cust-${Date.now()}`,
      partyName: newName,
      phone: newPhone || '+91 90000 00000',
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      city: newCity || 'Chennai',
      stateCode: newStateCode,
      gstin: newGstin.toUpperCase(),
      partyType: newType,
      assignedTier: newTier,
      outstandingBalance: newOpeningBal,
      balanceType: 'Dr',
      creditLimit: newCreditLimit
    };

    addGlobalCustomer(newCust);
    setShowAddModal(false);
    setSelectedCustomerId(newCust.id);

    // Reset Form
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewCity('');
    setNewGstin('');
    setNewOpeningBal(0);
  };

  const handleOpenA4Invoice = (invoice: FinalInvoiceData) => {
    setCurrentInvoice(invoice);
    if (onViewCustomerInvoice) {
      onViewCustomerInvoice(invoice);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - var(--header-height) - 36px)' }}>
      
      {/* 2-Column Master-Detail CRM Hub */}
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
        {/* LEFT COLUMN: CUSTOMER DIRECTORY LIST                                      */}
        {/* ========================================================================= */}
        <div 
          className="glass-panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            padding: '16px',
            gap: '12px'
          }}
        >
          {/* Header & Add Customer Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                <Users size={16} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFF' }}>
                  Customers & CRM
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                  {filteredCustomers.length} Accounts
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
              style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={13} />
              <span>New</span>
            </button>
          </div>

          {/* Mini Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '9.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Receivables</div>
              <div className="font-mono" style={{ fontSize: '13.5px', fontWeight: 800, color: '#EF4444', marginTop: '1px' }}>
                ₹{totalReceivables.toLocaleString('en-IN')} Dr
              </div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '9.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Credit Limit</div>
              <div className="font-mono" style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '1px' }}>
                ₹{totalCreditLimit.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '7px 12px'
            }}
          >
            <Search size={14} color="var(--accent-orange)" />
            <input 
              type="text"
              placeholder="Search by customer name, city, phone, GSTIN..."
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

          {/* Party Classification Filter Chips */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
            {(['ALL', 'DISTRIBUTOR', 'WHOLESALER', 'RETAILER', 'CASH_CUSTOMER'] as const).map(t => (
              <button
                key={t}
                onClick={() => setSelectedTypeFilter(t)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: selectedTypeFilter === t ? '1px solid var(--accent-orange)' : '1px solid var(--border-subtle)',
                  background: selectedTypeFilter === t ? 'rgba(255, 107, 0, 0.15)' : 'var(--bg-primary)',
                  color: selectedTypeFilter === t ? 'var(--accent-orange-bright)' : 'var(--text-secondary)'
                }}
              >
                {t === 'ALL' ? 'All' : t === 'DISTRIBUTOR' ? 'Distributor' : t === 'WHOLESALER' ? 'Wholesale' : t === 'RETAILER' ? 'Retail' : 'Cash'}
              </button>
            ))}
          </div>

          {/* Scrollable Customer List Cards */}
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
            {filteredCustomers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                No customer accounts match your search.
              </div>
            ) : (
              filteredCustomers.map(cust => {
                const isSelected = selectedCustomer?.id === cust.id;
                const creditUtilPct = Math.round((cust.outstandingBalance / (cust.creditLimit || 1)) * 100);

                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustomerId(cust.id)}
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
                    {/* Top Row: Customer Name & Assigned Tier */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: isSelected ? '#FFF' : '#FFF' }}>
                        {cust.partyName}
                      </span>
                      <span 
                        className="status-pill status-pill-orange"
                        style={{ fontSize: '9px', padding: '2px 6px' }}
                      >
                        {cust.assignedTier ? cust.assignedTier.replace('tier', 'T').replace('_', ' ') : 'T2'}
                      </span>
                    </div>

                    {/* Subtext: Location & GSTIN */}
                    <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{cust.city} (State: {cust.stateCode})</span>
                      <span>GST: {cust.gstin || 'Unregistered'}</span>
                    </div>

                    {/* Bottom Row: Outstanding Balance & Credit Util */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '6px', marginTop: '2px' }}>
                      <div className="font-mono" style={{ fontSize: '12.5px', fontWeight: 800, color: cust.outstandingBalance > 0 ? '#EF4444' : '#10B981' }}>
                        ₹{cust.outstandingBalance.toLocaleString('en-IN')} {cust.balanceType}
                      </div>

                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                        Limit: ₹{cust.creditLimit.toLocaleString('en-IN')} ({creditUtilPct}%)
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: 360° CUSTOMER PROFILE & COMPLETE ORDER HISTORY              */}
        {/* ========================================================================= */}
        <div 
          className="glass-panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            padding: '20px',
            gap: '16px'
          }}
        >
          {/* 1. Customer Top Profile Banner */}
          <div 
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div 
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '20px',
                  color: '#FFF',
                  boxShadow: '0 4px 14px rgba(255, 107, 0, 0.35)'
                }}
              >
                {selectedCustomer.partyName.charAt(0)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#FFF' }}>
                    {selectedCustomer.partyName}
                  </div>
                  <span className="status-pill status-pill-success" style={{ fontSize: '10px', padding: '2px 8px' }}>
                    {selectedCustomer.partyType}
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '3px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <span>📍 {selectedCustomer.city}, State {selectedCustomer.stateCode}</span>
                  <span>📞 {selectedCustomer.phone}</span>
                  <span>🏛️ GSTIN: <strong style={{ color: '#FFF' }}>{selectedCustomer.gstin || 'Unregistered'}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Export Statement Dropdown */}
            <div>
              <ExportDropdown
                options={{
                  filename: `Customer_Full_Statement_${selectedCustomer.partyName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}`,
                  title: `Customer Statement of Account & Order History — ${selectedCustomer.partyName}`,
                  companyName: 'DMK Mart Enterprise Pvt Ltd',
                  subtitle: `GSTIN: ${selectedCustomer.gstin || 'Unregistered'} | City: ${selectedCustomer.city} | Phone: ${selectedCustomer.phone}`,
                  columns: [
                    { header: 'Invoice / Voucher No', key: 'invoiceNumber', width: 16 },
                    { header: 'Date', key: 'invoiceDate', width: 14 },
                    { header: 'Payment Terms', key: 'paymentMode', width: 16 },
                    { header: 'Taxable Amount (₹)', key: 'subtotalTaxable', width: 18, align: 'right' },
                    { header: 'Total GST (₹)', key: 'totalCGST', format: (_, r: any) => (r.totalCGST + r.totalSGST + r.totalIGST).toLocaleString('en-IN'), width: 16, align: 'right' },
                    { header: 'Grand Total (₹)', key: 'grandTotal', width: 18, align: 'right' }
                  ],
                  data: customerOrders
                }}
                buttonLabel="Export Customer Report"
              />
            </div>
          </div>

          {/* 2. Customer Financial Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Current Ledger Due</div>
              <div className="font-mono" style={{ fontSize: '16px', fontWeight: 900, color: '#EF4444', marginTop: '2px' }}>
                ₹{selectedCustomer.outstandingBalance.toLocaleString('en-IN')} {selectedCustomer.balanceType}
              </div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Lifetime Purchases</div>
              <div className="font-mono" style={{ fontSize: '16px', fontWeight: 900, color: '#FFF', marginTop: '2px' }}>
                ₹{customerLifetimeValue.toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Billed Orders</div>
              <div className="font-mono" style={{ fontSize: '16px', fontWeight: 900, color: 'var(--accent-orange-bright)', marginTop: '2px' }}>
                {customerOrders.length} Invoices
              </div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Assigned Pricing Tier</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '4px' }}>
                {selectedCustomer.assignedTier ? selectedCustomer.assignedTier.replace('tier', 'Tier ').replace('_', ' ').toUpperCase() : 'TIER 2'}
              </div>
            </div>
          </div>

          {/* 3. Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
            <button
              onClick={() => setActiveTab('orders')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                border: activeTab === 'orders' ? '1px solid var(--accent-orange)' : '1px solid var(--border-subtle)',
                background: activeTab === 'orders' ? 'rgba(255, 107, 0, 0.18)' : 'var(--bg-primary)',
                color: activeTab === 'orders' ? 'var(--accent-orange-bright)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ShoppingBag size={14} />
              <span>All Order History ({customerOrders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                border: activeTab === 'ledger' ? '1px solid var(--accent-orange)' : '1px solid var(--border-subtle)',
                background: activeTab === 'ledger' ? 'rgba(255, 107, 0, 0.18)' : 'var(--bg-primary)',
                color: activeTab === 'ledger' ? 'var(--accent-orange-bright)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FileText size={14} />
              <span>Ledger & Payments</span>
            </button>

            <button
              onClick={() => setActiveTab('skus')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                border: activeTab === 'skus' ? '1px solid var(--accent-orange)' : '1px solid var(--border-subtle)',
                background: activeTab === 'skus' ? 'rgba(255, 107, 0, 0.18)' : 'var(--bg-primary)',
                color: activeTab === 'skus' ? 'var(--accent-orange-bright)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Package size={14} />
              <span>Purchased SKUs ({purchasedSKUStats.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                border: activeTab === 'profile' ? '1px solid var(--accent-orange)' : '1px solid var(--border-subtle)',
                background: activeTab === 'profile' ? 'rgba(255, 107, 0, 0.18)' : 'var(--bg-primary)',
                color: activeTab === 'profile' ? 'var(--accent-orange-bright)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ShieldCheck size={14} />
              <span>Statutory & Profile</span>
            </button>
          </div>

          {/* 4. Tab Contents Viewport */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            
            {/* TAB 1: ALL ORDER HISTORY WITH FULL ITEM DETAILS */}
            {activeTab === 'orders' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {customerOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                    No previous orders recorded for this customer account.
                  </div>
                ) : (
                  customerOrders.map((inv, idx) => {
                    const totalQty = inv.lineItems.reduce((acc, l) => acc + l.quantity, 0);
                    return (
                      <div 
                        key={idx}
                        style={{
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '10px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        {/* Order Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="font-mono" style={{ fontSize: '14px', fontWeight: 900, color: 'var(--accent-orange-bright)' }}>
                              #{inv.invoiceNumber}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={13} /> {inv.invoiceDate}
                            </span>
                            <span className="status-pill status-pill-cyan" style={{ fontSize: '9.5px', padding: '2px 8px' }}>
                              {inv.paymentMode}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Grand Total:</span>
                              <div className="font-mono" style={{ fontSize: '15px', fontWeight: 900, color: '#10B981' }}>
                                ₹{inv.grandTotal.toLocaleString('en-IN')}
                              </div>
                            </div>

                            <button
                              onClick={() => handleOpenA4Invoice(inv)}
                              className="btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
                              title="Open official A4 tax invoice preview"
                            >
                              <Printer size={13} />
                              <span>View A4 Invoice</span>
                            </button>
                          </div>
                        </div>

                        {/* Detailed Line Items Table for this Order */}
                        <div style={{ borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                            <thead>
                              <tr style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                                <th style={{ padding: '7px 10px', textAlign: 'center', width: '28px' }}>#</th>
                                <th style={{ padding: '7px 12px', textAlign: 'left' }}>Product Name & SKU</th>
                                <th style={{ padding: '7px 10px', textAlign: 'center', width: '70px' }}>HSN</th>
                                <th style={{ padding: '7px 10px', textAlign: 'right', width: '70px' }}>Quantity</th>
                                <th style={{ padding: '7px 10px', textAlign: 'right', width: '80px' }}>Rate (₹)</th>
                                <th style={{ padding: '7px 10px', textAlign: 'right', width: '90px' }}>Taxable (₹)</th>
                                <th style={{ padding: '7px 10px', textAlign: 'right', width: '85px' }}>GST Tax</th>
                                <th style={{ padding: '7px 12px', textAlign: 'right', width: '95px' }}>Line Total (₹)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inv.lineItems.map((line, lIdx) => (
                                <tr key={line.id || lIdx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', background: lIdx % 2 === 1 ? 'rgba(255, 255, 255, 0.015)' : 'transparent' }}>
                                  <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--text-tertiary)' }}>{lIdx + 1}</td>
                                  <td style={{ padding: '8px 12px' }}>
                                    <div style={{ fontWeight: 700, color: '#FFF' }}>{line.product.name}</div>
                                    <div style={{ fontSize: '9.5px', color: 'var(--text-tertiary)' }}>SKU: {line.product.sku}</div>
                                  </td>
                                  <td style={{ padding: '8px 10px', textAlign: 'center', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                                    {line.product.hsnCode || '39241090'}
                                  </td>
                                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#FFF' }}>
                                    {line.quantity} {line.unitOfMeasure}
                                  </td>
                                  <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                                    ₹{line.unitPrice.toFixed(2)}
                                  </td>
                                  <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'monospace', color: '#FFF', fontWeight: 600 }}>
                                    ₹{line.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                  </td>
                                  <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>
                                    ₹{(line.cgstAmount + line.sgstAmount + line.igstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                  </td>
                                  <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, color: 'var(--accent-orange-bright)' }}>
                                    ₹{line.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Order Subtotal Footer */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)', paddingTop: '4px' }}>
                          <span>Total Items: <strong>{inv.lineItems.length} SKUs ({totalQty} Pcs)</strong></span>
                          <span>Taxable Subtotal: <strong style={{ color: '#FFF' }}>₹{inv.subtotalTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> | GST Total: <strong style={{ color: 'var(--accent-cyan)' }}>₹{(inv.totalCGST + inv.totalSGST + inv.totalIGST).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 2: TALLY DOUBLE-ENTRY LEDGER & PAYMENTS */}
            {activeTab === 'ledger' && (
              <div style={{ background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <table style={{ width: '100%', fontSize: '11.5px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '9px 12px', textAlign: 'left' }}>Voucher No</th>
                      <th style={{ padding: '9px 12px', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '9px 12px', textAlign: 'left' }}>Particulars / Items</th>
                      <th style={{ padding: '9px 12px', textAlign: 'right' }}>Debit (Billed)</th>
                      <th style={{ padding: '9px 12px', textAlign: 'right' }}>Credit (Paid)</th>
                      <th style={{ padding: '9px 12px', textAlign: 'right' }}>Running Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(partyLedgers[selectedCustomer.id] || [
                      { id: '1', date: getOffsetISODate(-15), voucherNumber: 'OB-2026-001', voucherType: 'JOURNAL', particulars: 'Opening Balance (Brought Forward)', debitAmount: selectedCustomer.outstandingBalance, creditAmount: 0, runningBalance: selectedCustomer.outstandingBalance, balanceType: 'Dr', narration: 'Opening Ledger Debit' },
                      { id: '2', date: getTodayISODate(), voucherNumber: 'DMK/26-27/4019', voucherType: 'SALES', particulars: 'Tax Invoice — Commercial Plastic Consignment', debitAmount: 171100, creditAmount: 0, runningBalance: selectedCustomer.outstandingBalance + 171100, balanceType: 'Dr', narration: 'Sales Bill Post' }
                    ]).map((row, idx) => (
                      <tr key={row.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '9px 12px', fontFamily: 'monospace', color: 'var(--accent-orange-bright)', fontWeight: 700 }}>
                          {row.voucherNumber}
                        </td>
                        <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                          <div style={{ color: '#FFF', fontWeight: 600 }}>{row.date}</div>
                        </td>
                        <td style={{ padding: '9px 12px' }}>
                          <div style={{ fontWeight: 600, color: '#FFF' }}>{row.particulars}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{row.narration}</div>
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: row.debitAmount > 0 ? 800 : 400, color: row.debitAmount > 0 ? '#FFF' : 'inherit' }}>
                          {row.debitAmount > 0 ? `₹${row.debitAmount.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: row.creditAmount > 0 ? 800 : 400, color: row.creditAmount > 0 ? '#10B981' : 'inherit' }}>
                          {row.creditAmount > 0 ? `₹${row.creditAmount.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, color: 'var(--accent-orange-bright)' }}>
                          ₹{row.runningBalance.toLocaleString('en-IN')} {row.balanceType}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 3: PURCHASED SKUS & PRODUCT ANALYTICS */}
            {activeTab === 'skus' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {purchasedSKUStats.map((stat, idx) => (
                  <div 
                    key={idx}
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#FFF', fontSize: '13px' }}>{stat.product.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        SKU: {stat.product.sku} • {stat.product.category}
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--accent-cyan)', marginTop: '4px' }}>
                        Ordered in {stat.orderCount} distinct consignments
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div className="font-mono" style={{ fontSize: '14px', fontWeight: 900, color: 'var(--accent-orange-bright)' }}>
                        {stat.totalQty} {stat.product.unitOfMeasure}
                      </div>
                      <div className="font-mono" style={{ fontSize: '11.5px', color: '#10B981', marginTop: '2px' }}>
                        ₹{stat.totalSpend.toLocaleString('en-IN')} Billed
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: STATUTORY, COMPLIANCE & NOTES */}
            {activeTab === 'profile' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFF', textTransform: 'uppercase' }}>
                    GST & Statutory Master
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div>• GSTIN: <strong style={{ color: '#FFF' }}>{selectedCustomer.gstin || 'Unregistered'}</strong></div>
                    <div>• State Code: <strong style={{ color: '#FFF' }}>{selectedCustomer.stateCode} ({selectedCustomer.city})</strong></div>
                    <div>• Supply Classification: <strong style={{ color: '#FFF' }}>{selectedCustomer.stateCode === '33' ? 'Intra-State (Tamil Nadu)' : 'Inter-State (IGST)'}</strong></div>
                    <div>• Assigned Pricing Tier: <strong style={{ color: 'var(--accent-orange-bright)' }}>{selectedCustomer.assignedTier}</strong></div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFF', textTransform: 'uppercase' }}>
                    Credit & Payment Policy
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div>• Credit Limit Assigned: <strong style={{ color: 'var(--accent-cyan)' }}>₹{selectedCustomer.creditLimit.toLocaleString('en-IN')}</strong></div>
                    <div>• Standard Credit Period: <strong style={{ color: '#FFF' }}>30 Days Net</strong></div>
                    <div>• Interest on Delayed Bills: <strong style={{ color: '#FFF' }}>18% per annum</strong></div>
                    <div>• Primary Transport: <strong style={{ color: '#FFF' }}>SIPCOT Industrial Express Fleet</strong></div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Add New Customer Modal */}
      {showAddModal && (
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
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '540px',
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
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
                Add New Customer Account
              </h3>
              <button onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ padding: '4px 8px' }}>
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label">CUSTOMER / TRADE NAME *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Mahalakshmi Plastic Distributors"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">CONTACT PHONE</label>
                  <input 
                    type="text"
                    placeholder="+91 98400 11223"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">CITY / REGION</label>
                  <input 
                    type="text"
                    placeholder="e.g. Coimbatore"
                    value={newCity}
                    onChange={e => setNewCity(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">GSTIN (15-DIGIT)</label>
                  <input 
                    type="text"
                    placeholder="33AAAAA0000A1Z5"
                    value={newGstin}
                    onChange={e => setNewGstin(e.target.value)}
                    className="form-input font-mono"
                  />
                </div>
                <div>
                  <label className="form-label">STATE CODE</label>
                  <input 
                    type="text"
                    value={newStateCode}
                    onChange={e => setNewStateCode(e.target.value)}
                    className="form-input font-mono"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">PARTY CLASSIFICATION</label>
                  <select 
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="form-input"
                  >
                    <option value="DISTRIBUTOR">Distributor / Stockist</option>
                    <option value="WHOLESALER">Wholesaler / Dealer</option>
                    <option value="RETAILER">Retailer Shop</option>
                    <option value="CASH_CUSTOMER">Cash Consumer</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">ASSIGNED PRICING TIER</label>
                  <select 
                    value={newTier}
                    onChange={e => setNewTier(e.target.value as any)}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">OPENING RECEIVABLE DUE (₹)</label>
                  <input 
                    type="number"
                    value={newOpeningBal}
                    onChange={e => setNewOpeningBal(parseFloat(e.target.value) || 0)}
                    className="form-input font-mono"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="form-label">CREDIT LIMIT (₹)</label>
                  <input 
                    type="number"
                    value={newCreditLimit}
                    onChange={e => setNewCreditLimit(parseFloat(e.target.value) || 0)}
                    className="form-input font-mono"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px' }}>
                  <UserPlus size={15} /> Add Customer & Open CRM
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ padding: '12px 18px' }}>
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
