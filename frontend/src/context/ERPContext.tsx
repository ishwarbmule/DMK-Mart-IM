import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  PlasticProductItem, 
  CustomerParty, 
  CompanyVertical, 
  FinalInvoiceData, 
  PricingTierKey,
  PackagingFormat,
  VendorParty,
  PurchaseOrder,
  PurchaseReturn,
  SalesReturn,
  CounterCustomer,
  LowStockAlert
} from '../types/erp';
import { INITIAL_PLASTICS_CATALOG } from '../data/plasticsCatalog';
import { 
  MOCK_CUSTOMERS, 
  DMK_COMPANIES, 
  INITIAL_VENDORS, 
  INITIAL_COUNTER_CUSTOMERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_PURCHASE_RETURNS,
  INITIAL_SALES_RETURNS
} from '../data/multiCompanyData';
import { INITIAL_ALL_INVOICES } from '../data/mockInvoices';
import { getTodayISODate, getOffsetISODate } from '../utils/dateUtils';

// ----------------------------------------------------------------------------
// JOURNAL ENTRY & LEDGER DEFINITIONS
// ----------------------------------------------------------------------------
export interface JournalLineItem {
  id: string;
  accountId: string;
  accountName: string;
  accountGroup: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  debit: number;
  credit: number;
  memo: string;
}

export interface FullJournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  description: string;
  voucherType: 'Sales' | 'Purchase' | 'Payment' | 'Receipt' | 'Contra' | 'Journal' | 'Credit_Note' | 'Debit_Note';
  totalDebit: number;
  totalCredit: number;
  lines: JournalLineItem[];
}

export interface PartyLedgerRow {
  id: string;
  date: string;
  voucherNumber: string;
  voucherType: string;
  particulars: string;
  debitAmount: number;
  creditAmount: number;
  runningBalance: number;
  balanceType: 'Dr' | 'Cr';
  narration?: string;
}

export interface BillRecord {
  billNumber: string;
  date: string;
  customer: CustomerParty;
  type: string;
  itemCount: number;
  taxableAmount: number;
  totalGst: number;
  grandTotal: number;
  balanceDue: number;
  status: string;
  paymentMode: string;
  companyCode: string;
}

export interface BulkPricingResult {
  unitPrice: number;
  baseTierPrice: number;
  packagingFormat: PackagingFormat;
  bulkDiscountPct: number;
  bulkSavingsRupees: number;
  formatLabel: string;
}

interface ERPContextType {
  // Master State Stores
  products: PlasticProductItem[];
  customers: CustomerParty[];
  vendors: VendorParty[];
  counterCustomers: CounterCustomer[];
  purchaseOrders: PurchaseOrder[];
  purchaseReturns: PurchaseReturn[];
  salesReturns: SalesReturn[];
  lowStockAlerts: LowStockAlert[];
  
  bills: BillRecord[];
  allInvoices: FinalInvoiceData[];
  journalEntries: FullJournalEntry[];
  partyLedgers: Record<string, PartyLedgerRow[]>;
  vendorLedgers: Record<string, PartyLedgerRow[]>;
  
  currentInvoice: FinalInvoiceData | null;
  activeCompany: CompanyVertical;
  feedbackBanner: string | null;

  // Actions & Mutators
  setActiveCompany: (company: CompanyVertical) => void;
  setCurrentInvoice: (invoice: FinalInvoiceData | null) => void;
  setFeedbackBanner: (msg: string | null) => void;
  
  // Product Catalog
  addProduct: (product: PlasticProductItem) => void;
  bulkAddProducts: (newProducts: PlasticProductItem[]) => void;
  transferDamagedStock: (productId: string, quantity: number, reason: string) => void;
  
  // Customer & Buyer Directory
  addCustomer: (customer: CustomerParty) => void;
  archiveCustomer: (customerId: string, reason?: string) => void;
  reactivateCustomer: (customerId: string) => void;
  addCounterCustomer: (newBuyer: { name: string; phone: string; city: string; notes?: string }) => CounterCustomer;
  recordCustomerPayment: (
    customerId: string,
    amount: number,
    paymentMode: 'NEFT_RTGS' | 'UPI' | 'CASH' | 'CHEQUE',
    referenceNo: string,
    paymentDate: string,
    narration?: string
  ) => void;
  
  // Vendor Management
  createVendor: (vendor: VendorParty) => void;
  archiveVendor: (vendorId: string, reason?: string) => void;
  reactivateVendor: (vendorId: string) => void;
  recordVendorPayment: (
    vendorId: string,
    amount: number,
    paymentMode: 'NEFT_RTGS' | 'UPI' | 'CHEQUE',
    referenceNo: string,
    paymentDate: string,
    narration?: string
  ) => void;

  // Purchase Order & Goods Inward Lifecycle
  createPurchaseOrder: (po: PurchaseOrder) => void;
  updatePurchaseOrder: (poId: string, updatedPO: Partial<PurchaseOrder>) => void;
  cancelPurchaseOrder: (poId: string, reason?: string) => void;
  confirmPurchaseOrderReceipt: (poId: string, receivedBy?: string) => void;
  createPurchaseReturn: (returnPayload: PurchaseReturn) => void;

  // Sales & Counter Sales Lifecycle
  addFastOrderBill: (invoice: FinalInvoiceData) => void;
  createSalesReturn: (returnPayload: SalesReturn) => void;

  // Financial Journals
  addJournalEntry: (entry: FullJournalEntry) => void;

