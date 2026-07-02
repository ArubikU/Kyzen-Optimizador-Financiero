import { DataTypes } from 'sequelize';
import sequelize from '../Config/database.js';
import User from './Users.js';
import Category from './Categories.js';

const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  type: { type: DataTypes.ENUM('ingreso', 'gasto'), allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false }, // Monto en número puro para realizar agregaciones matemáticas
  description: { type: DataTypes.STRING, allowNull: false }, // Detalle del movimiento
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }, // Fecha e historial cronológico
  voucherUrl: { type: DataTypes.STRING, allowNull: true } // Almacenamiento del archivo de comprobante (< 5MB)
}, { 
  timestamps: true 
});

// --- ESTABLECIMIENTO DE RELACIONES FINANCIERAS ---
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });

Transaction.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Transaction, { foreignKey: 'categoryId', as: 'transactions' });

export default Transaction;