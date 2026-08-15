import React, { useState, useEffect } from 'react';
import { Search, Command, ArrowRight, DollarSign, Truck, Package, Cpu, Users, FileSearch, Sparkles, X } from 'lucide-react';
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
    { label: 'Post General Ledger Entry', icon: DollarSign, module: 'finance' as ModuleKey, desc: 'ACID double-entry balance posting' },
    { label: 'Calculate Dynamic ROP & Safety Stock', icon: Truck, module: 'scm' as ModuleKey, desc: 'Statistical supply chain optimization' },
    { label: 'Inspect 3D Warehouse Stock Quant', icon: Package, module: 'wms' as ModuleKey, desc: 'Spatial bin locator & wave picking' },
    { label: 'Explode Robotic Arm BOM Tree', icon: Cpu, module: 'mes' as ModuleKey, desc: 'Multi-level recursive manufacturing' },
    { label: 'Calculate Gross-to-Net Payroll', icon: Users, module: 'hcm' as ModuleKey, desc: 'Statutory multi-country tax engine' },
    { label: 'OCR Cognitive Invoice Extraction', icon: FileSearch, module: 'doc_ai' as ModuleKey, desc: 'LayoutLMv3 table & token parsing' },
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
                <ArrowRight size={14} color="var(--text-tertiary)" />
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
