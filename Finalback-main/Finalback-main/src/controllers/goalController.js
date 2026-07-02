import Goal from '../Models/Goals.js';

export const getGoals = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const userGoals = await Goal.findAll({ where: { userId }, order: [['deadline', 'ASC']] });
    res.json(userGoals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGoal = async (req, res) => {
  const { name, targetAmount, currentAmount, deadline, categoryIcon } = req.body;
  const userId = req.user ? req.user.id : 1;

  try {
    const newGoal = await Goal.create({
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount || 0),
      deadline,
      categoryIcon: categoryIcon || '🎯',
      userId
    });

    res.status(201).json({
      success: true,
      message: 'Meta de ahorro registrada con éxito.',
      data: newGoal
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};