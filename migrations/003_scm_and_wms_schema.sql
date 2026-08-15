-- ============================================================================
-- MIGRATION 003: SCM PROCUREMENT & WMS INVENTORY SCHEMAS
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS scm;
CREATE SCHEMA IF NOT EXISTS wms;

-- SCM VENDORS
CREATE TABLE IF NOT EXISTS scm.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    vendor_code VARCHAR(64) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(64) NOT NULL,
    payment_terms VARCHAR(32) NOT NULL DEFAULT 'NET_30',
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    rating_score NUMERIC(5, 2) DEFAULT 100.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    bank_account_iban VARCHAR(64),
    bank_swift_bic VARCHAR(32),
    contact_email VARCHAR(255),
    address_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_vendor_code UNIQUE (tenant_id, vendor_code)
);

-- SCM PURCHASE REQUISITIONS
CREATE TABLE IF NOT EXISTS scm.purchase_requisitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    requisition_number VARCHAR(64) NOT NULL,
    requested_by UUID NOT NULL REFERENCES core.users(id),
    department_id UUID REFERENCES core.departments(id),
    requisition_date DATE NOT NULL,
    estimated_total NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    justification TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PO_CREATED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_pr_number UNIQUE (tenant_id, requisition_number)
);

-- SCM PURCHASE ORDERS
CREATE TABLE IF NOT EXISTS scm.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    po_number VARCHAR(64) NOT NULL,
    vendor_id UUID NOT NULL REFERENCES scm.vendors(id),
    requisition_id UUID REFERENCES scm.purchase_requisitions(id),
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    subtotal_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    tax_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    total_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'ISSUED', 'PARTIALLY_RECEIVED', 'FULFILLED', 'CANCELLED')),
    created_by UUID NOT NULL REFERENCES core.users(id),
    approved_by UUID REFERENCES core.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_po_number UNIQUE (tenant_id, po_number)
);

CREATE TABLE IF NOT EXISTS scm.purchase_order_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES scm.purchase_orders(id) ON DELETE CASCADE,
    line_number INT NOT NULL,
    item_sku VARCHAR(64) NOT NULL,
    item_description TEXT NOT NULL,
    ordered_qty NUMERIC(18, 4) NOT NULL CHECK (ordered_qty > 0),
    received_qty NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    invoiced_qty NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    unit_price NUMERIC(18, 4) NOT NULL CHECK (unit_price >= 0),
    tax_rate NUMERIC(6, 4) NOT NULL DEFAULT 0.0000,
    line_total NUMERIC(18, 4) NOT NULL,
    gl_account_id UUID REFERENCES finance.chart_of_accounts(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_po_line UNIQUE (purchase_order_id, line_number)
);

-- WMS WAREHOUSES
CREATE TABLE IF NOT EXISTS wms.warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    warehouse_code VARCHAR(32) NOT NULL,
    warehouse_name VARCHAR(128) NOT NULL,
    address_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_warehouse_code UNIQUE (tenant_id, warehouse_code)
);

-- WMS LOCATIONS
CREATE TABLE IF NOT EXISTS wms.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES wms.warehouses(id) ON DELETE CASCADE,
    zone_code VARCHAR(16) NOT NULL,
    aisle_code VARCHAR(16) NOT NULL,
    rack_code VARCHAR(16) NOT NULL,
    shelf_code VARCHAR(16) NOT NULL,
    bin_code VARCHAR(16) NOT NULL,
    location_barcode VARCHAR(64) UNIQUE NOT NULL,
    is_quarantine_location BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- WMS ITEMS
CREATE TABLE IF NOT EXISTS wms.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    sku VARCHAR(64) NOT NULL,
    barcode_gtin VARCHAR(64),
    item_name VARCHAR(255) NOT NULL,
    item_type VARCHAR(32) NOT NULL CHECK (item_type IN ('RAW_MATERIAL', 'WIP_SUBASSEMBLY', 'FINISHED_GOOD', 'SERVICE', 'MRO_SUPPLY')),
    inventory_uom VARCHAR(16) NOT NULL DEFAULT 'EA',
    valuation_method VARCHAR(16) NOT NULL DEFAULT 'AVCO' CHECK (valuation_method IN ('STANDARD', 'AVCO', 'FIFO', 'LIFO')),
    standard_cost NUMERIC(18, 4) DEFAULT 0.0000,
    average_cost NUMERIC(18, 4) DEFAULT 0.0000,
    safety_stock_qty NUMERIC(18, 4) DEFAULT 0.0000,
    reorder_point_qty NUMERIC(18, 4) DEFAULT 0.0000,
    lead_time_days INT DEFAULT 7,
    is_lot_tracked BOOLEAN NOT NULL DEFAULT FALSE,
    is_serial_tracked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_item_sku UNIQUE (tenant_id, sku)
);

-- WMS STOCK QUANTS
CREATE TABLE IF NOT EXISTS wms.stock_quants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES wms.items(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES wms.locations(id),
    lot_number VARCHAR(64),
    serial_number VARCHAR(128),
    quantity_on_hand NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    quantity_reserved NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    quantity_available NUMERIC(18, 4) GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
    expiry_date DATE,
    quarantine_status VARCHAR(32) NOT NULL DEFAULT 'RELEASED' CHECK (quarantine_status IN ('RELEASED', 'UNDER_INSPECTION', 'QUARANTINED', 'SCRAP')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_positive_qty CHECK (quantity_on_hand >= 0 AND quantity_reserved >= 0)
);

CREATE INDEX IF NOT EXISTS idx_wms_quants_lookup ON wms.stock_quants(tenant_id, item_id, location_id);
