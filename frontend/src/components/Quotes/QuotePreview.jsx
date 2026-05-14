import React, { useState, useEffect } from 'react';
import {
    X, Printer, Building2, Edit3, CheckCircle,
    User, FileText, Tag, Landmark, RotateCcw, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';

// ─── Formateo numérico ────────────────────────────────────────────────────────
const fmt = (n) =>
    Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Sub-componente: campo del panel lateral ──────────────────────────────────
const PanelField = ({ label, value, onChange, type = 'text', mono = false, multiline = false }) => (
    <div style={{ marginBottom: '9px' }}>
        <label style={{ display: 'block', fontSize: '0.66rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {label}
        </label>
        {multiline ? (
            <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={2} style={{ width: '100%', padding: '6px 9px', borderRadius: '7px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontSize: '0.82rem', fontFamily: mono ? 'monospace' : 'inherit', outline: 'none', resize: 'vertical', minHeight: '60px', boxSizing: 'border-box' }} />
        ) : (
            <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '6px 9px', borderRadius: '7px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontSize: '0.82rem', fontFamily: mono ? 'monospace' : 'inherit', fontWeight: 500, outline: 'none', boxSizing: 'border-box' }} />
        )}
    </div>
);

// ─── Sub-componente: sección colapsable del panel ────────────────────────────
const PanelSection = ({ title, icon: Icon, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div style={{ marginBottom: '8px', borderRadius: '9px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <button onClick={() => setOpen(!open)} style={{ width: '100%', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', color: '#334155' }}>
                <Icon size={14} style={{ color: '#475569' }} />
                <span style={{ flex: 1, textAlign: 'left' }}>{title}</span>
                {open ? <ChevronUp size={13} style={{ color: '#94a3b8' }} /> : <ChevronDown size={13} style={{ color: '#94a3b8' }} />}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '12px', background: '#fff' }}>{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Fila de datos en el documento ────────────────────────────────────────────
const DocDetailRow = ({ label, children }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '6px 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.85rem' }}>
        <span style={{ color: '#6b7280', flexShrink: 0, marginRight: '8px' }}>{label}:</span>
        <span style={{ fontWeight: 700, color: '#111827', textAlign: 'right', wordBreak: 'break-word', flex: 1 }}>{children}</span>
    </div>
);

// ─── Componente principal ─────────────────────────────────────────────────────
const QuotePreview = ({ quote, isOpen, onClose }) => {
    const { quoteSettings } = useApp();
    const [editMode, setEditMode] = useState(false);
    const [ed, setEd] = useState({});

    // Reinillar el estado cuando se abre una cotización diferente
    useEffect(() => {
        if (isOpen && quote) {
            setEd({
                // Empresa
                companyName: quoteSettings.companyName || '',
                companyAddress: quoteSettings.companyAddress || '',
                companyRFC: quoteSettings.companyRFC || '',
                companyPhone: quoteSettings.companyPhone || '',
                companyEmail: quoteSettings.companyEmail || '',
                companyWebsite: quoteSettings.companyWebsite || '',
                // Cliente
                clientName: quote.customer || '',
                clientRFC: quote.clientRFC || '',
                clientAddress: quote.clientAddress || '',
                clientContact: quote.clientContact || '',
                // Cotización
                quoteId: quote.id || '',
                quoteDate: quote.date || '',
                quoteValidity: quoteSettings.validityDays || 30,
                quoteCurrency: quoteSettings.currency || 'MXN',
                quoteTax: quoteSettings.taxRate || 16,
                quoteFooterNote: quoteSettings.footerNote || '',
                // Banco
                bankName: quoteSettings.bankName || '',
                bankHolder: quoteSettings.bankHolder || '',
                bankCLABE: quoteSettings.bankCLABE || '',
                bankAccount: quoteSettings.bankAccount || '',
                bankReference: quoteSettings.bankReference || '',
                // Items (copia mutable)
                items: (quote.items || []).map(i => ({ ...i })),
            });
            setEditMode(false);
        }
    }, [isOpen, quote]); // Dependencias para resetear el panel

    if (!quote || !isOpen) return null;

    const s = (field) => (val) => setEd(prev => ({ ...prev, [field]: val }));
    const setItem = (idx, field, val) =>
        setEd(prev => ({ ...prev, items: prev.items.map((it, i) => i === idx ? { ...it, [field]: val } : it) }));

    // Cálculos en tiempo real
    const taxRate = Number(ed.quoteTax) || 0;
    const subtotalBruto = (ed.items || []).reduce((acc, i) => acc + Number(i.price || i.unitPrice || 0) * Number(i.quantity || 1), 0);
    const descuentoTotal = (ed.items || []).reduce((acc, i) => {
        const price = Number(i.price || i.unitPrice || 0);
        const qty = Number(i.quantity || 1);
        return acc + price * qty * (Number(i.discount || 0) / 100);
    }, 0);
    const subtotalNeto = subtotalBruto - descuentoTotal;
    const iva = subtotalNeto * (taxRate / 100);
    const total = subtotalNeto + iva;
    const hayDescuentos = (ed.items || []).some(i => Number(i.discount || 0) > 0);

    return (
        <div className="modal-overlay modal-center noprint-wrapper" onClick={onClose} style={{ zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="quote-preview-modal"
                style={{ maxWidth: editMode ? '1280px' : '960px', width: '98%', height: '94vh', background: '#f1f5f9', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.08)', transition: 'max-width 0.35s cubic-bezier(0.16,1,0.3,1)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── BARRA DE HERRAMIENTAS ── */}
                <div className="no-print" style={{ padding: '1rem 1.8rem', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: '#111827', padding: '7px', borderRadius: '10px' }}>
                            <Building2 size={18} color="white" />
                        </div>
                        <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem' }}>Previsualización</span>
                        <div style={{ height: '24px', width: '1px', background: '#e2e8f0', margin: '0 6px' }} />

                        {/* Toggle edición */}
                        <button
                            onClick={() => setEditMode(!editMode)}
                            style={{ height: '36px', padding: '0 14px', borderRadius: '9px', cursor: 'pointer', border: editMode ? '1.5px solid #111827' : '1.5px solid #e2e8f0', background: editMode ? '#111827' : '#f8fafc', color: editMode ? '#fff' : '#64748b', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                        >
                            <Edit3 size={14} />
                            {editMode ? 'Panel de Edición Abierto' : 'Afinar Detalles (Editar)'}
                        </button>

                        {editMode && (
                            <button
                                onClick={() => setEd(prev => ({ ...prev, companyName: quoteSettings.companyName, companyAddress: quoteSettings.companyAddress, companyRFC: quoteSettings.companyRFC, companyPhone: quoteSettings.companyPhone || '', companyEmail: quoteSettings.companyEmail || '', companyWebsite: quoteSettings.companyWebsite || '' }))}
                                style={{ height: '36px', padding: '0 12px', borderRadius: '9px', cursor: 'pointer', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontWeight: 700, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px', transition: 'background 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                                onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                            >
                                <RotateCcw size={13} /> Restaurar Mi Empresa
                            </button>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button onClick={() => window.print()} style={{ height: '38px', padding: '0 20px', borderRadius: '9px', cursor: 'pointer', border: 'none', background: '#111827', color: '#fff', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', transition: 'transform 0.1s' }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}>
                            <Printer size={16} /> Exportar PDF
                        </button>
                        <button onClick={onClose} style={{ width: '38px', height: '38px', borderRadius: '50%', border: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s, color 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#1e293b'; }} onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}>
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* ── BODY ── */}
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                    {/* ── PANEL EDICIÓN LATERAL ── */}
                    <AnimatePresence>
                        {editMode && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: '360px', opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                className="no-print"
                                style={{ flexShrink: 0, borderRight: '1px solid #e2e8f0', background: '#fff', overflowY: 'auto', overflowX: 'hidden' }}
                            >
                                <div style={{ padding: '16px', minWidth: '360px' }}>
                                    <div style={{ display: 'flex', gap: '10px', padding: '12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                                        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0', color: '#475569' }}>
                                            <Edit3 size={13} />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#1e293b', fontWeight: 800 }}>Modo Edición</p>
                                            <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>
                                                Puedes refinar cualquier detalle aquí. Los cambios son temporales y solo aplicarán a esta exportación.
                                            </p>
                                        </div>
                                    </div>

                                    <PanelSection title="Mi Empresa" icon={Building2}>
                                        <PanelField label="Nombre" value={ed.companyName} onChange={s('companyName')} />
                                        <PanelField label="RFC" value={ed.companyRFC} onChange={s('companyRFC')} />
                                        <PanelField label="Dirección" value={ed.companyAddress} onChange={s('companyAddress')} multiline />
                                        <PanelField label="Teléfono" value={ed.companyPhone} onChange={s('companyPhone')} />
                                        <PanelField label="Email" value={ed.companyEmail} onChange={s('companyEmail')} type="email" />
                                        <PanelField label="Sitio web" value={ed.companyWebsite} onChange={s('companyWebsite')} />
                                    </PanelSection>

                                    <PanelSection title="Datos del Cliente" icon={User} defaultOpen={true}>
                                        <PanelField label="Nombre / Empresa" value={ed.clientName} onChange={s('clientName')} />
                                        <PanelField label="RFC" value={ed.clientRFC} onChange={s('clientRFC')} />
                                        <PanelField label="Dirección de Facturación/Entrega" value={ed.clientAddress} onChange={s('clientAddress')} multiline />
                                        <PanelField label="Persona de contacto (Atención)" value={ed.clientContact} onChange={s('clientContact')} />
                                    </PanelSection>

                                    <PanelSection title="Cotización" icon={FileText} defaultOpen={false}>
                                        <PanelField label="Folio" value={ed.quoteId} onChange={s('quoteId')} />
                                        <PanelField label="Fecha" value={ed.quoteDate} onChange={s('quoteDate')} />
                                        <PanelField label="Vigencia (días)" value={ed.quoteValidity} onChange={s('quoteValidity')} type="number" />
                                        <div style={{ marginBottom: '9px' }}>
                                            <label style={{ display: 'block', fontSize: '0.66rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Moneda</label>
                                            <select value={ed.quoteCurrency || 'MXN'} onChange={e => s('quoteCurrency')(e.target.value)} style={{ width: '100%', padding: '6px 9px', borderRadius: '7px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontSize: '0.82rem', fontWeight: 600, outline: 'none' }}>
                                                {['MXN', 'USD', 'EUR', 'CAD'].map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <PanelField label="IVA (%)" value={ed.quoteTax} onChange={s('quoteTax')} type="number" />
                                        <PanelField label="Nota al pie" value={ed.quoteFooterNote} onChange={s('quoteFooterNote')} multiline />
                                    </PanelSection>

                                    <PanelSection title="Conceptos" icon={Tag} defaultOpen={false}>
                                        {(ed.items || []).map((item, idx) => (
                                            <div key={idx} style={{ padding: '12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
                                                <p style={{ margin: '0 0 10px', fontSize: '0.72rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Ítem {idx + 1}</p>
                                                <PanelField label="Nombre" value={item.name} onChange={v => setItem(idx, 'name', v)} />
                                                <PanelField label="Descripción" value={item.description} onChange={v => setItem(idx, 'description', v)} multiline />
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                    <PanelField label="Cantidad" value={item.quantity} onChange={v => setItem(idx, 'quantity', v)} type="number" />
                                                    <PanelField label="Precio Unit." value={item.price || item.unitPrice} onChange={v => setItem(idx, 'price', v)} type="number" />
                                                </div>
                                                <PanelField label="Descuento (%)" value={item.discount} onChange={v => setItem(idx, 'discount', v)} type="number" />
                                            </div>
                                        ))}
                                    </PanelSection>

                                    <PanelSection title="Datos Bancarios" icon={Landmark} defaultOpen={false}>
                                        <PanelField label="Banco" value={ed.bankName} onChange={s('bankName')} />
                                        <PanelField label="Titular de cuenta" value={ed.bankHolder} onChange={s('bankHolder')} />
                                        <PanelField label="CLABE" value={ed.bankCLABE} onChange={s('bankCLABE')} mono />
                                        <PanelField label="N° de cuenta" value={ed.bankAccount} onChange={s('bankAccount')} mono />
                                        <PanelField label="Referencia o Concepto" value={ed.bankReference} onChange={s('bankReference')} />
                                    </PanelSection>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── DOCUMENTO PREVIEW A IMPRIMIR ── */}
                    <div className="preview-scroll-viewport" style={{ flex: 1, overflowY: 'auto', padding: '3rem 1.5rem', background: '#f1f5f9' }}>
                        <div id="printable-quote" style={{ background: '#fff', width: '100%', maxWidth: '780px', margin: '0 auto', minHeight: '1050px', padding: '56px 64px', position: 'relative', color: '#111827', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}>

                            {/* ── ENCABEZADO ── */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '52px', gap: '32px' }}>
                                {/* Logo + Empresa */}
                                <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
                                        {quoteSettings.logoUrl ? (
                                            <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                                                <img src={quoteSettings.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            </div>
                                        ) : (
                                            <div style={{ background: '#111827', color: '#fff', padding: '12px', borderRadius: '12px', flexShrink: 0 }}>
                                                <Building2 size={28} />
                                            </div>
                                        )}
                                        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0, color: '#111827', wordBreak: 'break-word', lineHeight: 1.1 }}>
                                            {ed.companyName || '—'}
                                        </h1>
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: '#4b5563', lineHeight: 1.7 }}>
                                        {ed.companyAddress && <div style={{ whiteSpace: 'pre-wrap', marginBottom: '2px' }}>{ed.companyAddress}</div>}
                                        {ed.companyRFC && <div>RFC: <strong style={{ color: '#111827' }}>{ed.companyRFC}</strong></div>}
                                        {ed.companyPhone && <div>Tel: {ed.companyPhone}</div>}
                                        {ed.companyEmail && <div>{ed.companyEmail}</div>}
                                        {ed.companyWebsite && <div>{ed.companyWebsite}</div>}
                                    </div>
                                </div>

                                {/* Tipo de documento, Folio y Fecha */}
                                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 'auto' }}>
                                    <p style={{ fontSize: '2.4rem', fontWeight: 200, color: '#e5e7eb', margin: '0 0 8px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>COTIZACIÓN</p>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                                        Folio: #{ed.quoteId || '—'}
                                    </p>
                                    <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '10px' }}>
                                        <span style={{ display: 'inline-block', minWidth: '50px' }}>Fecha:</span> <strong style={{ color: '#111827' }}>{ed.quoteDate || '—'}</strong>
                                    </p>
                                </div>
                            </div>

                            {/* ── SECCIÓN: CLIENTE + DETALLES ── */}
                            <div style={{ display: 'flex', gap: '32px', marginBottom: '48px', alignItems: 'stretch' }}>
                                {/* Cliente */}
                                <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column' }}>
                                    <p style={{ fontSize: '0.68rem', fontWeight: 900, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 12px' }}>Cliente / Destinatario</p>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 10px', color: '#111827', wordBreak: 'break-word', lineHeight: 1.25 }}>
                                        {ed.clientName || '—'}
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {ed.clientRFC && (
                                            <p style={{ fontSize: '0.82rem', color: '#4b5563', margin: 0 }}>
                                                <strong style={{ color: '#111827' }}>RFC:</strong> {ed.clientRFC}
                                            </p>
                                        )}
                                        {ed.clientAddress && (
                                            <div style={{ fontSize: '0.82rem', color: '#4b5563', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                                <strong style={{ color: '#111827' }}>Dirección:</strong> {ed.clientAddress}
                                            </div>
                                        )}
                                        {ed.clientContact && (
                                            <p style={{ fontSize: '0.82rem', color: '#4b5563', margin: 0 }}>
                                                <strong style={{ color: '#111827' }}>Atención:</strong> {ed.clientContact}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Separador visual */}
                                <div style={{ width: '1px', background: '#e5e7eb', flexShrink: 0 }} />

                                {/* Detalles Comerciales */}
                                <div style={{ flexShrink: 0, width: '200px' }}>
                                    <p style={{ fontSize: '0.68rem', fontWeight: 900, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 12px' }}>Detalles de Operación</p>
                                    <div style={{ borderTop: '1px solid #f3f4f6' }}>
                                        <DocDetailRow label="Validez">
                                            {ed.quoteValidity || 30} días
                                        </DocDetailRow>
                                        <DocDetailRow label="Moneda">
                                            {ed.quoteCurrency || 'MXN'}
                                        </DocDetailRow>
                                        <DocDetailRow label="IVA">
                                            {ed.quoteTax || 0}%
                                        </DocDetailRow>
                                    </div>
                                </div>
                            </div>

                            {/* ── TABLA DE CONCEPTOS ── */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '44px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #111827', textAlign: 'left' }}>
                                        <th style={{ padding: '12px 8px', fontSize: '0.72rem', fontWeight: 900, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Concepto</th>
                                        <th style={{ padding: '12px 8px', fontSize: '0.72rem', fontWeight: 900, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', width: '60px' }}>Cant.</th>
                                        <th style={{ padding: '12px 8px', fontSize: '0.72rem', fontWeight: 900, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right', width: '100px' }}>Unitario</th>
                                        {hayDescuentos && <th style={{ padding: '12px 8px', fontSize: '0.72rem', fontWeight: 900, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right', width: '60px' }}>Dto.</th>}
                                        <th style={{ padding: '12px 8px', fontSize: '0.72rem', fontWeight: 900, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right', width: '110px' }}>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(ed.items || []).map((item, idx) => {
                                        const price = Number(item.price || item.unitPrice || 0);
                                        const qty = Number(item.quantity || 1);
                                        const disc = Number(item.discount || 0);
                                        const sub = price * qty * (1 - disc / 100);
                                        return (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{ padding: '18px 8px' }}>
                                                    <p style={{ fontWeight: 800, fontSize: '0.92rem', color: '#111827', margin: '0 0 4px', lineHeight: 1.3, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                                        {item.name || '—'}
                                                    </p>
                                                    {item.description && (
                                                        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </td>
                                                <td style={{ padding: '18px 8px', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem', verticalAlign: 'top' }}>
                                                    {qty}
                                                </td>
                                                <td style={{ padding: '18px 8px', textAlign: 'right', fontSize: '0.9rem', verticalAlign: 'top' }}>
                                                    ${fmt(price)}
                                                </td>
                                                {hayDescuentos && (
                                                    <td style={{ padding: '18px 8px', textAlign: 'right', fontWeight: 700, fontSize: '0.82rem', color: disc > 0 ? '#4b5563' : '#d1d5db', verticalAlign: 'top' }}>
                                                        {disc > 0 ? `${disc}%` : '—'}
                                                    </td>
                                                )}
                                                <td style={{ padding: '18px 8px', textAlign: 'right', fontWeight: 800, fontSize: '0.92rem', verticalAlign: 'top' }}>
                                                    ${fmt(sub)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* ── TOTALES ── */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '44px' }}>
                                <div style={{ width: '280px' }}>
                                    {descuentoTotal > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem' }}>
                                            <span style={{ color: '#6b7280' }}>Descuentos aplicados:</span>
                                            <span style={{ fontWeight: 700, color: '#374151' }}>−${fmt(descuentoTotal)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#6b7280' }}>Subtotal:</span>
                                        <span style={{ fontWeight: 600, color: '#111827' }}>${fmt(subtotalNeto)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0 16px', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#6b7280' }}>IVA ({ed.quoteTax || 0}%):</span>
                                        <span style={{ fontWeight: 600, color: '#111827' }}>${fmt(iva)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #111827', paddingTop: '16px', alignItems: 'baseline' }}>
                                        <span style={{ fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', color: '#111827' }}>Total:</span>
                                        <span style={{ fontWeight: 900, fontSize: '1.8rem', color: '#111827', lineHeight: 1 }}>
                                            ${fmt(total)} <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', letterSpacing: '0.05em' }}>{ed.quoteCurrency || 'MXN'}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* ── CONDICIONES DE PAGO ── */}
                            {quoteSettings.paymentConditions?.length > 0 && (
                                <div style={{ marginBottom: '28px', padding: '24px', background: '#f9fafb', borderRadius: '14px', border: '1px solid #f3f4f6' }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 900, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>Condiciones de Pago</p>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        {quoteSettings.paymentConditions.map(cond => (
                                            <div key={cond.id} style={{ flex: '1 1 120px', minWidth: '120px', padding: '16px 14px', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                                <p style={{ margin: '0 0 4px', fontSize: '1.4rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.02em' }}>{cond.percentage}%</p>
                                                <p style={{ margin: '0 0 4px', fontSize: '0.85rem', fontWeight: 800, color: '#111827' }}>{cond.label}</p>
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.5 }}>{cond.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── DATOS BANCARIOS ── */}
                            {ed.bankName && (
                                <div style={{ marginBottom: '28px', padding: '24px', background: '#f9fafb', borderRadius: '14px', border: '1px solid #f3f4f6' }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 900, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>Datos para Transferencia</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                        {[
                                            { label: 'Banco', value: ed.bankName, mono: false },
                                            { label: 'Titular', value: ed.bankHolder, mono: false },
                                            { label: 'CLABE interbancaria', value: ed.bankCLABE, mono: true },
                                            { label: 'Número de cuenta', value: ed.bankAccount, mono: true },
                                        ].filter(r => r.value).map(row => (
                                            <div key={row.label} style={{ display: 'flex', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                                                <span style={{ fontSize: '0.82rem', color: '#6b7280', width: '160px', flexShrink: 0, paddingTop: '2px' }}>{row.label}:</span>
                                                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827', fontFamily: row.mono ? '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace' : 'inherit', letterSpacing: row.mono ? '0.05em' : 'normal', wordBreak: 'break-word', flex: 1 }}>{row.value}</span>
                                            </div>
                                        ))}
                                        {ed.bankReference && (
                                            <div style={{ paddingTop: '12px', fontSize: '0.82rem', color: '#374151', lineHeight: 1.5 }}>
                                                Concepto o Referencia: <strong style={{ color: '#111827' }}>"{ed.bankReference}" — Folio #{ed.quoteId}</strong>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── FIRMAS ── */}
                            <div style={{ marginTop: '64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', pageBreakInside: 'avoid' }}>
                                {[
                                    { label: quoteSettings.signatureLabelLeft || 'Firma Autorizada', sub: ed.companyName },
                                    { label: quoteSettings.signatureLabelRight || 'Cliente', sub: 'Nombre y Firma de Aceptación' },
                                ].map(sig => (
                                    <div key={sig.label} style={{ textAlign: 'center' }}>
                                        <div style={{ borderTop: '1px solid #d1d5db', paddingTop: '16px' }}>
                                            <p style={{ fontWeight: 800, fontSize: '0.88rem', margin: '0 0 4px', color: '#111827' }}>{sig.label}</p>
                                            <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sig.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ── PIE DE PÁGINA ── */}
                            <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
                                {ed.quoteFooterNote && (
                                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0 0 8px', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                                        {ed.quoteFooterNote}
                                    </p>
                                )}
                                <p style={{ margin: '0', fontSize: '0.72rem', color: '#d1d5db', fontWeight: 600 }}>{ed.companyName}</p>
                            </div>

                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── CSS PRINT MEJORADO ── */}
            <style>{`
                @media print {
                    /* Permitir que el body y html se expandan según el contenido del PDF */
                    html, body {
                        background: #ffffff !important;
                        height: auto !important;
                        overflow: visible !important;
                    }

                    /* Quitar fondos y bloqueos de la UI superpuesta (el Modal) */
                    .modal-overlay.noprint-wrapper {
                        position: static !important;
                        background: transparent !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }

                    .quote-preview-modal {
                        position: static !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        box-shadow: none !important;
                        border: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: transparent !important;
                        transform: none !important;
                        overflow: visible !important;
                        height: auto !important;
                    }

                    .preview-scroll-viewport {
                        position: static !important;
                        overflow: visible !important;
                        height: auto !important;
                        padding: 0 !important;
                        background: transparent !important;
                    }

                    #printable-quote {
                        width: 100% !important;
                        max-width: 100% !important;
                        box-shadow: none !important;
                        border: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    /* Forzar colores exactos */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    @page {
                        margin: 1.2cm 1.5cm;
                        size: Letter portrait;
                    }
                }

                /* Scrollbar clean styling */
                .preview-scroll-viewport::-webkit-scrollbar { width: 6px; }
                .preview-scroll-viewport::-webkit-scrollbar-track { background: transparent; }
                .preview-scroll-viewport::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 8px; }
            `}</style>
        </div>
    );
};

export default QuotePreview;
