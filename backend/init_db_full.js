import pool from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initDb = async () => {
    console.log('🚀 Iniciando configuración TOTAL de la base de datos...');
    const client = await pool.connect();
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('--- Ejecutando schema.sql ---');
        await client.query(schemaSql);
        
        console.log('✅ Base de datos inicializada correctamente.');
    } catch (err) {
        console.error('❌ Error durante la inicialización:', err.message);
    } finally {
        client.release();
        process.exit();
    }
};

initDb();
