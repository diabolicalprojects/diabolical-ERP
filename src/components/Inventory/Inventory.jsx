import React, { useState } from 'react';
import { Search, Plus, Trash2, ArrowUpDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import ModuleTutorial from '../Common/ModuleTutorial';

const Inventory = () => {
    const { inventory, addInventoryItem, deleteInventoryItem } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newItem, setNewItem] = useState({ name: '', sku: '', price: '', stock: '' });

    const tutorialSteps = [
        "Consulta el nivel de existencias y precios unitarios.",
        "Los productos con bajo stock se resaltan automáticamente.",
        "Usa el buscador para localizar SKUs rápidamente.",
        "Añade nuevos artículos mediante el formulario central."
    ];

    const handleAddItem = () => {
        const p = parseFloat(newItem.price) || 0;
        const s = parseInt(newItem.stock) || 0;
        const status = s <= 5 ? 'low' : s <= 20 ? 'warning' : 'ok';
        addInventoryItem({
            ...newItem,
            id: Date.now().toString(),
            price: p,
            stock: s,
            status
        });
        setIsModalOpen(false);
        setNewItem({ name: '', sku: '', price: '', stock: '' });
    };

    const filteredInventory = (inventory || []).filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade">
            <header className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <h1>Gestión de Inventario</h1>
                        <p className="subtitle">Catálogo y existencias en tiempo real</p>
                    </div>
                    <ModuleTutorial
                        title="Inventario"
                        description="Controla tus activos y productos."
                        steps={tutorialSteps}
                    />
                </div>
                <div className="header-actions">
                    <div className="search-bar-wrapper">
                        <Search className="search-bar-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar producto o SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> Añadir Item
                    </button>
                </div>
            </header>

            <div className="data-table-container glass-card" style={{ padding: 0 }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Producto <ArrowUpDown size={12} /></th>
                                <th>SKU</th>
                                <th>Precio</th>
                                <th>Existencia</th>
                                <th>Estatus</th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInventory.map((item) => (
                                <tr key={item.id}>
                                    <td><div style={{ fontWeight: 600 }}>{item.name}</div></td>
                                    <td><span style={{ opacity: 0.6 }}>{item.sku}</span></td>
                                    <td><span style={{ fontWeight: 700 }}>${item.price.toLocaleString()}</span></td>
                                    <td>{item.stock}</td>
                                    <td>
                                        <span className={`status-badge ${item.status}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="btn-secondary" style={{ padding: '0.4rem', color: 'var(--error)', borderColor: 'transparent' }} onClick={() => deleteInventoryItem(item.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
                            <h2 style={{ marginBottom: '1.5rem' }}>Añadir al Inventario</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Nombre del Artículo</label>
                                    <input style={{ width: '100%' }} type="text" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Precio ($)</label>
                                        <input style={{ width: '100%' }} type="number" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>SKU</label>
                                        <input style={{ width: '100%' }} type="text" value={newItem.sku} onChange={e => setNewItem({ ...newItem, sku: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Stock Inicial</label>
                                    <input style={{ width: '100%' }} type="number" value={newItem.stock} onChange={e => setNewItem({ ...newItem, stock: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button className="btn-primary" style={{ flex: 1 }} onClick={handleAddItem}>Registrar</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Inventory;
