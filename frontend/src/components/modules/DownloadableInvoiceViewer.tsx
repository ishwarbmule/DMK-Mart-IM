import React from 'react';
import { 
  Printer, 
  Download, 
  ArrowLeft, 
  ShieldCheck, 
  Building, 
  QrCode, 
  CheckCircle2 
} from 'lucide-react';
import { FinalInvoiceData } from '../../types/erp';

interface DownloadableInvoiceViewerProps {
  invoiceData: FinalInvoiceData | null;
  onBackToBilling: () => void;
}

export const DownloadableInvoiceViewer: React.FC<DownloadableInvoiceViewerProps> = ({
  invoiceData,
  onBackToBilling
}) => {
  if (!invoiceData) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No invoice currently loaded. Please create or select an invoice in the Billing module.
        <div style={{ marginTop: '16px' }}>
          <button onClick={onBackToBilling} className="btn-primary">
            Go to Billing Module
          </button>
        </div>
      </div>
    );
  }

  const { company, customer, lineItems } = invoiceData;
  const isIntraState = company.stateCode === customer.stateCode;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Action Bar */}
      <div 
        className="glass-panel"
        style={{
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <button onClick={onBackToBilling} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
          <ArrowLeft size={14} />
          <span>Back to Billing</span>
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handlePrint} className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
            <Printer size={16} />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Tax Invoice Container (Standard Letter / A4 Preview) */}
      <div 
        id="printable-invoice"
        style={{
          backgroundColor: '#FFFFFF',
          color: '#111827',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.7)',
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        {/* Invoice Title & Type */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #FF6B00', paddingBottom: '12px', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em', color: '#6B7280', textTransform: 'uppercase' }}>
            TAX INVOICE (RULE 46 OF CGST RULES, 2017)
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#111827', margin: '4px 0' }}>
            {company.companyName}
          </h1>
          <div style={{ fontSize: '12px', color: '#4B5563', maxWidth: '600px', margin: '0 auto' }}>
            {company.registeredAddress}
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827', marginTop: '4px' }}>
            GSTIN: <span style={{ color: '#FF6B00' }}>{company.gstin}</span> • State: Tamil Nadu (Code: {company.stateCode}) • Email: {company.contactEmail}
          </div>
        </div>

        {/* Invoice Header Information Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px', marginBottom: '16px' }}>
          {/* Buyer Details */}
          <div style={{ borderRight: '1px solid #E5E7EB', paddingRight: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px' }}>
              DETAILS OF RECEIVER / BILLED TO:
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>
              {customer.partyName}
            </div>
            <div style={{ fontSize: '12px', color: '#4B5563', marginTop: '2px' }}>
              {customer.city}, State Code: {customer.stateCode}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827', marginTop: '4px' }}>
              GSTIN / UIN: {customer.gstin || 'Unregistered Consumer'}
            </div>
            <div style={{ fontSize: '12px', color: '#4B5563' }}>
              Contact Phone: {customer.phone}
            </div>
          </div>

          {/* Invoice Meta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>Invoice Number:</span>
              <strong style={{ fontFamily: 'monospace', fontSize: '14px', color: '#FF6B00' }}>{invoiceData.invoiceNumber}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>Invoice Date:</span>
              <strong>{invoiceData.invoiceDate}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>Place of Supply:</span>
              <strong>State Code {customer.stateCode} ({isIntraState ? 'Intra-State' : 'Inter-State'})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>Payment Terms:</span>
              <strong>{invoiceData.paymentMode.replace('_', ' ')}</strong>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '16px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F3F4F6', borderBottom: '2px solid #E5E7EB' }}>
              <th style={{ padding: '8px', textAlign: 'left', width: '30px' }}>#</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Description of Goods (Plastic)</th>
              <th style={{ padding: '8px', textAlign: 'center' }}>HSN/SAC</th>
              <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
              <th style={{ padding: '8px', textAlign: 'center' }}>UOM</th>
              <th style={{ padding: '8px', textAlign: 'right' }}>Rate (₹)</th>
              <th style={{ padding: '8px', textAlign: 'right' }}>Taxable Val (₹)</th>
              <th style={{ padding: '8px', textAlign: 'center' }}>GST %</th>
              <th style={{ padding: '8px', textAlign: 'right' }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, idx) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                <td style={{ padding: '8px', textAlign: 'left' }}>{idx + 1}</td>
                <td style={{ padding: '8px', textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, color: '#111827' }}>{item.product.name}</div>
                  <div style={{ fontSize: '10px', color: '#6B7280' }}>Code: {item.product.sku} • Tier: {item.selectedTier.replace('tier', 'T')}</div>
                </td>
                <td style={{ padding: '8px', textAlign: 'center', fontFamily: 'monospace' }}>{item.product.hsnCode}</td>
                <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                <td style={{ padding: '8px', textAlign: 'center' }}>{item.unitOfMeasure}</td>
                <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace' }}>₹{item.unitPrice.toFixed(2)}</td>
                <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>₹{item.taxableAmount.toFixed(2)}</td>
                <td style={{ padding: '8px', textAlign: 'center' }}>{item.gstRate}%</td>
                <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800 }}>₹{item.totalAmount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Calculation & Bank Details Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', borderTop: '2px solid #E5E7EB', paddingTop: '16px' }}>
          {/* Bank Account Details */}
          <div style={{ fontSize: '11px', color: '#374151', background: '#F9FAFB', padding: '12px', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
            <div style={{ fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
              BANK PAYMENT DETAILS (NEFT / RTGS / IMPS):
            </div>
            <div>Bank Name: <strong>{company.bankDetails.bankName}</strong></div>
            <div>Account Number: <strong>{company.bankDetails.accountNumber}</strong></div>
            <div>IFSC Code: <strong>{company.bankDetails.ifscCode}</strong></div>
            <div>Branch: {company.bankDetails.branchName}</div>
            <div style={{ marginTop: '8px', color: '#6B7280', fontSize: '10px' }}>
              Amount in Words: <strong>{invoiceData.amountInWords}</strong>
            </div>
          </div>

          {/* Tax Summary Totals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#4B5563' }}>Taxable Value:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>₹{invoiceData.subtotalTaxable.toFixed(2)}</span>
            </div>

            {isIntraState ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#4B5563' }}>Central Tax (CGST):</span>
                  <span style={{ fontFamily: 'monospace' }}>₹{invoiceData.totalCGST.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#4B5563' }}>State Tax (SGST):</span>
                  <span style={{ fontFamily: 'monospace' }}>₹{invoiceData.totalSGST.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4B5563' }}>Integrated Tax (IGST):</span>
                <span style={{ fontFamily: 'monospace' }}>₹{invoiceData.totalIGST.toFixed(2)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280', fontSize: '11px' }}>
              <span>Round Off:</span>
              <span style={{ fontFamily: 'monospace' }}>₹{invoiceData.roundOff.toFixed(2)}</span>
            </div>

            <div style={{ borderTop: '2px solid #111827', paddingTop: '6px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 900 }}>TOTAL INVOICE VALUE:</span>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#FF6B00', fontFamily: 'monospace' }}>
                ₹{invoiceData.grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Declaration & Signature Block */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed #E5E7EB' }}>
          <div style={{ fontSize: '10px', color: '#6B7280' }}>
            <strong>Declaration:</strong> We declare that this invoice shows the actual price of the plastic goods described and that all particulars are true and correct.
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#111827' }}>
              For {company.companyName}
            </div>
            <div style={{ height: '40px' }}></div>
            <div style={{ fontSize: '11px', borderTop: '1px solid #111827', paddingTop: '2px', fontWeight: 600 }}>
              Authorized Signatory
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
