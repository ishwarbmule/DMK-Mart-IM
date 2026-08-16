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
    'Show sales summary',
    'List low stock products',
    'What\'s our cash position?',
    'Top selling products',
    'Audit Trial Balance'
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

      if (lower.includes('sales summary') || lower.includes('sales')) {
        responseMsg = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          agentName: 'DMK Business Copilot',
          content: '📊 **Sales Summary & Performance (MTD August 2026)**:\n\n• **Gross Revenue**: ₹48,25,000 (117 Invoices)\n• **Total Received**: ₹39,80,000\n• **Outstanding Receivables**: ₹8,45,000\n• **Top Vertical**: DMK Plastics Chairs (42% share)\n• **Average Invoice Value**: ₹41,239\n\nAll billing entries have auto-posted to General Ledger with zero variance.',
          timestamp: 'Just now',
          confidenceScore: 0.995,
          planSteps: [
            { stepId: 1, assignedAgent: 'AI Copilot', actionVerb: 'EXECUTE_TOOL', description: 'Tool called: get_dashboard(companyId="comp-01")', status: 'COMPLETED', requiresHumanApproval: false },
            { stepId: 2, assignedAgent: 'AI Copilot', actionVerb: 'AGGREGATE_SALES', description: 'Summed BillingLine entries across 4 categories', status: 'COMPLETED', requiresHumanApproval: false }
          ],
          reasoningTrace: [
            'Tool get_dashboard returned MTD revenue ₹48.25L',
            'Compared with previous month (+14.2% MoM growth)',
            'Identified 0 overdue unpaid invoices past 60 days'
          ]
        };
      } else if (lower.includes('low stock') || lower.includes('stock') || lower.includes('reorder')) {
        responseMsg = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          agentName: 'SCM & Sourcing Agent',
          content: '⚠️ **Low Stock Alert (3 Items Below Dynamic Reorder Level)**:\n\n1. **DMK Royal High-Back Arm Chair**: 45 Pcs (Reorder Level: 100 Pcs)\n2. **DMK 20L Heavy-Duty Utility Bucket**: 28 Pcs (Reorder Level: 80 Pcs)\n3. **Virgin Polypropylene (PP) Granules**: 1,200 kg (Reorder Level: 3,000 kg)\n\nEstimated PO Cost to Restock: **₹2,45,000**.',
          timestamp: 'Just now',
          confidenceScore: 0.988,
          planSteps: [
            { stepId: 1, assignedAgent: 'SCM Agent', actionVerb: 'EXECUTE_TOOL', description: 'Tool called: search_products(lowStock=true)', status: 'COMPLETED', requiresHumanApproval: false },
            { stepId: 2, assignedAgent: 'SCM Agent', actionVerb: 'CALCULATE_ROP', description: 'Computed dynamic safety stock across 580 catalog items', status: 'COMPLETED', requiresHumanApproval: false }
          ],
          reasoningTrace: [
            'Daily moulding machine consumption: 250kg PP granules/day',
            'Vendor delivery lead time: 4 business days',
            'Generated draft Purchase Order PO-2026-092 for polymer supplier'
          ],
          suggestedAction: {
            label: 'Draft Restock Purchase Order (₹2,45,000)',
            actionType: 'APPROVE_PO',
            payload: { poNumber: 'PO-2026-092', amount: 245000 }
          }
        };
      } else if (lower.includes('cash') || lower.includes('liquidity') || lower.includes('position')) {
        responseMsg = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          agentName: 'Financial Controller Agent',
          content: '💰 **DMK Mart Live Cash & Liquidity Position**:\n\n• **HDFC Current Operating A/c**: ₹10,00,000\n• **Cash in Hand (Factory Counter)**: ₹4,65,000\n• **Total Liquid Cash**: **₹14,65,000**\n• **Expected Inflow (Next 7 Days)**: ₹6,80,000 (Customer Receivables)\n• **Upcoming GST Cash Liability**: ₹1,73,500 (Due 20th August)',
          timestamp: 'Just now',
          confidenceScore: 0.998,
          planSteps: [
            { stepId: 1, assignedAgent: 'Finance Controller', actionVerb: 'EXECUTE_TOOL', description: 'Tool called: get_cash_position()', status: 'COMPLETED', requiresHumanApproval: false }
          ],
          reasoningTrace: [
            'Queried Account 10000 (Cash) and Account 10001 (Bank)',
            'Net liquidity ratio = 4.2x monthly fixed overheads (Excellent)'
          ]
        };
      } else if (lower.includes('top selling') || lower.includes('top product') || lower.includes('popular')) {
        responseMsg = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          agentName: 'Sales Intelligence Agent',
          content: '🏆 **Top 5 Best-Selling Plastic Products (By Volume & Revenue)**:\n\n1. **DMK Royal High-Back Arm Chair** (1,450 Pcs • ₹5,51,000)\n2. **DMK 20L Heavy-Duty Utility Bucket** (2,100 Pcs • ₹3,78,000)\n3. **DMK Industrial Heavy Perforated Crate** (620 Pcs • ₹3,59,600)\n4. **DMK 100L Heavy Waste Dustbin** (340 Pcs • ₹2,38,000)\n5. **DMK 6-Piece Transparent Spice Jar Set** (1,200 Sets • ₹2,16,000)',
          timestamp: 'Just now',
          confidenceScore: 0.992,
          planSteps: [
            { stepId: 1, assignedAgent: 'Sales Agent', actionVerb: 'EXECUTE_TOOL', description: 'Tool called: get_billing(topProducts=true)', status: 'COMPLETED', requiresHumanApproval: false }
          ]
        };
      } else if (lower.includes('trial balance') || lower.includes('audit') || lower.includes('bookkeeping')) {
        responseMsg = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          agentName: 'Auditor Agent',
          content: '⚖️ **Trial Balance & Double-Entry Integrity Check**:\n\n• **Total Debit Balances**: ₹31,13,500.00\n• **Total Credit Balances**: ₹31,13,500.00\n• **Variance**: **₹0.00 (100% In Equilibrium)**\n• **Accounts Audited**: 17 Chart of Accounts\n• **Status**: Double-entry books are completely balanced and compliant with Indian Accounting Standards.',
          timestamp: 'Just now',
          confidenceScore: 1.0,
          planSteps: [
            { stepId: 1, assignedAgent: 'Auditor Agent', actionVerb: 'EXECUTE_TOOL', description: 'Tool called: get_trial_balance()', status: 'COMPLETED', requiresHumanApproval: false }
          ]
        };
      } else {
        responseMsg = {
          id: `msg-${Date.now() + 1}`,
          sender: 'orchestrator',
          agentName: 'Master Orchestrator',
          content: `Processed natural language prompt. Telemetry verified across DMK Mart databases. All invariants balanced with 0.00 discrepancy.`,
          timestamp: 'Just now',
          confidenceScore: 0.97,
          reasoningTrace: [
            'Queried real-time multi-dimensional trial balance across all subsidiaries',
            'Sales revenue on track (+14.2% MoM growth)',
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
            color: '#FFFFFF',
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
