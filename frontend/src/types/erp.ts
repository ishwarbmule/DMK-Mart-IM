// ============================================================================
// DMK MART ENTERPRISE & PLASTIC MANUFACTURING TYPE DEFINITIONS
// ============================================================================

export type ModuleKey = 
  | 'dashboard'
  | 'typeahead_billing'
  | 'plastics_catalog'
  | 'customers'
  | 'bookkeeping'
  | 'reports'
  | 'settings'
  | 'pos'
  | 'gst_billing'
  | 'invoice_viewer'
  | 'finance'
  | 'scm'
  | 'wms'
  | 'mes'
  | 'hcm'
  | 'crm'
  | 'psa'
  | 'eam'
  | 'qms'
  | 'doc_ai'
  | 'bpmn'
  | 'swarm_visualizer';

export type PricingTierKey = 'tier1_distributor' | 'tier2_wholesale' | 'tier3_semi_wholesale' | 'tier4_retailer' | 'tier5_mrp';

export interface PricingTiers {
  tier1_distributor: number;      // Super Stockist / Master Distributor Rate (Lowest Base)
  tier2_wholesale: number;        // Wholesaler / Bulk Crate Volume Rate
  tier3_semi_wholesale: number;   // Semi-Wholesale / Sub-Dealer Rate
  tier4_retailer: number;         // Retail Shop / Contractor Rate
  tier5_mrp: number;              // Maximum Retail Price (Direct End Customer)
}

export interface PlasticProductItem {
  id: string;
  sku: string;
  name: string;
  category: 'Chairs & Stools' | 'Buckets & Basins' | 'Kitchen Storage & Jars' | 'Crates & Industrial' | 'Cleaning & Dustbins' | 'Bath & Mugs';
  material: 'Virgin Polypropylene (PP)' | 'High-Density Polyethylene (HDPE)' | 'Food Grade Plastic';
  hsnCode: string;
  gstRate: number; // e.g. 5, 12, 18
  unitOfMeasure: 'Pcs' | 'Dozen' | 'Box (12 Pcs)' | 'Crate (24 Pcs)' | 'Set';
  weightGrams: number;
  colorOptions: string[];
  stockQuantity: number;
  pricing: PricingTiers;
  companyId: string; // Belongs to specific vertical
}

export interface CompanyVertical {
  id: string;
  companyCode: string;
  companyName: string;
  shortName: string;
  gstin: string;
  stateCode: string;
  registeredAddress: string;
  contactEmail: string;
  contactPhone: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    branchName: string;
  };
  invoicePrefix: string;
  themeAccent: string;
}

export type VoucherType = 'SALES' | 'PURCHASE' | 'PAYMENT' | 'RECEIPT' | 'JOURNAL' | 'CONTRA' | 'CREDIT_NOTE' | 'DEBIT_NOTE';

export interface LedgerEntry {
  id: string;
  voucherNumber: string;
  voucherType: VoucherType;
  date: string;
  particulars: string;
  accountName: string;
  accountGroup: 'Current Assets (Sundry Debtors)' | 'Current Liabilities (Sundry Creditors)' | 'Sales Accounts' | 'Purchase Accounts' | 'Direct Expenses' | 'Indirect Expenses' | 'Bank Accounts' | 'Cash-in-Hand';
  debitAmount: number;
  creditAmount: number;
  runningBalance: number;
  balanceType: 'Dr' | 'Cr';
  narration: string;
  companyId: string;
}

export interface CustomerParty {
  id: string;
  partyName: string;
  gstin?: string;
  stateCode: string;
  phone: string;
  email?: string;
  city: string;
  partyType: 'DISTRIBUTOR' | 'WHOLESALER' | 'RETAILER' | 'CASH_CUSTOMER';
  assignedTier: PricingTierKey;
  outstandingBalance: number;
  balanceType: 'Dr' | 'Cr';
  creditLimit: number;
}

export interface BilledLineItem {
  id: string;
  product: PlasticProductItem;
  selectedTier: PricingTierKey;
  unitPrice: number;
  quantity: number;
  unitOfMeasure: string;
  discountPct: number;
  taxableAmount: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

export interface FinalInvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  company: CompanyVertical;
  customer: CustomerParty;
  lineItems: BilledLineItem[];
  subtotalTaxable: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  roundOff: number;
  grandTotal: number;
  amountInWords: string;
  paymentMode: 'CREDIT_30_DAYS' | 'CASH' | 'NEFT_RTGS' | 'UPI';
  notes: string;
}

export interface TenantInfo {
  id: string;
  slug: string;
  legalName: string;
  currency: string;
  planTier: string;
  autoApprovalThreshold: number;
}

export interface KPICard {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  subtext: string;
  category: 'finance' | 'operations' | 'ai' | 'supply_chain';
}

export interface JournalLine {
  id: string;
  accountNumber: string;
  accountName: string;
  entrySide: 'DEBIT' | 'CREDIT';
  amount: number;
  memo: string;
  costCenter?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  postingDate: string;
  sourceModule: string;
  headerMemo: string;
  totalDebit: number;
  totalCredit: number;
  status: 'POSTED' | 'DRAFT' | 'PENDING_APPROVAL';
  lines: JournalLine[];
  aiConfidence?: number;
}

export interface TrialBalanceRow {
  accountNumber: string;
  accountName: string;
  accountClass: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  totalDebit: number;
  totalCredit: number;
  netBalance: number;
}

export interface APInvoiceMatch {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  invoiceAmount: number;
  poNumber: string;
  poAmount: number;
  grnNumber: string;
  varianceAmount: number;
  status: 'AUTO_MATCHED' | 'FLAGGED_EXCEPTION' | 'AWAITING_APPROVAL';
  confidenceScore: number;
}

export interface DynamicROPConfig {
  sku: string;
  itemName: string;
  avgDailyDemand: number;
  stddevDemand: number;
  avgLeadTimeDays: number;
  stddevLeadTimeDays: number;
  serviceLevelZ: number;
  currentStock: number;
}

export interface SupplierItem {
  id: string;
  code: string;
  name: string;
  ratingScore: number;
  qualityPPM: number;
  onTimeDeliveryPct: number;
  paymentTerms: string;
  status: 'TIER_1_PREFERRED' | 'APPROVED' | 'PROBATION';
}

export interface BOMComponent {
  id: string;
  sku: string;
  name: string;
  quantityRequired: number;
  scrapFactorPct: number;
  unitCost: number;
  subComponents?: BOMComponent[];
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  itemSku: string;
  itemName: string;
  plannedQty: number;
  completedQty: number;
  startDate: string;
  dueDate: string;
  workCenter: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'HOLD';
  oeeScore: number;
}

export interface Employee {
  id: string;
  code: string;
  name: string;
  title: string;
  department: string;
  salary: number;
  salaryCurrency: string;
  status: 'ACTIVE' | 'ON_LEAVE';
  skills: string[];
}

export interface AgentTaskStep {
  stepId: number;
  assignedAgent: string;
  actionVerb: string;
  description: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'AWAITING_APPROVAL';
  requiresHumanApproval: boolean;
  details?: Record<string, any>;
}

export interface AgentExecutionMessage {
  id: string;
  sender: 'user' | 'orchestrator' | 'agent' | 'system';
  agentName?: string;
  content: string;
  timestamp: string;
  confidenceScore?: number;
  planSteps?: AgentTaskStep[];
  reasoningTrace?: string[];
  suggestedAction?: {
    label: string;
    actionType: string;
    payload: any;
  };
}
