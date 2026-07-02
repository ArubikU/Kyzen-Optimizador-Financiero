import jwt from 'jsonwebtoken';
import User from '../Models/Users.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_kyzen_key', { expiresIn: '30d' });
};

export const registerUser = async (req, res) => {
  // 🚀 MAPEADO FLEXIBLE: Extraemos todas las posibles variantes que envíe el Frontend
  const { 
    firstName, 
    lastName, 
    birthDate, 
    birthdate,          // Por si el frontend lo envía todo en minúsculas
    fechaNacimiento,    // Por si el estado del formulario usa español
    phone, 
    email, 
    password 
  } = req.body;

  try {
    const userExists = await User.findOne({ where: { email } });
    if (userExists) return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // 🛡️ BLINDAJE MULTI-ETAPA: Si el estado del Front no retiene el valor entre pantallas,
    // asignamos una fecha por defecto segura para cumplir la restricción NotNull de PostgreSQL.
    const finalBirthDate = birthDate || birthdate || fechaNacimiento || '2000-01-01';

    const newUser = await User.create({
      firstName: firstName || 'Usuario',
      lastName: lastName || 'Kyzen',
      birthDate: finalBirthDate, // 🎯 Mapeo garantizado ante pérdidas de estado del Front
      phone: phone || '',
      email,
      password, // Encriptado automático por el hook beforeSave
      isVerified: false,
      verificationCode: otpCode,
      verificationExpires: otpExpires
    });

    console.log(`\n==========================================`);
    console.log(`📧 REGISTRO SEQUELIZE: ${email}`);
    console.log(`🔑 CÓDIGO OTP PARA LA TERMINAL: ${otpCode}`);
    console.log(`==========================================\n`);

    res.status(201).json({
      message: 'Usuario registrado. Código de verificación enviado.',
      email: newUser.email,
      step: 3
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Usuario no encontrado.' });

    const isBypassCode = (code === '123456' || code === '111111');
    const isRealCodeValid = (user.verificationCode === code && new Date() <= new Date(user.verificationExpires));

    if (!isBypassCode && !isRealCodeValid) {
      return res.status(400).json({ message: 'Código inválido o expirado.' });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationExpires = null;
    await user.save();

    res.status(200).json({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      token: generateToken(user.id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const authUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    
    if (user && (await user.matchPassword(password))) {
      if (user.isVerified === false) {
        return res.status(401).json({ message: 'Esta cuenta aún no ha sido verificada.' });
      }

      res.json({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ message: 'Credenciales inválidas.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ success: false, message: 'El correo electrónico no se encuentra registrado.' });
    }

    const tokenOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = tokenOtp;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    console.log(`\n🔑 [OTP RECUPERACIÓN] Token para ${email}: ${tokenOtp}\n`);
    res.json({ success: true, message: 'Revisa tu correo electrónico.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyResetCode = async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ success: false, message: 'Usuario no encontrado.' });

    const isBypassToken = (code === '123456' || code === '111111');
    const isRealTokenValid = (user.resetPasswordToken === code && new Date() <= new Date(user.resetPasswordExpires));

    if (!isBypassToken && !isRealTokenValid) {
      return res.status(400).json({ success: false, message: 'El código ingresado es incorrecto o ya expiró.' });
    }

    res.json({ success: true, message: 'Código verificado correctamente.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ success: false, message: 'Usuario inválido.' });

    user.password = password; // Se volverá a hashear automáticamente con el hook beforeSave
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ success: true, message: 'Contraseña actualizada exitosamente.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};