// 📂 Archivo: src/Config/database.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_DATABASE || 'kyzen', // Nombre de la base de datos local
  process.env.DB_USER || 'postgres',     // Usuario de tu pgAdmin
  process.env.DB_PASSWORD,               // Tu clave maestra de pgAdmin
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // Desactiva los logs SQL en la consola para un entorno más limpio
    dialectOptions: {
      // Como estás trabajando en local, eliminamos el uso obligatorio de SSL de la nube
    },
    define: {
      timestamps: true // Asegura el comportamiento por defecto de Sequelize
    }
  }
);

// Bloque de verificación de conexión en consola
try {
  await sequelize.authenticate();
  console.log('🐘 ¡Conexión establecida exitosamente con Sequelize a PostgreSQL Local!');
} catch (error) {
  console.error('❌ No se pudo conectar a la base de datos local:', error.message);
}

export default sequelize;