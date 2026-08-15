-- ============================================================================
-- MIGRATION 001: INITIAL PLATFORM & CORE IDENTITY SCHEMAS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ----------------------------------------------------------------------------
-- SCHEMA: PLATFORM (Global System Master Data)
-- ----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS platform;

CREATE TABLE IF NOT EXISTS platform.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_slug VARCHAR(64) UNIQUE NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    tax_identifier VARCHAR(64) NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    base_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    isolation_tier VARCHAR(32) NOT NULL DEFAULT 'SHARED_SCHEMA' CHECK (isolation_tier IN ('SHARED_SCHEMA', 'DEDICATED_SCHEMA', 'DEDICATED_DATABASE')),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PROVISIONING', 'ACTIVE', 'SUSPENDED', 'DECOMMISSIONED')),
    config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    ai_governance_policy JSONB NOT NULL DEFAULT '{"auto_approval_max_amount": 5000, "require_human_in_the_loop": true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_tenants_slug ON platform.tenants(tenant_slug);

-- ----------------------------------------------------------------------------
-- SCHEMA: CORE (Tenant Identity & Access Management)
-- ----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS core;

CREATE TABLE IF NOT EXISTS core.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    department_code VARCHAR(32) NOT NULL,
    department_name VARCHAR(128) NOT NULL,
    parent_department_id UUID REFERENCES core.departments(id),
    cost_center_code VARCHAR(64),
    manager_user_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_dept_code UNIQUE (tenant_id, department_code)
);

CREATE TABLE IF NOT EXISTS core.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(128) NOT NULL,
    last_name VARCHAR(128) NOT NULL,
    department_id UUID REFERENCES core.departments(id),
    job_title VARCHAR(128),
    role_key VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INVITED', 'LOCKED', 'DEACTIVATED')),
    mfa_enforced BOOLEAN NOT NULL DEFAULT TRUE,
    security_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_user_email UNIQUE (tenant_id, email)
);

CREATE INDEX IF NOT EXISTS idx_core_users_tenant_role ON core.users(tenant_id, role_key);

CREATE TABLE IF NOT EXISTS core.transactional_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    aggregate_type VARCHAR(64) NOT NULL,
    aggregate_id VARCHAR(128) NOT NULL,
    event_type VARCHAR(128) NOT NULL,
    payload_json JSONB NOT NULL,
    headers_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    dispatched_at TIMESTAMPTZ,
    retry_count INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED'))
);

CREATE INDEX IF NOT EXISTS idx_outbox_pending ON core.transactional_outbox(created_at) WHERE status = 'PENDING';

CREATE TABLE IF NOT EXISTS core.enterprise_knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    document_title VARCHAR(255) NOT NULL,
    document_category VARCHAR(64) NOT NULL,
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding_vector vector(1536) NOT NULL,
    metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Initial default system seed
INSERT INTO platform.tenants (id, tenant_slug, legal_name, tax_identifier, country_code, base_currency)
VALUES ('00000000-0000-0000-0000-000000000001', 'demo-enterprise', 'ALGOLSOFT Enterprise Demo Corp', 'US-991827364', 'US', 'USD')
ON CONFLICT (tenant_slug) DO NOTHING;
