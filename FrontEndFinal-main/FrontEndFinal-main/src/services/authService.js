// Base de URL directa hacia tu backend local en ejecución
const API_BASE_URL = 'http://localhost:4000/api/auth';

// PANTALLA 2 (Etapa 1 & 2): Registro de Identidad y Credenciales Universitarias
export const registerUser = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Error en el registro de usuario de Kyzen.');
    }
    return data; 
};

// PANTALLA 2 (Etapa 3): Validación estricta del código numérico enviado
export const verifyOtp = async (email, code) => {
    const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Código OTP inválido o expirado.');
    }
    return data;
};

// PANTALLA 3: Login e inicio de sesión seguro
export const loginUser = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Error de autenticación.');
    }
    return data; 
};

// PANTALLA 11 (Seguridad): Modificación de contraseñas cruzadas
export const changePassword = async (passwords, authHeader) => {
    const response = await fetch(`${API_BASE_URL}/password`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...authHeader
        },
        body: JSON.stringify(passwords), 
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar la contraseña.');
    }
    return data;
};

// PANTALLA 13: Recuperación de credenciales - Envío de OTP de reinicio
export const requestPasswordReset = async (email) => {
    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al procesar recuperación.');
    return data;
};

// PANTALLA 13: Establecer y guardar nueva contraseña
export const submitNewPassword = async (email, token, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al actualizar contraseña.');
    return data;
};