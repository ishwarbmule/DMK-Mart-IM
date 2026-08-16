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
import { INITIAL_ALL_INVOICES } from '../data/mockInvoices';
import { getTodayISODate, getOffsetISODate } from '../utils/dateUtils';

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

interface ERPContextType {
  // Master State
  products: PlasticProductItem[];
  customers: CustomerParty[];
  bills: BillRecord[];
  allInvoices: FinalInvoiceData[];
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
  recordCustomerPayment: (
    customerId: string,
    amount: number,
    paymentMode: 'NEFT_RTGS' | 'UPI' | 'CASH' | 'CHEQUE',
    referenceNo: string,
    paymentDate: string,
    narration?: string
  ) => void;
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
  ]
};

// Initial Journal Entries
const INITIAL_JOURNAL_ENTRIES: FullJournalEntry[] = [
  {
    id: 'JE-2026-0001',
    entryNumber: 'JE-2026-0001',
    date: getTodayISODate(),
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
    date: getOffsetISODate(-1),
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
    date: getTodayISODate(),
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
    date: getOffsetISODate(-1),
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
    date: getOffsetISODate(-3),
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
  const [allInvoices, setAllInvoices] = useState<FinalInvoiceData[]>(INITIAL_ALL_INVOICES);
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

    // 6. Prepend to All Invoices Master Register
    setAllInvoices(prev => [invoice, ...prev]);

    // 7. Set Active Invoice
    setCurrentInvoice(invoice);

    // 8. Global Notification Banner
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

  const recordCustomerPayment = (
    customerId: string,
    amount: number,
    paymentMode: 'NEFT_RTGS' | 'UPI' | 'CASH' | 'CHEQUE',
    referenceNo: string,
    paymentDate: string,
    narration?: string
  ) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    // 1. Update Customer outstanding balance
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        const newBal = Math.max(0, c.outstandingBalance - amount);
        return {
          ...c,
          outstandingBalance: newBal
        };
      }
      return c;
    }));

    // 2. Append to Party Ledger (Credit)
    const existingLedger = partyLedgers[customerId] || [];
    const prevBal = existingLedger.length > 0 ? existingLedger[existingLedger.length - 1].runningBalance : customer.outstandingBalance;
    const newBal = prevBal - amount;

    const newLedgerRow: PartyLedgerRow = {
      id: `pl-rec-${Date.now()}`,
      date: paymentDate,
      voucherNumber: referenceNo || `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      voucherType: 'RECEIPT',
      particulars: `Payment Received via ${paymentMode.replace('_', ' ')} (${referenceNo || 'Direct Settlement'})`,
      debitAmount: 0,
      creditAmount: amount,
      runningBalance: Math.abs(newBal),
      balanceType: newBal >= 0 ? 'Dr' : 'Cr',
      narration: narration || `Settlement received against open invoices via ${paymentMode}`
    };

    setPartyLedgers(prev => ({
      ...prev,
      [customerId]: [...(prev[customerId] || []), newLedgerRow]
    }));

    // 3. Post Double-Entry Journal (Debit Cash/Bank, Credit Sundry Debtors)
    const isCash = paymentMode === 'CASH';
    const newJournal: FullJournalEntry = {
      id: `JE-REC-${Date.now()}`,
      entryNumber: `JE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: paymentDate,
      description: `Receipt - ${paymentMode} from ${customer.partyName} (Ref: ${referenceNo || 'Direct Pay'})`,
      voucherType: 'Receipt',
      totalDebit: amount,
      totalCredit: amount,
      lines: [
        {
          id: '1',
          accountId: isCash ? '10000' : '10001',
          accountName: isCash ? 'Cash in Hand (Factory Counter)' : 'HDFC Operating Bank Account',
          accountGroup: 'Asset',
          debit: amount,
          credit: 0,
          memo: `Receipt via ${paymentMode} Ref: ${referenceNo}`
        },
        {
          id: '2',
          accountId: '12000',
          accountName: 'Accounts Receivable (Sundry Debtors)',
          accountGroup: 'Asset',
          debit: 0,
          credit: amount,
          memo: `Settlement for ${customer.partyName}`
        }
      ]
    };

    setJournalEntries(prev => [newJournal, ...prev]);

    setFeedbackBanner(`✅ Payment Receipt of ₹${amount.toLocaleString('en-IN')} (${paymentMode}) recorded successfully for ${customer.partyName}.`);
    setTimeout(() => setFeedbackBanner(null), 6000);
  };

  return (
    <ERPContext.Provider
      value={{
        products,
        customers,
        bills,
        allInvoices,
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
        addJournalEntry,
        recordCustomerPayment
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
