import React from 'react';
import { 
  Receipt,
  Package,
  BookOpen,
  ShoppingCart,
  Printer,
  FileSpreadsheet,
  Settings,
  LayoutDashboard, 
  Truck, 
  Users, 
  Bot, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  RotateCcw,
  Building2,
  FileText,
  Boxes,
  X,
  IndianRupee,
  CreditCard
} from 'lucide-react';
import { ModuleKey } from '../../types/erp';
import { useERPData } from '../../context/ERPContext';

interface SidebarProps {
  activeModule: ModuleKey;
  onSelectModule: (module: ModuleKey) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isSidecarOpen: boolean;
  onToggleSidecar: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavSection {
  title: string;
  items: {
    key: ModuleKey;
    label: string;
    description?: string;
    icon: any;
    badge?: string;
    badgeColor?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isCollapsed,
  onToggleCollapse,
  isSidecarOpen,
  onToggleSidecar,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const { lowStockAlerts, purchaseOrders } = useERPData();
  const pendingPOCount = purchaseOrders.filter(p => p.status === 'PENDING').length;

  const navSections: NavSection[] = [
    {
      title: 'Dashboard',
      items: [
        { 
          key: 'dashboard', 
          label: 'Overview Dashboard', 
          description: 'Live business performance & KPIs',
          icon: LayoutDashboard, 
          badge: 'LIVE', 
          badgeColor: 'status-pill-success' 
        },
      ]
    },
    {
      title: 'Sales',
      items: [
        { 
          key: 'typeahead_billing', 
          label: 'Sales Billing', 
          description: 'B2B Wholesale & Retail Invoicing',
          icon: Receipt, 
          badge: 'BULK TIER', 
          badgeColor: 'status-pill-orange' 
        },
        { 
          key: 'pos', 
          label: 'POS Cash Counter', 
          description: 'Fast walk-in counter retail checkout',
          icon: ShoppingCart, 
          badge: 'EXPRESS', 
          badgeColor: 'status-pill-success' 
        },
        { 
          key: 'customers', 
          label: 'Customer Accounts', 
          description: 'Create & Manage B2B & B2C Accounts',
          icon: Users, 
          badge: 'ACCOUNTS', 
          badgeColor: 'status-pill-cyan' 
        },
      ]
    },
    {
      title: 'Purchase',
      items: [
        { 
          key: 'purchase_orders', 
          label: 'Purchase Orders', 
          description: 'Procurement Terminal & Inward Orders',
          icon: Truck, 
          badge: pendingPOCount > 0 ? `${pendingPOCount} PENDING` : 'ACTIVE', 
          badgeColor: pendingPOCount > 0 ? 'status-pill-orange' : 'status-pill-cyan' 
        },
        { 
          key: 'purchase_returns', 
          label: 'Purchased Returns', 
          description: 'Debit Notes on Damaged / Defective Goods',
          icon: RotateCcw, 
          badge: 'DEBIT NOTES', 
          badgeColor: 'status-pill-orange' 
        },
        { 
          key: 'vendor_payments', 
          label: 'Vendor Payments', 
          description: 'Disburse Supplier Payments & Settlement',
          icon: IndianRupee, 
          badge: 'DISBURSE', 
          badgeColor: 'status-pill-success' 
        },
        { 
          key: 'vendors_directory', 
          label: 'Supplier Accounts', 
          description: 'Create & Manage Manufacturers & Distributors',
          icon: Building2, 
          badge: 'ACCOUNTS', 
          badgeColor: 'status-pill-cyan' 
        },
      ]
    },
    {
      title: 'Inventory',
      items: [
        { 
          key: 'inventory_stock', 
          label: 'Stock & Low Stock', 
          description: 'Main Stock vs Damaged Stock Matrix',
          icon: Package, 
          badge: lowStockAlerts.length > 0 ? `⚠️ ${lowStockAlerts.length} LOW` : 'OPTIMAL', 
          badgeColor: lowStockAlerts.length > 0 ? 'status-pill-orange' : 'status-pill-success' 
        },
      ]
    },
    {
      title: 'Financial & Accounting',
      items: [
        { 
          key: 'bookkeeping', 
          label: 'Daybook & Accounts', 
          description: 'Tally Daybook, P&L, Trial Balance',
          icon: BookOpen, 
          badge: 'TALLY', 
          badgeColor: 'status-pill-success' 
        },
      ]
    },
    {
      title: 'Invoices & Reports',
      items: [
        { 
          key: 'invoice_viewer', 
          label: 'Tax Invoices & Prints', 
          description: 'A4 Printable GST Tax Invoices',
          icon: Printer, 
          badge: 'A4 PRINT', 
          badgeColor: 'status-pill-cyan' 
        },
        { 
          key: 'reports', 
          label: 'Reports & Analysis', 
          description: 'GST Summaries & Sales Audits',
          icon: FileSpreadsheet, 
          badge: 'AUDIT', 
          badgeColor: 'status-pill-orange' 
        },
      ]
    },
    {
      title: 'System & AI',
      items: [
        { 
          key: 'swarm_visualizer', 
          label: 'AI Copilot Assistant', 
          description: 'Multi-agent business reasoning',
          icon: Bot, 
          badge: 'AI MESH', 
          badgeColor: 'status-pill-cyan' 
        },
        { 
          key: 'settings', 
          label: 'Company Settings', 
          description: 'Multi-company profiles & bank info',
          icon: Settings, 
          badge: 'DMK MART', 
          badgeColor: 'status-pill-success' 
        },
      ]
    }
  ];

  const handleItemClick = (key: ModuleKey) => {
    onSelectModule(key);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 998,
            display: 'block'
          }}
        />
      )}

      <aside 
        className={`app-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}
        style={{
          width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s ease',
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 999,
          flexShrink: 0
        }}
      >
        {/* Brand Header */}
        <div 
          style={{
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            padding: isCollapsed ? '0' : '0 18px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-tertiary)'
          }}
        >
          {!isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div 
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF',
                  fontWeight: 900,
                  fontSize: '18px',
                  boxShadow: '0 4px 12px rgba(255, 107, 0, 0.4)'
                }}
              >
                D
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '15px', letterSpacing: '-0.3px', color: '#FFF', lineHeight: 1.1 }}>
                  DMK <span style={{ color: 'var(--accent-orange)' }}>MART</span>
                </div>
                <div style={{ fontSize: '9.5px', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                  Trading & Distribution ERP
                </div>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div 
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontWeight: 900,
                fontSize: '18px'
              }}
            >
              D
            </div>
          )}

          {/* Desktop Collapse Toggle / Mobile Close */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {isMobileOpen && onCloseMobile ? (
              <button 
                onClick={onCloseMobile}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px'
                }}
              >
                <X size={18} />
              </button>
            ) : (
              <button 
                onClick={onToggleCollapse}
                title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <div 
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {navSections.map((section, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {!isCollapsed && (
                <div 
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 800,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '3px 10px 4px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-orange)' }} />
                  {section.title}
                </div>
              )}

              {section.items.map(item => {
                const isActive = activeModule === item.key;
                const Icon = item.icon;

                return (
                  <button
                    key={item.key}
                    onClick={() => handleItemClick(item.key)}
                    title={isCollapsed ? item.label : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isCollapsed ? 'center' : 'space-between',
                      width: '100%',
                      padding: isCollapsed ? '9px 0' : '8px 10px',
                      borderRadius: '7px',
                      border: 'none',
                      background: isActive ? 'linear-gradient(135deg, rgba(255, 107, 0, 0.18) 0%, rgba(255, 133, 27, 0.12) 100%)' : 'transparent',
                      color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                      textAlign: 'left'
                    }}
                  >
                    {isActive && (
                      <div 
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '15%',
                          bottom: '15%',
                          width: '3px',
                          borderRadius: '0 3px 3px 0',
                          background: 'var(--accent-orange)'
                        }}
                      />
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                      <Icon 
                        size={17} 
                        color={isActive ? 'var(--accent-orange)' : 'var(--text-secondary)'} 
                        style={{ flexShrink: 0 }}
                      />
                      {!isCollapsed && (
                        <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <div style={{ lineHeight: 1.2 }}>{item.label}</div>
                        </div>
                      )}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span 
                        className={`status-pill ${item.badgeColor || 'status-pill-orange'}`}
                        style={{ fontSize: '9.5px', padding: '1px 5px', fontWeight: 800, flexShrink: 0 }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* AI Copilot Quick Launcher Button in Footer */}
        <div style={{ padding: '10px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
          <button
            onClick={onToggleSidecar}
            style={{
              width: '100%',
              padding: isCollapsed ? '9px 0' : '9px 12px',
              borderRadius: '7px',
              background: isSidecarOpen ? 'var(--accent-orange)' : 'rgba(255, 107, 0, 0.12)',
              border: `1px solid ${isSidecarOpen ? 'transparent' : 'rgba(255, 107, 0, 0.35)'}`,
              color: isSidecarOpen ? '#FFF' : 'var(--accent-orange)',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={15} />
              {!isCollapsed && <span>AI Copilot (Cmd+K)</span>}
            </div>
            {!isCollapsed && (
              <span style={{ fontSize: '9.5px', opacity: 0.8, fontFamily: 'var(--font-mono)' }}>LIVE</span>
            )}
          </button>
        </div>

      </aside>
    </>
  );
};
