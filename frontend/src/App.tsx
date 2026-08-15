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
import { ModuleKey, TenantInfo, CompanyVertical, FinalInvoiceData } from './types/erp';
import { DMK_COMPANIES } from './data/multiCompanyData';

export const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleKey>('typeahead_billing');
  const [activeCompany, setActiveCompany] = useState<CompanyVertical>(DMK_COMPANIES[0]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidecarOpen, setIsSidecarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<FinalInvoiceData | null>(null);

  const tenant: TenantInfo = {
    id: '00000000-0000-0000-0000-000000000001',
    slug: 'dmk-mart-global',
    legalName: activeCompany.companyName,
    currency: 'INR',
    planTier: 'ENTERPRISE_PLASTICS_ERP',
    autoApprovalThreshold: 50000
  };

  const handleExecutePromptFromPalette = (prompt: string) => {
    setIsSidecarOpen(true);
  };

  const handleViewGeneratedInvoice = (invoiceData: FinalInvoiceData) => {
    setCurrentInvoice(invoiceData);
    setActiveModule('invoice_viewer');
  };

  const handlePostToLedger = (invoiceData: FinalInvoiceData) => {
    // Automatically synced to bookkeeping ledger
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
      case 'bookkeeping':
        return <FinancialBookkeepingModule activeCompany={activeCompany} />;
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

export default App;
