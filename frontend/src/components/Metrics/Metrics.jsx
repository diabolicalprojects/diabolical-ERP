import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { Presentation, Eye, EyeOff, TrendingUp, Target, BarChart3, Activity, PieChart as PieIcon, Calendar, ClipboardList, Info, Percent } from 'lucide-react';
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
    const [visibility, setVisibility] = useState({ sales: true, costs: true });
    const [showBarSales, setShowBarSales] = useState(true);
    const [funnelFilter, setFunnelFilter] = useState('all');

    const totalSales = dataSales.reduce((acc, curr) => acc + curr.sales, 0);
    const totalCosts = dataSales.reduce((acc, curr) => acc + curr.costs, 0);
    const profit = totalSales - totalCosts;
    const margin = ((profit / totalSales) * 100).toFixed(1);
    const roi = ((profit / totalCosts) * 100).toFixed(1);

    const tutorialSteps = [
        "Consulta el balance operativo semanal en el gráfico principal.",
        "Usa los botones de visibilidad para filtrar ingresos o costos.",
        "El embudo de conversión te permite ver el rendimiento comercial.",
        "Cambia los filtros en cada gráfica para un análisis más profundo."
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

    return (
        <div className="animate-fade printable-area" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header for PDF Generation */}
            <div className="print-only-header">
                <div>
                    <h1 style={{ margin: 0, fontSize: '28px', color: '#7c3aed' }}>Análisis Ejecutivo de Inteligencia</h1>
                    <p style={{ color: '#666', marginTop: '5px', fontSize: '14px' }}>Resumen Semanal de Operaciones • Diabolical</p>
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
                        <p className="subtitle">Análisis avanzado de métricas y rendimiento</p>
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
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Resumen Ejecutivo Semanal</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.2rem', marginBottom: '2rem' }}>
                    <div className="summary-item">
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Ventas Totales</p>
                        <h4 style={{ fontSize: '1.2rem', color: 'var(--purple-light)' }}>${totalSales.toLocaleString()}</h4>
                    </div>
                    <div className="summary-item">
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Costos Operativos</p>
                        <h4 style={{ fontSize: '1.2rem', color: 'var(--error)' }}>${totalCosts.toLocaleString()}</h4>
                    </div>
                    <div className="summary-item">
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Utilidad</p>
                        <h4 style={{ fontSize: '1.2rem', color: 'var(--success)' }}>${profit.toLocaleString()}</h4>
                    </div>
                    <div className="summary-item">
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Margen Bruto</p>
                        <h4 style={{ fontSize: '1.2rem' }}>{margin}%</h4>
                    </div>
                    <div className="summary-item">
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>ROI Semanal</p>
                        <h4 style={{ fontSize: '1.2rem', color: 'var(--purple-main)' }}>{roi}%</h4>
                    </div>
                </div>

                <div style={{ padding: '1.2rem', background: 'var(--glass)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Info size={18} style={{ marginTop: '3px', color: 'var(--purple-main)' }} />
                        <div>
                            <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>Interpretación de Rendimiento</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                El **Retorno de Inversión (ROI) del {roi}%** indica una alta eficiencia en el uso del capital operativo durante esta semana.
                                Por cada dólar invertido en costos, se generó un rendimiento significativo, superando el promedio proyectado para el trimestre.
                                Se sugiere capitalizar esta liquidez para negociar mejores precios con proveedores en el módulo de Compras.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="metrics-content-flow" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Main Cash Flow Chart */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                            <TrendingUp size={20} color="var(--purple-main)" /> Balance Semanal de Efectivo
                        </h3>
                        <div className="no-print" style={{ display: 'flex', gap: '0.6rem' }}>
                            <button
                                className="btn-secondary"
                                onClick={() => setVisibility({ ...visibility, sales: !visibility.sales })}
                                style={{ fontSize: '0.75rem', display: 'flex', gap: '8px', alignItems: 'center', minWidth: '100px', justifyContent: 'center', borderColor: visibility.sales ? 'var(--purple-main)' : 'var(--glass-border)', padding: '0.5rem 1rem' }}
                            >
                                {visibility.sales ? <Eye size={14} /> : <EyeOff size={14} />} Ingresos
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => setVisibility({ ...visibility, costs: !visibility.costs })}
                                style={{ fontSize: '0.75rem', display: 'flex', gap: '8px', alignItems: 'center', minWidth: '100px', justifyContent: 'center', borderColor: visibility.costs ? 'var(--error)' : 'var(--glass-border)', padding: '0.5rem 1rem' }}
                            >
                                {visibility.costs ? <Eye size={14} /> : <EyeOff size={14} />} Costos
                            </button>
                        </div>
                    </div>

                    <div style={{ height: '320px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dataSales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--purple-main)" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="var(--purple-main)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--error)" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="var(--error)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} axisLine={false} tickLine={false} />
                                <YAxis stroke="var(--text-secondary)" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                {visibility.sales && (
                                    <Area name="Ingresos" type="monotone" dataKey="sales" stroke="var(--purple-main)" strokeWidth={2.5} fill="url(#colorSales)" />
                                )}
                                {visibility.costs && (
                                    <Area name="Costos" type="monotone" dataKey="costs" stroke="var(--error)" strokeWidth={2} fill="url(#colorCosts)" />
                                )}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="metrics-grid-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ padding: '1.8rem' }}>
                        <h3 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', marginBottom: '1.5rem' }}>
                            <BarChart3 size={18} color="var(--purple-main)" /> Desempeño Diario
                        </h3>
                        <div style={{ height: '260px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dataSales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} axisLine={false} tickLine={false} />
                                    <YAxis stroke="var(--text-secondary)" fontSize={11} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    {showBarSales && <Bar dataKey="sales" name="Ventas" fill="var(--purple-main)" radius={[4, 4, 0, 0]} barSize={18} />}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '1.8rem' }}>
                        <h3 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', marginBottom: '1.5rem' }}>
                            <Target size={18} color="var(--purple-main)" /> Conversión de Embudo
                        </h3>
                        <div style={{ height: '260px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={funnelFilter === 'all' ? dataConversion : dataConversion.filter(d => d.name === funnelFilter)}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={55}
                                        outerRadius={75}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {dataConversion.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '15px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
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
