// Exportación de transacciones a CSV (alcance: "Exportación de información")
const escapeCell = (value) => {
  const text = String(value ?? '');
  // Evita inyección de fórmulas al abrir el CSV en Excel
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export const transactionsToCsv = (transactions) => {
  const header = ['id', 'fecha', 'tipo', 'categoria', 'descripcion', 'monto'];
  const rows = transactions.map((t) =>
    [t.id, new Date(t.date).toISOString(), t.type, t.category, t.description, t.amount].map(escapeCell).join(',')
  );
  return [header.join(','), ...rows].join('\n');
};

// Filtra por periodo Semanal / Mensual / Anual (mismos periodos del modal de exportación)
export const filterByPeriod = (transactions, period = 'Mensual', now = new Date()) =>
  transactions.filter((t) => {
    const d = new Date(t.date);
    if (period === 'Semanal') return d >= new Date(now.getTime() - 7 * 86400000) && d <= now;
    if (period === 'Anual') return d.getFullYear() === now.getFullYear();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
