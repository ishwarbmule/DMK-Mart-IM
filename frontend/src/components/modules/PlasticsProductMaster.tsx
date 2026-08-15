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
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlasticProductItem, PricingTiers } from '../../types/erp';
import { INITIAL_PLASTICS_CATALOG } from '../../data/plasticsCatalog';

export const PlasticsProductMaster: React.FC = () => {
  const [products, setProducts] = useState<PlasticProductItem[]>(INITIAL_PLASTICS_CATALOG);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
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

  const handleAddProduct = () => {
    if (!newName.trim() || !newSku.trim()) return;

    confetti({ particleCount: 60, spread: 60, colors: ['#FF6B00', '#10B981', '#FFFFFF'] });

    const newItem: PlasticProductItem = {
      id: `p-${Date.now()}`,
      sku: newSku,
      name: newName,
      category: newCategory,
      material: newMaterial,
      hsnCode: newHsn,
      gstRate: newGst,
      unitOfMeasure: newUom,
      weightGrams: newWeight,
      colorOptions: ['Assorted Colours'],
      stockQuantity: newStock,
      companyId: 'comp-01',
      pricing: {
        tier1_distributor: t1,
        tier2_wholesale: t2,
        tier3_semi_wholesale: t3,
        tier4_retailer: t4,
        tier5_mrp: t5
      }
    };

    setProducts(prev => [newItem, ...prev]);
    setShowAddModal(false);
    setSaveNotice(`Product ${newItem.sku} (${newItem.name}) with 5 pricing tiers created successfully.`);
    setTimeout(() => setSaveNotice(null), 5000);

    // Reset Form
    setNewSku('');
    setNewName('');
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
          alignItems: 'center'
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

        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '12px' }}
        >
          <Plus size={15} />
          <span>Add New Plastic Product</span>
        </button>
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

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '4px 12px', fontSize: '11px', borderRadius: '16px' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Master Table */}
      <div className="enterprise-table-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>SKU / Code</th>
              <th>Product Name & Specs</th>
              <th>Category</th>
              <th>HSN Code</th>
              <th>GST %</th>
              <th>Stock</th>
              <th style={{ textAlign: 'right', background: 'rgba(255, 107, 0, 0.08)' }}>T1: Distributor</th>
              <th style={{ textAlign: 'right' }}>T2: Wholesale</th>
              <th style={{ textAlign: 'right' }}>T3: Semi-Whl</th>
              <th style={{ textAlign: 'right' }}>T4: Retailer</th>
              <th style={{ textAlign: 'right', background: 'rgba(16, 185, 129, 0.08)' }}>T5: MRP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td className="font-mono" style={{ color: 'var(--accent-orange-bright)', fontWeight: 700, fontSize: '12px' }}>
                  {p.sku}
                </td>
                <td>
                  <div style={{ fontWeight: 700, color: '#FFF' }}>{p.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                    Material: {p.material} • Weight: {p.weightGrams}g • UOM: {p.unitOfMeasure}
                  </div>
                </td>
                <td>
                  <span className="status-pill status-pill-cyan" style={{ fontSize: '8px' }}>
                    {p.category}
                  </span>
                </td>
                <td className="font-mono" style={{ fontSize: '11px' }}>{p.hsnCode}</td>
                <td>{p.gstRate}%</td>
                <td className="font-mono" style={{ fontWeight: 700, color: p.stockQuantity < 200 ? '#FFB020' : '#FFF' }}>
                  {p.stockQuantity} {p.unitOfMeasure}
                </td>
                
                {/* 5-Tier Pricing Columns */}
                <td className="font-mono" style={{ textAlign: 'right', fontWeight: 800, color: 'var(--accent-orange-bright)', background: 'rgba(255, 107, 0, 0.04)' }}>
                  ₹{p.pricing.tier1_distributor.toFixed(2)}
                </td>
                <td className="font-mono" style={{ textAlign: 'right', fontWeight: 600 }}>
                  ₹{p.pricing.tier2_wholesale.toFixed(2)}
                </td>
                <td className="font-mono" style={{ textAlign: 'right', fontWeight: 600 }}>
                  ₹{p.pricing.tier3_semi_wholesale.toFixed(2)}
                </td>
                <td className="font-mono" style={{ textAlign: 'right', fontWeight: 600 }}>
                  ₹{p.pricing.tier4_retailer.toFixed(2)}
                </td>
                <td className="font-mono" style={{ textAlign: 'right', fontWeight: 800, color: '#10B981', background: 'rgba(16, 185, 129, 0.04)' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700 }}>PRODUCT SKU / CODE</label>
                  <input 
                    type="text" 
                    placeholder="e.g. DMK-CHR-SUPREME"
                    value={newSku} 
                    onChange={e => setNewSku(e.target.value)}
                    className="font-mono"
                    style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#FFF', fontSize: '12px', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700 }}>ITEM NAME</label>
                  <input 
                    type="text" 
                    placeholder="e.g. DMK Supreme Armless Plastic Dining Chair"
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#FFF', fontSize: '12px', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700 }}>CATEGORY</label>
                  <select 
                    value={newCategory} 
                    onChange={e => setNewCategory(e.target.value)}
                    style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#FFF', fontSize: '12px', marginTop: '4px' }}
                  >
                    {categories.filter(c => c !== 'ALL').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700 }}>HSN CODE</label>
                  <input 
                    type="text" 
                    value={newHsn} 
                    onChange={e => setNewHsn(e.target.value)}
                    className="font-mono"
                    style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#FFF', fontSize: '12px', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700 }}>GST RATE (%)</label>
                  <select 
                    value={newGst} 
                    onChange={e => setNewGst(parseInt(e.target.value))}
                    style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#FFF', fontSize: '12px', marginTop: '4px' }}
                  >
                    <option value={5}>5% GST</option>
                    <option value={12}>12% GST</option>
                    <option value={18}>18% GST</option>
                  </select>
                </div>
              </div>

              {/* 5-Tier Pricing Inputs */}
              <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--accent-orange-border)' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-orange-bright)', marginBottom: '8px' }}>
                  SET 5-TIER PRICING STRUCTURE (₹)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>T1: Distributor</label>
                    <input type="number" value={t1} onChange={e => setT1(parseFloat(e.target.value) || 0)} className="font-mono" style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#FFF', fontSize: '11px', textAlign: 'right' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>T2: Wholesale</label>
                    <input type="number" value={t2} onChange={e => setT2(parseFloat(e.target.value) || 0)} className="font-mono" style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#FFF', fontSize: '11px', textAlign: 'right' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>T3: Semi-Whl</label>
                    <input type="number" value={t3} onChange={e => setT3(parseFloat(e.target.value) || 0)} className="font-mono" style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#FFF', fontSize: '11px', textAlign: 'right' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>T4: Retailer</label>
                    <input type="number" value={t4} onChange={e => setT4(parseFloat(e.target.value) || 0)} className="font-mono" style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#FFF', fontSize: '11px', textAlign: 'right' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>T5: MRP (Max)</label>
                    <input type="number" value={t5} onChange={e => setT5(parseFloat(e.target.value) || 0)} className="font-mono" style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#10B981', fontWeight: 700, fontSize: '11px', textAlign: 'right' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button onClick={handleAddProduct} className="btn-primary" style={{ flex: 1, padding: '10px' }}>
                  <Plus size={15} /> Save Product to Master
                </button>
                <button onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ padding: '10px 16px' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
