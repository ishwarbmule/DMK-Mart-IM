import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  SlidersHorizontal,
  X,
  Upload
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlasticProductItem, PricingTiers } from '../../types/erp';
import { INITIAL_PLASTICS_CATALOG } from '../../data/plasticsCatalog';
import { ExportDropdown } from '../common/ExportDropdown';
import { ExportOptions } from '../../utils/exportUtils';
import { useERPData } from '../../context/ERPContext';
import { BulkProductUploadModal } from './BulkProductUploadModal';

export const PlasticsProductMaster: React.FC = () => {
  const { products, addProduct: addGlobalProduct, bulkAddProducts: addGlobalBulkProducts } = useERPData();
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState<boolean>(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // New Product Form State
  const [newSku, setNewSku] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<any>('Chairs & Stools');
  const [newMaterial, setNewMaterial] = useState<any>('Virgin Polypropylene (PP)');
  const [newHsn, setNewHsn] = useState<string>('39249090');
  const [newGst, setNewGst] = useState<number>(18);
  const [newUom, setNewUom] = useState<any>('Pcs');
  const [newWeight, setNewWeight] = useState<number>(1200);
  const [newStock, setNewStock] = useState<number>(100);
  const [t1, setT1] = useState<number>(150);
  const [t2, setT2] = useState<number>(170);
  const [t3, setT3] = useState<number>(190);
  const [t4, setT4] = useState<number>(215);
  const [t5, setT5] = useState<number>(280);

  const categories = ['ALL', 'Chairs & Stools', 'Buckets & Basins', 'Kitchen Storage & Jars', 'Crates & Industrial', 'Cleaning & Dustbins', 'Bath & Mugs'];

  const filtered = products.filter(p => {
    const matchCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchQ = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                   p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   p.hsnCode.includes(searchQuery);
    return matchCat && matchQ;
  });

  const catalogExportOptions: ExportOptions<PlasticProductItem> = {
    filename: `DMK_Plastics_Master_Catalog_${new Date().toISOString().split('T')[0]}`,
    title: 'Plastics Product Master & 5-Tier Price Matrix',
    companyName: 'DMK Mart Multi-Company Manufacturing Platform',
    subtitle: categoryFilter === 'ALL' ? `All Categories (${filtered.length} products)` : `Category: ${categoryFilter} (${filtered.length} products)`,
    columns: [
      { header: 'SKU Code', key: 'sku', width: 14 },
      { header: 'Product Name', key: 'name', width: 35 },
      { header: 'Category', key: 'category', width: 22 },
      { header: 'Base Polymer Material', key: 'material', width: 24 },
      { header: 'HSN Code', key: 'hsnCode', width: 12 },
      { header: 'GST %', key: 'gstRate', format: v => `${v}%`, width: 8, align: 'right' },
      { header: 'UOM', key: 'unitOfMeasure', width: 8, align: 'center' },
      { header: 'Weight (g)', key: 'weightGrams', format: v => `${v}g`, width: 12, align: 'right' },
      { header: 'Current Stock', key: 'stockQuantity', width: 12, align: 'right' },
      { header: 'Tier 1 Super Dist (₹)', key: 'pricing', format: (_, row) => row.pricing.tier1_distributor, width: 16, align: 'right' },
      { header: 'Tier 2 Wholesale (₹)', key: 'pricing', format: (_, row) => row.pricing.tier2_wholesale, width: 16, align: 'right' },
      { header: 'Tier 3 Semi-Wholesale (₹)', key: 'pricing', format: (_, row) => row.pricing.tier3_semi_wholesale, width: 18, align: 'right' },
      { header: 'Tier 4 Retail Shop (₹)', key: 'pricing', format: (_, row) => row.pricing.tier4_retailer, width: 16, align: 'right' },
      { header: 'Tier 5 Direct MRP (₹)', key: 'pricing', format: (_, row) => row.pricing.tier5_mrp, width: 18, align: 'right' }
    ],
    data: filtered
  };

  const handleAddProduct = () => {
    if (!newSku || !newName) return;

    confetti({ particleCount: 50, spread: 60 });

    const newProd: PlasticProductItem = {
      id: `p-${Date.now()}`,
      sku: newSku.toUpperCase(),
      name: newName,
      category: newCategory,
      material: newMaterial,
      hsnCode: newHsn,
      gstRate: newGst,
      unitOfMeasure: newUom,
      weightGrams: newWeight,
      colorOptions: ['Standard Assorted'],
      stockQuantity: newStock,
      damagedStock: 0,
      lowStockThreshold: 25,
      purchaseBaseCost: Math.round(t2 * 0.75),
      companyId: 'comp-01',
      pricing: {
        tier1_distributor: t1,
        tier2_wholesale: t2,
        tier3_semi_wholesale: t3,
        tier4_retailer: t4,
        tier5_mrp: t5
      }
    };

    addGlobalProduct(newProd);
    setShowAddModal(false);
    setSaveNotice(`✅ Product "${newProd.name}" (${newProd.sku}) added to catalog.`);
    setTimeout(() => setSaveNotice(null), 5000);

    // Reset Form
    setNewSku('');
    setNewName('');
  };

  const handleBulkImportSuccess = (importedProducts: PlasticProductItem[]) => {
    addGlobalBulkProducts(importedProducts);
    setSaveNotice(`✅ Successfully imported ${importedProducts.length} manufactured items with 5-tier pricing matrix into live catalog.`);
    setTimeout(() => setSaveNotice(null), 6000);
  };

  const handleDeleteProduct = (id: string) => {
    // Note: If ERPContext doesn't expose delete, this might need an update to the context itself
    console.warn("Delete functionality requires implementation in ERPContext");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div 
        className="glass-panel"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div 
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              boxShadow: '0 0 12px rgba(255, 107, 0, 0.4)'
            }}
          >
            <Package size={20} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
              Plastics Product Master & 5-Tier Price Matrix
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Catalog of 500+ Household, Kitchen, Chair, Bucket & Industrial Items with 5 Dynamic Pricing Levels
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <ExportDropdown options={catalogExportOptions} buttonLabel="Export Catalog" />
          
          <button
            type="button"
            onClick={() => setShowBulkUploadModal(true)}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '12px', color: '#00E5FF', borderColor: 'rgba(0, 229, 255, 0.4)' }}
          >
            <Upload size={14} />
            <span>Bulk Upload (CSV / Excel)</span>
          </button>

          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '12px' }}
          >
            <Plus size={15} />
            <span>Add Single Product</span>
          </button>
        </div>
      </div>

      {saveNotice && (
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
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div 
        className="glass-panel"
        style={{
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          <Search size={18} color="var(--accent-orange)" />
          <input 
            type="text"
            placeholder="Search by SKU, Product Name (chair, bucket, basin, jar, crate), HSN Code..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#FFF',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}
              style={{ height: '36px', padding: '0 16px', fontSize: '12.5px', fontWeight: 600, borderRadius: '8px' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Master Table */}
      <div className="enterprise-table-container">
        <table className="enterprise-table" style={{ tableLayout: 'auto' }}>
          <thead>
            <tr>
              <th style={{ minWidth: '130px' }}>SKU / Code</th>
              <th style={{ minWidth: '240px' }}>Product Name & Specifications</th>
              <th style={{ minWidth: '140px' }}>Category</th>
              <th style={{ minWidth: '90px' }}>HSN Code</th>
              <th style={{ minWidth: '70px', textAlign: 'center' }}>GST %</th>
              <th style={{ minWidth: '90px', textAlign: 'right' }}>Stock Qty</th>
              <th style={{ minWidth: '110px', textAlign: 'right', background: 'rgba(255, 107, 0, 0.08)' }}>T1: Distributor</th>
              <th style={{ minWidth: '110px', textAlign: 'right' }}>T2: Wholesale</th>
              <th style={{ minWidth: '110px', textAlign: 'right' }}>T3: Semi-Whl</th>
              <th style={{ minWidth: '110px', textAlign: 'right' }}>T4: Retailer</th>
              <th style={{ minWidth: '110px', textAlign: 'right', background: 'rgba(16, 185, 129, 0.08)' }}>T5: MRP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td className="font-mono" style={{ color: 'var(--accent-orange-bright)', fontWeight: 800, fontSize: '13px' }}>
                  {p.sku}
                </td>
                <td>
                  <div style={{ fontWeight: 700, color: '#FFF', fontSize: '13.5px' }}>{p.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    Material: {p.material} • Weight: {p.weightGrams}g • UOM: {p.unitOfMeasure}
                  </div>
                </td>
                <td>
                  <span className="status-pill status-pill-cyan">
                    {p.category}
                  </span>
                </td>
                <td className="font-mono" style={{ fontSize: '12px' }}>{p.hsnCode}</td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{p.gstRate}%</td>
                <td className="font-mono" style={{ textAlign: 'right', fontWeight: 700, color: p.stockQuantity < 200 ? '#FFB020' : '#FFF' }}>
                  {p.stockQuantity} {p.unitOfMeasure}
                </td>
                
                {/* 5-Tier Pricing Columns */}
                <td className="font-mono" style={{ textAlign: 'right', fontWeight: 800, color: 'var(--accent-orange-bright)', background: 'rgba(255, 107, 0, 0.04)', fontSize: '13.5px' }}>
                  ₹{p.pricing.tier1_distributor.toFixed(2)}
                </td>
                <td className="font-mono" style={{ textAlign: 'right', fontWeight: 600, fontSize: '13.5px' }}>
                  ₹{p.pricing.tier2_wholesale.toFixed(2)}
                </td>
                <td className="font-mono" style={{ textAlign: 'right', fontWeight: 600, fontSize: '13.5px' }}>
                  ₹{p.pricing.tier3_semi_wholesale.toFixed(2)}
                </td>
                <td className="font-mono" style={{ textAlign: 'right', fontWeight: 600, fontSize: '13.5px' }}>
                  ₹{p.pricing.tier4_retailer.toFixed(2)}
                </td>
                <td className="font-mono" style={{ textAlign: 'right', fontWeight: 800, color: '#10B981', background: 'rgba(16, 185, 129, 0.04)', fontSize: '13.5px' }}>
                  ₹{p.pricing.tier5_mrp.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 10, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '680px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--accent-orange-border)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
              padding: '24px',
              borderRadius: '12px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
                Add New Plastic Manufactured Item (with 5-Tier Pricing)
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                <div>
                  <label className="form-label">PRODUCT SKU / CODE *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. DMK-CHR-SUPREME"
                    value={newSku} 
                    onChange={e => setNewSku(e.target.value)}
                    className="form-input font-mono"
                  />
                </div>
                <div>
                  <label className="form-label">FULL ITEM NAME *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. DMK Supreme Armless Plastic Dining Chair"
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">PRODUCT CATEGORY</label>
                  <select 
                    value={newCategory} 
                    onChange={e => setNewCategory(e.target.value)}
                    className="form-input"
                  >
                    {categories.filter(c => c !== 'ALL').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">HSN CODE</label>
                  <input 
                    type="text" 
                    value={newHsn} 
                    onChange={e => setNewHsn(e.target.value)}
                    className="form-input font-mono"
                  />
                </div>
                <div>
                  <label className="form-label">GST RATE</label>
                  <select 
                    value={newGst} 
                    onChange={e => setNewGst(parseInt(e.target.value))}
                    className="form-input"
                  >
                    <option value={5}>5% GST (Standard)</option>
                    <option value={12}>12% GST (Semi-Processed)</option>
                    <option value={18}>18% GST (Moulded Goods)</option>
                  </select>
                </div>
              </div>

              {/* 5-Tier Pricing Inputs with Spacious Cards & Adornments */}
              <div 
                style={{ 
                  background: 'var(--bg-tertiary)', 
                  padding: '18px 20px', 
                  borderRadius: '10px', 
                  border: '1px solid var(--accent-orange-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFF' }}>
                    5-Tier Pricing Matrix (Selling Rates)
                  </span>
                  <span className="status-pill status-pill-orange" style={{ fontSize: '10px' }}>
                    INDIAN RUPEES (₹)
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '11px' }}>T1: Distributor</label>
                    <input 
                      type="number" 
                      value={t1} 
                      onChange={e => setT1(parseFloat(e.target.value) || 0)} 
                      className="form-input font-mono" 
                      style={{ textAlign: 'right', fontWeight: 700 }} 
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '11px' }}>T2: Wholesale</label>
                    <input 
                      type="number" 
                      value={t2} 
                      onChange={e => setT2(parseFloat(e.target.value) || 0)} 
                      className="form-input font-mono" 
                      style={{ textAlign: 'right', fontWeight: 700 }} 
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '11px' }}>T3: Semi-Whl</label>
                    <input 
                      type="number" 
                      value={t3} 
                      onChange={e => setT3(parseFloat(e.target.value) || 0)} 
                      className="form-input font-mono" 
                      style={{ textAlign: 'right', fontWeight: 700 }} 
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '11px' }}>T4: Retailer</label>
                    <input 
                      type="number" 
                      value={t4} 
                      onChange={e => setT4(parseFloat(e.target.value) || 0)} 
                      className="form-input font-mono" 
                      style={{ textAlign: 'right', fontWeight: 700 }} 
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '11px', color: '#10B981' }}>T5: Direct MRP</label>
                    <input 
                      type="number" 
                      value={t5} 
                      onChange={e => setT5(parseFloat(e.target.value) || 0)} 
                      className="form-input font-mono" 
                      style={{ textAlign: 'right', color: '#10B981', fontWeight: 800, borderColor: 'rgba(16, 185, 129, 0.4)' }} 
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)} 
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleAddProduct} 
                  className="btn-primary"
                >
                  <Plus size={16} /> 
                  <span>Save Product to Master Catalog</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Product Upload Modal */}
      <BulkProductUploadModal 
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        onImportSuccess={handleBulkImportSuccess}
      />
    </div>
  );
};
