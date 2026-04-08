/**
 * src/services/api.js
 * Cliente de API centralizado para el ERP Diabolical
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getHeaders = () => {
    const token = localStorage.getItem('diabolical_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const handleResponse = async (response) => {
    if (response.status === 401 && !response.url.includes('/api/auth/login')) {
        localStorage.removeItem('diabolical_token');
        localStorage.removeItem('diabolical_user');
        window.location.href = '/login';
        throw new Error('Sesión expirada');
    }
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Error en la petición');
    }
    return data;
};

export const api = {
    // Auth
    login: (email, password) => 
        fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        }).then(handleResponse),

    getMe: () => 
        fetch(`${API_URL}/api/auth/me`, { headers: getHeaders() }).then(handleResponse),

    // Generic Crud Helpers
    get: (endpoint) => 
        fetch(`${API_URL}${endpoint}`, { headers: getHeaders() }).then(handleResponse),

    post: (endpoint, body) => 
        fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(body)
        }).then(handleResponse),

    put: (endpoint, body) => 
        fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(body)
        }).then(handleResponse),

    patch: (endpoint, body) => 
        fetch(`${API_URL}${endpoint}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(body)
        }).then(handleResponse),

    delete: (endpoint) => 
        fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders()
        }).then(handleResponse)
};
