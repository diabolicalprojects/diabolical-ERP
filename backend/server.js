/**
 * server.js - ERP Diabolical Backend
 * API REST sobre PostgreSQL
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from './db.js';

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_MASTER_KEY 
    ? Buffer.from(process.env.ENCRYPTION_MASTER_KEY, 'hex') 
    : crypto.randomBytes(32); // Fallback for dev, but in prod a real key must be provided
const ALGO = 'aes-256-gcm';

const encryptText = (text) => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGO, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return { encrypted, iv: iv.toString('hex'), authTag };
};

const decryptText = (encrypted, ivHex, authTagHex) => {
    const decipher = crypto.createDecipheriv(ALGO, ENCRYPTION_KEY, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};


const app  = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'diabolical_jwt_secret_change_in_prod';

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────
const allowedOrigins = [
    process.env.CORS_ORIGIN,
    'http://localhost:5173',
    'http://localhost:3000',
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS bloqueado para origen: ${origin}`));
    },
    credentials: true,
}));
app.use(express.json());

// ─────────────────────────────────────────────
// Auth Middleware
// ─────────────────────────────────────────────
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Token requerido' });

    const token = authHeader.split(' ')[1];
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso restringido a administradores' });
    }
    next();
};

// ─────────────────────────────────────────────
// Helper: generic paginated list
// ─────────────────────────────────────────────
const paginatedQuery = async (res, sql, params = [], countSql = null, countParams = []) => {
    try {
        const { rows } = await pool.query(sql, params);
        res.json({ data: rows });
    } catch (err) {
        console.error(err);
    }
};

// ─────────────────────────────────────────────
// Helper: Audit Logging
// ─────────────────────────────────────────────
const auditLog = async (req, action, resource, resourceId, details = null) => {
    try {
        await pool.query(
            `INSERT INTO audit_logs (user_id, user_name, action, resource, resource_id, details)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [req.user?.id, req.user?.name, action, resource, resourceId, details]
        );
    } catch (err) {
        console.error('Audit Log Error:', err.message);
    }
};

// ─────────────────────────────────────────────
// HEALTH
// ─────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok', db: 'connected' });
    } catch {
        res.status(500).json({ status: 'error', db: 'disconnected' });
    }
});

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });

    try {
        const { rows } = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND is_active = TRUE',
            [email]
        );
        const user = rows[0];
        if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });

        // Audit login
        auditLog({ user }, 'LOGIN', 'users', user.id);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.get('/api/auth/me', authenticate, (req, res) => {
    res.json({ user: req.user });
});

// ─────────────────────────────────────────────
// USERS (admin only)
// ─────────────────────────────────────────────
app.get('/api/users', authenticate, requireAdmin, async (_req, res) => {
    paginatedQuery(res, 'SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC');
});

app.post('/api/users', authenticate, requireAdmin, async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role)
        return res.status(400).json({ error: 'Todos los campos son requeridos' });

    try {
        const hash = await bcrypt.hash(password, 12);
        const { rows } = await pool.query(
            `INSERT INTO users (name, email, password, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, email, role, is_active, created_at`,
            [name, email, hash, role]
        );
        auditLog(req, 'CREATE', 'users', rows[0].id, { email, role });
        res.status(201).json(rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: 'Email ya registrado' });
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.patch('/api/users/:id', authenticate, requireAdmin, async (req, res) => {
    const { name, role, is_active } = req.body;
    try {
        const { rows } = await pool.query(
            `UPDATE users SET
                name      = COALESCE($1, name),
                role      = COALESCE($2, role),
                is_active = COALESCE($3, is_active),
                updated_at = NOW()
             WHERE id = $4
             RETURNING id, name, email, role, is_active`,
            [name, role, is_active, req.params.id]
        );
        if (!rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' });
        auditLog(req, 'UPDATE', 'users', req.params.id, { name, role, is_active });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.delete('/api/users/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        // Protect the only admin
        const { rows } = await pool.query(
            `SELECT COUNT(*) FROM users WHERE role = 'admin' AND is_active = TRUE`
        );
        const { rowCount } = await pool.query(
            `SELECT 1 FROM users WHERE id = $1 AND role = 'admin'`,
            [req.params.id]
        );
        if (rowCount > 0 && parseInt(rows[0].count) <= 1) {
            return res.status(400).json({ error: 'No puedes eliminar el único administrador' });
        }
        await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        auditLog(req, 'DELETE', 'users', req.params.id);
        res.json({ message: 'Usuario eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

// ─────────────────────────────────────────────
// CUSTOMERS
// ─────────────────────────────────────────────
app.get('/api/customers', authenticate, async (_req, res) => {
    paginatedQuery(res, 'SELECT * FROM customers ORDER BY created_at DESC');
});

app.post('/api/customers', authenticate, async (req, res) => {
    const { name, contact, phone, email, address, alt_contact, status } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre es requerido' });
    try {
        const { rows } = await pool.query(
            `INSERT INTO customers (name, contact, phone, email, address, alt_contact, status)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
            [name, contact, phone, email, address, alt_contact, status || 'activo']
        );
        auditLog(req, 'CREATE', 'customers', rows[0].id, { name });
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.put('/api/customers/:id', authenticate, async (req, res) => {
    const { name, contact, phone, email, address, alt_contact, deals, status } = req.body;
    try {
        const { rows } = await pool.query(
            `UPDATE customers SET
                name        = COALESCE($1, name),
                contact     = COALESCE($2, contact),
                phone       = COALESCE($3, phone),
                email       = COALESCE($4, email),
                address     = COALESCE($5, address),
                alt_contact = COALESCE($6, alt_contact),
                deals       = COALESCE($7, deals),
                status      = COALESCE($8, status),
                updated_at  = NOW()
             WHERE id = $9 RETURNING *`,
            [name, contact, phone, email, address, alt_contact, deals, status, req.params.id]
        );
        if (!rows[0]) return res.status(404).json({ error: 'Cliente no encontrado' });
        auditLog(req, 'UPDATE', 'customers', req.params.id, { name, status });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.delete('/api/customers/:id', authenticate, async (req, res) => {
    await pool.query('DELETE FROM customers WHERE id = $1', [req.params.id]);
    auditLog(req, 'DELETE', 'customers', req.params.id);
    res.json({ message: 'Cliente eliminado' });
});

// ─────────────────────────────────────────────
// CLIENT CREDENTIALS VAULT
// ─────────────────────────────────────────────
app.get('/api/customers/:id/credentials', authenticate, async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT id, client_id, service_name, username, created_at, updated_at 
             FROM client_credentials WHERE client_id = $1 ORDER BY created_at DESC`,
            [req.params.id]
        );
        res.json({ data: rows });
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.post('/api/customers/:id/credentials', authenticate, requireAdmin, async (req, res) => {
    const { service_name, username, password } = req.body;
    if (!service_name || !password) return res.status(400).json({ error: 'Servicio y contraseña son requeridos' });
    try {
        const { encrypted, iv, authTag } = encryptText(password);
        const { rows } = await pool.query(
            `INSERT INTO client_credentials (client_id, service_name, username, encrypted_pass, iv, auth_tag)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, client_id, service_name, username, created_at`,
            [req.params.id, service_name, username, encrypted, iv, authTag]
        );
        auditLog(req, 'CREATE', 'client_credentials', rows[0].id, { client_id: req.params.id, service: service_name });
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.get('/api/credentials/:id/reveal', authenticate, async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT encrypted_pass, iv, auth_tag, client_id, service_name FROM client_credentials WHERE id = $1`,
            [req.params.id]
        );
        if (!rows[0]) return res.status(404).json({ error: 'Credencial no encontrada' });
        
        const decrypted = decryptText(rows[0].encrypted_pass, rows[0].iv, rows[0].auth_tag);
        auditLog(req, 'REVEAL', 'client_credentials', req.params.id, { client_id: rows[0].client_id, service: rows[0].service_name });
        
        res.json({ password: decrypted });
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.delete('/api/credentials/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const { rows } = await pool.query('DELETE FROM client_credentials WHERE id = $1 RETURNING client_id, service_name', [req.params.id]);
        if (rows[0]) {
            auditLog(req, 'DELETE', 'client_credentials', req.params.id, { client_id: rows[0].client_id, service: rows[0].service_name });
        }
        res.json({ message: 'Credencial eliminada' });
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

// ─────────────────────────────────────────────
// VENDORS
// ─────────────────────────────────────────────
app.get('/api/vendors', authenticate, async (_req, res) => {
    paginatedQuery(res, 'SELECT * FROM vendors ORDER BY name ASC');
});

app.post('/api/vendors', authenticate, async (req, res) => {
    const { name, contact, email, phone } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre es requerido' });
    try {
        const { rows } = await pool.query(
            `INSERT INTO vendors (name, contact, email, phone) VALUES ($1,$2,$3,$4) RETURNING *`,
            [name, contact, email, phone]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.put('/api/vendors/:id', authenticate, async (req, res) => {
    const { name, contact, email, phone } = req.body;
    try {
        const { rows } = await pool.query(
            `UPDATE vendors SET
                name = COALESCE($1, name),
                contact = COALESCE($2, contact),
                email = COALESCE($3, email),
                phone = COALESCE($4, phone),
                updated_at = NOW()
             WHERE id = $5 RETURNING *`,
            [name, contact, email, phone, req.params.id]
        );
        if (!rows[0]) return res.status(404).json({ error: 'Proveedor no encontrado' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.delete('/api/vendors/:id', authenticate, async (req, res) => {
    await pool.query('DELETE FROM vendors WHERE id = $1', [req.params.id]);
    res.json({ message: 'Proveedor eliminado' });
});

// ─────────────────────────────────────────────
// INVENTORY
// ─────────────────────────────────────────────
app.get('/api/inventory', authenticate, async (_req, res) => {
    paginatedQuery(res, 'SELECT * FROM inventory ORDER BY name ASC');
});

app.post('/api/inventory', authenticate, async (req, res) => {
    const { name, sku, price, stock, status } = req.body;
    if (!name || !sku) return res.status(400).json({ error: 'Nombre y SKU son requeridos' });
    try {
        const { rows } = await pool.query(
            `INSERT INTO inventory (name, sku, price, stock, status)
             VALUES ($1,$2,$3,$4,$5) RETURNING *`,
            [name, sku, price || 0, stock || 0, status || 'ok']
        );
        auditLog(req, 'CREATE', 'inventory', rows[0].id, { sku, stock });
        res.status(201).json(rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: 'SKU ya registrado' });
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.put('/api/inventory/:id', authenticate, async (req, res) => {
    const { name, sku, price, stock, status } = req.body;
    try {
        const { rows } = await pool.query(
            `UPDATE inventory SET
                name = COALESCE($1, name),
                sku  = COALESCE($2, sku),
                price = COALESCE($3, price),
                stock = COALESCE($4, stock),
                status = COALESCE($5, status),
                updated_at = NOW()
             WHERE id = $6 RETURNING *`,
            [name, sku, price, stock, status, req.params.id]
        );
        if (!rows[0]) return res.status(404).json({ error: 'Producto no encontrado' });
        auditLog(req, 'UPDATE', 'inventory', req.params.id, { sku, stock, status });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.delete('/api/inventory/:id', authenticate, async (req, res) => {
    await pool.query('DELETE FROM inventory WHERE id = $1', [req.params.id]);
    auditLog(req, 'DELETE', 'inventory', req.params.id);
    res.json({ message: 'Producto eliminado' });
});

// ─────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────
app.get('/api/services', authenticate, async (_req, res) => {
    paginatedQuery(res, 'SELECT * FROM services ORDER BY name ASC');
});

app.post('/api/services', authenticate, async (req, res) => {
    const { name, price, description } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre es requerido' });
    try {
        const { rows } = await pool.query(
            `INSERT INTO services (name, price, description) VALUES ($1,$2,$3) RETURNING *`,
            [name, price || 0, description]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.put('/api/services/:id', authenticate, async (req, res) => {
    const { name, price, description } = req.body;
    try {
        const { rows } = await pool.query(
            `UPDATE services SET
                name = COALESCE($1, name),
                price = COALESCE($2, price),
                description = COALESCE($3, description),
                updated_at = NOW()
             WHERE id = $4 RETURNING *`,
            [name, price, description, req.params.id]
        );
        if (!rows[0]) return res.status(404).json({ error: 'Servicio no encontrado' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.delete('/api/services/:id', authenticate, async (req, res) => {
    await pool.query('DELETE FROM services WHERE id = $1', [req.params.id]);
    res.json({ message: 'Servicio eliminado' });
});

// ─────────────────────────────────────────────
// PURCHASES
// ─────────────────────────────────────────────
app.get('/api/purchases', authenticate, async (_req, res) => {
    paginatedQuery(res, `
        SELECT p.*, v.name AS vendor_display_name
        FROM purchases p
        LEFT JOIN vendors v ON v.id = p.vendor_id
        ORDER BY p.date DESC
    `);
});

app.post('/api/purchases', authenticate, async (req, res) => {
    const { purchase_no, vendor_id, vendor_name, total, status, date, items = [] } = req.body;
    if (!purchase_no) return res.status(400).json({ error: 'Número de orden requerido' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { rows } = await client.query(
            `INSERT INTO purchases (purchase_no, vendor_id, vendor_name, total, status, date)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
            [purchase_no, vendor_id, vendor_name, total || 0, status || 'pendiente', date || new Date()]
        );
        const purchase = rows[0];
        
        for (const item of items) {
            await client.query(
                `INSERT INTO purchase_items (purchase_id, item_ref_id, name, price, quantity)
                 VALUES ($1, $2, $3, $4, $5)`,
                [purchase.id, item.item_ref_id, item.name, item.price, item.quantity]
            );
        }
        
        await client.query('COMMIT');
        auditLog(req, 'CREATE', 'purchases', purchase.id, { purchase_no, items_count: items.length });
        res.status(201).json(purchase);
    } catch (err) {
        await client.query('ROLLBACK');
        if (err.code === '23505') return res.status(409).json({ error: 'Número de orden duplicado' });
        res.status(500).json({ error: 'Error interno', detail: err.message });
    } finally {
        client.release();
    }
});

app.patch('/api/purchases/:id/receive', authenticate, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Verificar si ya fue recibida
        const { rows: check } = await client.query('SELECT status FROM purchases WHERE id = $1', [req.params.id]);
        if (!check.length) return res.status(404).json({ error: 'Orden no encontrada' });
        if (check[0].status === 'recibido') return res.status(400).json({ error: 'La orden ya fue recibida previamente' });

        const { rows } = await client.query(
            `UPDATE purchases SET status = 'recibido', updated_at = NOW()
             WHERE id = $1 RETURNING *`,
            [req.params.id]
        );
        const purchase = rows[0];

        // Sincronizar inventario
        const { rows: items } = await client.query('SELECT * FROM purchase_items WHERE purchase_id = $1', [purchase.id]);
        for (const item of items) {
            if (item.item_ref_id) {
                await client.query(
                    `UPDATE inventory SET stock = stock + $1, updated_at = NOW() WHERE id = $2`,
                    [item.quantity, item.item_ref_id]
                );
            }
        }

        await client.query('COMMIT');
        auditLog(req, 'RECEIVE', 'purchases', purchase.id, { purchase_no: purchase.purchase_no });
        res.json(purchase);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'Error interno', detail: err.message });
    } finally {
        client.release();
    }
});

app.delete('/api/purchases/:id', authenticate, async (req, res) => {
    await pool.query('DELETE FROM purchases WHERE id = $1', [req.params.id]);
    res.json({ message: 'Compra eliminada' });
});

// ─────────────────────────────────────────────
// DEALS (Pipeline)
// ─────────────────────────────────────────────
app.get('/api/deals', authenticate, async (_req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM deals ORDER BY created_at DESC');
        // Group by stage for frontend compatibility
        const grouped = {
            nuevo: [], contactado: [], propuesta: [], negociacion: [], ganado: [], perdido: []
        };
        rows.forEach(d => {
            if (grouped[d.stage] !== undefined) grouped[d.stage].push(d);
        });
        res.json({ data: rows, grouped });
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.post('/api/deals', authenticate, async (req, res) => {
    const { company, contact, value, stage } = req.body;
    if (!company) return res.status(400).json({ error: 'La empresa es requerida' });
    try {
        const { rows } = await pool.query(
            `INSERT INTO deals (company, contact, value, stage)
             VALUES ($1,$2,$3,$4) RETURNING *`,
            [company, contact, value || 0, stage || 'nuevo']
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.patch('/api/deals/:id/stage', authenticate, async (req, res) => {
    const { stage } = req.body;
    if (!stage) return res.status(400).json({ error: 'Stage requerido' });
    try {
        const won_date = stage === 'ganado' ? new Date() : null;
        const { rows } = await pool.query(
            `UPDATE deals SET stage = $1, won_date = $2, updated_at = NOW()
             WHERE id = $3 RETURNING *`,
            [stage, won_date, req.params.id]
        );
        if (!rows[0]) return res.status(404).json({ error: 'Deal no encontrado' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.delete('/api/deals/:id', authenticate, async (req, res) => {
    await pool.query('DELETE FROM deals WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deal eliminado' });
});

// ─────────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────────
app.get('/api/projects', authenticate, async (_req, res) => {
    paginatedQuery(res, 'SELECT * FROM projects ORDER BY created_at DESC');
});

app.post('/api/projects', authenticate, async (req, res) => {
    const { name, client, status, progress, start_date } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre es requerido' });
    try {
        const { rows } = await pool.query(
            `INSERT INTO projects (name, client, status, progress, start_date)
             VALUES ($1,$2,$3,$4,$5) RETURNING *`,
            [name, client, status || 'planeacion', progress || 0, start_date]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.put('/api/projects/:id', authenticate, async (req, res) => {
    const { name, client, status, progress, start_date } = req.body;
    try {
        const { rows } = await pool.query(
            `UPDATE projects SET
                name = COALESCE($1, name),
                client = COALESCE($2, client),
                status = COALESCE($3, status),
                progress = COALESCE($4, progress),
                start_date = COALESCE($5, start_date),
                updated_at = NOW()
             WHERE id = $6 RETURNING *`,
            [name, client, status, progress, start_date, req.params.id]
        );
        if (!rows[0]) return res.status(404).json({ error: 'Proyecto no encontrado' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.delete('/api/projects/:id', authenticate, async (req, res) => {
    await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.json({ message: 'Proyecto eliminado' });
});

// ─────────────────────────────────────────────
// TRACKING
// ─────────────────────────────────────────────
app.get('/api/tracking', authenticate, async (_req, res) => {
    paginatedQuery(res, 'SELECT * FROM tracking ORDER BY date ASC, created_at DESC');
});

app.post('/api/tracking', authenticate, async (req, res) => {
    const { task, target, date, status } = req.body;
    if (!task) return res.status(400).json({ error: 'La tarea es requerida' });
    try {
        const { rows } = await pool.query(
            `INSERT INTO tracking (task, target, date, status) VALUES ($1,$2,$3,$4) RETURNING *`,
            [task, target, date, status || 'pendiente']
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.patch('/api/tracking/:id/toggle', authenticate, async (req, res) => {
    try {
        const { rows } = await pool.query(
            `UPDATE tracking SET
                status = CASE WHEN status = 'completado' THEN 'pendiente' ELSE 'completado' END,
                updated_at = NOW()
             WHERE id = $1 RETURNING *`,
            [req.params.id]
        );
        if (!rows[0]) return res.status(404).json({ error: 'Tarea no encontrada' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.delete('/api/tracking/:id', authenticate, async (req, res) => {
    await pool.query('DELETE FROM tracking WHERE id = $1', [req.params.id]);
    res.json({ message: 'Tarea eliminada' });
});

// ─────────────────────────────────────────────
// RECEIVABLES (CxC)
// ─────────────────────────────────────────────
app.get('/api/receivables', authenticate, async (_req, res) => {
    paginatedQuery(res, 'SELECT * FROM receivables ORDER BY due_date ASC');
});

app.post('/api/receivables', authenticate, async (req, res) => {
    const { invoice_no, client, amount, paid, due_date, status } = req.body;
    if (!invoice_no || !client) return res.status(400).json({ error: 'Número de factura y cliente requeridos' });
    try {
        const { rows } = await pool.query(
            `INSERT INTO receivables (invoice_no, client, amount, paid, due_date, status)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
            [invoice_no, client, amount || 0, paid || 0, due_date, status || 'pendiente']
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: 'Número de factura duplicado' });
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.patch('/api/receivables/:id/pay', authenticate, async (req, res) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Monto inválido' });
    try {
        // Validación de negocio contra sobrepagos
        const { rows: current } = await pool.query('SELECT amount, paid, status FROM receivables WHERE id = $1', [req.params.id]);
        if (!current.length) return res.status(404).json({ error: 'Factura no encontrada' });
        
        const invoice = current[0];
        const remaining = Number(invoice.amount) - Number(invoice.paid);
        
        if (amount > remaining) {
            return res.status(400).json({ error: `El abono excede el saldo pendiente (${remaining})` });
        }

        const { rows } = await pool.query(
            `UPDATE receivables SET
                paid = paid + $1,
                status = CASE
                    WHEN (paid + $1) >= amount THEN 'pagado'
                    WHEN status = 'vencido' THEN 'vencido'
                    WHEN (paid + $1) > 0 THEN 'parcial'
                    ELSE status END,
                updated_at = NOW()
             WHERE id = $2 RETURNING *`,
            [amount, req.params.id]
        );
        
        auditLog(req, 'UPDATE', 'receivables', req.params.id, { payment_amount: amount, new_balance: rows[0].amount - rows[0].paid });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.delete('/api/receivables/:id', authenticate, async (req, res) => {
    await pool.query('DELETE FROM receivables WHERE id = $1', [req.params.id]);
    res.json({ message: 'Cuenta eliminada' });
});

// ─────────────────────────────────────────────
// PAYABLES (CxP)
// ─────────────────────────────────────────────
app.get('/api/payables', authenticate, async (_req, res) => {
    paginatedQuery(res, 'SELECT * FROM payables ORDER BY created_at DESC');
});

app.post('/api/payables', authenticate, async (req, res) => {
    const { expense_no, concept, vendor_name, amount, status } = req.body;
    if (!expense_no || !concept) return res.status(400).json({ error: 'Número de gasto y concepto requeridos' });
    try {
        const { rows } = await pool.query(
            `INSERT INTO payables (expense_no, concept, vendor_name, amount, status)
             VALUES ($1,$2,$3,$4,$5) RETURNING *`,
            [expense_no, concept, vendor_name, amount || 0, status || 'pendiente']
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: 'Número de gasto duplicado' });
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.patch('/api/payables/:id/pay', authenticate, async (req, res) => {
    try {
        const { rows } = await pool.query(
            `UPDATE payables SET status = 'pagado', updated_at = NOW() WHERE id = $1 RETURNING *`,
            [req.params.id]
        );
        if (!rows[0]) return res.status(404).json({ error: 'Cuenta no encontrada' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.delete('/api/payables/:id', authenticate, async (req, res) => {
    await pool.query('DELETE FROM payables WHERE id = $1', [req.params.id]);
    res.json({ message: 'Cuenta eliminada' });
});

// ─────────────────────────────────────────────
// QUOTES
// ─────────────────────────────────────────────
app.get('/api/quotes', authenticate, async (_req, res) => {
    try {
        const { rows: quotes } = await pool.query(
            'SELECT * FROM quotes ORDER BY date DESC'
        );
        const quotesWithItems = await Promise.all(quotes.map(async (q) => {
            const { rows: items } = await pool.query(
                'SELECT * FROM quote_items WHERE quote_id = $1',
                [q.id]
            );
            return { ...q, items };
        }));
        res.json({ data: quotesWithItems });
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.get('/api/quotes/:id', authenticate, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM quotes WHERE id = $1', [req.params.id]);
        if (!rows[0]) return res.status(404).json({ error: 'Cotización no encontrada' });
        const { rows: items } = await pool.query(
            'SELECT * FROM quote_items WHERE quote_id = $1',
            [req.params.id]
        );
        res.json({ ...rows[0], items });
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.post('/api/quotes', authenticate, async (req, res) => {
    const { quote_no, customer, date, amount, status, seller, items = [] } = req.body;
    if (!quote_no || !customer) return res.status(400).json({ error: 'Número y cliente requeridos' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { rows } = await client.query(
            `INSERT INTO quotes (quote_no, customer, date, amount, status, seller)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
            [quote_no, customer, date || new Date(), amount || 0, status || 'draft', seller]
        );
        const quote = rows[0];
        for (const item of items) {
            await client.query(
                `INSERT INTO quote_items (quote_id, item_ref_id, name, price, quantity, type)
                 VALUES ($1,$2,$3,$4,$5,$6)`,
                [quote.id, item.id, item.name, item.price, item.quantity, item.type || 'product']
            );
        }
        await client.query('COMMIT');
        const { rows: createdItems } = await pool.query(
            'SELECT * FROM quote_items WHERE quote_id = $1', [quote.id]
        );
        res.status(201).json({ ...quote, items: createdItems });
    } catch (err) {
        await client.query('ROLLBACK');
        if (err.code === '23505') return res.status(409).json({ error: 'Número de cotización duplicado' });
        res.status(500).json({ error: 'Error interno', detail: err.message });
    } finally {
        client.release();
    }
});

app.patch('/api/quotes/:id/status', authenticate, async (req, res) => {
    const { status } = req.body;
    try {
        const { rows } = await pool.query(
            `UPDATE quotes SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
            [status, req.params.id]
        );
        if (!rows[0]) return res.status(404).json({ error: 'Cotización no encontrada' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.delete('/api/quotes/:id', authenticate, async (req, res) => {
    await pool.query('DELETE FROM quotes WHERE id = $1', [req.params.id]);
    res.json({ message: 'Cotización eliminada' });
});

// ─────────────────────────────────────────────
// QUOTE PRESETS
// ─────────────────────────────────────────────
app.get('/api/quote-presets', authenticate, async (_req, res) => {
    try {
        const { rows: presets } = await pool.query('SELECT * FROM quote_presets ORDER BY name ASC');
        const result = await Promise.all(presets.map(async (p) => {
            const { rows: items } = await pool.query(
                'SELECT * FROM quote_preset_items WHERE preset_id = $1', [p.id]
            );
            return { ...p, items };
        }));
        res.json({ data: result });
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.post('/api/quote-presets', authenticate, async (req, res) => {
    const { name, items = [] } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre es requerido' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { rows } = await client.query(
            `INSERT INTO quote_presets (name) VALUES ($1) RETURNING *`, [name]
        );
        const preset = rows[0];
        for (const item of items) {
            await client.query(
                `INSERT INTO quote_preset_items (preset_id, item_ref_id, name, price, quantity, type)
                 VALUES ($1,$2,$3,$4,$5,$6)`,
                [preset.id, item.id, item.name, item.price, item.quantity, item.type || 'product']
            );
        }
        await client.query('COMMIT');
        const { rows: createdItems } = await pool.query(
            'SELECT * FROM quote_preset_items WHERE preset_id = $1', [preset.id]
        );
        res.status(201).json({ ...preset, items: createdItems });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'Error interno', detail: err.message });
    } finally {
        client.release();
    }
});

app.delete('/api/quote-presets/:id', authenticate, async (req, res) => {
    await pool.query('DELETE FROM quote_presets WHERE id = $1', [req.params.id]);
    res.json({ message: 'Preset eliminado' });
});

// ─────────────────────────────────────────────
// QUOTE SETTINGS
// ─────────────────────────────────────────────
app.get('/api/quote-settings', authenticate, async (_req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM quote_settings LIMIT 1');
        res.json(rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

app.put('/api/quote-settings', authenticate, requireAdmin, async (req, res) => {
    const {
        company_name, company_address, company_rfc, accent_color,
        tax_rate, footer_note, signature_label_left, signature_label_right, logo_url
    } = req.body;
    try {
        const existing = await pool.query('SELECT id FROM quote_settings LIMIT 1');
        let result;
        if (existing.rows.length === 0) {
            result = await pool.query(
                `INSERT INTO quote_settings (company_name, company_address, company_rfc, accent_color,
                    tax_rate, footer_note, signature_label_left, signature_label_right, logo_url)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
                [company_name, company_address, company_rfc, accent_color,
                    tax_rate, footer_note, signature_label_left, signature_label_right, logo_url]
            );
        } else {
            result = await pool.query(
                `UPDATE quote_settings SET
                    company_name = COALESCE($1, company_name),
                    company_address = COALESCE($2, company_address),
                    company_rfc = COALESCE($3, company_rfc),
                    accent_color = COALESCE($4, accent_color),
                    tax_rate = COALESCE($5, tax_rate),
                    footer_note = COALESCE($6, footer_note),
                    signature_label_left = COALESCE($7, signature_label_left),
                    signature_label_right = COALESCE($8, signature_label_right),
                    logo_url = COALESCE($9, logo_url),
                    updated_at = NOW()
                 WHERE id = $10 RETURNING *`,
                [company_name, company_address, company_rfc, accent_color,
                    tax_rate, footer_note, signature_label_left, signature_label_right,
                    logo_url, existing.rows[0].id]
            );
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

// ─────────────────────────────────────────────
// AUDIT LOGS
// ─────────────────────────────────────────────
app.get('/api/audit-logs', authenticate, requireAdmin, async (_req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200`
        );
        res.json({ data: rows });
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

// ─────────────────────────────────────────────
// METRICS (Dashboard stats)
// ─────────────────────────────────────────────
app.get('/api/metrics/summary', authenticate, async (_req, res) => {
    try {
        const [pipeline, cxc, cxp, quotesAccepted] = await Promise.all([
            pool.query(`SELECT COALESCE(SUM(value), 0) AS total FROM deals WHERE stage NOT IN ('perdido')`),
            pool.query(`SELECT COALESCE(SUM(amount - paid), 0) AS total FROM receivables WHERE status != 'pagado'`),
            pool.query(`SELECT COALESCE(SUM(amount), 0) AS total FROM payables WHERE status = 'pendiente'`),
            pool.query(`SELECT COALESCE(SUM(amount), 0) AS total FROM quotes WHERE status = 'accepted'`),
        ]);
        res.json({
            pipeline:        parseFloat(pipeline.rows[0].total),
            cxc_pending:     parseFloat(cxc.rows[0].total),
            cxp_pending:     parseFloat(cxp.rows[0].total),
            quotes_accepted: parseFloat(quotesAccepted.rows[0].total),
        });
    } catch (err) {
        res.status(500).json({ error: 'Error interno', detail: err.message });
    }
});

// ─────────────────────────────────────────────
// 404 Fallback
// ─────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Ruta ${req.method} ${req.path} no encontrada` });
});

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 ERP Diabolical API → http://localhost:${PORT}`);
    console.log(`   Entorno: ${process.env.NODE_ENV || 'development'}\n`);
});

export default app;
