-- ============================================================================
-- MIGRATION 002: FINANCE, GENERAL LEDGER, COA & INVOICING SCHEMAS
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS finance;

CREATE TABLE IF NOT EXISTS finance.fiscal_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    year_label VARCHAR(32) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_fiscal_year UNIQUE (tenant_id, year_label)
);

CREATE TABLE IF NOT EXISTS finance.fiscal_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    fiscal_year_id UUID NOT NULL REFERENCES finance.fiscal_years(id) ON DELETE CASCADE,
    period_number INT NOT NULL CHECK (period_number BETWEEN 1 AND 13),
    period_name VARCHAR(32) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('FUTURE', 'OPEN', 'SOFT_CLOSED', 'HARD_CLOSED')),
    closed_at TIMESTAMPTZ,
    closed_by UUID REFERENCES core.users(id),
    CONSTRAINT uq_tenant_fiscal_period UNIQUE (tenant_id, fiscal_year_id, period_number)
);

CREATE TABLE IF NOT EXISTS finance.chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    account_number VARCHAR(64) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_class VARCHAR(32) NOT NULL CHECK (account_class IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')),
    account_subtype VARCHAR(64) NOT NULL,
    parent_account_id UUID REFERENCES finance.chart_of_accounts(id),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    is_reconciliation_account BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    allow_manual_posting BOOLEAN NOT NULL DEFAULT TRUE,
    tax_code VARCHAR(32),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_account_number UNIQUE (tenant_id, account_number)
);

CREATE INDEX IF NOT EXISTS idx_finance_coa_tenant_class ON finance.chart_of_accounts(tenant_id, account_class);

CREATE TABLE IF NOT EXISTS finance.journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    entry_number VARCHAR(64) NOT NULL,
    fiscal_period_id UUID NOT NULL REFERENCES finance.fiscal_periods(id),
    posting_date DATE NOT NULL,
    document_date DATE NOT NULL,
    source_module VARCHAR(32) NOT NULL CHECK (source_module IN ('GL_MANUAL', 'AP_INVOICE', 'AR_INVOICE', 'PAYROLL', 'WMS_INVENTORY', 'MES_MFG', 'AI_AUTONOMOUS')),
    source_document_ref VARCHAR(128),
    header_memo TEXT,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    exchange_rate NUMERIC(18, 8) NOT NULL DEFAULT 1.00000000,
    total_debit NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    total_credit NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'POSTED', 'REVERSED', 'VOID')),
    is_reversal BOOLEAN NOT NULL DEFAULT FALSE,
    reversal_of_entry_id UUID REFERENCES finance.journal_entries(id),
    created_by UUID NOT NULL REFERENCES core.users(id),
    approved_by UUID REFERENCES core.users(id),
    posted_at TIMESTAMPTZ,
    ai_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_journal_number UNIQUE (tenant_id, entry_number),
    CONSTRAINT chk_journal_balance CHECK (total_debit = total_credit)
);

CREATE INDEX IF NOT EXISTS idx_finance_je_tenant_date ON finance.journal_entries(tenant_id, posting_date);

CREATE TABLE IF NOT EXISTS finance.journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL REFERENCES finance.journal_entries(id) ON DELETE CASCADE,
    line_number INT NOT NULL,
    account_id UUID NOT NULL REFERENCES finance.chart_of_accounts(id),
    entry_side VARCHAR(6) NOT NULL CHECK (entry_side IN ('DEBIT', 'CREDIT')),
    amount_currency NUMERIC(18, 4) NOT NULL,
    amount_base_currency NUMERIC(18, 4) NOT NULL,
    line_memo TEXT,
    department_id UUID REFERENCES core.departments(id),
    cost_center_id UUID,
    project_id UUID,
    product_id UUID,
    vendor_id UUID,
    customer_id UUID,
    intercompany_partner_id UUID REFERENCES platform.tenants(id),
    reconciliation_status VARCHAR(32) NOT NULL DEFAULT 'UNRECONCILED' CHECK (reconciliation_status IN ('UNRECONCILED', 'CLEARED', 'RECONCILED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_je_line UNIQUE (journal_entry_id, line_number)
);

CREATE INDEX IF NOT EXISTS idx_finance_jel_account ON finance.journal_entry_lines(account_id);

CREATE TABLE IF NOT EXISTS finance.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    invoice_number VARCHAR(64) NOT NULL,
    invoice_type VARCHAR(20) NOT NULL CHECK (invoice_type IN ('ACCOUNTS_PAYABLE', 'ACCOUNTS_RECEIVABLE')),
    party_id UUID NOT NULL,
    party_name VARCHAR(255) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    exchange_rate NUMERIC(18, 8) NOT NULL DEFAULT 1.00000000,
    subtotal_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    tax_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    discount_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    total_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    paid_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'POSTED', 'PARTIALLY_PAID', 'PAID', 'DISPUTED', 'CANCELLED')),
    ocr_confidence_score NUMERIC(5, 4),
    raw_document_url VARCHAR(512),
    created_by UUID NOT NULL REFERENCES core.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_invoice_num UNIQUE (tenant_id, invoice_number, invoice_type)
);

CREATE TABLE IF NOT EXISTS finance.invoice_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES finance.invoices(id) ON DELETE CASCADE,
    line_number INT NOT NULL,
    item_sku VARCHAR(64),
    description TEXT NOT NULL,
    quantity NUMERIC(18, 4) NOT NULL DEFAULT 1.0000,
    unit_price NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    tax_rate NUMERIC(6, 4) NOT NULL DEFAULT 0.0000,
    tax_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    line_total NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    gl_account_id UUID NOT NULL REFERENCES finance.chart_of_accounts(id),
    cost_center_id UUID,
    purchase_order_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_invoice_line UNIQUE (invoice_id, line_number)
);