  // Bulk Pricing Calculation Engine
  calculateBulkPricing: (product: PlasticProductItem, tier: PricingTierKey, quantity: number) => BulkPricingResult;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

// Initial Party Ledgers
const INITIAL_PARTY_LEDGERS: Record<string, PartyLedgerRow[]> = {
  'cust-01': [
    {
      id: 'pl-01',
      date: getOffsetISODate(-15),
      voucherNumber: 'OB-2026-001',
      voucherType: 'JOURNAL',
      particulars: 'Opening Balance (Brought Forward)',
      debitAmount: 145000,
      creditAmount: 0,
      runningBalance: 145000,
      balanceType: 'Dr',
      narration: 'Opening Ledger Debit'
    },
    {
      id: 'pl-02',
      date: getTodayISODate(),
      voucherNumber: 'DMK/26-27/4019',
      voucherType: 'SALES',
      particulars: 'Tax Invoice — Commercial Plastic Consignment',
      debitAmount: 171100,
      creditAmount: 0,
      runningBalance: 316100,
      balanceType: 'Dr',
      narration: 'Sales Bill Post'
    }
  ],
  'cust-02': [
    {
      id: 'pl-03',
      date: getOffsetISODate(-20),
      voucherNumber: 'OB-2026-002',
      voucherType: 'JOURNAL',
      particulars: 'Opening Balance (Brought Forward)',
      debitAmount: 85000,
      creditAmount: 0,
      runningBalance: 85000,
      balanceType: 'Dr',
      narration: 'Opening Ledger Debit'
    },
    {
      id: 'pl-04',
      date: getOffsetISODate(-3),
      voucherNumber: 'DMK/26-27/4011',
      voucherType: 'SALES',
      particulars: 'Tax Invoice — Plastic Buckets & Basins',
      debitAmount: 100000,
      creditAmount: 0,
      runningBalance: 185000,
      balanceType: 'Dr',
      narration: 'Sales Bill Post'
    }
  ],
  'cust-08': [
    {
      id: 'pl-08-01',
      date: getOffsetISODate(-4),
      voucherNumber: 'DMK/26-27/4021',
      voucherType: 'SALES',
      particulars: 'Retail Counter Sale (Amit Shinde)',
      debitAmount: 4800,
      creditAmount: 4800,
      runningBalance: 0,
      balanceType: 'Dr',
      narration: 'Spot Cash Settlement'
    },
    {
      id: 'pl-08-02',
      date: getOffsetISODate(-2),
      voucherNumber: 'DMK/26-27/4022',
      voucherType: 'SALES',
      particulars: 'Retail Counter Sale (Rajesh Deshmukh)',
      debitAmount: 34500,
      creditAmount: 34500,
      runningBalance: 0,
      balanceType: 'Dr',
      narration: 'Spot UPI Settlement'
    },
    {
      id: 'pl-08-03',
      date: getOffsetISODate(-1),
      voucherNumber: 'DMK/26-27/4023',
      voucherType: 'SALES',
      particulars: 'Retail Counter Sale (Sunita Patil)',
      debitAmount: 9200,
      creditAmount: 9200,
      runningBalance: 0,
      balanceType: 'Dr',
      narration: 'Spot Cash Settlement'
    },
    {
      id: 'pl-08-04',
      date: getTodayISODate(),
      voucherNumber: 'DMK/26-27/4024',
      voucherType: 'SALES',
      particulars: 'Retail Counter Sale (Ramesh Pawar)',
      debitAmount: 18450,
      creditAmount: 18450,
      runningBalance: 0,
      balanceType: 'Dr',
      narration: 'Spot UPI Settlement'
    }
  ]
};

// Initial Vendor Ledgers
const INITIAL_VENDOR_LEDGERS: Record<string, PartyLedgerRow[]> = {
  'vnd-01': [
    {
      id: 'vl-01',
      date: getOffsetISODate(-30),
      voucherNumber: 'OB-VND-001',
      voucherType: 'JOURNAL',
      particulars: 'Opening Balance (Brought Forward)',
      debitAmount: 0,
      creditAmount: 350000,
      runningBalance: 350000,
      balanceType: 'Cr',
      narration: 'Vendor Opening Balance'
    },
    {
      id: 'vl-02',
      date: getOffsetISODate(-2),
      voucherNumber: 'PO-2026-1081',
      voucherType: 'PURCHASE',
      particulars: 'Goods Inward Receipt — 100 Pcs Royal Chairs',
      debitAmount: 0,
      creditAmount: 36580,
      runningBalance: 386580,
      balanceType: 'Cr',
      narration: 'PO Receipt Confirmed'
    },
    {
      id: 'vl-03',
      date: getOffsetISODate(-1),
      voucherNumber: 'DN-2026-0041',
      voucherType: 'DEBIT_NOTE',
      particulars: 'Purchase Return — Damaged Armrest Chairs',
      debitAmount: 731.60,
      creditAmount: 0,
      runningBalance: 385848.40,
      balanceType: 'Cr',
      narration: 'Debit Note Adjusted'
    }
  ]
};

// Initial Journal Entries
const INITIAL_JOURNAL_ENTRIES: FullJournalEntry[] = [
  {
    id: 'JE-2026-0001',
    entryNumber: 'JE-2026-0001',
    date: getTodayISODate(),
    description: 'Sales - BILL-2026-4010 to Latur Ishwar Mule',
    voucherType: 'Sales',
    totalDebit: 171100,
    totalCredit: 171100,
    lines: [
      { id: '1', accountId: '12000', accountName: 'Accounts Receivable (Sundry Debtors)', accountGroup: 'Asset', debit: 171100, credit: 0, memo: 'To Latur Ishwar Mule' },
      { id: '2', accountId: '40000', accountName: 'Domestic Plastic Sales Revenue', accountGroup: 'Revenue', debit: 0, credit: 145000, memo: 'By 100 Pcs Royal High-Back Chairs' },
      { id: '3', accountId: '21000', accountName: 'GST Payable (Duties & Taxes)', accountGroup: 'Liability', debit: 0, credit: 26100, memo: 'By Output CGST (9%) + SGST (9%)' }
    ]
  },
  {
    id: 'JE-2026-0002',
    entryNumber: 'JE-2026-0002',
    date: getOffsetISODate(-2),
    description: 'Purchase - PO-2026-1081 from Nilkamal Plastics Ltd',
    voucherType: 'Purchase',
    totalDebit: 36580,
    totalCredit: 36580,
    lines: [
      { id: '1', accountId: '13000', accountName: 'Sellable Polymer Inventory', accountGroup: 'Asset', debit: 31000, credit: 0, memo: 'Stock Inward 100 Royal Chairs' },
      { id: '2', accountId: '21000', accountName: 'GST Input Tax Credit', accountGroup: 'Asset', debit: 5580, credit: 0, memo: 'Input CGST + SGST (18%)' },
      { id: '3', accountId: '20000', accountName: 'Accounts Payable (Nilkamal Plastics)', accountGroup: 'Liability', debit: 0, credit: 36580, memo: 'Payable for PO-2026-1081' }
    ]
  },
  {
    id: 'JE-2026-0003',
    entryNumber: 'JE-2026-0003',
    date: getOffsetISODate(-1),
    description: 'Debit Note - DN-2026-0041 Purchase Return to Nilkamal Plastics',
    voucherType: 'Debit_Note',
    totalDebit: 731.60,
    totalCredit: 731.60,
    lines: [
      { id: '1', accountId: '20000', accountName: 'Accounts Payable (Nilkamal Plastics)', accountGroup: 'Liability', debit: 731.60, credit: 0, memo: 'Debit Note for Damaged Goods Return' },
      { id: '2', accountId: '13500', accountName: 'Damaged / Broken Stock', accountGroup: 'Asset', debit: 0, credit: 620.00, memo: 'Reduced 2 Pcs Damaged Stock' },
      { id: '3', accountId: '21000', accountName: 'GST Input Tax Credit Reversal', accountGroup: 'Asset', debit: 0, credit: 111.60, memo: 'Reversed Input Tax' }
    ]
  }
];

export const ERPDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<PlasticProductItem[]>(INITIAL_PLASTICS_CATALOG);
  const [customers, setCustomers] = useState<CustomerParty[]>(MOCK_CUSTOMERS);
  const [vendors, setVendors] = useState<VendorParty[]>(INITIAL_VENDORS);
  const [counterCustomers, setCounterCustomers] = useState<CounterCustomer[]>(INITIAL_COUNTER_CUSTOMERS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>(INITIAL_PURCHASE_RETURNS);
  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>(INITIAL_SALES_RETURNS);
  
  const [allInvoices, setAllInvoices] = useState<FinalInvoiceData[]>(INITIAL_ALL_INVOICES);
  const [journalEntries, setJournalEntries] = useState<FullJournalEntry[]>(INITIAL_JOURNAL_ENTRIES);
  const [partyLedgers, setPartyLedgers] = useState<Record<string, PartyLedgerRow[]>>(INITIAL_PARTY_LEDGERS);
  const [vendorLedgers, setVendorLedgers] = useState<Record<string, PartyLedgerRow[]>>(INITIAL_VENDOR_LEDGERS);

  const [activeCompany, setActiveCompany] = useState<CompanyVertical>(DMK_COMPANIES[0]);
  const [currentInvoice, setCurrentInvoice] = useState<FinalInvoiceData | null>(INITIAL_ALL_INVOICES[0] || null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Auto-dismiss banner after 4.5s
  useEffect(() => {
    if (feedbackBanner) {
      const t = setTimeout(() => setFeedbackBanner(null), 4500);
      return () => clearTimeout(t);
    }
  }, [feedbackBanner]);

  // Derived Bills for compatibility
  const bills: BillRecord[] = useMemo(() => {
    return allInvoices.map((inv) => ({
      billNumber: inv.invoiceNumber,
      date: inv.invoiceDate,
      customer: inv.customer,
      type: inv.isCounterSale ? 'Counter Sales' : 'Tax Invoice (B2B)',
      itemCount: inv.lineItems.reduce((sum, item) => sum + item.quantity, 0),
      taxableAmount: inv.subtotalTaxable,
      totalGst: inv.totalCGST + inv.totalSGST + inv.totalIGST,
      grandTotal: inv.grandTotal,
      balanceDue: inv.paymentMode === 'CREDIT_30_DAYS' ? inv.grandTotal : 0,
      status: 'Issued',
      paymentMode: inv.paymentMode,
      companyCode: inv.company.companyCode
    }));
  }, [allInvoices]);

  // --------------------------------------------------------------------------
  // LOW STOCK ALERT ENGINE
  // --------------------------------------------------------------------------
  const lowStockAlerts: LowStockAlert[] = useMemo(() => {
    return products
      .filter(p => p.stockQuantity <= p.lowStockThreshold)
      .map(p => {
        const deficit = p.lowStockThreshold - p.stockQuantity + 20; // Recommend safety buffer
        const urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' = 
          p.stockQuantity <= 10 ? 'CRITICAL' : 
          p.stockQuantity <= p.lowStockThreshold / 2 ? 'HIGH' : 'MEDIUM';
        
        return {
          productId: p.id,
          sku: p.sku,
          name: p.name,
          category: p.category,
          currentStock: p.stockQuantity,
          threshold: p.lowStockThreshold,
          deficitQuantity: deficit,
          urgency,
          preferredVendorName: p.manufacturerName || 'National Multi-Brand Polymer Distributors',
          estimatedReorderCost: deficit * p.purchaseBaseCost
        };
      });
  }, [products]);

  // --------------------------------------------------------------------------
  // DYNAMIC VOLUME & BULK-TIER PRICING ENGINE
  // --------------------------------------------------------------------------
  const calculateBulkPricing = (
    product: PlasticProductItem, 
    tier: PricingTierKey, 
    quantity: number
  ): BulkPricingResult => {
    const baseTierPrice = product.pricing[tier] || product.pricing.tier2_wholesale;
    
    let packagingFormat: PackagingFormat = 'PIECE';
    let bulkDiscountPct = 0;
    let formatLabel = 'Single Piece Rate';

    if (quantity >= 50) {
      packagingFormat = 'MASTER_LOT_50';
      bulkDiscountPct = 20;
      formatLabel = 'Master Lot Rate (-20%)';
    } else if (quantity >= 24) {
      packagingFormat = 'CRATE_24';
      bulkDiscountPct = 15;
      formatLabel = 'Crate of 24 Rate (-15%)';
    } else if (quantity >= 12) {
      packagingFormat = 'BOX_12';
      bulkDiscountPct = 12;
      formatLabel = 'Box of 12 Rate (-12%)';
    } else if (quantity >= 10) {
      packagingFormat = 'SET_10';
      bulkDiscountPct = 8;
      formatLabel = 'Set of 10 Rate (-8%)';
    } else if (quantity >= 5) {
      packagingFormat = 'PACKET_5';
      bulkDiscountPct = 5;
      formatLabel = 'Packet Rate (-5%)';
    }

    const unitPrice = Number((baseTierPrice * (1 - bulkDiscountPct / 100)).toFixed(2));
    const bulkSavingsRupees = Number(((baseTierPrice - unitPrice) * quantity).toFixed(2));

    return {
      unitPrice,
      baseTierPrice,
      packagingFormat,
      bulkDiscountPct,
      bulkSavingsRupees,
      formatLabel
    };
  };

  // --------------------------------------------------------------------------
  // INVENTORY MUTATIONS (Main vs Damaged Stock)
  // --------------------------------------------------------------------------
  const addProduct = (newProduct: PlasticProductItem) => {
    setProducts(prev => [newProduct, ...prev]);
    setFeedbackBanner(`✅ Product "${newProduct.name}" added to catalog.`);
  };

  const bulkAddProducts = (newProducts: PlasticProductItem[]) => {
    setProducts(prev => [...newProducts, ...prev]);
    setFeedbackBanner(`🚀 ${newProducts.length} products successfully imported to inventory!`);
  };

  const transferDamagedStock = (productId: string, quantity: number, reason: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const qtyToTransfer = Math.min(p.stockQuantity, quantity);
        return {
          ...p,
          stockQuantity: p.stockQuantity - qtyToTransfer,
          damagedStock: p.damagedStock + qtyToTransfer
        };
      }
      return p;
    }));
    setFeedbackBanner(`⚠️ Quarantined ${quantity} units to Damaged Stock (${reason})`);
  };

  // --------------------------------------------------------------------------
  // CUSTOMER MUTATIONS (B2B & B2C Counter)
  // --------------------------------------------------------------------------
  const addCustomer = (customer: CustomerParty) => {
    setCustomers(prev => [{ ...customer, status: 'ACTIVE' }, ...prev]);
    setFeedbackBanner(`✅ Customer account "${customer.partyName}" registered.`);
  };

  const archiveCustomer = (customerId: string, reason?: string) => {
    const today = getTodayISODate();
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          status: 'ARCHIVED',
          archivedAt: today,
          archiveReason: reason || 'Account archived by user'
        };
      }
      return c;
    }));
    setFeedbackBanner(`📁 Customer account moved to Archived Accounts (All historical invoices & ledger preserved).`);
  };

  const reactivateCustomer = (customerId: string) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          status: 'ACTIVE',
          archivedAt: undefined,
          archiveReason: undefined
        };
      }
      return c;
    }));
    setFeedbackBanner(`✅ Customer account reactivated and restored to Active Directory.`);
  };

  const addCounterCustomer = (newBuyer: { name: string; phone: string; city: string; notes?: string }): CounterCustomer => {
    const created: CounterCustomer = {
      id: `cc-${Date.now()}`,
      name: newBuyer.name,
      phone: newBuyer.phone,
      city: newBuyer.city || 'Local',
      totalPurchasesCount: 1,
      totalSpent: 0,
      lastVisitDate: getTodayISODate(),
      notes: newBuyer.notes
    };
    setCounterCustomers(prev => [created, ...prev]);
    setFeedbackBanner(`✅ Walk-in buyer "${created.name}" (+91 ${created.phone}) saved to directory!`);
    return created;
  };

  // --------------------------------------------------------------------------
  // VENDOR MUTATIONS
  // --------------------------------------------------------------------------
  const createVendor = (vendor: VendorParty) => {
    setVendors(prev => [{ ...vendor, status: 'ACTIVE' }, ...prev]);
    setFeedbackBanner(`✅ Sourcing supplier "${vendor.name}" (${vendor.partyType}) created.`);
  };

  const archiveVendor = (vendorId: string, reason?: string) => {
    const today = getTodayISODate();
    setVendors(prev => prev.map(v => {
      if (v.id === vendorId) {
        return {
          ...v,
          status: 'INACTIVE',
          archivedAt: today,
          archiveReason: reason || 'Supplier archived by user'
        };
      }
      return v;
    }));
    setFeedbackBanner(`📁 Supplier moved to Archived Suppliers (All historical POs & ledger preserved).`);
  };

  const reactivateVendor = (vendorId: string) => {
    setVendors(prev => prev.map(v => {
      if (v.id === vendorId) {
        return {
          ...v,
          status: 'ACTIVE',
          archivedAt: undefined,
          archiveReason: undefined
        };
      }
      return v;
    }));
    setFeedbackBanner(`✅ Supplier account reactivated and restored to Active Suppliers.`);
  };

  // --------------------------------------------------------------------------
  // PURCHASE WORKFLOW (PO Creation, Warehouse Confirmation & Purchase Returns)
  // --------------------------------------------------------------------------
  const createPurchaseOrder = (po: PurchaseOrder) => {
    setPurchaseOrders(prev => [po, ...prev]);
    setFeedbackBanner(`📝 Purchase Order ${po.poNumber} issued (Status: PENDING arrival).`);
  };

  const confirmPurchaseOrderReceipt = (poId: string, receivedBy: string = 'Warehouse Bay') => {
    const targetPO = purchaseOrders.find(p => p.id === poId);
    if (!targetPO || targetPO.status === 'CONFIRMED_RECEIVED') return;

    const receiptDate = getTodayISODate();

    // 1. Mark PO Confirmed
    setPurchaseOrders(prev => prev.map(p => {
      if (p.id === poId) {
        return {
          ...p,
          status: 'CONFIRMED_RECEIVED',
          receivedDate: receiptDate,
          receivedBy
        };
      }
      return p;
    }));

    // 2. Increment Main Stock for each product
    setProducts(prev => prev.map(prod => {
      const line = targetPO.lineItems.find(l => l.productId === prod.id || l.productSku === prod.sku);
      if (line) {
        return {
          ...prod,
          stockQuantity: prod.stockQuantity + line.quantity
        };
      }
      return prod;
    }));

    // 3. Update Vendor Closing Balance (Credit / Payable)
    setVendors(prev => prev.map(v => {
      if (v.id === targetPO.vendorId) {
        return {
          ...v,
          closingBalance: v.closingBalance + targetPO.grandTotal
        };
      }
      return v;
    }));

    // 4. Update Vendor Ledger
    setVendorLedgers(prev => {
      const currentRows = prev[targetPO.vendorId] || [];
      const lastBal = currentRows.length > 0 ? currentRows[currentRows.length - 1].runningBalance : 0;
      const newBal = lastBal + targetPO.grandTotal;

      const newRow: PartyLedgerRow = {
        id: `vl-${Date.now()}`,
        date: receiptDate,
        voucherNumber: targetPO.poNumber,
        voucherType: 'PURCHASE',
        particulars: `Goods Inward Receipt — ${targetPO.lineItems.length} Product Line(s)`,
        debitAmount: 0,
        creditAmount: targetPO.grandTotal,
        runningBalance: newBal,
        balanceType: 'Cr',
        narration: `PO Inward confirmed by ${receivedBy}`
      };

      return {
        ...prev,
        [targetPO.vendorId]: [...currentRows, newRow]
      };
    });

    // 5. Post Double-Entry Journal Entry
    const newJe: FullJournalEntry = {
      id: `JE-${Date.now()}`,
      entryNumber: `JE-PO-${targetPO.poNumber.slice(-4)}`,
      date: receiptDate,
      description: `Purchase - ${targetPO.poNumber} from ${targetPO.vendorName}`,
      voucherType: 'Purchase',
      totalDebit: targetPO.grandTotal,
      totalCredit: targetPO.grandTotal,
      lines: [
        {
          id: '1',
          accountId: '13000',
          accountName: 'Sellable Polymer Inventory',
          accountGroup: 'Asset',
          debit: targetPO.subtotalTaxable,
          credit: 0,
          memo: `Inward stock from ${targetPO.poNumber}`
        },
        {
          id: '2',
          accountId: '21000',
          accountName: 'GST Input Tax Credit',
          accountGroup: 'Asset',
          debit: targetPO.totalCGST + targetPO.totalSGST + targetPO.totalIGST,
          credit: 0,
          memo: 'Input GST (Duties & Taxes)'
        },
        {
          id: '3',
          accountId: '20000',
          accountName: `Accounts Payable (${targetPO.vendorName})`,
          accountGroup: 'Liability',
          debit: 0,
          credit: targetPO.grandTotal,
          memo: `Payable for PO ${targetPO.poNumber}`
        }
      ]
    };
    addJournalEntry(newJe);

    setFeedbackBanner(`✅ PO ${targetPO.poNumber} inward confirmed! +${targetPO.lineItems.reduce((s, i) => s + i.quantity, 0)} units added to Main Stock & vendor balance credited.`);
  };

  const updatePurchaseOrder = (poId: string, updatedPO: Partial<PurchaseOrder>) => {
    const existing = purchaseOrders.find(p => p.id === poId);
    if (!existing) return;
    if (existing.status === 'CONFIRMED_RECEIVED') {
      setFeedbackBanner(`⚠️ Cannot edit PO ${existing.poNumber} because goods have already been received into inventory.`);
      return;
    }

    setPurchaseOrders(prev => prev.map(p => {
      if (p.id === poId) {
        return {
          ...p,
          ...updatedPO
        };
      }
      return p;
    }));

    setFeedbackBanner(`✏️ Purchase Order ${existing.poNumber} modified and updated in PENDING state.`);
  };

  const cancelPurchaseOrder = (poId: string, reason: string = 'Cancelled by user') => {
    const targetPO = purchaseOrders.find(p => p.id === poId);
    if (!targetPO) return;
    if (targetPO.status === 'CONFIRMED_RECEIVED') {
      setFeedbackBanner(`⚠️ Cannot cancel PO ${targetPO.poNumber} because stock has already arrived. Use Purchase Return instead.`);
      return;
    }

    setPurchaseOrders(prev => prev.map(p => {
      if (p.id === poId) {
        return {
          ...p,
          status: 'CANCELLED',
          notes: p.notes ? `${p.notes} | CANCELLED: ${reason}` : `CANCELLED: ${reason}`
        };
      }
      return p;
    }));

    setFeedbackBanner(`🚫 Purchase Order ${targetPO.poNumber} has been CANCELLED.`);
  };

  const createPurchaseReturn = (returnPayload: PurchaseReturn) => {
    setPurchaseReturns(prev => [returnPayload, ...prev]);

    // 1. Decrement Damaged Stock
    setProducts(prev => prev.map(prod => {
      const returnLine = returnPayload.lineItems.find(l => l.productId === prod.id || l.productSku === prod.sku);
      if (returnLine) {
        return {
          ...prod,
          damagedStock: Math.max(0, prod.damagedStock - returnLine.damagedQuantity)
        };
      }
      return prod;
    }));

    // 2. Decrement Vendor Closing Balance (Debit Note reduces liability)
    setVendors(prev => prev.map(v => {
      if (v.id === returnPayload.vendorId) {
        return {
          ...v,
          closingBalance: Math.max(0, v.closingBalance - returnPayload.grandTotal)
        };
      }
      return v;
    }));

    // 3. Update Vendor Ledger with Debit Note
    setVendorLedgers(prev => {
      const currentRows = prev[returnPayload.vendorId] || [];
      const lastBal = currentRows.length > 0 ? currentRows[currentRows.length - 1].runningBalance : 0;
      const newBal = lastBal - returnPayload.grandTotal;

      const newRow: PartyLedgerRow = {
        id: `vl-dn-${Date.now()}`,
        date: returnPayload.returnDate,
        voucherNumber: returnPayload.debitNoteNumber,
        voucherType: 'DEBIT_NOTE',
        particulars: `Purchase Return — Damaged/Defective Stock Return`,
        debitAmount: returnPayload.grandTotal,
        creditAmount: 0,
        runningBalance: newBal,
        balanceType: 'Cr',
        narration: returnPayload.notes || 'Damaged goods return to supplier'
      };

      return {
        ...prev,
        [returnPayload.vendorId]: [...currentRows, newRow]
      };
    });

    // 4. Post Debit Note Journal Entry
    const totalGst = returnPayload.lineItems.reduce((s, i) => s + (i.totalAmount - i.taxableAmount), 0);
    const totalTaxable = returnPayload.lineItems.reduce((s, i) => s + i.taxableAmount, 0);

    const dnJe: FullJournalEntry = {
      id: `JE-DN-${Date.now()}`,
      entryNumber: `JE-DN-${returnPayload.debitNoteNumber.slice(-4)}`,
      date: returnPayload.returnDate,
      description: `Debit Note ${returnPayload.debitNoteNumber} - Purchase Return to ${returnPayload.vendorName}`,
      voucherType: 'Debit_Note',
      totalDebit: returnPayload.grandTotal,
      totalCredit: returnPayload.grandTotal,
      lines: [
        {
          id: '1',
          accountId: '20000',
          accountName: `Accounts Payable (${returnPayload.vendorName})`,
          accountGroup: 'Liability',
          debit: returnPayload.grandTotal,
          credit: 0,
          memo: `Debit Note for Damaged Goods Return`
        },
        {
          id: '2',
          accountId: '13500',
          accountName: 'Damaged / Broken Stock',
          accountGroup: 'Asset',
          debit: 0,
          credit: totalTaxable,
          memo: 'Reduced Damaged Stock Asset'
        },
        {
          id: '3',
          accountId: '21000',
          accountName: 'GST Input Tax Credit Reversal',
          accountGroup: 'Asset',
          debit: 0,
          credit: totalGst,
          memo: 'Reversal of Input Tax'
        }
      ]
    };
    setJournalEntries(prev => [dnJe, ...prev]);

    setFeedbackBanner(`🚚 Purchase Return ${returnPayload.debitNoteNumber} posted. Damaged stock & Vendor balance adjusted.`);
  };

  // --------------------------------------------------------------------------
  // SALES WORKFLOW (Billing & Customer Sales Returns)
  // --------------------------------------------------------------------------
  const addFastOrderBill = (invoice: FinalInvoiceData) => {
    // 1. Add Invoice to persistent state
    setAllInvoices(prev => [invoice, ...prev]);
    setCurrentInvoice(invoice);

    // 2. Decrement Main Sellable Stock
    setProducts(prevProducts =>
      prevProducts.map(prod => {
        const matchingLine = invoice.lineItems.find(li => li.product.id === prod.id || li.product.sku === prod.sku);
        if (matchingLine) {
          return {
            ...prod,
            stockQuantity: Math.max(0, prod.stockQuantity - matchingLine.quantity)
          };
        }
        return prod;
      })
    );

    // 3. Update Customer Balance if B2B Credit
    if (invoice.customer.id) {
      setCustomers(prev =>
        prev.map(c => {
          if (c.id === invoice.customer.id) {
            const addedAmount = invoice.paymentMode === 'CREDIT_30_DAYS' ? invoice.grandTotal : 0;
            return {
              ...c,
              closingBalance: c.closingBalance + addedAmount
            };
          }
          return c;
        })
      );
    }

    // 4. Update B2C Walk-in Buyer Directory if counter sale
    const walkInDetails = invoice.walkInCustomerDetails;
    if (invoice.isCounterSale && walkInDetails?.phone) {
      setCounterCustomers(prev => {
        const existing = prev.find(cc => cc.phone === walkInDetails.phone);
        if (existing) {
          return prev.map(cc => cc.id === existing.id ? {
            ...cc,
            totalPurchasesCount: cc.totalPurchasesCount + 1,
            totalSpent: cc.totalSpent + invoice.grandTotal,
            lastVisitDate: invoice.invoiceDate
          } : cc);
        } else {
          const newEntry: CounterCustomer = {
            id: `cc-${Date.now()}`,
            name: walkInDetails.name,
            phone: walkInDetails.phone,
            city: walkInDetails.city || 'Local Counter',
            totalPurchasesCount: 1,
            totalSpent: invoice.grandTotal,
            lastVisitDate: invoice.invoiceDate
          };
          return [newEntry, ...prev];
        }
      });
    }

    // 5. Update Party Ledger
    setPartyLedgers(prev => {
      const currentRows = prev[invoice.customer.id] || [];
      const lastBal = currentRows.length > 0 ? currentRows[currentRows.length - 1].runningBalance : (invoice.customer.openingBalance || 0);
      const isCredit = invoice.paymentMode === 'CREDIT_30_DAYS';
      const newBal = isCredit ? lastBal + invoice.grandTotal : lastBal;

      const newRow: PartyLedgerRow = {
        id: `pl-${Date.now()}`,
        date: invoice.invoiceDate,
        voucherNumber: invoice.invoiceNumber,
        voucherType: 'SALES',
        particulars: invoice.isCounterSale 
          ? `B2C Counter Sale (${invoice.walkInCustomerDetails?.name || 'Walk-in'})` 
          : `Tax Invoice — ${invoice.lineItems.length} Product Line(s)`,
        debitAmount: invoice.grandTotal,
        creditAmount: isCredit ? 0 : invoice.grandTotal, // Immediate settlement if Cash/UPI
        runningBalance: newBal,
        balanceType: 'Dr',
        narration: `Payment Mode: ${invoice.paymentMode}`
      };

      return {
        ...prev,
        [invoice.customer.id]: [...currentRows, newRow]
      };
    });

    // 6. Post Double-Entry Journal Entry
    const totalGst = invoice.totalCGST + invoice.totalSGST + invoice.totalIGST;
    const isCredit = invoice.paymentMode === 'CREDIT_30_DAYS';

    const newJe: FullJournalEntry = {
      id: `JE-${Date.now()}`,
      entryNumber: `JE-SALES-${invoice.invoiceNumber.slice(-4)}`,
      date: invoice.invoiceDate,
      description: `Sales - ${invoice.invoiceNumber} to ${invoice.customer.partyName}`,
      voucherType: 'Sales',
      totalDebit: invoice.grandTotal,
      totalCredit: invoice.grandTotal,
      lines: [
        {
          id: '1',
          accountId: isCredit ? '12000' : '10000',
          accountName: isCredit ? `Accounts Receivable (${invoice.customer.partyName})` : 'Cash / Counter Collection',
          accountGroup: 'Asset',
          debit: invoice.grandTotal,
          credit: 0,
          memo: `Sales Invoiced against ${invoice.invoiceNumber}`
        },
        {
          id: '2',
          accountId: '40000',
          accountName: invoice.isCounterSale ? 'Counter Retail Sales Revenue' : 'Domestic Plastic Sales Revenue',
          accountGroup: 'Revenue',
          debit: 0,
          credit: invoice.subtotalTaxable,
          memo: 'Revenue earned'
        },
        {
          id: '3',
          accountId: '21000',
          accountName: 'GST Output Payable (Duties & Taxes)',
          accountGroup: 'Liability',
          debit: 0,
          credit: totalGst,
          memo: 'Output CGST + SGST + IGST'
        }
      ]
    };

    setJournalEntries(prev => [newJe, ...prev]);
    setFeedbackBanner(`🧾 Invoice ${invoice.invoiceNumber} generated! Main stock deducted & books posted.`);
  };

  const createSalesReturn = (returnPayload: SalesReturn) => {
    setSalesReturns(prev => [returnPayload, ...prev]);

    // 1. Increment Damaged Stock ONLY (Main Stock untouched!)
    setProducts(prev => prev.map(prod => {
      const returnLine = returnPayload.lineItems.find(l => l.productId === prod.id || l.productSku === prod.sku);
      if (returnLine) {
        return {
          ...prod,
          damagedStock: prod.damagedStock + returnLine.damagedQuantity
        };
      }
      return prod;
    }));

    // 2. Reduce Customer Closing Balance (Credit Note reduces receivable)
    setCustomers(prev => prev.map(c => {
      if (c.id === returnPayload.customerId) {
        return {
          ...c,
          closingBalance: Math.max(0, c.closingBalance - returnPayload.grandTotal)
        };
      }
      return c;
    }));

    // 3. Update Customer Ledger with Credit Note
    setPartyLedgers(prev => {
      const currentRows = prev[returnPayload.customerId] || [];
      const lastBal = currentRows.length > 0 ? currentRows[currentRows.length - 1].runningBalance : 0;
      const newBal = Math.max(0, lastBal - returnPayload.grandTotal);

      const newRow: PartyLedgerRow = {
        id: `pl-cn-${Date.now()}`,
        date: returnPayload.returnDate,
        voucherNumber: returnPayload.creditNoteNumber,
        voucherType: 'CREDIT_NOTE',
        particulars: `Sales Return (Broken/Damaged Goods) — Ref: ${returnPayload.invoiceRefNumber}`,
        debitAmount: 0,
        creditAmount: returnPayload.grandTotal,
        runningBalance: newBal,
        balanceType: 'Dr',
        narration: returnPayload.notes || 'Broken/defective items returned by customer'
      };

      return {
        ...prev,
        [returnPayload.customerId]: [...currentRows, newRow]
      };
    });

    // 4. Post Credit Note Journal Entry
    const cnJe: FullJournalEntry = {
      id: `JE-CN-${Date.now()}`,
      entryNumber: `JE-CN-${returnPayload.creditNoteNumber.slice(-4)}`,
      date: returnPayload.returnDate,
      description: `Credit Note ${returnPayload.creditNoteNumber} - Sales Return from ${returnPayload.customerName}`,
      voucherType: 'Credit_Note',
      totalDebit: returnPayload.grandTotal,
      totalCredit: returnPayload.grandTotal,
      lines: [
        {
          id: '1',
          accountId: '42000',
          accountName: 'Sales Returns & Allowances',
          accountGroup: 'Expense', // Contra Revenue
          debit: returnPayload.grandTotal,
          credit: 0,
          memo: `Credit Note against ${returnPayload.invoiceRefNumber}`
        },
        {
          id: '2',
          accountId: '12000',
          accountName: `Accounts Receivable (${returnPayload.customerName})`,
          accountGroup: 'Asset',
          debit: 0,
          credit: returnPayload.grandTotal,
          memo: 'Adjusted customer ledger balance'
        }
      ]
    };
    setJournalEntries(prev => [cnJe, ...prev]);

    setFeedbackBanner(`🛡️ Sales Return ${returnPayload.creditNoteNumber} processed! Added to Damaged Stock & Credit Note posted.`);
  };

  // --------------------------------------------------------------------------
  // PAYMENTS & RECEIPTS
  // --------------------------------------------------------------------------
  const recordCustomerPayment = (
    customerId: string,
    amount: number,
    paymentMode: 'NEFT_RTGS' | 'UPI' | 'CASH' | 'CHEQUE',
    referenceNo: string,
    paymentDate: string,
    narration?: string
  ) => {
    const cust = customers.find(c => c.id === customerId);
    if (!cust) return;

    // 1. Update Customer Closing Balance
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          closingBalance: Math.max(0, c.closingBalance - amount)
        };
      }
      return c;
    }));

    // 2. Update Party Ledger
    setPartyLedgers(prev => {
      const currentRows = prev[customerId] || [];
      const lastBal = currentRows.length > 0 ? currentRows[currentRows.length - 1].runningBalance : cust.closingBalance;
      const newBal = Math.max(0, lastBal - amount);

      const newRow: PartyLedgerRow = {
        id: `pl-pay-${Date.now()}`,
        date: paymentDate,
        voucherNumber: `RCPT-${Math.floor(1000 + Math.random() * 9000)}`,
        voucherType: 'RECEIPT',
        particulars: `Bank Receipt (${paymentMode}) — Ref: ${referenceNo}`,
        debitAmount: 0,
        creditAmount: amount,
        runningBalance: newBal,
        balanceType: 'Dr',
        narration: narration || `Settlement via ${paymentMode}`
      };

      return {
        ...prev,
        [customerId]: [...currentRows, newRow]
      };
    });

    // 3. Post Receipt Journal Entry
    const je: FullJournalEntry = {
      id: `JE-RCPT-${Date.now()}`,
      entryNumber: `JE-RCPT-${referenceNo.slice(-4)}`,
      date: paymentDate,
      description: `Receipt from ${cust.partyName} (${paymentMode} - ${referenceNo})`,
      voucherType: 'Receipt',
      totalDebit: amount,
      totalCredit: amount,
      lines: [
        {
          id: '1',
          accountId: paymentMode === 'CASH' ? '10000' : '10001',
          accountName: paymentMode === 'CASH' ? 'Cash in Hand' : 'HDFC Operating Bank Account',
          accountGroup: 'Asset',
          debit: amount,
          credit: 0,
          memo: `Received via ${paymentMode}`
        },
        {
          id: '2',
          accountId: '12000',
          accountName: `Accounts Receivable (${cust.partyName})`,
          accountGroup: 'Asset',
          debit: 0,
          credit: amount,
          memo: 'Customer account cleared'
        }
      ]
    };
    setJournalEntries(prev => [je, ...prev]);
    setFeedbackBanner(`💰 Payment of ₹${amount.toLocaleString('en-IN')} recorded for ${cust.partyName}!`);
  };

  const recordVendorPayment = (
    vendorId: string,
    amount: number,
    paymentMode: 'NEFT_RTGS' | 'UPI' | 'CHEQUE',
    referenceNo: string,
    paymentDate: string,
    narration?: string
  ) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) return;

    // 1. Reduce Vendor Closing Balance
    setVendors(prev => prev.map(v => {
      if (v.id === vendorId) {
        return {
          ...v,
          closingBalance: Math.max(0, v.closingBalance - amount)
        };
      }
      return v;
    }));

    // 2. Update Vendor Ledger
    setVendorLedgers(prev => {
      const currentRows = prev[vendorId] || [];
      const lastBal = currentRows.length > 0 ? currentRows[currentRows.length - 1].runningBalance : vendor.closingBalance;
      const newBal = Math.max(0, lastBal - amount);

      const newRow: PartyLedgerRow = {
        id: `vl-pay-${Date.now()}`,
        date: paymentDate,
        voucherNumber: `PMT-${Math.floor(1000 + Math.random() * 9000)}`,
        voucherType: 'PAYMENT',
        particulars: `Supplier Payment (${paymentMode}) — UTR: ${referenceNo}`,
        debitAmount: amount,
        creditAmount: 0,
        runningBalance: newBal,
        balanceType: 'Cr',
        narration: narration || `Disbursement via ${paymentMode}`
      };

      return {
        ...prev,
        [vendorId]: [...currentRows, newRow]
      };
    });

    // 3. Post Payment Journal Entry
    const je: FullJournalEntry = {
      id: `JE-PMT-${Date.now()}`,
      entryNumber: `JE-PMT-${referenceNo.slice(-4)}`,
      date: paymentDate,
      description: `Payment to ${vendor.name} (${paymentMode} - ${referenceNo})`,
      voucherType: 'Payment',
      totalDebit: amount,
      totalCredit: amount,
      lines: [
        {
          id: '1',
          accountId: '20000',
          accountName: `Accounts Payable (${vendor.name})`,
          accountGroup: 'Liability',
          debit: amount,
          credit: 0,
          memo: 'Vendor liability reduced'
        },
        {
          id: '2',
          accountId: '10001',
          accountName: 'HDFC Operating Bank Account',
          accountGroup: 'Asset',
          debit: 0,
          credit: amount,
          memo: `Disbursed via ${paymentMode}`
        }
      ]
    };
    setJournalEntries(prev => [je, ...prev]);
    setFeedbackBanner(`💳 Disbursement of ₹${amount.toLocaleString('en-IN')} paid to ${vendor.name}!`);
  };

  const addJournalEntry = (entry: FullJournalEntry) => {
    setJournalEntries(prev => [entry, ...prev]);
    setFeedbackBanner(`📒 Journal entry ${entry.entryNumber} committed to ledger.`);
  };

  return (
    <ERPContext.Provider
      value={{
        products,
        customers,
        vendors,
        counterCustomers,
        purchaseOrders,
        purchaseReturns,
        salesReturns,
        lowStockAlerts,
        bills,
        allInvoices,
        journalEntries,
        partyLedgers,
        vendorLedgers,
        currentInvoice,
        activeCompany,
        feedbackBanner,
        setActiveCompany,
        setCurrentInvoice,
        setFeedbackBanner,
        addProduct,
        bulkAddProducts,
        transferDamagedStock,
        addCustomer,
        archiveCustomer,
        reactivateCustomer,
        addCounterCustomer,
        recordCustomerPayment,
        createVendor,
        archiveVendor,
        reactivateVendor,
        recordVendorPayment,
        createPurchaseOrder,
        updatePurchaseOrder,
        cancelPurchaseOrder,
        confirmPurchaseOrderReceipt,
        createPurchaseReturn,
        addFastOrderBill,
        createSalesReturn,
        addJournalEntry,
        calculateBulkPricing
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERPData = (): ERPContextType => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERPData must be used within an ERPDataProvider');
  }
  return context;
};
