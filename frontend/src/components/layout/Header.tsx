import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Building2, 
  ChevronDown, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { CompanyVertical, TenantInfo } from '../../types/erp';
import { DMK_COMPANIES } from '../../data/multiCompanyData';

interface HeaderProps {
  tenant: TenantInfo;
  activeCompany: CompanyVertical;
  onSelectCompany: (comp: CompanyVertical) => void;
  onOpenCommandPalette: () => void;
  onToggleSidecar: () => void;
  isSidecarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  tenant,
  activeCompany,
  onSelectCompany,
  onOpenCommandPalette,
  onToggleSidecar,
  isSidecarOpen
}) => {
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 'n1', title: 'Sales Voucher Posted', time: '1m ago', desc: 'DPM/26-27/4019 (₹75,000) posted to Sri Venkateswara Agencies ledger.' },
    { id: 'n2', title: '5-Tier Price Update', time: '12m ago', desc: 'Royal Arm Chair T1 Distributor rate calibrated to ₹380.00.' },
    { id: 'n3', title: 'E-Invoice IRN Generated', time: '28m ago', desc: 'NIC Portal ACK #1226849102 generated with signed QR.' }
  ];

  return (
    <header 
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        backdropFilter: 'blur(16px)'
      }}
    >
      {/* Left: Company Workspace Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'var(--bg-tertiary)',
              padding: '8px 16px',
              borderRadius: '10px',
              border: `1px solid ${activeCompany.themeAccent}`,
              color: '#FFF',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              whiteSpace: 'nowrap'
            }}
          >
            <Building2 size={16} color={activeCompany.themeAccent} />
            <span>{activeCompany.shortName}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '8px' }}>
              GSTIN {activeCompany.stateCode}
            </span>
            <ChevronDown size={14} color="var(--text-secondary)" />
          </button>

          {/* Company Switcher Dropdown */}
          {showCompanyDropdown && (
            <div 
              className="glass-panel"
              style={{
                position: 'absolute',
                top: '50px',
                left: 0,
                width: '380px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--accent-orange-border)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9)',
                padding: '10px',
                zIndex: 100
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 800, padding: '6px 12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                SWITCH COMPANY WORKSPACE (4 VERTICALS)
              </div>

              {DMK_COMPANIES.map(comp => (
                <div 
                  key={comp.id}
                  onClick={() => {
                    onSelectCompany(comp);
                    setShowCompanyDropdown(false);
                  }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: activeCompany.id === comp.id ? 'rgba(255, 107, 0, 0.12)' : 'transparent',
                    border: activeCompany.id === comp.id ? '1px solid var(--accent-orange)' : '1px solid transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    marginBottom: '4px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    if (activeCompany.id !== comp.id) e.currentTarget.style.background = 'var(--bg-tertiary)';
                  }}
                  onMouseLeave={e => {
                    if (activeCompany.id !== comp.id) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFF' }}>{comp.companyName}</span>
                    <span className="font-mono" style={{ fontSize: '10px', color: comp.themeAccent, fontWeight: 700 }}>{comp.companyCode}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    GSTIN: <span className="font-mono" style={{ color: '#FFF' }}>{comp.gstin}</span> • Prefix: <span className="font-mono">{comp.invoicePrefix}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="status-pill status-pill-success" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
          <span>GSTIN STATE {activeCompany.stateCode} ACTIVE</span>
        </div>
      </div>

      {/* Center: Command Palette Search Trigger */}
      <div style={{ flex: 1, maxWidth: '420px', margin: '0 24px' }}>
        <button
          onClick={onOpenCommandPalette}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '9px 16px',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-orange)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Search size={15} color="var(--accent-orange)" />
            <span style={{ color: 'var(--text-secondary)' }}>Search 500+ items, ledgers, vouchers...</span>
          </div>
          <kbd 
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '11px',
              color: '#FFF',
              fontFamily: 'var(--font-mono)'
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: AI Swarm Status, Notification Bell & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onToggleSidecar}
          className="btn-outline-orange"
          style={{ padding: '8px 14px', fontSize: '12px' }}
        >
          <Sparkles size={14} />
          <span>Tally AI Copilot</span>
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <Bell size={16} />
            <span 
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-orange)',
                boxShadow: '0 0 8px var(--accent-orange)'
              }}
            />
          </button>

          {showNotifications && (
            <div 
              className="glass-panel"
              style={{
                position: 'absolute',
                top: '48px',
                right: '0',
                width: '320px',
                padding: '16px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 100
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>Autonomous Ledger Audit</span>
                <span className="status-pill status-pill-orange" style={{ fontSize: '9px' }}>3 NEW</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    style={{ 
                      padding: '8px 10px', 
                      background: 'rgba(255, 255, 255, 0.03)', 
                      borderRadius: '6px', 
                      borderLeft: '3px solid var(--accent-orange)' 
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
                      <span>{n.title}</span>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '10px' }}>{n.time}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {n.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            paddingLeft: '14px',
            borderLeft: '1px solid var(--border-subtle)'
          }}
        >
          <div 
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '13px',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            DM
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFF' }}>DMK Administrator</span>
            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Finance & Plastics</span>
          </div>
        </div>
      </div>
    </header>
  );
};
