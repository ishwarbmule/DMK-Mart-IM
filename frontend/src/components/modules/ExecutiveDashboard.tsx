import React from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Zap, 
  Activity, 
  DollarSign, 
  Truck, 
  CheckCircle2,
  Sparkles,
  Bot
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { INITIAL_KPIS } from '../../data/mockData';
import { ModuleKey } from '../../types/erp';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ExecutiveDashboardProps {
  onSelectModule: (mod: ModuleKey) => void;
  onOpenSidecar: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  onSelectModule,
  onOpenSidecar
}) => {
  const chartData = {
    labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
    datasets: [
      {
        label: 'Real-Time Working Capital ($M)',
        data: [13.2, 13.8, 14.1, 14.4, 14.2, 14.7, 14.82],
        borderColor: '#FF6B00',
        backgroundColor: 'rgba(255, 107, 0, 0.15)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#FF851B',
        pointBorderColor: '#FFFFFF',
        pointRadius: 4
      },
      {
        label: 'Autonomous Processing Rate (%)',
        data: [78, 80, 81.5, 82, 83.5, 84.0, 84.2],
        borderColor: '#00E5FF',
        backgroundColor: 'rgba(0, 229, 255, 0.05)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#94A3B8',
          font: { family: 'Inter', size: 12 }
        }
      },
      tooltip: {
        backgroundColor: '#181B24',
        titleColor: '#FFFFFF',
        bodyColor: '#FF851B',
        borderColor: 'rgba(255, 107, 0, 0.3)',
        borderWidth: 1,
        padding: 12
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748B' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748B' }
      }
    }
  };

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Sparkles size={22} color="var(--accent-orange)" />
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#FFF' }}>
              DMK Mart Executive Cockpit & Cognitive Telemetry
            </h1>
            <span className="status-pill status-pill-success">LIVE OPERATIONAL FEED</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '720px' }}>
            Autonomous enterprise operating telemetry across 12 bounded domains. Double-entry general ledgers and multi-level manufacturing schedules updated sub-second via Apache Kafka and ClickHouse.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => onSelectModule('finance')}
            className="btn-secondary"
          >
            <DollarSign size={16} />
            <span>General Ledger</span>
          </button>
          <button 
            onClick={onOpenSidecar}
            className="btn-primary"
          >
            <Bot size={16} />
            <span>Launch AI Copilot</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px'
        }}
      >
        {INITIAL_KPIS.map((kpi, idx) => (
          <div 
            key={idx} 
            className="glass-panel"
            style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>{kpi.title}</span>
              <span 
                className={kpi.isPositive ? 'status-pill-success' : 'status-pill-danger'}
                style={{ fontSize: '10px', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '2px' }}
              >
                {kpi.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {kpi.change}
              </span>
            </div>

            <div style={{ fontSize: '26px', fontWeight: 800, color: '#FFF', fontFamily: 'var(--font-mono)' }}>
              {kpi.value}
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              {kpi.subtext}
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart & Live Stream */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '20px'
        }}
      >
        {/* Chart Card */}
        <div 
          className="glass-panel"
          style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', height: '360px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFF' }}>
                Real-Time Working Capital & Autonomous Execution Velocity
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Streaming telemetry from ClickHouse OLAP Rollup Tables
              </div>
            </div>
            <span className="status-pill status-pill-orange">100% BALANCED</span>
          </div>

          <div style={{ flex: 1, position: 'relative' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Live Transaction Ledger Feed */}
        <div 
          className="glass-panel"
          style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', height: '360px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFF' }}>
              Straight-Through Event Stream
            </div>
            <span className="status-pill status-pill-cyan" style={{ fontSize: '9px' }}>KAFKA KRAFT</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { id: 'ev-1', type: 'finance.journal.posted', text: 'JE-2026-9012 Auto-Posted: $4,200.00 (AP Match)', time: '1m ago', color: '#10B981' },
              { id: 'ev-2', type: 'scm.po.approved', text: 'PO-2026-088 Approved: 500 units RAW-STL-404', time: '4m ago', color: '#FF6B00' },
              { id: 'ev-3', type: 'wms.stock.allocated', text: 'Picking Wave #42 allocated via TSP shortest-path', time: '12m ago', color: '#00E5FF' },
              { id: 'ev-4', type: 'mes.telemetry.oee', text: 'Robotics Line A clocked 94.2% OEE efficiency', time: '18m ago', color: '#FFB020' },
              { id: 'ev-5', type: 'ai.rlbf.reward', text: 'RLBF Reward +1.0 recorded from user acceptance', time: '22m ago', color: '#8B5CF6' }
            ].map(item => (
              <div 
                key={item.id}
                style={{
                  padding: '8px 10px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '6px',
                  borderLeft: `3px solid ${item.color}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
                  <code style={{ color: item.color, fontSize: '10px' }}>{item.type}</code>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '10px' }}>{item.time}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#FFF' }}>{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
