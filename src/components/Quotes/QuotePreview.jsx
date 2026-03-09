import React from 'react';
import { X, Printer, Send, Building2, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';

const QuotePreview = ({ quote, isOpen, onClose }) => {
    const { quoteSettings } = useApp();
    if (!quote || !isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    const taxAmount = (quote.amount * (quoteSettings.taxRate / 100)) / (1 + (quoteSettings.taxRate / 100));
    const subtotal = quote.amount - taxAmount;

    return (
        <div className="modal-overlay modal-center" onClick={onClose} style={{ zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="quote-preview-modal"
                style={{
                    maxWidth: '1000px',
                    width: '95%',
                    height: '90vh',
                    background: '#f8fafc',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Toolbar */}
                <div className="no-print" style={{
                    padding: '1.2rem 2.5rem',
                    background: '#fff',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ background: '#000000', padding: '6px', borderRadius: '8px' }}>
                                <Building2 size={18} color="white" />
                            </div>
                            <span style={{ fontWeight: 700, color: '#1e293b' }}>Previsualización</span>
                        </div>
                        <div style={{ height: '24px', width: '1px', background: '#e2e8f0' }}></div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn-primary" onClick={handlePrint} style={{ height: '38px', padding: '0 1.2rem', fontSize: '0.85rem' }}>
                                <Printer size={16} /> Exportar como PDF
                            </button>
                            <button className="btn-secondary" style={{ height: '38px', padding: '0 1.2rem', fontSize: '0.85rem' }}>
                                <Download size={16} /> Descargar JSON
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ border: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Document Scrollable Area */}
                <div className="preview-scroll-viewport" style={{ flex: 1, overflowY: 'auto', padding: '3rem 1rem' }}>
                    <div id="printable-quote" className="quote-document-paper" style={{
                        background: '#fff',
                        width: '100%',
                        maxWidth: '800px',
                        margin: '0 auto',
                        minHeight: '1050px',
                        padding: '4rem',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        position: 'relative',
                        color: '#1a1a1a'
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5rem', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
                                    {quoteSettings.logoUrl ? (
                                        <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <img src={quoteSettings.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        </div>
                                    ) : (
                                        <div style={{ background: '#000', color: '#fff', padding: '10px', borderRadius: '12px' }}>
                                            <Building2 size={32} />
                                        </div>
                                    )}
                                    <h1 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.03em', margin: 0 }}>{quoteSettings.companyName}</h1>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.6 }}>
                                    <p style={{ fontWeight: 700, color: '#111827' }}>{quoteSettings.companyName} S.A.</p>
                                    <p>{quoteSettings.companyAddress}</p>
                                    <p>RFC: {quoteSettings.companyRFC}</p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h2 style={{ fontSize: '3rem', fontWeight: 200, color: '#e2e8f0', margin: '0 0 10px 0', letterSpacing: '0.1em' }}>COTIZACIÓN</h2>
                                <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#000000', margin: 0 }}>Folio: #{quote.id}</p>
                                <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '15px' }}>Fecha: <strong>{quote.date}</strong></p>
                            </div>
                        </div>

                        {/* Addresses Area */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '4rem', marginBottom: '5rem' }}>
                            <div>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.2rem' }}>Cliente / Destinatario</h4>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px 0' }}>{quote.customer}</h3>
                                <p style={{ fontSize: '0.95rem', color: '#4b5563', marginBottom: '4px' }}><strong>RFC:</strong> XAXX010101-000</p>
                                <p style={{ fontSize: '0.95rem', color: '#4b5563' }}><strong>Dirección:</strong> Av. Principal s/n, Col. Centro</p>
                            </div>
                            <div style={{ background: '#f9fafb', padding: '2rem', borderRadius: '20px', border: '1px solid #f3f4f6' }}>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.2rem' }}>Detalles Comerciales</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
                                    <span style={{ color: '#6b7280' }}>Validez:</span>
                                    <span style={{ fontWeight: 700 }}>30 Días</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
                                    <span style={{ color: '#6b7280' }}>Moneda:</span>
                                    <span style={{ fontWeight: 700 }}>MXN (Pesos)</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                    <span style={{ color: '#6b7280' }}>Pago:</span>
                                    <span style={{ fontWeight: 700 }}>Transferencia</span>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '5rem' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: `2px solid #111827` }}>
                                    <th style={{ padding: '1.5rem 0.5rem', fontSize: '0.8rem', fontWeight: 900, color: '#111827', textTransform: 'uppercase' }}>Descripción</th>
                                    <th style={{ padding: '1.5rem 0.5rem', fontSize: '0.8rem', fontWeight: 900, color: '#111827', textTransform: 'uppercase', textAlign: 'center' }}>Cant.</th>
                                    <th style={{ padding: '1.5rem 0.5rem', fontSize: '0.8rem', fontWeight: 900, color: '#111827', textTransform: 'uppercase', textAlign: 'right' }}>Unitario</th>
                                    <th style={{ padding: '1.5rem 0.5rem', fontSize: '0.8rem', fontWeight: 900, color: '#111827', textTransform: 'uppercase', textAlign: 'right' }}>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(quote.items || []).map((item, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '2rem 0.5rem' }}>
                                            <p style={{ fontWeight: 800, fontSize: '1rem', color: '#111827', margin: '0 0 4px 0' }}>{item.name}</p>
                                            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>Servicio profesional de implementación.</p>
                                        </td>
                                        <td style={{ padding: '2rem 0.5rem', textAlign: 'center', fontWeight: 600 }}>{item.quantity || 1}</td>
                                        <td style={{ padding: '2rem 0.5rem', textAlign: 'right' }}>${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td style={{ padding: '2rem 0.5rem', textAlign: 'right', fontWeight: 800 }}>${((item.price * (item.quantity || 1))).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <div style={{ width: '350px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1rem' }}>
                                    <span style={{ color: '#6b7280' }}>Subtotal:</span>
                                    <span style={{ fontWeight: 600, color: '#111827' }}>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', fontSize: '1rem' }}>
                                    <span style={{ color: '#6b7280' }}>I.V.A. ({quoteSettings.taxRate}%):</span>
                                    <span style={{ fontWeight: 600, color: '#111827' }}>${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #111827', paddingTop: '20px', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 900, fontSize: '1.2rem', textTransform: 'uppercase', color: '#111827' }}>Total Neto:</span>
                                    <span style={{ fontWeight: 900, fontSize: '2rem', color: '#000000' }}>${quote.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b7280' }}>MXN</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Footer / Notes */}
                        <div style={{ marginTop: '10rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ borderTop: '1px solid #d1d5db', padding: '15px 0' }}>
                                    <p style={{ fontWeight: 800, fontSize: '0.9rem', margin: 0 }}>{quoteSettings.signatureLabelLeft}</p>
                                    <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '4px 0 0 0' }}>Firma Autorizada</p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ borderTop: '1px solid #d1d5db', padding: '15px 0' }}>
                                    <p style={{ fontWeight: 800, fontSize: '0.9rem', margin: 0 }}>{quoteSettings.signatureLabelRight}</p>
                                    <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '4px 0 0 0' }}>Nombre y Firma</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '4rem', textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af', lineHeight: 2 }}>
                            <p>{quoteSettings.footerNote}</p>
                            <p><strong>{quoteSettings.companyName} - Generado Automáticamente</strong></p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <style>{`
                @media print {
                    /* 1. Apagar radicalmente todo elemento adyacente que interfiera */
                    .sidebar, .page-header, .header-actions, .data-table-container, .no-print {
                        display: none !important;
                    }

                    /* 2. Romper cadenas de Flex y posiciones absolutas/fijas desde el body hasta el modal */
                    body, html, #root, .layout, .main-content, .animate-fade, .modal-overlay, .quote-preview-modal, .preview-scroll-viewport {
                        display: block !important;
                        position: relative !important;
                        height: auto !important;
                        min-height: auto !important;
                        max-height: none !important;
                        width: auto !important;
                        max-width: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: visible !important;
                        box-shadow: none !important;
                        border: none !important;
                        transform: none !important;
                        background: transparent !important;
                        backdrop-filter: none !important;
                    }

                    /* 3. Imprimir estáticamente el div en vez de modo absoluto para evitar página única */
                    #printable-quote {
                        display: block !important;
                        position: static !important;
                        width: 100% !important;
                        max-width: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        box-shadow: none !important;
                        filter: grayscale(100%) !important;
                    }

                    @page { margin: 1cm; }
                    body { background: white !important; color: black !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; visibility: visible !important; }
                }

                /* Custom Scrollbar for the preview area */
                .preview-scroll-viewport::-webkit-scrollbar {
                    width: 8px;
                }
                .preview-scroll-viewport::-webkit-scrollbar-track {
                    background: transparent;
                }
                .preview-scroll-viewport::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.1);
                    borderRadius: 10px;
                }
                .preview-scroll-viewport::-webkit-scrollbar-thumb:hover {
                    background: rgba(0,0,0,0.2);
                }
            `}</style>
        </div>
    );
};

export default QuotePreview;
