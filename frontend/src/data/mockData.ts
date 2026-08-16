import { 
  KPICard, 
  JournalEntry, 
  TrialBalanceRow, 
  APInvoiceMatch, 
  DynamicROPConfig, 
  SupplierItem, 
  BOMComponent, 
  WorkOrder, 
  Employee 
} from '../types/erp';

export const INITIAL_KPIS: KPICard[] = [
  {
    title: 'Real-Time Working Capital',
    value: '₹1,48,20,500',
    change: '+8.4% vs last mo',
    isPositive: true,
    subtext: 'Optimized via dynamic early-pay discounts',
    category: 'finance'
  },
  {
    title: 'Autonomous Straight-Through Rate',
    value: '84.2%',
    change: '+3.1% this week',
    isPositive: true,
    subtext: '12,410 transactions zero-touch auto-posted',
    category: 'ai'
  },
  {
    title: 'Overall Equipment Effectiveness (OEE)',
    value: '89.6%',
    change: '+1.8% vs benchmark',
    isPositive: true,
    subtext: '12 active CNC/Robotic work centers',
    category: 'operations'
  },
  {
    title: 'Supply Chain OTIF Velocity',
    value: '97.4%',
    change: '+0.5% vs SLA target',
    isPositive: true,
    subtext: 'Dynamic ROP preventing stockouts',
    category: 'supply_chain'
  }
];

export const MOCK_TRIAL_BALANCE: TrialBalanceRow[] = [
  { accountNumber: '1010', accountName: 'Operating Cash & Treasury', accountClass: 'ASSET', totalDebit: 18500000, totalCredit: 3679500, netBalance: 14820500 },
  { accountNumber: '1100', accountName: 'Accounts Receivable (Trade)', accountClass: 'ASSET', totalDebit: 8450000, totalCredit: 1200000, netBalance: 7250000 },
  { accountNumber: '1200', accountName: 'Finished Goods Inventory', accountClass: 'ASSET', totalDebit: 12400000, totalCredit: 4100000, netBalance: 8300000 },
  { accountNumber: '1300', accountName: 'Raw Materials & Components', accountClass: 'ASSET', totalDebit: 6200000, totalCredit: 1800000, netBalance: 4400000 },
  { accountNumber: '2010', accountName: 'Accounts Payable (Trade)', accountClass: 'LIABILITY', totalDebit: 3400000, totalCredit: 7800000, netBalance: -4400000 },
  { accountNumber: '2100', accountName: 'Accrued Payroll & Taxes', accountClass: 'LIABILITY', totalDebit: 1100000, totalCredit: 2300000, netBalance: -1200000 },
  { accountNumber: '3010', accountName: 'Common Stock & Retained Earnings', accountClass: 'EQUITY', totalDebit: 0, totalCredit: 24170500, netBalance: -24170500 },
  { accountNumber: '4010', accountName: 'Enterprise SaaS & Product Revenue', accountClass: 'REVENUE', totalDebit: 500000, totalCredit: 16500000, netBalance: -16000000 },
  { accountNumber: '5010', accountName: 'Cost of Goods Sold (BOM Execution)', accountClass: 'EXPENSE', totalDebit: 7800000, totalCredit: 200000, netBalance: 7600000 },
  { accountNumber: '6010', accountName: 'R&D Engineering & AI Infrastructure', accountClass: 'EXPENSE', totalDebit: 3400000, totalCredit: 0, netBalance: 3400000 }
];

