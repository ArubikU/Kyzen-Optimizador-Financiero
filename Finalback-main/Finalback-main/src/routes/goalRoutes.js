import express from 'express';
import { createGoal, getGoals, updateGoal, deleteGoal } from '../controllers/goalController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Endpoints protegidos para gestionar objetivos de ahorro de Kyzen
router.get('/', protect, getGoals);          // Listar metas (?currency=PEN|USD) con progreso y cuota mensual
router.post('/', protect, createGoal);       // Crear meta
router.put('/:id', protect, updateGoal);     // Actualizar monto ahorrado u otros datos
router.delete('/:id', protect, deleteGoal);  // Eliminar meta

export default router;
