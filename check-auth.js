import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

async function check() {
    try {
        console.log('Checking database users...');
        const res = await pool.query('SELECT name, email, role FROM users');
        console.log('Users found:', res.rows.length);
        console.table(res.rows);
    } catch (err) {
        console.error('Error checking users:', err.message);
    } finally {
        await pool.end();
    }
}

check();
