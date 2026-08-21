import { 
  CompanyVertical, 
  CustomerParty, 
  VendorParty, 
  CounterCustomer, 
  PurchaseOrder, 
  PurchaseReturn, 
  SalesReturn 
} from '../types/erp';

export const DMK_MART_COMPANY: CompanyVertical = {
  id: 'comp-01',
  companyCode: 'DMK-MART',
  companyName: 'DMK Mart Enterprise Pvt Ltd',
  shortName: 'DMK Mart',
  gstin: '33AABFD1029P1ZX',
  stateCode: '33', // Tamil Nadu / MH operating
  registeredAddress: 'Plot 42-45, Industrial SIPCOT Estate, Hosur, Tamil Nadu - 635126',
  contactEmail: 'contact@dmkmart.com',
  contactPhone: '+91 94432 10987',
  bankDetails: {
    bankName: 'HDFC Bank Ltd',
    accountNumber: '50200098172635',
    ifscCode: 'HDFC0001248',
    branchName: 'Hosur Industrial Complex'
  },
  invoicePrefix: 'DMK/26-27/',
  themeAccent: '#FF6B00'
};

export const DMK_COMPANIES: CompanyVertical[] = [DMK_MART_COMPANY];

// ----------------------------------------------------------------------------
// SUPPLIERS & VENDORS (Manufacturers vs Distributors)
// ----------------------------------------------------------------------------
export const INITIAL_VENDORS: VendorParty[] = [
  {
    id: 'vnd-01',
    vendorCode: 'VND-NILKAMAL',
    name: 'Nilkamal Plastics Ltd',
    brandName: 'Nilkamal Plastics',
    partyType: 'MANUFACTURER',
    gstin: '27AAACN0192F1Z4',
    phone: '+91 22 2857 7777',
    email: 'orders@nilkamal.com',
    city: 'Mumbai',
    stateCode: '27',
    openingBalance: 350000,
    closingBalance: 485000,
    balanceType: 'Cr', // Payable
    creditTermsDays: 45,
    status: 'ACTIVE',
    productsOffered: ['DMK-CHR-ROYAL', 'DMK-CHR-ELEGANCE', 'DMK-BIN-PEDAL-30L']
  },
  {
    id: 'vnd-02',
    vendorCode: 'VND-SUPREME',
    name: 'Supreme Industries Ltd',
    brandName: 'Supreme Industries',
    partyType: 'MANUFACTURER',
    gstin: '27AAACS1829Q1Z9',
    phone: '+91 22 4043 0000',
    email: 'plastics@supreme.co.in',
    city: 'Mumbai',
    stateCode: '27',
    openingBalance: 220000,
    closingBalance: 340000,
    balanceType: 'Cr',
    creditTermsDays: 30,
    status: 'ACTIVE',
    productsOffered: ['DMK-STL-BATH20', 'DMK-BSN-18INCH', 'DMK-CRT-IND-JUMBO', 'DMK-PAL-IND-4WAY']
  },
  {
    id: 'vnd-03',
    vendorCode: 'VND-DMK-MFG',
    name: 'DMK In-House Moulding Works',
    brandName: 'DMK In-House Plastics',
    partyType: 'MANUFACTURER',
    gstin: '33AABFD1029P1ZX',
    phone: '+91 94432 10987',
    email: 'factory@dmkmart.com',
    city: 'Hosur',
    stateCode: '33',
    openingBalance: 0,
    closingBalance: 125000,
    balanceType: 'Cr',
    creditTermsDays: 15,
    status: 'ACTIVE',
    productsOffered: ['DMK-BKT-20L-HD', 'DMK-BKT-25L-TRAN', 'DMK-DRUM-50L-STG']
  },
  {
    id: 'vnd-04',
    vendorCode: 'VND-CELLO',
    name: 'Cello Polymer Solutions Pvt Ltd',
    brandName: 'Cello Polymer',
    partyType: 'MANUFACTURER',
    gstin: '24AAACC4019M1Z2',
    phone: '+91 260 224 1100',
    email: 'supply@celloplast.com',
    city: 'Daman',
    stateCode: '25',
    openingBalance: 140000,
    closingBalance: 195000,
    balanceType: 'Cr',
    creditTermsDays: 30,
    status: 'ACTIVE',
    productsOffered: ['DMK-JAR-6PC-SET', 'DMK-MUG-1.5L-BOX']
  },
  {
    id: 'vnd-05',
    vendorCode: 'VND-NAT-DIST',
    name: 'National Multi-Brand Polymer Distributors',
    partyType: 'DISTRIBUTOR',
    gstin: '27AABCN8899K1Z5',
    phone: '+91 98220 55443',
    email: 'sales@nationaldist.com',
    city: 'Pune',
    stateCode: '27',
    openingBalance: 480000,
    closingBalance: 610000,
    balanceType: 'Cr',
    creditTermsDays: 60,
    status: 'ACTIVE'
  },
  {
    id: 'vnd-06',
    vendorCode: 'VND-APEX-HUB',
    name: 'Apex Wholesale Plastic Goods Aggregators',
    partyType: 'DISTRIBUTOR',
    gstin: '33AAACA9012R1Z8',
    phone: '+91 94441 77665',
    email: 'info@apexhub.in',
    city: 'Chennai',
    stateCode: '33',
    openingBalance: 190000,
    closingBalance: 275000,
    balanceType: 'Cr',
    creditTermsDays: 45,
    status: 'ACTIVE'
  }
];

