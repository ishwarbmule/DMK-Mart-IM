import { CompanyVertical, CustomerParty } from '../types/erp';

export const DMK_COMPANIES: CompanyVertical[] = [
  {
    id: 'comp-01',
    companyCode: 'DMK-POLY',
    companyName: 'DMK Polymers & Manufacturing Works',
    shortName: 'DMK Polymers',
    gstin: '33AABFD1029P1ZX',
    stateCode: '33', // Tamil Nadu
    registeredAddress: 'Plot 42-45, Industrial SIPCOT Estate, Hosur, Tamil Nadu - 635126',
    contactEmail: 'orders@dmkpolymers.com',
    contactPhone: '+91 94432 10987',
    bankDetails: {
      bankName: 'HDFC Bank Ltd',
      accountNumber: '50200098172635',
      ifscCode: 'HDFC0001248',
      branchName: 'Hosur Industrial Complex'
    },
    invoicePrefix: 'DPM/26-27/',
    themeAccent: '#FF6B00'
  },
  {
    id: 'comp-02',
    companyCode: 'DMK-HOUSE',
    companyName: 'DMK Houseware & Kitchen Mart Pvt Ltd',
    shortName: 'DMK Houseware',
    gstin: '29AAEFD4491Q1Z4',
    stateCode: '29', // Karnataka
    registeredAddress: '78/2, Outer Ring Road, Mahadevapura, Bengaluru, Karnataka - 560048',
    contactEmail: 'billing@dmkhousware.com',
    contactPhone: '+91 80 4123 9900',
    bankDetails: {
      bankName: 'ICICI Bank Ltd',
      accountNumber: '000205018899',
      ifscCode: 'ICIC0000002',
      branchName: 'Indiranagar Bengaluru'
    },
    invoicePrefix: 'DHM/26-27/',
    themeAccent: '#00E5FF'
  },
  {
    id: 'comp-03',
    companyCode: 'DMK-CRATE',
    companyName: 'DMK Industrial Plastics & Heavy Crates Corp',
    shortName: 'DMK Industrial',
    gstin: '36AAIFD7712R1Z8',
    stateCode: '36', // Telangana
    registeredAddress: 'Phase III, IDA Jeedimetla, Hyderabad, Telangana - 500055',
    contactEmail: 'sales@dmkindustrial.in',
    contactPhone: '+91 40 2789 4433',
    bankDetails: {
      bankName: 'State Bank of India',
      accountNumber: '39182746501',
      ifscCode: 'SBIN0004521',
      branchName: 'Jeedimetla Industrial'
    },
    invoicePrefix: 'DIC/26-27/',
    themeAccent: '#10B981'
  },
  {
    id: 'comp-04',
    companyCode: 'DMK-DIST',
    companyName: 'DMK Commercial Distributions & Retail Trade',
    shortName: 'DMK Distribution',
    gstin: '27AAMFD9930S1Z2',
    stateCode: '27', // Maharashtra
    registeredAddress: 'Gala 101-104, Bhiwandi Logistics Park, Thane, Maharashtra - 421302',
    contactEmail: 'trade@dmkdistribution.com',
    contactPhone: '+91 22 6819 0044',
    bankDetails: {
      bankName: 'Axis Bank Ltd',
      accountNumber: '921020088771122',
      ifscCode: 'UTIB0000123',
      branchName: 'Thane West'
    },
    invoicePrefix: 'DCD/26-27/',
    themeAccent: '#8B5CF6'
  }
];

export const MOCK_CUSTOMERS: CustomerParty[] = [
  {
    id: 'cust-01',
    partyName: 'Sri Venkateswara Plastic Agencies',
    gstin: '33AABCS4412F1Z1',
    stateCode: '33',
    phone: '+91 98401 22334',
    city: 'Chennai',
    partyType: 'DISTRIBUTOR',
    assignedTier: 'tier1_distributor',
    outstandingBalance: 145000,
    balanceType: 'Dr',
    creditLimit: 500000
  },
  {
    id: 'cust-02',
    partyName: 'National Crockery & Houseware Mart',
    gstin: '29AACCN9918E1Z8',
    stateCode: '29',
    phone: '+91 98860 77889',
    city: 'Bengaluru',
    partyType: 'WHOLESALER',
    assignedTier: 'tier2_wholesale',
    outstandingBalance: 84200,
    balanceType: 'Dr',
    creditLimit: 250000
  },
  {
    id: 'cust-03',
    partyName: 'Balaji Hardware & Home Plastics',
    gstin: '33AACFB3381G1Z9',
    stateCode: '33',
    phone: '+91 94441 55667',
    city: 'Madurai',
    partyType: 'RETAILER',
    assignedTier: 'tier4_retailer',
    outstandingBalance: 18500,
    balanceType: 'Dr',
    creditLimit: 50000
  },
  {
    id: 'cust-04',
    partyName: 'Hyderabad Agro & Dairy Logistics Ltd',
    gstin: '36AAACH8812K1Z4',
    stateCode: '36',
    phone: '+91 99890 33445',
    city: 'Hyderabad',
    partyType: 'DISTRIBUTOR',
    assignedTier: 'tier1_distributor',
    outstandingBalance: 320000,
    balanceType: 'Dr',
    creditLimit: 1000000
  },
  {
    id: 'cust-05',
    partyName: 'Direct Cash / Walk-in Customer Counter',
    stateCode: '33',
    phone: '+91 90000 00000',
    city: 'Local Counter',
    partyType: 'CASH_CUSTOMER',
    assignedTier: 'tier5_mrp',
    outstandingBalance: 0,
    balanceType: 'Dr',
    creditLimit: 0
  }
];
