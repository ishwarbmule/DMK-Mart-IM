-- ============================================================================
-- MIGRATION 006: CRM, PSA, EAM, QMS & BPMN WORKFLOW SCHEMAS
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS crm;
CREATE SCHEMA IF NOT EXISTS psa;
CREATE SCHEMA IF NOT EXISTS eam;
CREATE SCHEMA IF NOT EXISTS qms;
CREATE SCHEMA IF NOT EXISTS bpmn;

-- CRM ACCOUNTS & OPPORTUNITIES
CREATE TABLE IF NOT EXISTS crm.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    account_name VARCHAR(255) NOT NULL,
    industry VARCHAR(64),
    annual_revenue NUMERIC(18, 2),
    website VARCHAR(255),
    billing_address JSONB NOT NULL DEFAULT '{}'::jsonb,
    account_owner_id UUID REFERENCES core.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES crm.accounts(id) ON DELETE CASCADE,
    opportunity_name VARCHAR(255) NOT NULL,
    stage VARCHAR(32) NOT NULL DEFAULT 'QUALIFICATION' CHECK (stage IN ('QUALIFICATION', 'NEEDS_ANALYSIS', 'PROPOSAL_QUOTED', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST')),
    expected_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    probability_percentage NUMERIC(5, 2) NOT NULL DEFAULT 20.00,
    close_date DATE NOT NULL,
    owner_user_id UUID NOT NULL REFERENCES core.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    quote_number VARCHAR(64) NOT NULL,
    opportunity_id UUID NOT NULL REFERENCES crm.opportunities(id) ON DELETE CASCADE,
    version_number INT NOT NULL DEFAULT 1,
    subtotal_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    discount_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    tax_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    total_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    target_margin_percentage NUMERIC(5, 2) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'ISSUED_TO_CLIENT', 'ACCEPTED', 'EXPIRED', 'SUPERSEDED')),
    created_by UUID NOT NULL REFERENCES core.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_quote_ver UNIQUE (tenant_id, quote_number, version_number)
);

