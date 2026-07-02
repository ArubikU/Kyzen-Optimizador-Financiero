import express from 'express';
import { createGoal, getGoals } from '../controllers/goalController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Endpoints protegidos para gestionar objetivos financieros de Kyzen[cite: 11]
router.get('/', protect, getGoals);   // Listar metas con porcentaje dinámico para la barra verde (PANTALLA 9)
router.post('/', protect, createGoal); // Crear meta calculando la cuota mensual desde el backend (PANTALLA 10)

export default router;