import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import { ShieldCheck, LogOut, Wallet, KeyRound, ArrowRight } from 'lucide-react';

export default function ProfileView() {
  const { user, logout } = useFinancial();

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 pb-24">
      {/* Cabecera de Perfil */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-center">
        <div className="w-20 h-20 bg-emerald-600 text-white text-3xl font-black rounded-full mx-auto flex items-center justify-center shadow-md">
          {user?.name ? user.name.charAt(0) : 'R'}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mt-4">{user?.name || 'Rodrigo Raúl Quicaño Alcantara'}</h3>
        <p className="text-sm text-gray-500 mt-0.5">{user?.email || 'tu@correo.com'}</p>
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mt-3">
          <ShieldCheck size={14} /> Estudiante Verificado
        </div>
      </div>

      {/* Opciones de Configuración */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
        <button className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3 text-gray-700">
            <KeyRound size={20} className="text-gray-400" />
            <span className="text-sm font-medium">Cambiar Contraseña</span>
          </div>
          <ArrowRight size={16} className="text-gray-400" />
        </button>

        <button className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3 text-gray-700">
            <Wallet size={20} className="text-gray-400" />
            <span className="text-sm font-medium">Preferencia de Moneda (Soles)</span>
          </div>
          <ArrowRight size={16} className="text-gray-400" />
        </button>

        <button 
          onClick={logout}
          className="w-full p-4 flex items-center gap-3 text-rose-600 hover:bg-rose-50 transition-colors font-semibold text-left"
        >
          <LogOut size={20} />
          <span className="text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}