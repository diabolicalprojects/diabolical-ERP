import pool from './db.js';
import bcrypt from 'bcryptjs';

const resetDb = async () => {
    console.log('⚠️ Iniciando RESET TOTAL de la base de datos...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('--- Truncando tablas ---');
        // This drops all data but keeps the structure
        await client.query(`
            TRUNCATE TABLE 
                users, customers, vendors, inventory, services, 
                purchases, purchase_items, deals, projects, 
                tracking, receivables, payables, quotes, 
                quote_items, quote_presets, quote_preset_items, 
                audit_logs
            CASCADE;
        `);
        console.log('✅ Base de datos truncada.');

        console.log('--- Creando usuario administrador ---');
        const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@diabolical.ai';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Diabolical2024!';
        const adminName     = process.env.ADMIN_NAME     || 'Administrador Diabolical';
        const hash = await bcrypt.hash(adminPassword, 12);
        
        await client.query(
            `INSERT INTO users (name, email, password, role, is_active)
             VALUES ($1, $2, $3, 'admin', TRUE)`,
            [adminName, adminEmail, hash]
        );
        console.log(`✅ Usuario administrador creado: ${adminEmail}`);

        await client.query('COMMIT');
        console.log('🚀 Reset completado exitosamente. Todo está en blanco y listo.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error durante el reset:', err.message);
    } finally {
        client.release();
        process.exit();
    }
};

resetDb();
