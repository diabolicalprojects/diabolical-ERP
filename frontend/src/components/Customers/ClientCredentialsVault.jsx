import React, { useState, useEffect } from 'react';
import { X, Shield, Key, Eye, EyeOff, Trash2, Plus, Loader, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ClientCredentialsVault = ({ isOpen, onClose, clientId, clientName }) => {
    const [credentials, setCredentials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [revealing, setRevealing] = useState(null); // id of credential being revealed
    const [copied, setCopied] = useState(null);

    const [newCred, setNewCred] = useState({
        service_name: '',
        username: '',
        password_plain: '',
        notes: ''
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const fetchCredentials = async () => {
        if (!clientId) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/clients/${clientId}/credentials`);
            const data = await res.json();
            setCredentials(data);
        } catch (error) {
            console.error('Error fetching credentials:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && clientId) {
            fetchCredentials();
        }
    }, [isOpen, clientId]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/clients/${clientId}/credentials`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCred)
            });
            if (res.ok) {
                setIsAdding(false);
                setNewCred({ service_name: '', username: '', password_plain: '', notes: '' });
                fetchCredentials();
            }
        } catch (error) {
            console.error('Error creating credential:', error);
        }
    };

    const handleReveal = async (id) => {
        setRevealing(id);
        try {
            const res = await fetch(`${API_URL}/api/credentials/${id}/reveal`);
            const data = await res.json();
            if (data.password) {
                setCredentials(prev => prev.map(c => 
                    c.credential_id === id ? { ...c, revealedPassword: data.password } : c
                ));
            }
        } catch (error) {
            console.error('Error revealing password:', error);
        } finally {
            setRevealing(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta credencial?')) return;
        try {
            const res = await fetch(`${API_URL}/api/credentials/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchCredentials();
            }
        } catch (error) {
            console.error('Error deleting credential:', error);
        }
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay modal-center" onClick={onClose} style={{ zIndex: 11000 }}>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="modal-content-centered glass-card"
                style={{ maxWidth: '650px', width: '95%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: '#7c3aed', padding: '10px', borderRadius: '12px', color: 'white' }}>
                            <Shield size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Bóveda de Credenciales</h2>
                            <p className="subtitle" style={{ margin: 0 }}>{clientName || 'Cliente'}</p>
                        </div>
                    </div>
                    <button className="icon-btn" onClick={onClose}><X /></button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px', marginBottom: '1.5rem' }}>
                    {isAdding ? (
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Nueva Credencial</h3>
                            <div className="input-group">
                                <label>Servicio (ej. Hosting, DB, Correo)</label>
                                <input required value={newCred.service_name} onChange={e => setNewCred({ ...newCred, service_name: e.target.value })} placeholder="Ej. AWS, GoDaddy..." />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label>Usuario / Email</label>
                                    <input required value={newCred.username} onChange={e => setNewCred({ ...newCred, username: e.target.value })} placeholder="admin@example.com" />
                                </div>
                                <div className="input-group">
                                    <label>Contraseña</label>
                                    <input required type="password" value={newCred.password_plain} onChange={e => setNewCred({ ...newCred, password_plain: e.target.value })} placeholder="••••••••" />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Notas Adicionales</label>
                                <input value={newCred.notes} onChange={e => setNewCred({ ...newCred, notes: e.target.value })} placeholder="URL de acceso, IP, etc." />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsAdding(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Guardar en Bóveda</button>
                            </div>
                        </form>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>{credentials.length} credenciales almacenadas</span>
                                <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setIsAdding(true)}>
                                    <Plus size={16} /> Agregar Nueva
                                </button>
                            </div>

                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                                    <Loader className="animate-spin" />
                                </div>
                            ) : credentials.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem 1rem', opacity: 0.3 }}>
                                    <Key size={48} style={{ marginBottom: '1rem' }} />
                                    <p>No hay credenciales registradas para este cliente.</p>
                                </div>
                            ) : (
                                credentials.map(c => (
                                    <div key={c.credential_id} className="glass-card" style={{ padding: '1.25rem', border: '1px solid var(--glass-border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {c.service_name}
                                                    <span style={{ fontSize: '0.7rem', background: 'rgba(124, 58, 237, 0.1)', color: '#a78bfa', padding: '2px 6px', borderRadius: '4px' }}>Cifrado AES-256</span>
                                                </h4>
                                                <p style={{ fontSize: '0.9rem', margin: '4px 0', opacity: 0.8 }}><strong>Usuario:</strong> {c.username}</p>
                                                {c.notes && <p style={{ fontSize: '0.8rem', opacity: 0.5, margin: 0 }}>{c.notes}</p>}
                                            </div>
                                            <button className="icon-btn" style={{ color: 'var(--error)' }} onClick={() => handleDelete(c.credential_id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-black)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                                            <div style={{ flex: 1, fontFamily: 'monospace', letterSpacing: '0.1em', fontSize: '0.9rem' }}>
                                                {c.revealedPassword ? c.revealedPassword : '••••••••••••••••'}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {c.revealedPassword ? (
                                                    <>
                                                        <button 
                                                            className="icon-btn" 
                                                            onClick={() => copyToClipboard(c.revealedPassword, c.credential_id)}
                                                            style={{ color: copied === c.credential_id ? '#10b981' : 'inherit' }}
                                                        >
                                                            {copied === c.credential_id ? <Check size={16} /> : <Copy size={16} />}
                                                        </button>
                                                        <button className="icon-btn" onClick={() => setCredentials(prev => prev.map(item => item.credential_id === c.credential_id ? { ...item, revealedPassword: null } : item))}>
                                                            <EyeOff size={16} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button className="icon-btn" onClick={() => handleReveal(c.credential_id)} disabled={revealing === c.credential_id}>
                                                        {revealing === c.credential_id ? <Loader size={16} className="animate-spin" /> : <Eye size={16} />}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div style={{ background: 'rgba(124, 58, 237, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(124, 58, 237, 0.15)', display: 'flex', gap: '12px' }}>
                    <Shield size={20} style={{ color: '#7c3aed', flexShrink: 0 }} />
                    <p style={{ fontSize: '0.75rem', opacity: 0.8, margin: 0, lineHeight: 1.4 }}>
                        <strong>Seguridad Nivel Bancario:</strong> Todas las contraseñas se cifran con <strong>AES-256-GCM</strong> antes de guardarse. Solo el servidor puede descifrarlas bajo demanda. Cada acceso es auditado.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ClientCredentialsVault;
