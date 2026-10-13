import express from 'express';
import { createTransaction, getTransactions, exportTransactions } from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las acciones de movimientos requieren el token Bearer y cuenta OTP activa
router.post('/', protect, createTransaction);       // Registrar Gasto o Ingreso manual (PANTALLA 5)
router.get('/export', protect, exportTransactions); // Exportar historial en CSV por periodo
router.get('/', protect, getTransactions);          // Auditoría del historial cronológico con filtros (PANTALLA 6)

export default router;
