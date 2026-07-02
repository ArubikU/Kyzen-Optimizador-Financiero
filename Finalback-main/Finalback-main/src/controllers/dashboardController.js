import Transaction from '../Models/Transactions.js';
import Category from '../Models/Categories.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : 1;

    let income = 0;
    let expenses = 0;
    
    const categoryDistribution = {
      Viaje: 0,
      Transporte: 0,
      Estudios: 0,
      Servicios: 0,
      Hogar: 0,
      Otros: 0
    };

    // Traemos las transacciones del usuario cruzándolas con su categoría real
    const userTransactions = await Transaction.findAll({
      where: { userId: currentUserId },
      include: [{ model: Category, as: 'category' }]
    });

    userTransactions.forEach(tx => {
      const amount = parseFloat(tx.amount);
      if (tx.type?.toLowerCase() === 'ingreso') {
        income += amount;
      } else {
        expenses += amount;
        const catName = tx.category ? tx.category.name : 'Otros';
        
        if (categoryDistribution[catName] !== undefined) {
          categoryDistribution[catName] += amount;
        } else {
          categoryDistribution['Otros'] += amount;
        }
      }
    });

    const balance = income - expenses;

    res.json({
      totals: { balance, income, expenses },
      charts: {
        pie: categoryDistribution,
        bar: { income, expenses }  
      },
      alertBanner: null,
      smartTip: expenses > income 
        ? "IA Tip: Tus gastos superan tus ingresos este mes. Reduce gastos en campus." 
        : "IA Tip: ¡Buen trabajo! Mantienes un flujo de caja saludable en este ciclo."
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};