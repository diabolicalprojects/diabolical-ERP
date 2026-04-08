import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, Copy, Trash2, Plus, Key, Lock, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const ClientCredentialsVault = ({ client, onClose }) => {
    const { getClientCredentials, addClientCredential, revealCredential, deleteClientCredential, userRole } = useApp();
    const [credentials, setCredentials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [revealed, setRevealed] = useState({}); // { id: password }
    const [copying, setCopying] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newCred, setNewCred] = useState({ service_name: '', username: '', password: '' });

    const fetchCreds = async () => {
        setIsLoading(true);
        try {
            const data = await getClientCredentials(client.id);
            setCredentials(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCreds();
    }, [client.id]);

    const handleReveal = async (id) => {
        if (revealed[id]) {
            const newRevealed = { ...revealed };
            delete newRevealed[id];
            setRevealed(newRevealed);
            return;
        }
        try {
            const password = await revealCredential(id);
            setRevealed({ ...revealed, [id]: password });
            
            // Auto-hide after 30 seconds for security
            setTimeout(() => {
                setRevealed(prev => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                });
            }, 30000);
        } catch (err) {
            alert('Error al revelar contraseña. Verifica tus permisos.');
        }
    };

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopying(id);
        setTimeout(() => setCopying(null), 2000);
    };

    const handleAdd = async () => {
        if (!newCred.service_name || !newCred.password) return;
        try {
            await addClientCredential(client.id, newCred);
            setNewCred({ service_name: '', username: '', password: '' });
            setIsAdding(false);
            fetchCreds();
        } catch (err) {
            alert('Error al guardar credencial.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta credencial permanentemente?')) return;
        try {
            await deleteClientCredential(id);
            fetchCreds();
        } catch (err) {
            alert('Error al eliminar.');
        }
    };

    return (
        <div className="vault-panel" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="kpi-icon violet" style={{ width: '32px', height: '32px' }}><Shield size={16} /></div>
                    <h3 style={{ fontSize: '1.1rem' }}>Bóveda de Credenciales</h3>
                </div>
                {userRole === 'admin' && (
                    <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setIsAdding(!isAdding)}>
                        <Plus size={14} /> {isAdding ? 'Cancelar' : 'Nueva'}
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-card" 
                        style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--purple-main)' }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <input 
                                placeholder="Servicio (ej: AWS, Shopify, DB)" 
                                value={newCred.service_name} 
                                onChange={e => setNewCred({...newCred, service_name: e.target.value})}
                                style={{ width: '100%' }}
                            />
                            <input 
                                placeholder="Usuario / Email" 
                                value={newCred.username} 
                                onChange={e => setNewCred({...newCred, username: e.target.value})}
                                style={{ width: '100%' }}
                            />
                            <input 
                                type="password" 
                                placeholder="Contraseña" 
                                value={newCred.password} 
                                onChange={e => setNewCred({...newCred, password: e.target.value})}
                                style={{ width: '100%' }}
                            />
                            <button className="btn-primary" onClick={handleAdd} style={{ width: '100%', marginTop: '5px' }}>
                                <Lock size={14} /> Cifrar y Guardar
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {isLoading ? (
                <p className="subtitle" style={{ textAlign: 'center', padding: '2rem' }}>Auditando bóveda...</p>
            ) : credentials.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', opacity: 0.5 }}>
                    <Key size={40} style={{ marginBottom: '1rem' }} />
                    <p>No hay credenciales guardadas para este cliente.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {credentials.map(c => (
                        <div key={c.id} className="glass-card" style={{ padding: '12px', background: 'rgba(255,255,255,0.03)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <div>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--purple-main)' }}>{c.service_name}</span>
                                    <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{c.username || 'N/A'}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button 
                                        onClick={() => handleReveal(c.id)}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                        title={revealed[c.id] ? "Ocultar" : "Revelar"}
                                    >
                                        {revealed[c.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                    {userRole === 'admin' && (
                                        <button 
                                            onClick={() => handleDelete(c.id)}
                                            style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', opacity: 0.6 }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div style={{ 
                                background: 'rgba(0,0,0,0.2)', 
                                padding: '8px 12px', 
                                borderRadius: '8px', 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <code style={{ fontSize: '0.85rem', letterSpacing: revealed[c.id] ? '0' : '0.3em' }}>
                                    {revealed[c.id] ? revealed[c.id] : '••••••••••••'}
                                </code>
                                {revealed[c.id] && (
                                    <button 
                                        onClick={() => handleCopy(revealed[c.id], c.id)}
                                        style={{ background: 'none', border: 'none', color: copying === c.id ? 'var(--success)' : 'var(--purple-main)', cursor: 'pointer', padding: '4px' }}
                                    >
                                        {copying === c.id ? <Check size={14} /> : <Copy size={14} />}
                                    </button>
                                )}
                            </div>
                            <span style={{ fontSize: '0.65rem', opacity: 0.3, marginTop: '8px', display: 'block' }}>
                                Actualizado: {new Date(c.updated_at).toLocaleDateString()}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClientCredentialsVault;
