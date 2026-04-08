import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import LogoNegro from '../assets/LOGO-DIABOLICAL-CUADRADO-NEGRO.svg';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [theme, setTheme] = useState(localStorage.getItem('diabolical_theme') || 'dark');
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('diabolical_token'));
    const [loading, setLoading] = useState(true);

    // --- State ---
    const [inventory, setInventory] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [tracking, setTracking] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [deals, setDeals] = useState({ nuevo: [], contactado: [], propuesta: [], negociacion: [], ganado: [], perdido: [] });
    const [purchases, setPurchases] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [receivables, setReceivables] = useState([]);
    const [payables, setPayables] = useState([]);
    const [services, setServices] = useState([]);
    const [quotePresets, setQuotePresets] = useState([]);
    const [quoteSettings, setQuoteSettings] = useState({
        companyName: 'DIABOLICAL AI',
        companyAddress: 'Av. de la Reforma 405, CDMX',
        companyRFC: 'DIA240101-XXX',
        accentColor: '#000000',
        taxRate: 16,
        footerNote: 'Esta cotización tiene una vigencia legal de 30 días naturales.',
        signatureLabelLeft: 'Gerente Comercial',
        signatureLabelRight: 'Aceptación de Cliente',
    });

    const customerStatuses = ['activo', 'potencial', 'en_pausa', 'inactivo'];
    const projectStatuses = ['planeacion', 'en_curso', 'retrasado', 'finalizado'];

    // --- Sync Logic ---
    const syncData = async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        try {
            const [
                inv, cust, proj, track, q, d, p, v, r, pay, s, qp, qs
            ] = await Promise.all([
                api.get('/api/inventory').catch(() => ({ data: [] })),
                api.get('/api/customers').catch(() => ({ data: [] })),
                api.get('/api/projects').catch(() => ({ data: [] })),
                api.get('/api/tracking').catch(() => ({ data: [] })),
                api.get('/api/quotes').catch(() => ({ data: [] })),
                api.get('/api/deals').catch(() => ({ grouped: { nuevo: [], contactado: [], propuesta: [], negociacion: [], ganado: [], perdido: [] } })),
                api.get('/api/purchases').catch(() => ({ data: [] })),
                api.get('/api/vendors').catch(() => ({ data: [] })),
                api.get('/api/receivables').catch(() => ({ data: [] })),
                api.get('/api/payables').catch(() => ({ data: [] })),
                api.get('/api/services').catch(() => ({ data: [] })),
                api.get('/api/quote-presets').catch(() => ({ data: [] })),
                api.get('/api/quote-settings').catch(() => ({ 
                    companyName: 'DIABOLICAL AI', 
                    taxRate: 16 
                }))
            ]);

            setInventory(inv.data || []);
            setCustomers(cust.data || []);
            setProjects(proj.data || []);
            setTracking(track.data || []);
            setQuotes(q.data || []);
            setDeals(d.grouped || d.data || { nuevo: [], contactado: [], propuesta: [], negociacion: [], ganado: [], perdido: [] });
            setPurchases(p.data || []);
            setVendors(v.data || []);
            setReceivables(r.data || []);
            setPayables(pay.data || []);
            setServices(s.data || []);
            setQuotePresets(qp.data || []);
            setQuoteSettings(qs);
        } catch (e) {
            console.error('Error syncing data:', e);
        } finally {
            setLoading(false);
        }
    };

    // --- Auth API ---
    const login = async (email, password) => {
        const response = await api.login(email, password);
        localStorage.setItem('diabolical_token', response.token);
        localStorage.setItem('diabolical_user', JSON.stringify(response.user));
        setUser(response.user);
        setIsAuthenticated(true);
        return response;
    };

    const logout = () => {
        localStorage.removeItem('diabolical_token');
        localStorage.removeItem('diabolical_user');
        setUser(null);
        setIsAuthenticated(false);
    };

    // --- Module APIs ---
    const updateInventoryItem = async (id, updated) => {
        await api.put(`/api/inventory/${id}`, updated);
        syncData();
    };
    
    // CRM
    const addDeal = async (stage, deal) => {
        await api.post('/api/deals', { ...deal, stage });
        syncData();
    };
    const deleteDeal = async (stage, id) => {
        await api.delete(`/api/deals/${id}`);
        syncData();
    };

    // Tracking
    const toggleTracking = async (id) => {
        await api.patch(`/api/tracking/${id}/toggle`, {});
        syncData();
    };

    // Finances
    const registerPayment = async (id, amount) => {
        await api.patch(`/api/receivables/${id}/pay`, { amount });
        syncData();
    };

    const receiveOrder = async (orderId) => {
        await api.patch(`/api/purchases/${orderId}/receive`, {});
        syncData();
    };

    // Themes
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('diabolical_theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    // --- Credentials Vault ---
    const getClientCredentials = async (clientId) => {
        const res = await api.get(`/api/customers/${clientId}/credentials`);
        return res.data || [];
    };

    const addClientCredential = async (clientId, cred) => {
        await api.post(`/api/customers/${clientId}/credentials`, cred);
    };

    const revealCredential = async (id) => {
        const res = await api.get(`/api/credentials/${id}/reveal`);
        return res.password;
    };

    const deleteClientCredential = async (id) => {
        await api.delete(`/api/credentials/${id}`);
    };

    // Quotes
    const addQuote = async (quote) => {
        await api.post('/api/quotes', quote);
        syncData();
    };

    const deleteQuote = async (id) => {
        await api.delete(`/api/quotes/${id}`);
        syncData();
    };

    const saveQuoteSettings = async (settings) => {
        // Map frontend camelCase to backend snake_case
        const payload = {
            company_name: settings.companyName,
            company_address: settings.companyAddress,
            company_rfc: settings.companyRFC,
            accent_color: settings.accentColor,
            tax_rate: settings.taxRate,
            footer_note: settings.footerNote,
            signature_label_left: settings.signatureLabelLeft,
            signature_label_right: settings.signatureLabelRight,
            logo_url: settings.logoUrl
        };
        const res = await api.put('/api/quote-settings', payload);
        setQuoteSettings(res);
        return res;
    };



    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        const storedUser = localStorage.getItem('diabolical_user');
        if (storedUser) setUser(JSON.parse(storedUser));
        
        if (isAuthenticated) {
            syncData();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    return (
        <AppContext.Provider value={{
            theme, toggleTheme, user, login, logout, isAuthenticated, loading, syncData,
            inventory, setInventory, updateInventoryItem,
            customers, setCustomers,
            projects, setProjects,
            tracking, toggleTracking,
            quotes, setQuotes, addQuote, deleteQuote,
            deals, setDeals, addDeal, deleteDeal,

            purchases, setPurchases, vendors, setVendors, receiveOrder,
            receivables, setReceivables, registerPayment,
            payables, setPayables,
            customerStatuses, projectStatuses,
            quoteSettings, setQuoteSettings, saveQuoteSettings,
            services, setServices,
            quotePresets, setQuotePresets,
            getClientCredentials, addClientCredential, revealCredential, deleteClientCredential,
            userRole: user?.role || 'user'
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);

