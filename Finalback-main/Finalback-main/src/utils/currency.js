// Recálculo dinámico de metas según la divisa (alcance: "Metas de ahorro")
export const PEN_PER_USD = 3.75;

export const convertAmount = (amountPEN, currency = 'PEN') => {
  const value = Number(amountPEN) || 0;
  return String(currency).toUpperCase() === 'USD' ? Math.round((value / PEN_PER_USD) * 100) / 100 : value;
};

// Cuota mensual necesaria para llegar a la meta antes de la fecha límite (mínimo 1 mes)
export const monthlyQuota = (targetAmount, currentAmount, deadline, now = new Date()) => {
  const remaining = Math.max(Number(targetAmount) - Number(currentAmount || 0), 0);
  const end = new Date(`${deadline}T00:00:00`);
  const months = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
  return Math.round((remaining / Math.max(months, 1)) * 100) / 100;
};

export const toGoalView = (goal, currency = 'PEN', now = new Date()) => {
  const g = typeof goal.toJSON === 'function' ? goal.toJSON() : goal;
  const progress = g.targetAmount > 0 ? Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100) : 0;
  return {
    ...g,
    currency: String(currency).toUpperCase() === 'USD' ? 'USD' : 'PEN',
    targetAmount: convertAmount(g.targetAmount, currency),
    currentAmount: convertAmount(g.currentAmount, currency),
    monthlyQuota: convertAmount(monthlyQuota(g.targetAmount, g.currentAmount, g.deadline, now), currency),
    progress
  };
};