export const MOCK_AP_MATCHES: APInvoiceMatch[] = [
  {
    id: 'match-01',
    invoiceNumber: 'INV-2026-0091',
    vendorName: 'Global Steel Dynamics Corp',
    invoiceAmount: 4200.00,
    poNumber: 'PO-2026-0811',
    poAmount: 4200.00,
    grnNumber: 'GRN-2026-0419',
    varianceAmount: 0.00,
    status: 'AUTO_MATCHED',
    confidenceScore: 0.998
  },
  {
    id: 'match-02',
    invoiceNumber: 'INV-2026-0092',
    vendorName: 'Apex Semiconductor Components',
    invoiceAmount: 18450.00,
    poNumber: 'PO-2026-0815',
    poAmount: 18000.00,
    grnNumber: 'GRN-2026-0422',
    varianceAmount: 450.00,
    status: 'FLAGGED_EXCEPTION',
    confidenceScore: 0.742
  },
  {
    id: 'match-03',
    invoiceNumber: 'INV-2026-0093',
    vendorName: 'Titanium Aerospace Alloys',
    invoiceAmount: 12500.00,
    poNumber: 'PO-2026-0819',
    poAmount: 12500.00,
    grnNumber: 'GRN-2026-0425',
    varianceAmount: 0.00,
    status: 'AWAITING_APPROVAL',
    confidenceScore: 0.965
  }
];

export const MOCK_ROP_ITEMS: DynamicROPConfig[] = [
  {
    sku: 'RAW-STL-404',
    itemName: 'Aerospace Grade 316L Stainless Bar (50mm)',
    avgDailyDemand: 150,
    stddevDemand: 30,
    avgLeadTimeDays: 14,
    stddevLeadTimeDays: 3,
    serviceLevelZ: 2.326, // 99%
    currentStock: 1850
  },
  {
    sku: 'ELEC-MCU-88X',
    itemName: 'Industrial RISC-V Real-time MCU (16-Core)',
    avgDailyDemand: 400,
    stddevDemand: 75,
    avgLeadTimeDays: 21,
    stddevLeadTimeDays: 5,
    serviceLevelZ: 2.326,
    currentStock: 3400
  },
  {
    sku: 'POLY-RES-90',
    itemName: 'High-Temp Thermoplastic Resin (Pellets 25kg)',
    avgDailyDemand: 80,
    stddevDemand: 15,
    avgLeadTimeDays: 7,
    stddevLeadTimeDays: 1.5,
    serviceLevelZ: 2.054, // 98%
    currentStock: 1200
  }
];

export const MOCK_SUPPLIERS: SupplierItem[] = [
  { id: 'vnd-1', code: 'VND-GLOBAL-STEEL', name: 'Global Steel Dynamics Corp', ratingScore: 98.5, qualityPPM: 12, onTimeDeliveryPct: 99.2, paymentTerms: '2/10 Net 30', status: 'TIER_1_PREFERRED' },
  { id: 'vnd-2', code: 'VND-APEX-SEMI', name: 'Apex Semiconductor Components', ratingScore: 92.4, qualityPPM: 85, onTimeDeliveryPct: 94.8, paymentTerms: 'Net 30', status: 'APPROVED' },
  { id: 'vnd-3', code: 'VND-TITAN-ALLOY', name: 'Titanium Aerospace Alloys', ratingScore: 99.1, qualityPPM: 5, onTimeDeliveryPct: 99.7, paymentTerms: '1/10 Net 30', status: 'TIER_1_PREFERRED' },
  { id: 'vnd-4', code: 'VND-POLY-GLOBAL', name: 'Polymer Technologies Ltd', ratingScore: 84.0, qualityPPM: 240, onTimeDeliveryPct: 88.5, paymentTerms: 'Net 45', status: 'PROBATION' }
];

