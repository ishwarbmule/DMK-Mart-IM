import React, { useState } from 'react';
import { FileSearch, Sparkles, CheckCircle2, ShieldCheck, FileText, ArrowRight, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DocumentAILab: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState<string | null>('total_amount');
  const [isExtracted, setIsExtracted] = useState(true);

  const tokens = [
    { key: 'vendor_name', label: 'Vendor Legal Name', value: 'Global Steel Dynamics Corp', bbox: { top: '15%', left: '8%', width: '45%', height: '6%' }, confidence: 0.998 },
    { key: 'invoice_number', label: 'Invoice Identifier', value: 'INV-2026-0091', bbox: { top: '15%', left: '60%', width: '32%', height: '6%' }, confidence: 0.999 },
    { key: 'invoice_date', label: 'Invoice Date', value: '2026-08-14', bbox: { top: '23%', left: '60%', width: '32%', height: '5%' }, confidence: 0.994 },
    { key: 'line_item_1', label: 'Line 1 Description', value: 'Virgin Polypropylene Polymer Pellets (50 Bags @ ₹840.00)', bbox: { top: '48%', left: '8%', width: '84%', height: '8%' }, confidence: 0.989 },
    { key: 'subtotal', label: 'Subtotal Amount', value: '₹42,000.00', bbox: { top: '68%', left: '60%', width: '32%', height: '5%' }, confidence: 0.997 },
    { key: 'tax_amount', label: 'Tax Amount (18% GST)', value: '₹7,560.00', bbox: { top: '75%', left: '60%', width: '32%', height: '5%' }, confidence: 0.992 },
    { key: 'total_amount', label: 'Total Payable Amount', value: '₹49,560.00', bbox: { top: '83%', left: '60%', width: '32%', height: '7%' }, confidence: 0.999 },
  ];

  const activeTokenObj = tokens.find(t => t.key === selectedToken);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div 
        className="glass-panel"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div 
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(255, 107, 0, 0.15)',
              border: '1px solid var(--accent-orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-orange)'
            }}
          >
            <FileSearch size={20} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
              Cognitive Document OCR & Neural Parsing Lab
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              LayoutLMv3 Multimodal Token Grounding & Automatic 3-Way Match Ingestion
            </div>
          </div>
        </div>

        <span className="status-pill status-pill-success">
          99.8% AVERAGE TOKEN CONFIDENCE
        </span>
      </div>

      {/* Split Screen OCR Lab */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '20px' }}>
        {/* Scanned Document Canvas */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFF' }}>
              Optical Scan with Neural Bounding Boxes
            </span>
            <span className="status-pill status-pill-orange">INV-2026-0091.PDF</span>
          </div>

          <div 
            style={{
              width: '100%',
              height: '460px',
              backgroundColor: '#1E2330',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              position: 'relative',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            {/* Render interactive bounding boxes */}
            {tokens.map(token => {
              const isSelected = selectedToken === token.key;
              return (
                <div
                  key={token.key}
                  onClick={() => setSelectedToken(token.key)}
                  style={{
                    position: 'absolute',
                    top: token.bbox.top,
                    left: token.bbox.left,
                    width: token.bbox.width,
                    height: token.bbox.height,
                    border: isSelected ? '2px solid var(--accent-orange)' : '1px dashed rgba(0, 229, 255, 0.6)',
                    backgroundColor: isSelected ? 'rgba(255, 107, 0, 0.25)' : 'rgba(0, 229, 255, 0.08)',
                    boxShadow: isSelected ? '0 0 12px var(--accent-orange)' : 'none',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                  title={`${token.label}: ${token.value}`}
                >
                  <span style={{ fontSize: '10px', color: isSelected ? '#FFF' : '#00E5FF', fontWeight: 700, textShadow: '0 1px 2px #000' }}>
                    {token.label}
                  </span>
                </div>
              );
            })}

            <div style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>
              Click any bounding box above to inspect extracted neural token features.
            </div>
          </div>
        </div>

        {/* Extracted JSON Schema Inspector */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFF', marginBottom: '14px' }}>
              Extracted Structured Entity Attributes
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
              {tokens.map(t => (
                <div 
                  key={t.key}
                  onClick={() => setSelectedToken(t.key)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    background: selectedToken === t.key ? 'rgba(255, 107, 0, 0.12)' : 'var(--bg-primary)',
                    border: selectedToken === t.key ? '1px solid var(--accent-orange)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t.label}</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFF' }}>{t.value}</div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className="status-pill status-pill-success" style={{ fontSize: '8px' }}>
                      {(t.confidence * 100).toFixed(1)}% CONF
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => {
              confetti({ particleCount: 50, spread: 50 });
            }}
            className="btn-primary" 
            style={{ width: '100%', padding: '12px', marginTop: '16px' }}
          >
            <Sparkles size={16} />
            <span>Forward Document to AP 3-Way Match Queue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
