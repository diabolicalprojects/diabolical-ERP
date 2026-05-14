import React, { useState } from 'react';
import {
    X, Save, Palette, Building2, Phone, Mail, Globe,
    CreditCard, FileText, Type, Image, Plus, Trash2,
    Percent, AlertCircle, CheckCircle, Landmark, Tag,
    ChevronRight, Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';

// ─── Estilos reutilizables ────────────────────────────────────────────────────
const labelSt = {
    display: 'block', fontSize: '0.72rem', fontWeight: 700,
    color: 'var(--text-secondary)', marginBottom: '6px',
    textTransform: 'uppercase', letterSpacing: '0.06em'
};
const inputSt = {
    width: '100%', padding: '10px 13px', borderRadius: '10px',
    border: '1px solid var(--glass-border)', background: 'var(--glass)',
    color: 'var(--text-primary)', fontSize: '0.87rem', outline: 'none',
    boxSizing: 'border-box', fontWeight: 500, transition: 'border-color 0.15s',
    fontFamily: 'inherit'
};

// ─── Pestañas del módulo ──────────────────────────────────────────────────────
const TABS = [
    { id: 'identity', label: 'Identidad', icon: Building2 },
    { id: 'contact', label: 'Contacto', icon: Phone },
    { id: 'bank', label: 'Datos Bancarios', icon: Landmark },
    { id: 'payment', label: 'Cond. de Pago', icon: CreditCard },
    { id: 'doc', label: 'Documento', icon: FileText },
];

// ─── Componente de tarjeta de condición de pago ──────────────────────────────
const PaymentConditionCard = ({ cond, onChange, onDelete, total }) => {
    const [editing, setEditing] = useState(false);
    return (
        <div style={{ borderRadius: '14px', border: `1px solid ${editing ? 'var(--text-primary)' : 'var(--glass-border)'}`, background: 'var(--bg-black)', overflow: 'hidden', transition: 'border-color 0.2s', marginBottom: '10px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-primary)', flexShrink: 0 }}>
                    {cond.percentage}%
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem' }}>{cond.label || 'Sin nombre'}</p>
                    <p style={{ margin: 0, fontSize: '0.73rem', color: 'var(--text-secondary)' }}>{cond.description || '—'}</p>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => setEditing(!editing)} style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
                        <Edit3 size={13} />
                    </button>
                    <button onClick={onDelete} style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid transparent', background: 'rgba(239,68,68,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>

            {/* Editor */}
            <AnimatePresence>
                {editing && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--glass-border)', paddingTop: '14px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '10px' }}>
                                <div>
                                    <label style={labelSt}>Etiqueta</label>
                                    <input style={inputSt} placeholder="Ej: 50% Anticipo" value={cond.label} onChange={e => onChange('label', e.target.value)} />
                                </div>
                                <div>
                                    <label style={labelSt}>Descripción</label>
                                    <input style={inputSt} placeholder="Ej: Al firmar contrato" value={cond.description} onChange={e => onChange('description', e.target.value)} />
                                </div>
                                <div>
                                    <label style={labelSt}>%</label>
                                    <input style={inputSt} type="number" min="0" max="100" value={cond.percentage} onChange={e => onChange('percentage', Math.min(100, Number(e.target.value)))} />
                                </div>
                            </div>
                            <button onClick={() => setEditing(false)} style={{ marginTop: '10px', width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <CheckCircle size={13} /> Listo
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Módulo principal ─────────────────────────────────────────────────────────
const QuoteSettings = ({ isOpen, onClose }) => {
    const { quoteSettings, setQuoteSettings } = useApp();
    const [activeTab, setActiveTab] = useState('identity');
    const [saved, setSaved] = useState(false);

    if (!isOpen) return null;

    const set = (field, value) => setQuoteSettings(prev => ({ ...prev, [field]: value }));

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => set('logoUrl', reader.result);
        reader.readAsDataURL(file);
    };

    // Payment conditions helpers
    const addCondition = () => {
        const newCond = { id: `pc-${Date.now()}`, label: '', description: '', percentage: 0 };
        set('paymentConditions', [...quoteSettings.paymentConditions, newCond]);
    };
    const updateCondition = (id, field, value) => {
        set('paymentConditions', quoteSettings.paymentConditions.map(c => c.id === id ? { ...c, [field]: value } : c));
    };
    const deleteCondition = (id) => {
        set('paymentConditions', quoteSettings.paymentConditions.filter(c => c.id !== id));
    };

    const totalPct = quoteSettings.paymentConditions.reduce((a, c) => a + Number(c.percentage), 0);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => { setSaved(false); onClose(); }, 1200);
    };

    return (
        <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 24 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: '780px', maxHeight: '92vh',
                    background: 'var(--bg-card)', borderRadius: '24px',
                    border: '1px solid var(--glass-border)', display: 'flex',
                    flexDirection: 'column', overflow: 'hidden',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.55)'
                }}
            >
                {/* ── Cabecera ── */}
                <div style={{ padding: '1.4rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Building2 size={20} color="var(--bg-black)" />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Perfil de Empresa Emisora</h2>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Datos que aparecen en tus cotizaciones y documentos</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* ── Layout body ── */}
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                    {/* Sidebar de tabs */}
                    <div style={{ width: '180px', flexShrink: 0, borderRight: '1px solid var(--glass-border)', padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        width: '100%', padding: '10px 12px', borderRadius: '10px',
                                        border: 'none', cursor: 'pointer', textAlign: 'left',
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        background: isActive ? 'var(--text-primary)' : 'transparent',
                                        color: isActive ? 'var(--bg-black)' : 'var(--text-secondary)',
                                        fontWeight: isActive ? 800 : 500, fontSize: '0.82rem',
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    <Icon size={16} />
                                    <span style={{ flex: 1 }}>{tab.label}</span>
                                    {isActive && <ChevronRight size={13} />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Contenido de tab activo */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2rem' }}>
                        <AnimatePresence mode="wait">

                            {/* ── IDENTIDAD ── */}
                            {activeTab === 'identity' && (
                                <motion.div key="identity" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                    <SectionTitle>Identidad Visual</SectionTitle>

                                    {/* Logo upload */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem', background: 'var(--bg-black)', borderRadius: '14px', border: '1px dashed var(--glass-border)', marginBottom: '1.5rem' }}>
                                        <div style={{ width: '72px', height: '72px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--glass-border)', flexShrink: 0 }}>
                                            {quoteSettings.logoUrl
                                                ? <img src={quoteSettings.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                : <Image size={28} style={{ opacity: 0.25 }} />
                                            }
                                        </div>
                                        <div>
                                            <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 16px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--glass)', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.82rem' }}>
                                                <Image size={14} /> Subir Logo
                                                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                                            </label>
                                            <p style={{ margin: '6px 0 0', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>PNG con fondo transparente recomendado</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                                        <Field label="Nombre de Empresa" value={quoteSettings.companyName} onChange={v => set('companyName', v)} placeholder="DIABOLICAL AI" />
                                        <Field label="RFC / ID Fiscal" value={quoteSettings.companyRFC} onChange={v => set('companyRFC', v)} placeholder="DIA240101-XXX" />
                                    </div>
                                    <Field label="Dirección Fiscal" value={quoteSettings.companyAddress} onChange={v => set('companyAddress', v)} placeholder="Av. de la Reforma 405, CDMX" />
                                </motion.div>
                            )}

                            {/* ── CONTACTO ── */}
                            {activeTab === 'contact' && (
                                <motion.div key="contact" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                    <SectionTitle>Información de Contacto</SectionTitle>
                                    <p style={{ margin: '0 0 1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Estos datos aparecerán en el encabezado de cada cotización.</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        <FieldIcon icon={<Phone size={15} />} label="Teléfono / WhatsApp" value={quoteSettings.companyPhone} onChange={v => set('companyPhone', v)} placeholder="+52 55 1234 5678" />
                                        <FieldIcon icon={<Mail size={15} />} label="Correo electrónico" value={quoteSettings.companyEmail} onChange={v => set('companyEmail', v)} placeholder="hola@empresa.com" type="email" />
                                        <FieldIcon icon={<Globe size={15} />} label="Sitio web" value={quoteSettings.companyWebsite} onChange={v => set('companyWebsite', v)} placeholder="www.empresa.com" />
                                    </div>
                                </motion.div>
                            )}

                            {/* ── DATOS BANCARIOS ── */}
                            {activeTab === 'bank' && (
                                <motion.div key="bank" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                    <SectionTitle>Datos de Transferencia</SectionTitle>
                                    <p style={{ margin: '0 0 1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Se mostrarán al final de cada cotización para que el cliente pueda realizar el pago.</p>

                                    {/* Preview chip */}
                                    <div style={{ padding: '1rem 1.4rem', borderRadius: '14px', background: 'var(--bg-black)', border: '1px solid var(--glass-border)', marginBottom: '1.75rem' }}>
                                        <p style={{ margin: '0 0 6px', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Vista previa en cotización</p>
                                        <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem' }}>{quoteSettings.bankName || '—'}</p>
                                        <p style={{ margin: '2px 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Titular: {quoteSettings.bankHolder || '—'}</p>
                                        <p style={{ margin: '2px 0', fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>CLABE: {quoteSettings.bankCLABE || '—'}</p>
                                        <p style={{ margin: '2px 0', fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>Cta: {quoteSettings.bankAccount || '—'}</p>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#f59e0b' }}>Ref: {quoteSettings.bankReference || '—'}</p>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                            <Field label="Banco" value={quoteSettings.bankName} onChange={v => set('bankName', v)} placeholder="BBVA Bancomer" />
                                            <Field label="Titular de la cuenta" value={quoteSettings.bankHolder} onChange={v => set('bankHolder', v)} placeholder="Empresa S.A. de C.V." />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                            <Field label="CLABE Interbancaria" value={quoteSettings.bankCLABE} onChange={v => set('bankCLABE', v)} placeholder="012345678901234567" mono />
                                            <Field label="Número de cuenta" value={quoteSettings.bankAccount} onChange={v => set('bankAccount', v)} placeholder="0123456789" mono />
                                        </div>
                                        <Field label="Referencia de pago" value={quoteSettings.bankReference} onChange={v => set('bankReference', v)} placeholder="Ej: Folio de cotización" />
                                    </div>
                                </motion.div>
                            )}

                            {/* ── CONDICIONES DE PAGO ── */}
                            {activeTab === 'payment' && (
                                <motion.div key="payment" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                    <SectionTitle>Condiciones de Pago</SectionTitle>
                                    <p style={{ margin: '0 0 1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Define los hitos de pago que se mostrarán en cada cotización.</p>

                                    {/* Total % indicator */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem', padding: '10px 14px', borderRadius: '12px', background: totalPct === 100 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${totalPct === 100 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                                        {totalPct === 100
                                            ? <CheckCircle size={16} style={{ color: '#34d399' }} />
                                            : <AlertCircle size={16} style={{ color: '#ef4444' }} />
                                        }
                                        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: totalPct === 100 ? '#34d399' : '#ef4444' }}>
                                            Total asignado: <strong>{totalPct}%</strong>
                                            {totalPct !== 100 && ` — Debe sumar 100%`}
                                        </p>
                                        {/* Bar */}
                                        <div style={{ flex: 1, height: '5px', background: 'var(--glass-border)', borderRadius: '3px', overflow: 'hidden', marginLeft: 'auto', maxWidth: '120px' }}>
                                            <div style={{ width: `${Math.min(totalPct, 100)}%`, height: '100%', background: totalPct === 100 ? '#34d399' : totalPct > 100 ? '#ef4444' : '#f59e0b', borderRadius: '3px', transition: 'width 0.3s' }} />
                                        </div>
                                    </div>

                                    {quoteSettings.paymentConditions.map(cond => (
                                        <PaymentConditionCard
                                            key={cond.id}
                                            cond={cond}
                                            onChange={(field, val) => updateCondition(cond.id, field, val)}
                                            onDelete={() => deleteCondition(cond.id)}
                                            total={totalPct}
                                        />
                                    ))}

                                    <button
                                        onClick={addCondition}
                                        style={{ width: '100%', padding: '11px', borderRadius: '12px', border: '1.5px dashed var(--glass-border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '6px', transition: 'all 0.2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                    >
                                        <Plus size={15} /> Agregar condición
                                    </button>
                                </motion.div>
                            )}

                            {/* ── DOCUMENTO ── */}
                            {activeTab === 'doc' && (
                                <motion.div key="doc" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                    <SectionTitle>Configuración del Documento</SectionTitle>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                                        <div>
                                            <label style={labelSt}>Color de Acento</label>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <input type="color" value={quoteSettings.accentColor} onChange={e => set('accentColor', e.target.value)} style={{ padding: 0, width: '42px', height: '42px', border: '1px solid var(--glass-border)', borderRadius: '10px', background: 'transparent', cursor: 'pointer' }} />
                                                <input style={{ ...inputSt, flex: 1 }} value={quoteSettings.accentColor} onChange={e => set('accentColor', e.target.value)} />
                                            </div>
                                        </div>
                                        <Field label={<>IVA <span style={{ opacity: 0.5 }}>(%)</span></>} value={quoteSettings.taxRate} onChange={v => set('taxRate', v)} type="number" placeholder="16" />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                                        <div>
                                            <label style={labelSt}>Moneda</label>
                                            <select style={inputSt} value={quoteSettings.currency} onChange={e => set('currency', e.target.value)}>
                                                {['MXN', 'USD', 'EUR', 'CAD'].map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <Field label="Vigencia (días)" value={quoteSettings.validityDays} onChange={v => set('validityDays', v)} type="number" placeholder="30" />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                                        <Field label="Etiqueta firma izquierda" value={quoteSettings.signatureLabelLeft} onChange={v => set('signatureLabelLeft', v)} placeholder="Gerente Comercial" />
                                        <Field label="Etiqueta firma derecha" value={quoteSettings.signatureLabelRight} onChange={v => set('signatureLabelRight', v)} placeholder="Aceptación del Cliente" />
                                    </div>

                                    <div>
                                        <label style={labelSt}>Nota legal al pie de página</label>
                                        <textarea
                                            style={{ ...inputSt, minHeight: '80px', resize: 'none', paddingTop: '10px' }}
                                            rows={3}
                                            value={quoteSettings.footerNote}
                                            onChange={e => set('footerNote', e.target.value)}
                                            placeholder="Esta cotización tiene una vigencia de..."
                                        />
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>

                {/* ── Footer de acciones ── */}
                <div style={{ padding: '1.2rem 2rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px', flexShrink: 0 }}>
                    <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem', background: saved ? 'rgba(16,185,129,0.15)' : 'var(--text-primary)', color: saved ? '#34d399' : 'var(--bg-black)', border: saved ? '1px solid #34d399' : 'none', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s' }}
                    >
                        {saved ? <><CheckCircle size={16} /> ¡Guardado!</> : <><Save size={16} /> Guardar cambios</>}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ─── Sub-componentes auxiliares ─────────────────────────────────────────────
const SectionTitle = ({ children }) => (
    <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.95rem', fontWeight: 800, paddingBottom: '10px', borderBottom: '1px solid var(--glass-border)' }}>{children}</h3>
);

const Field = ({ label, value, onChange, placeholder, type = 'text', mono = false }) => (
    <div>
        <label style={labelSt}>{label}</label>
        <input
            style={{ ...inputSt, fontFamily: mono ? 'monospace' : 'inherit' }}
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
        />
    </div>
);

const FieldIcon = ({ icon, label, value, onChange, placeholder, type = 'text' }) => (
    <div>
        <label style={labelSt}>{label}</label>
        <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }}>{icon}</div>
            <input
                style={{ ...inputSt, paddingLeft: '38px' }}
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    </div>
);

export default QuoteSettings;
