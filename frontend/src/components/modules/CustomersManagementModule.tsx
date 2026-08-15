import React, { useState } from 'react';
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
  DollarSign, 
  CreditCard,
  ChevronRight,
  X,
  Printer,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CustomerParty, PricingTierKey, FinalInvoiceData } from '../../types/erp';
import { useERPData } from '../../context/ERPContext';
import { ExportDropdown } from '../common/ExportDropdown';
import { ExportOptions } from '../../utils/exportUtils';
import { formatDate, getRelativeDateLabel } from '../../utils/dateUtils';
import { Calendar } from 'lucide-react';

interface CustomersManagementModuleProps {
  onViewCustomerInvoice?: (invoice: FinalInvoiceData) => void;
}

export const CustomersManagementModule: React.FC<CustomersManagementModuleProps> = () => {
  const { customers, partyLedgers, addCustomer: addGlobalCustomer } = useERPData();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerParty | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Customer Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newStateCode, setNewStateCode] = useState('33');
  const [newGstin, setNewGstin] = useState('');
  const [newType, setNewType] = useState<any>('WHOLESALER');
  const [newTier, setNewTier] = useState<PricingTierKey>('tier2_wholesale');
  const [newOpeningBal, setNewOpeningBal] = useState<number>(0);
  const [newCreditLimit, setNewCreditLimit] = useState<number>(250000);
  const [newPaymentTerms, setNewPaymentTerms] = useState('Credit 30 Days');

  // Filter customers
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery)) ||
      (c.gstin && c.gstin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedTypeFilter === 'ALL' || c.partyType === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  const totalReceivables = filteredCustomers.reduce((acc, c) => acc + c.outstandingBalance, 0);
  const totalCreditLimit = filteredCustomers.reduce((acc, c) => acc + c.creditLimit, 0);

  const customersExportOptions: ExportOptions<CustomerParty> = {
    filename: `DMK_Customers_Receivables_Master_${new Date().toISOString().split('T')[0]}`,
    title: 'Customer 360 & Accounts Receivable Master',
    companyName: 'DMK Mart Multi-Company Manufacturing Platform',
    subtitle: selectedTypeFilter === 'ALL' ? `All Party Types (${filteredCustomers.length} accounts)` : `Party Type: ${selectedTypeFilter} (${filteredCustomers.length} accounts)`,
    columns: [
      { header: 'Customer Party Name', key: 'partyName', width: 32 },
      { header: 'Party Type', key: 'partyType', width: 16 },
      { header: 'City / Region', key: 'city', width: 16 },
      { header: 'State Code', key: 'stateCode', width: 10, align: 'center' },
      { header: 'Phone Number', key: 'phone', width: 16 },
      { header: 'Email Address', key: 'email', format: v => v || 'N/A', width: 22 },
      { header: 'GSTIN / UIN', key: 'gstin', format: v => v || 'Unregistered', width: 18 },
      { header: 'Assigned Price Tier', key: 'assignedTier', format: v => v ? v.replace('tier', 'Tier ').replace('_', ' ').toUpperCase() : 'TIER 2', width: 20 },
      { header: 'Credit Limit (₹)', key: 'creditLimit', width: 16, align: 'right' },
      { header: 'Outstanding Balance (₹)', key: 'outstandingBalance', width: 20, align: 'right' },
      { header: 'Balance Nature', key: 'balanceType', width: 12, align: 'center' },
      { header: 'Credit Util %', key: 'creditLimit', format: (_, row) => `${((row.outstandingBalance / (row.creditLimit || 1)) * 100).toFixed(1)}%`, width: 14, align: 'right' }
    ],
    data: filteredCustomers,
    summaryRows: [
      {
        label: 'Grand Total Outstanding Receivables',
        values: {
          creditLimit: totalCreditLimit,
          outstandingBalance: totalReceivables
        }
      }
    ]
  };

  // KPI Calculations
  const highBalanceCount = customers.filter(c => c.outstandingBalance > c.creditLimit * 0.8 && c.creditLimit > 0).length;

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

    // Reset Form
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewCity('');
    setNewGstin('');
    setNewOpeningBal(0);
    setSelectedCustomer(newCust);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner & Header */}
      <div 
        className="glass-panel"
        style={{
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderLeft: '5px solid var(--accent-orange)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#FFF' }}>
              Customer 360 & Accounts Receivable Ledger
            </h1>
            <span className="status-pill status-pill-orange">
              52 ACTIVE CLIENTS
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Multi-tier pricing assignment, real-time GSTIN validation, credit limits & transaction history
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ExportDropdown options={customersExportOptions} buttonLabel="Export Customers List" />
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
            style={{ padding: '9px 18px', fontSize: '13px' }}
          >
            <Plus size={16} />
            <span>Add New Customer</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
            Total Customers
          </div>
          <div className="font-mono" style={{ fontSize: '24px', fontWeight: 900, color: '#FFF', marginTop: '4px' }}>
            {customers.length}
          </div>
          <div style={{ fontSize: '11px', color: '#10B981', marginTop: '4px' }}>
            Across 4 State Codes
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
            Outstanding Receivables
          </div>
          <div className="font-mono" style={{ fontSize: '24px', fontWeight: 900, color: 'var(--accent-orange-bright)', marginTop: '4px' }}>
            ₹{totalReceivables.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Sundry Debtors (Asset)
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
            Total Credit Limit Exposure
          </div>
          <div className="font-mono" style={{ fontSize: '24px', fontWeight: 900, color: '#00E5FF', marginTop: '4px' }}>
            ₹{totalCreditLimit.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Authorized 30-day limits
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
            High Credit Utilization
          </div>
          <div className="font-mono" style={{ fontSize: '24px', fontWeight: 900, color: highBalanceCount > 0 ? '#EF4444' : '#10B981', marginTop: '4px' }}>
            {highBalanceCount} Accounts
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            &gt; 80% Credit Limit Reached
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div 
        className="glass-panel"
        style={{
          padding: '14px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
          <Search size={16} color="var(--text-secondary)" />
          <input 
            type="text"
            placeholder="Search by customer name, city, GSTIN, or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ width: '100%', maxWidth: '400px' }}
          />
        </div>

        {/* Party Type Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'DISTRIBUTOR', 'WHOLESALER', 'RETAILER', 'CASH_CUSTOMER'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedTypeFilter(t)}
              className={selectedTypeFilter === t ? 'btn-primary' : 'btn-secondary'}
              style={{ height: '36px', padding: '0 14px', fontSize: '12px', fontWeight: 600 }}
            >
              {t === 'ALL' ? 'All Parties' : t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Master Table */}
      <div className="enterprise-table-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Customer / Trade Name</th>
              <th>City & State</th>
              <th>GSTIN / Tax ID</th>
              <th>Assigned Pricing Tier</th>
              <th style={{ textAlign: 'right' }}>Outstanding Balance</th>
              <th style={{ textAlign: 'right' }}>Credit Limit</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((cust) => {
              const utilPct = cust.creditLimit > 0 ? Math.min(Math.round((cust.outstandingBalance / cust.creditLimit) * 100), 100) : 0;
              return (
                <tr 
                  key={cust.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedCustomer(cust)}
                >
                  <td>
                    <div style={{ fontWeight: 800, color: '#FFF' }}>{cust.partyName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {cust.phone} • {cust.email || 'No email registered'}
                    </div>
                  </td>
                  <td>
                    <div>{cust.city}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>State Code: {cust.stateCode}</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--accent-orange-bright)', marginTop: '3px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={11} /> Last Activity: {partyLedgers[cust.id]?.length ? formatDate(partyLedgers[cust.id][partyLedgers[cust.id].length - 1].date) : '15 Aug 2026'}
                    </div>
                  </td>
                  <td>
                    {cust.gstin ? (
                      <span className="font-mono" style={{ color: 'var(--accent-orange-bright)', fontSize: '12px', fontWeight: 600 }}>
                        {cust.gstin}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>Unregistered Consumer</span>
                    )}
                  </td>
                  <td>
                    <span className="status-pill status-pill-cyan" style={{ fontSize: '10px' }}>
                      {cust.assignedTier ? cust.assignedTier.replace('tier', 'Tier ').replace('_', ' ') : 'Tier 1 Distributor'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="font-mono" style={{ fontWeight: 800, color: cust.outstandingBalance > 0 ? 'var(--accent-orange-bright)' : '#10B981' }}>
                      ₹{cust.outstandingBalance.toLocaleString('en-IN')} {cust.balanceType}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="font-mono" style={{ fontSize: '12px' }}>
                      ₹{cust.creditLimit.toLocaleString('en-IN')}
                    </div>
                    {cust.creditLimit > 0 && (
                      <div style={{ width: '80px', height: '4px', background: '#333', borderRadius: '2px', marginLeft: 'auto', marginTop: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${utilPct}%`, height: '100%', background: utilPct > 80 ? '#EF4444' : '#10B981' }} />
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomer(cust);
                      }}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '11px' }}
                    >
                      <span>360° Profile</span>
                      <ChevronRight size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Customer 360 Drawer Modal */}
      {selectedCustomer && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 10, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            zIndex: 9999
          }}
          onClick={() => setSelectedCustomer(null)}
        >
          <div 
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '680px',
              height: '100vh',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-secondary)',
              color: '#FFF',
              padding: '32px 28px',
              boxShadow: '-10px 0 50px rgba(0, 0, 0, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
              <div>
                <span className="status-pill status-pill-orange" style={{ fontSize: '10px' }}>
                  CUSTOMER 360° PROFILE
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#FFF', marginTop: '6px' }}>
                  {selectedCustomer.partyName}
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {selectedCustomer.city}, State Code: {selectedCustomer.stateCode} • Phone: {selectedCustomer.phone}
                </div>
              </div>

              <button 
                onClick={() => setSelectedCustomer(null)}
                className="btn-secondary"
                style={{ padding: '6px 10px' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* 4 Balance Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Current Ledger Balance</div>
                <div className="font-mono" style={{ fontSize: '20px', fontWeight: 900, color: 'var(--accent-orange-bright)', marginTop: '2px' }}>
                  ₹{selectedCustomer.outstandingBalance.toLocaleString('en-IN')} {selectedCustomer.balanceType}
                </div>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Assigned Credit Limit</div>
                <div className="font-mono" style={{ fontSize: '20px', fontWeight: 900, color: '#00E5FF', marginTop: '2px' }}>
                  ₹{selectedCustomer.creditLimit.toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Assigned Price Tier</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFF', marginTop: '4px' }}>
                  {selectedCustomer.assignedTier ? selectedCustomer.assignedTier.replace('tier', 'Tier ').replace('_', ' ') : 'Tier 1'}
                </div>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>GSTIN Registration</div>
                <div className="font-mono" style={{ fontSize: '12px', fontWeight: 700, color: '#10B981', marginTop: '4px' }}>
                  {selectedCustomer.gstin || 'Unregistered Consumer'}
                </div>
              </div>
            </div>

            {/* Live Ledger History Table */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFF' }}>
                  Live Ledger Postings & Fast Orders ({partyLedgers[selectedCustomer.id]?.length || 0} Transactions)
                </span>
                <span className="status-pill status-pill-success" style={{ fontSize: '10px' }}>
                  AUTO-SYNCED TO TALLY
                </span>
              </div>
              <div style={{ background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Voucher No</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Transaction Date</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Particulars / Items</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Debit (₹)</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Credit (₹)</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Running Bal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(partyLedgers[selectedCustomer.id] || [
                      { id: '1', date: '2026-08-01', voucherNumber: 'OB-2026-001', voucherType: 'JOURNAL', particulars: 'Opening Balance (Brought Forward)', debitAmount: selectedCustomer.outstandingBalance, creditAmount: 0, runningBalance: selectedCustomer.outstandingBalance, balanceType: 'Dr', narration: 'Opening Dr' }
                    ]).map((row, idx) => (
                      <tr key={row.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: 'var(--accent-orange-bright)', fontWeight: 700 }}>
                          {row.voucherNumber}
                        </td>
                        <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FFF', fontWeight: 600 }}>
                            <Calendar size={12} color="var(--accent-orange)" />
                            {formatDate(row.date)}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--accent-orange-bright)', marginTop: '1px', fontWeight: 500 }}>
                            {getRelativeDateLabel(row.date)}
                          </div>
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <div style={{ fontWeight: 600, color: '#FFF' }}>{row.particulars}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{row.narration}</div>
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: row.debitAmount > 0 ? 800 : 400, color: row.debitAmount > 0 ? '#FFF' : 'inherit' }}>
                          {row.debitAmount > 0 ? `₹${row.debitAmount.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: row.creditAmount > 0 ? 800 : 400, color: row.creditAmount > 0 ? '#10B981' : 'inherit' }}>
                          {row.creditAmount > 0 ? `₹${row.creditAmount.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, color: 'var(--accent-orange-bright)' }}>
                          ₹{row.runningBalance.toLocaleString('en-IN')} {row.balanceType}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
              <ExportDropdown
                options={{
                  filename: `DMK_Customer_Ledger_${selectedCustomer.partyName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}`,
                  title: `Customer Statement of Account — ${selectedCustomer.partyName}`,
                  companyName: 'DMK Mart Multi-Company Manufacturing Platform',
                  subtitle: `GSTIN: ${selectedCustomer.gstin || 'Unregistered'} • City: ${selectedCustomer.city} • Phone: ${selectedCustomer.phone}`,
                  columns: [
                    { header: 'Voucher Date', key: 'date', width: 12 },
                    { header: 'Voucher Number', key: 'voucherNumber', width: 16 },
                    { header: 'Voucher Type', key: 'voucherType', width: 12 },
                    { header: 'Particulars', key: 'particulars', width: 28 },
                    { header: 'Debit (₹)', key: 'debitAmount', width: 16, align: 'right' },
                    { header: 'Credit (₹)', key: 'creditAmount', width: 16, align: 'right' },
                    { header: 'Running Balance (₹)', key: 'runningBalance', format: (v, r) => `${v.toLocaleString('en-IN')} ${r.balanceType}`, width: 18, align: 'right' }
                  ],
                  data: partyLedgers[selectedCustomer.id] || [],
                  summaryRows: [
                    {
                      label: 'Closing Outstanding Balance Due',
                      values: {
                        runningBalance: `₹${selectedCustomer.outstandingBalance.toLocaleString('en-IN')} ${selectedCustomer.balanceType}`
                      }
                    }
                  ]
                }}
                buttonLabel="Export Customer Statement"
              />
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="btn-primary" 
                style={{ flex: 1, padding: '10px' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

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
            zIndex: 9999
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
                    placeholder="e.g. Madurai"
                    value={newCity}
                    onChange={e => setNewCity(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">GSTIN (15 DIGIT)</label>
                  <input 
                    type="text"
                    placeholder="33AABCS4412F1Z1"
                    value={newGstin}
                    onChange={e => setNewGstin(e.target.value.toUpperCase())}
                    className="form-input font-mono"
                  />
                </div>
                <div>
                  <label className="form-label">STATE CODE</label>
                  <select 
                    value={newStateCode}
                    onChange={e => setNewStateCode(e.target.value)}
                    className="form-input"
                  >
                    <option value="33">33 - Tamil Nadu</option>
                    <option value="29">29 - Karnataka</option>
                    <option value="36">36 - Telangana</option>
                    <option value="27">27 - Maharashtra</option>
                    <option value="32">32 - Kerala</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">ASSIGNED PRICING TIER</label>
                  <select 
                    value={newTier}
                    onChange={e => setNewTier(e.target.value as PricingTierKey)}
                    className="form-input"
                  >
                    <option value="tier1_distributor">Tier 1 - Distributor (Lowest Base)</option>
                    <option value="tier2_wholesale">Tier 2 - Wholesaler</option>
                    <option value="tier3_semi_wholesale">Tier 3 - Semi-Wholesale</option>
                    <option value="tier4_retailer">Tier 4 - Retailer</option>
                    <option value="tier5_mrp">Tier 5 - MRP (Walk-in Cash)</option>
                  </select>
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

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button 
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: '11px' }}
                >
                  <CheckCircle2 size={16} />
                  <span>Create Customer Account</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                  style={{ padding: '11px 16px' }}
                >
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
