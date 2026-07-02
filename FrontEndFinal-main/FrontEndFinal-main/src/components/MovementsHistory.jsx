import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import { Calendar, PlusCircle } from 'lucide-react';

export default function MovementsHistory() {
  const { transactions, isLoading } = useFinancial();

  if (isLoading) {
    return <div className="text-center p-12 text-gray-500 font-medium">Ordenando tus transacciones...</div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Historial de Movimientos</h2>
          <p className="text-xs text-gray-500">Listado cronológico de tu flujo de caja.</p>
        </div>
        <button className="flex items-center gap-1 text-xs font-bold bg-emerald-600 text-white px-3 py-2 rounded-xl shadow-md hover:bg-emerald-700 transition-colors">
          <PlusCircle size={14} /> Añadir
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No registras ningún ingreso o gasto todavía.</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
          {transactions.map((tx) => {
            const isIncome = tx.type === 'ingreso';
            const formattedDate = new Date(tx.date).toLocaleDateString('es-PE', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  {/* Círculo con Emoji de Categoría Autoclasificada por el Backend */}
                  <div 
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-inner shrink-0"
                    style={{ backgroundColor: `${tx.category?.color || '#94A3B8'}20` }}
                  >
                    {tx.category?.icon || '⚙️'}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 max-w-[180px] truncate">{tx.description}</h4>
                    <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Calendar size={12} /> {formattedDate}
                    </span>
                  </div>
                </div>

                {/* Monto con color condicional */}
                <div className={`text-right font-bold text-base ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isIncome ? '+' : '-'} S/. {tx.amount.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}