import { DataTypes } from 'sequelize';
import sequelize from '../Config/database.js'; 

const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true }, // Ej: 'Comida', 'Transporte', 'Salario'
  type: { type: DataTypes.ENUM('ingreso', 'gasto'), allowNull: false }, // Clasificación del flujo de caja
  icon: { type: DataTypes.STRING, defaultValue: '💰' }, // Emoji representativo para la UI (🍔, 🚌, 🎓)
  color: { type: DataTypes.STRING, defaultValue: '#94A3B8' } // Color para los gráficos de Chart.js/Recharts
}, {
  timestamps: false
});

export default Category;