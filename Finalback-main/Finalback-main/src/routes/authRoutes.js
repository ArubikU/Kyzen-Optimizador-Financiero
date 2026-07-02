import express from 'express';
import { 
  registerUser, 
  verifyOtp, 
  authUser, 
  forgotPassword, 
  verifyResetCode, // 🚀 Importamos el nuevo validador intermedio del Paso 2
  resetPassword 
} from '../controllers/authController.js';

const router = express.Router();

// --- FLUJO DE REGISTRO (Figma Match) ---
// Paso 1 y 2 -> Datos e Identidad / Paso 3 -> Envío y validación del código OTP de 5 dígitos
router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);

// --- FLUJO DE AUTENTICACIÓN ---
router.post('/login', authUser);

// --- FLUJO DE RECUPERACIÓN DE CONTRASEÑA (3 Etapas de Figma) ---
router.post('/forgot-password', forgotPassword);
router.post('/verify-code', verifyResetCode); // 🚀 Ruta del Paso 2 conectada al validador del código de 6 dígitos
router.post('/reset-password', resetPassword);

export default router;