export const MOCK_BOM_TREE: BOMComponent = {
  id: 'bom-root-01',
  sku: 'FG-ROBOT-ARM-X1',
  name: '6-Axis Autonomous Industrial Robotic Arm',
  quantityRequired: 1,
  scrapFactorPct: 0,
  unitCost: 14500,
  subComponents: [
    {
      id: 'bom-sub-01',
      sku: 'SUB-ACTUATOR-ASSY',
      name: 'Harmonic Drive Actuator Sub-Assembly (x6)',
      quantityRequired: 6,
      scrapFactorPct: 2,
      unitCost: 1200,
      subComponents: [
        { id: 'bom-raw-01', sku: 'RAW-STL-404', name: '316L Stainless Core Shaft', quantityRequired: 1.2, scrapFactorPct: 5, unitCost: 150 },
        { id: 'bom-raw-02', sku: 'ELEC-MOTOR-BRUSHLESS', name: '48V High-Torque BLDC Motor', quantityRequired: 1, scrapFactorPct: 1, unitCost: 450 }
      ]
    },
    {
      id: 'bom-sub-02',
      sku: 'SUB-CTRL-BOARD',
      name: 'Master AI Controller & Power Board',
      quantityRequired: 1,
      scrapFactorPct: 1,
      unitCost: 2800,
      subComponents: [
        { id: 'bom-raw-03', sku: 'ELEC-MCU-88X', name: 'RISC-V MCU', quantityRequired: 2, scrapFactorPct: 0, unitCost: 350 },
        { id: 'bom-raw-04', sku: 'PCB-MULTILAYER-8L', name: '8-Layer Immersion Gold PCB', quantityRequired: 1, scrapFactorPct: 3, unitCost: 180 }
      ]
    }
  ]
};

export const MOCK_WORK_ORDERS: WorkOrder[] = [
  { id: 'wo-01', orderNumber: 'WO-2026-5011', itemSku: 'FG-ROBOT-ARM-X1', itemName: '6-Axis Industrial Robotic Arm', plannedQty: 25, completedQty: 18, startDate: '2026-08-10', dueDate: '2026-08-16', workCenter: 'WC-ROBOTICS-LINE-A', status: 'IN_PROGRESS', oeeScore: 92.4 },
  { id: 'wo-02', orderNumber: 'WO-2026-5012', itemSku: 'SUB-ACTUATOR-ASSY', itemName: 'Harmonic Drive Actuator Sub-Assembly', plannedQty: 150, completedQty: 150, startDate: '2026-08-08', dueDate: '2026-08-14', workCenter: 'WC-PRECISION-CNC-01', status: 'COMPLETED', oeeScore: 95.8 },
  { id: 'wo-03', orderNumber: 'WO-2026-5013', itemSku: 'SUB-CTRL-BOARD', itemName: 'Master AI Controller & Power Board', plannedQty: 50, completedQty: 10, startDate: '2026-08-12', dueDate: '2026-08-18', workCenter: 'WC-SMT-ASSEMBLY-02', status: 'IN_PROGRESS', oeeScore: 88.1 }
];

export const MOCK_EMPLOYEES: Employee[] = [
  { id: 'emp-01', code: 'EMP-1001', name: 'Dr. Sarah Jenkins', title: 'Chief Financial Officer & VP Treasury', department: 'Finance & Treasury', salary: 2850000, salaryCurrency: 'INR', status: 'ACTIVE', skills: ['Financial Modeling', 'GAAP/IFRS', 'M&A', 'SOX Compliance'] },
  { id: 'emp-02', code: 'EMP-1002', name: 'Marcus Vance', title: 'VP Global Supply Chain & Logistics', department: 'Supply Chain', salary: 2200000, salaryCurrency: 'INR', status: 'ACTIVE', skills: ['Strategic Sourcing', 'Dynamic ROP', 'WMS 3D Topology', 'Vendor Negotiation'] },
  { id: 'emp-03', code: 'EMP-1003', name: 'Elena Rostova', title: 'Principal MES & Automation Architect', department: 'Manufacturing', salary: 1950000, salaryCurrency: 'INR', status: 'ACTIVE', skills: ['MRP-II Scheduling', 'OPC-UA / MQTT', 'OEE Telemetry', 'BOM Engineering'] },
  { id: 'emp-04', code: 'EMP-1004', name: 'David Chen', title: 'Lead AI & Agent Systems Engineer', department: 'R&D / Core AI', salary: 2100000, salaryCurrency: 'INR', status: 'ACTIVE', skills: ['LangGraph', 'PyTorch TFT', 'RLBF Pipeline', 'LayoutLMv3 OCR'] }
];
