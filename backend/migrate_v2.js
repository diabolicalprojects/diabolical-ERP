import pool from './db.js';

const migrate = async () => {
    console.log('🚀 Iniciando migración de base de datos V2...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('--- Creando tabla audit_logs ---');
        await client.query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
                user_name   VARCHAR(120),
                action      VARCHAR(50) NOT NULL,
                resource    VARCHAR(50) NOT NULL,
                resource_id UUID,
                details     JSONB,
                created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);
        await client.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);');
        await client.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource, resource_id);');

        console.log('--- Creando tabla purchase_items ---');
        await client.query(`
            CREATE TABLE IF NOT EXISTS purchase_items (
                id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                purchase_id  UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
                item_ref_id  UUID,
                name         VARCHAR(200) NOT NULL,
                price        NUMERIC(14,2) NOT NULL DEFAULT 0,
                quantity     INT NOT NULL DEFAULT 1
            );
        `);
        await client.query('CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase ON purchase_items(purchase_id);');

        await client.query('COMMIT');
        console.log('✅ Migración completada exitosamente.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error durante la migración:', err.message);
    } finally {
        client.release();
        process.exit();
    }
};

migrate();
