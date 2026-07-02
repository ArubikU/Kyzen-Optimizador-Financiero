import React, { useState } from 'react';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:4000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword })
      });
      const data = await res.json();

      setIsError(!res.ok);
      setMessage(data.message);
    } catch (err) {
      setIsError(true);
      setMessage('Error de conexión.');
    } {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-white min-h-full">
      <h2 className="text-2xl font-black text-gray-950 text-center mb-6">Restablecer Credenciales</h2>

      {message && (
        <div className={`p-3 rounded-xl text-xs font-semibold mb-4 border ${isError ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" placeholder="Correo institucional" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" required />
        <input type="text" placeholder="Código OTP (5 dígitos)" value={token} onChange={(e) => setToken(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" required />
        <input type="password" placeholder="Nueva Contraseña" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" required />
        
        <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl text-sm shadow-md">
          {isLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
        </button>
      </form>
    </div>
  );
}