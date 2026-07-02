import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinancial } from '../context/AuthContext';
import { loginUser } from '../services/authService';
import { Mail, Lock, LogIn, Shield, Star, RefreshCw } from 'lucide-react';
import logoKyzen from '../img/logo.jpg';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useFinancial(); // Traemos la acción global para guardar la sesión

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    try {
      // 1. Intenta iniciar sesión consumiendo tu API local en Express
      const data = await loginUser(email, password);
      
      // Si las credenciales son correctas, guardamos el token y el usuario en el contexto
      login(data.token, { name: data.name, email: data.email, id: data.id });
      navigate('/'); // Redirige al panel principal
    } catch (err) {
      console.warn("⚠️ Error de autenticación en la API. Aplicando salvavidas para la demo...");

      // 🚀 SALVAVIDAS DE EXPOSICIÓN EN VIVO:
      // Si el usuario no fue registrado previamente o reiniciaste el backend, 
      // estas credenciales quemadas te darán acceso inmediato para asegurar la continuidad de la demo.
      if (
        (email === 'rodrigo.test@ulima.edu.pe' || email === 'admin@kyzen.com') && 
        password === '123456'
      ) {
        const mockToken = 'jwt_fake_token_for_demo';
        const mockUser = { name: 'Rodrigo Raúl Quicaño', email: email, id: 99 };
        login(mockToken, mockUser);
        navigate('/');
      } else {
        setError(err.message || 'Credenciales inválidas. Verifica tus datos o usa la cuenta de prueba.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-between py-12 font-sans select-none animate-fadeIn">
      
      {/* Encabezado: Logo e Indicador de Bienvenida */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md">
          <img src={logoKyzen} alt="Kyzen Logo" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kyzen</h1>
          <p className="text-xs font-bold text-slate-400 mt-0.5">Bienvenido de vuelta 👋</p>
        </div>
      </div>

      {/* CONTENEDOR CENTRAL DEL FORMULARIO (Diseño fiel a image_6f6b84.png) */}
      <div className="w-full max-w-xl mx-auto px-4">
        <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-8">
          
          <div className="mb-6">
            <h3 className="font-black text-slate-900 text-xl">Inicia sesión</h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Ingresa tus credenciales para continuar</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs font-bold rounded-r-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Correo Electrónico */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com" 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-800 font-medium" 
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••" 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-800 font-medium" 
                />
              </div>
            </div>

            {/* Olvidaste tu contraseña */}
            <div className="text-right">
              <button 
                type="button" 
                onClick={() => navigate('/forgot-password')}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Botón de envío */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl shadow-md text-sm transition-all active:scale-[0.99] disabled:bg-slate-400"
            >
              <LogIn size={16} /> {loading ? 'Autenticando...' : 'Iniciar Sesión'}
            </button>

            {/* Divisor Alternativo */}
            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-slate-100"></div>
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">o continúa con</span>
              <div className="flex-1 h-px bg-slate-100"></div>
            </div>

            {/* Botones Sociales del Mockup */}
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <button type="button" className="flex items-center justify-center gap-2 border border-slate-200 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50">
                <span>G</span> Google
              </button>
              <button type="button" className="flex items-center justify-center gap-2 border border-slate-200 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50">
                <span></span> Apple
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Pie de Página: Registro Enlace y Trust Badges */}
      <div className="space-y-6 text-center mt-8 w-full">
        <p className="text-sm text-gray-400 font-medium">
          ¿No tienes cuenta?{' '}
          <button onClick={() => navigate('/registro')} className="text-indigo-600 font-bold hover:underline">
            Regístrate gratis
          </button>
        </p>

        <div className="grid grid-cols-3 gap-2 border-t border-slate-200 max-w-xl mx-auto w-full pt-6 text-center px-4">
          <div className="flex flex-col items-center space-y-1">
            <Shield size={14} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400">Cifrado 256-bits</span>
          </div>
          <div className="flex flex-col items-center space-y-1 border-x border-slate-100">
            <Star size={14} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400">50K+ usuarios</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <RefreshCw size={14} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400">Sincronizado en tiempo real</span>
          </div>
        </div>
      </div>

    </div>
  );
} 