import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck,
  Zap,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AgentExecutionMessage, AgentTaskStep } from '../../types/erp';

interface AgentSidecarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgentSidecar: React.FC<AgentSidecarProps> = ({ isOpen, onClose }) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [messages, setMessages] = useState<AgentExecutionMessage[]>([
    {
      id: 'msg-1',
      sender: 'orchestrator',
      agentName: 'Master Orchestrator Agent',
      content: 'Welcome, Dr. Sarah. The cognitive agent swarm is actively monitoring enterprise streams across all 12 modules. How can I assist your operations today?',
      timestamp: 'Just now',
      confidenceScore: 0.99
    }
  ]);

  const quickPrompts = [
    'Restock 500 units of RAW-STL-404',
    '3-Way Match AP Invoice INV-2026-0091',
    'Audit Trial Balance Invariants in ClickHouse',
    'Simulate 60-Day Cash Flow Liquidity'
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || isProcessing) return;

    const userMsg: AgentExecutionMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsProcessing(true);

    setTimeout(() => {
      let responseMsg: AgentExecutionMessage;
      const lower = query.toLowerCase();

      if (lower.includes('restock') || lower.includes('reorder') || lower.includes('raw-stl-404')) {
        responseMsg = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          agentName: 'SCM & Sourcing Agent',
          content: 'I analyzed historical lead-time volatility and calculated dynamic ROP for RAW-STL-404. Current stock (1,850 units) is below dynamic ROP (3,179 units). Generated Purchase Order PO-2026-088 for $12,500.00.',
          timestamp: 'Just now',
          confidenceScore: 0.978,
          planSteps: [
            { stepId: 1, assignedAgent: 'SCM Agent', actionVerb: 'CALCULATE_DYNAMIC_ROP', description: 'Calculated ROP: 3,179 units (Z=2.326, 99% SL)', status: 'COMPLETED', requiresHumanApproval: false },
            { stepId: 2, assignedAgent: 'Finance Controller', actionVerb: 'ENCUMBER_FUNDS', description: 'Locked $12,500 budget in Cost Center CC-PLANT-01', status: 'COMPLETED', requiresHumanApproval: false },
            { stepId: 3, assignedAgent: 'SCM Agent', actionVerb: 'CREATE_PURCHASE_ORDER', description: 'Drafted PO-2026-088 for Global Steel Dynamics ($12,500.00)', status: 'AWAITING_APPROVAL', requiresHumanApproval: true }
          ],
          reasoningTrace: [
            'Daily demand mean = 150 units, stddev = 30 units',
            'Supplier lead time = 14 days, lead time stddev = 3 days',
            'Combined variance formula derived safety stock = 1,079 units',
            'Total PO value exceeds autonomous ceiling ($10,000) -> Escalated for human signature'
          ],
          suggestedAction: {
            label: 'Authorize & Dispatch PO-2026-088 ($12,500.00)',
            actionType: 'APPROVE_PO',
            payload: { poNumber: 'PO-2026-088', amount: 12500 }
          }
        };
      } else if (lower.includes('invoice') || lower.includes('match') || lower.includes('0091')) {
        responseMsg = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          agentName: 'Financial Controller Agent',
          content: 'Executed optical OCR and deterministic 3-way match on AP Invoice INV-2026-0091 against Purchase Order PO-2026-0811 and Goods Receipt GRN-2026-0419. Zero discrepancy detected.',
          timestamp: 'Just now',
          confidenceScore: 0.998,
          planSteps: [
            { stepId: 1, assignedAgent: 'Document AI', actionVerb: 'OCR_EXTRACT', description: 'LayoutLMv3 extracted line items & tax amounts (99.8% confidence)', status: 'COMPLETED', requiresHumanApproval: false },
            { stepId: 2, assignedAgent: 'Finance Controller', actionVerb: '3_WAY_MATCH', description: 'Matched invoice price ($4,200) == PO price ($4,200) & received qty (50 units)', status: 'COMPLETED', requiresHumanApproval: false },
            { stepId: 3, assignedAgent: 'Finance Controller', actionVerb: 'POST_GL_JOURNAL', description: 'Auto-posted entry JE-2026-9012 to General Ledger with 2/10 early-pay discount queue', status: 'COMPLETED', requiresHumanApproval: false }
          ],
          reasoningTrace: [
            'Vendor: Global Steel Dynamics Corp (Tier-1 Preferred)',
            'Price tolerance: 0.00% variance | Quantity tolerance: 0.00% variance',
            'Straight-through autonomous processing criteria fulfilled (Amount < $10,000)'
          ]
        };
      } else {
        responseMsg = {
          id: `msg-${Date.now() + 1}`,
          sender: 'orchestrator',
          agentName: 'Master Orchestrator',
          content: `Decomposed prompt into multi-agent workflow. Telemetry verified across ClickHouse OLAP aggregation tables. All invariants balanced with 0.00 discrepancy.`,
          timestamp: 'Just now',
          confidenceScore: 0.965,
          reasoningTrace: [
            'Queried real-time multi-dimensional trial balance across all subsidiaries',
            'EBITDA on track (+8.4% above quarterly forecast)',
            'Zero anomalous journal entries flagged in past 24 hours'
          ]
        };
      }

      setMessages(prev => [...prev, responseMsg]);
      setIsProcessing(false);
    }, 900);
  };

  const handleApproveAction = (msgId: string) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF6B00', '#FF851B', '#FFFFFF', '#00E5FF']
    });

    setMessages(prev => prev.map(m => {
      if (m.id === msgId && m.planSteps) {
        const updatedSteps = m.planSteps.map(s => s.status === 'AWAITING_APPROVAL' ? { ...s, status: 'COMPLETED' as const } : s);
        return {
          ...m,
          planSteps: updatedSteps,
          suggestedAction: undefined,
          content: m.content + '\n\n✅ Transaction officially authorized and committed to immutable ledger.'
        };
      }
      return m;
    }));
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '420px',
        backgroundColor: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--accent-orange-border)',
        boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.75)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Sidecar Header */}
      <div 
        style={{
          height: 'var(--header-height)',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'linear-gradient(180deg, rgba(255, 107, 0, 0.12) 0%, transparent 100%)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div 
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(255, 107, 0, 0.4)'
            }}
          >
            <Bot size={18} color="#FFF" />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFF' }}>
              Autonomous Swarm Copilot
            </div>
            <div style={{ fontSize: '10px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              Active Consensus Mesh
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div 
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {messages.map(msg => (
          <div 
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              gap: '6px'
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {msg.agentName && <span style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>{msg.agentName}</span>}
              <span>{msg.timestamp}</span>
              {msg.confidenceScore && (
                <span className="status-pill status-pill-cyan" style={{ fontSize: '8px', padding: '1px 5px' }}>
                  {(msg.confidenceScore * 100).toFixed(1)}% CONF
                </span>
              )}
            </div>

            <div 
              style={{
                maxWidth: '92%',
                padding: '12px 14px',
                borderRadius: '10px',
                background: msg.sender === 'user' 
                  ? 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)' 
                  : 'var(--bg-tertiary)',
                color: '#FFF',
                fontSize: '13px',
                lineHeight: '1.5',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                boxShadow: msg.sender === 'user' ? '0 4px 14px rgba(255, 107, 0, 0.3)' : 'none'
              }}
            >
              {msg.content}

              {/* Execution DAG Steps */}
              {msg.planSteps && msg.planSteps.length > 0 && (
                <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-orange-bright)', marginBottom: '8px' }}>
                    EXECUTION DAG STEPS
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {msg.planSteps.map(step => (
                      <div 
                        key={step.stepId}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          background: 'rgba(0, 0, 0, 0.25)',
                          padding: '8px',
                          borderRadius: '6px',
                          fontSize: '11px'
                        }}
                      >
                        {step.status === 'COMPLETED' && <CheckCircle2 size={15} color="#10B981" style={{ flexShrink: 0, marginTop: '1px' }} />}
                        {step.status === 'AWAITING_APPROVAL' && <AlertTriangle size={15} color="#FFB020" style={{ flexShrink: 0, marginTop: '1px' }} />}
                        <div>
                          <div style={{ fontWeight: 600, color: '#FFF' }}>
                            Step {step.stepId}: {step.actionVerb} ({step.assignedAgent})
                          </div>
                          <div style={{ color: 'var(--text-secondary)' }}>{step.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Action Button (Human in the Loop) */}
              {msg.suggestedAction && (
                <div style={{ marginTop: '12px' }}>
                  <button 
                    onClick={() => handleApproveAction(msg.id)}
                    className="btn-primary"
                    style={{ width: '100%', padding: '10px' }}
                  >
                    <ShieldCheck size={16} />
                    <span>{msg.suggestedAction.label}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-orange)', fontSize: '12px' }}>
            <RefreshCw size={14} className="animate-spin-slow" />
            <span>Agent Swarm synthesizing consensus...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div style={{ padding: '10px 16px', background: 'var(--bg-primary)', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
          Suggested Directives
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '11px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#FFF';
                e.currentTarget.style.borderColor = 'var(--accent-orange)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div 
        style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          gap: '8px'
        }}
      >
        <input 
          type="text"
          placeholder="Issue directive to agent swarm..."
          value={inputPrompt}
          onChange={e => setInputPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          style={{
            flex: 1,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#FFF',
            fontSize: '13px',
            outline: 'none'
          }}
        />
        <button 
          onClick={() => handleSend()}
          disabled={!inputPrompt.trim() || isProcessing}
          className="btn-primary"
          style={{ padding: '0 16px' }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
