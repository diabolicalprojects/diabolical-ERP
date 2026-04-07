import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import LogoNegro from '../../assets/LOGO-DIABOLICAL-CUADRADO-NEGRO.svg';

const Login = () => {
    const { login } = useApp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-main)',
            color: 'var(--text-main)'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                padding: '2.5rem',
                borderRadius: '1.5rem',
                background: 'var(--bg-card)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '1px solid var(--border-color)',
                textAlign: 'center'
            }}>
                <img src={LogoNegro} alt="Logo" style={{ width: '80px', marginBottom: '1.5rem' }} />
                <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>BIENVENIDO</h1>
                <p style={{ color: 'var(--text-dim)', marginBottom: '2rem', fontSize: '0.9rem' }}>ERP DIABOLICAL | ACCESO</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: '600' }}>EMAIL</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.8rem 1rem',
                                borderRadius: '0.8rem',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-main)',
                                color: 'var(--text-main)',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: '600' }}>CONTRASEÑA</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.8rem 1rem',
                                borderRadius: '0.8rem',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-main)',
                                color: 'var(--text-main)',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {error && <p style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>}

                    <button 
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            borderRadius: '0.8rem',
                            border: 'none',
                            background: 'var(--text-main)',
                            color: 'var(--bg-main)',
                            fontWeight: '800',
                            cursor: 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? 'CARGANDO...' : 'ENTRAR AL SISTEMA'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
