import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Zap, 
  Activity, 
  IndianRupee, 
  Truck, 
  CheckCircle2,
  Sparkles,
  Bot,
  Package,
  ShieldAlert,
  AlertTriangle,
  Receipt,
  RotateCcw,
  Building2,
  Users,
  ChevronRight
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useERPData } from '../../context/ERPContext';
import { ModuleKey } from '../../types/erp';
import { formatDate } from '../../utils/dateUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ExecutiveDashboardProps {
  onSelectModule: (mod: ModuleKey) => void;
  onOpenSidecar: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  onSelectModule,
  onOpenSidecar
}) => {
  const { 
    products, 
    lowStockAlerts, 
    vendors, 
    customers, 
    purchaseOrders, 
    purchaseReturns, 
    salesReturns, 
    allInvoices 
  } = useERPData();

  // Metrics Calculations
  const metrics = useMemo(() => {
    let mainStockVal = 0;
    let damagedStockVal = 0;
    let mainUnits = 0;
    let damagedUnits = 0;

    products.forEach(p => {
      mainStockVal += p.stockQuantity * p.purchaseBaseCost;
      damagedStockVal += p.damagedStock * p.purchaseBaseCost;
      mainUnits += p.stockQuantity;
      damagedUnits += p.damagedStock;
    });

    const totalReceivables = customers.reduce((s, c) => s + c.closingBalance, 0);
    const totalPayables = vendors.reduce((s, v) => s + v.closingBalance, 0);

    const b2bSalesTotal = allInvoices
      .filter(i => !i.isCounterSale)
      .reduce((s, i) => s + i.grandTotal, 0);

    const b2cCounterTotal = allInvoices
      .filter(i => i.isCounterSale)
      .reduce((s, i) => s + i.grandTotal, 0);

    const totalSalesRevenue = b2bSalesTotal + b2cCounterTotal;

    return {
      mainStockVal,
      damagedStockVal,
      mainUnits,
      damagedUnits,
      totalReceivables,
      totalPayables,
      b2bSalesTotal,
      b2cCounterTotal,
      totalSalesRevenue
    };
  }, [products, customers, vendors, allInvoices]);

  // Chart 1: Revenue vs Procurement
  const revenueChartData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Today'],
    datasets: [
      {
        label: 'Sales Revenue (₹)',
        data: [142000, 185000, 160000, 210000, 195000, 240000, 316100],
        borderColor: '#FF6B00',
        backgroundColor: 'rgba(255, 107, 0, 0.15)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#FF851B',
        pointRadius: 4
      },
      {
        label: 'Procurement Outward (₹)',
        data: [80000, 120000, 95000, 140000, 110000, 130000, 82600],
        borderColor: '#0284C7',
        backgroundColor: 'rgba(2, 132, 199, 0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3
      }
    ]
  };

  // Chart 2: Inventory Breakdown
  const inventoryDoughnutData = {
    labels: ['Sellable Main Stock', 'Damaged / Broken Stock'],
    datasets: [
      {
        data: [metrics.mainStockVal, metrics.damagedStockVal || 5000],
        backgroundColor: ['#10B981', '#EF4444'],
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#94A3B8', font: { family: 'Inter', size: 12 } }
      },
      tooltip: {
        backgroundColor: '#111622',
        titleColor: '#FFFFFF',
        bodyColor: '#FF851B',
        borderColor: 'rgba(255, 107, 0, 0.3)',
        borderWidth: 1,
        padding: 12
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748B' } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748B' } }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Welcome Card */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(17, 22, 34, 0.95) 0%, rgba(23, 30, 46, 0.95) 100%)',
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
            <span 
              style={{
                background: 'rgba(255, 107, 0, 0.15)',
                color: 'var(--accent-orange)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                border: '1px solid var(--border-active)'
              }}
            >
              DMK MART ENTERPRISE TRADING OS
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              Live Telemetry • Multi-Vertical Sourcing & Distribution
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)' }}>
            Trading & Distribution Command Center
          </h1>
        </div>

        {/* Quick Launch Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onSelectModule('typeahead_billing')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(255, 107, 0, 0.35)'
            }}
          >
            <Receipt size={16} />
            + New Sales Bill
          </button>

          <button
            onClick={onOpenSidecar}
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
            <Bot size={16} color="var(--accent-orange)" />
            AI Copilot (Cmd+K)
          </button>
        </div>
      </div>

      {/* Low Stock Urgent Banner (if alerts exist) */}
      {lowStockAlerts.length > 0 && (
        <div 
          onClick={() => onSelectModule('inventory_stock')}
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.15) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '10px',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={22} color="#F59E0B" />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#F59E0B' }}>
                ⚠️ Low Stock Alert: {lowStockAlerts.length} SKU(s) reached or fell below reorder threshold!
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {lowStockAlerts[0]?.name} (Stock: {lowStockAlerts[0]?.currentStock} units) needs restocking. Click to open reorder matrix.
              </div>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectModule('purchase_management');
            }}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              background: '#F59E0B',
              border: 'none',
              color: '#000',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Issue Restock PO →
          </button>
        </div>
      )}

      {/* 4 Core Financial & Inventory KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* Main Sellable Stock Valuation */}
        <div 
          onClick={() => onSelectModule('inventory_stock')}
          style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Main Sellable Inventory
            </span>
            <Package size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
            ₹{metrics.mainStockVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {metrics.mainUnits.toLocaleString('en-IN')} units active across all categories
          </div>
        </div>

        {/* Damaged Stock Valuation */}
        <div 
          onClick={() => onSelectModule('inventory_stock')}
          style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Damaged / Broken Stock
            </span>
            <ShieldAlert size={18} color="#EF4444" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#EF4444', fontFamily: 'var(--font-mono)' }}>
            ₹{metrics.damagedStockVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {metrics.damagedUnits} defective units awaiting return to suppliers
          </div>
        </div>

        {/* Total Accounts Receivable */}
        <div 
          onClick={() => onSelectModule('customers')}
          style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Accounts Receivable (AR)
            </span>
            <Users size={18} color="#38BDF8" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
            ₹{metrics.totalReceivables.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Outstanding customer debits across {customers.length} B2B clients
          </div>
        </div>

        {/* Total Accounts Payable */}
        <div 
          onClick={() => onSelectModule('purchase_management')}
          style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Accounts Payable (AP)
            </span>
            <Building2 size={18} color="var(--accent-orange)" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)' }}>
            ₹{metrics.totalPayables.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Liabilities across {vendors.length} active Manufacturers & Distributors
          </div>
        </div>

      </div>

      {/* Analytics Charts & Live Feeds */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* Main Revenue vs Procurement Chart */}
        <div style={{ background: 'var(--bg-secondary)', padding: '22px', borderRadius: '12px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Cash Flow & Commercial Operations Trend
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                Comparing daily billed sales against supplier procurement disbursements
              </span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#10B981' }}>
              Net Inflow: +₹{(metrics.totalSalesRevenue - metrics.totalPayables).toLocaleString('en-IN')}
            </span>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>

        {/* Stock Composition & Sourcing Doughnut */}
        <div style={{ background: 'var(--bg-secondary)', padding: '22px', borderRadius: '12px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Dual Stock Valuation Ratio
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              Segregation of sellable inventory vs. quarantined damaged goods
            </span>
          </div>

          <div style={{ height: '170px', width: '100%', margin: '14px 0', position: 'relative' }}>
            <Doughnut data={inventoryDoughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94A3B8', font: { size: 11 } } } } }} />
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Sellable Ratio:</span>
            <span style={{ fontWeight: 800, color: '#10B981' }}>
              {((metrics.mainStockVal / (metrics.mainStockVal + metrics.damagedStockVal || 1)) * 100).toFixed(1)}%
            </span>
          </div>
        </div>

      </div>

      {/* Live Recent Transactions Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Recent Inward Confirmed POs */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={16} color="var(--accent-orange)" /> Recent Purchase Inward Arrivals
            </h3>
            <button
              onClick={() => onSelectModule('purchase_management')}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-orange)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              View All POs →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {purchaseOrders.slice(0, 3).map(po => (
              <div 
                key={po.id}
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '12px',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>
                    {po.poNumber} • {po.vendorName}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    {formatDate(po.orderDate)} • {po.lineItems.reduce((s, i) => s + i.quantity, 0)} Units Sourced
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: po.status === 'CONFIRMED_RECEIVED' ? '#10B981' : '#F59E0B', fontFamily: 'var(--font-mono)' }}>
                    ₹{po.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: po.status === 'CONFIRMED_RECEIVED' ? '#10B981' : '#F59E0B' }}>
                    {po.status === 'CONFIRMED_RECEIVED' ? '✅ Inward Confirmed' : '⏳ Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales Invoices */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Receipt size={16} color="#10B981" /> Recent Billed Sales Orders
            </h3>
            <button
              onClick={() => onSelectModule('typeahead_billing')}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-orange)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              + Create Bill →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {allInvoices.slice(0, 3).map(inv => (
              <div 
                key={inv.invoiceNumber}
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '12px',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>
                    {inv.invoiceNumber} • {inv.customer.partyName}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    {formatDate(inv.invoiceDate)} • {inv.lineItems.length} Lines • {inv.paymentMode}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                    ₹{inv.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                    {inv.isCounterSale ? 'Counter Retail' : 'B2B Wholesale'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
