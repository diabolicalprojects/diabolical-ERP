import React, { useState } from 'react';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Search, DollarSign, Calendar, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ModuleTutorial from '../Common/ModuleTutorial';

const Finances = () => {
    const { receivables, payables, registerPayment } = useApp();
    const [activeTab, setActiveTab] = useState('receivables'); // 'receivables' or 'payables'

    const tutorialSteps = [
        "Monitorea tus cuentas por cobrar y pagar desde un solo lugar.",
        "Registra pagos parciales o totales de tus clientes.",
        "Mantén un ojo en las facturas vencidas resaltadas en rojo.",
        "Controla tus gastos operativos en la sección de por pagar."
    ];

    const totalReceivable = receivables.reduce((acc, r) => acc + (r.amount - r.paid), 0);
    const totalPayable = payables.filter(p => p.status === 'pendiente').reduce((acc, p) => acc + p.amount, 0);

    return (
        <div className="animate-fade">
            <header className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <h1>Cuentas y Finanzas</h1>
                        <p className="subtitle">Control de ingresos y egresos operativos</p>
                    </div>
                    <ModuleTutorial
                        title="Finanzas"
                        description="Gestión integral de la liquidez y obligaciones de tu empresa."
                        steps={tutorialSteps}
                    />
                </div>
                <div className="header-actions">
                    <div className="glass-card" style={{ padding: '0.8rem 1.2rem', display: 'flex', gap: '2rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700, textTransform: 'uppercase' }}>Por Cobrar</p>
                            <h3 style={{ fontSize: '1.2rem' }}>${totalReceivable.toLocaleString()}</h3>
                        </div>
                        <div style={{ height: '30px', width: '1px', background: 'var(--glass-border)', alignSelf: 'center' }}></div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.7rem', color: 'var(--error)', fontWeight: 700, textTransform: 'uppercase' }}>Por Pagar</p>
                            <h3 style={{ fontSize: '1.2rem' }}>${totalPayable.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>
            </header>

            <div className="glass-card" style={{ padding: '0.6rem', marginBottom: '1.5rem', display: 'flex', gap: '0.8rem', width: 'fit-content' }}>
                <button
                    className="btn-secondary"
                    onClick={() => setActiveTab('receivables')}
                    style={activeTab === 'receivables' ? { background: 'var(--text-primary)', color: 'var(--bg-black)', borderColor: 'transparent' } : {}}
                >
                    <ArrowUpCircle size={16} /> Cuentas por Cobrar
                </button>
                <button
                    className="btn-secondary"
                    onClick={() => setActiveTab('payables')}
                    style={activeTab === 'payables' ? { background: 'var(--text-primary)', color: 'var(--bg-black)', borderColor: 'transparent' } : {}}
                >
                    <ArrowDownCircle size={16} /> Cuentas por Pagar
                </button>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                {activeTab === 'receivables' ? (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Factura</th>
                                <th>Cliente</th>
                                <th>Monto</th>
                                <th>Pagado</th>
                                <th>Pendiente</th>
                                <th>Estatus</th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {receivables.map(r => (
                                <tr key={r.id}>
                                    <td style={{ fontWeight: 600 }}>{r.id}</td>
                                    <td>{r.client}</td>
                                    <td>${r.amount.toLocaleString()}</td>
                                    <td style={{ color: 'var(--success)' }}>${r.paid.toLocaleString()}</td>
                                    <td style={{ fontWeight: 700 }}>${(r.amount - r.paid).toLocaleString()}</td>
                                    <td>
                                        <span className={`status-badge ${r.status === 'pagado' ? 'success' : r.status === 'vencido' ? 'error' : 'warning'}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        {r.status !== 'pagado' && (
                                            <button
                                                className="btn-primary"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                                onClick={() => registerPayment(r.id, 1000)} // Simulating 1k payment
                                            >
                                                Registrar Pago
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Folio</th>
                                <th>Concepto</th>
                                <th>Proveedor</th>
                                <th>Monto</th>
                                <th>Estatus</th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payables.map(p => (
                                <tr key={p.id}>
                                    <td style={{ fontWeight: 600 }}>{p.id}</td>
                                    <td>{p.concept}</td>
                                    <td>{p.vendor}</td>
                                    <td style={{ fontWeight: 700 }}>${p.amount.toLocaleString()}</td>
                                    <td>
                                        <span className={`status-badge ${p.status === 'pagado' ? 'success' : 'warning'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        {p.status === 'pendiente' && (
                                            <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                                                Pagar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Finances;
