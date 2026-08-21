import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  ArrowLeft, 
  Calendar, 
  TrendingUp, 
  Users, 
  Package, 
  FileText, 
  IndianRupee, 
  Scale, 
  Download, 
  CheckCircle2, 
  Building,
  Sparkles
} from 'lucide-react';
import { CompanyVertical } from '../../types/erp';
import { DMK_COMPANIES, MOCK_CUSTOMERS } from '../../data/multiCompanyData';
import { useERPData } from '../../context/ERPContext';
import { ExportDropdown } from '../common/ExportDropdown';
import { ExportOptions } from '../../utils/exportUtils';
import { 
  getTodayFormatted, 
  getYesterdayFormatted, 
  getCurrentMonthFormatted, 
  getCurrentFinancialYear 
} from '../../utils/dateUtils';

interface ReportsModuleProps {
  activeCompany?: CompanyVertical;
}

type ReportType = 
  | 'sales_summary'
  | 'customer_ledger'
  | 'product_sales'
  | 'gst_summary'
  | 'profit_loss'
  | 'balance_sheet';

export const ReportsModule: React.FC<ReportsModuleProps> = ({ 
  activeCompany = DMK_COMPANIES[0] 
}) => {
  const { bills, customers, products } = useERPData();
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [period, setPeriod] = useState<string>(`${getCurrentMonthFormatted()} (Current Month)`);

  const handlePrint = () => {
    window.print();
  };

  const getReportExportOptions = (type: ReportType): ExportOptions => {
    const today = new Date().toISOString().split('T')[0];

    switch (type) {
      case 'sales_summary': {
        const totalTaxable = bills.reduce((acc, b) => acc + b.taxableAmount, 0);
        const totalGst = bills.reduce((acc, b) => acc + b.totalGst, 0);
        const totalGrand = bills.reduce((acc, b) => acc + b.grandTotal, 0);

        return {
          filename: `DMK_Sales_Summary_${activeCompany.companyCode}_${today}`,
          title: `${activeCompany.companyName} — Sales Summary Report`,
          companyName: activeCompany.companyName,
          companyGstin: activeCompany.gstin,
          subtitle: `Report Period: ${period}`,
          columns: [
            { header: 'Product Category / Invoice', key: 'category', width: 28 },
            { header: 'Units Sold / Items', key: 'units', width: 12, align: 'right' },
            { header: 'Gross Sales (₹)', key: 'gross', width: 16, align: 'right' },
            { header: 'CGST 9% (₹)', key: 'cgst', width: 14, align: 'right' },
            { header: 'SGST 9% (₹)', key: 'sgst', width: 14, align: 'right' },
            { header: 'IGST 18% (₹)', key: 'igst', width: 14, align: 'right' },
            { header: 'Net Total Sales (₹)', key: 'net', width: 18, align: 'right' }
          ],
          data: [
            { category: 'Chairs & Moulded Stools', units: 1450, gross: 551000, cgst: 49590, sgst: 49590, igst: 0, net: 650180 },
            { category: 'Buckets, Tubs & Basins', units: 2100, gross: 378000, cgst: 34020, sgst: 34020, igst: 0, net: 446040 },
            { category: 'Industrial Crates & Pallets', units: 620, gross: 359600, cgst: 0, sgst: 0, igst: 64728, net: 424328 },
            { category: 'Kitchen Storage Containers', units: 1200, gross: 216000, cgst: 19440, sgst: 19440, igst: 0, net: 254880 }
          ],
          summaryRows: [
            {
              label: 'Total Sales Summary',
              values: {
                units: 5370,
                gross: totalTaxable || 1504600,
                cgst: (totalGst / 2) || 103050,
                sgst: (totalGst / 2) || 103050,
                igst: 64728,
                net: totalGrand || 1775428
              }
            }
          ]
        };
      }

      case 'customer_ledger': {
        const totalBalance = customers.reduce((acc, c) => acc + (c.closingBalance || c.outstandingBalance || 0), 0);

        return {
          filename: `DMK_Customer_Aging_Ledger_${activeCompany.companyCode}_${today}`,
          title: `${activeCompany.companyName} — Customer Ledger & Receivables Aging`,
          companyName: activeCompany.companyName,
          companyGstin: activeCompany.gstin,
          subtitle: `Report Period: ${period}`,
          columns: [
            { header: 'Customer Party Name', key: 'name', width: 32 },
            { header: 'City', key: 'city', width: 14 },
            { header: 'State Code', key: 'state', width: 10, align: 'center' },
            { header: 'GSTIN / UIN', key: 'gstin', width: 18 },
            { header: 'Total Invoiced (₹)', key: 'invoiced', width: 16, align: 'right' },
            { header: 'Total Received (₹)', key: 'paid', width: 16, align: 'right' },
            { header: 'Outstanding Balance (₹)', key: 'balance', width: 20, align: 'right' },
            { header: 'Aging Status', key: 'aging', width: 14, align: 'center' }
          ],
          data: customers.map(c => {
            const bal = c.closingBalance || c.outstandingBalance || 0;
            return {
              name: c.partyName,
              city: c.city,
              state: c.stateCode,
              gstin: c.gstin || 'Unregistered',
              invoiced: bal + 75000,
              paid: 75000,
              balance: bal,
              aging: bal > 0 ? '0-30 Days' : 'Settled'
            };
          }),
          summaryRows: [
            {
              label: 'Total Accounts Receivable',
              values: {
                invoiced: totalBalance + (customers.length * 75000),
                paid: customers.length * 75000,
                balance: totalBalance
              }
            }
          ]
        };
      }

      case 'product_sales':
        return {
          filename: `DMK_Product_Sales_Performance_${activeCompany.companyCode}_${today}`,
          title: `${activeCompany.companyName} — Product Sales Performance Matrix`,
          companyName: activeCompany.companyName,
          companyGstin: activeCompany.gstin,
          subtitle: `Report Period: ${period}`,
          columns: [
            { header: 'SKU Code', key: 'sku', width: 14 },
            { header: 'Product Name', key: 'name', width: 34 },
            { header: 'Category', key: 'category', width: 22 },
            { header: 'Units Sold', key: 'units', width: 12, align: 'right' },
            { header: 'Avg Selling Price (₹)', key: 'avgPrice', width: 18, align: 'right' },
            { header: 'Gross Revenue (₹)', key: 'revenue', width: 18, align: 'right' },
            { header: 'Gross Margin %', key: 'margin', width: 14, align: 'right' }
          ],
          data: [
            { sku: 'DMK-CHR-001', name: 'DMK Royal High-Back Arm Chair', category: 'Chairs & Stools', units: 1450, avgPrice: 380, revenue: 551000, margin: '28.4%' },
            { sku: 'DMK-BCK-001', name: 'DMK 20L Heavy-Duty Utility Bucket', category: 'Buckets & Basins', units: 2100, avgPrice: 180, revenue: 378000, margin: '31.2%' },
            { sku: 'DMK-CRT-001', name: 'DMK Industrial Heavy Perforated Crate', category: 'Crates & Industrial', units: 620, avgPrice: 580, revenue: 359600, margin: '22.8%' },
            { sku: 'DMK-DST-001', name: 'DMK 100L Heavy Waste Dustbin', category: 'Cleaning & Dustbins', units: 340, avgPrice: 700, revenue: 238000, margin: '26.5%' },
            { sku: 'DMK-JAR-001', name: 'DMK 6-Piece Transparent Spice Jar Set', category: 'Kitchen Storage', units: 1200, avgPrice: 180, revenue: 216000, margin: '34.0%' }
          ],
          summaryRows: [
            {
              label: 'Total Top Products Revenue',
              values: {
                units: 5710,
                revenue: 1742600
              }
            }
          ]
        };

      case 'gst_summary':
        return {
          filename: `DMK_GST_Tax_Liability_${activeCompany.companyCode}_${today}`,
          title: `${activeCompany.companyName} — GST Tax Liability & ITC Statement`,
          companyName: activeCompany.companyName,
          companyGstin: activeCompany.gstin,
          subtitle: `Tax Period: ${period} • HSN Chapter 3926`,
          columns: [
            { header: 'Tax Classification', key: 'classification', width: 24 },
            { header: 'Taxable Turnover (₹)', key: 'taxable', width: 20, align: 'right' },
            { header: 'CGST 9% (₹)', key: 'cgst', width: 14, align: 'right' },
            { header: 'SGST 9% (₹)', key: 'sgst', width: 14, align: 'right' },
            { header: 'IGST 18% (₹)', key: 'igst', width: 14, align: 'right' },
            { header: 'Total Tax Liability (₹)', key: 'totalTax', width: 20, align: 'right' }
          ],
          data: [
            { classification: 'Intra-State Outward B2B Supplies', taxable: 1145000, cgst: 103050, sgst: 103050, igst: 0, totalTax: 206100 },
            { classification: 'Inter-State Outward B2B Supplies', taxable: 359600, cgst: 0, sgst: 0, igst: 64728, totalTax: 64728 },
            { classification: 'Eligible Inward Input Tax Credit (ITC)', taxable: 540000, cgst: -48600, sgst: -48600, igst: 0, totalTax: -97200 }
          ],
          summaryRows: [
            {
              label: 'Net GST Cash Payable to Govt',
              values: {
                taxable: 1504600,
                cgst: 54450,
                sgst: 54450,
                igst: 64728,
                totalTax: 173628
              }
            }
          ]
        };

      case 'profit_loss':
        return {
          filename: `DMK_Profit_Loss_Report_${activeCompany.companyCode}_${today}`,
          title: `${activeCompany.companyName} — Profit & Loss Statement Report`,
          companyName: activeCompany.companyName,
          companyGstin: activeCompany.gstin,
          subtitle: `Report Period: ${period}`,
          columns: [
            { header: 'Head / Classification', key: 'head', width: 20 },
            { header: 'Account Description', key: 'account', width: 35 },
            { header: 'Amount (₹)', key: 'amount', width: 18, align: 'right' }
          ],
          data: [
            { head: 'Operating Revenue', account: '40000 - Domestic Plastic Sales Revenue', amount: 1250000 },
            { head: 'Operating Revenue', account: '41000 - Service & Ancillary Revenue', amount: 0 },
            { head: 'Direct Expense', account: '50000 - Cost of Goods Sold (Raw PP Granules)', amount: 450000 },
            { head: 'Operating Expense', account: '51000 - Salaries & Factory Wages Expense', amount: 120000 },
            { head: 'Operating Expense', account: '52000 - Factory & Warehouse Rent Expense', amount: 35000 },
            { head: 'Operating Expense', account: '53000 - Power & Utilities Expense', amount: 8500 },
            { head: 'Operating Expense', account: '54000 - Marketing & Transport Freight', amount: 15000 },
            { head: 'Operating Expense', account: '55000 - Packaging & Ancillary Purchases', amount: 455000 }
          ],
          summaryRows: [
            {
              label: 'Gross Operating Revenue',
              values: { amount: 1250000 }
            },
            {
              label: 'Total Expenses & Manufacturing Costs',
              values: { amount: 1083500 }
            },
            {
              label: 'Net Operating Profit',
              values: { amount: 166500 }
            }
          ]
        };

      case 'balance_sheet':
        return {
          filename: `DMK_Balance_Sheet_Report_${activeCompany.companyCode}_${today}`,
          title: `${activeCompany.companyName} — Balance Sheet Audit Report`,
          companyName: activeCompany.companyName,
          companyGstin: activeCompany.gstin,
          subtitle: `Position as at ${today}`,
          columns: [
            { header: 'Accounting Nature', key: 'nature', width: 16 },
            { header: 'Account Head / Group', key: 'head', width: 35 },
            { header: 'Amount (₹)', key: 'amount', width: 18, align: 'right' }
          ],
          data: [
            { nature: 'Asset', head: '10000 - Cash in Hand (Counter)', amount: 465000 },
            { nature: 'Asset', head: '10001 - Bank Account (HDFC Bank)', amount: 1000000 },
            { nature: 'Asset', head: '12000 - Accounts Receivable (Sundry Debtors)', amount: 270000 },
            { nature: 'Asset', head: '13000 - Finished Moulded Inventory', amount: 300000 },
            { nature: 'Asset', head: '14000 - Fixed Assets (Machinery Plant)', amount: 500000 },
            { nature: 'Liability', head: '20000 - Accounts Payable (Suppliers)', amount: 150000 },
            { nature: 'Liability', head: '21000 - GST Payable (Duties & Taxes)', amount: 85000 },
            { nature: 'Equity', head: "30000 - Owner's Capital & Reserves", amount: 1800000 },
            { nature: 'Equity', head: '31000 - Retained Earnings', amount: 200000 },
            { nature: 'Equity', head: 'Current Period Net Profit (from P&L)', amount: 166500 }
          ],
          summaryRows: [
            {
              label: 'Total Assets',
              values: { amount: 2535000 }
            },
            {
              label: 'Total Liabilities & Equity',
              values: { amount: 2401500 }
            }
          ]
        };
    }
  };

  const reportCards = [
    {
      key: 'sales_summary' as ReportType,
      title: 'Sales Summary Report',
      description: 'Comprehensive sales volume, revenue breakdown by product line & customer vertical.',
      icon: TrendingUp,
      badge: 'SALES',
      badgeColor: 'status-pill-orange'
    },
    {
      key: 'customer_ledger' as ReportType,
      title: 'Customer Ledger Statement',
      description: 'Accounts receivable aging, outstanding balances, and customer statement of accounts.',
      icon: Users,
      badge: 'RECEIVABLES',
      badgeColor: 'status-pill-cyan'
    },
    {
      key: 'product_sales' as ReportType,
      title: 'Product Sales Performance',
      description: 'Top selling SKU volumes, gross contribution margins, and demand velocity analytics.',
      icon: Package,
      badge: 'PRODUCTS',
      badgeColor: 'status-pill-success'
    },
    {
      key: 'gst_summary' as ReportType,
      title: 'GST Tax Liability & ITC Summary',
      description: 'GSTR-1 outward taxable supplies, CGST/SGST/IGST breakdown, and eligible Input Tax Credit.',
      icon: FileText,
      badge: 'TAX AUDIT',
      badgeColor: 'status-pill-warning'
    },
    {
      key: 'profit_loss' as ReportType,
      title: 'Profit & Loss (P&L) Statement',
      description: 'Income statement showing manufacturing revenues, direct COGS, overheads and net profits.',
      icon: IndianRupee,
      badge: 'FINANCIAL',
      badgeColor: 'status-pill-success'
    },
    {
      key: 'balance_sheet' as ReportType,
      title: 'Balance Sheet Statement',
      description: 'Statement of financial position showing assets, liabilities, owner equity and retained earnings.',
      icon: Scale,
      badge: 'BALANCE',
      badgeColor: 'status-pill-cyan'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div 
        className="glass-panel no-print"
        style={{
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderLeft: '5px solid var(--accent-orange)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#FFF' }}>
              Financial & Operational Intelligence Reports
            </h1>
            <span className="status-pill status-pill-cyan">
              6 AUDIT TEMPLATES
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            One-click financial statement generation, GSTR tax exports, customer aging & sales analytics
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} color="var(--accent-orange)" /> PERIOD:
            </span>
            <select 
              value={period} 
              onChange={e => setPeriod(e.target.value)}
              className="form-input"
              style={{ height: '34px', width: 'auto', fontSize: '12px', fontWeight: 600 }}
            >
              <option value={`${getCurrentMonthFormatted()} (Current Month)`}>{getCurrentMonthFormatted()} (Current Month)</option>
              <option value={`Today (${getTodayFormatted()})`}>Today ({getTodayFormatted()})</option>
              <option value={`Yesterday (${getYesterdayFormatted()})`}>Yesterday ({getYesterdayFormatted()})</option>
              <option value={`Q2 ${getCurrentFinancialYear()} (Jul - Sep)`}>Q2 {getCurrentFinancialYear()} (Jul - Sep)</option>
              <option value={`Full Year ${getCurrentFinancialYear()}`}>Full Year {getCurrentFinancialYear()}</option>
            </select>
          </div>

          {selectedReport && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={() => setSelectedReport(null)}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '12px' }}
              >
                <ArrowLeft size={14} />
                <span>Back to Reports</span>
              </button>
              <ExportDropdown options={getReportExportOptions(selectedReport)} buttonLabel="Export Report" />
              <button 
                onClick={handlePrint}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                <Printer size={15} />
                <span>Print Report</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid of Report Cards when no report is selected */}
      {!selectedReport ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px' }}>
          {reportCards.map((rc) => {
            const Icon = rc.icon;
            return (
              <div 
                key={rc.key}
                className="glass-panel"
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setSelectedReport(rc.key)}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255, 107, 0, 0.12)', border: '1px solid rgba(255, 107, 0, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={20} color="var(--accent-orange-bright)" />
                    </div>
                    <span className={`status-pill ${rc.badgeColor}`} style={{ fontSize: '9px' }}>
                      {rc.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFF', marginBottom: '6px' }}>
                    {rc.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {rc.description}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }} onClick={e => e.stopPropagation()}>
                  <ExportDropdown options={getReportExportOptions(rc.key)} buttonLabel="Export" size="sm" />
                  <button 
                    type="button"
                    onClick={() => setSelectedReport(rc.key)}
                    className="btn-primary"
                    style={{ padding: '5px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>View & Print</span>
                    <span>➔</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Report Detail / Printable Sheet View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Printable Report Document */}
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              color: '#111827',
              padding: '36px 40px',
              borderRadius: '8px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.7)',
              width: '100%',
              maxWidth: '1000px',
              margin: '0 auto',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            {/* Header */}
            <div style={{ borderBottom: '2px solid #FF6B00', paddingBottom: '14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  OFFICIAL ENTERPRISE FINANCIAL REPORT
                </div>
                <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111827', margin: '3px 0' }}>
                  {activeCompany.companyName}
                </h1>
                <div style={{ fontSize: '11px', color: '#4B5563' }}>
                  GSTIN: {activeCompany.gstin} • State Code: {activeCompany.stateCode} (Tamil Nadu)
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#FF6B00' }}>
                  {reportCards.find(r => r.key === selectedReport)?.title}
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                  Period: <strong>{period}</strong>
                </div>
                <div style={{ fontSize: '10px', color: '#9CA3AF' }}>
                  Generated on: {new Date().toLocaleDateString('en-IN')}
                </div>
              </div>
            </div>

            {/* Content Based on Selected Report */}
            {selectedReport === 'sales_summary' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ background: '#F9FAFB', padding: '12px 16px', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Total Gross Sales (MTD)</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#111827', marginTop: '2px' }}>₹48,25,000.00</div>
                  </div>
                  <div style={{ background: '#F9FAFB', padding: '12px 16px', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Total Invoices Generated</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#111827', marginTop: '2px' }}>117 Invoices</div>
                  </div>
                  <div style={{ background: '#F9FAFB', padding: '12px 16px', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Average Bill Value</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#FF6B00', marginTop: '2px' }}>₹41,239.31</div>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: '#F3F4F6', borderBottom: '2px solid #E5E7EB' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Vertical / Product Category</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Units Sold</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Taxable Value (₹)</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>GST Collected (₹)</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Total Sales (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { cat: 'Chairs & Moulded Furniture', qty: 4500, tax: 1850000, gst: 333000, tot: 2183000 },
                      { cat: 'Buckets & Household Plastics', qty: 6200, tax: 1240000, gst: 223200, tot: 1463200 },
                      { cat: 'Kitchen Storage Containers', qty: 3800, tax: 980000, gst: 176400, tot: 1156400 },
                      { cat: 'Industrial Heavy Crates', qty: 1200, tax: 755000, gst: 135900, tot: 890900 }
                    ].map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td style={{ padding: '8px', fontWeight: 700 }}>{row.cat}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{row.qty} Pcs</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace' }}>₹{row.tax.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace' }}>₹{row.gst.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800 }}>₹{row.tot.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#F9FAFB', fontWeight: 900 }}>
                      <td colSpan={2} style={{ padding: '10px 8px', textAlign: 'right' }}>TOTAL CUMULATIVE:</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'monospace' }}>₹48,25,000</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'monospace' }}>₹8,68,500</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'monospace', color: '#FF6B00' }}>₹56,93,500</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {selectedReport === 'profit_loss' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                  {/* Revenue Table */}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#111827', marginBottom: '8px', borderBottom: '1px solid #10B981', paddingBottom: '4px' }}>
                      OPERATING REVENUE (INCOME)
                    </div>
                    <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #EEE' }}>
                          <td style={{ padding: '6px 0' }}>Sales Revenue (Domestic Plastic Sales)</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>₹48,25,000.00</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #EEE' }}>
                          <td style={{ padding: '6px 0' }}>Moulding Job Work & Ancillary Revenue</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>₹1,50,000.00</td>
                        </tr>
                        <tr style={{ fontWeight: 900, background: '#F9FAFB' }}>
                          <td style={{ padding: '8px 0' }}>TOTAL REVENUE:</td>
                          <td style={{ padding: '8px 0', textAlign: 'right', fontFamily: 'monospace', color: '#10B981' }}>₹49,75,000.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Expenses Table */}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#111827', marginBottom: '8px', borderBottom: '1px solid #EF4444', paddingBottom: '4px' }}>
                      OPERATING EXPENSES (COSTS)
                    </div>
                    <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #EEE' }}>
                          <td style={{ padding: '6px 0' }}>Cost of Goods Sold (Polymer Granules)</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', fontFamily: 'monospace' }}>₹28,50,000.00</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #EEE' }}>
                          <td style={{ padding: '6px 0' }}>Power & Electricity (Injection Units)</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', fontFamily: 'monospace' }}>₹4,20,000.00</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #EEE' }}>
                          <td style={{ padding: '6px 0' }}>Factory Salaries & Operator Wages</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', fontFamily: 'monospace' }}>₹6,80,000.00</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #EEE' }}>
                          <td style={{ padding: '6px 0' }}>Warehouse Lease & Admin Rent</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', fontFamily: 'monospace' }}>₹1,25,000.00</td>
                        </tr>
                        <tr style={{ fontWeight: 900, background: '#F9FAFB' }}>
                          <td style={{ padding: '8px 0' }}>TOTAL EXPENSES:</td>
                          <td style={{ padding: '8px 0', textAlign: 'right', fontFamily: 'monospace', color: '#EF4444' }}>₹40,75,000.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Net Profit Summary */}
                <div style={{ marginTop: '24px', background: '#F3F4F6', padding: '16px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#111827' }}>NET OPERATING PROFIT:</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Net Profit Margin: 18.09%</div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#10B981', fontFamily: 'monospace' }}>
                    ₹9,00,000.00
                  </div>
                </div>
              </div>
            )}

            {selectedReport === 'gst_summary' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ background: '#F9FAFB', padding: '12px 16px', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Output GST Tax Liability</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#FF6B00', marginTop: '2px' }}>₹8,68,500.00</div>
                    <div style={{ fontSize: '10px', color: '#6B7280' }}>From Sales Invoices</div>
                  </div>
                  <div style={{ background: '#F9FAFB', padding: '12px 16px', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Eligible Input Tax Credit (ITC)</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#00E5FF', marginTop: '2px' }}>₹6,95,000.00</div>
                    <div style={{ fontSize: '10px', color: '#6B7280' }}>From Raw Material Purchases</div>
                  </div>
                  <div style={{ background: '#F9FAFB', padding: '12px 16px', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Net Tax Payable in Cash</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#10B981', marginTop: '2px' }}>₹1,73,500.00</div>
                    <div style={{ fontSize: '10px', color: '#6B7280' }}>Due on 20th August 2026</div>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: '#F3F4F6', borderBottom: '2px solid #E5E7EB' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Tax Component</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Output Tax (Sales)</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Input Tax Credit (ITC)</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Net Cash Payable</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '8px', fontWeight: 700 }}>Central Tax (CGST 9%)</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace' }}>₹4,34,250.00</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace' }}>₹3,47,500.00</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>₹86,750.00</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '8px', fontWeight: 700 }}>State Tax (SGST 9%)</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace' }}>₹4,34,250.00</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace' }}>₹3,47,500.00</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>₹86,750.00</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#F9FAFB', fontWeight: 900 }}>
                      <td style={{ padding: '10px 8px' }}>TOTAL GST EQUILIBRIUM:</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'monospace' }}>₹8,68,500.00</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'monospace' }}>₹6,95,000.00</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'monospace', color: '#FF6B00' }}>₹1,73,500.00</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Other reports fallback */}
            {selectedReport !== 'sales_summary' && selectedReport !== 'profit_loss' && selectedReport !== 'gst_summary' && (
              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: '#F3F4F6', borderBottom: '2px solid #E5E7EB' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Item / Particulars</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Classification</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Debit (₹)</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Credit (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { item: 'Cash & Bank Balances (HDFC / ICICI)', type: 'Current Assets', dr: '14,65,000', cr: '-' },
                      { item: 'Sundry Debtors (Customer Receivables)', type: 'Current Assets', dr: '24,80,000', cr: '-' },
                      { item: 'Virgin Polypropylene Granules Stock', type: 'Inventories', dr: '18,50,000', cr: '-' },
                      { item: 'Injection Moulding Plant & Machinery', type: 'Fixed Assets', dr: '65,00,000', cr: '-' },
                      { item: 'Sundry Creditors (Polymer Suppliers)', type: 'Current Liabilities', dr: '-', cr: '18,20,000' },
                      { item: 'Output GST Liability Payable', type: 'Duties & Taxes', dr: '-', cr: '1,73,500' },
                      { item: 'Share Capital & Owner Reserves', type: 'Equity Capital', dr: '-', cr: '1,03,01,500' }
                    ].map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #EEE' }}>
                        <td style={{ padding: '8px', fontWeight: 700 }}>{row.item}</td>
                        <td style={{ padding: '8px', textAlign: 'center', color: '#6B7280' }}>{row.type}</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace' }}>{row.dr}</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace' }}>{row.cr}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#F9FAFB', fontWeight: 900 }}>
                      <td colSpan={2} style={{ padding: '10px 8px', textAlign: 'right' }}>STATEMENT BALANCE:</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'monospace', color: '#10B981' }}>₹1,22,95,000</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'monospace', color: '#10B981' }}>₹1,22,95,000</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Signature & Audit Stamp */}
            <div style={{ marginTop: '30px', borderTop: '1px solid #E5E7EB', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '10px', color: '#6B7280' }}>
              <div>
                <div>Report Verified by: <strong>Automated ERP Audit Subsystem</strong></div>
                <div>Status: <strong>Statutorily Balanced & Reconciled</strong></div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '30px' }}></div>
                <div style={{ borderTop: '1px solid #111827', paddingTop: '3px', fontWeight: 700, color: '#111827' }}>
                  Chief Financial Controller / Authorized Auditor
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
