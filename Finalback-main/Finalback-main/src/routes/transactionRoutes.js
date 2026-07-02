import express from 'express';
import { createTransaction, getTransactions } from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Absolutamente todas las acciones de movimientos requieren el token Bearer y cuenta OTP activa[cite: 11]
router.post('/', protect, createTransaction); // Registrar Gasto o Ingreso manual (PANTALLA 5)
router.get('/', protect, getTransactions);    // Auditoría del historial cronológico con filtros (PANTALLA 6)

export default router;