import React, { useState } from 'react';
import { Plus, Search, FileText, Trash2, ExternalLink, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import QuoteWizard from './QuoteWizard';
import CustomQuoteBuilder from './CustomQuoteBuilder';
import { motion, AnimatePresence } from 'framer-motion';
import ModuleTutorial from '../Common/ModuleTutorial';

import QuotePreview from './QuotePreview';
import QuoteSettings from './QuoteSettings';
import { Settings } from 'lucide-react';

const STATUS_LABELS = {
    accepted: { label: 'Aceptada', cls: 'success' },
    sent: { label: 'Enviada', cls: 'warning' },
    draft: { label: 'Borrador', cls: '' },
    rejected: { label: 'Rechazada', cls: 'error' },
};

const Quotes = () => {
    const { quotes, deleteQuote } = useApp();
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isCustomOpen, setIsCustomOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handlePreview = (quote) => {
        setSelectedQuote(quote);
        setIsPreviewOpen(true);
    };

    const tutorialSteps = [
        "Usa 'Cotización Rápida' para armar propuestas desde tu catálogo existente.",
        "Usa 'Cotización Personalizada' para definir cada ítem manualmente a la medida.",
        "Visualiza el historial completo de propuestas enviadas.",
        "Descarga tus documentos en PDF para tus clientes.",
        "Consulta el estado (Aceptado/Pendiente) de cada folio."
    ];

    const filteredQuotes = (quotes || []).filter(q =>
        q.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade">
            <header className="page-header no-print">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <h1>Cotizaciones</h1>
                        <p className="subtitle">Propuestas comerciales y presupuestos</p>
                    </div>
                    <ModuleTutorial
                        title="Cotizaciones"
                        description="Crea propuestas profesionales para tus clientes."
                        steps={tutorialSteps}
                    />
                </div>
                <div className="header-actions">
                    <div className="search-bar-wrapper">
                        <Search className="search-bar-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar folio o cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn-secondary" onClick={() => setIsSettingsOpen(true)} title="Configurar Plantilla">
                        <Settings size={18} />
                    </button>
                    <button className="btn-secondary" onClick={() => setIsWizardOpen(true)}>
                        <Plus size={18} /> Rápida
                    </button>
                    <button className="btn-primary" onClick={() => setIsCustomOpen(true)}>
                        <Sparkles size={18} /> Personalizada
                    </button>
                </div>
            </header>

            <QuoteWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
            <CustomQuoteBuilder isOpen={isCustomOpen} onClose={() => setIsCustomOpen(false)} />
            <QuoteSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <QuotePreview
                quote={selectedQuote}
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
            />

            {/* Tarjetas de modo */}
            <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => setIsWizardOpen(true)}
                    style={{ padding: '1.2rem 1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)', background: 'var(--glass)', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                >
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Plus size={22} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem' }}>Cotización Rápida</p>
                        <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Desde catálogo de productos y servicios</p>
                    </div>
                </button>

                <button
                    onClick={() => setIsCustomOpen(true)}
                    style={{ padding: '1.2rem 1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)', background: 'var(--glass)', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#f59e0b'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                >
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(245,158,11,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Sparkles size={22} style={{ color: '#f59e0b' }} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem' }}>Cotización Personalizada</p>
                        <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Define cada ítem manualmente, con precios y descuentos</p>
                    </div>
                </button>
            </div>

            <div className="data-table-container glass-card no-print" style={{ padding: 0 }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Folio</th>
                                <th>Tipo</th>
                                <th>Cliente</th>
                                <th>Fecha</th>
                                <th>Monto</th>
                                <th>Estado</th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuotes.map((q) => {
                                const st = STATUS_LABELS[q.status] || { label: q.status, cls: '' };
                                return (
                                    <tr key={q.id}>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{q.id}</td>
                                        <td>
                                            {q.type === 'custom'
                                                ? <span style={{ fontSize: '0.7rem', padding: '2px 9px', borderRadius: '6px', background: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontWeight: 700 }}>✦ Custom</span>
                                                : <span style={{ fontSize: '0.7rem', padding: '2px 9px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', fontWeight: 700 }}>Rápida</span>
                                            }
                                        </td>
                                        <td>{q.customer}</td>
                                        <td><span style={{ opacity: 0.6 }}>{q.date}</span></td>
                                        <td><span style={{ fontWeight: 700 }}>${q.amount.toLocaleString()}</span></td>
                                        <td>
                                            <span className={`status-badge ${st.cls}`}>
                                                {st.label}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button
                                                    className="btn-secondary"
                                                    style={{ padding: '0.4rem' }}
                                                    onClick={() => handlePreview(q)}
                                                    title="Previsualizar / PDF"
                                                >
                                                    <ExternalLink size={16} />
                                                </button>
                                                <button className="btn-secondary" style={{ padding: '0.4rem', color: 'var(--error)', borderColor: 'transparent' }} onClick={() => deleteQuote(q.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Quotes;
