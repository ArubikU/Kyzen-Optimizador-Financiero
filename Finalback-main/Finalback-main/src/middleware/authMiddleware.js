import jwt from 'jsonwebtoken';
import User from '../Models/Users.js'; // 🚀 Importamos tu modelo real de Sequelize

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_kyzen_key');
      
      // 🚀 Buscamos al estudiante directamente en PostgreSQL usando Sequelize
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(401).json({ message: 'Usuario no encontrado' });
      }
      
      if (!user.isVerified) {
        return res.status(403).json({ 
          message: 'Cuenta no verificada. Por favor, ingresa el código OTP enviado a tu correo.',
          requiresVerification: true 
        });
      }
      
      // Pasamos la instancia pura de Sequelize al objeto request
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token no válido' });
    }
  } else {
    return res.status(401).json({ message: 'No autorizado, token faltante' });
  }
};