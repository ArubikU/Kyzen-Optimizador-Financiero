import Goal from '../Models/Goals.js';
import { toGoalView } from '../utils/currency.js';

// ?currency=USD recalcula montos y cuota mensual con el tipo de cambio configurado
export const getGoals = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const currency = req.query.currency || 'PEN';
    const userGoals = await Goal.findAll({ where: { userId }, order: [['deadline', 'ASC']] });
    res.json(userGoals.map((g) => toGoalView(g, currency)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGoal = async (req, res) => {
  const { name, targetAmount, currentAmount, deadline, categoryIcon } = req.body;
  const userId = req.user ? req.user.id : 1;

  const target = parseFloat(targetAmount);
  const current = parseFloat(currentAmount || 0);
  if (!name || !String(name).trim()) return res.status(400).json({ message: 'El nombre de la meta es obligatorio.' });
  if (!Number.isFinite(target) || target <= 0) return res.status(400).json({ message: 'La meta objetivo debe ser mayor a 0.' });
  if (!Number.isFinite(current) || current < 0) return res.status(400).json({ message: 'El ahorro inicial no puede ser negativo.' });
  if (!deadline) return res.status(400).json({ message: 'La fecha de cumplimiento es obligatoria.' });

  try {
    const newGoal = await Goal.create({
      name: String(name).trim(),
      targetAmount: target,
      currentAmount: current,
      deadline,
      categoryIcon: categoryIcon || '🎯',
      userId
    });

    res.status(201).json({
      success: true,
      message: 'Meta de ahorro registrada con éxito.',
      data: toGoalView(newGoal, 'PEN')
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Aportar o ajustar el monto ahorrado de una meta
export const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!goal) return res.status(404).json({ message: 'Meta no encontrada.' });

    const { name, targetAmount, currentAmount, deadline } = req.body;
    if (name !== undefined) goal.name = String(name).trim();
    if (targetAmount !== undefined) {
      if (!(Number(targetAmount) > 0)) return res.status(400).json({ message: 'La meta objetivo debe ser mayor a 0.' });
      goal.targetAmount = Number(targetAmount);
    }
    if (currentAmount !== undefined) {
      if (!(Number(currentAmount) >= 0)) return res.status(400).json({ message: 'El ahorro no puede ser negativo.' });
      goal.currentAmount = Number(currentAmount);
    }
    if (deadline !== undefined) goal.deadline = deadline;
    await goal.save();
    res.json({ success: true, data: toGoalView(goal, 'PEN') });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const deleted = await Goal.destroy({ where: { id: req.params.id, userId: req.user.id } });
    if (!deleted) return res.status(404).json({ message: 'Meta no encontrada.' });
    res.json({ success: true, message: 'Meta eliminada.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