CREATE TABLE IF NOT EXISTS crm.sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    order_number VARCHAR(64) NOT NULL,
    quote_id UUID REFERENCES crm.quotes(id),
    account_id UUID NOT NULL REFERENCES crm.accounts(id),
    order_date DATE NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    total_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    fulfillment_status VARCHAR(32) NOT NULL DEFAULT 'UNFULFILLED' CHECK (fulfillment_status IN ('UNFULFILLED', 'PARTIAL', 'FULFILLED', 'SHIPPED')),
    billing_status VARCHAR(32) NOT NULL DEFAULT 'UNBILLED' CHECK (billing_status IN ('UNBILLED', 'PARTIAL_BILLED', 'BILLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_so_number UNIQUE (tenant_id, order_number)
);

-- PSA PROJECTS
CREATE TABLE IF NOT EXISTS psa.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    project_code VARCHAR(32) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    account_id UUID REFERENCES crm.accounts(id),
    project_manager_id UUID NOT NULL REFERENCES core.users(id),
    start_date DATE NOT NULL,
    target_end_date DATE NOT NULL,
    billing_type VARCHAR(32) NOT NULL DEFAULT 'TIME_AND_MATERIALS' CHECK (billing_type IN ('TIME_AND_MATERIALS', 'FIXED_PRICE_MILESTONES', 'PERCENTAGE_OF_COMPLETION', 'RETAINER')),
    budget_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    incurred_cost NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    recognized_revenue NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    status VARCHAR(32) NOT NULL DEFAULT 'PLANNING' CHECK (status IN ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_project_code UNIQUE (tenant_id, project_code)
);

-- EAM ASSETS & MAINTENANCE
CREATE TABLE IF NOT EXISTS eam.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    asset_tag VARCHAR(64) NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(128),
    work_center_id UUID REFERENCES mes.work_centers(id),
    location_id UUID REFERENCES wms.locations(id),
    acquisition_date DATE NOT NULL,
    acquisition_cost NUMERIC(18, 4) NOT NULL,
    current_book_value NUMERIC(18, 4) NOT NULL,
    depreciation_method VARCHAR(32) NOT NULL DEFAULT 'STRAIGHT_LINE' CHECK (depreciation_method IN ('STRAIGHT_LINE', 'DECLINING_BALANCE', 'UNITS_OF_PRODUCTION')),
    useful_life_months INT NOT NULL DEFAULT 60,
    operational_status VARCHAR(32) NOT NULL DEFAULT 'OPERATIONAL' CHECK (operational_status IN ('OPERATIONAL', 'DEGRADED', 'DOWN_MAINTENANCE', 'RETIRED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_asset_tag UNIQUE (tenant_id, asset_tag)
);

CREATE TABLE IF NOT EXISTS eam.maintenance_work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    mwo_number VARCHAR(64) NOT NULL,
    asset_id UUID NOT NULL REFERENCES eam.assets(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(32) NOT NULL CHECK (maintenance_type IN ('PREVENTIVE', 'CORRECTIVE', 'IOT_PREDICTIVE_TRIGGER', 'EMERGENCY')),
    priority VARCHAR(16) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL_STOP')),
    scheduled_start TIMESTAMPTZ NOT NULL,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    assigned_technician_id UUID REFERENCES core.users(id),
    issue_summary TEXT NOT NULL,
    work_performed_notes TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'AWAITING_PARTS', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_mwo UNIQUE (tenant_id, mwo_number)
);

-- QMS QUALITY & NON-CONFORMANCE
CREATE TABLE IF NOT EXISTS qms.inspection_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    plan_code VARCHAR(64) NOT NULL,
    item_id UUID NOT NULL REFERENCES wms.items(id),
    inspection_stage VARCHAR(32) NOT NULL CHECK (inspection_stage IN ('RECEIVING', 'IN_PROCESS', 'FINAL_RELEASE')),
    sampling_standard VARCHAR(32) NOT NULL DEFAULT 'ISO_2859_NORMAL',
    aql_level NUMERIC(4, 2) NOT NULL DEFAULT 1.50,
    parameters_schema JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_insp_plan UNIQUE (tenant_id, plan_code)
);

CREATE TABLE IF NOT EXISTS qms.non_conformance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    ncr_number VARCHAR(64) NOT NULL,
    item_id UUID NOT NULL REFERENCES wms.items(id),
    lot_number VARCHAR(64),
    quarantined_quantity NUMERIC(18, 4) NOT NULL,
    defect_category VARCHAR(64) NOT NULL,
    severity VARCHAR(16) NOT NULL DEFAULT 'MAJOR' CHECK (severity IN ('MINOR', 'MAJOR', 'CRITICAL_SAFETY')),
    originating_work_order_id UUID REFERENCES mes.work_orders(id),
    reported_by UUID NOT NULL REFERENCES core.users(id),
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'UNDER_INVESTIGATION', 'DISPOSITIONED', 'CLOSED')),
    disposition VARCHAR(32) CHECK (disposition IN ('SCRAP', 'REWORK', 'RETURN_TO_VENDOR', 'USE_AS_IS')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_ncr UNIQUE (tenant_id, ncr_number)
);

-- BPMN 2.0 WORKFLOW STATE MACHINE
CREATE TABLE IF NOT EXISTS bpmn.workflow_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    workflow_key VARCHAR(64) NOT NULL,
    version INT NOT NULL DEFAULT 1,
    xml_definition TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_wf_def UNIQUE (tenant_id, workflow_key, version)
);

CREATE TABLE IF NOT EXISTS bpmn.workflow_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    workflow_definition_id UUID NOT NULL REFERENCES bpmn.workflow_definitions(id),
    business_key VARCHAR(128) NOT NULL,
    current_state VARCHAR(64) NOT NULL,
    variables_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'RUNNING' CHECK (status IN ('RUNNING', 'SUSPENDED', 'COMPLETED', 'TERMINATED')),
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ
);
