import { 
  Receipt,
  Package,
  BookOpen,
  ShoppingCart,
  FileText,
  Printer,
  FileSpreadsheet,
  Settings,
  LayoutDashboard, 
  Truck, 
  Cpu, 
  Users, 
  Briefcase,
  FileSearch, 
  GitFork, 
  Bot, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { ModuleKey } from '../../types/erp';

interface SidebarProps {
  activeModule: ModuleKey;
  onSelectModule: (module: ModuleKey) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isSidecarOpen: boolean;
  onToggleSidecar: () => void;
}

interface NavSection {
  title: string;
  items: {
    key: ModuleKey;
    label: string;
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
  onToggleSidecar
}) => {
  const navSections: NavSection[] = [
    {
      title: 'Sales & Commerce',
      items: [
        { key: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, badge: 'LIVE', badgeColor: 'status-pill-success' },
        { key: 'typeahead_billing', label: 'Sales Billing', icon: Receipt, badge: '5-TIER', badgeColor: 'status-pill-orange' },
        { key: 'pos', label: 'Point of Sale (POS)', icon: ShoppingCart, badge: 'EXPRESS', badgeColor: 'status-pill-cyan' },
        { key: 'invoice_viewer', label: 'Tax Invoices', icon: Printer, badge: 'A4 PRINT', badgeColor: 'status-pill-cyan' },
        { key: 'plastics_catalog', label: 'Products & Catalog', icon: Package, badge: '500+ SKUs', badgeColor: 'status-pill-orange' },
        { key: 'customers', label: 'Customers & CRM', icon: Users, badge: '360°', badgeColor: 'status-pill-cyan' },
      ]
    },
    {
      title: 'Finance & Accounting',
      items: [
        { key: 'bookkeeping', label: 'Accounting & Ledgers', icon: BookOpen, badge: 'TALLY', badgeColor: 'status-pill-success' },
        { key: 'reports', label: 'Reports & Analytics', icon: FileSpreadsheet, badge: 'AUDIT', badgeColor: 'status-pill-cyan' },
        { key: 'gst_billing', label: 'GST & Compliance', icon: FileText, badge: 'E-WAY', badgeColor: 'status-pill-orange' },
      ]
    },
    {
      title: 'Operations & Supply Chain',
      items: [
        { key: 'mes', label: 'Manufacturing (MES)', icon: Cpu, badge: 'OEE', badgeColor: 'status-pill-orange' },
        { key: 'wms', label: 'Warehouse (WMS)', icon: Layers, badge: 'BINS', badgeColor: 'status-pill-cyan' },
        { key: 'scm', label: 'Procurement & SCM', icon: Truck, badge: 'ROP', badgeColor: 'status-pill-success' },
        { key: 'hcm', label: 'HRM & Payroll', icon: Briefcase, badge: 'PAYROLL', badgeColor: 'status-pill-cyan' },
      ]
    },
    {
      title: 'AI & System Settings',
      items: [
        { key: 'swarm_visualizer', label: 'AI Swarm Intelligence', icon: Bot, badge: 'LIVE', badgeColor: 'status-pill-cyan' },
        { key: 'doc_ai', label: 'Document AI & OCR', icon: FileSearch, badge: 'OCR', badgeColor: 'status-pill-orange' },
        { key: 'bpmn', label: 'Workflows & Automation', icon: GitFork, badge: 'BPMN 2.0', badgeColor: 'status-pill-cyan' },
        { key: 'settings', label: 'Company & System Settings', icon: Settings, badge: 'DMK MART', badgeColor: 'status-pill-success' },
      ]
    }
  ];

  return (
    <aside 
      style={{
        width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
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
          padding: isCollapsed ? '0' : '0 20px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {!isCollapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(255, 107, 0, 0.45)',
                fontWeight: 900,
                color: '#FFF',
                fontSize: '18px'
              }}
            >
              D
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '16px', letterSpacing: '-0.02em', color: '#FFF' }}>
                DMK <span style={{ color: 'var(--accent-orange)' }}>MART</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Plastics & Financial ERP
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={onToggleCollapse}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              color: '#FFF',
              fontSize: '18px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(255, 107, 0, 0.45)'
            }}
            title="Expand Sidebar"
          >
            D
          </button>
        )}

        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              transition: 'all 0.15s ease'
            }}
            title="Collapse Sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Grouped Navigation Links */}
      <nav 
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: isCollapsed ? '12px 8px' : '14px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {navSections.map((section, sIdx) => (
          <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {!isCollapsed && (
              <div 
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '4px 12px 6px 12px'
                }}
              >
                {section.title}
              </div>
            )}

            {section.items.map(item => {
              const Icon = item.icon;
              const isActive = activeModule === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelectModule(item.key)}
                  title={isCollapsed ? item.label : undefined}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: isCollapsed ? '10px 0' : '9px 14px',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    borderRadius: '8px',
                    background: isActive 
                      ? 'linear-gradient(90deg, rgba(255, 107, 0, 0.18) 0%, rgba(255, 107, 0, 0.05) 100%)' 
                      : 'transparent',
                    color: isActive ? '#FFFFFF' : '#CBD5E1',
                    border: isActive ? '1px solid rgba(255, 107, 0, 0.4)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                      e.currentTarget.style.color = '#FFFFFF';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#CBD5E1';
                    }
                  }}
                >
                  <Icon 
                    size={18} 
                    color={isActive ? 'var(--accent-orange)' : '#E2E8F0'} 
                    style={{ flexShrink: 0 }}
                  />
                  {!isCollapsed && (
                    <>
                      <span style={{ fontSize: '13px', fontWeight: isActive ? 700 : 500, flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span 
                          className={item.badgeColor || 'status-pill-cyan'}
                          style={{ fontSize: '9px', padding: '2px 6px', flexShrink: 0 }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* AI Swarm Copilot Button */}
      <div style={{ padding: isCollapsed ? '8px' : '14px', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={onToggleSidecar}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            padding: '10px 14px',
            borderRadius: '8px',
            background: isSidecarOpen 
              ? 'linear-gradient(135deg, rgba(255, 107, 0, 0.25) 0%, rgba(255, 133, 27, 0.1) 100%)' 
              : 'var(--bg-tertiary)',
            border: isSidecarOpen ? '1px solid var(--accent-orange)' : '1px solid var(--border-subtle)',
            color: '#FFF',
            cursor: 'pointer',
            boxShadow: isSidecarOpen ? '0 0 16px rgba(255, 107, 0, 0.3)' : 'none',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
          title="Toggle Tally AI Copilot"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--accent-orange)" />
            {!isCollapsed && (
              <span style={{ fontSize: '12px', fontWeight: 700 }}>Tally AI Copilot</span>
            )}
          </div>
          {!isCollapsed && (
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
          )}
        </button>
      </div>
    </aside>
  );
};