// ----------------------------------------------------------------------------
// B2B CUSTOMERS & BUYERS (Formatted as "[Location] [Firm Name]")
// ----------------------------------------------------------------------------
export const MOCK_CUSTOMERS: CustomerParty[] = [
  {
    id: 'cust-01',
    partyName: 'Latur Ishwar Mule',
    rawFirmName: 'Ishwar Mule Plastic Trading Co.',
    city: 'Latur',
    stateCode: '27',
    gstin: '27AAAPM4412F1Z1',
    phone: '+91 98221 44556',
    email: 'ishwar.mule@gmail.com',
    partyType: 'B2B_DISTRIBUTOR',
    assignedTier: 'tier1_distributor',
    openingBalance: 145000,
    closingBalance: 316100,
    balanceType: 'Dr',
    creditLimit: 750000,
    creditDays: 30
  },
  {
    id: 'cust-02',
    partyName: 'Pune Sri Venkateswara Plastic Agencies',
    rawFirmName: 'Sri Venkateswara Plastic Agencies',
    city: 'Pune',
    stateCode: '27',
    gstin: '27AABCS4412F1Z2',
    phone: '+91 98401 22334',
    email: 'venkateswara.plastics@gmail.com',
    partyType: 'B2B_WHOLESALER',
    assignedTier: 'tier2_wholesale',
    openingBalance: 85000,
    closingBalance: 185000,
    balanceType: 'Dr',
    creditLimit: 500000,
    creditDays: 30
  },
  {
    id: 'cust-03',
    partyName: 'Solapur Ganesh Traders',
    rawFirmName: 'Ganesh Household & Plastic Traders',
    city: 'Solapur',
    stateCode: '27',
    gstin: '27AABCG9918E1Z8',
    phone: '+91 98800 11223',
    email: 'ganesh.solapur@gmail.com',
    partyType: 'B2B_WHOLESALER',
    assignedTier: 'tier2_wholesale',
    openingBalance: 120000,
    closingBalance: 245000,
    balanceType: 'Dr',
    creditLimit: 400000,
    creditDays: 21
  },
  {
    id: 'cust-04',
    partyName: 'Kolhapur Mahalaxmi Plastic Mart',
    rawFirmName: 'Mahalaxmi Plastic Mart',
    city: 'Kolhapur',
    stateCode: '27',
    gstin: '27AAACR5512D1Z4',
    phone: '+91 99490 88776',
    email: 'mahalaxmi.mart@gmail.com',
    partyType: 'B2B_RETAILER',
    assignedTier: 'tier4_retailer',
    openingBalance: 45000,
    closingBalance: 82000,
    balanceType: 'Dr',
    creditLimit: 250000,
    creditDays: 15
  },
  {
    id: 'cust-05',
    partyName: 'Chennai Balaji Polymer Traders',
    rawFirmName: 'Balaji Polymer Traders & Mouldings',
    city: 'Chennai',
    stateCode: '33',
    gstin: '33AABCB1092Q1Z9',
    phone: '+91 94440 55667',
    email: 'balaji.polymers@rediffmail.com',
    partyType: 'B2B_DISTRIBUTOR',
    assignedTier: 'tier1_distributor',
    openingBalance: 320000,
    closingBalance: 460000,
    balanceType: 'Dr',
    creditLimit: 800000,
    creditDays: 45
  },
  {
    id: 'cust-06',
    partyName: 'Mumbai Mahalakshmi Supermart',
    rawFirmName: 'Mahalakshmi Supermart & Distribution',
    city: 'Mumbai',
    stateCode: '27',
    gstin: '27AAECM8812K1Z3',
    phone: '+91 98200 44332',
    email: 'orders@mahalakshmimumbai.com',
    partyType: 'B2B_RETAILER',
    assignedTier: 'tier4_retailer',
    openingBalance: 30000,
    closingBalance: 72000,
    balanceType: 'Dr',
    creditLimit: 200000,
    creditDays: 15
  },
  {
    id: 'cust-07',
    partyName: 'Nagpur Royal Polymer Distribution',
    rawFirmName: 'Royal Polymer Distribution Hub',
    city: 'Nagpur',
    stateCode: '27',
    gstin: '27AABCR9911K1ZX',
    phone: '+91 97654 32100',
    email: 'royal.nagpur@gmail.com',
    partyType: 'B2B_WHOLESALER',
    assignedTier: 'tier3_semi_wholesale',
    openingBalance: 90000,
    closingBalance: 165000,
    balanceType: 'Dr',
    creditLimit: 350000,
    creditDays: 30
  },
  {
    id: 'cust-08',
    partyName: 'B2C Walk-In Counter Sales',
    rawFirmName: 'Retail Counter Sales (General)',
    city: 'Local Counter',
    stateCode: '33',
    phone: '+91 99999 00000',
    partyType: 'B2C_COUNTER_WALKIN',
    assignedTier: 'tier5_mrp',
    openingBalance: 0,
    closingBalance: 0,
    balanceType: 'Cr',
    creditLimit: 0,
    creditDays: 0
  }
];

