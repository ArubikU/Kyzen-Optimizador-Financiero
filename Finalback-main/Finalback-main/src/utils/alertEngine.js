// HU-20: Módulo de Alertas Tempranas por Umbral (motor de reglas determinista)
export const ALERT_THRESHOLD = 0.8;

/**
 * Evalúa la regla de negocio del presupuesto mensual.
 * @param {number} monthlyExpenses sumatoria de gastos del mes actual
 * @param {number|null} monthlyBudget presupuesto mensual configurado por el usuario
 */
export const evaluateBudgetAlert = (monthlyExpenses, monthlyBudget) => {
  const budget = Number(monthlyBudget);
  const spent = Number(monthlyExpenses) || 0;
  if (!Number.isFinite(budget) || budget <= 0) {
    return { triggered: false, level: 'none', percentage: 0, message: null };
  }
  const ratio = spent / budget;
  const percentage = Math.round(ratio * 100);
  if (ratio > 1) {
    return { triggered: true, level: 'red', percentage, message: `Superaste tu presupuesto mensual (${percentage}% utilizado).` };
  }
  if (ratio > ALERT_THRESHOLD) {
    return { triggered: true, level: 'red', percentage, message: `Alerta: ya usaste el ${percentage}% de tu presupuesto mensual.` };
  }
  return { triggered: false, level: 'ok', percentage, message: null };
};

// Suma los gastos cuyo mes/año coinciden con `now`
export const sumMonthlyExpenses = (transactions, now = new Date()) =>
  transactions
    .filter((t) => String(t.type).toLowerCase() === 'gasto')
    .filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);
