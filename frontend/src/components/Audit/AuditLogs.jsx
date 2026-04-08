import React, { useState, useEffect } from 'react';
import { ShieldCheck, History, User, Tag, Clock, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import '../../styles/modules.css';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await api.get('/api/audit-logs');
                setLogs(res.data || []);
            } catch (err) {
                console.error('Error fetching logs:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => 
        log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE': return '#ffffff';
            case 'UPDATE': return '#cccccc';
            case 'DELETE': return '#ff3333';
            case 'REVEAL': return '#bb86fc';
            default: return 'var(--text-secondary)';
        }
    };

    if (loading) return <div className="loading">Cargando bitácora de auditoría...</div>;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="module-container"
        >
            <div className="module-header" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ShieldCheck size={28} /> Auditoría del Sistema
                    </h1>
                    <p style={{ opacity: 0.6 }}>Registro histórico de actividades críticas y remediaciones</p>
                </div>

                <div className="search-bar" style={{ maxWidth: '400px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.1rem 1rem' }}>
                    <Search size={18} opacity={0.4} />
                    <input 
                        type="text" 
                        placeholder="Buscar por usuario, acción o recurso..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'white', padding: '0.8rem', width: '100%' }}
                    />
                </div>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="diabolical-table">
                    <thead>
                        <tr>
                            <th><Clock size={14} /> Fecha y Hora</th>
                            <th><User size={14} /> Usuario</th>
                            <th><Tag size={14} /> Acción</th>
                            <th>Recurso</th>
                            <th>ID Recurso</th>
                            <th>Detalles</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map(log => (
                            <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                    {new Date(log.created_at).toLocaleString()}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--text-primary)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 'bold' }}>
                                            {log.user_name?.charAt(0)}
                                        </div>
                                        {log.user_name}
                                    </div>
                                </td>
                                <td>
                                    <span style={{ 
                                        fontSize: '0.7rem', 
                                        fontWeight: 'bold', 
                                        padding: '4px 8px', 
                                        borderRadius: '4px', 
                                        background: 'rgba(255,255,255,0.05)',
                                        color: getActionColor(log.action),
                                        border: `1px solid ${getActionColor(log.action)}33`
                                    }}>
                                        {log.action}
                                    </span>
                                </td>
                                <td style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>
                                    {log.resource}
                                </td>
                                <td style={{ fontSize: '0.7rem', opacity: 0.4, fontFamily: 'monospace' }}>
                                    {log.resource_id?.substring(0, 8)}...
                                </td>
                                <td style={{ fontSize: '0.8rem' }}>
                                    <code style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                        {JSON.stringify(log.details)}
                                    </code>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredLogs.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>
                        <History size={48} style={{ marginBottom: '1rem' }} />
                        <p>No se encontraron registros que coincidan con la búsqueda.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default AuditLogs;
