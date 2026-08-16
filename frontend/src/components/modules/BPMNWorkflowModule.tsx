import React, { useState } from 'react';
import { GitFork, ArrowRight, CheckCircle2, AlertTriangle, Play, Sparkles, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';

export const BPMNWorkflowModule: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [isRunning, setIsRunning] = useState(false);

  const workflowSteps = [
    { stepId: 1, name: 'Document Ingestion (EDI / OCR)', agent: 'Document AI', latency: '350ms', bottleneckScore: 'LOW', status: 'COMPLETED' },
    { stepId: 2, name: 'Deterministic 3-Way Reconciliation', agent: 'Finance Controller', latency: '42ms', bottleneckScore: 'OPTIMAL', status: 'COMPLETED' },
    { stepId: 3, name: 'Policy & Guardrail Gateway (₹1 Lakh Limit)', agent: 'Compliance Guardrail', latency: '12ms', bottleneckScore: 'OPTIMAL', status: 'ACTIVE' },
    { stepId: 4, name: 'General Ledger ACID Double-Entry Post', agent: 'Finance Controller', latency: '18ms', bottleneckScore: 'OPTIMAL', status: 'PENDING' },
    { stepId: 5, name: 'SEPA / NACHA / NEFT Payment Queueing', agent: 'Treasury Agent', latency: '8ms', bottleneckScore: 'OPTIMAL', status: 'PENDING' }
  ];

  const handleSimulateExecution = () => {
    setIsRunning(true);
    let curr = 1;
    const interval = setInterval(() => {
      curr++;
      if (curr > 5) {
        clearInterval(interval);
        setIsRunning(false);
        confetti({ particleCount: 70, spread: 60, colors: ['#FF6B00', '#10B981', '#FFFFFF'] });
      } else {
        setActiveStep(curr);
      }
    }, 600);
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
            <GitFork size={20} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
              BPMN 2.0 State Machine & In-Memory Process Mining
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Deterministic Workflow Orchestration & Real-Time Alpha Process Mining Bottleneck Elevation
            </div>
          </div>
        </div>

        <button 
          onClick={handleSimulateExecution}
          disabled={isRunning}
          className="btn-primary" 
          style={{ padding: '8px 16px', fontSize: '12px' }}
        >
          <Play size={14} />
          <span>{isRunning ? 'Executing Workflow Instance...' : 'Simulate Live BPMN Execution'}</span>
        </button>
      </div>

      {/* BPMN Interactive Flow Visualizer */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFF' }}>
          Autonomous AP Invoicing BPMN 2.0 Graph Execution
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'auto', padding: '16px 0' }}>
          {workflowSteps.map((step, idx) => {
            const isCurrent = activeStep === step.stepId;
            const isPassed = activeStep > step.stepId;
            return (
              <React.Fragment key={step.stepId}>
                <div 
                  style={{
                    background: isCurrent 
                      ? 'linear-gradient(135deg, rgba(255, 107, 0, 0.25) 0%, rgba(255, 133, 27, 0.1) 100%)' 
                      : isPassed ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-primary)',
                    border: isCurrent ? '2px solid var(--accent-orange)' : isPassed ? '1px solid #10B981' : '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '16px',
                    width: '200px',
                    flexShrink: 0,
                    boxShadow: isCurrent ? '0 0 20px rgba(255, 107, 0, 0.4)' : 'none',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                      STEP 0{step.stepId}
                    </span>
                    {isPassed && <CheckCircle2 size={15} color="#10B981" />}
                    {isCurrent && <span className="status-pill status-pill-orange" style={{ fontSize: '8px' }}>ACTIVE</span>}
                  </div>

                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFF', minHeight: '36px' }}>
                    {step.name}
                  </div>

                  <div style={{ fontSize: '10px', color: 'var(--accent-orange-bright)', marginTop: '8px' }}>
                    {step.agent}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', marginTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '6px' }}>
                    <span>Latency</span>
                    <span className="font-mono" style={{ color: '#00E5FF' }}>{step.latency}</span>
                  </div>
                </div>

                {idx < workflowSteps.length - 1 && (
                  <ArrowRight size={20} color={isPassed ? '#10B981' : 'var(--text-tertiary)'} style={{ margin: '0 8px', flexShrink: 0 }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Process Mining Insights */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px'
        }}
      >
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFF' }}>
            In-Memory Process Mining Telemetry (Alpha Algorithm)
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Continuous trace analysis of 42,000 execution instances in ClickHouse. Zero variant deviations detected across SOX-regulated financial pathways.
          </div>
          <div style={{ marginTop: '10px', background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Straight-Through Conformance Fitness</div>
            <div className="font-mono" style={{ fontSize: '22px', fontWeight: 900, color: '#10B981' }}>
              0.9984 (99.84%)
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFF' }}>
            Autonomous Policy Elevation Candidate
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Tier-1 Vendor AP Invoices under ₹1,00,000 exhibit 0.00% defect rate over 180 days. System recommends increasing straight-through ceiling to ₹1,50,000.
          </div>
          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="status-pill status-pill-orange">RECOMMENDATION READY</span>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px' }}>
              Review Policy Change
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
