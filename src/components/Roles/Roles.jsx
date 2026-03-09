import React, { useState } from 'react';
import { Shield, UserCheck, Lock, Users, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ModuleTutorial from '../Common/ModuleTutorial';

const Roles = () => {
    const { userRole, setUserRole } = useApp();

    const tutorialSteps = [
        "Selecciona un rol en el panel de la izquierda para ver sus privilegios.",
        "Los cambios en el rol activo se reflejan instantáneamente en el Dashboard.",
        "Los permisos definen qué partes del sistema son visibles para cada perfil.",
        "Usa estos perfiles para delegar funciones a tus equipos de trabajo."
    ];

    const roles = [
        { id: 'admin', name: 'Administrador', desc: 'Acceso total a todos los módulos y configuración global del sistema.', color: '#ef4444' },
        { id: 'vendedor', name: 'Vendedor', desc: 'Acceso a CRM, Clientes y Cotizaciones. Restringido en Finanzas e Inventario.', color: '#7c3aed' },
        { id: 'almacen', name: 'Almacén', desc: 'Gestión de Inventario, Recepción de mercancía y Catálogo de productos.', color: '#10b981' },
        { id: 'finanzas', name: 'Finanzas', desc: 'Acceso a CxC, CxP, Métricas y Reportes de rentabilidad.', color: '#f59e0b' }
    ];

    const permissions = {
        admin: ['CRM', 'Clientes', 'Cotizaciones', 'Inventario', 'Compras', 'CxC', 'CxP', 'Métricas', 'Ajustes'],
        vendedor: ['CRM', 'Clientes', 'Cotizaciones'],
        almacen: ['Inventario', 'Compras'],
        finanzas: ['CxC', 'CxP', 'Métricas', 'Clientes']
    };

    return (
        <div className="animate-fade">
            <header className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <h1>Roles y Permisos</h1>
                        <p className="subtitle">Gestión de acceso por perfil de usuario</p>
                    </div>
                    <ModuleTutorial
                        title="Roles"
                        description="Configura la seguridad y visibilidad de los módulos del ERP."
                        steps={tutorialSteps}
                    />
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {roles.map(r => (
                        <div
                            key={r.id}
                            className={`glass-card ${userRole === r.id ? 'active' : ''}`}
                            style={{
                                cursor: 'pointer',
                                borderLeft: userRole === r.id ? `4px solid ${r.color}` : '1px solid var(--glass-border)',
                                transition: 'all 0.2s'
                            }}
                            onClick={() => setUserRole(r.id)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <h4 style={{ color: userRole === r.id ? r.color : 'inherit' }}>{r.name}</h4>
                                {userRole === r.id && <Shield size={16} color={r.color} />}
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="glass-card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Lock size={20} color="var(--purple-main)" /> Módulos habilitados para {roles.find(r => r.id === userRole)?.name}
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                        {permissions[userRole].map(p => (
                            <div
                                key={p}
                                style={{
                                    padding: '1rem',
                                    background: 'var(--glass)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    border: '1px solid var(--glass-border)'
                                }}
                            >
                                <UserCheck size={16} color="var(--success)" />
                                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{p}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', gap: '1rem' }}>
                        <AlertCircle color="#f59e0b" size={24} />
                        <div>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b' }}>Zona de Seguridad</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Los cambios en los permisos afectan el acceso en tiempo real de todos los usuarios vinculados a este perfil.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Roles;
