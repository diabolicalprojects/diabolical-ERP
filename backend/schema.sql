-- ============================================================
-- ERP DIABOLICAL - PostgreSQL Schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS & AUTH
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(120)  NOT NULL,
    email       VARCHAR(200)  UNIQUE NOT NULL,
    password    VARCHAR(255)  NOT NULL,  -- bcrypt hash
    role        VARCHAR(50)   NOT NULL DEFAULT 'vendedor',  -- admin | vendedor | almacen | finanzas
    is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(200)  NOT NULL,
    contact     VARCHAR(120),
    phone       VARCHAR(30),
    email       VARCHAR(200),
    address     TEXT,
    alt_contact VARCHAR(100),
    deals       INT           NOT NULL DEFAULT 0,
    status      VARCHAR(30)   NOT NULL DEFAULT 'activo',  -- activo | potencial | en_pausa | inactivo
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- VENDORS
-- ============================================================
CREATE TABLE IF NOT EXISTS vendors (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(200)  NOT NULL,
    contact     VARCHAR(120),
    email       VARCHAR(200),
    phone       VARCHAR(30),
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INVENTORY (Products)
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(200)  NOT NULL,
    sku         VARCHAR(80)   UNIQUE NOT NULL,
    price       NUMERIC(14,2) NOT NULL DEFAULT 0,
    stock       INT           NOT NULL DEFAULT 0,
    status      VARCHAR(20)   NOT NULL DEFAULT 'ok',  -- ok | low | out
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SERVICES
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(200)  NOT NULL,
    price       NUMERIC(14,2) NOT NULL DEFAULT 0,
    description TEXT,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PURCHASES (Órdenes de Compra)
-- ============================================================
CREATE TABLE IF NOT EXISTS purchases (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_no  VARCHAR(40)   UNIQUE NOT NULL,
    vendor_id    UUID          REFERENCES vendors(id) ON DELETE SET NULL,
    vendor_name  VARCHAR(200),
    total        NUMERIC(14,2) NOT NULL DEFAULT 0,
    status       VARCHAR(30)   NOT NULL DEFAULT 'pendiente',  -- pendiente | recibido | cancelado
    date         DATE          NOT NULL DEFAULT CURRENT_DATE,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_items (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id  UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    item_ref_id  UUID, -- Reference to inventory.id
    name         VARCHAR(200) NOT NULL,
    price        NUMERIC(14,2) NOT NULL DEFAULT 0,
    quantity     INT NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase ON purchase_items(purchase_id);

-- ============================================================
-- DEALS (Pipeline CRM)
-- ============================================================
CREATE TABLE IF NOT EXISTS deals (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company      VARCHAR(200)  NOT NULL,
    contact      VARCHAR(120),
    value        NUMERIC(14,2) NOT NULL DEFAULT 0,
    stage        VARCHAR(40)   NOT NULL DEFAULT 'nuevo',  -- nuevo | contactado | propuesta | negociacion | ganado | perdido
    days         INT           NOT NULL DEFAULT 0,
    won_date     DATE,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(200)  NOT NULL,
    client       VARCHAR(200),
    status       VARCHAR(30)   NOT NULL DEFAULT 'planeacion',  -- planeacion | en_curso | retrasado | finalizado
    progress     INT           NOT NULL DEFAULT 0,
    start_date   DATE,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TRACKING (Tareas de seguimiento)
-- ============================================================
CREATE TABLE IF NOT EXISTS tracking (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task         VARCHAR(300)  NOT NULL,
    target       VARCHAR(200),
    date         DATE,
    status       VARCHAR(20)   NOT NULL DEFAULT 'pendiente',  -- pendiente | completado
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RECEIVABLES (Cuentas por Cobrar)
-- ============================================================
CREATE TABLE IF NOT EXISTS receivables (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_no   VARCHAR(40)   UNIQUE NOT NULL,
    client       VARCHAR(200)  NOT NULL,
    amount       NUMERIC(14,2) NOT NULL DEFAULT 0,
    paid         NUMERIC(14,2) NOT NULL DEFAULT 0,
    due_date     DATE,
    status       VARCHAR(20)   NOT NULL DEFAULT 'pendiente',  -- pendiente | parcial | pagado | vencido
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PAYABLES (Cuentas por Pagar)
-- ============================================================
CREATE TABLE IF NOT EXISTS payables (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_no   VARCHAR(40)   UNIQUE NOT NULL,
    concept      VARCHAR(300)  NOT NULL,
    vendor_name  VARCHAR(200),
    amount       NUMERIC(14,2) NOT NULL DEFAULT 0,
    status       VARCHAR(20)   NOT NULL DEFAULT 'pendiente',  -- pendiente | pagado | vencido
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- QUOTES (Cotizaciones)
-- ============================================================
CREATE TABLE IF NOT EXISTS quotes (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_no     VARCHAR(40)   UNIQUE NOT NULL,
    customer     VARCHAR(200)  NOT NULL,
    date         DATE          NOT NULL DEFAULT CURRENT_DATE,
    amount       NUMERIC(14,2) NOT NULL DEFAULT 0,
    status       VARCHAR(20)   NOT NULL DEFAULT 'draft',  -- draft | sent | accepted | rejected
    seller       VARCHAR(120),
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quote_items (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id     UUID          NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    item_ref_id  VARCHAR(80),
    name         VARCHAR(200)  NOT NULL,
    price        NUMERIC(14,2) NOT NULL DEFAULT 0,
    quantity     INT           NOT NULL DEFAULT 1,
    type         VARCHAR(20)   NOT NULL DEFAULT 'product'  -- product | service
);

-- ============================================================
-- QUOTE PRESETS
-- ============================================================
CREATE TABLE IF NOT EXISTS quote_presets (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(200)  NOT NULL,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quote_preset_items (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    preset_id    UUID          NOT NULL REFERENCES quote_presets(id) ON DELETE CASCADE,
    item_ref_id  VARCHAR(80),
    name         VARCHAR(200)  NOT NULL,
    price        NUMERIC(14,2) NOT NULL DEFAULT 0,
    quantity     INT           NOT NULL DEFAULT 1,
    type         VARCHAR(20)   NOT NULL DEFAULT 'product'
);

-- ============================================================
-- QUOTE SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS quote_settings (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name          VARCHAR(200)  NOT NULL DEFAULT 'DIABOLICAL AI',
    company_address       TEXT,
    company_rfc           VARCHAR(50),
    accent_color          VARCHAR(20)   DEFAULT '#000000',
    tax_rate              NUMERIC(5,2)  DEFAULT 16,
    footer_note           TEXT,
    signature_label_left  VARCHAR(100)  DEFAULT 'Gerente Comercial',
    signature_label_right VARCHAR(100)  DEFAULT 'Aceptación de Cliente',
    logo_url              TEXT,
    updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_customers_status       ON customers(status);
CREATE INDEX IF NOT EXISTS idx_deals_stage            ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_quotes_status          ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_receivables_status     ON receivables(status);
CREATE INDEX IF NOT EXISTS idx_payables_status        ON payables(status);
CREATE INDEX IF NOT EXISTS idx_inventory_status       ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_purchases_status       ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote      ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_preset_items_preset    ON quote_preset_items(preset_id);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name   VARCHAR(120),
    action      VARCHAR(50) NOT NULL, -- CREATE | UPDATE | DELETE | LOGIN
    resource    VARCHAR(50) NOT NULL, -- customers | inventory | quotes | etc
    resource_id UUID,
    details     JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user     ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource, resource_id);

-- ============================================================
-- CLIENT CREDENTIALS VAULT (Bóveda Segura)
-- ============================================================
CREATE TABLE IF NOT EXISTS client_credentials (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id        UUID REFERENCES customers(id) ON DELETE CASCADE,
    service_name     VARCHAR(200) NOT NULL,
    username         VARCHAR(200),
    encrypted_pass   TEXT NOT NULL,
    iv               TEXT NOT NULL,
    auth_tag         TEXT NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_credentials_client ON client_credentials(client_id);
