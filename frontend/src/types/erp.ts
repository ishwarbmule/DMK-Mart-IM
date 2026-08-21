// ============================================================================
// DMK MART ENTERPRISE TRADING & DISTRIBUTION TYPE DEFINITIONS
// ============================================================================

export type ModuleKey = 
  | 'dashboard'
  | 'typeahead_billing'
  | 'purchase_management'
  | 'purchase_orders'
  | 'purchase_returns'
  | 'vendor_payments'
  | 'vendors_directory'
  | 'inventory_stock'
  | 'customers'
  | 'bookkeeping'
  | 'pos'
  | 'reports'
  | 'invoice_viewer'
  | 'settings'
  | 'returns_history'
  | 'swarm_visualizer'
  // Archived modules (available for future activation)
  | 'plastics_catalog'
  | 'gst_billing'
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
  | 'bpmn';

export type PricingTierKey = 
  | 'tier1_distributor' 
  | 'tier2_wholesale' 
  | 'tier3_semi_wholesale' 
  | 'tier4_retailer' 
  | 'tier5_mrp';

export interface PricingTiers {
  tier1_distributor: number;      // Super Stockist / Master Distributor Rate (Lowest Base)
  tier2_wholesale: number;        // Wholesaler / Bulk Crate Volume Rate
  tier3_semi_wholesale: number;   // Semi-Wholesale / Sub-Dealer Rate
  tier4_retailer: number;         // Retail Shop / Contractor Rate
  tier5_mrp: number;              // Maximum Retail Price (Direct End Customer)
}

export type PackagingFormat = 
  | 'PIECE'          // 1 unit (Base rate)
  | 'PACKET_5'       // 5 units packet (-5% bulk discount)
  | 'SET_10'         // 10 units set (-8% bulk discount)
  | 'BOX_12'         // 12 units box (-12% bulk discount)
  | 'CRATE_24'       // 24 units industrial crate (-15% bulk discount)
  | 'MASTER_LOT_50'; // 50+ units master lot (-20% bulk discount)

export interface BulkDiscountRule {
  format: PackagingFormat;
  minQty: number;
  discountPct: number;
  label: string;
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
  
  // Dual Stock Architecture
  stockQuantity: number;      // Main Sellable Stock
  damagedStock: number;       // Damaged / Broken / Defective Stock
  lowStockThreshold: number;  // Alert triggered when stockQuantity <= threshold
  
  // Sourcing & Vendor Binding
  manufacturerName?: string;  // e.g. "Nilkamal Plastics", "Supreme Industries", "DMK In-House"
  purchaseBaseCost: number;   // Standard procurement cost per unit
  
  pricing: PricingTiers;
  companyId: string;          // Belongs to specific vertical
  barcode?: string;
  isPopular?: boolean;
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

// ----------------------------------------------------------------------------
// VENDORS & SUPPLIERS (Manufacturers & Distributors)
// ----------------------------------------------------------------------------
export type VendorType = 'MANUFACTURER' | 'DISTRIBUTOR';

export interface VendorParty {
  id: string;
  vendorCode: string;
  name: string;
  brandName?: string;         // Brand name if Manufacturer (e.g. "Nilkamal", "Supreme")
  partyType: VendorType;
  gstin?: string;
  phone: string;
  email?: string;
  city: string;
  stateCode: string;
  address?: string;
  
  // Financial Ledger Balances
  openingBalance: number;
  closingBalance: number;     // Live dynamic balance (Payable to vendor)
  balanceType: 'Cr' | 'Dr';   // Usually 'Cr' (Payable liability)
  creditTermsDays: number;
  status: 'ACTIVE' | 'INACTIVE';
  archivedAt?: string;
  archiveReason?: string;
  
  // Product Portfolio
  productsOffered?: string[]; // Specific SKU IDs or category filters
}

// ----------------------------------------------------------------------------
// PURCHASE ORDERS & GOODS INWARD LIFECYCLE
// ----------------------------------------------------------------------------
export type PurchaseOrderStatus = 'PENDING' | 'CONFIRMED_RECEIVED' | 'CANCELLED';

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  hsnCode: string;
  quantity: number;
  packagingFormat?: PackagingFormat;
  unitCost: number;
  taxableAmount: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  vendorType: VendorType;
  orderDate: string;
  receivedDate?: string;
  status: PurchaseOrderStatus;
  lineItems: PurchaseOrderItem[];
  subtotalTaxable: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  grandTotal: number;
  notes?: string;
  receivedBy?: string;
  companyId?: string;
}

// ----------------------------------------------------------------------------
// PURCHASE RETURNS (Debit Notes for Damaged / Broken Goods)
// ----------------------------------------------------------------------------
export interface PurchaseReturnItem {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  damagedQuantity: number;
  unitCost: number;
  taxableAmount: number;
  gstRate: number;
  totalAmount: number;
  reasonForReturn: string;
}

