import React from 'react';
import { Bot, DollarSign, Truck, Cpu, Users, ShieldCheck, Sparkles, Activity, CheckCircle2, ArrowRight } from 'lucide-react';

export const AgentSwarmVisualizer: React.FC = () => {
  const agents = [
    {
      name: 'Master Orchestrator',
      role: 'Semantic Intent & DAG Decomposition',
      icon: Bot,
      status: 'ACTIVE_LISTENING',
      tasksCompleted: 4210,
      confidence: '99.4%',
      activeChannel: 'gRPC / Kafka KRaft',
      accent: '#FF6B00'
    },
    {
      name: 'Financial Controller Agent',
      role: 'Double-Entry GL, 3-Way Match & Tax',
      icon: DollarSign,
      status: 'AUTONOMOUS_POSTING',
      tasksCompleted: 8940,
      confidence: '99.8%',
      activeChannel: 'finance.journal.posted',
      accent: '#10B981'
    },
    {
      name: 'SCM & Sourcing Agent',
      role: 'Dynamic ROP, RFQ & Supplier Scoring',
      icon: Truck,
      status: 'MONITORING_LEAD_TIMES',
      tasksCompleted: 3120,
      confidence: '97.8%',
      activeChannel: 'scm.po.approved',
      accent: '#FF851B'
    },
    {
      name: 'Shop Floor MES Agent',
      role: 'Finite Capacity Scheduling & OEE',
      icon: Cpu,
      status: 'STREAMING_OPC_UA',
      tasksCompleted: 15400,
      confidence: '98.6%',
      activeChannel: 'mes.telemetry.continuous',
      accent: '#00E5FF'
    },
    {
      name: 'HR & Workforce Agent',
      role: 'Gross-to-Net Payroll & Skill Match',
      icon: Users,
      status: 'IDLE_READY',
      tasksCompleted: 1200,
      confidence: '99.9%',
      activeChannel: 'hcm.payroll.cleared',
      accent: '#8B5CF6'
    },
    {
      name: 'Compliance & Audit Guardrail',
      role: 'Segregation of Duties & RLS Shield',
      icon: ShieldCheck,
      status: 'ENFORCING_ZERO_TRUST',
      tasksCompleted: 28400,
      confidence: '100.0%',
      activeChannel: 'audit.cryptographic.sign',
      accent: '#EF4444'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div 
        className="glass-panel-orange"
        style={{
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Sparkles size={20} color="var(--accent-orange)" />
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>
              Autonomous Multi-Agent Consensus Swarm
            </span>
            <span className="status-pill status-pill-orange">KRaft Event Mesh</span>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '680px' }}>
            DMK Mart deploys a decoupled cognitive swarm of domain-specialized agents. Agents collaborate over binary Protocol Buffers and Kafka event topics with strict mathematical authority boundaries.
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#FFF', fontFamily: 'var(--font-mono)' }}>
            84.2%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--accent-orange-bright)', fontWeight: 600 }}>
            Straight-Through Execution Rate
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '16px'
        }}
      >
        {agents.map((agent, idx) => {
          const Icon = agent.icon;
          return (
            <div 
              key={idx}
              className="glass-panel"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  backgroundColor: agent.accent
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div 
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${agent.accent}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: agent.accent
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFF' }}>{agent.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{agent.role}</div>
                  </div>
                </div>
                <span className="status-pill status-pill-success" style={{ fontSize: '9px' }}>
                  {agent.status}
                </span>
              </div>

              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '12px',
                  borderRadius: '8px'
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Completed Tasks</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFF', fontFamily: 'var(--font-mono)' }}>
                    {agent.tasksCompleted.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Avg Confidence</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: agent.accent, fontFamily: 'var(--font-mono)' }}>
                    {agent.confidence}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={12} color="var(--accent-orange)" />
                <span>Topic: <code style={{ color: 'var(--text-secondary)' }}>{agent.activeChannel}</code></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
