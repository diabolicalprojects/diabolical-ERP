import React, { useState } from 'react';
import { X, Save, ShoppingBag, Plus, Trash2, Box, Briefcase, Zap, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';

const QuoteWizard = ({ isOpen, onClose }) => {
    const { customers, inventory, services, quotePresets, setQuotes, quotes } = useApp();
    const [step, setStep] = useState(1);
    const [activeTab, setActiveTab] = useState('products'); // 'products', 'services', 'presets'
    const [formData, setFormData] = useState({
        customer: '',
        items: [],
        status: 'sent'
    });

    const handleAddItem = (item, type) => {
        setFormData({
            ...formData,
            items: [...formData.items, { ...item, quantity: 1, type }]
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = [...formData.items];
        newItems.splice(index, 1);
        setFormData({ ...formData, items: newItems });
    };

    const handleApplyPreset = (preset) => {
        setFormData({
            ...formData,
            items: [...formData.items, ...preset.items]
        });
    };

    const calculateTotal = () => {
        return formData.items.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
    };

    const handleFinish = () => {
        const newQuote = {
            id: `COT-${Date.now().toString().slice(-4)}`,
            customer: formData.customer,
            items: formData.items,
            amount: calculateTotal(),
            date: new Date().toLocaleDateString(),
            status: 'sent'
        };
        setQuotes([newQuote, ...quotes]);
        onClose();
        setStep(1);
        setFormData({ customer: '', items: [], status: 'sent' });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay modal-center" onClick={onClose} style={{ zIndex: 9999 }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="glass-card quote-wizard-container"
                style={{
                    maxWidth: '900px',
                    width: '95%',
                    padding: '2rem',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--glass-border)'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Zap size={24} style={{ color: 'var(--text-primary)' }} />
                            {step === 1 ? 'Identificar Cliente' : 'Armar Propuesta Comercial'}
                        </h2>
                        <p className="subtitle">Estructura tu cotización paso a paso</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <div style={{ width: '40px', height: '4px', background: 'var(--text-primary)', borderRadius: '2px' }}></div>
                            <div style={{ width: '40px', height: '4px', background: step === 2 ? 'var(--text-primary)' : 'var(--glass-border)', borderRadius: '2px' }}></div>
                        </div>
                        <button className="icon-btn" onClick={onClose}><X /></button>
                    </div>
                </div>

                {step === 1 ? (
                    /* STEP 1: CUSTOMER SELECTION */
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                            {customers.map(c => (
                                <button
                                    key={c.id}
                                    className={`glass-card item-card ${formData.customer === c.name ? 'selected' : ''}`}
                                    style={{
                                        textAlign: 'left',
                                        padding: '1.2rem',
                                        cursor: 'pointer',
                                        background: formData.customer === c.name ? 'var(--text-primary)' : 'var(--glass)',
                                        border: formData.customer === c.name ? '2px solid var(--text-primary)' : '1px solid var(--glass-border)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onClick={() => setFormData({ ...formData, customer: c.name })}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <h4 style={{ margin: 0, color: formData.customer === c.name ? 'var(--bg-black)' : 'var(--text-primary)', fontWeight: 700 }}>{c.name}</h4>
                                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--bg-black)', background: formData.customer === c.name ? 'var(--text-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {formData.customer === c.name && <div style={{ width: '6px', height: '6px', background: 'var(--bg-black)', borderRadius: '50%' }} />}
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', opacity: 1, margin: 0, fontWeight: 500 }}>{c.email}</p>
                                </button>
                            ))}
                        </div>
                        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className="btn-primary"
                                disabled={!formData.customer}
                                onClick={() => setStep(2)}
                                style={{ padding: '0.8rem 2.5rem' }}
                            >
                                Configurar Conceptos <Save size={18} style={{ marginLeft: '10px' }} />
                            </button>
                        </div>
                    </div>
                ) : (
                    /* STEP 2: ITEMS SELECTION */
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', flex: 1, overflow: 'hidden' }}>

                        {/* LEFT: Catalog Selection */}
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div className="tab-switcher" style={{ display: 'flex', gap: '4px', background: 'var(--bg-black)', padding: '4px', borderRadius: '12px', marginBottom: '1.5rem' }}>
                                <button
                                    className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('products')}
                                    style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: activeTab === 'products' ? 'var(--text-primary)' : 'transparent', color: activeTab === 'products' ? 'var(--bg-black)' : 'var(--text-secondary)' }}
                                >
                                    <Box size={16} /> Productos
                                </button>
                                <button
                                    className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('services')}
                                    style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: activeTab === 'services' ? 'var(--text-primary)' : 'transparent', color: activeTab === 'services' ? 'var(--bg-black)' : 'var(--text-secondary)' }}
                                >
                                    <Briefcase size={16} /> Servicios
                                </button>
                                <button
                                    className={`tab-btn ${activeTab === 'presets' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('presets')}
                                    style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: activeTab === 'presets' ? 'var(--text-primary)' : 'transparent', color: activeTab === 'presets' ? 'var(--bg-black)' : 'var(--text-secondary)' }}
                                >
                                    <ClipboardList size={16} /> Presets
                                </button>
                            </div>

                            <div className="catalog-scroll" style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
                                <AnimatePresence mode="wait">
                                    {activeTab === 'products' && (
                                        <motion.div key="prod" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                            {inventory.map(item => (
                                                <div key={item.id} className="catalog-item glass-card" style={{ padding: '1rem', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <p style={{ fontWeight: 700, margin: 0 }}>{item.name}</p>
                                                        <p style={{ fontSize: '0.8rem', opacity: 0.5, margin: '2px 0 0 0' }}>Stock: {item.stock} | ${item.price.toLocaleString()}</p>
                                                    </div>
                                                    <button className="icon-btn purple" onClick={() => handleAddItem(item, 'product')}><Plus size={16} /></button>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                    {activeTab === 'services' && (
                                        <motion.div key="serv" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                            {services.map(item => (
                                                <div key={item.id} className="catalog-item glass-card" style={{ padding: '1rem', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <p style={{ fontWeight: 700, margin: 0 }}>{item.name}</p>
                                                        <p style={{ fontSize: '0.8rem', opacity: 0.5, margin: '2px 0 0 0' }}>{item.description} | ${item.price.toLocaleString()}</p>
                                                    </div>
                                                    <button className="icon-btn purple" onClick={() => handleAddItem(item, 'service')}><Plus size={16} /></button>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                    {activeTab === 'presets' && (
                                        <motion.div key="pres" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                            {quotePresets.map(preset => (
                                                <div key={preset.id} className="catalog-item glass-card" style={{ padding: '1rem', marginBottom: '10px', border: '1px solid var(--text-secondary)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                        <p style={{ fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{preset.name}</p>
                                                        <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleApplyPreset(preset)}>Aplicar Todo</button>
                                                    </div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                        {preset.items.map((i, idx) => (
                                                            <span key={idx} style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                                                                {i.quantity}x {i.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* RIGHT: Current Quote Summary */}
                        <div style={{
                            background: 'var(--bg-black)',
                            borderRadius: '20px',
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            border: '1px solid var(--glass-border)',
                            height: '100%',
                            overflow: 'hidden'
                        }}>
                            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                                <h4 style={{ margin: 0, fontWeight: 700 }}>Conceptos en Cotización</h4>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 600 }}>Cliente: {formData.customer}</p>
                            </div>

                            <div className="summary-items-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '10px', marginBottom: '1rem' }}>
                                {formData.items.length === 0 ? (
                                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                                        <ShoppingBag size={48} />
                                        <p style={{ marginTop: '1rem', fontWeight: 600 }}>Sin conceptos añadidos</p>
                                    </div>
                                ) : (
                                    formData.items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <div style={{ padding: '6px', borderRadius: '8px', background: item.type === 'product' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: item.type === 'product' ? '#60a5fa' : '#34d399' }}>
                                                    {item.type === 'product' ? <Box size={14} /> : <Briefcase size={14} />}
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{item.name}</p>
                                                    <p style={{ fontSize: '0.75rem', opacity: 0.8, margin: 0, color: 'var(--text-secondary)', fontWeight: 600 }}>${item.price.toLocaleString()} x {item.quantity}</p>
                                                </div>
                                            </div>
                                            <button className="icon-btn grey" onClick={() => handleRemoveItem(idx)}><Trash2 size={14} /></button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '2px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 600 }}>Importe Total Bruto</p>
                                        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 800 }}>${calculateTotal().toLocaleString()}</h2>
                                    </div>
                                    <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 700 }} onClick={() => setStep(1)}>Cambiar Cliente</button>
                                </div>
                                <button
                                    className="btn-primary"
                                    style={{ width: '100%', padding: '1rem', fontWeight: 800, letterSpacing: '0.02em' }}
                                    disabled={formData.items.length === 0}
                                    onClick={handleFinish}
                                >
                                    Confirmar y Finalizar Folio
                                </button>
                            </div>
                        </div>

                    </div>
                )}
            </motion.div>
            <style>{`
                .summary-items-scroll::-webkit-scrollbar { width: 4px; }
                .summary-items-scroll::-webkit-scrollbar-thumb { background: var(--glass-border); border-radius: 10px; }
                .summary-items-scroll::-webkit-scrollbar-track { background: transparent; }
            `}</style>
        </div>
    );
};

export default QuoteWizard;
