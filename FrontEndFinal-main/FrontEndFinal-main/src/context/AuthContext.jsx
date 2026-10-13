import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FinancialContext = createContext();

export function FinancialProvider({ children }) {
  // --- ESTADOS DE AUTENTICACIÓN (KYZEN MATCH) ---
  const [token, setToken] = useState(localStorage.getItem('kyzen_token') || null);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('kyzen_user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      return null;
    }
  });

  // --- ESTADOS DE CONTROL FINANCIERO (FIGMA DATA MOCK) ---
  const [dashboardData, setDashboardData] = useState({
    totals: { balance: 0, income: 0, expenses: 0 },
    charts: { pie: {}, bar: { income: 0, expenses: 0 } },
    alertBanner: null,
    smartTip: ""
  });
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 🚀 --- NUEVOS ESTADOS DE PREFERENCIA MULTIMONEDA (KYZEN MULTI-CURRENCY) ---
  const [currency, setCurrency] = useState('PEN'); // 'PEN' (Soles) o 'USD' (Dólares)

  // 🚀 --- FUNCIÓN ADAPTATIVA DE CONVERSIÓN EN TIEMPO REAL ---
  const formatAmount = (amountInPEN) => {
    const value = Number(amountInPEN || 0);
    if (currency === 'USD') {
      // Tipo de cambio preferencial simulado para universitarios (S/ 3.75)
      return `$ ${(value / 3.75).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // --- CABECERA DE AUTENTICACIÓN BEARER ---
  const getAuthHeader = useCallback(() => {
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }, [token]);

  // --- ACCIONES DE SESIÓN Y REGISTRO ---
  const login = (newToken, userData) => {
    localStorage.setItem('kyzen_token', newToken);
    localStorage.setItem('kyzen_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('kyzen_token');
    localStorage.removeItem('kyzen_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  // --- CONSUMO DE ENDPOINTS ANALÍTICOS (PORT 4000) ---
  const fetchDashboardSummary = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:4000/api/dashboard/summary', {
        headers: getAuthHeader()
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error("Error cargando dashboard:", err);
    }
  }, [token, getAuthHeader]);

  const fetchTransactions = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:4000/api/transactions', {
        headers: getAuthHeader()
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error("Error cargando transacciones:", err);
    }
  }, [token, getAuthHeader]);

  const fetchGoals = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:4000/api/goals', {
        headers: getAuthHeader()
      });
      if (res.ok) {
        const data = await res.json();
        setGoals(data);
      }
    } catch (err) {
      console.error("Error cargando metas:", err);
    }
  }, [token, getAuthHeader]);

  // Disparador de sincronización reactiva al iniciar sesión
  useEffect(() => {
    if (token) {
      setIsLoading(true);
      Promise.all([fetchDashboardSummary(), fetchTransactions(), fetchGoals()])
        .finally(() => setIsLoading(false));
    }
  }, [token, fetchDashboardSummary, fetchTransactions, fetchGoals]);

  // --- MUTACIONES EN MEMORIA (ACCIONES DEL ESTUDIANTE) ---
  const addTransaction = async (txData) => {
    try {
      const res = await fetch('http://localhost:4000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(txData)
      });
      
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        return { success: false, message: errBody.message || 'No se pudo guardar el movimiento.' };
      }
      if (res.ok) {
        const result = await res.json();
        
        // 🚀 SOLUCIÓN INTERNA: Forzamos la inyección local inmediata de la transacción en el estado de React
        // para asegurar que las variables calculadas en el Dashboard Page cambien de estado al milisegundo
        if (result.success && result.data) {
          setTransactions(prev => [result.data, ...prev]);
        }

        // Refrescamos los endpoints en bloque con await para garantizar la consistencia matemática de las llamadas
        await Promise.all([fetchDashboardSummary(), fetchTransactions()]);
        return { success: true };
      }
    } catch (err) {
      console.error("Error registrando movimiento:", err);
    }
    return { success: false };
  };

  // HU-20: presupuesto mensual que alimenta el módulo de alertas por umbral (80%)
  const updateBudget = async (monthlyBudget) => {
    try {
      const res = await fetch('http://localhost:4000/api/auth/budget', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ monthlyBudget })
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        await fetchDashboardSummary();
        return { success: true };
      }
      return { success: false, message: body.message };
    } catch (err) {
      return { success: false, message: 'No se pudo conectar con el servidor.' };
    }
  };

  // Exportación de transacciones a CSV desde el backend
  const exportTransactionsCsv = async (period = 'Mensual') => {
    const res = await fetch(`http://localhost:4000/api/transactions/export?period=${encodeURIComponent(period)}`, {
      headers: getAuthHeader()
    });
    if (!res.ok) return { success: false };
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kyzen-transacciones-${period.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    return { success: true };
  };

  const addGoal = async (goalData) => {
    try {
      const res = await fetch('http://localhost:4000/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(goalData)
      });
      if (res.ok) {
        const result = await res.json();
        
        // 🚀 INYECCIÓN INMEDIATA DE ESTADO: Agregamos la meta localmente para renderizado instantáneo en la UI
        if (result.success && result.data) {
          setGoals(prev => [...prev, result.data]);
        }

        await fetchGoals();
        return { success: true };
      }
    } catch (err) {
      console.error("Error registrando meta:", err);
    }
    return { success: false };
  };

  return (
    <FinancialContext.Provider value={{
      token, user, dashboardData, transactions, goals, isLoading,
      login, logout, addTransaction, addGoal, getAuthHeader, updateBudget, exportTransactionsCsv,
      // 🚀 EXPORTACIÓN CLAVE: Añadimos fetchTransactions y fetchGoals explícitamente para evitar lecturas como undefined
      fetchTransactions,
      fetchGoals,
      refreshData: () => Promise.all([fetchDashboardSummary(), fetchTransactions(), fetchGoals()]),
      
      // 🚀 EXPORTACIONES DE CAMBIO DE MONEDA DISPONIBLES EN TODO EL ÁRBOL
      currency,
      setCurrency,
      formatAmount
    }}>
      {children}
    </FinancialContext.Provider>
  );
}

export const useFinancial = () => useContext(FinancialContext);
export const useAuth = () => useContext(FinancialContext);