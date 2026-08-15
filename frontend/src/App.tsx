import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/layout/CommandPalette';
import { AgentSidecar } from './components/agent/AgentSidecar';
import { AgentSwarmVisualizer } from './components/agent/AgentSwarmVisualizer';
import { ExecutiveDashboard } from './components/modules/ExecutiveDashboard';
import { MultiCompanyBillingModule } from './components/modules/MultiCompanyBillingModule';
import { PlasticsProductMaster } from './components/modules/PlasticsProductMaster';
import { FinancialBookkeepingModule } from './components/modules/FinancialBookkeepingModule';
import { DownloadableInvoiceViewer } from './components/modules/DownloadableInvoiceViewer';
import { CustomersManagementModule } from './components/modules/CustomersManagementModule';
import { ReportsModule } from './components/modules/ReportsModule';
import { SettingsModule } from './components/modules/SettingsModule';
import { POSTerminalModule } from './components/modules/POSTerminalModule';
import { GSTBillingModule } from './components/modules/GSTBillingModule';
import { FinanceModule } from './components/modules/FinanceModule';
import { SupplyChainModule } from './components/modules/SupplyChainModule';
import { WarehouseModule } from './components/modules/WarehouseModule';
import { ManufacturingModule } from './components/modules/ManufacturingModule';
import { HRMPayrollModule } from './components/modules/HRMPayrollModule';
import { CRMCPQModule } from './components/modules/CRMCPQModule';
import { DocumentAILab } from './components/modules/DocumentAILab';
import { BPMNWorkflowModule } from './components/modules/BPMNWorkflowModule';
import { ModuleKey, TenantInfo, FinalInvoiceData } from './types/erp';
import { ERPDataProvider, useERPData } from './context/ERPContext';
import { CheckCircle2, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { 
    activeCompany, 
    setActiveCompany, 
    currentInvoice, 
    setCurrentInvoice, 
    feedbackBanner, 
    setFeedbackBanner 
  } = useERPData();

  const [activeModule, setActiveModule] = useState<ModuleKey>('typeahead_billing');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidecarOpen, setIsSidecarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const tenant: TenantInfo = {
    id: '00000000-0000-0000-0000-000000000001',
    slug: 'dmk-mart-global',
    legalName: activeCompany.companyName,
    currency: 'INR',
    planTier: 'ENTERPRISE_PLASTICS_ERP',
    autoApprovalThreshold: 50000
  };

  const handleExecutePromptFromPalette = (_prompt: string) => {
    setIsSidecarOpen(true);
  };

  const handleViewGeneratedInvoice = (invoiceData: FinalInvoiceData) => {
    setCurrentInvoice(invoiceData);
    setActiveModule('invoice_viewer');
  };

  const handlePostToLedger = (_invoiceData: FinalInvoiceData) => {
    // Already handled globally by addFastOrderBill in ERPContext
  };

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <ExecutiveDashboard onSelectModule={setActiveModule} onOpenSidecar={() => setIsSidecarOpen(true)} />;
      case 'typeahead_billing':
        return (
          <MultiCompanyBillingModule 
            activeCompany={activeCompany} 
            onViewInvoice={handleViewGeneratedInvoice}
            onPostToLedger={handlePostToLedger}
          />
        );
      case 'plastics_catalog':
        return <PlasticsProductMaster />;
      case 'customers':
        return <CustomersManagementModule onViewCustomerInvoice={handleViewGeneratedInvoice} />;
      case 'bookkeeping':
        return <FinancialBookkeepingModule activeCompany={activeCompany} />;
      case 'reports':
        return <ReportsModule activeCompany={activeCompany} />;
      case 'settings':
        return <SettingsModule activeCompany={activeCompany} onSelectCompany={setActiveCompany} />;
      case 'invoice_viewer':
        return (
          <DownloadableInvoiceViewer 
            invoiceData={currentInvoice}
            onBackToBilling={() => setActiveModule('typeahead_billing')}
          />
        );
      case 'pos':
        return <POSTerminalModule />;
      case 'gst_billing':
        return <GSTBillingModule />;
      case 'swarm_visualizer':
        return <AgentSwarmVisualizer />;
      case 'finance':
        return <FinanceModule />;
      case 'scm':
        return <SupplyChainModule />;
      case 'wms':
        return <WarehouseModule />;
      case 'mes':
        return <ManufacturingModule />;
      case 'hcm':
        return <HRMPayrollModule />;
      case 'crm':
        return <CRMCPQModule />;
      case 'doc_ai':
        return <DocumentAILab />;
      case 'bpmn':
        return <BPMNWorkflowModule />;
      default:
        return (
          <MultiCompanyBillingModule 
            activeCompany={activeCompany} 
            onViewInvoice={handleViewGeneratedInvoice}
            onPostToLedger={handlePostToLedger}
          />
        );
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Universal Real-Time Sync Toast Notification Banner */}
      {feedbackBanner && (
        <div 
          style={{
            position: 'fixed',
            top: '18px',
            right: '24px',
            zIndex: 99999,
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%)',
            color: '#FFF',
            padding: '12px 18px',
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '13px',
            fontWeight: 600,
            maxWidth: '560px',
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <CheckCircle2 size={18} color="#FFF" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{feedbackBanner}</span>
          <button 
            onClick={() => setFeedbackBanner(null)}
            style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer', opacity: 0.8 }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar 
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isSidecarOpen={isSidecarOpen}
        onToggleSidecar={() => setIsSidecarOpen(!isSidecarOpen)}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header 
          tenant={tenant}
          activeCompany={activeCompany}
          onSelectCompany={setActiveCompany}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onToggleSidecar={() => setIsSidecarOpen(!isSidecarOpen)}
          isSidecarOpen={isSidecarOpen}
        />

        <main style={{ flex: 1, padding: '24px', maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
          {renderActiveModule()}
        </main>
      </div>

      {/* Agent Copilot Sidecar Drawer */}
      <AgentSidecar 
        isOpen={isSidecarOpen}
        onClose={() => setIsSidecarOpen(false)}
      />

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectModule={setActiveModule}
        onExecutePrompt={handleExecutePromptFromPalette}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ERPDataProvider>
      <AppContent />
    </ERPDataProvider>
  );
};

export default App;

