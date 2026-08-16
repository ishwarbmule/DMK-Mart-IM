import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ArrowRight, 
  Receipt, 
  ShoppingCart, 
  Package, 
  Users, 
  BookOpen, 
  FileSpreadsheet, 
  FileText, 
  LayoutDashboard, 
  Printer, 
  Cpu, 
  Layers, 
  Truck, 
  Briefcase, 
  Bot, 
  FileSearch, 
  GitFork, 
  Settings, 
  Sparkles, 
  X 
} from 'lucide-react';
import { ModuleKey } from '../../types/erp';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (module: ModuleKey) => void;
  onExecutePrompt: (prompt: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectModule,
  onExecutePrompt
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : undefined;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { label: 'Executive Dashboard', icon: LayoutDashboard, module: 'dashboard' as ModuleKey, desc: 'Real-time telemetry, operational KPIs & business health' },
    { label: 'Billing & Invoicing', icon: Receipt, module: 'typeahead_billing' as ModuleKey, desc: '5-Tier typeahead pricing & instant invoice generation' },
    { label: 'Point of Sale (POS)', icon: ShoppingCart, module: 'pos' as ModuleKey, desc: 'Express retail counter & barcode billing' },
    { label: 'Tax Invoices', icon: Printer, module: 'invoice_viewer' as ModuleKey, desc: 'Print & download official A4 GST tax invoices' },
    { label: 'Products & Catalog', icon: Package, module: 'plastics_catalog' as ModuleKey, desc: '500+ plastics catalog & multi-tier pricing master' },
    { label: 'Customers & CRM', icon: Users, module: 'customers' as ModuleKey, desc: 'Customer 360°, ledger balance & credit limits' },
    { label: 'Accounting & Ledgers', icon: BookOpen, module: 'bookkeeping' as ModuleKey, desc: 'Tally-compatible double-entry financial ledgers' },
    { label: 'Reports & Analytics', icon: FileSpreadsheet, module: 'reports' as ModuleKey, desc: 'P&L, Balance Sheet, GST & Trial Balance audit reports' },
    { label: 'GST & Compliance', icon: FileText, module: 'gst_billing' as ModuleKey, desc: 'GSTR-1, GSTR-3B & E-Way Bill generation' },
    { label: 'Manufacturing (MES)', icon: Cpu, module: 'mes' as ModuleKey, desc: 'Moulding cycles, production orders & OEE telemetry' },
    { label: 'Warehouse (WMS)', icon: Layers, module: 'wms' as ModuleKey, desc: 'Spatial bin locator, quants & stock picking' },
    { label: 'Procurement & SCM', icon: Truck, module: 'scm' as ModuleKey, desc: 'Polymer procurement, dynamic ROP & safety stock' },
    { label: 'HRM & Payroll', icon: Briefcase, module: 'hcm' as ModuleKey, desc: 'Workforce management, attendance & salary slips' },
    { label: 'AI Swarm Intelligence', icon: Bot, module: 'swarm_visualizer' as ModuleKey, desc: 'Multi-agent orchestration & autonomous reasoning' },
    { label: 'Document AI & OCR', icon: FileSearch, module: 'doc_ai' as ModuleKey, desc: 'Smart document scanner & invoice token extraction' },
    { label: 'Workflows & Automation', icon: GitFork, module: 'bpmn' as ModuleKey, desc: 'BPMN 2.0 visual workflow designer & approvals' },
    { label: 'Settings & Multi-Company', icon: Settings, module: 'settings' as ModuleKey, desc: 'Configure 4 company verticals, GSTIN & defaults' },
  ];

  const filtered = quickActions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()) || a.desc.toLowerCase().includes(query.toLowerCase()));

  const handleAction = (module: ModuleKey) => {
    onSelectModule(module);
    onClose();
  };

  const handleCustomPrompt = () => {
    if (!query.trim()) return;
    onExecutePrompt(query);
    onClose();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 10, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--accent-orange-border)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 107, 0, 0.25)',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <Search size={20} color="var(--accent-orange)" />
          <input 
            type="text"
            placeholder="Type a command, query transactions, or ask AI Swarm..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCustomPrompt()}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#FFF',
              fontSize: '15px',
              fontFamily: 'var(--font-sans)'
            }}
          />
          {query && (
            <button 
              onClick={handleCustomPrompt}
              className="btn-primary" 
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <Sparkles size={13} />
              <span>Ask Swarm</span>
            </button>
          )}
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Action List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '10px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', padding: '8px 12px' }}>
            Enterprise Modules & Quick Actions
          </div>
          {filtered.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => handleAction(action.module)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: '#FFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div 
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: 'rgba(255, 107, 0, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-orange)'
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{action.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{action.desc}</div>
                  </div>
                </div>
                <ArrowRight size={14} color="var(--accent-orange-bright)" />
              </button>
            );
          })}
        </div>

        {/* Footer Hint */}
        <div 
          style={{
            padding: '10px 20px',
            background: 'var(--bg-primary)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: 'var(--text-tertiary)'
          }}
        >
          <span>Use <strong>↑↓</strong> to navigate, <strong>Enter</strong> to select</span>
          <span>Press <strong>ESC</strong> to close</span>
        </div>
      </div>
    </div>
  );
};
