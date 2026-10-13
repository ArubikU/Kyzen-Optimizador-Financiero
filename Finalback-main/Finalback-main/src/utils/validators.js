// Reglas de validación de las historias HU-07, HU-08, HU-01 y HU-03 (documento Grupo 6, sección 5.2 y 5.3)

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MAX_VOUCHER_BYTES = 5 * 1024 * 1024; // HU-03: máximo 5MB por transacción
export const ALLOWED_VOUCHER_TYPES = ['image/jpeg', 'image/png'];

export const isValidEmail = (email) => typeof email === 'string' && EMAIL_REGEX.test(email.trim());

// HU-07: contraseña alfanumérica de mínimo 8 caracteres (al menos una letra y un número)
export const isValidPassword = (password) =>
  typeof password === 'string' &&
  password.length >= 8 &&
  /[A-Za-z]/.test(password) &&
  /\d/.test(password);

// HU-01: monto > 0 y categoría obligatoria para gastos
export const validateTransactionInput = ({ type, amount, category }) => {
  const errors = [];
  const parsed = Number(amount);
  if (!Number.isFinite(parsed) || parsed <= 0) errors.push('El monto debe ser un número mayor a 0.');
  const isExpense = String(type || '').toLowerCase() === 'gasto';
  if (isExpense && (!category || !String(category).trim())) {
    errors.push('La categoría es obligatoria al registrar un gasto.');
  }
  return errors;
};

// HU-03: solo JPG/PNG y máximo 5MB. `sizeBytes` se calcula desde el contenido recibido.
export const validateVoucher = ({ mimeType, sizeBytes }) => {
  const errors = [];
  if (!ALLOWED_VOUCHER_TYPES.includes(mimeType)) errors.push('El comprobante debe ser JPG o PNG.');
  if (!(sizeBytes > 0) || sizeBytes > MAX_VOUCHER_BYTES) errors.push('El comprobante no puede superar los 5MB.');
  return errors;
};
