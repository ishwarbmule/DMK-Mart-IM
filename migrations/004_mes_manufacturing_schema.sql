-- ============================================================================
-- MIGRATION 004: MES MANUFACTURING & MRP-II SCHEMAS
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS mes;

CREATE TABLE IF NOT EXISTS mes.work_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    work_center_code VARCHAR(32) NOT NULL,
    work_center_name VARCHAR(128) NOT NULL,
    department_id UUID REFERENCES core.departments(id),
    hourly_rate NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    capacity_hours_per_day NUMERIC(5, 2) NOT NULL DEFAULT 16.00,
    efficiency_percentage NUMERIC(5, 2) NOT NULL DEFAULT 95.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_tenant_work_center UNIQUE (tenant_id, work_center_code)
);

CREATE TABLE IF NOT EXISTS mes.bill_of_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    bom_number VARCHAR(64) NOT NULL,
    item_id UUID NOT NULL REFERENCES wms.items(id),
    revision VARCHAR(16) NOT NULL DEFAULT 'A',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    yield_percentage NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_bom_rev UNIQUE (tenant_id, item_id, revision)
);

CREATE TABLE IF NOT EXISTS mes.bom_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bom_id UUID NOT NULL REFERENCES mes.bill_of_materials(id) ON DELETE CASCADE,
    component_item_id UUID NOT NULL REFERENCES wms.items(id),
    quantity_required NUMERIC(18, 6) NOT NULL CHECK (quantity_required > 0),
    scrap_factor_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    position_index INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS mes.work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    work_order_number VARCHAR(64) NOT NULL,
    item_id UUID NOT NULL REFERENCES wms.items(id),
    bom_id UUID NOT NULL REFERENCES mes.bill_of_materials(id),
    planned_qty NUMERIC(18, 4) NOT NULL CHECK (planned_qty > 0),
    completed_qty NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    scrapped_qty NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'RELEASED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_wo_number UNIQUE (tenant_id, work_order_number)
);

CREATE TABLE IF NOT EXISTS mes.work_order_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES mes.work_orders(id) ON DELETE CASCADE,
    operation_sequence INT NOT NULL,
    operation_name VARCHAR(128) NOT NULL,
    work_center_id UUID NOT NULL REFERENCES mes.work_centers(id),
    setup_hours NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    run_hours_per_unit NUMERIC(8, 4) NOT NULL DEFAULT 0.0000,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_SETUP', 'RUNNING', 'COMPLETED', 'INTERRUPTED')),
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
