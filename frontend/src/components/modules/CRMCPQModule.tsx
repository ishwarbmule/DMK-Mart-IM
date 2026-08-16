import React, { useState } from 'react';
import { TrendingUp, ShieldCheck, CheckCircle2, AlertTriangle, Sparkles, IndianRupee } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CRMCPQModule: React.FC = () => {
  const [armType, setArmType] = useState('6_AXIS_HEAVY');
  const [controllerGrade, setControllerGrade] = useState('AI_EDGE_DUAL_GPU');
  const [warrantyYears, setWarrantyYears] = useState(3);
  const [discountPct, setDiscountPct] = useState(10);
  const [quoteCreatedNotice, setQuoteCreatedNotice] = useState<string | null>(null);

  // Dynamic Cost & Price Computation
  const baseCost = armType === '6_AXIS_HEAVY' ? 14500 : 9800;
  const controllerCost = controllerGrade === 'AI_EDGE_DUAL_GPU' ? 3800 : 1800;
  const warrantyCost = warrantyYears * 800;
  const totalBOMCost = baseCost + controllerCost + warrantyCost;

  const listPrice = totalBOMCost * 1.65; // Standard 65% markup
  const discountAmount = listPrice * (discountPct / 100);
  const finalQuotePrice = listPrice - discountAmount;
  const contributionMargin = ((finalQuotePrice - totalBOMCost) / finalQuotePrice) * 100;
  const isMarginApproved = contributionMargin >= 25.0; // 25% minimum margin guardrail

  const handleGenerateQuote = () => {
    if (!isMarginApproved) return;
    confetti({ particleCount: 60, spread: 60, colors: ['#FF6B00', '#10B981', '#FFFFFF'] });
    const quoteNum = `QT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setQuoteCreatedNotice(`Quote ${quoteNum} generated successfully for ₹${finalQuotePrice.toLocaleString()} with ${contributionMargin.toFixed(1)}% margin.`);
    setTimeout(() => setQuoteCreatedNotice(null), 5000);
  };

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
            <TrendingUp size={20} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
              CRM & Configure, Price, Quote (CPQ) Engine
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Real-Time Live Manufacturing BOM Cost Rollup & Contribution Margin Guardrails
            </div>
          </div>
        </div>

        <span className="status-pill status-pill-success">
          COST-PLUS MARGIN GUARD ACTIVE
        </span>
      </div>

      {quoteCreatedNotice && (
        <div 
          className="glass-panel"
          style={{
            padding: '12px 18px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            borderColor: '#10B981',
            color: '#10B981',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          <CheckCircle2 size={18} />
          <span>{quoteCreatedNotice}</span>
        </div>
      )}

      {/* Configurator Workbench */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Product Configurator Options */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFF' }}>
            Product Configuration Options
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>ROBOTIC CHASSIS PLATFORM</label>
              <select 
                value={armType}
                onChange={e => setArmType(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#FFF', marginTop: '4px' }}
              >
                <option value="6_AXIS_HEAVY">6-Axis Heavy Payload (BOM Cost: ₹14,500)</option>
                <option value="4_AXIS_LIGHT">4-Axis Scara High-Speed (BOM Cost: ₹9,800)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>AI EDGE CONTROLLER ARCHITECTURE</label>
              <select 
                value={controllerGrade}
                onChange={e => setControllerGrade(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#FFF', marginTop: '4px' }}
              >
                <option value="AI_EDGE_DUAL_GPU">Dual NVIDIA Orin AI Controller (BOM Cost: ₹3,800)</option>
                <option value="STANDARD_PLC">Standard RISC-V MCU Controller (BOM Cost: ₹1,800)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>COMPREHENSIVE SLA WARRANTY (YEARS)</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                {[1, 3, 5].map(yr => (
                  <button
                    key={yr}
                    onClick={() => setWarrantyYears(yr)}
                    className={warrantyYears === yr ? 'btn-primary' : 'btn-secondary'}
                    style={{ flex: 1, padding: '8px' }}
                  >
                    {yr} Year{yr > 1 ? 's' : ''} (₹{yr * 800})
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                <span>DISCOUNT NEGOTIATION OVERRIDE</span>
                <span className="font-mono" style={{ color: discountPct > 20 ? '#EF4444' : '#FFF' }}>{discountPct}% Discount</span>
              </div>
              <input 
                type="range"
                min="0"
                max="35"
                value={discountPct}
                onChange={e => setDiscountPct(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-orange)', marginTop: '4px' }}
              />
            </div>
          </div>
        </div>

        {/* Real-time Pricing & Margin Guardrail */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '14px' }}>
              LIVE MARGIN & PRICING VERIFICATION
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Live Manufacturing BOM Cost:</span>
                <span className="font-mono" style={{ fontWeight: 700, color: '#FFF' }}>₹{totalBOMCost.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Catalog Standard List Price:</span>
                <span className="font-mono" style={{ fontWeight: 700, color: '#FFF' }}>₹{listPrice.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#EF4444' }}>
                <span>Applied Customer Discount ({discountPct}%):</span>
                <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
              </div>
              <div style={{ borderTop: '2px solid var(--border-medium)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFF' }}>FINAL CONTRACT QUOTE:</span>
                <span className="font-mono" style={{ fontSize: '22px', fontWeight: 900, color: 'var(--accent-orange-bright)' }}>
                  ₹{finalQuotePrice.toFixed(2)}
                </span>
              </div>
            </div>

            <div 
              style={{
                padding: '14px',
                borderRadius: '8px',
                background: isMarginApproved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${isMarginApproved ? '#10B981' : '#EF4444'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>CONTRIBUTION MARGIN</div>
                <div className="font-mono" style={{ fontSize: '20px', fontWeight: 900, color: isMarginApproved ? '#10B981' : '#EF4444' }}>
                  {contributionMargin.toFixed(1)}%
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '11px', fontWeight: 600, color: isMarginApproved ? '#10B981' : '#EF4444' }}>
                {isMarginApproved ? '✅ Margin Compliant (≥ 25%)' : '🛑 Breaches Target Margin (< 25%)'}
              </div>
            </div>
          </div>

          <button 
            onClick={handleGenerateQuote}
            disabled={!isMarginApproved}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '16px', opacity: isMarginApproved ? 1 : 0.4, cursor: isMarginApproved ? 'pointer' : 'not-allowed' }}
          >
            <Sparkles size={16} />
            <span>Generate Authorized Sales Quote</span>
          </button>
        </div>
      </div>
    </div>
  );
};
