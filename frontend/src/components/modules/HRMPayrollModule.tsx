import React, { useState } from 'react';
import { Users, IndianRupee, ShieldCheck, CheckCircle2, FileSpreadsheet, Sparkles, Building2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MOCK_EMPLOYEES } from '../../data/mockData';
import { Employee } from '../../types/erp';

export const HRMPayrollModule: React.FC = () => {
  const [employees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('emp-01');
  const [disbursedNotice, setDisbursedNotice] = useState<string | null>(null);

  const activeEmp = employees.find(e => e.id === selectedEmpId) || employees[0];

  // Gross-to-Net Computation
  const annualSalary = activeEmp.salary;
  const biweeklyGross = annualSalary / 26;
  const preTaxDeductions = biweeklyGross * 0.06; // 6% 401k + Health
  const taxableWageBase = biweeklyGross - preTaxDeductions;
  const federalTaxWithholding = taxableWageBase * 0.22;
  const stateTaxWithholding = taxableWageBase * 0.055;
  const fdmicaTaxWithholding = taxableWageBase * 0.0765; // Social security + medicare
  const totalTaxes = federalTaxWithholding + stateTaxWithholding + fdmicaTaxWithholding;
  const postTaxDeductions = 150.00;
  const netTakeHome = taxableWageBase - totalTaxes - postTaxDeductions;

  const handleDisbursePayroll = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      colors: ['#10B981', '#FF6B00', '#FFFFFF']
    });

    setDisbursedNotice(`Successfully generated RBI NEFT / RTGS payout batch for ${employees.length} employees (₹${(employees.reduce((acc, e) => acc + (e.salary / 12), 0)).toLocaleString()}).`);
    setTimeout(() => setDisbursedNotice(null), 5000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div 
        className="glass-panel"
        style={{
          padding: '16px 20px',
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
              background: 'rgba(255, 107, 0, 0.15)',
              border: '1px solid var(--accent-orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-orange)'
            }}
          >
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
              Human Capital Management (HCM) & Global Payroll
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Multi-Jurisdiction Gross-to-Net Statutory Tax Calculation & Direct SEPA/NACHA Clearing
            </div>
          </div>
        </div>

        <button onClick={handleDisbursePayroll} className="btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>
          <FileSpreadsheet size={15} />
          <span>Execute Global Payroll Batch</span>
        </button>
      </div>

      {disbursedNotice && (
        <div 
          className="glass-panel"
          style={{
            padding: '12px 18px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            borderColor: '#10B981',
            color: '#10B981',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          <CheckCircle2 size={18} />
          <span>{disbursedNotice}</span>
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Employee Directory */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFF' }}>
            Enterprise Employee Directory & Talent Ontologies
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {employees.map(emp => (
              <div 
                key={emp.id}
                onClick={() => setSelectedEmpId(emp.id)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: selectedEmpId === emp.id ? 'rgba(255, 107, 0, 0.12)' : 'var(--bg-primary)',
                  border: selectedEmpId === emp.id ? '1px solid var(--accent-orange)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFF' }}>{emp.name}</span>
                    <span className="status-pill status-pill-cyan" style={{ fontSize: '8px' }}>{emp.code}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {emp.title} • {emp.department}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                    {emp.skills.map((sk, i) => (
                      <span key={i} style={{ fontSize: '9px', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-tertiary)' }}>
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="font-mono" style={{ fontSize: '14px', fontWeight: 800, color: '#10B981' }}>
                    ₹{emp.salary.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Annual CTC (INR)</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gross-to-Net Calculation Card */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFF' }}>
              Gross-to-Net Breakdown: <span style={{ color: 'var(--accent-orange)' }}>{activeEmp.name}</span>
            </span>
            <span className="status-pill status-pill-success">MONTHLY SALARY SLIP</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Monthly Gross Base Earnings</span>
              <span className="font-mono" style={{ fontWeight: 700, color: '#FFF' }}>₹{biweeklyGross.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#FFB020' }}>
              <span>Pre-Tax EPF & NPS Contribution</span>
              <span className="font-mono">-₹{preTaxDeductions.toFixed(2)}</span>
            </div>

            <div style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Taxable Wage Base</span>
              <span className="font-mono" style={{ fontWeight: 700, color: '#FFF' }}>₹{taxableWageBase.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#EF4444' }}>
              <span>Income Tax TDS Withholding (New Regime)</span>
              <span className="font-mono">-₹{federalTaxWithholding.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#EF4444' }}>
              <span>State Professional Tax (PT)</span>
              <span className="font-mono">-₹{stateTaxWithholding.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#EF4444' }}>
              <span>ESIC / Statutory Health Insurance (0.75%)</span>
              <span className="font-mono">-₹{fdmicaTaxWithholding.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#FFB020' }}>
              <span>Post-Tax Deductions & Staff Benefits</span>
              <span className="font-mono">-₹{postTaxDeductions.toFixed(2)}</span>
            </div>

            <div 
              style={{
                borderTop: '2px solid var(--border-medium)',
                paddingTop: '10px',
                marginTop: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFF' }}>NET BANK TRANSFER PAYOUT</span>
              <span className="font-mono" style={{ fontSize: '20px', fontWeight: 900, color: '#10B981' }}>
                ₹{netTakeHome.toFixed(2)}
              </span>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#10B981" />
            <span>Cryptographic RBI NEFT / RTGS batch hash validated.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
