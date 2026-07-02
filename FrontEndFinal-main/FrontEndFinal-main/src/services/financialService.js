const API_BASE_URL = 'http://localhost:4000/api';

// PANTALLAS 4 & 7: Dashboard Financiero y Reportes Analíticos (Resumen en Soles)
export const fetchDashboardSummary = async (authHeader) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
        method: 'GET',
        headers: authHeader
    });
    if (!response.ok) throw new Error('Error al sincronizar analítica de Kyzen.');
    return response.json();
};

// PANTALLA 5: Registrar Transacción (Clasificación dinámica en backend)
export const createTransaction = async (txData, authHeader) => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeader
        },
        body: JSON.stringify(txData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al registrar movimiento.');
    return data;
};

// PANTALLA 6: Historial de Movimientos con Filtros Cronológicos
export const fetchTransactions = async (authHeader) => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'GET',
        headers: authHeader
    });
    if (!response.ok) throw new Error('Error al cargar el historial de movimientos.');
    return response.json();
};

// PANTALLA 9: Listar Metas con Progreso Porcentual
export const fetchGoals = async (authHeader) => {
    const response = await fetch(`${API_BASE_URL}/goals`, {
        method: 'GET',
        headers: authHeader
    });
    if (!response.ok) throw new Error('Error al sincronizar objetivos de ahorro.');
    return response.json();
};

// PANTALLA 10: Crear Objetivo de Ahorro Planificado
export const createGoal = async (goalData, authHeader) => {
    const response = await fetch(`${API_BASE_URL}/goals`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeader
        },
        body: JSON.stringify(goalData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al guardar la meta de ahorro.');
    return data;
};