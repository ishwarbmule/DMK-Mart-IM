import { FinalInvoiceData, BilledLineItem } from '../types/erp';
import { DMK_MART_COMPANY, MOCK_CUSTOMERS } from './multiCompanyData';
import { INITIAL_PLASTICS_CATALOG } from './plasticsCatalog';
import { getTodayISODate, getOffsetISODate } from '../utils/dateUtils';

// Helper to construct realistic invoice line items for DMK Mart
const buildLineItems = (
  customerIdx: number,
  skuIndices: { idx: number; qty: number; tierKey: 'tier1_distributor' | 'tier2_wholesale' | 'tier3_semi_wholesale' | 'tier4_retailer' | 'tier5_mrp' }[]
): { lineItems: BilledLineItem[]; subtotalTaxable: number; totalCGST: number; totalSGST: number; totalIGST: number; grandTotal: number; roundOff: number } => {
  const company = DMK_MART_COMPANY;
  const customer = MOCK_CUSTOMERS[customerIdx % MOCK_CUSTOMERS.length];
  const isIntraState = company.stateCode === customer.stateCode;

  const lineItems: BilledLineItem[] = skuIndices.map((item, i) => {
    const prod = INITIAL_PLASTICS_CATALOG[item.idx % INITIAL_PLASTICS_CATALOG.length];
    const price = prod.pricing[item.tierKey] || prod.pricing.tier1_distributor;
    const taxable = item.qty * price;
    const gstRate = prod.gstRate || 18;
    const taxAmt = taxable * (gstRate / 100);

    return {
      id: `dmk-li-${i + 1}-${prod.id}`,
      product: prod,
      selectedTier: item.tierKey,
      packagingFormat: 'PIECE',
      unitPrice: price,
      baseTierPrice: price,
      bulkDiscountPct: 0,
      bulkSavingsRupees: 0,
      quantity: item.qty,
      unitOfMeasure: prod.unitOfMeasure,
      discountPct: 0,
      taxableAmount: taxable,
      gstRate,
      cgstAmount: isIntraState ? taxAmt / 2 : 0,
      sgstAmount: isIntraState ? taxAmt / 2 : 0,
      igstAmount: isIntraState ? 0 : taxAmt,
      totalAmount: taxable + taxAmt
    };
  });

  const subtotalTaxable = lineItems.reduce((acc, l) => acc + l.taxableAmount, 0);
  const totalCGST = lineItems.reduce((acc, l) => acc + l.cgstAmount, 0);
  const totalSGST = lineItems.reduce((acc, l) => acc + l.sgstAmount, 0);
  const totalIGST = lineItems.reduce((acc, l) => acc + l.igstAmount, 0);
  const rawGrandTotal = subtotalTaxable + totalCGST + totalSGST + totalIGST;
  const grandTotal = Math.round(rawGrandTotal);
  const roundOff = grandTotal - rawGrandTotal;

  return { lineItems, subtotalTaxable, totalCGST, totalSGST, totalIGST, grandTotal, roundOff };
};

const inv1 = buildLineItems(0, [
  { idx: 0, qty: 150, tierKey: 'tier1_distributor' },
  { idx: 1, qty: 100, tierKey: 'tier1_distributor' },
  { idx: 4, qty: 200, tierKey: 'tier1_distributor' },
  { idx: 6, qty: 80, tierKey: 'tier1_distributor' }
]);

const inv2 = buildLineItems(1, [
  { idx: 2, qty: 120, tierKey: 'tier2_wholesale' },
  { idx: 3, qty: 60, tierKey: 'tier2_wholesale' },
  { idx: 7, qty: 250, tierKey: 'tier2_wholesale' }
]);

const inv3 = buildLineItems(2, [
  { idx: 5, qty: 180, tierKey: 'tier2_wholesale' },
  { idx: 8, qty: 300, tierKey: 'tier2_wholesale' },
  { idx: 9, qty: 90, tierKey: 'tier2_wholesale' },
  { idx: 10, qty: 140, tierKey: 'tier2_wholesale' },
  { idx: 0, qty: 50, tierKey: 'tier2_wholesale' }
]);

