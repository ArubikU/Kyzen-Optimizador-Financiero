import express from 'express';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Obtener balances netos, datos formateados para gráficos y alertas del 85% (PANTALLAS 4 y 7)
router.get('/summary', protect, getDashboardSummary);

export default router;