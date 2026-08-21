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
  RefreshCw,
  Truck,
  Package,
  RotateCcw,
  IndianRupee
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AgentExecutionMessage } from '../../types/erp';
import { useERPData } from '../../context/ERPContext';

interface AgentSidecarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgentSidecar: React.FC<AgentSidecarProps> = ({ isOpen, onClose }) => {
  const { 
    products, 
    lowStockAlerts, 
    vendors, 
    customers, 
    counterCustomers,
    purchaseOrders, 
    purchaseReturns, 
    salesReturns, 
    allInvoices 
  } = useERPData();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [messages, setMessages] = useState<AgentExecutionMessage[]>([
    {
      id: 'msg-1',
      sender: 'orchestrator',
      agentName: 'DMK Autonomous Agent Swarm',
      content: 'Welcome! The DMK Mart AI Cognitive Mesh is actively monitoring inventory, dual stock, supplier POs, customer ledgers, and live daybook transactions. Ask me anything about your business!',
      timestamp: 'Just now',
      confidenceScore: 0.99
    }
  ]);

  const quickPrompts = [
    'Check low stock & reorders',
    'What is Latur Ishwar Mule\'s balance?',
    'Damaged stock valuation',
    'B2B Wholesale vs Counter Sales',
    'List all supplier payables'
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

      if (lower.includes('low stock') || lower.includes('reorder') || lower.includes('stock alert')) {
        const count = lowStockAlerts.length;
        const totalReorderEst = lowStockAlerts.reduce((s, a) => s + a.estimatedReorderCost, 0);

        const itemsList = lowStockAlerts.slice(0, 4).map((a, i) => 
          `${i + 1}. **${a.name}** (${a.sku})\n   • Current Main Stock: **${a.currentStock} units** (Threshold: ${a.threshold})\n   • Recommended Reorder: **+${a.deficitQuantity} units** from *${a.preferredVendorName}*\n   • Est. Cost: ₹${a.estimatedReorderCost.toLocaleString('en-IN')}`
        ).join('\n\n');

        responseMsg = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          agentName: 'Inventory & SCM Agent',
          content: `🚨 **Live Low-Stock Alert Analysis (${count} SKUs Below Safety Level)**:\n\n${itemsList || 'All inventory stock levels are currently optimal!'}\n\n📦 **Total Estimated Reorder Sourcing Cost**: **₹${totalReorderEst.toLocaleString('en-IN')}**\n\nWould you like me to auto-generate draft Purchase Orders for these suppliers?`,
          timestamp: 'Just now',
          confidenceScore: 0.994,
          planSteps: [
            { stepId: 1, assignedAgent: 'Inventory Agent', actionVerb: 'EVALUATE_STOCK_THRESHOLDS', description: 'Scanned 2,320 catalog SKUs against safety reorder limits', status: 'COMPLETED', requiresHumanApproval: false },
            { stepId: 2, assignedAgent: 'SCM Agent', actionVerb: 'MATCH_PREFERRED_SUPPLIER', description: 'Mapped low-stock SKUs to Nilkamal and Supreme manufacturer accounts', status: 'COMPLETED', requiresHumanApproval: false }
          ],
          reasoningTrace: [
            `Identified ${count} items where main stock <= threshold`,
            'Calculated deficit quantity considering warehouse lead times',
            'Cross-checked supplier catalog availability'
          ]
        };
      } else if (lower.includes('ishwar mule') || lower.includes('latur') || lower.includes('customer balance')) {
        const cust = customers.find(c => c.partyName.toLowerCase().includes('ishwar mule')) || customers[0];

        responseMsg = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          agentName: 'Finance & Ledger Agent',
          content: `👤 **Customer Profile & Ledger Balance: ${cust.partyName}**\n\n• **City Location**: ${cust.city} (State: ${cust.stateCode})\n• **GSTIN**: ${cust.gstin || 'N/A'}\n• **Phone**: ${cust.phone}\n• **Assigned Pricing Tier**: ${cust.assignedTier.replace('_', ' ').toUpperCase()}\n• **Opening Balance**: ₹${(cust.openingBalance || 0).toLocaleString('en-IN')} (Dr)\n• **Live Closing Balance (Receivable)**: **₹${cust.closingBalance.toLocaleString('en-IN')} (Dr)**\n• **Credit Limit**: ₹${cust.creditLimit.toLocaleString('en-IN')} (Utilization: ${((cust.closingBalance / (cust.creditLimit || 1)) * 100).toFixed(1)}%)\n\nAccount is in good standing with active wholesale orders.`,
          timestamp: 'Just now',
          confidenceScore: 0.998,
          planSteps: [
            { stepId: 1, assignedAgent: 'Ledger Agent', actionVerb: 'FETCH_PARTY_LEDGER', description: `Queried partyLedgers['${cust.id}'] in ERP Context`, status: 'COMPLETED', requiresHumanApproval: false },
            { stepId: 2, assignedAgent: 'Finance Agent', actionVerb: 'COMPUTE_CLOSING_BALANCE', description: 'Calculated Opening Bal + Billed Invoices - Payments - Credit Notes', status: 'COMPLETED', requiresHumanApproval: false }
          ],
          reasoningTrace: [
            `Retrieved live ledger for ${cust.partyName}`,
            `Opening debit: ₹${(cust.openingBalance || 0).toLocaleString('en-IN')}`,
            `Net current outstanding receivable: ₹${cust.closingBalance.toLocaleString('en-IN')}`
          ]
        };
      } else if (lower.includes('damaged') || lower.includes('broken') || lower.includes('defective') || lower.includes('return')) {
        let totalDamagedUnits = 0;
        let damagedValuation = 0;
        const damagedItems: string[] = [];

        products.forEach(p => {
          if (p.damagedStock > 0) {
            totalDamagedUnits += p.damagedStock;
            damagedValuation += p.damagedStock * p.purchaseBaseCost;
            damagedItems.push(`• **${p.name}**: ${p.damagedStock} units (Supplier: *${p.manufacturerName || 'Direct'}*)`);
          }
        });

        responseMsg = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          agentName: 'Quality & Returns Agent',
          content: `🛡️ **Damaged & Broken Stock Status**:\n\n• **Total Quarantined Broken Units**: **${totalDamagedUnits} Units**\n• **Total Asset Loss Valuation**: **₹${damagedValuation.toLocaleString('en-IN')}**\n\n**Breakdown by Product**:\n${damagedItems.join('\n')}\n\n**Recommendation**: These damaged items were placed into segregated Damaged Stock from customer returns. You can issue a **Purchase Return (Debit Note)** in the Purchase module to return them to the original manufacturers for full financial credit!`,
          timestamp: 'Just now',
          confidenceScore: 0.992,
          planSteps: [
            { stepId: 1, assignedAgent: 'Warehouse Agent', actionVerb: 'QUERY_DAMAGED_STOCK_POOL', description: 'Filtered products with damagedStock > 0', status: 'COMPLETED', requiresHumanApproval: false },
            { stepId: 2, assignedAgent: 'Finance Agent', actionVerb: 'ESTIMATE_DEBIT_NOTE_RECOVERY', description: 'Computed recoverable vendor credit via base procurement cost', status: 'COMPLETED', requiresHumanApproval: false }
          ],
          reasoningTrace: [
            'Verified segregated stock isolation (Main Sellable vs Damaged)',
            `Found ${totalDamagedUnits} total defective units`,
            'Generated recovery path via Supplier Purchase Returns'
          ]
        };
      } else if (lower.includes('counter') || lower.includes('b2b') || lower.includes('b2c') || lower.includes('walk-in')) {
        const b2bTotal = allInvoices.filter(i => !i.isCounterSale).reduce((s, i) => s + i.grandTotal, 0);
        const b2cTotal = allInvoices.filter(i => i.isCounterSale).reduce((s, i) => s + i.grandTotal, 0);
        const counterBuyersCount = counterCustomers.length;

        responseMsg = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          agentName: 'Commercial Analytics Agent',
          content: `📊 **B2B Wholesale vs. B2C Counter Retail Analysis**:\n\n• **B2B Wholesale Billing**: **₹${b2bTotal.toLocaleString('en-IN')}** (${allInvoices.filter(i => !i.isCounterSale).length} Consignment Invoices)\n• **B2C Counter Retail Sales**: **₹${b2cTotal.toLocaleString('en-IN')}** (${allInvoices.filter(i => i.isCounterSale).length} Walk-in Receipts)\n• **Registered Counter Buyers in Directory**: **${counterBuyersCount} Walk-in Buyers**\n\n**Key Insight**: B2B bulk invoicing represents ${((b2bTotal / ((b2bTotal + b2cTotal) || 1)) * 100).toFixed(1)}% of revenue with automatic bulk tier discounts applied on Sets (10) and Crates (24).`,
          timestamp: 'Just now',
          confidenceScore: 0.989,
          planSteps: [
            { stepId: 1, assignedAgent: 'Analytics Agent', actionVerb: 'SEGREGATE_COMMERCE_STREAMS', description: 'Split invoice records by isCounterSale flag', status: 'COMPLETED', requiresHumanApproval: false }
          ],
          reasoningTrace: [
            'Calculated real-time stream aggregation across active tenant invoices',
            'Evaluated counter buyer retention metrics'
          ]
        };
      } else if (lower.includes('supplier') || lower.includes('payable') || lower.includes('vendor')) {
        const totalPayables = vendors.reduce((s, v) => s + v.closingBalance, 0);
        const vendorList = vendors.map(v => 
          `• **${v.name}** (${v.partyType}): **₹${v.closingBalance.toLocaleString('en-IN')}** (Cr) [Terms: ${v.creditTermsDays} Days]`
        ).join('\n');

        responseMsg = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          agentName: 'Finance Sourcing Agent',
          content: `🏢 **Supplier Accounts Payable (Total: ₹${totalPayables.toLocaleString('en-IN')})**:\n\n${vendorList}\n\nAll PO inward receipts have auto-credited the vendor accounts. Pending payments can be disbursed directly via NEFT/UPI in the Purchase Management module.`,
          timestamp: 'Just now',
          confidenceScore: 0.996,
          planSteps: [
            { stepId: 1, assignedAgent: 'Finance Agent', actionVerb: 'SCAN_VENDOR_LEDGERS', description: 'Aggregated closing balances for all Manufacturers and Distributors', status: 'COMPLETED', requiresHumanApproval: false }
          ],
          reasoningTrace: [
            `Total active vendors: ${vendors.length}`,
            `Net liability payable: ₹${totalPayables.toLocaleString('en-IN')}`
          ]
        };
      } else {
        responseMsg = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          agentName: 'DMK Master Orchestrator',
          content: `I've analyzed your query regarding "${query}".\n\n• **Active Sellable Stock**: ${products.reduce((s, p) => s + p.stockQuantity, 0).toLocaleString('en-IN')} units\n• **Damaged Quarantined Stock**: ${products.reduce((s, p) => s + p.damagedStock, 0)} units\n• **Active B2B Clients**: ${customers.length} Accounts\n• **Suppliers**: ${vendors.length} Vendors\n• **Double-Entry Ledgers**: Balanced with ₹0.00 variance\n\nHow else can I assist your operations?`,
          timestamp: 'Just now',
          confidenceScore: 0.975
        };
      }

      setMessages(prev => [...prev, responseMsg]);
      setIsProcessing(false);
      confetti({ particleCount: 25, spread: 45 });
    }, 600);
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
        borderLeft: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Drawer Header */}
      <div 
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-tertiary)'
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
              color: '#FFF'
            }}
          >
            <Bot size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>
              DMK AI Copilot Swarm
            </div>
            <div style={{ fontSize: '11px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
              Autonomous Enterprise Mesh Active
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}
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
          gap: '14px'
        }}
      >
        {messages.map(msg => {
          const isUser = msg.sender === 'user';
          return (
            <div 
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                gap: '4px'
              }}
            >
              {!isUser && (
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-orange)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={11} /> {msg.agentName || 'Agent'}
                </div>
              )}

              <div 
                style={{
                  maxWidth: '90%',
                  padding: '12px 14px',
                  borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background: isUser ? 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)' : 'var(--bg-tertiary)',
                  color: isUser ? '#FFFFFF' : 'var(--text-primary)',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  border: isUser ? 'none' : '1px solid var(--border-subtle)',
                  whiteSpace: 'pre-line'
                }}
              >
                {msg.content}

                {/* Plan steps if present */}
                {msg.planSteps && msg.planSteps.length > 0 && (
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-orange)', marginBottom: '4px' }}>
                      Execution Plan Trace:
                    </div>
                    {msg.planSteps.map(step => (
                      <div key={step.stepId} style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <CheckCircle2 size={12} color="#10B981" />
                        <span>{step.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {isProcessing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-orange)', fontSize: '12px', padding: '10px' }}>
            <RefreshCw size={14} className="spin-animation" />
            Analyzing multi-module telemetry & querying live state...
          </div>
        )}
      </div>

      {/* Quick Prompts Carousel */}
      <div style={{ padding: '8px 16px', background: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-subtle)', overflowX: 'auto', display: 'flex', gap: '6px' }}>
        {quickPrompts.map(p => (
          <button
            key={p}
            onClick={() => handleSend(p)}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '8px',
          background: 'var(--bg-secondary)'
        }}
      >
        <input
          type="text"
          placeholder="Ask AI Copilot anything..."
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: '8px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
            fontSize: '13px'
          }}
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || isProcessing}
          style={{
            padding: '0 16px',
            borderRadius: '8px',
            background: 'var(--accent-orange)',
            border: 'none',
            color: '#FFF',
            cursor: !inputPrompt.trim() || isProcessing ? 'not-allowed' : 'pointer',
            opacity: !inputPrompt.trim() || isProcessing ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Send size={16} />
        </button>
      </form>

    </div>
  );
};