// ----------------------------------------------------------------------------
// PERSISTENT B2C COUNTER BUYERS DIRECTORY
// ----------------------------------------------------------------------------
export const INITIAL_COUNTER_CUSTOMERS: CounterCustomer[] = [
  {
    id: 'cc-01',
    name: 'Ramesh Pawar',
    phone: '9823411223',
    city: 'Latur',
    totalPurchasesCount: 8,
    totalSpent: 18450,
    lastVisitDate: new Date().toISOString().split('T')[0],
    notes: 'Regular buyer for household buckets and kitchen sets'
  },
  {
    id: 'cc-02',
    name: 'Sunita Patil',
    phone: '9765444556',
    city: 'Pune',
    totalPurchasesCount: 5,
    totalSpent: 9200,
    lastVisitDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    notes: 'Bought royal chairs set for catering shop'
  },
  {
    id: 'cc-03',
    name: 'Rajesh Deshmukh',
    phone: '9422088990',
    city: 'Solapur',
    totalPurchasesCount: 12,
    totalSpent: 34500,
    lastVisitDate: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
    notes: 'Buys vegetable crates for farm dispatch'
  },
  {
    id: 'cc-04',
    name: 'Amit Shinde',
    phone: '9890123456',
    city: 'Latur',
    totalPurchasesCount: 3,
    totalSpent: 4800,
    lastVisitDate: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
    notes: 'Purchased kitchen modular containers and bathroom stools'
  }
];

