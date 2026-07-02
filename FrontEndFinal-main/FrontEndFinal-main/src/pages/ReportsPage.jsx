import React, { useState, useEffect } from 'react';
import { useFinancial } from '../context/AuthContext';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Minus } from 'lucide-react';

export default function ReportsPage() {
  // 🚀 Extraemos formatAmount para las tarjetas analíticas de periodos y barras
  const { transactions, fetchTransactions, formatAmount } = useFinancial();
  const [timePeriod, setTimePeriod] = useState('Mensual');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Todos');

  useEffect(() => {
    if (fetchTransactions) fetchTransactions();
  }, []);

  const activeTransactions = transactions || [];
  const now = new Date('2026-06-17T10:44:01');

  const getPeriodData = () => {
    let currentPeriodTransactions = [];
    let previousPeriodTransactions = [];
    let labelVs = "periodo anterior";
    let chartLabels = [];
    let chartDataPoints = [];

    if (timePeriod === 'Semanal') {
      labelVs = "vs sem. pasada";
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      currentPeriodTransactions = activeTransactions.filter(t => {
        const d = new Date(t.date);
        return d >= oneWeekAgo && d <= now;
      });
      previousPeriodTransactions = activeTransactions.filter(t => {
        const d = new Date(t.date);
        return d >= twoWeeksAgo && d < oneWeekAgo;
      });

      const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      for (let i = 6; i >= 0; i--) {
        const dayDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        chartLabels.push(daysOfWeek[dayDate.getDay()]);
        
        const dayTxs = currentPeriodTransactions.filter(t => new Date(t.date).toDateString() === dayDate.toDateString());
        chartDataPoints.push({
          income: dayTxs.filter(t => t.type?.toLowerCase() === 'ingreso').reduce((s, t) => s + Number(t.amount), 0),
          expenses: dayTxs.filter(t => t.type?.toLowerCase() === 'gasto').reduce((s, t) => s + Number(t.amount), 0)
        });
      }

    } else if (timePeriod === 'Anual') {
      labelVs = "vs año pasado";
      currentPeriodTransactions = activeTransactions.filter(t => new Date(t.date).getFullYear() === 2026);
      previousPeriodTransactions = activeTransactions.filter(t => new Date(t.date).getFullYear() === 2025);

      chartLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
      chartLabels.forEach((_, idx) => {
        const monthlyTxs = currentPeriodTransactions.filter(t => new Date(t.date).getMonth() === idx);
        chartDataPoints.push({
          income: monthlyTxs.filter(t => t.type?.toLowerCase() === 'ingreso').reduce((s, t) => s + Number(t.amount), 0),
          expenses: monthlyTxs.filter(t => t.type?.toLowerCase() === 'gasto').reduce((s, t) => s + Number(t.amount), 0)
        });
      });

    } else {
      labelVs = "vs mayo";
      currentPeriodTransactions = activeTransactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === 5 && d.getFullYear() === 2026;
      });
      previousPeriodTransactions = activeTransactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === 4 && d.getFullYear() === 2026;
      });

      chartLabels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
      for (let i = 0; i < 4; i++) {
        const startDay = i * 7 + 1;
        const endDay = (i + 1) * 7;
        const weeklyTxs = currentPeriodTransactions.filter(t => {
          const day = new Date(t.date).getDate();
          return day >= startDay && day <= endDay;
        });
        chartDataPoints.push({
          income: weeklyTxs.filter(t => t.type?.toLowerCase() === 'ingreso').reduce((s, t) => s + Number(t.amount), 0),
          expenses: weeklyTxs.filter(t => t.type?.toLowerCase() === 'gasto').reduce((s, t) => s + Number(t.amount), 0)
         });
      }
    }

    const incomeCurrent = currentPeriodTransactions.filter(t => t.type?.toLowerCase() === 'ingreso').reduce((s, t) => s + Number(t.amount), 0);
    const expensesCurrent = currentPeriodTransactions.filter(t => t.type?.toLowerCase() === 'gasto').reduce((s, t) => s + Number(t.amount), 0);
    const incomePrevious = previousPeriodTransactions.filter(t => t.type?.toLowerCase() === 'ingreso').reduce((s, t) => s + Number(t.amount), 0);
    const expensesPrevious = previousPeriodTransactions.filter(t => t.type?.toLowerCase() === 'gasto').reduce((s, t) => s + Number(t.amount), 0);

    const calculatePercentageChange = (curr, prev) => {
      if (prev === 0) return 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    return {
      incomeCurrent,
      expensesCurrent,
      incomeChange: calculatePercentageChange(incomeCurrent, incomePrevious),
      expensesChange: calculatePercentageChange(expensesCurrent, expensesPrevious),
      labelVs,
      currentPeriodTransactions,
      chartLabels,
      chartDataPoints
    };
  };

  const { 
    incomeCurrent, expensesCurrent, incomeChange, expensesChange, 
    labelVs, currentPeriodTransactions, chartLabels, chartDataPoints 
  } = getPeriodData();

  const categoriesDef = [
    { name: 'Comida', emoji: '🍔', color: '#6366f1' },
    { name: 'Transporte', emoji: '🚕', color: '#818cf8' },
    { name: 'Estudios', emoji: '🎓', color: '#22d3ee' },
    { name: 'Servicios', emoji: '⚡', color: '#34d399' },
    { name: 'Hogar', emoji: '🏠', color: '#fca5a5' },
    { name: 'Otros', emoji: '⚙️', color: '#cbd5e1' }
  ];

  const categoryTotals = categoriesDef.reduce((acc, cat) => {
    acc[cat.name] = currentPeriodTransactions
      .filter(t => t.type?.toLowerCase() === 'gasto' && (cat.name === 'Otros' ? (!['Comida', 'Transporte', 'Estudios', 'Servicios', 'Hogar'].includes(t.category)) : t.category === cat.name))
      .reduce((s, t) => s + Number(t.amount), 0);
    return acc;
  }, {});

  const maxCategoryAmount = Math.max(...Object.values(categoryTotals), 1);
  const maxChartValue = Math.max(...chartDataPoints.map(p => Math.max(p.income, p.expenses)), 100);
  const yAxisMax = Math.ceil(maxChartValue / 100) * 100;

  return (
    <div className="w-full font-sans select-none animate-fadeIn space-y-6 pb-12">
      
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => {
            const navButtons = document.querySelectorAll('header nav button');
            navButtons.forEach(btn => btn.textContent.includes('Panel') && btn.click());
          }} className="p-2 hover:bg-slate-50 border border-slate-200/60 rounded-xl transition-all">
            <ArrowLeft size={16} className="text-slate-600" />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Reportes Analíticos</h2>
            <p className="text-[11px] font-semibold text-slate-400">Control matemático de tus finanzas por periodos.</p>
          </div>
        </div>
        <div>
          <span className="text-indigo-600 font-bold text-xs bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl flex items-center gap-2">
            <Calendar size={14} /> Junio 2026
          </span>
        </div>
      </div>

      <div className="bg-slate-100 p-1.5 rounded-2xl flex w-full max-w-2xl mx-auto border border-slate-200/40 shadow-inner">
        {['Mensual', 'Semanal', 'Anual'].map((period) => (
          <button key={period} onClick={() => setTimePeriod(period)} className={`flex-1 text-center py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${timePeriod === period ? 'bg-white text-indigo-600 shadow-md transform scale-[1.01]' : 'text-slate-400 hover:text-slate-600'}`}>{period}</button>
        ))}
      </div>

      {/* TARJETAS CONVERTIDAS REACTIVAMENTE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">↑ Ingresos del Periodo</span>
            <h2 className="text-4xl font-black text-emerald-600 tracking-tight mt-1">
              {formatAmount(incomeCurrent)}
            </h2>
          </div>
          <div className="flex items-center gap-1 mt-4 text-[11px] font-black">
            {incomeChange > 0 ? (
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg flex items-center gap-0.5"><TrendingUp size={12} /> +{incomeChange}%</span>
            ) : incomeChange < 0 ? (
              <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg flex items-center gap-0.5"><TrendingDown size={12} /> {incomeChange}%</span>
            ) : (
              <span className="text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg flex items-center gap-0.5"><Minus size={12} /> 0%</span>
            )}
            <span className="text-slate-400 font-bold ml-1">{labelVs}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">↓ Gastos del Periodo</span>
            <h2 className="text-4xl font-black text-rose-500 tracking-tight mt-1">
              {formatAmount(expensesCurrent)}
            </h2>
          </div>
          <div className="flex items-center gap-1 mt-4 text-[11px] font-black">
            {expensesChange > 0 ? (
              <span className="text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg flex items-center gap-0.5"><TrendingUp size={12} /> +{expensesChange}%</span>
            ) : expensesChange < 0 ? (
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg flex items-center gap-0.5"><TrendingDown size={12} /> {expensesChange}%</span>
            ) : (
              <span className="text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg flex items-center gap-0.5"><Minus size={12} /> 0%</span>
            )}
            <span className="text-slate-400 font-bold ml-1">{labelVs}</span>
          </div>
        </div>
      </div>

      {/* GRÁFICO SVG CONTEXTUAL */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h3 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-wider">Ingresos vs Gastos ({timePeriod})</h3>
        
        <div className="w-full relative pt-2">
          <div className="absolute left-0 right-0 top-0 border-b border-slate-100 text-[9px] font-bold text-slate-300 pb-0.5">{(yAxisMax).toLocaleString()}</div>
          <div className="absolute left-0 right-0 top-1/4 border-b border-slate-100 text-[9px] font-bold text-slate-300 pb-0.5">{(yAxisMax * 0.75).toLocaleString()}</div>
          <div className="absolute left-0 right-0 top-2/4 border-b border-slate-100 text-[9px] font-bold text-slate-300 pb-0.5">{(yAxisMax * 0.5).toLocaleString()}</div>
          <div className="absolute left-0 right-0 top-3/4 border-b border-slate-100 text-[9px] font-bold text-slate-300 pb-0.5">{(yAxisMax * 0.25).toLocaleString()}</div>
          <div className="absolute left-0 right-0 bottom-6 border-b border-slate-200 text-[9px] font-bold text-slate-300">0</div>

          <svg viewBox="0 0 600 160" className="w-full h-48 overflow-visible">
            {chartDataPoints.length > 1 && (
              <>
                <path fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d={chartDataPoints.map((pt, i) => {
                  const stepX = 560 / (chartDataPoints.length - 1);
                  return `${i === 0 ? 'M' : 'L'} ${(i * stepX) + 20} ${134 - (pt.income / yAxisMax) * 120}`;
                }).join(' ')} />
                {chartDataPoints.map((pt, i) => <circle key={`in-${i}`} cx={(i * (560 / (chartDataPoints.length - 1))) + 20} cy={134 - (pt.income / yAxisMax) * 120} r="4" fill="#10b981" stroke="white" strokeWidth="1" />)}

                <path fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d={chartDataPoints.map((pt, i) => {
                  const stepX = 560 / (chartDataPoints.length - 1);
                  return `${i === 0 ? 'M' : 'L'} ${(i * stepX) + 20} ${134 - (pt.expenses / yAxisMax) * 120}`;
                }).join(' ')} />
                {chartDataPoints.map((pt, i) => <circle key={`ex-${i}`} cx={(i * (560 / (chartDataPoints.length - 1))) + 20} cy={134 - (pt.expenses / yAxisMax) * 120} r="4" fill="#ea580c" stroke="white" strokeWidth="1" />)}
              </>
            )}
          </svg>

          <div className="flex justify-between text-[10px] font-black text-slate-400 px-1 mt-2 uppercase tracking-wider">
            {chartLabels.map((lbl, idx) => <span key={idx} className="flex-1 text-center">{lbl}</span>)}
          </div>
        </div>
      </div>

      {/* BARRAS POR CATEGORÍAS */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Distribución de Gastos por Categoría</h3>
        
        <div className="flex gap-2 overflow-x-auto pb-1 text-[10px] font-black uppercase tracking-wider select-none">
          {['Todos', 'Comida', 'Transporte', 'Estudios', 'Servicios', 'Hogar', 'Ocio'].map(f => (
            <button key={f} onClick={() => setSelectedCategoryFilter(f)} className={`px-4 py-2 rounded-xl border transition-all ${selectedCategoryFilter === f ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}>{f === 'Ocio' ? 'Ocio / Otros' : f}</button>
          ))}
        </div>

        <div className="space-y-4">
          {categoriesDef
            .filter(cat => selectedCategoryFilter === 'Todos' || (selectedCategoryFilter === 'Ocio' ? cat.name === 'Otros' : cat.name === selectedCategoryFilter))
            .map((cat) => {
              const amount = categoryTotals[cat.name] || 0;
              const widthPct = maxCategoryAmount > 0 ? (amount / maxCategoryAmount) * 100 : 0;

              return (
                <div key={cat.name} className="flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2 w-28 shrink-0 font-bold text-slate-600">
                    <span>{cat.emoji}</span>
                    <span className="truncate">{cat.name === 'Otros' ? 'Ocio / Otros' : cat.name}</span>
                  </div>
                  
                  <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden relative">
                    <div className="h-full rounded-full transition-all duration-500 shadow-inner" style={{ width: `${Math.max(widthPct, amount > 0 ? 4 : 0)}%`, backgroundColor: cat.color }}></div>
                  </div>

                  {/* 🚀 Monto de la categoría alineado */}
                  <div className="w-20 text-right font-black text-slate-800">
                    {formatAmount(amount)}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

    </div>
  );
}