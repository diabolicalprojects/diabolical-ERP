import React, { useState, useRef, useEffect } from 'react';
import {
    X, Save, Plus, Trash2, ChevronDown, ChevronUp,
    Edit3, FileText, DollarSign, Hash, Tag, Percent,
    GripVertical, Copy, CheckCircle, Sparkles, AlertCircle,
    Users, Package, Wrench, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';

// ─── Utilidades ───────────────────────────────────────────────────────────────
const uid = () => `ci-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
const fmt = (n) => Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ITEM_TYPES = [
    { value: 'product', label: 'Producto', icon: Package, color: '#60a5fa' },
    { value: 'service', label: 'Servicio', icon: Wrench, color: '#34d399' },
    { value: 'custom', label: 'Personalizado', icon: Star, color: '#f59e0b' },
];

const emptyItem = () => ({
    id: uid(),
    name: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    type: 'custom',
    unit: 'pza',
    isEditing: true,
});

// ─── Fila de un ítem ─────────────────────────────────────────────────────────
const ItemRow = ({ item, index, onChange, onDelete, onDuplicate, onToggleEdit }) => {
    const subtotal = (item.quantity * item.unitPrice) * (1 - item.discount / 100);
    const typeInfo = ITEM_TYPES.find(t => t.value === item.type) || ITEM_TYPES[2];
    const TypeIcon = typeInfo.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2 }}
            style={{ marginBottom: '10px' }}
        >
            <div style={{
                background: 'var(--bg-black)',
                border: `1px solid ${item.isEditing ? 'var(--text-primary)' : 'var(--glass-border)'}`,
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'border-color 0.2s ease'
            }}>
                {/* Collapsed Header */}
                <div
                    onClick={() => !item.isEditing && onToggleEdit(item.id)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        cursor: item.isEditing ? 'default' : 'pointer',
                        userSelect: 'none'
                    }}
                >
                    {/* Index badge */}
                    <div style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: `${typeInfo.color}22`, color: typeInfo.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 800, flexShrink: 0
                    }}>
                        {index + 1}
                    </div>

                    {/* Name + type */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: item.name ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                {item.name || 'Sin nombre…'}
                            </span>
                            <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: `${typeInfo.color}22`, color: typeInfo.color, fontWeight: 700 }}>
                                {typeInfo.label}
                            </span>
                        </div>
                        {!item.isEditing && item.description && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.description}
                            </p>
                        )}
                    </div>

                    {/* Subtotal */}
                    {!item.isEditing && (
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>${fmt(subtotal)}</span>
                            {item.discount > 0 && (
                                <div style={{ fontSize: '0.65rem', color: '#f59e0b' }}>
                                    {item.discount}% desc.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => onDuplicate(item.id)}
                            title="Duplicar"
                            style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}
                        >
                            <Copy size={13} />
                        </button>
                        <button
                            onClick={() => onToggleEdit(item.id)}
                            title={item.isEditing ? 'Colapsar' : 'Editar'}
                            style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}
                        >
                            {item.isEditing ? <ChevronUp size={13} /> : <Edit3 size={13} />}
                        </button>
                        <button
                            onClick={() => onDelete(item.id)}
                            title="Eliminar"
                            style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid transparent', background: 'rgba(239,68,68,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                </div>

                {/* Expanded Editor */}
                <AnimatePresence>
                    {item.isEditing && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--glass-border)' }}>
                                {/* Type selector */}
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', marginTop: '16px' }}>
                                    {ITEM_TYPES.map(t => {
                                        const TIcon = t.icon;
                                        return (
                                            <button
                                                key={t.value}
                                                onClick={() => onChange(item.id, 'type', t.value)}
                                                style={{
                                                    flex: 1, padding: '8px 4px', borderRadius: '10px', cursor: 'pointer',
                                                    border: `1.5px solid ${item.type === t.value ? t.color : 'var(--glass-border)'}`,
                                                    background: item.type === t.value ? `${t.color}18` : 'transparent',
                                                    color: item.type === t.value ? t.color : 'var(--text-secondary)',
                                                    fontSize: '0.75rem', fontWeight: 700,
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                                    transition: 'all 0.15s'
                                                }}
                                            >
                                                <TIcon size={14} />
                                                {t.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Name & Description */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                    <div>
                                        <label style={labelStyle}>Nombre del concepto *</label>
                                        <input
                                            style={inputStyle}
                                            placeholder="Ej: Diseño de identidad corporativa"
                                            value={item.name}
                                            onChange={e => onChange(item.id, 'name', e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Unidad</label>
                                        <select
                                            style={inputStyle}
                                            value={item.unit}
                                            onChange={e => onChange(item.id, 'unit', e.target.value)}
                                        >
                                            {['pza', 'hr', 'mes', 'lt', 'kg', 'mt', 'set', 'lote'].map(u => (
                                                <option key={u} value={u}>{u}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '10px' }}>
                                    <label style={labelStyle}>Descripción / Notas (opcional)</label>
                                    <textarea
                                        style={{ ...inputStyle, resize: 'none', minHeight: '56px', paddingTop: '8px', fontFamily: 'inherit' }}
                                        placeholder="Detalles del concepto, especificaciones, alcance..."
                                        value={item.description}
                                        onChange={e => onChange(item.id, 'description', e.target.value)}
                                        rows={2}
                                    />
                                </div>

                                {/* Quantity, Price, Discount */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                    <div>
                                        <label style={labelStyle}><Hash size={11} style={{ display: 'inline', marginRight: '4px' }} />Cantidad</label>
                                        <input
                                            style={inputStyle}
                                            type="number"
                                            min="0.01"
                                            step="any"
                                            value={item.quantity}
                                            onChange={e => onChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}><DollarSign size={11} style={{ display: 'inline', marginRight: '4px' }} />Precio unitario</label>
                                        <input
                                            style={inputStyle}
                                            type="number"
                                            min="0"
                                            step="any"
                                            value={item.unitPrice}
                                            onChange={e => onChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}><Percent size={11} style={{ display: 'inline', marginRight: '4px' }} />Descuento %</label>
                                        <input
                                            style={inputStyle}
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={item.discount}
                                            onChange={e => onChange(item.id, 'discount', Math.min(100, parseFloat(e.target.value) || 0))}
                                        />
                                    </div>
                                </div>

                                {/* Subtotal preview */}
                                <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                        Subtotal: {item.quantity} {item.unit} × ${fmt(item.unitPrice)}
                                        {item.discount > 0 && ` − ${item.discount}%`}
                                    </span>
                                    <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>${fmt(subtotal)}</span>
                                </div>

                                <button
                                    onClick={() => onToggleEdit(item.id)}
                                    style={{ marginTop: '12px', width: '100%', padding: '9px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                >
                                    <CheckCircle size={14} /> Listo
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

// ─── Estilos base ─────────────────────────────────────────────────────────────
const labelStyle = {
    display: 'block', fontSize: '0.72rem', fontWeight: 700,
    color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em'
};
const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: '10px',
    border: '1px solid var(--glass-border)', background: 'var(--glass)',
    color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none',
    boxSizing: 'border-box', fontWeight: 500,
    transition: 'border-color 0.15s'
};

// ─── Componente principal ─────────────────────────────────────────────────────
const CustomQuoteBuilder = ({ isOpen, onClose }) => {
    const { customers, quotes, setQuotes, quoteSettings } = useApp();
    const [step, setStep] = useState(1); // 1 = cliente, 2 = ítems
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [customCustomer, setCustomCustomer] = useState('');
    const [items, setItems] = useState([emptyItem()]);
    const [notes, setNotes] = useState('');
    const [saved, setSaved] = useState(false);
    const scrollRef = useRef(null);

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSelectedCustomer('');
            setCustomCustomer('');
            setItems([emptyItem()]);
            setNotes('');
            setSaved(false);
        }
    }, [isOpen]);

    const customerName = selectedCustomer === '__custom__'
        ? customCustomer
        : selectedCustomer;

    // ── Handlers ítems ──
    const handleChange = (id, field, value) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const handleDelete = (id) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const handleDuplicate = (id) => {
        const idx = items.findIndex(i => i.id === id);
        const copy = { ...items[idx], id: uid(), isEditing: false };
        const next = [...items];
        next.splice(idx + 1, 0, copy);
        setItems(next);
    };

    const handleToggleEdit = (id) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, isEditing: !i.isEditing } : i));
    };

    const handleAddItem = () => {
        const newItem = emptyItem();
        setItems(prev => [...prev, newItem]);
        // Scroll to bottom after render
        setTimeout(() => {
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }, 100);
    };

    // ── Totals ──
    const subtotalBruto = items.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0);
    const totalDescuento = items.reduce((acc, i) => acc + (i.quantity * i.unitPrice * i.discount / 100), 0);
    const subtotalNeto = subtotalBruto - totalDescuento;
    const iva = subtotalNeto * (quoteSettings.taxRate / 100);
    const total = subtotalNeto + iva;

    // ── Validación ──
    const hasErrors = items.some(i => !i.name.trim() || i.unitPrice === 0);

    // ── Guardar ──
    const handleSave = () => {
        const newQuote = {
            id: `COT-${Date.now().toString().slice(-5)}`,
            customer: customerName,
            date: new Date().toLocaleDateString('es-MX'),
            amount: total,
            status: 'sent',
            type: 'custom',
            notes,
            items: items.map(({ id, name, description, quantity, unitPrice, discount, type, unit }) => ({
                id, name, description, quantity,
                price: unitPrice, discount, type, unit
            }))
        };
        setQuotes([newQuote, ...quotes]);
        setSaved(true);
        setTimeout(() => {
            onClose();
        }, 1400);
    };

    if (!isOpen) return null;

    return (
        <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 30 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: '860px', maxHeight: '92vh',
                    background: 'var(--bg-card)', borderRadius: '24px',
                    border: '1px solid var(--glass-border)', display: 'flex',
                    flexDirection: 'column', overflow: 'hidden',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.5)'
                }}
            >
                {/* ── Header ── */}
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                                Cotización Personalizada
                            </h2>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                Define cada ítem a la medida
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Progress steps */}
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {[1, 2].map(s => (
                                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, background: step >= s ? 'var(--text-primary)' : 'var(--glass)', color: step >= s ? 'var(--bg-black)' : 'var(--text-secondary)', border: `2px solid ${step >= s ? 'var(--text-primary)' : 'var(--glass-border)'}`, transition: 'all 0.3s' }}>{s}</div>
                                    {s < 2 && <div style={{ width: '20px', height: '2px', background: step > s ? 'var(--text-primary)' : 'var(--glass-border)', transition: 'all 0.3s', borderRadius: '1px' }} />}
                                </div>
                            ))}
                        </div>
                        <button onClick={onClose} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* ── Body ── */}
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            /* PASO 1: CLIENTE */
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}
                            >
                                <h3 style={{ margin: '0 0 6px', fontSize: '1rem' }}>¿Para quién es esta cotización?</h3>
                                <p style={{ margin: '0 0 1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Selecciona un cliente existente o escribe uno nuevo.</p>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '1.5rem' }}>
                                    {customers.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => { setSelectedCustomer(c.name); setCustomCustomer(''); }}
                                            style={{
                                                textAlign: 'left', padding: '1rem 1.2rem', borderRadius: '14px', cursor: 'pointer',
                                                background: selectedCustomer === c.name ? 'var(--text-primary)' : 'var(--glass)',
                                                border: `1.5px solid ${selectedCustomer === c.name ? 'var(--text-primary)' : 'var(--glass-border)'}`,
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: selectedCustomer === c.name ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Users size={16} style={{ color: selectedCustomer === c.name ? 'var(--bg-black)' : 'var(--text-secondary)' }} />
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: selectedCustomer === c.name ? 'var(--bg-black)' : 'var(--text-primary)' }}>{c.name}</p>
                                                    <p style={{ margin: 0, fontSize: '0.72rem', color: selectedCustomer === c.name ? 'rgba(0,0,0,0.6)' : 'var(--text-secondary)' }}>{c.email}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}

                                    {/* Opción "Otro" */}
                                    <button
                                        onClick={() => setSelectedCustomer('__custom__')}
                                        style={{
                                            textAlign: 'left', padding: '1rem 1.2rem', borderRadius: '14px', cursor: 'pointer',
                                            background: selectedCustomer === '__custom__' ? 'rgba(245,158,11,0.15)' : 'var(--glass)',
                                            border: `1.5px dashed ${selectedCustomer === '__custom__' ? '#f59e0b' : 'var(--glass-border)'}`,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(245,158,11,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Plus size={16} style={{ color: '#f59e0b' }} />
                                            </div>
                                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#f59e0b' }}>Otro cliente</p>
                                        </div>
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {selectedCustomer === '__custom__' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <label style={{ ...labelStyle, marginBottom: '8px' }}>Nombre del cliente *</label>
                                            <input
                                                style={{ ...inputStyle, maxWidth: '400px' }}
                                                placeholder="Nombre de empresa o persona..."
                                                value={customCustomer}
                                                onChange={e => setCustomCustomer(e.target.value)}
                                                autoFocus
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        className="btn-primary"
                                        disabled={!customerName.trim()}
                                        onClick={() => setStep(2)}
                                        style={{ padding: '0.8rem 2.5rem', opacity: customerName.trim() ? 1 : 0.4 }}
                                    >
                                        Continuar →
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            /* PASO 2: ÍTEMS */
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                                    {/* Two columns layout */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', flex: 1, overflow: 'hidden' }}>

                                        {/* ── LEFT: Items list ── */}
                                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid var(--glass-border)' }}>
                                            <div style={{ padding: '1.25rem 1.5rem 0.75rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div>
                                                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>Conceptos de la cotización</h4>
                                                    <p style={{ margin: '2px 0 0', fontSize: '0.73rem', color: 'var(--text-secondary)' }}>Cliente: <strong style={{ color: 'var(--text-primary)' }}>{customerName}</strong></p>
                                                </div>
                                                <button
                                                    onClick={handleAddItem}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.8rem' }}
                                                >
                                                    <Plus size={15} /> Agregar ítem
                                                </button>
                                            </div>

                                            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
                                                {items.length === 0 ? (
                                                    <div style={{ height: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                                                        <FileText size={48} />
                                                        <p style={{ marginTop: '1rem', fontWeight: 600 }}>Sin conceptos</p>
                                                    </div>
                                                ) : (
                                                    <AnimatePresence>
                                                        {items.map((item, index) => (
                                                            <ItemRow
                                                                key={item.id}
                                                                item={item}
                                                                index={index}
                                                                onChange={handleChange}
                                                                onDelete={handleDelete}
                                                                onDuplicate={handleDuplicate}
                                                                onToggleEdit={handleToggleEdit}
                                                            />
                                                        ))}
                                                    </AnimatePresence>
                                                )}
                                                <button
                                                    onClick={handleAddItem}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '14px', border: '1.5px dashed var(--glass-border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px', transition: 'all 0.2s' }}
                                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                                >
                                                    <Plus size={16} /> Añadir otro concepto
                                                </button>
                                            </div>
                                        </div>

                                        {/* ── RIGHT: Summary ── */}
                                        <div style={{ display: 'flex', flexDirection: 'column', padding: '1.25rem 1.5rem', gap: '16px', overflowY: 'auto' }}>
                                            <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800 }}>Resumen</h4>

                                            {/* Items count */}
                                            <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'var(--glass)', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Conceptos</span>
                                                <span style={{ fontWeight: 800 }}>{items.length}</span>
                                            </div>

                                            {/* Totals breakdown */}
                                            <div style={{ padding: '14px', borderRadius: '14px', background: 'var(--bg-black)', border: '1px solid var(--glass-border)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Subtotal bruto</span>
                                                    <span style={{ fontSize: '0.83rem', fontWeight: 700 }}>${fmt(subtotalBruto)}</span>
                                                </div>
                                                {totalDescuento > 0 && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <span style={{ fontSize: '0.78rem', color: '#f59e0b' }}>Descuentos</span>
                                                        <span style={{ fontSize: '0.83rem', fontWeight: 700, color: '#f59e0b' }}>−${fmt(totalDescuento)}</span>
                                                    </div>
                                                )}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Subtotal neto</span>
                                                    <span style={{ fontSize: '0.83rem', fontWeight: 700 }}>${fmt(subtotalNeto)}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--glass-border)' }}>
                                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>IVA ({quoteSettings.taxRate}%)</span>
                                                    <span style={{ fontSize: '0.83rem', fontWeight: 700 }}>${fmt(iva)}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '2px solid var(--glass-border)' }}>
                                                    <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>TOTAL</span>
                                                    <span style={{ fontWeight: 900, fontSize: '1.15rem' }}>${fmt(total)}</span>
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            <div>
                                                <label style={labelStyle}>Notas internas (opcional)</label>
                                                <textarea
                                                    style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit', minHeight: '72px' }}
                                                    placeholder="Condiciones, vigencia, comentarios..."
                                                    value={notes}
                                                    onChange={e => setNotes(e.target.value)}
                                                    rows={3}
                                                />
                                            </div>

                                            {/* Validation warning */}
                                            {hasErrors && items.length > 0 && (
                                                <div style={{ display: 'flex', gap: '8px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                                                    <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                                                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600 }}>Algunos conceptos están incompletos (nombre o precio vacío).</p>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <button
                                                    onClick={handleSave}
                                                    disabled={items.length === 0 || hasErrors || saved}
                                                    style={{
                                                        width: '100%', padding: '12px', borderRadius: '12px', cursor: 'pointer',
                                                        background: saved ? 'rgba(16,185,129,0.15)' : 'var(--text-primary)',
                                                        color: saved ? '#34d399' : 'var(--bg-black)',
                                                        border: saved ? '1px solid #34d399' : 'none',
                                                        fontWeight: 800, fontSize: '0.88rem', opacity: (items.length === 0 || hasErrors) && !saved ? 0.4 : 1,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                        transition: 'all 0.3s'
                                                    }}
                                                >
                                                    {saved ? <><CheckCircle size={16} /> ¡Cotización guardada!</> : <><Save size={15} /> Guardar Cotización</>}
                                                </button>
                                                <button
                                                    onClick={() => setStep(1)}
                                                    style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.8rem' }}
                                                >
                                                    ← Cambiar cliente
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default CustomQuoteBuilder;
