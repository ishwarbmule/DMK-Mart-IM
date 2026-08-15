import React, { useState } from 'react';
import { Truck, ShieldCheck, RefreshCw, Plus, ArrowRight, Award, TrendingUp, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MOCK_ROP_ITEMS, MOCK_SUPPLIERS } from '../../data/mockData';
import { DynamicROPConfig, SupplierItem } from '../../types/erp';

export const SupplyChainModule: React.FC = () => {
  const [selectedSku, setSelectedSku] = useState<string>('RAW-STL-404');
  const [items, setItems] = useState<DynamicROPConfig[]>(MOCK_ROP_ITEMS);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(MOCK_SUPPLIERS);
  const [createdPoNotice, setCreatedPoNotice] = useState<string | null>(null);

  const activeItem = items.find(i => i.sku === selectedSku) || items[0];

  // Dynamic ROP Mathematical Calculation
  const leadTimeDemand = activeItem.avgDailyDemand * activeItem.avgLeadTimeDays;
  const combinedVariance = (activeItem.avgLeadTimeDays * Math.pow(activeItem.stddevDemand, 2)) +
    (Math.pow(activeItem.avgDailyDemand, 2) * Math.pow(activeItem.stddevLeadTimeDays, 2));
  const safetyStock = Math.ceil(activeItem.serviceLevelZ * Math.sqrt(combinedVariance));
  const calculatedROP = Math.ceil(leadTimeDemand + safetyStock);
  const isBelowROP = activeItem.currentStock < calculatedROP;

  const handleUpdateParam = (field: keyof DynamicROPConfig, value: number) => {
    setItems(prev => prev.map(i => i.sku === activeItem.sku ? { ...i, [field]: value } : i));
  };

  const handleTriggerPO = () => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#FF6B00', '#FFA043', '#00E5FF']
    });

    const poNumber = `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setCreatedPoNotice(`Successfully generated and authorized ${poNumber} for 500 units of ${activeItem.sku} to Tier-1 Vendor.`);
    setTimeout(() => setCreatedPoNotice(null), 5000);
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
            <Truck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
              Supply Chain & SCM Strategic Procurement
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Statistical Dynamic Reorder Point (ROP) & Vendor Rating Matrix
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {items.map(it => (
            <button
              key={it.sku}
              onClick={() => setSelectedSku(it.sku)}
              className={selectedSku === it.sku ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 12px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
            >
              {it.sku}
            </button>
          ))}
        </div>
      </div>

      {createdPoNotice && (
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
          <ShieldCheck size={18} />
          <span>{createdPoNotice}</span>
        </div>
      )}

      {/* Dynamic ROP Calculator Workbench */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '20px'
        }}
      >
        {/* Sliders & Parameters */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFF' }}>
              Dynamic ROP Parameter Tuning: <span style={{ color: 'var(--accent-orange)' }}>{activeItem.itemName}</span>
            </span>
            <span className="status-pill status-pill-orange">RLBF CALIBRATED</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Average Daily Demand (units/day)</span>
                <span className="font-mono" style={{ fontWeight: 700, color: '#FFF' }}>{activeItem.avgDailyDemand}</span>
              </div>
              <input 
                type="range" 
                min="20" 
                max="500" 
                value={activeItem.avgDailyDemand}
                onChange={e => handleUpdateParam('avgDailyDemand', parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-orange)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Demand Volatility StdDev (σ_D)</span>
                <span className="font-mono" style={{ fontWeight: 700, color: '#FFF' }}>{activeItem.stddevDemand}</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="100" 
                value={activeItem.stddevDemand}
                onChange={e => handleUpdateParam('stddevDemand', parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-orange)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Average Supplier Lead Time (days)</span>
                <span className="font-mono" style={{ fontWeight: 700, color: '#FFF' }}>{activeItem.avgLeadTimeDays} days</span>
              </div>
              <input 
                type="range" 
                min="3" 
                max="45" 
                value={activeItem.avgLeadTimeDays}
                onChange={e => handleUpdateParam('avgLeadTimeDays', parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-orange)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Target Service Level (Z-Factor)</span>
                <span className="font-mono" style={{ fontWeight: 700, color: '#00E5FF' }}>
                  {activeItem.serviceLevelZ === 2.326 ? '99.0% (Z=2.326)' : '95.0% (Z=1.645)'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button 
                  onClick={() => handleUpdateParam('serviceLevelZ', 1.645)}
                  className={activeItem.serviceLevelZ === 1.645 ? 'btn-primary' : 'btn-secondary'}
                  style={{ flex: 1, padding: '6px' }}
                >
                  95.0% Service Level
                </button>
                <button 
                  onClick={() => handleUpdateParam('serviceLevelZ', 2.326)}
                  className={activeItem.serviceLevelZ === 2.326 ? 'btn-primary' : 'btn-secondary'}
                  style={{ flex: 1, padding: '6px' }}
                >
                  99.0% Service Level
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results & Statistical Formulation */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px' }}>
              STATISTICAL FORMULA OUTPUT
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Lead Time Demand</div>
                <div className="font-mono" style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>
                  {leadTimeDemand.toLocaleString()} <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>units</span>
                </div>
              </div>
              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Safety Stock (Z·σ)</div>
                <div className="font-mono" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-orange-bright)' }}>
                  {safetyStock.toLocaleString()} <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>units</span>
                </div>
              </div>
            </div>

            <div 
              style={{
                padding: '16px',
                borderRadius: '8px',
                background: isBelowROP ? 'rgba(255, 107, 0, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                border: `1px solid ${isBelowROP ? 'var(--accent-orange)' : '#10B981'}`,
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>DYNAMIC REORDER POINT (ROP)</div>
                  <div className="font-mono" style={{ fontSize: '24px', fontWeight: 900, color: '#FFF' }}>
                    {calculatedROP.toLocaleString()} units
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>CURRENT ON-HAND STOCK</div>
                  <div className="font-mono" style={{ fontSize: '20px', fontWeight: 800, color: isBelowROP ? '#FF851B' : '#10B981' }}>
                    {activeItem.currentStock.toLocaleString()} units
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: isBelowROP ? 'var(--accent-orange-bright)' : '#10B981', marginTop: '6px' }}>
                {isBelowROP ? '⚠️ Stock is below ROP threshold! Automated purchase order recommended.' : '✅ Inventory level optimal.'}
              </div>
            </div>
          </div>

          <button 
            onClick={handleTriggerPO}
            className="btn-primary"
            style={{ width: '100%', padding: '12px' }}
          >
            <Sparkles size={16} />
            <span>Generate Tier-1 Purchase Order ($12,500.00)</span>
          </button>
        </div>
      </div>

      {/* Supplier Scorecard Table */}
      <div className="enterprise-table-container">
        <div style={{ padding: '14px 18px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: '13px' }}>
          Tier-1 Strategic Supplier Composite Scorecards
        </div>
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Vendor Code</th>
              <th>Company Name</th>
              <th>Rating Score</th>
              <th>Quality Defect PPM</th>
              <th>On-Time Delivery (OTIF)</th>
              <th>Payment Terms</th>
              <th>Vendor Status</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map(v => (
              <tr key={v.id}>
                <td className="font-mono" style={{ color: 'var(--accent-orange-bright)', fontWeight: 600 }}>{v.code}</td>
                <td style={{ fontWeight: 600 }}>{v.name}</td>
                <td className="font-mono" style={{ fontWeight: 700, color: v.ratingScore >= 95 ? '#10B981' : '#FFB020' }}>
                  {v.ratingScore.toFixed(1)} / 100
                </td>
                <td className="font-mono">{v.qualityPPM} PPM</td>
                <td className="font-mono" style={{ color: '#10B981' }}>{v.onTimeDeliveryPct.toFixed(1)}%</td>
                <td>{v.paymentTerms}</td>
                <td>
                  <span className={v.status === 'TIER_1_PREFERRED' ? 'status-pill-success' : 'status-pill-orange'} style={{ fontSize: '9px' }}>
                    {v.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
