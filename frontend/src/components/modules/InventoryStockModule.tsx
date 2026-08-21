import React, { useState, useMemo } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Search, 
  ShieldAlert, 
  RotateCcw, 
  CheckCircle2, 
  IndianRupee, 
  Filter, 
  Upload, 
  Download, 
  TrendingDown, 
  Layers, 
  ArrowRight, 
  Truck, 
  Sparkles,
  X,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useERPData } from '../../context/ERPContext';
import { PlasticProductItem } from '../../types/erp';
import { BulkProductUploadModal } from './BulkProductUploadModal';
import { ExportDropdown } from '../common/ExportDropdown';

export const InventoryStockModule: React.FC = () => {
  const { 
    products, 
    lowStockAlerts, 
    transferDamagedStock, 
    createPurchaseOrder, 
    vendors,
    bulkAddProducts 
  } = useERPData();

  const [activeTab, setActiveTab] = useState<'dual_stock_matrix' | 'low_stock_alerts' | 'damaged_stock_quarantine'>('dual_stock_matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  // Modals
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferProdId, setTransferProdId] = useState(products[0]?.id || 'p-01');
  const [transferQty, setTransferQty] = useState(2);
  const [transferReason, setTransferReason] = useState('Internal warehouse transit cracking');

  // Categories
  const categories = ['ALL', 'Chairs & Stools', 'Buckets & Basins', 'Kitchen Storage & Jars', 'Crates & Industrial', 'Cleaning & Dustbins', 'Bath & Mugs'];

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchQuery = !q || 
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        (p.manufacturerName && p.manufacturerName.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  // Total Valuations
  const stockValuations = useMemo(() => {
    let mainValuation = 0;
    let damagedValuation = 0;
    let totalMainUnits = 0;
    let totalDamagedUnits = 0;

    products.forEach(p => {
      mainValuation += p.stockQuantity * p.purchaseBaseCost;
      damagedValuation += p.damagedStock * p.purchaseBaseCost;
      totalMainUnits += p.stockQuantity;
      totalDamagedUnits += p.damagedStock;
    });

    return { mainValuation, damagedValuation, totalMainUnits, totalDamagedUnits };
  }, [products]);

  // Handle Internal Damage Transfer
  const handleConfirmTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferProdId || transferQty <= 0) return;
    transferDamagedStock(transferProdId, transferQty, transferReason);
    setShowTransferModal(false);
    confetti({ particleCount: 30, spread: 50 });
  };

  // 1-Click Draft PO from Low Stock Alert
  const handleQuickReorderPO = (alert: any) => {
    const targetProd = products.find(p => p.id === alert.productId);
    const targetVendor = vendors.find(v => v.name.toLowerCase().includes((alert.preferredVendorName || '').toLowerCase())) || vendors[0];
    
    if (!targetProd || !targetVendor) return;

    const poQty = alert.deficitQuantity;
    const taxable = poQty * targetProd.purchaseBaseCost;
    const gst = taxable * (targetProd.gstRate / 100);
    const grandTotal = taxable + gst;

    const newPO = {
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      vendorId: targetVendor.id,
      vendorName: targetVendor.name,
      vendorType: targetVendor.partyType,
      orderDate: new Date().toISOString().split('T')[0],
      status: 'PENDING' as const,
      subtotalTaxable: taxable,
      totalCGST: targetVendor.stateCode === '27' ? gst / 2 : 0,
      totalSGST: targetVendor.stateCode === '27' ? gst / 2 : 0,
      totalIGST: targetVendor.stateCode !== '27' ? gst : 0,
      grandTotal,
      notes: `Auto-generated reorder PO for low-stock item: ${targetProd.name}`,
      lineItems: [
        {
          id: `poi-${Date.now()}`,
          productId: targetProd.id,
          productSku: targetProd.sku,
          productName: targetProd.name,
          hsnCode: targetProd.hsnCode,
          quantity: poQty,
          unitCost: targetProd.purchaseBaseCost,
          taxableAmount: taxable,
          gstRate: targetProd.gstRate,
          cgstAmount: gst / 2,
          sgstAmount: gst / 2,
          igstAmount: 0,
          totalAmount: grandTotal
        }
      ]
    };

    createPurchaseOrder(newPO);
    confetti({ particleCount: 45, spread: 60 });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Banner */}
      <div 
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(255, 107, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-orange)'
              }}
            >
              <Package size={20} />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Inventory & Dual Stock Management
            </h1>
            <span 
              style={{
                background: 'rgba(2, 132, 199, 0.15)',
                color: '#38BDF8',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                border: '1px solid rgba(2, 132, 199, 0.3)'
              }}
            >
              MAIN SELLABLE ◄► DAMAGED STOCK
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
            Real-time segregation between active sellable stock and damaged/broken stock. Automated low-stock trigger alerts with 1-click reorder.
          </p>
        </div>

        {/* Top Actions */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowTransferModal(true)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#EF4444',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <ShieldAlert size={16} />
            Quarantine Damaged Stock
          </button>

          <button
            onClick={() => setShowBulkModal(true)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Upload size={16} />
            Bulk Import Products
          </button>
        </div>
      </div>

      {/* Valuation & Alert KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* Main Sellable Stock Valuation */}
        <div style={{ background: 'var(--bg-secondary)', padding: '18px 20px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Main Sellable Stock Value
            </span>
            <Package size={16} color="#10B981" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
            ₹{stockValuations.mainValuation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {stockValuations.totalMainUnits.toLocaleString('en-IN')} units ready for sale
          </div>
        </div>

        {/* Damaged / Broken Stock Valuation */}
        <div style={{ background: 'var(--bg-secondary)', padding: '18px 20px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Damaged / Broken Stock Value
            </span>
            <ShieldAlert size={16} color="#EF4444" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#EF4444', fontFamily: 'var(--font-mono)' }}>
            ₹{stockValuations.damagedValuation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {stockValuations.totalDamagedUnits} damaged units awaiting return to supplier
          </div>
        </div>

        {/* Low Stock Alerts Active */}
        <div 
          onClick={() => setActiveTab('low_stock_alerts')}
          style={{ 
            background: lowStockAlerts.length > 0 ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-secondary)', 
            padding: '18px 20px', 
            borderRadius: '10px', 
            border: `1px solid ${lowStockAlerts.length > 0 ? '#F59E0B' : 'var(--border-subtle)'}`,
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: lowStockAlerts.length > 0 ? '#F59E0B' : 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Low Stock Alerts
            </span>
            <AlertTriangle size={16} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#F59E0B', fontFamily: 'var(--font-mono)' }}>
            {lowStockAlerts.length} SKUs Need Reorder
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Click to review and 1-click reorder from suppliers
          </div>
        </div>

      </div>

      {/* Navigation Tabs & Search */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-secondary)',
          borderRadius: '10px',
          padding: '12px 18px',
          border: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('dual_stock_matrix')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: activeTab === 'dual_stock_matrix' ? 'var(--accent-orange)' : 'transparent',
              color: activeTab === 'dual_stock_matrix' ? '#FFF' : 'var(--text-secondary)',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Package size={15} />
            Dual Stock Matrix ({products.length} SKUs)
          </button>

          <button
            onClick={() => setActiveTab('low_stock_alerts')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: activeTab === 'low_stock_alerts' ? 'var(--accent-orange)' : 'transparent',
              color: activeTab === 'low_stock_alerts' ? '#FFF' : 'var(--text-secondary)',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <AlertTriangle size={15} color={activeTab === 'low_stock_alerts' ? '#FFF' : '#F59E0B'} />
            Low Stock Alerts ({lowStockAlerts.length})
          </button>

          <button
            onClick={() => setActiveTab('damaged_stock_quarantine')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: activeTab === 'damaged_stock_quarantine' ? 'var(--accent-orange)' : 'transparent',
              color: activeTab === 'damaged_stock_quarantine' ? '#FFF' : 'var(--text-secondary)',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShieldAlert size={15} color={activeTab === 'damaged_stock_quarantine' ? '#FFF' : '#EF4444'} />
            Damaged Stock Quarantine
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '7px 10px',
              borderRadius: '6px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '12px'
            }}
          >
            {categories.map(c => <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>)}
          </select>

          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} color="var(--text-tertiary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search SKU or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px 7px 30px',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '12px'
              }}
            />
          </div>
        </div>
      </div>

      {/* TAB 1: DUAL STOCK MATRIX */}
      {activeTab === 'dual_stock_matrix' && (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-medium)' }}>
                  <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Product Name & SKU</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Category & Material</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Manufacturer / Supplier</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'center' }}>Main Sellable Stock</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'center' }}>Damaged / Broken</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Threshold</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Procurement Cost</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Wholesale Rate</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'right' }}>Stock Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => {
                  const isLow = p.stockQuantity <= p.lowStockThreshold;
                  const hasDamaged = p.damagedStock > 0;
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: isLow ? 'rgba(245, 158, 11, 0.04)' : 'transparent' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>{p.name}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>{p.sku} | HSN: {p.hsnCode}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <div>{p.category}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{p.material}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {p.manufacturerName || 'National Multi-Brand'}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span 
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '15px',
                            fontWeight: 900,
                            color: isLow ? '#F59E0B' : '#10B981',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: isLow ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.12)'
                          }}
                        >
                          {p.stockQuantity} {p.unitOfMeasure}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span 
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '13px',
                            fontWeight: 800,
                            color: hasDamaged ? '#EF4444' : 'var(--text-tertiary)',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: hasDamaged ? 'rgba(239, 68, 68, 0.15)' : 'transparent'
                          }}
                        >
                          {p.damagedStock} Pcs
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        {p.lowStockThreshold} Pcs
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        ₹{p.purchaseBaseCost.toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--accent-orange)' }}>
                        ₹{p.pricing.tier2_wholesale.toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {isLow ? (
                          <span 
                            style={{
                              background: 'rgba(245, 158, 11, 0.15)',
                              color: '#F59E0B',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700
                            }}
                          >
                            ⚠️ LOW STOCK
                          </span>
                        ) : (
                          <span 
                            style={{
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#10B981',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700
                            }}
                          >
                            OPTIMAL
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LOW STOCK ALERTS & 1-CLICK REORDER */}
      {activeTab === 'low_stock_alerts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {lowStockAlerts.length === 0 ? (
            <div style={{ background: 'var(--bg-secondary)', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
              <CheckCircle2 size={40} color="#10B981" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>All Inventory Stock Levels Optimal!</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                No SKUs are currently below their reorder threshold limit.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
              {lowStockAlerts.map(alert => (
                <div 
                  key={alert.productId}
                  style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: '10px',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    boxShadow: '0 4px 16px rgba(245, 158, 11, 0.1)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span 
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: alert.urgency === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: alert.urgency === 'CRITICAL' ? '#EF4444' : '#F59E0B'
                        }}
                      >
                        🚨 {alert.urgency} URGENCY
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        {alert.sku}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>
                      {alert.name}
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                      Category: {alert.category} | Supplier: {alert.preferredVendorName}
                    </span>
                  </div>

                  <div 
                    style={{
                      background: 'var(--bg-tertiary)',
                      padding: '12px',
                      borderRadius: '8px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '8px',
                      textAlign: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Current Stock</div>
                      <div style={{ fontSize: '16px', fontWeight: 900, color: '#EF4444', fontFamily: 'var(--font-mono)' }}>
                        {alert.currentStock}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Threshold</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {alert.threshold}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Reorder Qty</div>
                      <div style={{ fontSize: '16px', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                        +{alert.deficitQuantity}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Est. Procurement Cost</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        ₹{alert.estimatedReorderCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </div>
                    </div>

                    <button
                      onClick={() => handleQuickReorderPO(alert)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)',
                        border: 'none',
                        color: '#FFF',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(255, 107, 0, 0.3)'
                      }}
                    >
                      <Truck size={14} /> 1-Click Reorder PO
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DAMAGED STOCK QUARANTINE */}
      {activeTab === 'damaged_stock_quarantine' && (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#EF4444' }}>
                Quarantined Damaged & Defective Stock
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                Products damaged in transit or returned by customers are isolated here so they cannot be sold accidentally.
              </span>
            </div>
            <button
              onClick={() => setShowTransferModal(true)}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#EF4444',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={14} /> Quarantine Warehouse Damaged Items
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-medium)' }}>
                  <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Product Name</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>SKU Code</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Manufacturer Vendor</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'center' }}>Damaged Quantity</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Unit Cost</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Loss Value</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.filter(p => p.damagedStock > 0).map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>
                      {p.name}
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                      {p.sku}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {p.manufacturerName || 'General Supplier'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span 
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '14px',
                          fontWeight: 900,
                          color: '#EF4444',
                          background: 'rgba(239, 68, 68, 0.15)',
                          padding: '4px 10px',
                          borderRadius: '4px'
                        }}
                      >
                        {p.damagedStock} Units
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      ₹{p.purchaseBaseCost.toFixed(2)}
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 800, color: '#EF4444' }}>
                      ₹{(p.damagedStock * p.purchaseBaseCost).toFixed(2)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span 
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#EF4444',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        QUARANTINED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: INTERNAL DAMAGE TRANSFER                                      */}
      {/* ==================================================================== */}
      {showTransferModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            style={{
              background: 'var(--bg-secondary)',
              width: '100%',
              maxWidth: '540px',
              borderRadius: '12px',
              border: '1px solid var(--border-medium)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#EF4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} /> Quarantine Warehouse Damaged Goods
              </h3>
              <button 
                onClick={() => setShowTransferModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Select Product with Damage *
                </label>
                <select
                  value={transferProdId}
                  onChange={(e) => setTransferProdId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Main Stock: {p.stockQuantity} | Damaged: {p.damagedStock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Damaged Quantity to Quarantine *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={transferQty}
                  onChange={(e) => setTransferQty(parseInt(e.target.value) || 1)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Defect / Damage Reason
                </label>
                <input
                  type="text"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontSize: '12px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 20px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    border: 'none',
                    color: '#FFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Quarantine to Damaged Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      <BulkProductUploadModal 
        isOpen={showBulkModal} 
        onClose={() => setShowBulkModal(false)} 
        onImportSuccess={(imported) => {
          bulkAddProducts(imported);
          setShowBulkModal(false);
        }}
      />

    </div>
  );
};
