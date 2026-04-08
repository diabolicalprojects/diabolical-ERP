import React, { useState } from 'react';
import { Search, Plus, User, Phone, Mail, X, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import ModuleTutorial from '../Common/ModuleTutorial';
import ClientCredentialsVault from './ClientCredentialsVault';


const Customers = () => {
    const { customers, customerStatuses, addCustomer, updateCustomer, deleteCustomer } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newCust, setNewCust] = useState({ name: '', contact: '', phone: '', email: '', status: 'potencial', address: '', altContact: '' });
    const [selectedClient, setSelectedClient] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const tutorialSteps = [
        "Usa la barra superior para filtrar clientes por nombre o empresa.",
        "Haz clic en 'Ver Perfil' para abrir la ficha técnica lateral.",
        "Los colores indican el estatus comercial de cada cuenta.",
        "Puedes eliminar o editar clientes directamente desde su perfil."
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'activo': return 'var(--success)';
            case 'potencial': return 'var(--purple-main)';
            case 'en_pausa': return 'var(--warning)';
            default: return 'var(--text-secondary)';
        }
    };

    const handleSave = () => {
        addCustomer({ ...newCust, id: Date.now().toString(), deals: 0 });
        setIsModalOpen(false);
        setNewCust({ name: '', contact: '', phone: '', email: '', status: 'potencial', address: '', altContact: '' });
    };

    const handleUpdate = () => {
        updateCustomer(selectedClient.id, selectedClient);
        setIsEditing(false);
    };

    const filteredCustomers = (customers || []).filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contact.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade">
            <header className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <h1>Directorio de Clientes</h1>
                        <p className="subtitle">Gestión centralizada de contactos</p>
                    </div>
                    <ModuleTutorial
                        title="Clientes"
                        description="Mantén el control de tus clientes y analiza su estatus desde un solo lugar."
                        steps={tutorialSteps}
                    />
                </div>
                <div className="header-actions">
                    <div className="search-bar-wrapper">
                        <Search className="search-bar-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> Nuevo Cliente
                    </button>
                </div>
            </header>

            <div className="customer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {filteredCustomers.map((c) => (
                    <div key={c.id} className="glass-card">
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="avatar" style={{ width: '50px', height: '50px', background: 'var(--glass)', border: `2px solid ${getStatusColor(c.status)}` }}>
                                <User size={24} />
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <h4 style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{c.name}</h4>
                                <p className="subtitle">{c.contact}</p>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '8px' }}><Phone size={14} /> {c.phone}</div>
                            <div style={{ display: 'flex', gap: '8px' }}><Mail size={14} /> {c.email}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="status-badge" style={{ background: `${getStatusColor(c.status)}20`, color: getStatusColor(c.status) }}>{c.status}</span>
                            <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setSelectedClient(c)}>Ver Perfil</button>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {selectedClient && (
                    <div className="modal-overlay modal-side" onClick={() => setSelectedClient(null)}>
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 20 }}
                            className="modal-content-container"
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                                    <h2>Ficha del Cliente</h2>
                                    <button className="btn-secondary" onClick={() => setSelectedClient(null)} style={{ padding: '0.5rem' }}><X size={20} /></button>
                                </div>

                                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                                    <div className="avatar" style={{ width: '80px', height: '80px', margin: '0 auto 1rem', background: 'var(--glass)', border: `3px solid ${getStatusColor(selectedClient.status)}` }}>
                                        <User size={40} />
                                    </div>
                                    {isEditing ? (
                                        <input style={{ fontSize: '1.5rem', width: '100%', textAlign: 'center', background: 'transparent', border: 'none', color: 'var(--text-primary)', borderBottom: '1px solid var(--glass-border)' }} value={selectedClient.name} onChange={e => setSelectedClient({ ...selectedClient, name: e.target.value })} />
                                    ) : (
                                        <h3 style={{ fontSize: '1.5rem' }}>{selectedClient.name}</h3>
                                    )}
                                    {isEditing ? (
                                        <input style={{ width: '100%', textAlign: 'center', background: 'transparent', border: 'none', color: 'var(--text-secondary)', borderBottom: '1px solid var(--glass-border)', marginTop: '5px' }} value={selectedClient.contact} onChange={e => setSelectedClient({ ...selectedClient, contact: e.target.value })} />
                                    ) : (
                                        <p className="subtitle">{selectedClient.contact}</p>
                                    )}
                                </div>

                                <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ marginBottom: '1rem' }}>Contacto</h4>
                                    {isEditing ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <input style={{ width: '100%' }} type="text" placeholder="Teléfono" value={selectedClient.phone} onChange={e => setSelectedClient({ ...selectedClient, phone: e.target.value })} />
                                            <input style={{ width: '100%' }} type="text" placeholder="Email" value={selectedClient.email} onChange={e => setSelectedClient({ ...selectedClient, email: e.target.value })} />
                                            <input style={{ width: '100%' }} type="text" placeholder="Dirección" value={selectedClient.address || ''} onChange={e => setSelectedClient({ ...selectedClient, address: e.target.value })} />
                                            <input style={{ width: '100%' }} type="text" placeholder="Otro Medio Contacto" value={selectedClient.altContact || ''} onChange={e => setSelectedClient({ ...selectedClient, altContact: e.target.value })} />
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                                            <div style={{ display: 'flex', gap: '10px' }}><Phone size={16} opacity={0.6} /> {selectedClient.phone}</div>
                                            <div style={{ display: 'flex', gap: '10px' }}><Mail size={16} opacity={0.6} /> {selectedClient.email}</div>
                                            {selectedClient.address && <div style={{ display: 'flex', gap: '10px' }}>📍 {selectedClient.address}</div>}
                                            {selectedClient.altContact && <div style={{ display: 'flex', gap: '10px' }}>💬 {selectedClient.altContact}</div>}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div className="glass-card" style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tratos</p>
                                        <h4>{selectedClient.deals}</h4>
                                    </div>
                                    <div className="glass-card" style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Saldo</p>
                                        <h4>$0</h4>
                                    </div>
                                </div>

                                {/* Bóveda de Credenciales */}
                                <ClientCredentialsVault client={selectedClient} />

                                <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>

                                    <button className="btn-secondary" style={{ flex: 1, color: 'var(--error)' }} onClick={() => { deleteCustomer(selectedClient.id); setSelectedClient(null); }}>
                                        <Trash2 size={18} /> Eliminar
                                    </button>
                                    {isEditing ? (
                                        <button className="btn-primary" style={{ flex: 1.5 }} onClick={handleUpdate}>Guardar Cambios</button>
                                    ) : (
                                        <button className="btn-primary" style={{ flex: 1.5 }} onClick={() => setIsEditing(true)}>Editar Cliente</button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal-overlay modal-center" onClick={() => setIsModalOpen(false)}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            className="modal-content-centered"
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 style={{ marginBottom: '1.5rem' }}>Añadir Cliente</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Nombre Empresa</label>
                                    <input style={{ width: '100%' }} type="text" value={newCust.name} onChange={e => setNewCust({ ...newCust, name: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Contacto</label>
                                    <input style={{ width: '100%' }} type="text" value={newCust.contact} onChange={e => setNewCust({ ...newCust, contact: e.target.value })} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Teléfono</label>
                                        <input style={{ width: '100%' }} type="text" value={newCust.phone} onChange={e => setNewCust({ ...newCust, phone: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Email</label>
                                        <input style={{ width: '100%' }} type="email" value={newCust.email} onChange={e => setNewCust({ ...newCust, email: e.target.value })} />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Dirección</label>
                                        <input style={{ width: '100%' }} type="text" value={newCust.address} onChange={e => setNewCust({ ...newCust, address: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Medio de Contacto (Opcional)</label>
                                        <input style={{ width: '100%' }} type="text" placeholder="Ej: WhatsApp, Skype" value={newCust.altContact} onChange={e => setNewCust({ ...newCust, altContact: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Estatus</label>
                                        <select style={{ width: '100%', background: '#111', color: 'white' }} value={newCust.status} onChange={e => setNewCust({ ...newCust, status: e.target.value })}>
                                            {customerStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button className="btn-primary" style={{ flex: 1 }} onClick={handleSave}>Guardar</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Customers;
