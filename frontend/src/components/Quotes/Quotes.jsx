import React, { useState } from 'react';
import { Plus, Search, FileText, Trash2, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import QuoteWizard from './QuoteWizard';
import { motion, AnimatePresence } from 'framer-motion';
import ModuleTutorial from '../Common/ModuleTutorial';

import QuotePreview from './QuotePreview';
import QuoteSettings from './QuoteSettings';
import { Settings } from 'lucide-react';

const Quotes = () => {
    const { quotes, deleteQuote } = useApp();
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handlePreview = (quote) => {
        setSelectedQuote(quote);
        setIsPreviewOpen(true);
    };

    const tutorialSteps = [
        "Genera presupuestos rápidos con el asistente de cotización.",
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
            <header className="page-header">
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
                    <button className="btn-primary" onClick={() => setIsWizardOpen(true)}>
                        <Plus size={18} /> Nueva Cotización
                    </button>
                </div>
            </header>

            <QuoteWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
            <QuoteSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <QuotePreview
                quote={selectedQuote}
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
            />

            <div className="data-table-container glass-card" style={{ padding: 0 }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Folio</th>
                                <th>Cliente</th>
                                <th>Fecha</th>
                                <th>Monto</th>
                                <th>Estado</th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuotes.map((q) => (
                                <tr key={q.id}>
                                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{q.id}</td>
                                    <td>{q.customer}</td>
                                    <td><span style={{ opacity: 0.6 }}>{q.date}</span></td>
                                    <td><span style={{ fontWeight: 700 }}>${q.amount.toLocaleString()}</span></td>
                                    <td>
                                        <span className={`status-badge ${q.status === 'accepted' ? 'success' : 'warning'}`}>
                                            {q.status}
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Quotes;
