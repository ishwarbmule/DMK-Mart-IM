import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  PlasticProductItem, 
  CustomerParty, 
  CompanyVertical, 
  FinalInvoiceData, 
  PricingTierKey 
} from '../types/erp';
import { INITIAL_PLASTICS_CATALOG } from '../data/plasticsCatalog';
import { MOCK_CUSTOMERS, DMK_COMPANIES } from '../data/multiCompanyData';

// Journal Entry & Ledger Types
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
  voucherType: 'Sales' | 'Purchase' | 'Payment' | 'Receipt' | 'Contra' | 'Journal';
  totalDebit: number;
  totalCredit: number;
  lines: JournalLineItem[];
}

export interface PartyLedgerRow {
  id: string;
  date: string;
  voucherNumber: string;
  voucherType: 'SALES' | 'RECEIPT' | 'CREDIT_NOTE' | 'JOURNAL';
  particulars: string;
  debitAmount: number;
  creditAmount: number;
  runningBalance: number;
  balanceType: 'Dr' | 'Cr';
  narration: string;
}

export interface BillRecord {
  billNumber: string;
  date: string;
  customer: CustomerParty;
  type: 'Sales' | 'Purchase';
  itemCount: number;
  taxableAmount: number;
  totalGst: number;
  grandTotal: number;
  balanceDue: number;
  status: 'Invoiced' | 'Paid' | 'Partially Paid' | 'Confirmed' | 'Draft';
  paymentMode: string;
  companyCode: string;
}

interface ERPContextType {
  // Master State
  products: PlasticProductItem[];
  customers: CustomerParty[];
  bills: BillRecord[];
  journalEntries: FullJournalEntry[];
  partyLedgers: Record<string, PartyLedgerRow[]>;
  currentInvoice: FinalInvoiceData | null;
  activeCompany: CompanyVertical;
  feedbackBanner: string | null;

