import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, verifyOtp } from '../services/authService';
import { fetchDashboardSummary, fetchTransactions, fetchGoals, createTransaction, createGoal } from '../services/financialService';

const FinancialContext = createContext();

export function FinancialProvider({ children }) {
  // --- ESTADOS DE AUTENTICACIÓN ---
  const [token, setToken] = useState(localStorage.getItem('kyzen_token') || null);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('kyzen_user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      return null;
    }
  });

  // --- ESTADOS DE CONTROL FINANCIERO (MOCK ANALÍTICO) ---
  const [dashboardData, setDashboardData] = useState({
    totals: { balance: 0, income: 0, expenses: 0 },
    charts: { pie: {}, bar: { income: 0, expenses: 0 } },
    alertBanner: null,
    smartTip: ""
  });
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- CABECERA BEARER SEGURA ---
  const getAuthHeader = useCallback(() => {
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }, [token]);

  // --- ACCIONES DE MANEJO DE SESIÓN ---
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

  // --- REFRESCADOR CONTROLADO UNIFICADO ---
  const refreshData = useCallback(async () => {
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [dashboard, txs, metas] = await Promise.all([
        fetchDashboardSummary(headers),
        fetchTransactions(headers),
        fetchGoals(headers)
      ]);
      
      setDashboardData(dashboard);
      setTransactions(txs);
      setGoals(metas);
    } catch (err) {
      console.error("Error sincronizando analítica de Kyzen:", err);
    }
  }, [token]);

  // Sincronización al mutar token
  useEffect(() => {
    if (token) {
      setIsLoading(true);
      refreshData().finally(() => setIsLoading(false));
    }
  }, [token, refreshData]);

  const addTransaction = async (txData) => {
    try {
      const data = await createTransaction(txData, getAuthHeader());
      if (data) {
        await refreshData();
        return { success: true };
      }
    } catch (err) {
      console.error("Error registrando movimiento:", err);
    }
    return { success: false };
  };

  const addGoal = async (goalData) => {
    try {
      const data = await createGoal(goalData, getAuthHeader());
      if (data) {
        const headers = getAuthHeader();
        const metas = await fetchGoals(headers);
        setGoals(metas);
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
      login, logout, addTransaction, addGoal, getAuthHeader, refreshData
    }}>
      {children}
    </FinancialContext.Provider>
  );
}

export const useFinancial = () => useContext(FinancialContext);