import React, { useState } from 'react';
import { 
  Building, 
  Users, 
  Globe, 
  CheckCircle2, 
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Landmark,
  ShieldCheck,
  CreditCard,
  Key
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CompanyVertical } from '../../types/erp';
import { DMK_MART_COMPANY } from '../../data/multiCompanyData';

interface SettingsModuleProps {
  activeCompany?: CompanyVertical;
  onSelectCompany?: (company: CompanyVertical) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = () => {
  const [activeTab, setActiveTab] = useState<'company_profile' | 'users' | 'taxation'>('company_profile');

  const comp = DMK_MART_COMPANY;

  const usersList = [
    {
      role: 'Super Admin',
      name: 'DMK Administrator',
      email: 'admin@dmkmart.com',
      scope: 'DMK Mart Enterprise Master',
      badgeColor: 'status-pill-orange'
    },
    {
      role: 'Plant Manager',
      name: 'Operations & Moulding Lead',
      email: 'plant@dmkmart.com',
      scope: 'Hosur SIPCOT Works',
      badgeColor: 'status-pill-cyan'
    },
    {
      role: 'Finance Controller',
      name: 'Chief Accounts Officer',
      email: 'finance@dmkmart.com',
      scope: 'Tally & GST Bookkeeping',
      badgeColor: 'status-pill-success'
    },
    {
      role: 'Sales Head',
      name: 'B2B & Distribution Lead',
      email: 'sales@dmkmart.com',
      scope: '5-Tier Pricing & Orders',
      badgeColor: 'status-pill-warning'
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
              Company & Platform Administration
            </h1>
            <span className="status-pill status-pill-success">
              DMK MART PRIMARY ENTITY
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            DMK Mart enterprise profile, statutory GSTIN credentials, banking remittance, and access controls
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
        <button
          onClick={() => setActiveTab('company_profile')}
          className={activeTab === 'company_profile' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '12px' }}
        >
          <Building size={14} />
          <span>DMK Mart Corporate Profile</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '12px' }}
        >
          <Users size={14} />
          <span>User Roles & Authorization</span>
        </button>
        <button
          onClick={() => setActiveTab('taxation')}
          className={activeTab === 'taxation' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '12px' }}
        >
          <Globe size={14} />
          <span>GST & Accounting Defaults</span>
        </button>
      </div>

      {/* Tab 1: DMK Mart Corporate Profile */}
      {activeTab === 'company_profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
          {/* Main Legal Entity Card */}
          <div 
            className="glass-panel"
            style={{
              padding: '24px',
              border: '2px solid var(--accent-orange)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div 
                  style={{ 
                    width: '46px', 
                    height: '46px', 
                    borderRadius: '10px', 
                    background: 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)', 
                    color: '#FFF', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 900, 
                    fontSize: '20px' 
                  }}
                >
                  DM
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
                    {comp.companyName}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--accent-orange)', fontWeight: 700 }}>
                    CODE: {comp.companyCode}
                  </div>
                </div>
              </div>

              <span className="status-pill status-pill-success">
                ACTIVE ENTITY
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>GSTIN IDENTIFICATION</div>
                <div className="font-mono" style={{ fontSize: '13px', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>
                  {comp.gstin}
                </div>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>STATE JURISDICTION</div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFF', marginTop: '2px' }}>
                  State Code {comp.stateCode} (Tamil Nadu)
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                <MapPin size={13} color="var(--accent-orange)" />
                <span>REGISTERED OPERATIONAL HEADQUARTERS</span>
              </div>
              <div style={{ fontSize: '12px', color: '#FFF', marginTop: '4px', lineHeight: '1.4' }}>
                {comp.registeredAddress}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={13} />
                <span>{comp.contactPhone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={13} />
                <span>{comp.contactEmail}</span>
              </div>
            </div>
          </div>

          {/* Banking & Remittance Details */}
          <div 
            className="glass-panel"
            style={{
              padding: '24px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Landmark size={20} color="#00E5FF" />
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFF' }}>
                Corporate Banking & NEFT Remittance
              </div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Bank Name:</span>
                <strong style={{ fontSize: '13px', color: '#FFF' }}>{comp.bankDetails.bankName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Account Number:</span>
                <strong className="font-mono" style={{ fontSize: '13px', color: 'var(--accent-orange-bright)' }}>{comp.bankDetails.accountNumber}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>IFSC Code:</span>
                <strong className="font-mono" style={{ fontSize: '13px', color: '#10B981' }}>{comp.bankDetails.ifscCode}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Branch Name:</span>
                <strong style={{ fontSize: '13px', color: '#FFF' }}>{comp.bankDetails.branchName}</strong>
              </div>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#10B981' }}>
                <CheckCircle2 size={15} />
                <span>Default Invoicing Sequence Prefix: {comp.invoicePrefix}</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Standard financial year numbering aligned with GST Rule 46.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: User Roles */}
      {activeTab === 'users' && (
        <div className="enterprise-table-container">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Role Designation</th>
                <th>Administrator Name</th>
                <th>Email ID</th>
                <th>Access Scope</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: '#FFF' }}>{u.role}</td>
                  <td>{u.name}</td>
                  <td className="font-mono" style={{ color: 'var(--accent-orange)' }}>{u.email}</td>
                  <td>{u.scope}</td>
                  <td>
                    <span className="status-pill status-pill-success" style={{ fontSize: '10px' }}>
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: GST & Taxation */}
      {activeTab === 'taxation' && (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFF' }}>
            GST & Statutory Compliance Configuration
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>HSN 9401 (CHAIRS & FURNITURE)</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFF', marginTop: '2px' }}>18% GST (9% CGST + 9% SGST)</div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>HSN 3924 (HOUSEHOLD PLASTICS)</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFF', marginTop: '2px' }}>18% GST (9% CGST + 9% SGST)</div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>HSN 3923 (INDUSTRIAL CRATES)</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFF', marginTop: '2px' }}>18% GST (9% CGST + 9% SGST)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
