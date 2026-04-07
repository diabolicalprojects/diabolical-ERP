import React, { useState } from 'react';
import { ShoppingBag, Truck, CheckCircle, Search, Plus, Trash2, PackageCheck, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import ModuleTutorial from '../Common/ModuleTutorial';

const Purchases = () => {
    const { purchases, vendors, receiveOrder, setPurchases, setVendors } = useApp();
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'vendors'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newOrder, setNewOrder] = useState({ vendor: '', total: '' });
    const [newVendor, setNewVendor] = useState({ name: '', contact: '', email: '' });

    const tutorialSteps = [
        "Gestiona tus proveedores en la pestaña dedicada.",
        "Crea órdenes de compra para reabastecer inventario.",
        "Usa el botón 'Recibir' para formalizar la entrada de mercancía.",
        "El inventario se actualizará automáticamente al recibir."
    ];

    const handleAddOrder = () => {
        const order = {
            id: `PO-${Math.floor(Math.random() * 9000) + 1000}`,
            vendor: newOrder.vendor,
            date: new Date().toISOString().split('T')[0],
            total: parseFloat(newOrder.total) || 0,
            status: 'pendiente'
        };
        setPurchases([order, ...purchases]);
        setIsModalOpen(false);
        setNewOrder({ vendor: '', total: '' });
    };

    const handleAddVendor = () => {
        const vendor = {
            id: `V${vendors.length + 1}`,
            ...newVendor
        };
        setVendors([vendor, ...vendors]);
        setIsModalOpen(false);
        setNewVendor({ name: '', contact: '', email: '' });
    };

    return (
        <div className="animate-fade">
            <header className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <h1>Compras y Suministros</h1>
                        <p className="subtitle">Gestión de proveedores y órdenes de compra</p>
                    </div>
                    <ModuleTutorial
                        title="Compras"
                        description="Controla el abastecimiento y la relación con tus proveedores."
                        steps={tutorialSteps}
                    />
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={() => setActiveTab(activeTab === 'orders' ? 'vendors' : 'orders')}>
                        {activeTab === 'orders' ? <Truck size={18} /> : <ShoppingBag size={18} />}
                        {activeTab === 'orders' ? 'Ver Proveedores' : 'Ver Órdenes'}
                    </button>
                    <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> {activeTab === 'orders' ? 'Nueva Orden' : 'Nuevo Proveedor'}
                    </button>
                </div>
            </header>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                {activeTab === 'orders' ? (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Folio</th>
                                <th>Proveedor</th>
                                <th>Fecha</th>
                                <th>Total</th>
                                <th>Estatus</th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.map(p => (
                                <tr key={p.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--purple-light)' }}>{p.id}</td>
                                    <td>{p.vendor}</td>
                                    <td style={{ opacity: 0.7 }}>{p.date}</td>
                                    <td>${p.total.toLocaleString()}</td>
                                    <td>
                                        <span className={`status-badge ${p.status === 'recibido' ? 'success' : 'warning'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        {p.status !== 'recibido' && (
                                            <button
                                                className="btn-secondary"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', gap: '4px' }}
                                                onClick={() => receiveOrder(p.id)}
                                            >
                                                <PackageCheck size={14} /> Recibir
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Contacto</th>
                                <th>Email</th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendors.map(v => (
                                <tr key={v.id}>
                                    <td style={{ fontWeight: 600 }}>{v.name}</td>
                                    <td>{v.contact}</td>
                                    <td style={{ opacity: 0.7 }}>{v.email}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="btn-secondary" style={{ padding: '0.4rem', color: 'var(--error)', borderColor: 'transparent' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal-overlay modal-center" onClick={() => setIsModalOpen(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="modal-content-centered"
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h2>{activeTab === 'orders' ? 'Generar Orden de Compra' : 'Registrar Proveedor'}</h2>
                                <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                            </div>

                            {activeTab === 'orders' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Seleccionar Proveedor</label>
                                        <select
                                            style={{ width: '100%' }}
                                            value={newOrder.vendor}
                                            onChange={e => setNewOrder({ ...newOrder, vendor: e.target.value })}
                                        >
                                            <option value="">Selecciona un proveedor...</option>
                                            {vendors.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Total Estimado ($)</label>
                                        <input
                                            style={{ width: '100%' }}
                                            type="number"
                                            value={newOrder.total}
                                            onChange={e => setNewOrder({ ...newOrder, total: e.target.value })}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                        <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                        <button className="btn-primary" style={{ flex: 1 }} onClick={handleAddOrder}>Crear Orden</button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Nombre Empresa / Razón Social</label>
                                        <input
                                            style={{ width: '100%' }}
                                            type="text"
                                            value={newVendor.name}
                                            onChange={e => setNewVendor({ ...newVendor, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Persona de Contacto</label>
                                        <input
                                            style={{ width: '100%' }}
                                            type="text"
                                            value={newVendor.contact}
                                            onChange={e => setNewVendor({ ...newVendor, contact: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Email</label>
                                        <input
                                            style={{ width: '100%' }}
                                            type="email"
                                            value={newVendor.email}
                                            onChange={e => setNewVendor({ ...newVendor, email: e.target.value })}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                        <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                        <button className="btn-primary" style={{ flex: 1 }} onClick={handleAddVendor}>Guardar Proveedor</button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Purchases;
