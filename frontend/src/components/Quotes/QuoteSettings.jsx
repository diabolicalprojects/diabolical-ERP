import { X, Save, Palette, Building, FileText, Type, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';

const QuoteSettings = ({ isOpen, onClose }) => {
    const { quoteSettings, setQuoteSettings } = useApp();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setQuoteSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setQuoteSettings(prev => ({ ...prev, logoUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay modal-center" onClick={onClose} style={{ zIndex: 10000 }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="glass-card"
                style={{
                    maxWidth: '600px',
                    width: '95%',
                    padding: '2rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--glass-border)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'var(--text-primary)', padding: '8px', borderRadius: '10px' }}>
                            <Palette size={20} color="var(--bg-black)" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Configuración de Plantilla</h2>
                            <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: 0 }}>Personaliza tus documentos PDF</p>
                        </div>
                    </div>
                    <button className="icon-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="settings-grid" style={{ display: 'grid', gap: '1.5rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
                    {/* Company Info Section */}
                    <section>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            <Building size={16} /> Identidad del Emisor
                        </h4>

                        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--glass-border)' }}>
                            <div style={{ width: '80px', height: '80px', background: 'var(--bg-black)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                                {quoteSettings.logoUrl ? (
                                    <img src={quoteSettings.logoUrl} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <Image size={32} opacity={0.2} />
                                )}
                            </div>
                            <div>
                                <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                                    <Image size={14} /> Subir Logo
                                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                                </label>
                                <p style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '8px' }}>Recomendado: PNG fondo transparente</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label>Nombre de Empresa</label>
                                <input name="companyName" value={quoteSettings.companyName} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>RFC / ID Fiscal</label>
                                <input name="companyRFC" value={quoteSettings.companyRFC} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="input-group" style={{ marginTop: '1rem' }}>
                            <label>Dirección Fiscal</label>
                            <input name="companyAddress" value={quoteSettings.companyAddress} onChange={handleChange} />
                        </div>
                    </section>

                    {/* Styling Section */}
                    <section>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            <Palette size={16} /> Estilo Visual
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label>Color de Acento</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input type="color" name="accentColor" value={quoteSettings.accentColor} onChange={handleChange} style={{ padding: 0, width: '40px', height: '40px', border: 'none', background: 'transparent' }} />
                                    <input name="accentColor" value={quoteSettings.accentColor} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>IVA (%)</label>
                                <input type="number" name="taxRate" value={quoteSettings.taxRate} onChange={handleChange} />
                            </div>
                        </div>
                    </section>

                    {/* Bottom Labels Section */}
                    <section>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            <Type size={16} /> Firmas y Pie de Página
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label>Etiqueta Firma Izq.</label>
                                <input name="signatureLabelLeft" value={quoteSettings.signatureLabelLeft} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>Etiqueta Firma Der.</label>
                                <input name="signatureLabelRight" value={quoteSettings.signatureLabelRight} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="input-group" style={{ marginTop: '1rem' }}>
                            <label>Nota al Pie (Términos)</label>
                            <textarea
                                name="footerNote"
                                value={quoteSettings.footerNote}
                                onChange={handleChange}
                                rows="3"
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                            />
                        </div>
                    </section>
                </div>

                <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                    <button className="btn-primary" style={{ flex: 1 }} onClick={async () => {
                        try {
                            await saveQuoteSettings(quoteSettings);
                            onClose();
                        } catch (err) {
                            alert('Error al guardar la configuración');
                        }
                    }}>
                        <Save size={18} /> Guardar Configuración
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default QuoteSettings;
