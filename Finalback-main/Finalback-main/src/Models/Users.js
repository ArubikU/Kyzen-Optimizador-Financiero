import { DataTypes } from 'sequelize';
import sequelize from '../Config/database.js';
import bcrypt from 'bcrypt';

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  
  // --- ETAPA 1: IDENTIDAD (Figma Match) ---
  firstName: { type: DataTypes.STRING, allowNull: false }, 
  lastName: { type: DataTypes.STRING, allowNull: false },  
  birthDate: { type: DataTypes.DATEONLY, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: true },

  // --- ETAPA 2: CREDENCIALES (Figma Match) ---
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false },
  
  // --- ETAPA 3: VERIFICACIÓN Y SEGURIDAD ---
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  verificationCode: { type: DataTypes.STRING, allowNull: true }, // Código OTP para Registro
  verificationExpires: { type: DataTypes.DATE, allowNull: true },
  
  resetPasswordToken: { type: DataTypes.STRING, allowNull: true }, // Código OTP para Recuperación
  resetPasswordExpires: { type: DataTypes.DATE, allowNull: true }
}, { 
  timestamps: true 
});

// Encriptación automática de la contraseña antes de guardar en la base de datos
User.beforeSave(async (user) => { 
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Método para verificar credenciales durante el inicio de sesión
User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default User;