// ----------------------------------------------------------------------------
// INITIAL PURCHASE ORDERS (Sample Pending & Confirmed)
// ----------------------------------------------------------------------------
export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-01',
    poNumber: 'PO-2026-1081',
    vendorId: 'vnd-01',
    vendorName: 'Nilkamal Plastics Ltd',
    vendorType: 'MANUFACTURER',
    orderDate: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    receivedDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    status: 'CONFIRMED_RECEIVED',
    lineItems: [
      {
        id: 'poi-01',
        productId: 'p-01',
        productSku: 'DMK-CHR-ROYAL',
        productName: 'DMK Royal High-Back Arm Chair (Heavy Duty)',
        hsnCode: '94018000',
        quantity: 100,
        unitCost: 310.00,
        taxableAmount: 31000.00,
        gstRate: 18,
        cgstAmount: 2790.00,
        sgstAmount: 2790.00,
        igstAmount: 0,
        totalAmount: 36580.00
      }
    ],
    subtotalTaxable: 31000.00,
    totalCGST: 2790.00,
    totalSGST: 2790.00,
    totalIGST: 0,
    grandTotal: 36580.00,
    notes: 'Inward receipt confirmed at Warehouse Bay 4.',
    receivedBy: 'Warehouse Manager'
  },
  {
    id: 'po-02',
    poNumber: 'PO-2026-1082',
    vendorId: 'vnd-02',
    vendorName: 'Supreme Industries Ltd',
    vendorType: 'MANUFACTURER',
    orderDate: new Date().toISOString().split('T')[0],
    status: 'PENDING',
    lineItems: [
      {
        id: 'poi-02',
        productId: 'p-10',
        productSku: 'DMK-PAL-IND-4WAY',
        productName: 'DMK 4-Way Entry Heavy Industrial Plastic Pallet',
        hsnCode: '39239090',
        quantity: 20,
        unitCost: 1950.00,
        taxableAmount: 39000.00,
        gstRate: 18,
        cgstAmount: 3510.00,
        sgstAmount: 3510.00,
        igstAmount: 0,
        totalAmount: 46020.00
      }
    ],
    subtotalTaxable: 39000.00,
    totalCGST: 3510.00,
    totalSGST: 3510.00,
    totalIGST: 0,
    grandTotal: 46020.00,
    notes: 'Urgent restocking for low inventory pallet stock. Awaiting shipment dispatch.'
  }
];

// ----------------------------------------------------------------------------
// INITIAL PURCHASE RETURNS (Debit Notes)
// ----------------------------------------------------------------------------
export const INITIAL_PURCHASE_RETURNS: PurchaseReturn[] = [
  {
    id: 'pr-01',
    debitNoteNumber: 'DN-2026-0041',
    poRefNumber: 'PO-2026-1081',
    vendorId: 'vnd-01',
    vendorName: 'Nilkamal Plastics Ltd',
    returnDate: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
    lineItems: [
      {
        id: 'pri-01',
        productId: 'p-01',
        productSku: 'DMK-CHR-ROYAL',
        productName: 'DMK Royal High-Back Arm Chair',
        damagedQuantity: 2,
        unitCost: 310.00,
        taxableAmount: 620.00,
        gstRate: 18,
        totalAmount: 731.60,
        reasonForReturn: 'Moulding armrest crack observed during warehouse inspection'
      }
    ],
    grandTotal: 731.60,
    status: 'POSTED',
    notes: 'Debit note adjusted against pending invoice payable.'
  }
];

// ----------------------------------------------------------------------------
// INITIAL SALES RETURNS (Credit Notes)
// ----------------------------------------------------------------------------
export const INITIAL_SALES_RETURNS: SalesReturn[] = [
  {
    id: 'sr-01',
    creditNoteNumber: 'CN-2026-0019',
    invoiceRefNumber: 'DMK/26-27/4010',
    customerId: 'cust-01',
    customerName: 'Latur Ishwar Mule',
    returnDate: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
    lineItems: [
      {
        id: 'sri-01',
        productId: 'p-01',
        productSku: 'DMK-CHR-ROYAL',
        productName: 'DMK Royal High-Back Arm Chair',
        damagedQuantity: 2,
        unitPrice: 380.00,
        gstRate: 18,
        totalAmount: 896.80,
        damageType: 'CRACKED',
        notes: 'Transit stress crack reported upon unboxing at Latur depot.'
      }
    ],
    grandTotal: 896.80,
    status: 'POSTED',
    refundMode: 'CREDIT_TO_LEDGER',
    notes: 'Credited to customer ledger; broken items quarantined to Damaged Stock.'
  }
];
