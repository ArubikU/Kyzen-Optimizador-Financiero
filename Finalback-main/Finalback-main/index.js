import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './src/Config/database.js'; // 🚀 IMPORTAMOS TU CONEXIÓN LOCAL

// --- 1. IMPORTACIÓN DE LAS RUTAS DE KYZEN ---
import authRoutes from './src/routes/authRoutes.js';
import transactionRoutes from './src/routes/transactionRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import goalRoutes from './src/routes/goalRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 4000; 

// --- 2. CONFIGURACIÓN DE CORS ---
app.use(cors({
  origin: [
    'http://localhost:5173', // Tu entorno local de React + Vite
    'https://finalback-fke3.vercel.app', 
    'https://front-end-final-lu3iq93js-mrrod2819s-projects.vercel.app',
    'https://front-end-final-jet.vercel.app'
  ], 
  credentials: true 
}));

app.use(express.json()); 

// Endpoint de verificación inicial (Ahora reporta estado de base de datos)
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: '🚀 API de Kyzen conectada a PostgreSQL Local de forma real!',
        status: 'OK' 
    });
});

// --- 3. ENLAZADO DE RUTAS DE LA API FINTECH ---
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/categories', categoryRoutes);

// --- 4. INICIALIZACIÓN DEL SERVIDOR CONECTADO A POSTGRESQL ---
const initializeApp = async () => {
    try {
        // Sincroniza los modelos con las tablas de pgAdmin de forma segura sin borrar datos
        await sequelize.sync({ force: false }); 
        
        app.listen(PORT, () => {
            console.log(`📡 ==================================================`);
            console.log(`🚀 KYZEN BACKEND CORRIENDO CON POSTGRESQL REAL (SEQUELIZE)`);
            console.log(`🔊 Escuchando peticiones en: http://localhost:${PORT}`);
            console.log(`📡 ==================================================`);
        });
    } catch (error) {
        console.error('❌ Error crítico al inicializar el servidor Kyzen:', error.message);
        process.exit(1);
    }
};

initializeApp(); 

export default app;