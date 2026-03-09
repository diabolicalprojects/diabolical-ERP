import React, { createContext, useContext, useState, useEffect } from 'react';
import LogoNegro from '../assets/LOGO-DIABOLICAL-CUADRADO-NEGRO.svg';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');
    const [userRole, setUserRole] = useState('admin'); // Default role for demo
    const customerStatuses = ['activo', 'potencial', 'en_pausa', 'inactivo'];
    const projectStatuses = ['planeacion', 'en_curso', 'retrasado', 'finalizado'];

    // --- Inventory State ---
    const [inventory, setInventory] = useState([
        { id: '1', name: 'Software Licencia Pro', sku: 'SFT-001', price: 299.00, stock: 150, status: 'ok' },
        { id: '2', name: 'Hardware Server v2', sku: 'HW-992', price: 1250.00, stock: 5, status: 'low' },
        { id: '3', name: 'Mantenimiento Mensual', sku: 'SRV-005', price: 45.00, stock: 1000, status: 'ok' },
    ]);
    const addInventoryItem = (item) => setInventory([item, ...inventory]);
    const updateInventoryItem = (id, updated) => setInventory(inventory.map(i => i.id === id ? updated : i));
    const deleteInventoryItem = (id) => setInventory(inventory.filter(i => i.id !== id));

    // --- Compras (Purchases) ---
    const [purchases, setPurchases] = useState([
        { id: 'PO-1001', vendor: 'Intel Corp', date: '2024-03-20', total: 5400.00, status: 'recibido' },
        { id: 'PO-1002', vendor: 'Microsoft', date: '2024-03-22', total: 1200.00, status: 'pendiente' },
    ]);
    const [vendors, setVendors] = useState([
        { id: 'V1', name: 'Intel Corp', contact: 'Robert Swan', email: 'robert@intel.com' },
        { id: 'V2', name: 'Microsoft', contact: 'Satya Nadella', email: 'satya@microsoft.com' },
    ]);

    const receiveOrder = (orderId) => {
        const order = purchases.find(p => p.id === orderId);
        if (order && order.status !== 'recibido') {
            setPurchases(purchases.map(p => p.id === orderId ? { ...p, status: 'recibido' } : p));
            // Simulating inventory update logic would happen here in a real app
        }
    };

    // --- Cuentas por Cobrar (Accounts Receivable) ---
    const [receivables, setReceivables] = useState([
        { id: 'INV-501', client: 'TechNova Solutions', amount: 15600.00, paid: 10000.00, dueDate: '2024-04-10', status: 'parcial' },
        { id: 'INV-502', client: 'Global Logistics', amount: 4500.00, paid: 0, dueDate: '2024-03-30', status: 'vencido' },
    ]);
    const registerPayment = (id, amount) => {
        setReceivables(receivables.map(r => {
            if (r.id === id) {
                const newPaid = r.paid + amount;
                return { ...r, paid: newPaid, status: newPaid >= r.amount ? 'pagado' : 'parcial' };
            }
            return r;
        }));
    };

    // --- Cuentas por Pagar (Accounts Payable) ---
    const [payables, setPayables] = useState([
        { id: 'EXP-101', concept: 'Renta Oficina', vendor: 'Inmobiliaria S.A.', amount: 2500.00, status: 'pendiente' },
        { id: 'EXP-102', concept: 'Servicios de Nube', vendor: 'AWS', amount: 840.00, status: 'pagado' },
    ]);

    // --- Customers, Projects, Tracking, etc (Existing) ---
    const [customers, setCustomers] = useState([
        { id: '1', name: 'TechNova Solutions', contact: 'Ana Garcia', phone: '+52 55 1234 5678', email: 'hola@technova.com', address: 'Av Insurgentes 123', altContact: 'Linkedin', deals: 3, status: 'activo', createdAt: '2024-01-10' },
        { id: '2', name: 'Global Logistics', contact: 'Carlos Ruiz', phone: '+52 33 8765 4321', email: 'c.ruiz@global.com', address: 'Calle Base 45', altContact: 'Skype', deals: 1, status: 'potencial', createdAt: '2024-02-15' },
        { id: '3', name: 'Pyme Mas', contact: 'Luis Perez', phone: '+52 55 9988 7766', email: 'luis@pymemas.mx', address: 'Plaza Central L-4', altContact: 'WhatsApp', deals: 0, status: 'activo', createdAt: '2024-03-05' },
    ]);
    const addCustomer = (c) => setCustomers([{ ...c, createdAt: new Date().toISOString().split('T')[0] }, ...customers]);
    const updateCustomer = (id, updated) => setCustomers(customers.map(c => c.id === id ? { ...c, ...updated } : c));
    const deleteCustomer = (id) => setCustomers(customers.filter(c => c.id !== id));

    const [projects, setProjects] = useState([
        { id: 'P1', name: 'Implementación Cloud', client: 'TechNova', status: 'en_curso', progress: 65, startDate: '2024-02-01' },
        { id: 'P2', name: 'Migración Database', client: 'Global Logistics', status: 'planeacion', progress: 10, startDate: '2024-03-10' },
    ]);

    const [tracking, setTracking] = useState([
        { id: 'T1', task: 'Llamada de seguimiento', target: 'TechNova', date: '2024-03-25', status: 'pendiente' },
        { id: 'T2', task: 'Enviar demo v3', target: 'Pyme Mas', date: '2024-03-26', status: 'completado' },
    ]);
    const toggleTracking = (id) => setTracking(tracking.map(t => t.id === id ? { ...t, status: t.status === 'completado' ? 'pendiente' : 'completado' } : t));

    const [quotes, setQuotes] = useState([
        {
            id: 'Q-2024-001',
            customer: 'TechNova Solutions',
            date: '2024-03-15',
            amount: 15600.00,
            status: 'accepted',
            seller: 'admin',
            items: [
                { id: '1', name: 'Software Licencia Pro', price: 299.00, quantity: 2, type: 'product' },
                { id: '2', name: 'Hardware Server v2', price: 1250.00, quantity: 1, type: 'product' }
            ]
        },
        {
            id: 'Q-2024-002',
            customer: 'Global Logistics',
            date: '2024-02-10',
            amount: 8500.00,
            status: 'accepted',
            seller: 'user1',
            items: [
                { id: 'S1', name: 'Mantenimiento Preventivo', price: 1500.00, quantity: 2, type: 'service' }
            ]
        },
        {
            id: 'Q-2024-003',
            customer: 'Pyme Mas',
            date: '2024-03-18',
            amount: 2200.00,
            status: 'sent',
            seller: 'admin',
            items: [
                { id: 'S2', name: 'Soporte Técnico Remoto', price: 450.00, quantity: 4, type: 'service' }
            ]
        },
    ]);
    const deleteQuote = (id) => setQuotes(quotes.filter(q => q.id !== id));

    const [deals, setDeals] = useState({
        'nuevo': [{ id: '1', company: 'TechNova Solutions', value: 15000, contact: 'Ana Garcia', days: 2, createdAt: '2024-03-10' }],
        'contactado': [],
        'propuesta': [{ id: '2', company: 'Global Logistics', value: 45000, contact: 'Carlos Ruiz', days: 5, createdAt: '2024-02-20' }],
        'negociacion': [{ id: '3', company: 'Pyme Mas', value: 25000, contact: 'Luis Perez', days: 12, createdAt: '2024-03-01' }],
        'ganado': [{ id: '4', company: 'Innova Soft', value: 30000, contact: 'Mario Mez', days: 30, createdAt: '2024-01-15', wonDate: '2024-02-15' }]
    });
    const addDeal = (stage, deal) => setDeals({ ...deals, [stage]: [deal, ...deals[stage]] });
    const deleteDeal = (stage, id) => setDeals({ ...deals, [stage]: deals[stage].filter(d => d.id !== id) });

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    // --- Services ---
    const [services, setServices] = useState([
        { id: 'S1', name: 'Mantenimiento Preventivo', price: 1500.00, type: 'service', description: 'Limpieza y revisión física' },
        { id: 'S2', name: 'Soporte Técnico Remoto', price: 450.00, type: 'service', description: 'Por hora de servicio' },
        { id: 'S3', name: 'Instalación de Software', price: 800.00, type: 'service', description: 'Licenciamiento no incluido' },
        { id: 'S4', name: 'Consultoría TI Especializada', price: 2500.00, type: 'service', description: 'Análisis de arquitectura' },
    ]);

    // --- Quote Presets ---
    const [quotePresets, setQuotePresets] = useState([
        {
            id: 'PRE-001',
            name: 'Pack Básico Oficina',
            items: [
                { id: '1', name: 'Software Licencia Pro', price: 299.00, quantity: 5, type: 'product' },
                { id: 'S3', name: 'Instalación de Software', price: 800.00, quantity: 1, type: 'service' }
            ]
        },
        {
            id: 'PRE-002',
            name: 'Mantenimiento Servidores',
            items: [
                { id: '2', name: 'Hardware Server v2', price: 1250.00, quantity: 1, type: 'product' },
                { id: 'S1', name: 'Mantenimiento Preventivo', price: 1500.00, quantity: 2, type: 'service' },
                { id: 'S4', name: 'Consultoría TI Especializada', price: 2500.00, quantity: 1, type: 'service' }
            ]
        },
        {
            id: 'PRE-003',
            name: 'Consultoría TI Mensual',
            items: [
                { id: 'S4', name: 'Consultoría TI Especializada', price: 2500.00, quantity: 4, type: 'service' },
                { id: 'S2', name: 'Soporte Técnico Remoto', price: 450.00, quantity: 10, type: 'service' }
            ]
        }
    ]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, []);

    const [quoteSettings, setQuoteSettings] = useState({
        companyName: 'DIABOLICAL AI',
        companyAddress: 'Av. de la Reforma 405, CDMX',
        companyRFC: 'DIA240101-XXX',
        accentColor: '#000000',
        taxRate: 16,
        footerNote: 'Esta cotización tiene una vigencia legal de 30 días naturales.',
        signatureLabelLeft: 'Gerente Comercial',
        signatureLabelRight: 'Aceptación de Cliente',
        logoUrl: LogoNegro, // Custom logo URL
    });

    return (
        <AppContext.Provider value={{
            theme, toggleTheme, userRole, setUserRole,
            inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem,
            customers, addCustomer, updateCustomer, deleteCustomer,
            projects, setProjects,
            tracking, toggleTracking,
            quotes, setQuotes, deleteQuote,
            deals, setDeals, addDeal, deleteDeal,
            purchases, setPurchases, vendors, setVendors, receiveOrder,
            receivables, setReceivables, registerPayment,
            payables, setPayables,
            customerStatuses, projectStatuses,
            quoteSettings, setQuoteSettings,
            services, setServices,
            quotePresets, setQuotePresets
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
