import React, { useState } from 'react';
import { Package, Scan, MapPin, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Navigation } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BinLocation {
  binCode: string;
  zone: string;
  sku: string;
  quantity: number;
  capacityPct: number;
  isPickTarget: boolean;
}

export const WarehouseModule: React.FC = () => {
  const [barcodeInput, setBarcodeInput] = useState('01008500012345671726123110LOT-2026-0811');
  const [scannedResult, setScannedResult] = useState<any | null>(null);

  const [bins, setBins] = useState<BinLocation[]>([
    { binCode: 'Z1-A01-R1-B1', zone: 'Zone Alpha (Fast Moving)', sku: 'RAW-STL-404', quantity: 850, capacityPct: 85, isPickTarget: true },
    { binCode: 'Z1-A01-R1-B2', zone: 'Zone Alpha (Fast Moving)', sku: 'RAW-STL-404', quantity: 1000, capacityPct: 100, isPickTarget: false },
    { binCode: 'Z1-A02-R2-B1', zone: 'Zone Alpha (Fast Moving)', sku: 'ELEC-MCU-88X', quantity: 3400, capacityPct: 68, isPickTarget: true },
    { binCode: 'Z2-B01-R1-B1', zone: 'Zone Beta (Sub-Assemblies)', sku: 'SUB-ACTUATOR-ASSY', quantity: 120, capacityPct: 60, isPickTarget: true },
    { binCode: 'Z2-B02-R3-B4', zone: 'Zone Beta (Sub-Assemblies)', sku: 'SUB-CTRL-BOARD', quantity: 45, capacityPct: 45, isPickTarget: false },
    { binCode: 'Z3-C01-R1-B1', zone: 'Zone Gamma (Hazard/Quarantine)', sku: 'POLY-RES-90', quantity: 1200, capacityPct: 80, isPickTarget: false },
  ]);

  const [pickWaveExecuted, setPickWaveExecuted] = useState(false);

  const handleScanBarcode = () => {
    confetti({ particleCount: 50, spread: 50 });
    setScannedResult({
      gtin: '00850001234567',
      expiryDate: '2026-12-31',
      lotNumber: 'LOT-2026-0811',
      itemSku: 'RAW-STL-404',
      itemName: '316L Stainless Core Shaft (50mm)',
      targetBin: 'Z1-A01-R1-B1',
      status: 'VERIFIED_RELEASED'
    });
  };

  const handleOptimizeWave = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      colors: ['#00E5FF', '#FF6B00', '#FFFFFF']
    });
    setPickWaveExecuted(true);
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
            <Package size={20} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
              Intelligent Warehouse Logistics (WMS)
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              3D Spatial Topology, GS1-128 Barcode Scanner & Traveling Salesperson Wave Picking
            </div>
          </div>
        </div>

        <button onClick={handleOptimizeWave} className="btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>
          <Navigation size={15} />
          <span>Optimize Wave Pick Path (-35% Transit)</span>
        </button>
      </div>

      {/* Main Grid: Spatial Bin Map & Barcode Scanner */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '20px'
        }}
      >
        {/* Spatial Warehouse Map */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFF' }}>
              Spatial Warehouse Matrix & Real-Time Quant Heatmap
            </span>
            {pickWaveExecuted && (
              <span className="status-pill status-pill-cyan">
                OPTIMIZED PICK PATH ACTIVE (A* DIJKSTRA)
              </span>
            )}
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '12px'
            }}
          >
            {bins.map((bin, idx) => (
              <div 
                key={idx}
                style={{
                  background: 'var(--bg-primary)',
                  border: bin.isPickTarget && pickWaveExecuted 
                    ? '2px solid var(--accent-orange)' 
                    : '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '14px',
                  boxShadow: bin.isPickTarget && pickWaveExecuted ? '0 0 16px rgba(255, 107, 0, 0.3)' : 'none',
                  position: 'relative'
                }}
              >
                {bin.isPickTarget && pickWaveExecuted && (
                  <span 
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'var(--accent-orange)',
                      color: '#FFF',
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}
                  >
                    WAVE STOP #{idx + 1}
                  </span>
                )}

                <div className="font-mono" style={{ fontSize: '13px', fontWeight: 700, color: '#FFF' }}>
                  {bin.binCode}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                  {bin.zone}
                </div>

                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-orange-bright)' }}>
                  {bin.sku}
                </div>
                <div className="font-mono" style={{ fontSize: '14px', fontWeight: 800, color: '#FFF', marginTop: '2px' }}>
                  {bin.quantity.toLocaleString()} <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>units</span>
                </div>

                {/* Capacity Bar */}
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>
                    <span>Bin Volumetric Capacity</span>
                    <span>{bin.capacityPct}%</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div 
                      style={{
                        width: `${bin.capacityPct}%`,
                        height: '100%',
                        background: bin.capacityPct > 90 ? '#EF4444' : bin.capacityPct > 75 ? 'var(--accent-orange)' : '#10B981'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GS1-128 Barcode Scanner Simulator */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scan size={18} color="var(--accent-orange)" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFF' }}>GS1-128 Optical Terminal</span>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>RAW SCANNER INPUT (GS1 STRING)</label>
            <input 
              type="text"
              value={barcodeInput}
              onChange={e => setBarcodeInput(e.target.value)}
              className="font-mono"
              style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#FFF', fontSize: '11px', marginTop: '4px' }}
            />
          </div>

          <button onClick={handleScanBarcode} className="btn-primary" style={{ width: '100%', padding: '10px' }}>
            <Scan size={15} /> Parse GS1 Optical Tag
          </button>

          {scannedResult && (
            <div 
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid var(--accent-orange-border)',
                borderRadius: '8px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#10B981' }}>PARSED TELEMETRY</span>
                <span className="status-pill status-pill-success" style={{ fontSize: '8px' }}>VALIDATED</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                SKU: <strong style={{ color: '#FFF' }}>{scannedResult.itemSku}</strong>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Lot #: <strong className="font-mono" style={{ color: 'var(--accent-orange-bright)' }}>{scannedResult.lotNumber}</strong>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Expiry: <strong className="font-mono" style={{ color: '#FFF' }}>{scannedResult.expiryDate}</strong>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Target Putaway Bin: <strong className="font-mono" style={{ color: '#00E5FF' }}>{scannedResult.targetBin}</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
