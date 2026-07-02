import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import { AlertTriangle, Lightbulb, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export default function DashboardCore() {
  const { dashboardData, isLoading, user } = useFinancial();
  const { totals, alertBanner, smartTip } = dashboardData;

  if (isLoading) {
    return <div className="text-center p-12 text-gray-500 font-medium">Cargando tu billetera virtual...</div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-5 pb-24">
      {/* Saludo Inicial */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">¡Hola, {user?.name || 'Rodrigo'}! 👋</h1>
          <p className="text-sm text-gray-500">Controla tus finanzas estudiantiles hoy.</p>
        </div>
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
          RR
        </div>
      </div>

      {/* Alerta de Presupuesto del 85% */}
      {alertBanner && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm flex items-start gap-3 animate-pulse">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-amber-800 font-medium">{alertBanner}</p>
        </div>
      )}

      {/* Card Principal: Balance General */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-[-20px] bottom-[-20px] text-white/10">
          <Wallet size={140} />
        </div>
        <p className="text-sm text-emerald-100 font-medium uppercase tracking-wider">Saldo Neto Disponible</p>
        <h2 className="text-4xl font-extrabold mt-1">S/. {totals?.balance?.toFixed(2) || '0.00'}</h2>
        
        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/20">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-xs text-emerald-100">Ingresos</p>
              <p className="text-sm font-bold">S/. {totals?.income?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingDown size={18} />
            </div>
            <div>
              <p className="text-xs text-emerald-100">Gastos</p>
              <p className="text-sm font-bold">S/. {totals?.expenses?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Tip de Inteligencia Artificial */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm flex gap-3 items-start">
        <Lightbulb className="text-emerald-600 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Kyzen Smart Tip</h4>
          <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{smartTip}</p>
        </div>
      </div>
    </div>
  );
}