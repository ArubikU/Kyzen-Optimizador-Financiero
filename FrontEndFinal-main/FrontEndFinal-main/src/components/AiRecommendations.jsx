import React, { useState, useEffect } from 'react';
import { Brain, Target, AlertTriangle, TrendingDown, Sparkles, Loader2 } from 'lucide-react';

export default function AiRecommendations({ userId = 1, currentCurrency = 'PEN' }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Petición real al servidor para escuchar los movimientos actuales de Kyzen
  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/dashboard/movements?userId=${userId}`);
        const data = await res.json();
        if (res.ok && data.movements) {
          setTransactions(data.movements);
        }
      } catch (error) {
        console.error("Error cargando transacciones para la IA:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovements();
    // Re-ejecutar cada vez que el usuario agregue un gasto o cambie de vista
    const interval = setInterval(fetchMovements, 3000); 
    return () => clearInterval(interval);
  }, [userId]);

  // 💵 Formateador de moneda dinámico según la configuración del Perfil
  const formatAmount = (amount) => {
    const symbol = currentCurrency === 'USD' ? '$' : 'S/';
    return `${symbol} ${Number(amount).toFixed(2)}`;
  };

  const getAiRecommendation = () => {
    const expenses = transactions.filter(t => t.type?.toLowerCase() === 'gasto' || t.tipo?.toLowerCase() === 'gasto');
    const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount || t.monto || 0), 0);

    const defaultRecommendation = {
      title: "Recomendaciones IA",
      text: "Buen progreso, controlando tus egresos mantendrás tu balance en verde este ciclo.",
      icon: Brain,
      color: "text-blue-500",
      bg: "bg-blue-50/50",
      border: "border-blue-100"
    };

    if (expenses.length === 0) return defaultRecommendation;

    // Agrupación matemática por categorías de la maqueta
    const categoryTotals = expenses.reduce((acc, t) => {
      const cat = t.category || t.categoria || 'Otros';
      acc[cat] = (acc[cat] || 0) + Number(t.amount || t.monto || 0);
      return acc;
    }, {});

    // Encontrar la categoría con mayor impacto financiero
    let topCategory = 'Otros';
    let maxAmount = 0;
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      if (amt > maxAmount) {
        maxAmount = amt;
        topCategory = cat;
      }
    });

    const formattedAmount = formatAmount(maxAmount);

    // Banco de microconsejos contextuales realistas
    const pool = {
      Viaje: [
        {
          title: "Análisis de Gastos de Viaje",
          text: `Tus consumos de Viajes acumulan ${formattedAmount}. Planifica tus traslados con anticipación y prioriza paquetes corporativos para reducir costos este fin de semana.`,
          icon: TrendingDown,
          color: "text-indigo-600",
          bg: "bg-indigo-50/40",
          border: "border-indigo-100"
        }
      ],
      Transporte: [
        {
          title: "Optimización de Movilidad Diaria",
          text: `Has destinado ${formattedAmount} en Transporte. Si utilizas el Corredor o Metropolitano, planifica recargas mensuales fijas para evitar desfases de efectivo diario.`,
          icon: TrendingDown,
          color: "text-cyan-600",
          bg: "bg-cyan-50/40",
          border: "border-cyan-100"
        }
      ],
      Servicios: [
        {
          title: "Alerta de Consumo de Servicios",
          text: `Tus recibos de Servicios representan un pico de ${formattedAmount}. Configurar recordatorios digitales automáticos evitará recargos por mora en tu presupuesto.`,
          icon: AlertTriangle,
          color: "text-amber-500",
          bg: "bg-amber-50/40",
          border: "border-amber-100"
        }
      ],
      Hogar: [
        {
          title: "Sugerencia de Compras del Hogar",
          text: `Detectamos egresos de ${formattedAmount} en Hogar. Centralizar tus adquisiciones en un solo día del mes te permitirá aprovechar descuentos por volumen.`,
          icon: Sparkles,
          color: "text-emerald-600",
          bg: "bg-emerald-50/40",
          border: "border-emerald-100"
        }
      ],
      Estudios: [
        {
          title: "Inversión Académica Estratégica",
          text: `Registras ${formattedAmount} invertidos en material educativo. Contrasta estos montos con tus objetivos de ahorro para no comprometer tus flujos fijos.`,
          icon: Target,
          color: "text-purple-600",
          bg: "bg-purple-50/40",
          border: "border-purple-100"
        }
      ],
      Otros: [
        {
          title: "Clasificación de Consumos",
          text: `Tienes consumos registrados en 'Otros'. Desglosarlos en las categorías base ayudará a la IA a darte consejos de ahorro más precisos.`,
          icon: Brain,
          color: "text-blue-500",
          bg: "bg-blue-50/50",
          border: "border-blue-100"
        }
      ]
    };

    const categoryPool = pool[topCategory] || pool['Otros'];
    const deterministicIndex = (expenses.length) % categoryPool.length;
    return categoryPool[deterministicIndex];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <Loader2 className="animate-spin text-slate-400" size={18} />
      </div>
    );
  }

  const recommendation = getAiRecommendation();
  const IconComponent = recommendation.icon;

  return (
    <div className={`flex items-start gap-4 p-5 rounded-2xl border ${recommendation.border} ${recommendation.bg} transition-all duration-300 animate-fadeIn`}>
      <div className={`p-2.5 rounded-xl bg-white shadow-sm shrink-0 ${recommendation.color}`}>
        <IconComponent size={20} />
      </div>
      <div className="space-y-0.5">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
          {recommendation.title}
        </h4>
        <p className="text-xs font-medium text-slate-500 leading-relaxed">
          {recommendation.text}
        </p>
      </div>
    </div>
  );
}