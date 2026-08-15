import React, { useState } from 'react';
import { Cpu, Layers, GitCommit, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MOCK_BOM_TREE, MOCK_WORK_ORDERS } from '../../data/mockData';
import { BOMComponent, WorkOrder } from '../../types/erp';

export const ManufacturingModule: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(MOCK_WORK_ORDERS);
  const [activeTab, setActiveTab] = useState<'bom_tree' | 'shop_floor'>('bom_tree');

  const renderBOMNode = (node: BOMComponent, depth: number = 0) => {
    return (
      <div 
        key={node.id} 
        style={{ 
          marginLeft: `${depth * 24}px`, 
          borderLeft: depth > 0 ? '2px dashed var(--accent-orange-border)' : 'none',
          paddingLeft: depth > 0 ? '16px' : '0',
          marginTop: '10px'
        }}
      >
        <div 
          style={{
            background: depth === 0 ? 'rgba(255, 107, 0, 0.12)' : 'var(--bg-secondary)',
            border: depth === 0 ? '1px solid var(--accent-orange)' : '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GitCommit size={16} color={depth === 0 ? 'var(--accent-orange)' : 'var(--accent-cyan)'} />
            <div>
              <span className="font-mono" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-orange-bright)' }}>
                {node.sku}
              </span>
              <span style={{ fontSize: '13px', color: '#FFF', marginLeft: '10px', fontWeight: 500 }}>
                {node.name}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Qty Req: <strong className="font-mono" style={{ color: '#FFF' }}>{node.quantityRequired}</strong>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Scrap: <strong className="font-mono" style={{ color: '#FFB020' }}>{node.scrapFactorPct}%</strong>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
              ${node.unitCost.toLocaleString()}
            </div>
          </div>
        </div>

        {node.subComponents && node.subComponents.map(sub => renderBOMNode(sub, depth + 1))}
      </div>
    );
  };

  const handleCompleteWorkOrder = (id: string) => {
    confetti({ particleCount: 60, spread: 60, colors: ['#FF6B00', '#10B981', '#FFFFFF'] });
    setWorkOrders(prev => prev.map(wo => wo.id === id ? { ...wo, status: 'COMPLETED', completedQty: wo.plannedQty } : wo));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
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
            <Cpu size={20} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
              Advanced Manufacturing Execution & MRP-II (MES)
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Recursive Multi-Level BOM Cost Rollup & Finite Capacity Shop Floor Dispatch
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-primary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <button 
            onClick={() => setActiveTab('bom_tree')}
            className={activeTab === 'bom_tree' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            Multi-Level BOM Explorer
          </button>
          <button 
            onClick={() => setActiveTab('shop_floor')}
            className={activeTab === 'shop_floor' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            Shop Floor Work Orders ({workOrders.length})
          </button>
        </div>
      </div>

      {activeTab === 'bom_tree' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFF' }}>
                Engineering BOM Explosion: FG-ROBOT-ARM-X1
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Recursive SQL CTE Rollup across 3 Assembly Levels
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Total Rolled-Up Unit Cost</div>
              <div className="font-mono" style={{ fontSize: '20px', fontWeight: 900, color: '#10B981' }}>
                $14,500.00
              </div>
            </div>
          </div>

          <div>
            {renderBOMNode(MOCK_BOM_TREE)}
          </div>
        </div>
      )}

      {activeTab === 'shop_floor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {workOrders.map(wo => (
            <div 
              key={wo.id}
              className="glass-panel"
              style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div 
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: wo.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 107, 0, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: wo.status === 'COMPLETED' ? '#10B981' : 'var(--accent-orange)'
                  }}
                >
                  <Cpu size={20} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="font-mono" style={{ fontSize: '14px', fontWeight: 700, color: '#FFF' }}>{wo.orderNumber}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>• {wo.itemName} ({wo.itemSku})</span>
                    <span className={wo.status === 'COMPLETED' ? 'status-pill-success' : 'status-pill-orange'} style={{ fontSize: '9px' }}>
                      {wo.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Work Center: <strong style={{ color: '#00E5FF' }}>{wo.workCenter}</strong> • Start: {wo.startDate} • Due: {wo.dueDate}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Produced Qty</div>
                  <div className="font-mono" style={{ fontSize: '15px', fontWeight: 800, color: '#FFF' }}>
                    {wo.completedQty} / {wo.plannedQty} <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>units</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Live OEE Telemetry</div>
                  <div className="font-mono" style={{ fontSize: '15px', fontWeight: 800, color: wo.oeeScore >= 90 ? '#10B981' : '#FFB020' }}>
                    {wo.oeeScore}%
                  </div>
                </div>

                {wo.status !== 'COMPLETED' && (
                  <button 
                    onClick={() => handleCompleteWorkOrder(wo.id)}
                    className="btn-primary"
                    style={{ padding: '8px 14px', fontSize: '12px' }}
                  >
                    <CheckCircle2 size={14} /> Clock Completion
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
