import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Shield, Star, RefreshCw } from 'lucide-react';
// --- IMPORTAMOS TU LOGO REAL ---
import logoKyzen from '../img/logo.jpg';

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-12 bg-white min-h-screen animate-fadeIn select-none w-full max-w-7xl mx-auto">
      
      {/* Zona Superior: Logotipo y Eslogan */}
      <div className="flex flex-col items-center text-center mt-8 space-y-6">
        
        {/* Contenedor del Logo usando tu imagen física */}
        <div className="w-24 h-24 rounded-[28px] overflow-hidden shadow-xl shadow-indigo-100 border border-slate-100 bg-white">
          <img 
            src={logoKyzen} 
            alt="Kyzen Logo" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.parentNode.innerHTML = '<div className="w-full h-full bg-gradient-to-br from-indigo-600 to-emerald-500 flex items-center justify-center text-white text-4xl font-black">K</div>';
            }}
          />
        </div>

        <div>
          <h1 className="text-4xl font-black text-gray-950 tracking-tight">Kyzen</h1>
          <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full mt-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">IA financiera - beta</span>
          </div>
        </div>

        {/* 🌟 TEXTOS CORREGIDOS: Proporciones equilibradas y espaciado corregido */}
        <div className="space-y-4 max-w-xl pt-4 flex flex-col items-center">
          {/* Título imponente de alta fidelidad */}
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-none tracking-tight">
            Controla tu dinero. <br />
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-500 bg-clip-text text-transparent">
              Construye tu futuro.
            </span>
          </h2>
          
          {/* Texto gris más pequeño, sutil, legible y con margen inferior de separación */}
          <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed max-w-md pt- mb-8">
            Finanzas personales potenciadas por inteligencia artificial. <br className="hidden md:block" />
            Analiza, planifica y toma decisiones con claridad total.
          </p>
        </div>
      </div>

      {/* Zona Central: Botones de Acción de tu Captura */}
      <div className="space-y-4 w-full max-w-md mx-auto">
        <button 
          onClick={() => navigate('/login')}
          className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold py-4 rounded-xl shadow-sm transition-all active:scale-[0.99] text-sm"
        >
          <LogIn size={18} className="text-slate-500" /> Iniciar Sesión
        </button>

        <button 
          onClick={() => navigate('/registro')}
          className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold py-4 rounded-xl shadow-sm transition-all active:scale-[0.99] text-sm"
        >
          <UserPlus size={18} className="text-slate-500" /> Crear Cuenta
        </button>

        <p className="text-xs text-gray-400 font-medium text-center pt-2">
          ¿No tienes cuenta?{' '}
          <button onClick={() => navigate('/registro')} className="text-indigo-600 font-bold hover:underline">
            Regístrate gratis
          </button>
        </p>
      </div>

      {/* Zona Inferior: Badges de confianza de la Maqueta */}
      <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-8 mt-12 text-center max-w-xl mx-auto w-full">
        <div className="flex flex-col items-center space-y-1.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Shield size={16} />
          </div>
          <span className="text-[10px] font-bold text-slate-500 leading-tight">Cifrado 256-bits</span>
        </div>

        <div className="flex flex-col items-center space-y-1.5 border-x border-slate-100">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
            <Star size={16} />
          </div>
          <span className="text-[10px] font-bold text-slate-500 leading-tight">50K+ usuarios</span>
        </div>

        <div className="flex flex-col items-center space-y-1.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <RefreshCw size={16} />
          </div>
          <span className="text-[10px] font-bold text-slate-500 leading-tight">Tiempo real</span>
        </div>
      </div>

    </div>
  );
}