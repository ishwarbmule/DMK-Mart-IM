-- ============================================================================
-- MIGRATION 005: HCM HUMAN CAPITAL & GLOBAL PAYROLL SCHEMAS
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS hcm;

CREATE TABLE IF NOT EXISTS hcm.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    employee_code VARCHAR(32) NOT NULL,
    user_id UUID REFERENCES core.users(id),
    first_name VARCHAR(128) NOT NULL,
    last_name VARCHAR(128) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(16),
    hire_date DATE NOT NULL,
    termination_date DATE,
    department_id UUID REFERENCES core.departments(id),
    job_title VARCHAR(128) NOT NULL,
    manager_employee_id UUID REFERENCES hcm.employees(id),
    employment_type VARCHAR(32) NOT NULL DEFAULT 'FULL_TIME' CHECK (employment_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'INTERN')),
    employment_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (employment_status IN ('ACTIVE', 'ON_LEAVE', 'TERMINATED', 'RETIRED')),
    base_salary_annual NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    salary_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    pay_frequency VARCHAR(16) NOT NULL DEFAULT 'BI_WEEKLY' CHECK (pay_frequency IN ('WEEKLY', 'BI_WEEKLY', 'SEMI_MONTHLY', 'MONTHLY')),
    bank_iban_encrypted TEXT,
    tax_identifier_encrypted TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_employee_code UNIQUE (tenant_id, employee_code)
);

CREATE TABLE IF NOT EXISTS hcm.payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    payroll_run_number VARCHAR(64) NOT NULL,
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    payment_disbursement_date DATE NOT NULL,
    total_gross_pay NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    total_tax_withheld NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    total_deductions NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    total_net_pay NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'CALCULATED', 'AUDITED', 'APPROVED', 'DISBURSED', 'VOID')),
    journal_entry_id UUID REFERENCES finance.journal_entries(id),
    created_by UUID NOT NULL REFERENCES core.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_payroll_run UNIQUE (tenant_id, payroll_run_number)
);

CREATE TABLE IF NOT EXISTS hcm.payroll_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_id UUID NOT NULL REFERENCES hcm.payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES hcm.employees(id),
    gross_earnings NUMERIC(18, 4) NOT NULL,
    pre_tax_deductions NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    taxable_wage_base NUMERIC(18, 4) NOT NULL,
    statutory_tax_withheld NUMERIC(18, 4) NOT NULL,
    post_tax_deductions NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    net_payout NUMERIC(18, 4) NOT NULL,
    calculation_breakdown_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
