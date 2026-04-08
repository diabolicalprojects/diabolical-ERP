/**
 * seed.js - ERP Diabolical
 * Crea el schema y un único usuario administrador.
 *
 * Uso:
 *   node backend/seed.js
 *
 * Variables de entorno requeridas (.env):
 *   DATABASE_URL=postgresql://user:password@host:5432/dbname
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
});

async function seed() {
    const client = await pool.connect();
    try {
        console.log('\n🔧 Realizando limpieza total y aplicando schema...\n');

        // --- Safety Lock ---
        if (!process.argv.includes('--force-reset')) {
            console.error('\n🛑 ERROR: Esta es una operación DESTRUCTIVA.');
            console.error('Para limpiar la base de datos y empezar de cero, ejecuta:');
            console.error('   node seed.js --force-reset\n');
            process.exit(1);
        }

        // --- Hard Reset ---
        await client.query(`DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO public; COMMENT ON SCHEMA public IS 'standard public schema';`);
        
        // --- Apply schema ---
        const schemaSQL = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
        await client.query(schemaSQL);
        console.log('✅ Base de datos limpia y schema aplicado correctamente.');

        // --- Create admin user ---
        const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@diabolical.ai';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Diabolical2024!';
        const adminName     = process.env.ADMIN_NAME     || 'Administrador Diabolical';

        // Check if admin already exists
        const existing = await client.query(
            'SELECT id FROM users WHERE email = $1',
            [adminEmail]
        );

        if (existing.rows.length > 0) {
            console.log(`ℹ️  Usuario administrador ya existe: ${adminEmail}`);
        } else {
            const hash = await bcrypt.hash(adminPassword, 12);
            await client.query(
                `INSERT INTO users (name, email, password, role, is_active)
                 VALUES ($1, $2, $3, 'admin', TRUE)`,
                [adminName, adminEmail, hash]
            );
            console.log(`✅ Usuario administrador creado:`);
            console.log(`   📧 Email   : ${adminEmail}`);
            console.log(`   🔑 Password: ${adminPassword}`);
            console.log(`   👤 Rol     : admin`);
        }

        // --- Create default quote settings ---
        const settingsExist = await client.query('SELECT id FROM quote_settings LIMIT 1');
        if (settingsExist.rows.length === 0) {
            await client.query(`
                INSERT INTO quote_settings (
                    company_name, company_address, company_rfc,
                    accent_color, tax_rate, footer_note,
                    signature_label_left, signature_label_right
                ) VALUES (
                    'DIABOLICAL AI',
                    'Av. de la Reforma 405, CDMX',
                    'DIA240101-XXX',
                    '#000000',
                    16,
                    'Esta cotización tiene una vigencia de 30 días naturales.',
                    'Gerente Comercial',
                    'Aceptación de Cliente'
                )
            `);
            console.log('✅ Configuración de cotizaciones creada.');
        }

        console.log('\n🚀 Seed completado exitosamente.\n');
    } catch (err) {
        console.error('\n❌ Error durante el seed:\n', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
