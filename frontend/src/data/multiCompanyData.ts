import { CompanyVertical, CustomerParty } from '../types/erp';

export const DMK_MART_COMPANY: CompanyVertical = {
  id: 'comp-01',
  companyCode: 'DMK-MART',
  companyName: 'DMK Mart Enterprise Pvt Ltd',
  shortName: 'DMK Mart',
  gstin: '33AABFD1029P1ZX',
  stateCode: '33', // Tamil Nadu
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
    phone: '+91 98800 11223',
    city: 'Bengaluru',
    partyType: 'WHOLESALER',
    assignedTier: 'tier2_wholesale',
    outstandingBalance: 85000,
    balanceType: 'Dr',
    creditLimit: 300000
  },
  {
    id: 'cust-03',
    partyName: 'Royal Kitchenware & Plastics Wholesale',
    gstin: '36AAACR5512D1Z4',
    stateCode: '36',
    phone: '+91 99490 88776',
    city: 'Hyderabad',
    partyType: 'WHOLESALER',
    assignedTier: 'tier2_wholesale',
    outstandingBalance: 215000,
    balanceType: 'Dr',
    creditLimit: 400000
  },
  {
    id: 'cust-04',
    partyName: 'Balaji Polymer Traders & Mouldings',
    gstin: '33AABCB1092Q1Z9',
    stateCode: '33',
    phone: '+91 94440 55667',
    city: 'Madurai',
    partyType: 'DISTRIBUTOR',
    assignedTier: 'tier1_distributor',
    outstandingBalance: 320000,
    balanceType: 'Dr',
    creditLimit: 600000
  },
  {
    id: 'cust-05',
    partyName: 'Mahalakshmi Supermart & Distribution',
    gstin: '27AAECM8812K1Z3',
    stateCode: '27',
    phone: '+91 98200 44332',
    city: 'Mumbai',
    partyType: 'RETAILER',
    assignedTier: 'tier4_retailer',
    outstandingBalance: 42000,
    balanceType: 'Dr',
    creditLimit: 150000
  },
  {
    id: 'cust-06',
    partyName: 'Express Retail Walk-in Customer',
    stateCode: '33',
    phone: '+91 98765 00000',
    city: 'Hosur',
    partyType: 'CASH_CUSTOMER',
    assignedTier: 'tier5_mrp',
    outstandingBalance: 0,
    balanceType: 'Cr',
    creditLimit: 0
  }
];