const inv4 = buildLineItems(3, [
  { idx: 6, qty: 350, tierKey: 'tier1_distributor' },
  { idx: 7, qty: 400, tierKey: 'tier1_distributor' },
  { idx: 11, qty: 120, tierKey: 'tier1_distributor' }
]);

const inv5 = buildLineItems(4, [
  { idx: 1, qty: 40, tierKey: 'tier4_retailer' },
  { idx: 2, qty: 30, tierKey: 'tier4_retailer' },
  { idx: 5, qty: 60, tierKey: 'tier4_retailer' }
]);

const inv6 = buildLineItems(3, [
  { idx: 0, qty: 80, tierKey: 'tier2_wholesale' },
  { idx: 4, qty: 110, tierKey: 'tier2_wholesale' }
]);

const inv7 = buildLineItems(0, [
  { idx: 3, qty: 200, tierKey: 'tier1_distributor' },
  { idx: 8, qty: 150, tierKey: 'tier1_distributor' },
  { idx: 9, qty: 80, tierKey: 'tier1_distributor' }
]);

const inv8 = buildLineItems(5, [
  { idx: 2, qty: 15, tierKey: 'tier5_mrp' },
  { idx: 5, qty: 20, tierKey: 'tier5_mrp' }
]);

const inv9 = buildLineItems(7, [
  { idx: 0, qty: 12, tierKey: 'tier5_mrp' },
  { idx: 2, qty: 20, tierKey: 'tier5_mrp' },
  { idx: 4, qty: 15, tierKey: 'tier5_mrp' }
]);

const inv10 = buildLineItems(7, [
  { idx: 1, qty: 8, tierKey: 'tier5_mrp' },
  { idx: 5, qty: 10, tierKey: 'tier5_mrp' }
]);

const inv11 = buildLineItems(7, [
  { idx: 6, qty: 30, tierKey: 'tier5_mrp' },
  { idx: 8, qty: 25, tierKey: 'tier5_mrp' }
]);

const inv12 = buildLineItems(7, [
  { idx: 3, qty: 6, tierKey: 'tier5_mrp' },
  { idx: 7, qty: 10, tierKey: 'tier5_mrp' }
]);

