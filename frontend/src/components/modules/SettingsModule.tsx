import React, { useState } from 'react';
import { 
  Settings, 
  Building, 
  Users, 
  ShieldCheck, 
  Key, 
  CreditCard, 
  Globe, 
  CheckCircle2, 
  Lock, 
  FileText, 
  Sparkles,
  Smartphone,
  Mail,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CompanyVertical } from '../../types/erp';
import { DMK_COMPANIES } from '../../data/multiCompanyData';

interface SettingsModuleProps {
  activeCompany: CompanyVertical;
  onSelectCompany: (company: CompanyVertical) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  activeCompany,
  onSelectCompany
}) => {
  const [activeTab, setActiveTab] = useState<'companies' | 'users' | 'taxation'>('companies');

  const usersList = [
    {
      role: 'Super Admin',
      name: 'Executive Super Administrator',
      email: 'super@dmkmart.com',
      scope: 'All 4 Company Verticals',
      badgeColor: 'status-pill-orange'
    },
    {
      role: 'DMK Plastics Admin',
      name: 'Polymers Plant Lead',
      email: 'admin1@dmkmart.com',
      scope: 'DMK Plastics (DMK1)',
      badgeColor: 'status-pill-cyan'
    },
    {
      role: 'DMK Kitchenware Admin',
      name: 'Kitchen Mart Ops Manager',
      email: 'admin2@dmkmart.com',
      scope: 'DMK Kitchenware (DMK2)',
      badgeColor: 'status-pill-success'
    },
    {
      role: 'DMK Household Admin',
      name: 'Household Plastics Lead',
      email: 'admin3@dmkmart.com',
      scope: 'DMK Household (DMK3)',
      badgeColor: 'status-pill-warning'
    },
    {
      role: 'DMK Industrial Admin',
      name: 'Crates Logistics Controller',
      email: 'admin4@dmkmart.com',
      scope: 'DMK Industrial (DMK4)',
      badgeColor: 'status-pill-cyan'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div 
        className="glass-panel"
        style={{
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderLeft: '5px solid var(--accent-orange)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#FFF' }}>
              Platform Settings & Multi-Company Administration
            </h1>
            <span className="status-pill status-pill-success">
              4 VERTICALS CONFIGURED
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Multi-tenant company profiles, user access credentials, banking details, and GST taxation settings
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
        <button
          onClick={() => setActiveTab('companies')}
          className={activeTab === 'companies' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '12px' }}
        >
          <Building size={14} />
          <span>4 Company Verticals</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '12px' }}
        >
          <Users size={14} />
          <span>User Roles & Logins</span>
        </button>
        <button
          onClick={() => setActiveTab('taxation')}
          className={activeTab === 'taxation' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '12px' }}
        >
          <Globe size={14} />
          <span>GST & System Defaults</span>
        </button>
      </div>

      {/* Tab 1: 4 Company Verticals */}
      {activeTab === 'companies' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
          {DMK_COMPANIES.map((comp) => {
            const isActive = comp.id === activeCompany.id;
            return (
              <div 
                key={comp.id}
                className="glass-panel"
                style={{
                  padding: '20px',
                  border: isActive ? `2px solid ${comp.themeAccent}` : '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  position: 'relative'
                }}
              >
                {isActive && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <span className="status-pill status-pill-success" style={{ fontSize: '9px' }}>
                      ACTIVE WORKSPACE
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: comp.themeAccent, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '18px' }}>
                    {comp.shortName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                      CODE: {comp.companyCode}
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#FFF' }}>
                      {comp.companyName}
                    </h3>
                  </div>
                </div>

                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} color="var(--accent-orange-bright)" />
                    <span>{comp.registeredAddress}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>GSTIN: <strong className="font-mono" style={{ color: '#FFF' }}>{comp.gstin}</strong></span>
                    <span>State Code: <strong style={{ color: '#FFF' }}>{comp.stateCode}</strong></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Invoice Prefix: <strong className="font-mono" style={{ color: comp.themeAccent }}>{comp.invoicePrefix}</strong></span>
                    <span>Bank: <strong style={{ color: '#FFF' }}>{comp.bankDetails.bankName}</strong></span>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  {!isActive ? (
                    <button 
                      onClick={() => {
                        onSelectCompany(comp);
                        confetti({ particleCount: 50, spread: 50 });
                      }}
                      className="btn-secondary"
                      style={{ width: '100%', padding: '8px', fontSize: '12px' }}
                    >
                      Switch to this Company Workspace
                    </button>
                  ) : (
                    <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#10B981', padding: '6px' }}>
                      ✓ Currently Active Company
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: User Roles & Access */}
      {activeTab === 'users' && (
        <div className="enterprise-table-container">
          <div style={{ padding: '14px 18px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '13px', color: '#FFF' }}>
              Multi-Company User Access & Authentication Matrix (PRD Section 5.3)
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Standard Password: <strong className="font-mono" style={{ color: 'var(--accent-orange-bright)' }}>admin123</strong>
            </span>
          </div>

          <table className="enterprise-table">
            <thead>
              <tr>
                <th>User Full Name</th>
                <th>Login Email Address</th>
                <th>Assigned Role</th>
                <th>Authorized Scope</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((usr, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ fontWeight: 800, color: '#FFF' }}>{usr.name}</div>
                  </td>
                  <td className="font-mono" style={{ color: 'var(--accent-orange-bright)' }}>
                    {usr.email}
                  </td>
                  <td>
                    <span className={`status-pill ${usr.badgeColor}`} style={{ fontSize: '9px' }}>
                      {usr.role}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-secondary)' }}>{usr.scope}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="status-pill status-pill-success" style={{ fontSize: '9px' }}>
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: GST & System Defaults */}
      {activeTab === 'taxation' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFF', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              Indian GST Taxation Configuration
            </h3>
            <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Taxation Regime:</span>
              <strong style={{ color: '#FFF' }}>Indian Goods & Services Tax (GST)</strong>
            </div>
            <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Intra-State Tax Breakdown:</span>
              <strong style={{ color: 'var(--accent-orange-bright)' }}>CGST 9% + SGST 9% (18% Total)</strong>
            </div>
            <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Inter-State Tax Breakdown:</span>
              <strong style={{ color: '#00E5FF' }}>IGST 18%</strong>
            </div>
            <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Default Plastics HSN Code:</span>
              <strong className="font-mono" style={{ color: '#FFF' }}>3926 (Articles of Plastics)</strong>
            </div>
            <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>E-Invoicing IRN Threshold:</span>
              <strong style={{ color: '#10B981' }}>₹50,000+ Auto-Generate QR</strong>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFF', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              Currency & Accounting Standards
            </h3>
            <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Primary Currency:</span>
              <strong style={{ color: '#FFF' }}>INR (₹ - Indian Rupee)</strong>
            </div>
            <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Number Formatting:</span>
              <strong style={{ color: '#FFF' }}>Indian Lakhs & Crores (en-IN)</strong>
            </div>
            <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Current Financial Year:</span>
              <strong style={{ color: 'var(--accent-orange-bright)' }}>FY 2026-2027</strong>
            </div>
            <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Bookkeeping Engine:</span>
              <strong style={{ color: '#10B981' }}>Double-Entry Journal Balancing (Tally-compliant)</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
