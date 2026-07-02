import React, { useState, useEffect } from 'react';
import { useFinancial } from '../context/AuthContext';
import { Plus, Calendar, Target, X, Loader2 } from 'lucide-react';

export default function GoalsPage() {
  // 🚀 Inyectamos formatAmount y currency para el control multi-divisa reactivo
  const { goals, addGoal, isLoading, fetchGoals, formatAmount, currency } = useFinancial();
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  
  const [goalForm, setGoalForm] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: '',
    categoryIcon: '💻'
  });

  useEffect(() => {
    if (fetchGoals) fetchGoals();
  }, []);

  const activeGoals = goals || [];

  // --- 📐 CÁCULOS CONSERVADOS ---
  const totalCurrent = activeGoals.reduce((sum, g) => sum + Number(g.currentAmount || 0), 0);
  const totalTarget = activeGoals.reduce((sum, g) => sum + Number(g.targetAmount || 0), 0);
  const totalPercentage = totalTarget > 0 ? Math.min(Math.round((totalCurrent / totalTarget) * 100), 100) : 0;
  const activeCount = activeGoals.length;

  const iconsList = [
    { icon: '💻', label: 'Tecnología' },
    { icon: '✈️', label: 'Vacaciones' },
    { icon: '🎮', label: 'Entretenimiento' },
    { icon: '🏥', label: 'Fondo Seguro' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!goalForm.name || !goalForm.targetAmount || !goalForm.deadline) return;

    setFormLoading(true);
    const result = await addGoal({
      name: goalForm.name,
      targetAmount: parseFloat(goalForm.targetAmount),
      currentAmount: parseFloat(goalForm.currentAmount || 0),
      deadline: goalForm.deadline,
      categoryIcon: goalForm.categoryIcon
    });

    if (result && result.success) {
      setGoalForm({ name: '', targetAmount: '', currentAmount: '0', deadline: '', categoryIcon: '💻' });
      setShowModal(false);
    }
    setFormLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
        <p className="text-sm font-bold text-slate-400">Sincronizando tus metas de ahorro...</p>
      </div>
    );
  }

  return (
    <div className="w-full font-sans select-none animate-fadeIn space-y-8 pb-12">
      
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Metas</h1>
        <p className="text-xs font-semibold text-slate-400 mt-0.5">Construye tu futuro, una meta a la vez.</p>
      </div>

      {/* 🟢 BANNER CARD CONVERTIDO A LA DIVISA ACTIVA */}
      <div className="bg-[#a7f3d0] rounded-[24px] p-6 md:p-8 relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm border border-emerald-200/50">
        <div className="space-y-1">
          <p className="text-emerald-800 text-xs font-black uppercase tracking-wider">Total ahorrado</p>
          <h2 className="text-4xl md:text-5xl font-black text-emerald-950 tracking-tight">
            {formatAmount(totalCurrent)}
          </h2>
          <p className="text-emerald-700 text-xs font-bold pt-1">
            de {formatAmount(totalTarget)} • {activeCount} metas activas
          </p>
          
          <div className="w-64 bg-white/40 h-2.5 rounded-full overflow-hidden mt-3 shadow-inner">
            <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${totalPercentage}%` }}></div>
          </div>
        </div>

        <div className="text-right md:border-l md:border-emerald-300/50 md:pl-8 shrink-0">
          <h3 className="text-5xl font-black text-emerald-950 tracking-tight">{totalPercentage}%</h3>
          <p className="text-emerald-700 text-[10px] font-black uppercase tracking-widest mt-0.5">del objetivo total</p>
        </div>
      </div>

      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <h3 className="text-base font-black text-slate-800 tracking-tight">Tus metas</h3>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#6366f1] hover:bg-[#4f46e5] text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus size={15} /> Crear meta
        </button>
      </div>

      {/* 📦 TARJETAS CONVERTIDAS EN TIEMPO REAL */}
      {activeGoals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
          <Target className="text-slate-300 mb-3" size={40} />
          <p className="text-sm font-black text-slate-400">No tienes metas registradas aún</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeGoals.map((goal, idx) => {
            const target = Number(goal.targetAmount || 0);
            const current = Number(goal.currentAmount || 0);
            const progress = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
            const remaining = Math.max(target - current, 0);

            const colorMap = {
              '💻': { color: 'text-indigo-600', bar: 'bg-indigo-600', bg: 'bg-indigo-50' },
              '✈️': { color: 'text-purple-600', bar: 'bg-purple-600', bg: 'bg-purple-50' },
              '🎮': { color: 'text-emerald-600', bar: 'bg-emerald-600', bg: 'bg-emerald-50' },
              '🏥': { color: 'text-amber-500', bar: 'bg-amber-500', bg: 'bg-amber-50' },
            };
            const currentStyle = colorMap[goal.categoryIcon] || colorMap['💻'];

            return (
              <div key={goal.id || idx} className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-5 flex flex-col justify-between transition-all hover:shadow-md relative">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-center">
                    <div className={`w-12 h-12 rounded-2xl ${currentStyle.bg} flex items-center justify-center text-xl shadow-inner`}>
                      {goal.categoryIcon}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm tracking-tight">{goal.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 capitalize">
                        {iconsList.find(i => i.icon === goal.categoryIcon)?.label || 'Ahorros'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xl font-black ${currentStyle.color}`}>{progress}%</span>
                </div>

                <div className="mt-4">
                  <div className="flex items-baseline gap-1 text-slate-400 font-bold text-xs">
                    <span className="text-xl font-black text-slate-900">{formatAmount(current)}</span>
                    <span>/ {formatAmount(target)}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3 relative shadow-inner">
                  <div className={`h-full ${currentStyle.bar} rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 mt-4 uppercase tracking-wider border-t border-slate-50 pt-3">
                  <div>Faltan {formatAmount(remaining)}</div>
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{goal.deadline ? new Date(goal.deadline + 'T00:00:00').toLocaleDateString('es-PE', { month: 'short', year: 'numeric' }) : 'Sin fecha'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL CONFIGURADO CON PREFIJO DINÁMICO */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[32px] border border-slate-200 p-6 md:p-8 w-full max-w-md mx-4 shadow-2xl relative animate-scaleUp">
            <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"><X size={18} /></button>

            <div className="mb-6">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Crear Objetivo de Ahorro</h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Establece una cuota para tus planes este ciclo.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Nombre del Objetivo</label>
                <input required type="text" placeholder="e.g. Certificación AWS, Laptop, PS5" value={goalForm.name} onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-inner" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Meta Objetivo</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">{currency === 'USD' ? '$' : 'S/'}</span>
                    <input required type="number" min="1" placeholder="0.00" value={goalForm.targetAmount} onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })} className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-inner" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Ahorro Inicial</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">{currency === 'USD' ? '$' : 'S/'}</span>
                    <input type="number" min="0" placeholder="0.00" value={goalForm.currentAmount} onChange={(e) => setGoalForm({ ...goalForm, currentAmount: e.target.value })} className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-inner" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Fecha de Cumplimiento</label>
                <input required type="date" value={goalForm.deadline} onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Categoría / Ícono</label>
                <div className="grid grid-cols-4 gap-2">
                  {iconsList.map(item => (
                    <button key={item.icon} type="button" onClick={() => setGoalForm({ ...goalForm, categoryIcon: item.icon })} className={`py-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-lg ${goalForm.categoryIcon === item.icon ? 'border-indigo-600 bg-indigo-50/50 scale-[1.03]' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}>
                      <span>{item.icon}</span>
                      <span className="text-[8px] font-black uppercase mt-1 tracking-tight text-slate-400">{item.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 pt-4">
                <button type="submit" disabled={formLoading} className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-black py-3 rounded-xl shadow-md text-xs uppercase tracking-wider transition-all disabled:opacity-50">{formLoading ? 'Guardando objetivo...' : 'Guardar Objetivo'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600 py-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}