  // Actions
  setActiveCompany: (company: CompanyVertical) => void;
  setCurrentInvoice: (invoice: FinalInvoiceData | null) => void;
  setFeedbackBanner: (msg: string | null) => void;
  addFastOrderBill: (invoice: FinalInvoiceData) => void;
  addProduct: (product: PlasticProductItem) => void;
  bulkAddProducts: (newProducts: PlasticProductItem[]) => void;
  addCustomer: (customer: CustomerParty) => void;
  addJournalEntry: (entry: FullJournalEntry) => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

// Initial Party Ledgers
const INITIAL_PARTY_LEDGERS: Record<string, PartyLedgerRow[]> = {
  'cust-01': [
    { id: '1', date: '2026-08-01', voucherNumber: 'OB-2026-001', voucherType: 'JOURNAL', particulars: 'Opening Balance (Brought Forward)', debitAmount: 145000, creditAmount: 0, runningBalance: 145000, balanceType: 'Dr', narration: 'FY 2026-27 Opening Balance' }
  ],
  'cust-02': [
    { id: '1', date: '2026-08-01', voucherNumber: 'OB-2026-002', voucherType: 'JOURNAL', particulars: 'Opening Balance (Brought Forward)', debitAmount: 85000, creditAmount: 0, runningBalance: 85000, balanceType: 'Dr', narration: 'Opening Dr' }
  ]
};

// Initial Journal Entries
const INITIAL_JOURNAL_ENTRIES: FullJournalEntry[] = [
  {
    id: 'JE-2026-0001',
    entryNumber: 'JE-2026-0001',
    date: '2026-08-15',
    description: 'Sales - BILL-2026-4010 to Sri Venkateswara Plastic Agencies',
    voucherType: 'Sales',
    totalDebit: 171100,
    totalCredit: 171100,
    lines: [
      { id: '1', accountId: '12000', accountName: 'Accounts Receivable (Sundry Debtors)', accountGroup: 'Asset', debit: 171100, credit: 0, memo: 'To Sri Venkateswara Plastic Agencies' },
      { id: '2', accountId: '40000', accountName: 'Domestic Plastic Sales Revenue', accountGroup: 'Revenue', debit: 0, credit: 145000, memo: 'By 100 Pcs Royal High-Back Chairs' },
      { id: '3', accountId: '21000', accountName: 'GST Payable (Duties & Taxes)', accountGroup: 'Liability', debit: 0, credit: 26100, memo: 'By Output CGST (9%) + SGST (9%)' }
    ]
  },
  {
    id: 'JE-2026-0002',
    entryNumber: 'JE-2026-0002',
    date: '2026-08-14',
    description: 'Bank Receipt - NEFT against Invoice DPM/26-27/4010',
    voucherType: 'Receipt',
    totalDebit: 75000,
    totalCredit: 75000,
    lines: [
      { id: '1', accountId: '10001', accountName: 'HDFC Operating Bank Account', accountGroup: 'Asset', debit: 75000, credit: 0, memo: 'NEFT UTR #HDFCN2608081290' },
      { id: '2', accountId: '12000', accountName: 'Accounts Receivable (Sundry Debtors)', accountGroup: 'Asset', debit: 0, credit: 75000, memo: 'Part payment Sri Venkateswara' }
    ]
  }
];

// Initial Past Bills Register
const INITIAL_BILLS: BillRecord[] = [
  {
    billNumber: 'DPM/26-27/4012',
    date: '2026-08-15',
    customer: MOCK_CUSTOMERS[0],
    type: 'Sales',
    itemCount: 4,
    taxableAmount: 145000,
    totalGst: 26100,
    grandTotal: 171100,
    balanceDue: 0,
    status: 'Invoiced',
    paymentMode: 'Credit (30 Days)',
    companyCode: 'COMP_01'
  },
  {
    billNumber: 'DPM/26-27/4011',
    date: '2026-08-14',
    customer: MOCK_CUSTOMERS[1],
    type: 'Sales',
    itemCount: 2,
    taxableAmount: 82000,
    totalGst: 14760,
    grandTotal: 96760,
    balanceDue: 0,
    status: 'Invoiced',
    paymentMode: 'Bank NEFT',
    companyCode: 'COMP_01'
  },
  {
    billNumber: 'DPM/26-27/4010',
    date: '2026-08-12',
    customer: MOCK_CUSTOMERS[2],
    type: 'Sales',
    itemCount: 6,
    taxableAmount: 215000,
    totalGst: 38700,
    grandTotal: 253700,
    balanceDue: 0,
    status: 'Invoiced',
    paymentMode: 'Instant UPI',
    companyCode: 'COMP_01'
  }
];

export const ERPDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<PlasticProductItem[]>(INITIAL_PLASTICS_CATALOG);
  const [customers, setCustomers] = useState<CustomerParty[]>(MOCK_CUSTOMERS);
  const [bills, setBills] = useState<BillRecord[]>(INITIAL_BILLS);
  const [journalEntries, setJournalEntries] = useState<FullJournalEntry[]>(INITIAL_JOURNAL_ENTRIES);
  const [partyLedgers, setPartyLedgers] = useState<Record<string, PartyLedgerRow[]>>(INITIAL_PARTY_LEDGERS);
  const [currentInvoice, setCurrentInvoice] = useState<FinalInvoiceData | null>(null);
  const [activeCompany, setActiveCompany] = useState<CompanyVertical>(DMK_COMPANIES[0]);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Universal Cross-Module Order Sync Action
  const addFastOrderBill = (invoice: FinalInvoiceData) => {
    // 1. Update Customer Balance
    setCustomers(prev => prev.map(c => {
      if (c.id === invoice.customer.id || c.partyName === invoice.customer.partyName) {
        return {
          ...c,
          outstandingBalance: c.outstandingBalance + invoice.grandTotal,
          balanceType: 'Dr'
        };
      }
      return c;
    }));

    // 2. Append to Customer 360 Party Ledger
    const custId = invoice.customer.id;
    const existingLedger = partyLedgers[custId] || [];
    const prevBalance = existingLedger.length > 0 ? existingLedger[existingLedger.length - 1].runningBalance : invoice.customer.outstandingBalance;
    const newRunningBalance = prevBalance + invoice.grandTotal;

    const newLedgerRow: PartyLedgerRow = {
      id: `pl-${Date.now()}`,
      date: invoice.invoiceDate,
      voucherNumber: invoice.invoiceNumber,
      voucherType: 'SALES',
      particulars: `Sales Inv (${invoice.company.shortName}) - ${invoice.lineItems.map(l => `${l.quantity}x ${l.product.name}`).slice(0, 2).join(', ')}${invoice.lineItems.length > 2 ? '...' : ''}`,
      debitAmount: invoice.grandTotal,
      creditAmount: 0,
      runningBalance: newRunningBalance,
      balanceType: 'Dr',
      narration: `Billed under ${invoice.paymentMode}. 5-Tier rates calculated.`
    };

    setPartyLedgers(prev => ({
      ...prev,
      [custId]: [...(prev[custId] || []), newLedgerRow]
    }));

    // 3. Deduct Inventory Stock in Plastics Master
    setProducts(prev => prev.map(prod => {
      const lineMatch = invoice.lineItems.find(l => l.product.id === prod.id || l.product.sku === prod.sku);
      if (lineMatch) {
        return {
          ...prod,
          stockQuantity: Math.max(0, prod.stockQuantity - lineMatch.quantity)
        };
      }
      return prod;
    }));

    // 4. Post Double-Entry Journal Entry in Tally Financials
    const totalGst = invoice.totalCGST + invoice.totalSGST + invoice.totalIGST;
    const newJournalEntry: FullJournalEntry = {
      id: `JE-${Date.now()}`,
      entryNumber: `JE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: invoice.invoiceDate,
      description: `Sales - ${invoice.invoiceNumber} to ${invoice.customer.partyName}`,
      voucherType: 'Sales',
      totalDebit: invoice.grandTotal,
      totalCredit: invoice.grandTotal,
      lines: [
        {
          id: '1',
          accountId: '12000',
          accountName: 'Accounts Receivable (Sundry Debtors)',
          accountGroup: 'Asset',
          debit: invoice.grandTotal,
          credit: 0,
          memo: `To ${invoice.customer.partyName} (Inv: ${invoice.invoiceNumber})`
        },
        {
          id: '2',
          accountId: '40000',
          accountName: 'Domestic Plastic Sales Revenue',
          accountGroup: 'Revenue',
          debit: 0,
          credit: invoice.subtotalTaxable,
          memo: `By ${invoice.lineItems.length} product line(s)`
        },
        {
          id: '3',
          accountId: '21000',
          accountName: 'GST Payable (Duties & Taxes)',
          accountGroup: 'Liability',
          debit: 0,
          credit: totalGst,
          memo: `By Output ${invoice.totalIGST > 0 ? 'IGST (18%)' : 'CGST (9%) + SGST (9%)'}`
        }
      ]
    };

    setJournalEntries(prev => [newJournalEntry, ...prev]);

    // 5. Prepend to Bills Register
    const newBill: BillRecord = {
      billNumber: invoice.invoiceNumber,
      date: invoice.invoiceDate,
      customer: invoice.customer,
      type: 'Sales',
      itemCount: invoice.lineItems.length,
      taxableAmount: invoice.subtotalTaxable,
      totalGst,
      grandTotal: invoice.grandTotal,
      balanceDue: 0,
      status: 'Invoiced',
      paymentMode: invoice.paymentMode,
      companyCode: invoice.company.companyCode
    };

    setBills(prev => [newBill, ...prev]);

    // 6. Set Active Invoice
    setCurrentInvoice(invoice);

    // 7. Global Notification Banner
    setFeedbackBanner(`✅ Fast Order #${invoice.invoiceNumber} (₹${invoice.grandTotal.toLocaleString('en-IN')}) successfully posted to Customer Ledger, Inventory Stock, and Tally Financials.`);
    setTimeout(() => setFeedbackBanner(null), 6000);
  };

  const addProduct = (product: PlasticProductItem) => {
    setProducts(prev => [product, ...prev]);
  };

  const bulkAddProducts = (newProducts: PlasticProductItem[]) => {
    setProducts(prev => [...newProducts, ...prev]);
  };

  const addCustomer = (customer: CustomerParty) => {
    setCustomers(prev => [customer, ...prev]);
  };

  const addJournalEntry = (entry: FullJournalEntry) => {
    setJournalEntries(prev => [entry, ...prev]);
  };

  return (
    <ERPContext.Provider
      value={{
        products,
        customers,
        bills,
        journalEntries,
        partyLedgers,
        currentInvoice,
        activeCompany,
        feedbackBanner,
        setActiveCompany,
        setCurrentInvoice,
        setFeedbackBanner,
        addFastOrderBill,
        addProduct,
        bulkAddProducts,
        addCustomer,
        addJournalEntry
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERPData = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERPData must be used within an ERPDataProvider');
  }
  return context;
};
