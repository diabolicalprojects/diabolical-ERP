import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
    console.log('[DB] PostgreSQL connected');
});

pool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle pool client', err);
    process.exit(-1);
});

export default pool;
