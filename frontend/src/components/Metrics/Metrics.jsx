import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Presentation, Eye, EyeOff, TrendingUp, Activity, Calendar, ClipboardList, Info } from 'lucide-react';
import ModuleTutorial from '../Common/ModuleTutorial';
import Logo from '../../assets/logo.svg';

const dataSales = [
    { name: 'Lun', sales: 4000, costs: 2400 },
    { name: 'Mar', sales: 3000, costs: 1398 },
    { name: 'Mie', sales: 5200, costs: 3800 },
    { name: 'Jue', sales: 2780, costs: 3908 },
    { name: 'Vie', sales: 3890, costs: 4800 },
    { name: 'Sab', sales: 4390, costs: 3800 },
    { name: 'Dom', sales: 5490, costs: 4300 },
];

const dataConversion = [
    { name: 'Nuevos', value: 45 },
    { name: 'Contacto', value: 30 },
    { name: 'Propuesta', value: 20 },
    { name: 'Cierre', value: 12 },
];

const COLORS = ['#7c3aed', '#a78bfa', '#6366f1', '#10b981'];

const Metrics = () => {
    const [metrics, setMetrics] = useState({
        pipeline: 0,
        cxc_pending: 0,
        cxp_pending: 0,
        quotes_accepted: 0
    });
    const [loading, setLoading] = useState(true);
    const [visibility, setVisibility] = useState({ sales: true, costs: true });
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await fetch(`${API_URL}/api/metrics/summary`);
                const data = await res.json();
                setMetrics(data);
            } catch (error) {
                console.error('Error fetching metrics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    // Since it's a new system, we'll keep the chart placeholders for visual balance 
    // but the summary cards (KPIs) MUST be real.
    // However, I will mark the charts as "Proyección" or "Historical" to avoid confusion.
    
    const totalSales = metrics.quotes_accepted;
    const totalCosts = metrics.cxp_pending;
    const profit = totalSales - totalCosts;
    const margin = totalSales > 0 ? ((profit / totalSales) * 100).toFixed(1) : "0.0";
    const roi = totalCosts > 0 ? ((profit / totalCosts) * 100).toFixed(1) : "0.0";

    const tutorialSteps = [
        "Consulta el balance operativo en tiempo real basado en cotizaciones aceptadas.",
        "El Pipeline refleja el valor total de tus oportunidades abiertas.",
        "Cuentas por Cobrar (CxC) muestra el flujo de efectivo pendiente de tus facturas.",
        "Exporta este análisis a PDF para juntas de revisión de resultados."
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--glass-border)',
                    padding: '12px',
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem'
                }}>
                    <p style={{ fontWeight: 600, marginBottom: '4px' }}>{label || payload[0].name}</p>
                    {payload.map((p, i) => (
                        <p key={i} style={{ color: p.color || p.fill }}>
                            {p.name}: {typeof p.value === 'number' ? `$${p.value.toLocaleString()}` : p.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) return (
        <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity className="animate-spin" size={48} color="var(--purple-main)" />
        </div>
    );

    return (
        <div className="animate-fade printable-area" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header for PDF Generation */}
            <div className="print-only-header">
                <div>
                    <h1 style={{ margin: 0, fontSize: '28px', color: '#7c3aed' }}>Análisis Ejecutivo de Inteligencia</h1>
                    <p style={{ color: '#666', marginTop: '5px', fontSize: '14px' }}>Resumen Real de Operaciones • Diabolical</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <img src={Logo} alt="Logo" style={{ width: '50px', height: '50px', marginBottom: '8px' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', color: '#666', fontSize: '12px' }}>
                        <Calendar size={12} /> {new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </div>
            </div>

            <header className="page-header no-print" style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <h1>Inteligencia de Negocio</h1>
                        <p className="subtitle">Métricas reales extraídas de la base de datos operativa</p>
                    </div>
                    <ModuleTutorial
                        title="Métricas"
                        description="Visualiza el flujo de caja y la eficiencia de tu embudo de ventas."
                        steps={tutorialSteps}
                    />
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={() => window.print()}>
                        <Presentation size={18} /> Exportar Reporte PDF
                    </button>
                </div>
            </header>

            {/* Executive Analysis Section */}
            <div className="glass-card executive-executive-summary" style={{ marginBottom: '1.5rem', padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                    <ClipboardList size={22} color="var(--purple-main)" />
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Estado Financiero Consolidado</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.2rem', marginBottom: '2rem' }}>
                    <div className="summary-item">
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Ventas Reales</p>
                        <h4 style={{ fontSize: '1.2rem', color: 'var(--purple-light)', fontWeight: 800 }}>${metrics.quotes_accepted.toLocaleString()}</h4>
                    </div>
                    <div className="summary-item">
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Cuentas por Pagar</p>
                        <h4 style={{ fontSize: '1.2rem', color: 'var(--error)', fontWeight: 800 }}>${metrics.cxp_pending.toLocaleString()}</h4>
                    </div>
                    <div className="summary-item">
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>CxC (Pendiente)</p>
                        <h4 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 800 }}>${metrics.cxc_pending.toLocaleString()}</h4>
                    </div>
                    <div className="summary-item">
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Margen Real</p>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{margin}%</h4>
                    </div>
                    <div className="summary-item">
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Oportunidades (DEAL)</p>
                        <h4 style={{ fontSize: '1.2rem', color: 'var(--purple-main)', fontWeight: 800 }}>${metrics.pipeline.toLocaleString()}</h4>
                    </div>
                </div>

                <div style={{ padding: '1.2rem', background: 'var(--glass)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Info size={18} style={{ marginTop: '3px', color: 'var(--purple-main)' }} />
                        <div>
                            <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>Interpretación de Integridad Financiera</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                {totalSales === 0 ? 
                                    "El sistema se encuentra en una fase inicial sin ventas consolidadas. Los indicadores se actualizarán automáticamente conforme se acepten Cotizaciones y se registren Pagos." :
                                    `Has generado un volumen de ventas aceptado de **$${totalSales.toLocaleString()}**. El balance entre las Cuentas por Cobrar y el Pipeline sugiere una proyección de crecimiento saludable para el cierre del ciclo.`
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="metrics-content-flow" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Visual Chart Placeholders - Labeled as Projections */}
                <div className="glass-card" style={{ padding: '2rem', opacity: 0.7 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                            <TrendingUp size={20} color="var(--purple-main)" /> Proyección Semanal de Efectivo (Mockup)
                        </h3>
                    </div>
                    <div style={{ height: '320px', width: '100%', filter: 'grayscale(0.5)' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dataSales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} axisLine={false} tickLine={false} />
                                <YAxis stroke="var(--text-secondary)" fontSize={11} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area name="Tendencia" type="monotone" dataKey="sales" stroke="var(--purple-main)" strokeWidth={2.5} fillOpacity={0.1} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Print Footer */}
            <div className="print-only-footer">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Diabolical • Inteligencia Operativa de Negocios</span>
                    <span>Página 1 de 1</span>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 1cm 1.5cm; }
                    .print-only-footer { 
                        display: block !important; 
                        position: fixed;
                        bottom: 0;
                        width: 100%;
                        border-top: 1px solid #efefef;
                        padding-top: 10pt;
                        font-size: 9pt;
                        color: #999;
                    }
                    .metrics-content-flow { gap: 20pt !important; }
                    .metrics-grid-container { display: flex !important; flex-direction: column !important; gap: 20pt !important; }
                    .glass-card { 
                        border: 1px solid #eeeeee !important; 
                        padding: 18pt !important; 
                        margin: 0 auto 12pt auto !important;
                        width: 100% !important;
                        box-shadow: none !important;
                    }
                    .executive-executive-summary {
                        background: #fbfbff !important;
                        border: 2px solid #7c3aed !important;
                    }
                    h1, h2, h3 { text-align: center !important; justify-content: center !important; }
                    .summary-item h4 { color: #000 !important; }
                }
            `}} />
        </div>
    );
};

export default Metrics;
