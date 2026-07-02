import { DataTypes } from 'sequelize';
import sequelize from '../Config/database.js';
import User from './Users.js';

const Goal = sequelize.define('Goal', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false }, // Nombre del objetivo (Ej: 'Laptop Nueva')
  targetAmount: { type: DataTypes.FLOAT, allowNull: false }, // Monto objetivo de ahorro (S/. 2500)
  currentAmount: { type: DataTypes.FLOAT, defaultValue: 0.0 }, // Fondos acumulados actuales (S/. 1300)
  deadline: { type: DataTypes.DATEONLY, allowNull: false }, // Fecha límite establecida en el calendario de la UI
  categoryIcon: { type: DataTypes.STRING, defaultValue: '🎯' } // Icono visual de la meta
}, { 
  timestamps: true 
});

// --- RELACIONES DE ENTIDAD ---
Goal.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });
User.hasMany(Goal, { foreignKey: 'userId', as: 'goals' });

export default Goal;