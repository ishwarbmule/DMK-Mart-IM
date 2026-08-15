import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Scan, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  QrCode, 
  Printer, 
  CheckCircle2, 
  Search, 
  Percent, 
  Sparkles,
  Receipt,
  RotateCcw,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExportDropdown } from '../common/ExportDropdown';
import { ExportOptions } from '../../utils/exportUtils';

interface POSItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  hsnCode: string;
  gstRate: number; // e.g. 5, 12, 18
  stock: number;
  image?: string;
}

interface CartItem extends POSItem {
  quantity: number;
  discountPct: number;
}

export const POSTerminalModule: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('+91 98765 43210');
  const [customerName, setCustomerName] = useState<string>('Rohan Sharma');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH' | 'CARD'>('UPI');
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  const catalog: POSItem[] = [
    { id: '1', sku: 'DMK-GROC-01', name: 'DMK Premium Basmati Rice (5kg)', category: 'Groceries', price: 499.00, hsnCode: '1006', gstRate: 5, stock: 120 },
    { id: '2', sku: 'DMK-GROC-02', name: 'Cold Pressed Mustard Oil (1L)', category: 'Groceries', price: 185.00, hsnCode: '1514', gstRate: 5, stock: 85 },
    { id: '3', sku: 'DMK-ELEC-01', name: 'DMK Fast Charging Type-C Cable (65W)', category: 'Electronics', price: 299.00, hsnCode: '8544', gstRate: 18, stock: 240 },
    { id: '4', sku: 'DMK-ELEC-02', name: 'Wireless Bluetooth Earbuds Pro', category: 'Electronics', price: 1499.00, hsnCode: '8518', gstRate: 18, stock: 45 },
    { id: '5', sku: 'DMK-APP-01', name: 'Cotton Round-Neck T-Shirt (M)', category: 'Apparel', price: 399.00, hsnCode: '6109', gstRate: 12, stock: 90 },
    { id: '6', sku: 'DMK-APP-02', name: 'Denim Comfort Jeans (32)', category: 'Apparel', price: 999.00, hsnCode: '6203', gstRate: 12, stock: 60 },
    { id: '7', sku: 'DMK-FMCG-01', name: 'Organic Almonds & Cashew Mix (500g)', category: 'Essentials', price: 549.00, hsnCode: '0802', gstRate: 12, stock: 110 },
    { id: '8', sku: 'DMK-FMCG-02', name: 'Natural Honey Pure Jar (500g)', category: 'Essentials', price: 240.00, hsnCode: '0409', gstRate: 5, stock: 75 },
  ];

  const [cart, setCart] = useState<CartItem[]>([
    { ...catalog[0], quantity: 2, discountPct: 0 },
    { ...catalog[2], quantity: 1, discountPct: 5 }
  ]);

  const posExportOptions: ExportOptions<POSItem> = {
    filename: `DMK_POS_Item_Master_${new Date().toISOString().split('T')[0]}`,
    title: 'DMK Mart Retail Express Counter — POS Price Master',
    companyName: 'DMK Mart Retail & Express POS',
    subtitle: `Active Category: ${activeCategory} (${catalog.length} items)`,
    columns: [
      { header: 'Barcode / SKU', key: 'sku', width: 16 },
      { header: 'Item Description', key: 'name', width: 34 },
      { header: 'Category', key: 'category', width: 16 },
      { header: 'HSN Code', key: 'hsnCode', width: 12 },
      { header: 'GST %', key: 'gstRate', format: v => `${v}%`, width: 10, align: 'right' },
      { header: 'Unit Price (₹)', key: 'price', format: v => `₹${v.toFixed(2)}`, width: 16, align: 'right' },
      { header: 'Counter Stock', key: 'stock', width: 14, align: 'right' }
    ],
    data: catalog
  };

  const categories = ['ALL', 'Groceries', 'Electronics', 'Apparel', 'Essentials'];

  const filteredItems = catalog.filter(item => {
    const matchesCat = activeCategory === 'ALL' || item.category === activeCategory;
    const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.hsnCode.includes(searchQuery);
    return matchesCat && matchesQuery;
  });

  const addToCart = (item: POSItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, discountPct: 0 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : i;
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => {
    const discountedPrice = item.price * (1 - item.discountPct / 100);
    return acc + (discountedPrice * item.quantity);
  }, 0);

  const totalGST = cart.reduce((acc, item) => {
    const itemSubtotal = item.price * (1 - item.discountPct / 100) * item.quantity;
    const gstAmt = itemSubtotal * (item.gstRate / 100);
    return acc + gstAmt;
  }, 0);

  const cgst = totalGST / 2;
  const sgst = totalGST / 2;
  const grandTotal = Math.round(subtotal + totalGST);
  const changeDue = cashReceived > grandTotal ? cashReceived - grandTotal : 0;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF6B00', '#10B981', '#FFFFFF', '#00E5FF']
    });

    const orderData = {
      invoiceNo: `DMK-POS-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleString(),
      customerName,
      customerPhone,
      items: [...cart],
      subtotal,
      cgst,
      sgst,
      grandTotal,
      paymentMethod,
      cashReceived: paymentMethod === 'CASH' ? cashReceived : grandTotal,
      changeDue
    };

    setCompletedOrder(orderData);
    setShowReceiptModal(true);
    setCart([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* POS Header */}
      <div 
        className="glass-panel"
        style={{
          padding: '14px 20px',
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
            <ShoppingCart size={20} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
              DMK Mart Retail POS & Express Counter
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              High-Speed Barcode Billing, Integrated GST Engine & Dynamic UPI Checkout
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ExportDropdown options={posExportOptions} buttonLabel="Export POS Items" size="sm" />
          <span className="status-pill status-pill-success">
            REGISTER #01 (ONLINE)
          </span>
          <span className="status-pill status-pill-orange">
            SHIFT: CASHIER_04
          </span>
        </div>
      </div>

      {/* POS Layout: Left (Catalog & Scanner) | Right (Cart & Bill Calculation) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        
        {/* Left Section: Search, Category Filter & Product Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Search & Barcode Scan Bar */}
          <div 
            className="glass-panel"
            style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <Search size={18} color="var(--accent-orange)" />
            <input 
              type="text"
              placeholder="Scan Barcode (GS1-128) or Search Item Name, SKU, HSN Code..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#FFF',
                fontSize: '14px'
              }}
            />
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
              <Scan size={14} color="var(--accent-orange)" />
              <span>Laser Scan</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={activeCategory === cat ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '20px' }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Items Grid */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '12px',
              maxHeight: '520px',
              overflowY: 'auto'
            }}
          >
            {filteredItems.map(item => (
              <div
                key={item.id}
                onClick={() => addToCart(item)}
                className="glass-panel"
                style={{
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent-orange)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-orange-bright)', fontWeight: 600 }}>
                      {item.sku}
                    </span>
                    <span className="status-pill status-pill-cyan" style={{ fontSize: '8px', padding: '1px 4px' }}>
                      GST {item.gstRate}%
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFF', marginTop: '4px', minHeight: '36px' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                    HSN: {item.hsnCode} • Stock: {item.stock}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span className="font-mono" style={{ fontSize: '16px', fontWeight: 800, color: '#10B981' }}>
                    ₹{item.price.toFixed(2)}
                  </span>
                  <span 
                    style={{
                      background: 'rgba(255, 107, 0, 0.15)',
                      color: 'var(--accent-orange-bright)',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    + ADD
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section: Live POS Cart & GST Bill Summary */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '620px' }}>
          <div>
            {/* Customer Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '11px' }}>CUSTOMER NAME</label>
                <input 
                  type="text" 
                  value={customerName} 
                  onChange={e => setCustomerName(e.target.value)}
                  className="form-input"
                  placeholder="Walk-in Customer"
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '11px' }}>PHONE / LOYALTY ID</label>
                <input 
                  type="text" 
                  value={customerPhone} 
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="form-input"
                  placeholder="+91 90000 00000"
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              BILL ITEMS ({cart.reduce((a, b) => a + b.quantity, 0)})
            </div>

            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
              {cart.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                  Cart is empty. Click items or scan barcode to add.
                </div>
              ) : (
                cart.map(item => (
                  <div 
                    key={item.id}
                    style={{
                      background: 'var(--bg-primary)',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0, marginRight: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                        ₹{item.price} × {item.quantity} (GST {item.gstRate}%)
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        style={{ width: '22px', height: '22px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '4px', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-mono" style={{ fontSize: '12px', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        style={{ width: '22px', height: '22px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '4px', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Plus size={12} />
                      </button>
                      <button 
                        onClick={() => removeItem(item.id)}
                        style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', marginLeft: '4px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bill Calculation & Checkout */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Taxable Subtotal:</span>
                <span className="font-mono">₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>CGST:</span>
                <span className="font-mono">₹{cgst.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>SGST:</span>
                <span className="font-mono">₹{sgst.toFixed(2)}</span>
              </div>
              <div style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFF' }}>GRAND TOTAL:</span>
                <span className="font-mono" style={{ fontSize: '22px', fontWeight: 900, color: 'var(--accent-orange-bright)' }}>
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              <button 
                onClick={() => setPaymentMethod('UPI')}
                className={paymentMethod === 'UPI' ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, padding: '6px', fontSize: '11px' }}
              >
                <QrCode size={13} /> UPI QR
              </button>
              <button 
                onClick={() => setPaymentMethod('CASH')}
                className={paymentMethod === 'CASH' ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, padding: '6px', fontSize: '11px' }}
              >
                Cash
              </button>
              <button 
                onClick={() => setPaymentMethod('CARD')}
                className={paymentMethod === 'CARD' ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, padding: '6px', fontSize: '11px' }}
              >
                <CreditCard size={13} /> Card / POS
              </button>
            </div>

            {/* Checkout Action Button */}
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', opacity: cart.length === 0 ? 0.4 : 1, cursor: cart.length === 0 ? 'not-allowed' : 'pointer' }}
            >
              <Receipt size={16} />
              <span>Complete Sale & Print Tax Invoice (₹{grandTotal})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tax Invoice Receipt Modal */}
      {showReceiptModal && completedOrder && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 10, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setShowReceiptModal(false)}
        >
          <div 
            className="glass-panel pos-receipt-print-only"
            style={{
              width: '100%',
              maxWidth: '420px',
              backgroundColor: '#FFFFFF',
              color: '#000000',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Printable Thermal Receipt Style */}
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #DDD', paddingBottom: '12px', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#FF6B00' }}>DMK MART RETAIL STORES</h2>
              <div style={{ fontSize: '11px', color: '#555' }}>GSTIN: 33AAAAA0000A1Z5 • FSSAI: 12421008000123</div>
              <div style={{ fontSize: '11px', color: '#555' }}>Store #04, Outer Ring Road, Bangalore - 560103</div>
              <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '6px' }}>TAX INVOICE / RETAIL RECEIPT</div>
            </div>

            <div style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Invoice: <strong>{completedOrder.invoiceNo}</strong></span>
              <span>{completedOrder.date}</span>
            </div>
            <div style={{ fontSize: '11px', marginBottom: '12px' }}>
              Customer: <strong>{completedOrder.customerName}</strong> ({completedOrder.customerPhone})
            </div>

            {/* Line Items */}
            <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', marginBottom: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #000' }}>
                  <th style={{ textAlign: 'left', padding: '4px 0' }}>Item</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {completedOrder.items.map((it: CartItem, idx: number) => (
                  <tr key={idx} style={{ borderBottom: '1px dashed #EEE' }}>
                    <td style={{ padding: '4px 0' }}>{it.name} (HSN:{it.hsnCode})</td>
                    <td style={{ textAlign: 'center' }}>{it.quantity}</td>
                    <td style={{ textAlign: 'right' }}>₹{it.price}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{(it.price * it.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Tax Totals */}
            <div style={{ borderTop: '1px solid #000', paddingTop: '6px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal (Excl. Tax):</span>
                <span>₹{completedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>CGST (Intra-State):</span>
                <span>₹{completedOrder.cgst.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>SGST (Intra-State):</span>
                <span>₹{completedOrder.sgst.toFixed(2)}</span>
              </div>
              <div style={{ borderTop: '2px solid #000', paddingTop: '6px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 900 }}>
                <span>NET TOTAL PAID:</span>
                <span style={{ color: '#FF6B00' }}>₹{completedOrder.grandTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#555', marginTop: '4px' }}>
                <span>Payment Mode: <strong>{completedOrder.paymentMethod}</strong></span>
                <span>Status: <strong>PAID</strong></span>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '10px', color: '#777', borderTop: '1px dashed #DDD', paddingTop: '8px' }}>
              Thank you for shopping at DMK Mart!
              <br />For returns, present this original invoice within 7 days.
            </div>

            <div className="no-print" style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button 
                onClick={() => window.print()}
                className="btn-primary" 
                style={{ flex: 1, padding: '8px', color: '#FFF' }}
              >
                <Printer size={14} /> Print Thermal Bill
              </button>
              <button 
                onClick={() => setShowReceiptModal(false)}
                className="btn-secondary" 
                style={{ padding: '8px 14px', background: '#EEE', color: '#000', border: '1px solid #CCC' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
