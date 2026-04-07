import React, { useState } from 'react';
import { HelpCircle, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ModuleTutorial = ({ title, description, steps }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{ position: 'relative' }}>
            <button
                className="tutorial-trigger"
                onClick={() => setIsOpen(!isOpen)}
                title="Ver guía del módulo"
            >
                <HelpCircle size={18} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="tutorial-box"
                        style={{ width: '320px' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Sparkles size={16} className="purple-icon" />
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Guía: {title}</h4>
                            </div>
                            <button className="icon-btn" onClick={() => setIsOpen(false)} style={{ width: '24px', height: '24px' }}>
                                <X size={14} />
                            </button>
                        </div>

                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.2rem', lineHeight: '1.4' }}>
                            {description}
                        </p>

                        <div className="tutorial-content" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                            {steps && steps.map((step, idx) => (
                                <div key={idx} className="tutorial-step">
                                    <div className="step-num">{idx + 1}</div>
                                    <p>{step}</p>
                                </div>
                            ))}
                        </div>

                        <button
                            className="btn-primary"
                            style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', marginTop: '0.5rem' }}
                            onClick={() => setIsOpen(false)}
                        >
                            ¡Entendido!
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ModuleTutorial;
