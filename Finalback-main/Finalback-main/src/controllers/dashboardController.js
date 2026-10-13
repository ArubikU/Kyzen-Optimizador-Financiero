import Transaction from '../Models/Transactions.js';
import Category from '../Models/Categories.js';
import { evaluateBudgetAlert, sumMonthlyExpenses } from '../utils/alertEngine.js';

const CATEGORY_KEYS = ['Comida', 'Viaje', 'Transporte', 'Estudios', 'Servicios', 'Hogar', 'Otros'];

export const getDashboardSummary = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : 1;

    let income = 0;
    let expenses = 0;
    const categoryDistribution = Object.fromEntries(CATEGORY_KEYS.map((k) => [k, 0]));

    const userTransactions = await Transaction.findAll({
      where: { userId: currentUserId },
      include: [{ model: Category, as: 'category' }]
    });

    userTransactions.forEach((tx) => {
      const amount = parseFloat(tx.amount);
      if (tx.type?.toLowerCase() === 'ingreso') {
        income += amount;
      } else {
        expenses += amount;
        const catName = tx.category ? tx.category.name : 'Otros';
        categoryDistribution[catName in categoryDistribution ? catName : 'Otros'] += amount;
      }
    });

    // HU-20: alerta roja si el gasto del mes supera el 80% del presupuesto configurado
    const monthlyBudget = req.user?.monthlyBudget ?? null;
    const monthlyExpenses = sumMonthlyExpenses(userTransactions);
    const alert = evaluateBudgetAlert(monthlyExpenses, monthlyBudget);

    res.json({
      totals: { balance: income - expenses, income, expenses },
      charts: {
        pie: categoryDistribution,
        bar: { income, expenses },
        byCategory: categoryDistribution // HU-12: barras por categoría
      },
      budget: { monthlyBudget, monthlyExpenses, percentage: alert.percentage, level: alert.level },
      alertBanner: alert.message,
      smartTip: expenses > income
        ? 'Tip: Tus gastos superan tus ingresos este mes. Reduce gastos en campus.'
        : 'Tip: ¡Buen trabajo! Mantienes un flujo de caja saludable en este ciclo.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