export const INITIAL_ALL_INVOICES: FinalInvoiceData[] = [
  {
    invoiceNumber: 'DMK/26-27/4024',
    invoiceDate: getTodayISODate(),
    company: DMK_MART_COMPANY,
    customer: MOCK_CUSTOMERS[7],
    lineItems: inv9.lineItems,
    subtotalTaxable: inv9.subtotalTaxable,
    totalCGST: inv9.totalCGST,
    totalSGST: inv9.totalSGST,
    totalIGST: inv9.totalIGST,
    roundOff: inv9.roundOff,
    grandTotal: inv9.grandTotal,
    amountInWords: `INR ${inv9.grandTotal.toLocaleString('en-IN')} Rupees Only`,
    paymentMode: 'UPI',
    notes: 'Express B2C Walk-in Retail Counter Invoice. QR verified instant payment.',
    isCounterSale: true,
    walkInCustomerDetails: {
      name: 'Ramesh Pawar',
      phone: '9823411223',
      city: 'Latur'
    }
  },
  {
    invoiceNumber: 'DMK/26-27/4023',
    invoiceDate: getOffsetISODate(-1),
    company: DMK_MART_COMPANY,
    customer: MOCK_CUSTOMERS[7],
    lineItems: inv10.lineItems,
    subtotalTaxable: inv10.subtotalTaxable,
    totalCGST: inv10.totalCGST,
    totalSGST: inv10.totalSGST,
    totalIGST: inv10.totalIGST,
    roundOff: inv10.roundOff,
    grandTotal: inv10.grandTotal,
    amountInWords: `INR ${inv10.grandTotal.toLocaleString('en-IN')} Rupees Only`,
    paymentMode: 'CASH',
    notes: 'Walk-in Counter Retail Sale. Spot cash payment receipt.',
    isCounterSale: true,
    walkInCustomerDetails: {
      name: 'Sunita Patil',
      phone: '9765444556',
      city: 'Pune'
    }
  },
  {
    invoiceNumber: 'DMK/26-27/4022',
    invoiceDate: getOffsetISODate(-2),
    company: DMK_MART_COMPANY,
    customer: MOCK_CUSTOMERS[7],
    lineItems: inv11.lineItems,
    subtotalTaxable: inv11.subtotalTaxable,
    totalCGST: inv11.totalCGST,
    totalSGST: inv11.totalSGST,
    totalIGST: inv11.totalIGST,
    roundOff: inv11.roundOff,
    grandTotal: inv11.grandTotal,
    amountInWords: `INR ${inv11.grandTotal.toLocaleString('en-IN')} Rupees Only`,
    paymentMode: 'UPI',
    notes: 'Bulk retail crate procurement for agricultural storage.',
    isCounterSale: true,
    walkInCustomerDetails: {
      name: 'Rajesh Deshmukh',
      phone: '9422088990',
      city: 'Solapur'
    }
  },
  {
    invoiceNumber: 'DMK/26-27/4021',
    invoiceDate: getOffsetISODate(-4),
    company: DMK_MART_COMPANY,
    customer: MOCK_CUSTOMERS[7],
    lineItems: inv12.lineItems,
    subtotalTaxable: inv12.subtotalTaxable,
    totalCGST: inv12.totalCGST,
    totalSGST: inv12.totalSGST,
    totalIGST: inv12.totalIGST,
    roundOff: inv12.roundOff,
    grandTotal: inv12.grandTotal,
    amountInWords: `INR ${inv12.grandTotal.toLocaleString('en-IN')} Rupees Only`,
    paymentMode: 'CASH',
    notes: 'Household plastic wares counter purchase.',
    isCounterSale: true,
    walkInCustomerDetails: {
      name: 'Amit Shinde',
      phone: '9890123456',
      city: 'Latur'
    }
  },
  {
    invoiceNumber: 'DMK/26-27/4019',
    invoiceDate: getTodayISODate(),
    company: DMK_MART_COMPANY,
    customer: MOCK_CUSTOMERS[0],
    lineItems: inv1.lineItems,
    subtotalTaxable: inv1.subtotalTaxable,
    totalCGST: inv1.totalCGST,
    totalSGST: inv1.totalSGST,
    totalIGST: inv1.totalIGST,
    roundOff: inv1.roundOff,
    grandTotal: inv1.grandTotal,
    amountInWords: `INR ${inv1.grandTotal.toLocaleString('en-IN')} Rupees Only`,
    paymentMode: 'NEFT_RTGS',
    notes: 'Official Tax Invoice generated with 5-Tier Distributor pricing. Goods dispatched via SIPCOT Express.'
  },
  {
    invoiceNumber: 'DMK/26-27/4018',
    invoiceDate: getOffsetISODate(-1),
    company: DMK_MART_COMPANY,
    customer: MOCK_CUSTOMERS[1],
    lineItems: inv2.lineItems,
    subtotalTaxable: inv2.subtotalTaxable,
    totalCGST: inv2.totalCGST,
    totalSGST: inv2.totalSGST,
    totalIGST: inv2.totalIGST,
    roundOff: inv2.roundOff,
    grandTotal: inv2.grandTotal,
    amountInWords: `INR ${inv2.grandTotal.toLocaleString('en-IN')} Rupees Only`,
    paymentMode: 'NEFT_RTGS',
    notes: 'Interstate IGST billed to Karnataka. E-Way Bill #291084810291 generated.'
  },
  {
    invoiceNumber: 'DMK/26-27/4017',
    invoiceDate: getOffsetISODate(-2),
    company: DMK_MART_COMPANY,
    customer: MOCK_CUSTOMERS[2],
    lineItems: inv3.lineItems,
    subtotalTaxable: inv3.subtotalTaxable,
    totalCGST: inv3.totalCGST,
    totalSGST: inv3.totalSGST,
    totalIGST: inv3.totalIGST,
    roundOff: inv3.roundOff,
    grandTotal: inv3.grandTotal,
    amountInWords: `INR ${inv3.grandTotal.toLocaleString('en-IN')} Rupees Only`,
    paymentMode: 'CREDIT_30_DAYS',
    notes: 'Kitchen & Houseware batch order. 30 Days credit terms under Master Agreement.'
  },
  {
    invoiceNumber: 'DMK/26-27/4016',
    invoiceDate: getOffsetISODate(-3),
    company: DMK_MART_COMPANY,
    customer: MOCK_CUSTOMERS[3],
    lineItems: inv4.lineItems,
    subtotalTaxable: inv4.subtotalTaxable,
    totalCGST: inv4.totalCGST,
    totalSGST: inv4.totalSGST,
    totalIGST: inv4.totalIGST,
    roundOff: inv4.roundOff,
    grandTotal: inv4.grandTotal,
    amountInWords: `INR ${inv4.grandTotal.toLocaleString('en-IN')} Rupees Only`,
    paymentMode: 'NEFT_RTGS',
    notes: 'Heavy-duty industrial crates bulk consignment. Tested for 500kg stack load capacity.'
  },
  {
    invoiceNumber: 'DMK/26-27/4015',
    invoiceDate: getOffsetISODate(-4),
    company: DMK_MART_COMPANY,
    customer: MOCK_CUSTOMERS[4],
    lineItems: inv5.lineItems,
    subtotalTaxable: inv5.subtotalTaxable,
    totalCGST: inv5.totalCGST,
    totalSGST: inv5.totalSGST,
    totalIGST: inv5.totalIGST,
    roundOff: inv5.roundOff,
    grandTotal: inv5.grandTotal,
    amountInWords: `INR ${inv5.grandTotal.toLocaleString('en-IN')} Rupees Only`,
    paymentMode: 'UPI',
    notes: 'Direct Retail Distribution Counter Invoice. Instant UPI Settlement QR Verified.'
  },
  {
    invoiceNumber: 'DMK/26-27/4014',
    invoiceDate: getOffsetISODate(-5),
    company: DMK_MART_COMPANY,
    customer: MOCK_CUSTOMERS[3],
    lineItems: inv6.lineItems,
    subtotalTaxable: inv6.subtotalTaxable,
    totalCGST: inv6.totalCGST,
    totalSGST: inv6.totalSGST,
    totalIGST: inv6.totalIGST,
    roundOff: inv6.roundOff,
    grandTotal: inv6.grandTotal,
    amountInWords: `INR ${inv6.grandTotal.toLocaleString('en-IN')} Rupees Only`,
    paymentMode: 'CREDIT_30_DAYS',
    notes: 'Polymer injection moulded furniture dispatched from Hosur Unit 2.'
  },
  {
    invoiceNumber: 'DMK/26-27/4013',
    invoiceDate: getOffsetISODate(-7),
    company: DMK_MART_COMPANY,
    customer: MOCK_CUSTOMERS[0],
    lineItems: inv7.lineItems,
    subtotalTaxable: inv7.subtotalTaxable,
    totalCGST: inv7.totalCGST,
    totalSGST: inv7.totalSGST,
    totalIGST: inv7.totalIGST,
    roundOff: inv7.roundOff,
    grandTotal: inv7.grandTotal,
    amountInWords: `INR ${inv7.grandTotal.toLocaleString('en-IN')} Rupees Only`,
    paymentMode: 'NEFT_RTGS',
    notes: 'Interstate supply to Chennai warehouse. Full GST credit pass-through.'
  },
  {
    invoiceNumber: 'DMK/26-27/4012',
    invoiceDate: getOffsetISODate(-8),
    company: DMK_MART_COMPANY,
    customer: MOCK_CUSTOMERS[5],
    lineItems: inv8.lineItems,
    subtotalTaxable: inv8.subtotalTaxable,
    totalCGST: inv8.totalCGST,
    totalSGST: inv8.totalSGST,
    totalIGST: inv8.totalIGST,
    roundOff: inv8.roundOff,
    grandTotal: inv8.grandTotal,
    amountInWords: `INR ${inv8.grandTotal.toLocaleString('en-IN')} Rupees Only`,
    paymentMode: 'CASH',
    notes: 'Cash Counter Sale. Retail GST Receipt issued.'
  }
];

