import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Building2, 
  Sparkles,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Landmark,
  ShieldCheck,
  X,
  ChevronDown,
  Calendar,
  Menu
} from 'lucide-react';
import { CompanyVertical, TenantInfo } from '../../types/erp';
import { DMK_MART_COMPANY } from '../../data/multiCompanyData';
import { formatFullDate } from '../../utils/dateUtils';

interface HeaderProps {
  tenant: TenantInfo;
  activeCompany: CompanyVertical;
  onSelectCompany: (comp: CompanyVertical) => void;
  onOpenCommandPalette: () => void;
  onToggleSidecar: () => void;
  isSidecarOpen: boolean;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  tenant,
  activeCompany = DMK_MART_COMPANY,
  onOpenCommandPalette,
  onToggleSidecar,
  isSidecarOpen,
  onToggleMobileSidebar
}) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 'n1', title: 'Sales Voucher Posted', time: '1m ago', desc: 'DMK/26-27/4019 (₹1,71,100) posted to Sri Venkateswara Agencies ledger.' },
    { id: 'n2', title: '5-Tier Price Calibration', time: '12m ago', desc: 'Royal Arm Chair T1 Distributor rate synced at ₹380.00.' },
    { id: 'n3', title: 'E-Invoice IRN Generated', time: '28m ago', desc: 'NIC GST Portal ACK #1226849102 generated with signed QR.' }
  ];

  const company = DMK_MART_COMPANY;

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
      {/* Left: Mobile Menu Trigger & Status Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {onToggleMobileSidebar && (
          <button
            className="mobile-hamburger-btn"
            onClick={onToggleMobileSidebar}
            title="Toggle Navigation Menu"
            style={{
              display: 'none', // Overridden by CSS on <= 900px
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            <Menu size={18} />
          </button>
        )}

        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '6px 12px',
            borderRadius: '8px'
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#10B981', letterSpacing: '0.04em' }}>
            SYSTEM ONLINE
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            padding: '6px 12px',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '11.5px',
            fontWeight: 600
          }}
          title="Dynamic Live System Date"
        >
          <Calendar size={13} color="var(--accent-orange)" />
          <span>{formatFullDate(new Date())}</span>
        </div>
      </div>

      {/* Center: Command Palette Search Trigger */}
      <div style={{ flex: 1, maxWidth: '440px', margin: '0 24px' }}>
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
            <span style={{ color: 'var(--text-secondary)' }}>Search 500+ items, tax invoices, ledgers...</span>
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

      {/* Right: AI Copilot, Notifications & Right Upper Corner Company Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onToggleSidecar}
          className="btn-outline-orange"
          style={{ padding: '8px 14px', fontSize: '12px' }}
        >
          <Sparkles size={14} />
          <span>Tally AI Copilot</span>
        </button>

        {/* Notifications Bell */}
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
              color: '#FFFFFF',
              cursor: 'pointer',
              position: 'relative'
            }}
            title="Notifications"
          >
            <Bell size={16} color="#FFFFFF" />
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
                width: '340px',
                padding: '16px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 100
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>Autonomous Audit Feed</span>
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

        {/* Right Upper Corner: Unified DMK Mart Company Details & Profile Card */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileModal(!showProfileModal)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--bg-tertiary)',
              border: '1px solid rgba(255, 107, 0, 0.4)',
              padding: '6px 14px',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-orange)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.4)'}
          >
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '14px',
                boxShadow: '0 0 12px rgba(255, 107, 0, 0.5)'
              }}
            >
              DM
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFF' }}>
                  {company.companyName}
                </span>
                <ChevronDown size={14} color="#CBD5E1" />
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                GSTIN: <span className="font-mono" style={{ color: 'var(--accent-orange-bright)', fontWeight: 700 }}>{company.gstin}</span> • State {company.stateCode}
              </div>
            </div>
          </button>

          {/* Expanded Company Profile & Statutory Details Popover */}
          {showProfileModal && (
            <div 
              className="glass-panel"
              style={{
                position: 'absolute',
                top: '52px',
                right: 0,
                width: '380px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--accent-orange-border)',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.95), 0 0 30px rgba(255, 107, 0, 0.25)',
                padding: '18px',
                zIndex: 100
              }}
            >
              {/* Popover Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div 
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)',
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '14px'
                    }}
                  >
                    DM
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFF' }}>{company.companyName}</div>
                    <div style={{ fontSize: '10px', color: 'var(--accent-orange)', fontWeight: 700 }}>PRIMARY CORPORATE ENTITY</div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowProfileModal(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Company Details List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>GSTIN & Tax Registration</div>
                  <div className="font-mono" style={{ fontSize: '13px', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>
                    {company.gstin}
                  </div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    State Code: <strong>{company.stateCode} (Tamil Nadu)</strong> • Invoice Prefix: <strong className="font-mono">{company.invoicePrefix}</strong>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-primary)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    <MapPin size={12} color="var(--accent-orange)" />
                    <span>Registered Address</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#FFF', marginTop: '3px', lineHeight: '1.4' }}>
                    {company.registeredAddress}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-primary)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    <Landmark size={12} color="#00E5FF" />
                    <span>Bank & RTGS Remittance</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#FFF', marginTop: '3px' }}>
                    <strong>{company.bankDetails.bankName}</strong> ({company.bankDetails.branchName})
                  </div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    A/C: <strong className="font-mono" style={{ color: '#FFF' }}>{company.bankDetails.accountNumber}</strong> | IFSC: <strong className="font-mono" style={{ color: '#FFF' }}>{company.bankDetails.ifscCode}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={12} />
                    <span>{company.contactPhone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Mail size={12} />
                    <span>{company.contactEmail}</span>
                  </div>
                </div>
              </div>

              {/* User Session Footer */}
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#FFF' }}>DMK Administrator</div>
                  <div style={{ fontSize: '9.5px', color: 'var(--text-tertiary)' }}>Super Admin • Full Authorization</div>
                </div>

                <span className="status-pill status-pill-success" style={{ fontSize: '9px' }}>
                  ACTIVE SESSION
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
