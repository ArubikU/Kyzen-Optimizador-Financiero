import React, { useEffect } from 'react';
import { useFinancial } from '../context/AuthContext';
import { PlusCircle, Brain, Loader2, Target, Calendar, AlertTriangle, TrendingDown, Sparkles, ShieldCheck } from 'lucide-react';

export default function DashboardPage({ onNavigateToAiHub }) {
  const { transactions, goals, isLoading, user, fetchTransactions, fetchGoals, formatAmount } = useFinancial();

  useEffect(() => {
    if (fetchTransactions) fetchTransactions();
    if (fetchGoals) fetchGoals();
  }, []);

  const activeTransactions = transactions || [];
  const activeGoals = goals || [];

  // --- 📐 CÁLCULO DE BALANCE GENERAL (CONSERVADO INTACTO) ---
  const totalIncome = activeTransactions.filter(t => t.type?.toLowerCase() === 'ingreso').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpenses = activeTransactions.filter(t => t.type?.toLowerCase() === 'gasto').reduce((sum, t) => sum + Number(t.amount), 0);
  const currentBalance = totalIncome - totalExpenses;

  // --- 📊 DISTRIBUCIÓN POR CATEGORÍAS (LAS 6 OFICIALES) ---
  const categories = ['Viaje', 'Transporte', 'Estudios', 'Servicios', 'Hogar', 'Otros'];
  const categoryColors = {
    Viaje: '#818cf8',
    Transporte: '#93c5fd',
    Estudios: '#22d3ee',
    Servicios: '#34d399',
    Hogar: '#fca5a5',
    Otros: '#cbd5e1'
  };

  const categoryTotals = categories.reduce((acc, cat) => {
    acc[cat] = activeTransactions
      .filter(t => t.type?.toLowerCase() === 'gasto' && t.category === cat)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return acc;
  }, {});

  // --- 🌟 LOGICA DE SIMULACIÓN PARA LAS RECOMENDACIONES DE IA ---
  const getAiRecommendation = () => {
    const expensesPool = activeTransactions.filter(t => t.type?.toLowerCase() === 'gasto');
    
    // Configuración base por defecto si no existen transacciones
    if (expensesPool.length === 0) {
      return {
        title: "Recomendaciones IA",
        text: "Tu cuenta está lista. Registra tu primer gasto en campus para activar las métricas predictivas de Kyzen.",
        icon: Brain,
        color: "text-cyan-600",
        bg: "bg-cyan-50/50"
      };
    }

    // Buscamos cuál es la categoría en la que el usuario ha gastado más dinero
    let topCategory = 'Otros';
    let maxAmount = 0;
    
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      if (amt > maxAmount) {
        maxAmount = amt;
        topCategory = cat;
      }
    });

    const formattedAmount = formatAmount(maxAmount);

    // Repositorio de microconsejos financieros basados en los datos reales del alumno
    const recommendationsPool = {
      Viaje: {
        title: "Optimización de Presupuesto de Viaje",
        text: `Tus consumos de Viajes lideran tus egresos con ${formattedAmount}. Planifica tus traslados de fin de semana con anticipación y prioriza paquetes grupales para reducir costos fijados.`,
        icon: TrendingDown,
        color: "text-indigo-600",
        bg: "bg-indigo-50/50"
      },
      Transporte: {
        title: "Análisis de Movilidad Eficiente",
        text: `Has destinado ${formattedAmount} en Transporte. Si utilizas transporte público o colectivos hacia la universidad, planifica recargas fijas a inicio de mes para mitigar el desbalance de caja diario.`,
        icon: TrendingDown,
        color: "text-blue-500",
        bg: "bg-blue-50/50"
      },
      Estudios: {
        title: "Inversión Académica y Control",
        text: `Registras ${formattedAmount} invertidos en material educativo. Contrasta estos consumos con tus metas de ahorro activas para financiar tus certificaciones sin alterar tus costos fijos.`,
        icon: Target,
        color: "text-purple-600",
        bg: "bg-purple-50/50"
      },
      Servicios: {
        title: "Alerta de Control de Gastos Fijos",
        text: `Tus recibos de Servicios acumulan un pico de ${formattedAmount}. Configurar alertas de pago digital automáticas te ayudará a evitar recargos por mora en tus balances semanales.`,
        icon: AlertTriangle,
        color: "text-emerald-600",
        bg: "bg-emerald-50/50"
      },
      Hogar: {
        title: "Sugerencia de Abastecimiento Consolidado",
        text: `Detectamos egresos de ${formattedAmount} en Hogar. Centralizar las adquisiciones esenciales de tu vivienda en un solo día te permitirá aprovechar mejores tasas de descuento por volumen.`,
        icon: Sparkles,
        color: "text-rose-500",
        bg: "bg-rose-50/50"
      },
      Otros: {
        title: "Recomendación de Clasificación Finanzas",
        text: `Tienes consumos registrados en 'Otros' por ${formattedAmount}. Desglosar estos conceptos dentro de las categorías base de Kyzen permitirá a la IA proveerte microconsejos de ahorro más precisos.`,
        icon: Brain,
        color: "text-slate-500",
        bg: "bg-slate-50/60"
      }
    };

    return recommendationsPool[topCategory] || recommendationsPool['Otros'];
  };

  const aiData = getAiRecommendation();
  const AiIcon = aiData.icon;

  // --- 🌟 LOGICA DINÁMICA: FILTRAR Y ORDENAR LAS 3 METAS MÁS PRÓXIMAS ---
  const top3Goals = [...activeGoals]
    .filter(g => g.deadline) 
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline)) 
    .slice(0, 3); 

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
        <p className="text-sm font-bold text-slate-400">Sincronizando analítica de Kyzen...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn w-full pb-12 select-none">
      
      {/* Saludo */}
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          ¡Bienvenido, {user?.name?.split(' ')[0] || 'Usuario'}! 👋
        </h2>
        <p className="text-xs font-semibold text-slate-400 mt-0.5">Estado actual de tus finanzas en campus.</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-teal-50 via-blue-50 to-indigo-100 border border-slate-200/60 rounded-3xl p-8 shadow-md">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Balance General</p>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight mt-1">
          Balance: {formatAmount(currentBalance)}
        </h1>
        <div className="flex gap-8 pt-4 border-t border-slate-200/50 max-w-md mt-4">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase"><span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>Ingresos</p>
            <p className="text-lg font-black text-slate-800">{formatAmount(totalIncome)}</p>
          </div>
          <div className="border-l border-slate-200/80 pl-8">
            <p className="text-xs font-bold text-slate-400 uppercase"><span className="inline-block w-2 h-2 rounded-full bg-rose-400 mr-1.5"></span>Gastos</p>
            <p className="text-lg font-black text-slate-800">{formatAmount(totalExpenses)}</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pastel */}
        <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-6 flex flex-col items-center">
          <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider w-full text-left mb-4">Distribución por Categoría</h4>
          <div className="relative w-48 h-48 my-2">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
              {(() => {
                let accumulatedPercent = 0;
                const totalRealGasto = activeTransactions.filter(t => t.type?.toLowerCase() === 'gasto').reduce((sum, t) => sum + Number(t.amount), 0);
                
                if (totalRealGasto === 0) return null;

                return categories.map((cat) => {
                  const val = categoryTotals[cat];
                  const percent = (val / totalRealGasto) * 100;
                  if (!percent) return null;
                  const strokeDasharray = `${percent} ${100 - percent}`;
                  const strokeDashoffset = 100 - accumulatedPercent;
                  accumulatedPercent += percent;
                  return (
                    <circle key={cat} cx="18" cy="18" r="15.915" fill="none" stroke={categoryColors[cat]} strokeWidth="3.8" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />
                  );
                });
              })()}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Gasto total</span>
              <span className="text-base font-black text-slate-800">{formatAmount(totalExpenses)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 w-full px-2 text-[11px]">
            {categories.map(cat => {
              const totalRealGasto = activeTransactions.filter(t => t.type?.toLowerCase() === 'gasto').reduce((sum, t) => sum + Number(t.amount), 0);
              const p = totalRealGasto > 0 ? ((categoryTotals[cat] / totalRealGasto) * 100) : 0;
              return (
                <div key={cat} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColors[cat] }}></span>
                    <span>{cat}</span>
                  </div>
                  <span className="font-bold text-slate-400">{p.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Barras */}
        <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-6 flex flex-col justify-between">
          <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider text-left mb-4">Gastos Mensuales</h4>
          <div className="h-44 flex items-end justify-around px-2 border-b border-slate-100 relative pt-6">
            <div className="absolute left-0 right-0 top-2 border-t border-slate-100 text-[9px] font-bold text-slate-300">1000</div>
            <div className="absolute left-0 right-0 top-1/2 border-t border-slate-100 text-[9px] font-bold text-slate-300">500</div>
            {categories.map(cat => {
              const value = categoryTotals[cat];
              const heightPercent = value > 0 ? Math.min((value / 1000) * 100, 100) : 0;
              return (
                <div key={cat} className="w-8 rounded-t-xl shadow-sm transition-all duration-500" style={{ height: `${heightPercent || 2}px`, backgroundColor: value > 0 ? categoryColors[cat] : '#f1f5f9' }}></div>
              );
            })}
          </div>
          <div className="flex justify-around text-[9px] font-black text-slate-400 pt-3 uppercase">
            {categories.map(cat => <span key={cat} className="w-8 text-center">{cat}</span>)}
          </div>
        </div>
      </div>

      {/* 🚀 Banner IA Dinámico con botón "Ver más" en la esquina derecha */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex items-start justify-between gap-4 transition-all duration-300 relative group">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl shrink-0 ${aiData.bg} ${aiData.color}`}>
            <AiIcon size={20} />
          </div>
          <div className="space-y-0.5 pr-4 md:pr-16">
            <h4 className="font-black text-slate-900 text-sm">{aiData.title}</h4>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              {aiData.text}
            </p>
          </div>
        </div>
        
        {/* Botón interactivo premium */}
        <button 
          onClick={() => {
            if (onNavigateToAiHub) onNavigateToAiHub();
          }}
          className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 bg-indigo-50/50 hover:bg-indigo-100/70 px-3 py-1.5 rounded-xl transition-all uppercase tracking-wider shrink-0 shadow-sm"
        >
          Ver más
        </button>
      </div>

      {/* Operaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-xl rounded-[24px] p-6 space-y-4">
          <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">Próximas Metas a Cumplir</h4>
          
          {top3Goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-slate-400 text-xs font-semibold gap-1.5">
              <Target size={20} className="text-slate-300" />
              <span>No tienes objetivos de ahorro activos este ciclo.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {top3Goals.map((g, i) => {
                const target = Number(g.targetAmount || 0);
                const current = Number(g.currentAmount || 0);
                const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;

                return (
                  <div key={g.id || i} className="space-y-1.5 border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                    <div className="flex justify-between text-xs font-bold">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{g.categoryIcon || '🎯'}</span>
                        <span className="text-slate-800 font-black">{g.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar size={11} />
                          {g.deadline ? new Date(g.deadline + 'T00:00:00').toLocaleDateString('es-PE', { month: 'short', year: 'numeric' }) : ''}
                        </span>
                        <span className="text-indigo-600 font-black">{percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500 shadow-sm" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Botonera Lateral */}
        <div className="flex flex-col gap-3">
          <button onClick={() => {
            const navButtons = document.querySelectorAll('header nav button');
            navButtons.forEach(b => b.textContent.includes('Transacciones') && b.click());
          }} className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-between text-xs uppercase tracking-wider shadow-sm">
            <span>Registrar Gasto</span>
          </button>
          <button onClick={() => {
            const navButtons = document.querySelectorAll('header nav button');
            navButtons.forEach(b => b.textContent.includes('Transacciones') && b.click());
          }} className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-between text-xs uppercase tracking-wider shadow-sm">
            <span>Registrar Ingreso</span>
          </button>
          <button onClick={() => {
            const navButtons = document.querySelectorAll('header nav button');
            navButtons.forEach(b => b.textContent.includes('Historial') && b.click());
          }} className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-between text-xs uppercase tracking-wider shadow-sm">
            <span>Ver movimientos</span>
          </button>
        </div>
      </div>

    </div>
  );
}