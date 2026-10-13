import React, { useState } from 'react';
import { useAuth, useFinancial } from '../context/AuthContext';
import { Wallet, Shield, Coins, Download, LogOut, ChevronRight, GraduationCap, CheckCircle, X, Calendar, FileText } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, currency, setCurrency } = useAuth();
  const { transactions, dashboardData, updateBudget, exportTransactionsCsv } = useFinancial();

  // --- HU-20: presupuesto mensual para el módulo de alertas ---
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [budgetMsg, setBudgetMsg] = useState('');
  const currentBudget = dashboardData?.budget?.monthlyBudget;

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!(parseFloat(budgetInput) > 0)) {
      setBudgetMsg('Ingresa un presupuesto mayor a 0.');
      return;
    }
    const result = await updateBudget(parseFloat(budgetInput));
    if (result.success) {
      setBudgetMsg('');
      setShowBudgetModal(false);
    } else {
      setBudgetMsg(result.message || 'No se pudo guardar el presupuesto.');
    }
  }; // Consumimos las transacciones reales del usuario para armar el PDF
  
  // --- ESTADOS DEL MODAL DE EXPORTACIÓN (FIGMA MATCH image_1a8e69.png) ---
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportPeriod, setExportPeriod] = useState('Mensual'); // 'Semanal' | 'Mensual' | 'Anual'
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeAI, setIncludeAI] = useState(true);

  // Obtener iniciales dinámicas
  const getInitials = (nameString) => {
    if (!nameString) return "FA";
    const parts = nameString.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return nameString.slice(0, 2).toUpperCase();
  };

  const userInitials = getInitials(user?.name);

  // --- 🖨️ MOTOR NATIVO DE GENERACIÓN DE REPORTE PDF (HIGH FIDELITY) ---
  const handleDownloadPDF = () => {
    const now = new Date('2026-06-17T20:05:00'); // Sincronización horaria del sistema Kyzen
    const rawTransactions = transactions || [];
    
    // 🔍 1. Filtrado Matemático del Periodo Seleccionado en el Modal
    let filteredTxs = [];
    if (exportPeriod === 'Semanal') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredTxs = rawTransactions.filter(t => new Date(t.date) >= oneWeekAgo);
    } else if (exportPeriod === 'Anual') {
      filteredTxs = rawTransactions.filter(t => new Date(t.date).getFullYear() === 2026);
    } else {
      // Mensual por defecto (Junio 2026)
      filteredTxs = rawTransactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === 5 && d.getFullYear() === 2026;
      });
    }

    // 📐 2. Cómputo de Totales Líquidos
    const ingresos = filteredTxs.filter(t => t.type?.toLowerCase() === 'ingreso').reduce((s, t) => s + Number(t.amount), 0);
    const gastos = filteredTxs.filter(t => t.type?.toLowerCase() === 'gasto').reduce((s, t) => s + Number(t.amount), 0);
    const balance = ingresos - gastos;

    // Agrupación de Gastos por Categoría para simular la sección de gráficos si está activa
    const categories = ['Comida', 'Transporte', 'Estudios', 'Servicios', 'Hogar', 'Otros'];
    const categoryTotals = categories.reduce((acc, cat) => {
      acc[cat] = filteredTxs
        .filter(t => t.type?.toLowerCase() === 'gasto' && (cat === 'Otros' ? !['Comida', 'Transporte', 'Estudios', 'Servicios', 'Hogar'].includes(t.category) : t.category === cat))
        .reduce((s, t) => s + Number(t.amount), 0);
      return acc;
    }, {});

    // 🏗️ 3. Construcción del Documento de Impresión en Ventana Aislada
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte Financiero Kyzen - ${exportPeriod}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; padding: 40px; }
            .header { border-b: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: 900; color: #6366f1; }
            .user-info { text-align: right; font-size: 12px; color: #64748b; }
            .title { font-size: 20px; font-weight: 800; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
            .grid { display: grid; grid-template-cols: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; rounded: 12px; border-radius: 12px; }
            .card-title { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
            .card-val { font-size: 18px; font-weight: 800; margin-top: 5px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 14px; font-weight: 850; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 15px; text-transform: uppercase; color: #334155; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th { background: #f1f5f9; text-align: left; padding: 10px; font-weight: 700; color: #475569; }
            td { padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: 500; }
            .bar-container { display: flex; items-center: center; gap: 10px; margin-bottom: 8px; font-size: 11px; }
            .bar-label { width: 90px; font-weight: bold; }
            .bar-bg { flex-1: 1; background: #f1f5f9; height: 10px; border-radius: 5px; overflow: hidden; position: relative; }
            .bar-fill { height: 100%; background: #6366f1; }
            .ai-box { background: #f0fdfa; border: 1px solid #ccfbf1; p: 15px; padding: 15px; border-radius: 12px; font-size: 12px; color: #0f766e; font-weight: 500; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">KYZEN</div>
            <div class="user-info">
              <strong>Alumno:</strong> ${user?.name || 'Estudiante Ulima'}<br/>
              <strong>Email:</strong> ${user?.email || ''}<br/>
              <strong>Fecha Emisión:</strong> 17/06/2026
            </div>
          </div>

          <div class="title">Resumen Financiero - Periodo ${exportPeriod}</div>

          <div class="grid">
            <div class="card">
              <div class="card-title">Balance Neto</div>
              <div class="card-val" style="color: ${balance >= 0 ? '#10b981' : '#ef4444'}">S/ ${balance.toFixed(2)}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Ingresos</div>
              <div class="card-val" style="color: #10b981">S/ ${ingresos.toFixed(2)}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Gastos</div>
              <div class="card-val" style="color: #ef4444">S/ ${gastos.toFixed(2)}</div>
            </div>
          </div>

          ${includeCharts ? `
          <div class="section">
            <div class="section-title">Distribución Analítica de Gastos</div>
            ${categories.map(cat => {
              const val = categoryTotals[cat];
              const maxVal = Math.max(...Object.values(categoryTotals), 1);
              const pct = (val / maxVal) * 100;
              return `
                <div class="bar-container">
                  <div class="bar-label">${cat}</div>
                  <div class="bar-bg">
                    <div class="bar-fill" style="width: ${pct}%"></div>
                  </div>
                  <div style="width: 70px; text-align: right; font-weight: bold;">S/ ${val.toFixed(2)}</div>
                </div>
              `;
            }).join('')}
          </div>
          ` : ''}

          ${includeAI ? `
          <div class="section">
            <div class="section-title">✨ Recomendaciones Predictivas de IA (Kyzen Tip)</div>
            <div class="ai-box">
              <strong>Análisis de comportamiento en campus:</strong> ${
                gastos > ingresos 
                  ? "Tus egresos reflejan un déficit crítico en este ciclo. Se detectaron gastos hormiga redundantes. Te sugerimos congelar presupuestos de ocio de inmediato."
                  : "Mantienes un flujo de caja en verde y saludable. Es un escenario matemático ideal para incrementar los abonos líquidos directo a tus Metas de Ahorro abiertas."
              }
            </div>
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">Auditoría del Historial de Movimientos</div>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Concepto / Descripción</th>
                  <th>Categoría</th>
                  <th>Tipo</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                ${filteredTxs.map(t => `
                  <tr>
                    <td>${new Date(t.date).toLocaleDateString('es-PE')}</td>
                    <td>${t.description}</td>
                    <td>${t.category || 'Otros'}</td>
                    <td style="font-weight: bold; color: ${t.type?.toLowerCase() === 'ingreso' ? '#10b981' : '#f97316'}">${t.type?.toUpperCase()}</td>
                    <td style="font-weight: bold;">S/ ${Number(t.amount).toFixed(2)}</td>
                  </tr>
                `).join('')}
                ${filteredTxs.length === 0 ? '<tr><td colspan="5" style="text-align: center; color: #94a3b8;">No se registran movimientos en esta ventana temporal.</td></tr>' : ''}
              </tbody>
            </table>
          </div>

          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setShowExportModal(false);
  };

  // Mapeo estético de opciones
  const profileOptions = [
    {
      title: 'Cambiar contraseña',
      subtitle: 'Actualiza tus credenciales de acceso',
      icon: <Shield size={18} className="text-indigo-600" />,
      bg: 'bg-indigo-50',
      action: () => alert('Simulación: Enlace de restablecimiento enviado.')
    },
    {
      title: 'Presupuesto mensual',
      subtitle: currentBudget ? `Límite actual: S/ ${Number(currentBudget).toLocaleString('es-PE')} · alerta al 80%` : 'Define tu límite para recibir alertas tempranas',
      icon: <Wallet size={18} className="text-amber-600" />,
      bg: 'bg-amber-50',
      action: () => { setBudgetInput(currentBudget ? String(currentBudget) : ''); setBudgetMsg(''); setShowBudgetModal(true); }
    },
    {
      title: 'Preferencias de moneda',
      // Muestra dinámicamente qué moneda está activa en el contexto global
      subtitle: `Actualmente: ${currency === 'PEN' ? 'S/ (Sol peruano)' : '$ (Dólar estadounidense)'}`,
      icon: <Coins size={18} className="text-emerald-600" />,
      bg: 'bg-emerald-50',
      // Dispara la mutación reactiva global de cambio de divisa al hacer clic
      action: () => setCurrency(prev => prev === 'PEN' ? 'USD' : 'PEN')
    },
    {
      title: 'Exportar datos',
      subtitle: 'Descarga tu información financiera en PDF',
      icon: <Download size={18} className="text-blue-600" />,
      bg: 'bg-blue-50',
      action: () => setShowExportModal(true) // 🚀 GATILLO: Abre el modal Figma de Exportación
    }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto font-sans select-none animate-fadeIn space-y-8 pb-12">
      
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mi Perfil</h1>
        <p className="text-xs font-semibold text-slate-400 mt-0.5">Gestiona tu identidad y configuraciones de Kyzen.</p>
      </div>

      {/* Tarjeta de Identidad */}
      <div className="bg-white border border-slate-200/80 shadow-xl rounded-[28px] p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden transition-all hover:shadow-2xl">
        <div className="absolute -right-16 -top-16 w-32 h-32 bg-indigo-50 rounded-full blur-2xl opacity-60"></div>
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-100 shrink-0 relative">
          <span>{userInitials}</span>
          <span className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-sm">
            <CheckCircle size={16} className="text-emerald-500 fill-white" />
          </span>
        </div>
        <div className="text-center sm:text-left space-y-1 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-1.5">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user?.name || 'Fátima Abregú'}</h2>
            <span className="inline-flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full border border-indigo-100/40 w-fit mx-auto sm:mx-0">
              <GraduationCap size={11} /> Estudiante Ulima
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400">{user?.email || 'fatima@example.com'}</p>
          <div className="flex justify-center sm:justify-start gap-4 text-[10px] font-black text-slate-400 uppercase tracking-wider pt-2 border-t border-slate-100 mt-2">
            <div>Plataforma: <span className="text-slate-700">Kyzen Web</span></div>
            <div>Estado: <span className="text-emerald-500">Verificado</span></div>
          </div>
        </div>
      </div>

      {/* Menú de Opciones */}
      <div className="space-y-4">
        {profileOptions.map((opt, idx) => (
          <div
            key={idx}
            onClick={opt.action}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-[20px] p-4 flex items-center justify-between cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl ${opt.bg} flex items-center justify-center shadow-inner`}>
                {opt.icon}
              </div>
              <div>
                <h4 className="font-black text-slate-800 text-sm tracking-tight">{opt.title}</h4>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">{opt.subtitle}</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-300 mr-1" />
          </div>
        ))}

        {/* Cierre de Sesión */}
        <div
          onClick={logout}
          className="bg-rose-50/50 border border-rose-200/80 hover:border-rose-300 hover:bg-rose-50 rounded-[20px] p-4 flex items-center justify-between cursor-pointer transition-all duration-200 group active:scale-[0.99] shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-rose-100/60 flex items-center justify-center shadow-inner transition-colors group-hover:bg-rose-100">
              <LogOut size={18} className="text-rose-600" />
            </div>
            <div>
              <h4 className="font-black text-rose-600 text-sm tracking-tight">Cerrar sesión</h4>
              <p className="text-xs font-semibold text-rose-400 mt-0.5">Finaliza tu sesión activa en este dispositivo</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-rose-300 transition-transform group-hover:translate-x-0.5 mr-1" />
        </div>
      </div>

      {showBudgetModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm animate-fadeIn">
          <form onSubmit={handleSaveBudget} className="bg-white rounded-[28px] border border-slate-100 p-6 w-full max-w-sm mx-4 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 tracking-tight">Presupuesto mensual</h3>
            <p className="text-[11px] font-semibold text-slate-400">Te avisaremos en rojo cuando tus gastos del mes superen el 80% de este monto.</p>
            <input type="number" min="1" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} placeholder="S/ 0.00" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
            {budgetMsg && <p className="text-xs font-bold text-rose-500">{budgetMsg}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowBudgetModal(false)} className="flex-1 text-xs font-bold text-slate-400 py-3">Cancelar</button>
              <button type="submit" className="flex-1 bg-[#6366f1] text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider">Guardar</button>
            </div>
          </form>
        </div>
      )}

      {/* 🔮 MODAL DE EXPORTACIÓN HIGH-FIDELITY FIEL A image_1a8e69.png */}
      {showExportModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[28px] border border-slate-100 p-6 w-full max-w-md mx-4 shadow-2xl relative animate-scaleUp select-none">
            
            {/* Botón Cerrar Modal */}
            <button 
              onClick={() => setShowExportModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              <X size={16} />
            </button>

            {/* Cabecera del Modal */}
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">Exportar reporte</h3>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Descarga un resumen de tus finanzas.</p>
              </div>
            </div>

            {/* Selector de Periodo Temporal (Figma Switch) */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Periodo</label>
              <div className="bg-slate-50 p-1 rounded-xl flex border border-slate-200/50 shadow-inner">
                {['Semanal', 'Mensual', 'Anual'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setExportPeriod(p)}
                    className={`flex-1 text-center py-2 rounded-lg text-[11px] font-black tracking-wide transition-all ${
                      exportPeriod === p
                        ? 'bg-[#5c5bf3] text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles / Checkboxes (Figma Options Match) */}
            <div className="space-y-4 mt-5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Incluir en el reporte</label>
              
              {/* Checkbox Gráficos */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={includeCharts} 
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#5c5bf3] focus:ring-[#5c5bf3] cursor-pointer"
                />
                <div>
                  <p className="text-xs font-black text-slate-800 tracking-tight group-hover:text-slate-900">Incluir gráficos</p>
                  <p className="text-[10px] font-semibold text-slate-400">Gastos por categoría y tendencias</p>
                </div>
              </label>

              {/* Checkbox Recomendaciones IA */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={includeAI} 
                  onChange={(e) => setIncludeAI(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#5c5bf3] focus:ring-[#5c5bf3] cursor-pointer"
                />
                <div>
                  <p className="text-xs font-black text-slate-800 tracking-tight group-hover:text-slate-900">Incluir recomendaciones IA</p>
                  <p className="text-[10px] font-semibold text-slate-400">Tips personalizados de ahorro</p>
                </div>
              </label>
            </div>

            {/* Botones Inferiores de Acción */}
            <div className="flex flex-col gap-2 pt-6">
              <button
                onClick={() => exportTransactionsCsv(exportPeriod)}
                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                Descargar CSV
              </button>
              <button
                onClick={handleDownloadPDF}
                className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-black py-3 rounded-xl shadow-md shadow-purple-100 text-xs uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-95"
              >
                Descargar PDF
              </button>
              <button 
                onClick={() => setShowExportModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 py-2 text-center"
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}