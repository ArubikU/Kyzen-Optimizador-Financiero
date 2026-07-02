import React, { useState } from 'react';
import { useFinancial } from '../context/AuthContext';
import { Brain, Sparkles, TrendingDown, ArrowLeft, ShieldAlert, LineChart, HelpCircle, CheckCircle2, MessageSquare } from 'lucide-react';

export default function AiHubPage({ onBackToDashboard }) {
  const { transactions, formatAmount } = useFinancial();
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const activeTransactions = transactions || [];
  const expenses = activeTransactions.filter(t => t.type?.toLowerCase() === 'gasto');
  const totalIncome = activeTransactions.filter(t => t.type?.toLowerCase() === 'ingreso').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);

  // --- 📐 CÁLCULO LOGÍSTICO DEL HEALTH SCORE FINANCIERO ---
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
  let healthScore = 50; 
  if (savingsRate > 0) healthScore = Math.min(50 + savingsRate * 0.5, 100);
  if (savingsRate < 0) healthScore = Math.max(50 + savingsRate * 0.8, 10);
  const roundedScore = Math.round(healthScore);

  const getScoreLabel = (score) => {
    if (score >= 75) return { label: 'Excelente Salud ✨', color: 'text-emerald-500', bar: 'bg-emerald-500' };
    if (score >= 45) return { label: 'Estable / Controlado 📊', color: 'text-indigo-600', bar: 'bg-indigo-600' };
    return { label: 'Riesgo de Liquidez ⚠️', color: 'text-rose-500', bar: 'bg-rose-500' };
  };
  const scoreStyle = getScoreLabel(roundedScore);

  // --- 🌟 BANCO DE PREGUNTAS PREDICTIVAS (RESPUESTAS SIMULADAS AL INSTANTE) ---
  const aiPrompts = [
    {
      q: "¿Cuánto podré ahorrar al terminar este ciclo académico?",
      a: `Analizando tu patrón recurrente de egresos en el campus, si mantienes tus gastos estables por debajo de ${formatAmount(totalExpenses * 0.9)} semanales, tu proyección matemática indica que finalizarás el ciclo con un superávit neto estimado de ${formatAmount((totalIncome - totalExpenses) * 1.2)} para tus fondos de reserva.`
    },
    {
      q: "¿Cuáles son mis mayores fugas de capital ocultas?",
      a: "Nuestros algoritmos predictivos detectan que las desviaciones de flujo se concentran en consumos de baja denominación durante los días jueves y viernes. Ajustar los consumos variables no planificados en un 10% incrementará tu score de salud financiera de inmediato."
    },
    {
      q: "¿Cómo puedo financiar mi próxima meta sin endeudarme?",
      a: "Basado en tu flujo de caja promedio, te recomendamos congelar temporalmente los egresos de la categoría 'Otros' durante los próximos 20 días y programar depósitos fijos automatizados los lunes por la mañana en tu módulo de Objetivos de Ahorro Kyzen."
    }
  ];

  const handleAskAi = (prompt) => {
    setSelectedQuestion(prompt);
  };

  return (
    <div className="space-y-8 animate-fadeIn w-full pb-12 select-none font-sans text-slate-800">
      
      {/* Encabezado Principal */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
            <Sparkles size={14} className="animate-pulse" /> Módulo de Inteligencia Artificial
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Centro de Consultoría Financiera</h2>
        </div>
        {onBackToDashboard && (
          <button onClick={onBackToDashboard} className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-sm bg-white">
            <ArrowLeft size={14} /> Volver al panel
          </button>
        )}
      </div>

      {/* Grid de Métricas Avanzadas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Panel Izquierdo: Score de Salud */}
        <div className="bg-white border border-slate-200/80 shadow-xl rounded-[32px] p-6 flex flex-col justify-between space-y-6">
          <div className="w-full">
            <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-wider mb-1">Diagnóstico Predictivo</h4>
            <h3 className="font-black text-slate-900 text-lg tracking-tight">Score de Salud Kyzen</h3>
          </div>

          <div className="flex flex-col items-center justify-center py-4 relative">
            <div className="text-5xl font-black text-slate-900 tracking-tighter flex items-baseline">
              {roundedScore}<span className="text-xl font-bold text-slate-300">/100</span>
            </div>
            <p className={`text-xs font-black uppercase tracking-wide mt-2 ${scoreStyle.color}`}>
              {scoreStyle.label}
            </p>
            
            <div className="w-full bg-slate-100 h-2.5 rounded-full mt-6 overflow-hidden shadow-inner">
              <div className={`h-full ${scoreStyle.bar} rounded-full transition-all duration-1000`} style={{ width: `${roundedScore}%` }}></div>
            </div>
          </div>

          <p className="text-[11px] font-medium text-slate-400 leading-relaxed text-center bg-slate-50/80 border border-slate-100 p-3 rounded-2xl">
            Este índice se recalcula analizando la tasa de ahorro frente a tus costos fijos del campus de la Universidad de Lima.
          </p>
        </div>

        {/* Panel Derecho: Proyecciones Futuras */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 shadow-xl rounded-[32px] p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-wider mb-1">Métricas de Control de Riesgo</h4>
              <h3 className="font-black text-slate-900 text-lg tracking-tight">Tendencias y Alertas del Próximo Mes</h3>
            </div>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><LineChart size={18} /></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-200/70 bg-gradient-to-br from-white to-slate-50/50 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wide">
                <CheckCircle2 size={14} /> Estabilidad Semanal
              </div>
              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                Tus fondos de reserva proyectan una resistencia óptima de hasta 14 días en caso de imprevistos comerciales o académicos extraordinarios.
              </p>
            </div>

            <div className="border border-slate-200/70 bg-gradient-to-br from-white to-slate-50/50 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wide">
                <ShieldAlert size={14} /> Umbral Crítico de Gasto
              </div>
              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                Evita superar los {formatAmount(totalExpenses * 0.4)} acumulados en categorías recreativas durante las próximas 72 horas para prevenir saldos rojos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Módulo Inferior: Consultorio Interactivo */}
      <div className="bg-white border border-slate-200/80 shadow-2xl rounded-[32px] p-6 md:p-8 space-y-6">
        <div>
          <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-wider mb-1">Asesoría en Tiempo Real</h4>
          <h3 className="font-black text-slate-900 text-xl tracking-tight">Realiza consultas predictivas</h3>
          <p className="text-xs font-medium text-slate-400 mt-0.5">Selecciona una de las consultas predefinidas para que el motor inteligente procese tu base de datos mock.</p>
        </div>

        {/* Botonera de Prompts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiPrompts.map((item, index) => (
            <button
              key={index}
              onClick={() => handleAskAi(item)}
              className="p-4 text-left border border-slate-200/80 hover:border-indigo-500 bg-slate-50/50 hover:bg-indigo-50/10 rounded-2xl transition-all duration-200 space-y-2 group shadow-sm flex flex-col justify-between"
            >
              <div className="text-xs font-black text-slate-800 leading-snug group-hover:text-indigo-900">
                "{item.q}"
              </div>
              <div className="text-[10px] font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1 mt-2">
                <HelpCircle size={12} /> Consultar IA
              </div>
            </button>
          ))}
        </div>

        {/* Caja de Respuesta Segura */}
        <div className="border border-slate-100 bg-slate-50/40 rounded-[24px] p-6 min-h-[140px] flex flex-col justify-center relative overflow-hidden">
          {!selectedQuestion ? (
            <div className="flex flex-col items-center justify-center text-center text-slate-400 text-xs font-semibold space-y-2">
              <MessageSquare size={24} className="text-slate-300" />
              <span>Haz clic en cualquiera de las consultas superiores para ver el análisis de inducción financiera.</span>
            </div>
          ) : (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-slate-200/50 pb-2">
                <div className="p-1.5 bg-indigo-600 text-white rounded-lg"><Brain size={14} /></div>
                <h5 className="font-black text-slate-900 text-xs uppercase tracking-wider">Respuesta de Kyzen AI</h5>
              </div>
              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                {selectedQuestion.a}
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}