export interface PurchaseReturn {
  id: string;
  debitNoteNumber: string;
  poRefNumber?: string;
  vendorId: string;
  vendorName: string;
  returnDate: string;
  lineItems: PurchaseReturnItem[];
  grandTotal: number;
  status: 'POSTED';
  notes?: string;
}

// ----------------------------------------------------------------------------
// CUSTOMERS & BUYERS (B2B Location-First & B2C Counter)
// ----------------------------------------------------------------------------
export type CustomerType = 
  | 'B2B_DISTRIBUTOR' 
  | 'B2B_WHOLESALER' 
  | 'B2B_RETAILER' 
  | 'B2C_COUNTER_WALKIN'
  | 'DISTRIBUTOR'
  | 'WHOLESALER'
  | 'RETAILER'
  | 'CASH_CUSTOMER';

export interface CustomerParty {
  id: string;
  partyName: string;          // Formatted as "[Location] [Firm Name]" e.g. "Latur Ishwar Mule"
  rawFirmName?: string;       // e.g. "Ishwar Mule"
  city: string;               // e.g. "Latur"
  stateCode: string;
  gstin?: string;
  phone: string;
  email?: string;
  partyType: CustomerType;
  assignedTier: PricingTierKey;
  
  // Ledger Balances
  openingBalance?: number;
  closingBalance: number;     // Live dynamic balance (Receivable)
  outstandingBalance?: number;// Optional alias for closingBalance
  balanceType: 'Dr' | 'Cr';   // Usually 'Dr' (Receivable asset)
  creditLimit: number;
  creditDays?: number;

  // Account Lifecycle & Archival Status
  status?: 'ACTIVE' | 'ARCHIVED' | 'INACTIVE';
  archivedAt?: string;
  archiveReason?: string;
}

export interface CounterCustomer {
  id: string;
  name: string;
  phone: string;
  city: string;
  totalPurchasesCount: number;
  totalSpent: number;
  lastVisitDate: string;
  notes?: string;
}

// ----------------------------------------------------------------------------
// SALES RETURNS (Credit Notes for Damaged Goods Returned by Customers)
// ----------------------------------------------------------------------------
export type DamageDefectType = 'BROKEN' | 'CRACKED' | 'DEFECTIVE_MOULD' | 'COLOR_DEFECT' | 'TRANSIT_DAMAGE';

export interface SalesReturnItem {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  damagedQuantity: number;
  unitPrice: number;
  gstRate: number;
  totalAmount: number;
  damageType: DamageDefectType;
  notes?: string;
}

export interface SalesReturn {
  id: string;
  creditNoteNumber: string;
  invoiceRefNumber: string;
  customerId: string;
  customerName: string;
  returnDate: string;
  lineItems: SalesReturnItem[];
  grandTotal: number;
  status: 'POSTED';
  refundMode: 'CREDIT_TO_LEDGER' | 'CASH_REFUND' | 'UPI_REFUND';
  notes?: string;
}

// ----------------------------------------------------------------------------
// BILLING & INVOICING
// ----------------------------------------------------------------------------
export interface BilledLineItem {
  id: string;
  product: PlasticProductItem;
  selectedTier: PricingTierKey;
  packagingFormat?: PackagingFormat;
  unitPrice: number;
  baseTierPrice?: number;
  bulkDiscountPct?: number;    // Discount from quantity/format (e.g. 8% for Set of 10)
  bulkSavingsRupees?: number;  // Exact savings
  quantity: number;
  unitOfMeasure: string;
  discountPct: number;        // Manual discount
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
  isCounterSale?: boolean;
  walkInCustomerDetails?: {
    name: string;
    phone: string;
    city: string;
  };
}

// ----------------------------------------------------------------------------
// LOW STOCK ALERT
// ----------------------------------------------------------------------------
export interface LowStockAlert {
  productId: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  threshold: number;
  deficitQuantity: number;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  preferredVendorName?: string;
  estimatedReorderCost: number;
}

// ----------------------------------------------------------------------------
// DOUBLE-ENTRY BOOKKEEPING & JOURNAL
// ----------------------------------------------------------------------------
export type VoucherType = 
  | 'SALES' 
  | 'PURCHASE' 
  | 'PAYMENT' 
  | 'RECEIPT' 
  | 'JOURNAL' 
  | 'CONTRA' 
  | 'CREDIT_NOTE' 
  | 'DEBIT_NOTE';

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

// ----------------------------------------------------------------------------
// LEGACY & ARCHIVED MODULE TYPES (Retained for compatibility)
// ----------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------
// AI SWARM & COPILOT
// ----------------------------------------------------------------------------
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
