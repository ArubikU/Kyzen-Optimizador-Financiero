import Transaction from '../Models/Transactions.js';
import Category from '../Models/Categories.js';

export const createTransaction = async (req, res) => {
  const { type, amount, description, date, category } = req.body;
  const userId = req.user ? req.user.id : 1; 

  try {
    // Buscamos la categoría correspondiente en la tabla Categories
    const dbCategory = await Category.findOne({ where: { name: category || 'Otros' } });
    const categoryId = dbCategory ? dbCategory.id : null;

    const newTransaction = await Transaction.create({
      type: type === 'Gasto' || type === 'GASTO' ? 'gasto' : 'ingreso',
      amount: parseFloat(amount),
      description: description || 'Transacción sin concepto',
      date: date || new Date(),
      userId,
      categoryId
    });

    res.status(201).json({
      success: true,
      message: 'Transacción guardada exitosamente.',
      data: {
        ...newTransaction.toJSON(),
        category: category || 'Otros' // Devolvemos el nombre de la categoría para compatibilidad
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTransactions = async (req, res) => {
  const userId = req.user ? req.user.id : 1;
  const { category, type } = req.query;
  try {
    const whereConditions = { userId };

    if (type) {
      whereConditions.type = type.toLowerCase();
    }

    // Buscamos incluyendo la relación de la categoría para leer su nombre real
    const dbTransactions = await Transaction.findAll({
      where: whereConditions,
      include: [{ model: Category, as: 'category' }],
      order: [['date', 'DESC']]
    });

    // Mapeamos los datos para conservar la estructura exacta que lee tu Frontend
    let filtered = dbTransactions.map(t => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      description: t.description,
      date: t.date,
      userId: t.userId,
      category: t.category ? t.category.name : 'Otros'
    }));

    if (category) {
      filtered = filtered.filter(t => t.category === category);
    }

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};