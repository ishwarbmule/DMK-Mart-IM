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
  User,
  ShieldCheck,
  UserPlus,
  Trash2,
  RotateCcw,
  Archive,
  History,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CustomerParty, PricingTierKey, FinalInvoiceData, CounterCustomer } from '../../types/erp';
import { useERPData } from '../../context/ERPContext';
import { ExportDropdown } from '../common/ExportDropdown';
import { formatDate, getTodayISODate } from '../../utils/dateUtils';

interface CustomersManagementModuleProps {
  onViewCustomerInvoice?: (invoice: FinalInvoiceData) => void;
}

export const CustomersManagementModule: React.FC<CustomersManagementModuleProps> = ({
  onViewCustomerInvoice
}) => {
  const { 
    customers, 
    counterCustomers,
    partyLedgers, 
    allInvoices, 
    addCustomer: addGlobalCustomer, 
    archiveCustomer,
    reactivateCustomer,
    addCounterCustomer,
    recordCustomerPayment 
  } = useERPData();
  
  const [activeMainTab, setActiveMainTab] = useState<'B2B_CLIENTS' | 'B2C_COUNTER_BUYERS' | 'ARCHIVED_ACCOUNTS'>('B2B_CLIENTS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Selected B2B Customer
  const activeCustomers = useMemo(() => customers.filter(c => c.status !== 'ARCHIVED'), [customers]);
  const archivedCustomers = useMemo(() => customers.filter(c => c.status === 'ARCHIVED'), [customers]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(activeCustomers[0]?.id || 'cust-01');
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || activeCustomers[0] || customers[0];

  // Active Detail Tab for Selected Customer: 'ledger' | 'orders' | 'profile'
  const [activeTab, setActiveTab] = useState<'ledger' | 'orders' | 'profile'>('ledger');

  // Modals
  const [showAddB2BModal, setShowAddB2BModal] = useState(false);
  const [showAddCounterModal, setShowAddCounterModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showArchiveCustomerModal, setShowArchiveCustomerModal] = useState(false);
  const [customerToArchive, setCustomerToArchive] = useState<CustomerParty | null>(null);
  const [archiveReason, setArchiveReason] = useState('Client business relocated / temporary operational pause');

  // Selected Counter Buyer in B2C Directory
  const [selectedCounterBuyerId, setSelectedCounterBuyerId] = useState<string>(counterCustomers[0]?.id || 'cc-01');
  const [counterHubSubTab, setCounterHubSubTab] = useState<'INVOICES' | 'BUYERS' | 'LEDGER'>('INVOICES');

  // New B2B Form
  const [newCity, setNewCity] = useState('Latur');
  const [newRawName, setNewRawName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newStateCode, setNewStateCode] = useState('27');
  const [newGstin, setNewGstin] = useState('');
  const [newTier, setNewTier] = useState<PricingTierKey>('tier2_wholesale');
  const [newOpeningBal, setNewOpeningBal] = useState<number>(0);
  const [newCreditLimit, setNewCreditLimit] = useState<number>(300000);

  // New Counter Form
  const [newCounterName, setNewCounterName] = useState('');
  const [newCounterPhone, setNewCounterPhone] = useState('');
  const [newCounterCity, setNewCounterCity] = useState('Local');

  // Payment Form
  const [payAmount, setPayAmount] = useState<number>(50000);
  const [payMode, setPayMode] = useState<'NEFT_RTGS' | 'UPI' | 'CASH' | 'CHEQUE'>('NEFT_RTGS');
  const [payRef, setPayRef] = useState<string>(`UTR-${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [payDate, setPayDate] = useState<string>(getTodayISODate());
  const [payNotes, setPayNotes] = useState<string>('Payment clearance against open sales ledger debit balance.');

  // Filtered Active B2B Customers
  const filteredB2BCustomers = useMemo(() => {
    return activeCustomers.filter(c => {
      const q = searchQuery.toLowerCase();
      return !q || 
        c.partyName.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.gstin && c.gstin.toLowerCase().includes(q));
    });
  }, [activeCustomers, searchQuery]);

  // Filtered Archived Customers
  const filteredArchivedCustomers = useMemo(() => {
    return archivedCustomers.filter(c => {
      const q = searchQuery.toLowerCase();
      return !q || 
        c.partyName.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.archiveReason && c.archiveReason.toLowerCase().includes(q));
    });
  }, [archivedCustomers, searchQuery]);

  // Filtered B2C Counter Customers
  const filteredCounterBuyers = useMemo(() => {
    return counterCustomers.filter(c => {
      const q = searchQuery.toLowerCase();
      return !q || 
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.city.toLowerCase().includes(q);
    });
  }, [counterCustomers, searchQuery]);

  const isSelectedCounterHub = selectedCustomer?.id === 'cust-08' || selectedCustomer?.partyType === 'B2C_COUNTER_WALKIN';

  // Selected Customer Invoices
  const customerInvoices = useMemo(() => {
    if (!selectedCustomer) return [];
    if (isSelectedCounterHub) {
      return allInvoices.filter(inv => inv.customer.id === 'cust-08' || inv.isCounterSale || inv.customer.partyType === 'B2C_COUNTER_WALKIN');
    }
    return allInvoices.filter(inv => inv.customer.id === selectedCustomer.id);
  }, [allInvoices, selectedCustomer, isSelectedCounterHub]);

  // Selected Customer Ledger Rows
  const customerLedgerRows = useMemo(() => {
    if (!selectedCustomer) return [];
    if (isSelectedCounterHub) {
      return partyLedgers['cust-08'] || partyLedgers[selectedCustomer.id] || [];
    }
    return partyLedgers[selectedCustomer.id] || [];
  }, [partyLedgers, selectedCustomer, isSelectedCounterHub]);

  // Selected Counter Buyer
  const selectedCounterBuyer = useMemo(() => {
    return counterCustomers.find(c => c.id === selectedCounterBuyerId) || counterCustomers[0];
  }, [counterCustomers, selectedCounterBuyerId]);

  // Invoices for the selected counter buyer
  const selectedBuyerInvoices = useMemo(() => {
    if (!selectedCounterBuyer) return [];
    return allInvoices.filter(inv => 
      (inv.walkInCustomerDetails?.phone && inv.walkInCustomerDetails.phone === selectedCounterBuyer.phone) ||
      (inv.walkInCustomerDetails?.name && inv.walkInCustomerDetails.name.toLowerCase() === selectedCounterBuyer.name.toLowerCase())
    );
  }, [allInvoices, selectedCounterBuyer]);

  // Handle Save B2B
  const handleSaveB2B = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRawName || !newCity) return;

    const formattedName = `${newCity} ${newRawName}`;
    const newCust: CustomerParty = {
      id: `cust-${Date.now()}`,
      partyName: formattedName,
      rawFirmName: newRawName,
      city: newCity,
      stateCode: newStateCode,
      gstin: newGstin,
      phone: newPhone,
      email: newEmail,
      partyType: 'B2B_WHOLESALER',
      assignedTier: newTier,
      openingBalance: newOpeningBal,
      closingBalance: newOpeningBal,
      balanceType: 'Dr',
      creditLimit: newCreditLimit,
      creditDays: 30,
      status: 'ACTIVE'
    };

    addGlobalCustomer(newCust);
    setSelectedCustomerId(newCust.id);
    setShowAddB2BModal(false);
    setNewRawName('');
    setNewGstin('');
    setNewPhone('');
    confetti({ particleCount: 35, spread: 50 });
  };

  // Handle Save Counter Buyer
  const handleSaveCounter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCounterName || !newCounterPhone) return;

    addCounterCustomer({
      name: newCounterName,
      phone: newCounterPhone,
      city: newCounterCity
    });

    setShowAddCounterModal(false);
    setNewCounterName('');
    setNewCounterPhone('');
    confetti({ particleCount: 30, spread: 50 });
  };

  // Handle Payment Submit
  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || payAmount <= 0) return;

    recordCustomerPayment(selectedCustomer.id, payAmount, payMode, payRef, payDate, payNotes);
    setShowPaymentModal(false);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
  };

  // Open Archive Confirmation
  const handleOpenArchiveModal = (cust: CustomerParty) => {
    setCustomerToArchive(cust);
    setArchiveReason('Client business relocated / temporary operational pause');
    setShowArchiveCustomerModal(true);
  };

  // Confirm Archive
  const handleConfirmArchive = () => {
    if (!customerToArchive) return;
    archiveCustomer(customerToArchive.id, archiveReason);
    setShowArchiveCustomerModal(false);
    setCustomerToArchive(null);
    confetti({ particleCount: 25, spread: 40 });
  };

  // Handle Reactivate
  const handleReactivate = (customerId: string) => {
    reactivateCustomer(customerId);
    setSelectedCustomerId(customerId);
    setActiveMainTab('B2B_CLIENTS');
    confetti({ particleCount: 40, spread: 60 });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Header Card */}
      <div 
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          padding: '24px',
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
              <Users size={20} />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Customer Accounts & Client Directory
            </h1>
            <span 
              style={{
                background: 'rgba(2, 132, 199, 0.15)',
                color: '#38BDF8',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                border: '1px solid rgba(2, 132, 199, 0.3)'
              }}
            >
              B2B ENTERPRISE ◄► B2C COUNTER BUYERS
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
            Create and manage customer accounts, track live debit balances, record payments, and archive inactive accounts with 100% lifetime historical ledger preservation.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowPaymentModal(true)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#10B981',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <IndianRupee size={16} />
            Record Payment Receipt
          </button>

          <button
            onClick={() => setShowAddB2BModal(true)}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)',
              border: 'none',
              color: '#FFF',
              fontSize: '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(255, 107, 0, 0.35)'
            }}
          >
            <Plus size={16} />
            + Create B2B Account
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-secondary)',
          borderRadius: '10px',
          padding: '12px 18px',
          border: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveMainTab('B2B_CLIENTS')}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              background: activeMainTab === 'B2B_CLIENTS' ? 'var(--accent-orange)' : 'transparent',
              color: activeMainTab === 'B2B_CLIENTS' ? '#FFF' : 'var(--text-secondary)',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Building size={15} />
            Active B2B Accounts ({activeCustomers.length})
          </button>

          <button
            onClick={() => setActiveMainTab('B2C_COUNTER_BUYERS')}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              background: activeMainTab === 'B2C_COUNTER_BUYERS' ? 'var(--accent-orange)' : 'transparent',
              color: activeMainTab === 'B2C_COUNTER_BUYERS' ? '#FFF' : 'var(--text-secondary)',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <User size={15} />
            B2C Walk-in Buyers ({counterCustomers.length})
          </button>

          <button
            onClick={() => setActiveMainTab('ARCHIVED_ACCOUNTS')}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              background: activeMainTab === 'ARCHIVED_ACCOUNTS' ? 'rgba(239, 68, 68, 0.25)' : 'transparent',
              color: activeMainTab === 'ARCHIVED_ACCOUNTS' ? '#EF4444' : 'var(--text-secondary)',
              border: `1px solid ${activeMainTab === 'ARCHIVED_ACCOUNTS' ? 'rgba(239, 68, 68, 0.4)' : 'transparent'}`,
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Archive size={15} />
            Archived Accounts ({archivedCustomers.length})
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={15} color="var(--text-tertiary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by city, name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 10px 7px 32px',
              borderRadius: '6px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '12px'
            }}
          />
        </div>
      </div>

      {/* VIEW 1: ACTIVE B2B & COUNTER CLIENTS */}
      {activeMainTab === 'B2B_CLIENTS' && (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', alignItems: 'start' }}>
          
          {/* Left Column: Location-First Customer List */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '750px', overflowY: 'auto' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Select Active Account ({filteredB2BCustomers.length})
            </span>

            {filteredB2BCustomers.map(cust => {
              const isSelected = cust.id === selectedCustomer?.id;
              const isCounter = cust.id === 'cust-08' || cust.partyType === 'B2C_COUNTER_WALKIN';
              const invs = allInvoices.filter(i => isCounter ? (i.isCounterSale || i.customer.id === 'cust-08') : i.customer.id === cust.id);
              const lifetimeBought = invs.reduce((s, i) => s + i.grandTotal, 0);

              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomerId(cust.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(255, 107, 0, 0.15)' : 'var(--bg-tertiary)',
                    border: `1px solid ${isSelected ? 'var(--accent-orange)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span 
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: isCounter ? 'rgba(16, 185, 129, 0.15)' : 'rgba(2, 132, 199, 0.15)',
                        color: isCounter ? '#10B981' : '#38BDF8'
                      }}
                    >
                      {isCounter ? '🛒 RETAIL COUNTER' : `📍 ${cust.city.toUpperCase()}`}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      {invs.length} {invs.length === 1 ? 'Bill' : 'Bills'}
                    </span>
                  </div>

                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: isSelected ? '#FFF' : 'var(--text-primary)', marginTop: '2px' }}>
                    {cust.partyName}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      Bought: <strong style={{ color: '#10B981' }}>₹{lifetimeBought.toLocaleString('en-IN')}</strong>
                    </span>
                    <span style={{ fontSize: '12.5px', fontWeight: 800, color: isCounter ? '#10B981' : '#38BDF8', fontFamily: 'var(--font-mono)' }}>
                      {isCounter ? '₹0 (Settled)' : `₹${cust.closingBalance.toLocaleString('en-IN')} (Dr)`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Customer Details & Statements */}
          {selectedCustomer && (
            <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Header Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span 
                      style={{
                        background: isSelectedCounterHub ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 107, 0, 0.15)',
                        color: isSelectedCounterHub ? '#10B981' : 'var(--accent-orange)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 800
                      }}
                    >
                      {isSelectedCounterHub ? '🛒 B2C RETAIL COUNTER HUB' : 'B2B CLIENT ACCOUNT'}
                    </span>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {selectedCustomer.partyName}
                    </h2>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    {isSelectedCounterHub ? (
                      <span>Consolidated retail counter sales capturing all walk-in buyer orders, cash & UPI settlements.</span>
                    ) : (
                      <span>City: <strong>{selectedCustomer.city}</strong> | State Code: {selectedCustomer.stateCode} | GSTIN: {selectedCustomer.gstin || 'Unregistered'} | Phone: {selectedCustomer.phone}</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right', background: 'rgba(2, 132, 199, 0.1)', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(2, 132, 199, 0.3)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      {isSelectedCounterHub ? 'Spot Cash/UPI Status' : 'Closing Balance (Receivable)'}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: isSelectedCounterHub ? '#10B981' : '#38BDF8', fontFamily: 'var(--font-mono)' }}>
                      {isSelectedCounterHub ? '₹0.00 (Settled)' : `₹${selectedCustomer.closingBalance.toLocaleString('en-IN')} (Dr)`}
                    </div>
                  </div>

                  {/* Remove / Archive Account Action Button (Disabled for system B2C Counter account) */}
                  {!isSelectedCounterHub && (
                    <button
                      onClick={() => handleOpenArchiveModal(selectedCustomer)}
                      title="Remove / Deactivate this Customer Account"
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#EF4444',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Trash2 size={14} /> Remove Account
                    </button>
                  )}
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                    {isSelectedCounterHub ? 'Total Retail Revenue' : 'Total Lifetime Purchases'}
                  </span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    ₹{customerInvoices.reduce((s, i) => s + i.grandTotal, 0).toLocaleString('en-IN')}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                    Total Invoices Generated
                  </span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    {customerInvoices.length} Bills
                  </div>
                </div>

                {isSelectedCounterHub && (
                  <div style={{ background: 'var(--bg-tertiary)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                      Registered Walk-in Buyers
                    </span>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#38BDF8', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      {counterCustomers.length} Regular Buyers
                    </div>
                  </div>
                )}
              </div>

              {/* Sub-tabs for Account Details */}
              <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                <button
                  onClick={() => setActiveTab('orders')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    background: activeTab === 'orders' ? 'var(--bg-tertiary)' : 'transparent',
                    color: activeTab === 'orders' ? 'var(--accent-orange)' : 'var(--text-secondary)',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Past Invoices ({customerInvoices.length})
                </button>

                <button
                  onClick={() => setActiveTab('ledger')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    background: activeTab === 'ledger' ? 'var(--bg-tertiary)' : 'transparent',
                    color: activeTab === 'ledger' ? 'var(--accent-orange)' : 'var(--text-secondary)',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Running Ledger Statement ({customerLedgerRows.length})
                </button>
              </div>

              {/* Invoices Tab */}
              {activeTab === 'orders' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {customerInvoices.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                      No invoices recorded yet for this client.
                    </div>
                  ) : (
                    customerInvoices.map(inv => (
                      <div 
                        key={inv.invoiceNumber}
                        style={{
                          background: 'var(--bg-tertiary)',
                          padding: '14px 18px',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '10px'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '14px' }}>
                              {inv.invoiceNumber}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              • {formatDate(inv.invoiceDate)}
                            </span>
                            <span 
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                background: inv.paymentMode === 'UPI' ? 'rgba(56, 189, 248, 0.15)' : inv.paymentMode === 'CASH' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 107, 0, 0.15)',
                                color: inv.paymentMode === 'UPI' ? '#38BDF8' : inv.paymentMode === 'CASH' ? '#10B981' : 'var(--accent-orange)'
                              }}
                            >
                              {inv.paymentMode}
                            </span>
                          </div>

                          {inv.walkInCustomerDetails && (
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              Buyer: <strong>{inv.walkInCustomerDetails.name}</strong> ({inv.walkInCustomerDetails.phone})
                            </div>
                          )}

                          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                            {inv.lineItems.length} Products | Total Qty: {inv.lineItems.reduce((s, i) => s + i.quantity, 0)} Pcs
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '16px', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                            ₹{inv.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          {onViewCustomerInvoice && (
                            <button
                              onClick={() => onViewCustomerInvoice(inv)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                background: 'rgba(255, 107, 0, 0.15)',
                                border: '1px solid rgba(255, 107, 0, 0.3)',
                                color: 'var(--accent-orange)',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              View Invoice
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Ledger Tab Table */}
              {activeTab === 'ledger' && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-medium)' }}>
                        <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Date</th>
                        <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Voucher Ref</th>
                        <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Type</th>
                        <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Particulars</th>
                        <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Debit (Billed)</th>
                        <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Credit (Paid)</th>
                        <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Running Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerLedgerRows.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                            No ledger vouchers recorded.
                          </td>
                        </tr>
                      ) : (
                        customerLedgerRows.map(row => (
                          <tr key={row.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>{formatDate(row.date)}</td>
                            <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{row.voucherNumber}</td>
                            <td style={{ padding: '12px' }}>
                              <span 
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: row.voucherType === 'SALES' ? 'rgba(2, 132, 199, 0.15)' : row.voucherType === 'RECEIPT' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                  color: row.voucherType === 'SALES' ? '#38BDF8' : row.voucherType === 'RECEIPT' ? '#10B981' : '#EF4444'
                                }}
                              >
                                {row.voucherType}
                              </span>
                            </td>
                            <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text-primary)' }}>{row.particulars}</td>
                            <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: row.debitAmount > 0 ? '#38BDF8' : 'var(--text-tertiary)' }}>
                              {row.debitAmount > 0 ? `₹${row.debitAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                            </td>
                            <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: row.creditAmount > 0 ? '#10B981' : 'var(--text-tertiary)' }}>
                              {row.creditAmount > 0 ? `₹${row.creditAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                            </td>
                            <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '13px', color: 'var(--text-primary)' }}>
                              ₹{row.runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({row.balanceType})
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* VIEW 2: B2C COUNTER BUYERS DIRECTORY (MASTER-DETAIL WORKSPACE) */}
      {activeMainTab === 'B2C_COUNTER_BUYERS' && (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', alignItems: 'start' }}>
          
          {/* Left Column: List of Counter Buyers */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '750px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Walk-in Buyers ({filteredCounterBuyers.length})
              </span>
              <button
                onClick={() => setShowAddCounterModal(true)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  border: 'none',
                  color: '#FFF',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <UserPlus size={12} /> + Add
              </button>
            </div>

            {filteredCounterBuyers.map(buyer => {
              const isSelected = buyer.id === selectedCounterBuyer?.id;
              const buyerInvs = allInvoices.filter(i => 
                (i.walkInCustomerDetails?.phone && i.walkInCustomerDetails.phone === buyer.phone) ||
                (i.walkInCustomerDetails?.name && i.walkInCustomerDetails.name.toLowerCase() === buyer.name.toLowerCase())
              );
              const computedSpent = buyerInvs.length > 0 ? buyerInvs.reduce((s, i) => s + i.grandTotal, 0) : buyer.totalSpent;

              return (
                <div
                  key={buyer.id}
                  onClick={() => setSelectedCounterBuyerId(buyer.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-tertiary)',
                    border: `1px solid ${isSelected ? '#10B981' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, color: isSelected ? '#FFF' : 'var(--text-primary)', fontSize: '13.5px' }}>
                      {buyer.name}
                    </div>
                    <span style={{ fontSize: '10.5px', color: '#10B981', fontWeight: 700, background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      {buyer.city}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    📱 +91 {buyer.phone}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      Visits: <strong>{buyer.totalPurchasesCount || buyerInvs.length}</strong>
                    </span>
                    <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
                      ₹{computedSpent.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Selected Walk-in Buyer Details & Invoices History */}
          {selectedCounterBuyer && (
            <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span 
                      style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10B981',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 800
                      }}
                    >
                      B2C WALK-IN RETAIL BUYER
                    </span>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {selectedCounterBuyer.name}
                    </h2>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    City: <strong>{selectedCounterBuyer.city}</strong> | Phone: <strong>+91 {selectedCounterBuyer.phone}</strong> | {selectedCounterBuyer.notes || 'Counter customer'}
                  </div>
                </div>

                <div style={{ textAlign: 'right', background: 'rgba(16, 185, 129, 0.1)', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Total Lifetime Purchases</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                    ₹{(selectedBuyerInvoices.length > 0 ? selectedBuyerInvoices.reduce((s, i) => s + i.grandTotal, 0) : selectedCounterBuyer.totalSpent).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                    Total Purchases Count
                  </span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    {selectedCounterBuyer.totalPurchasesCount || selectedBuyerInvoices.length} Visits
                  </div>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                    Last Visit Date
                  </span>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {formatDate(selectedCounterBuyer.lastVisitDate || getTodayISODate())}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                    Outstanding Debt Balance
                  </span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    ₹0.00 (Spot Paid)
                  </div>
                </div>
              </div>

              {/* Invoices List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Billed Invoices & Items History ({selectedBuyerInvoices.length})
                </h3>

                {selectedBuyerInvoices.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                    No recent invoice records attached to this phone number yet. New sales created in POS / Billing with this mobile will automatically appear here!
                  </div>
                ) : (
                  selectedBuyerInvoices.map(inv => (
                    <div 
                      key={inv.invoiceNumber}
                      style={{
                        background: 'var(--bg-tertiary)',
                        padding: '14px 18px',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '14px' }}>
                            {inv.invoiceNumber}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            • {formatDate(inv.invoiceDate)}
                          </span>
                          <span 
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: inv.paymentMode === 'UPI' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              color: inv.paymentMode === 'UPI' ? '#38BDF8' : '#10B981'
                            }}
                          >
                            {inv.paymentMode}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '16px', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                            ₹{inv.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          {onViewCustomerInvoice && (
                            <button
                              onClick={() => onViewCustomerInvoice(inv)}
                              style={{
                                padding: '5px 12px',
                                borderRadius: '6px',
                                background: 'rgba(255, 107, 0, 0.15)',
                                border: '1px solid rgba(255, 107, 0, 0.3)',
                                color: 'var(--accent-orange)',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              View Invoice
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Items mini list */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {inv.lineItems.map(item => (
                          <span 
                            key={item.id}
                            style={{
                              fontSize: '11px',
                              background: 'var(--bg-secondary)',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-subtle)'
                            }}
                          >
                            {item.product.name} × <strong>{item.quantity}</strong> (₹{item.totalAmount.toLocaleString('en-IN')})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* VIEW 3: ARCHIVED / DEACTIVATED ACCOUNTS (HISTORICAL PRESERVATION) */}
      {activeMainTab === 'ARCHIVED_ACCOUNTS' && (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#EF4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Archive size={18} /> Archived / Deactivated Customer Accounts ({filteredArchivedCustomers.length})
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                Accounts that have been removed from active sales. <strong>All past invoices, financial ledgers, and sales reports remain 100% intact and preserved.</strong>
              </span>
            </div>
          </div>

          {filteredArchivedCustomers.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
              No accounts in archive. All customer accounts are active.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-medium)' }}>
                    <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Client Account</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Location & Phone</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Archived On</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Archival Reason</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Past Invoices</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Preserved Balance</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArchivedCustomers.map(cust => {
                    const invs = allInvoices.filter(i => i.customer.id === cust.id);
                    const totalSpend = invs.reduce((s, i) => s + i.grandTotal, 0);

                    return (
                      <tr key={cust.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(239, 68, 68, 0.03)' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '14px' }}>
                            {cust.partyName}
                          </div>
                          <span 
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#EF4444'
                            }}
                          >
                            ARCHIVED ACCOUNT
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <div>📍 {cust.city} ({cust.stateCode})</div>
                          <div style={{ color: 'var(--text-tertiary)' }}>📱 {cust.phone}</div>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                          {formatDate(cust.archivedAt || getTodayISODate())}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '12px', color: '#EF4444' }}>
                          {cust.archiveReason || 'Deactivated by user'}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{invs.length} Invoices</span>
                          <div style={{ fontSize: '11px', color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                            Lifetime: ₹{totalSpend.toLocaleString('en-IN')}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '13px', color: '#38BDF8' }}>
                          ₹{cust.closingBalance.toLocaleString('en-IN')} (Dr)
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => {
                                setSelectedCustomerId(cust.id);
                                setActiveMainTab('B2B_CLIENTS');
                              }}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-medium)',
                                color: 'var(--text-secondary)',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              View History
                            </button>

                            <button
                              onClick={() => handleReactivate(cust.id)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                border: 'none',
                                color: '#FFF',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <RotateCcw size={13} /> Reactivate Account
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: CONFIRM ARCHIVE / REMOVE CUSTOMER ACCOUNT                     */}
      {/* ==================================================================== */}
      {showArchiveCustomerModal && customerToArchive && (
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
              maxWidth: '520px',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#EF4444'
                  }}
                >
                  <Archive size={18} />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Deactivate Customer Account
                </h3>
              </div>
              <button 
                onClick={() => setShowArchiveCustomerModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Are you sure you want to remove <strong style={{ color: 'var(--text-primary)' }}>{customerToArchive.partyName}</strong> from active sales?
              </p>

              <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                🔒 <strong>Historical Data Guaranteed</strong>: All past invoices, payment vouchers, ledger transactions, and sales analytics for this customer will be completely preserved in the <strong>Archived Accounts</strong> section. You can reactivate this account at any time!
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Reason for Deactivation *
                </label>
                <select
                  value={archiveReason}
                  onChange={(e) => setArchiveReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    marginBottom: '8px'
                  }}
                >
                  <option value="Client business relocated / temporary operational pause">Client business relocated / temporary pause</option>
                  <option value="Credit default / outstanding recovery pending">Credit default / recovery pending</option>
                  <option value="Duplicate account created inadvertently">Duplicate account created inadvertently</option>
                  <option value="Client opted for cash walk-in instead of B2B credit">Switched to counter retail</option>
                  <option value="Partnership / firm restructured">Firm restructured</option>
                </select>

                <input
                  type="text"
                  placeholder="Or type custom reason..."
                  value={archiveReason}
                  onChange={(e) => setArchiveReason(e.target.value)}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowArchiveCustomerModal(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Keep Account Active
                </button>

                <button
                  type="button"
                  onClick={handleConfirmArchive}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    border: 'none',
                    color: '#FFF',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)'
                  }}
                >
                  Yes, Move to Archived
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: CREATE B2B CUSTOMER ACCOUNT                                   */}
      {/* ==================================================================== */}
      {showAddB2BModal && (
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
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Register New B2B Client Account
              </h3>
              <button onClick={() => setShowAddB2BModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveB2B} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Location / City * (Prefix)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Latur, Solapur, Pune"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Firm / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ishwar Mule, Rajesh Plastics"
                    value={newRawName}
                    onChange={(e) => setNewRawName(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>
              </div>

              {newRawName && (
                <div style={{ background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: 'var(--accent-orange)' }}>
                  System Display Name: <strong>{newCity} {newRawName}</strong>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98000 00000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    GSTIN
                  </label>
                  <input
                    type="text"
                    placeholder="27AAAC..."
                    value={newGstin}
                    onChange={(e) => setNewGstin(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Assigned Pricing Tier
                  </label>
                  <select
                    value={newTier}
                    onChange={(e: any) => setNewTier(e.target.value)}
                    style={{ width: '100%', padding: '9px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px' }}
                  >
                    <option value="tier1_distributor">Tier 1 - Distributor (Lowest Base)</option>
                    <option value="tier2_wholesale">Tier 2 - Wholesaler (Bulk Crates)</option>
                    <option value="tier3_semi_wholesale">Tier 3 - Semi-Wholesaler</option>
                    <option value="tier4_retailer">Tier 4 - Retail Shop</option>
                    <option value="tier5_mrp">Tier 5 - MRP</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Opening Debit Balance (₹)
                  </label>
                  <input
                    type="number"
                    value={newOpeningBal}
                    onChange={(e) => setNewOpeningBal(parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddB2BModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '6px', background: 'transparent', border: '1px solid var(--border-medium)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '6px', background: 'var(--accent-orange)', border: 'none', color: '#FFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD B2C COUNTER BUYER                                         */}
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
              maxWidth: '460px',
              borderRadius: '12px',
              border: '1px solid var(--border-medium)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Register Walk-in Counter Buyer
              </h3>
              <button onClick={() => setShowAddCounterModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCounter} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Buyer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patil"
                  value={newCounterName}
                  onChange={(e) => setNewCounterName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Mobile Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98000 00000"
                  value={newCounterPhone}
                  onChange={(e) => setNewCounterPhone(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  City / Local Area
                </label>
                <input
                  type="text"
                  placeholder="e.g. Latur City, Solapur Road"
                  value={newCounterCity}
                  onChange={(e) => setNewCounterCity(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px' }}
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
                  style={{ padding: '8px 18px', borderRadius: '6px', background: '#10B981', border: 'none', color: '#FFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Buyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: RECORD PAYMENT RECEIPT                                        */}
      {/* ==================================================================== */}
      {showPaymentModal && (
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
              maxWidth: '520px',
              borderRadius: '12px',
              border: '1px solid var(--border-medium)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IndianRupee size={18} /> Record Customer Payment Receipt
              </h3>
              <button onClick={() => setShowPaymentModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePayment} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Received From Customer *
                </label>
                <select
                  value={selectedCustomer?.id}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px' }}
                >
                  {activeCustomers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.partyName} — Receivable: ₹{c.closingBalance.toLocaleString('en-IN')} (Dr)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Payment Amount ₹ *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={payAmount}
                    onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Payment Mode
                  </label>
                  <select
                    value={payMode}
                    onChange={(e: any) => setPayMode(e.target.value)}
                    style={{ width: '100%', padding: '9px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px' }}
                  >
                    <option value="NEFT_RTGS">Bank NEFT / RTGS</option>
                    <option value="UPI">UPI Transfer</option>
                    <option value="CASH">Cash Counter</option>
                    <option value="CHEQUE">Bank Cheque</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Reference / UTR #
                  </label>
                  <input
                    type="text"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Receipt Date
                  </label>
                  <input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '6px', background: 'transparent', border: '1px solid var(--border-medium)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '6px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', border: 'none', color: '#FFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  Post Receipt & Credit Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
