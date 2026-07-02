import React, { useState, useEffect } from 'react';
import { useFinancial } from '../context/AuthContext';
import { 
  ArrowLeft, Save, Plane, Car, GraduationCap, Zap, Home, 
  MoreHorizontal, FileText, Plus, Search 
} from 'lucide-react';

export default function MovementsPage({ isCreating, setIsCreating }) {
  const { transactions, addTransaction, formatAmount, currency } = useFinancial();

  const [type, setType] = useState('GASTO');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Otros'); 
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [file, setFile] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [filterType, setFilterType] = useState('TODOS'); 
  const [searchTerm, setSearchTerm] = useState('');

  const categoriesList = [
    { id: 'Viaje', label: 'Viaje', icon: Plane },
    { id: 'Transporte', label: 'Transporte', icon: Car },
    { id: 'Estudios', label: 'Estudios', icon: GraduationCap },
    { id: 'Servicios', label: 'Servicios', icon: Zap },
    { id: 'Hogar', label: 'Hogar', icon: Home },
    { id: 'Otros', label: 'Otros', icon: MoreHorizontal },
  ];

  useEffect(() => {
    if (type === 'INGRESO') {
      setCategory('Otros');
    }
  }, [type]);

  const activeTransactions = transactions?.length > 0 ? transactions : [
    { id: 1, type: 'Ingreso', amount: 1500, category: 'Sueldo', description: 'Freelance Desarrollador', date: '2026-06-15T14:30:00.000Z' },
    { id: 2, type: 'Gasto', amount: 150, category: 'Viaje', description: 'Pasajes de viaje', date: '2026-06-14T13:15:00.000Z' },
    { id: 3, type: 'Gasto', amount: 120, category: 'Transporte', description: 'Corredor / Metropolitano', date: '2026-06-12T09:00:00.000Z' },
  ];

  const filteredTransactions = activeTransactions.filter(tx => {
    const txTypeNormalized = tx.type?.toLowerCase(); 
    
    const matchesType = filterType === 'TODOS' || 
                        (filterType === 'GASTO' && txTypeNormalized === 'gasto') ||
                        (filterType === 'INGRESO' && txTypeNormalized === 'ingreso');

    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    if (!amount || parseFloat(amount) <= 0) {
      setStatusMsg({ type: 'error', text: 'Por favor, ingresa un monto válido mayor a 0.' });
      return;
    }
    if (!description.trim()) {
      setStatusMsg({ type: 'error', text: 'Ingresa un concepto o descripción.' });
      return;
    }

    setFormLoading(true);
    try {
      await addTransaction({
        type: type === 'GASTO' ? 'Gasto' : 'Ingreso',
        amount: parseFloat(amount),
        category: type === 'GASTO' ? category : 'Otros',
        description,
        date: new Date(date).toISOString()
      });

      setStatusMsg({ type: 'success', text: '¡Transacción guardada con éxito!' });
      setAmount('');
      setDescription('');
      
      setTimeout(() => {
        setIsCreating(false);
        const navButtons = document.querySelectorAll('header nav button');
        navButtons.forEach(btn => btn.textContent.includes('Panel') && btn.click());
      }, 1000);

    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error al guardar el movimiento de forma local.' });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="w-full font-sans select-none animate-fadeIn">
      
      {!isCreating ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Historial de Movimientos</h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Audita el flujo de caja, egresos e ingresos de tus cuentas.</p>
            </div>
            <button onClick={() => setIsCreating(true)} className="bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl flex items-center gap-2 shadow-md shrink-0">
              <Plus size={16} /> Registrar Transacción
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Buscar por concepto o categoría..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none shadow-sm" />
            </div>
            
            <div className="bg-slate-200/60 p-1 rounded-xl flex gap-1 text-[11px] font-bold">
              {[
                { id: 'TODOS', label: 'Todos' },
                { id: 'GASTO', label: 'Gastos' },
                { id: 'INGRESO', label: 'Ingresos' }
              ].map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setFilterType(t.id)} 
                  className={`px-4 py-1.5 rounded-lg transition-all ${filterType === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Concepto</th>
                  <th className="py-4 px-6">Categoría</th>
                  <th className="py-4 px-6">Fecha</th>
                  <th className="py-4 px-6 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredTransactions.map((tx, idx) => {
                  const isIngreso = tx.type?.toLowerCase() === 'ingreso';

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-4 px-6 font-bold text-slate-900">{tx.description}</td>
                      <td className="py-4 px-6 text-slate-400">
                        <span className="bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-full text-[10px] uppercase">{tx.category}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-400">{new Date(tx.date).toLocaleDateString('es-PE')}</td>
                      
                      <td className={`py-4 px-6 text-right font-black ${isIngreso ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {isIngreso ? '+ ' : '- '} {formatAmount(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[#1e1b2e] text-white rounded-3xl p-6 flex justify-between items-center shadow-lg">
            <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-white/10 rounded-xl"><ArrowLeft size={22} /></button>
            <h2 className="text-2xl font-black tracking-tight">Nueva Transacción</h2>
            <button type="button" onClick={handleSubmit} className="p-2 hover:bg-white/10 rounded-xl text-emerald-400"><Save size={22} /></button>
          </div>

          <div className="max-w-3xl mx-auto bg-white border border-slate-100 shadow-xl rounded-3xl p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex justify-center">
                <div className="bg-slate-100 p-1.5 rounded-2xl flex w-full max-w-md shadow-inner">
                  {['GASTO', 'INGRESO'].map(t => (
                    <button key={t} type="button" onClick={() => setType(t)} className={`flex-1 text-center py-2.5 rounded-xl text-xs font-black uppercase ${type === t ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'}`}>{t.toLowerCase()}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="flex justify-center">
                  <div className="w-52 h-52 rounded-full border-4 border-emerald-400 flex flex-col items-center justify-center bg-white shadow-xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Monto</span>
                    <div className="flex items-baseline mt-1 gap-1">
                      <span className="text-lg font-bold text-slate-800">
                        {currency === 'USD' ? '$' : 'S/'}
                      </span>
                      <input required type="number" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-28 text-center text-3xl font-black text-emerald-500 bg-transparent focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div>
                  {type === 'GASTO' ? (
                    <div className="grid grid-cols-3 gap-3">
                      {categoriesList.map((item) => {
                        const Icon = item.icon;
                        const isSelected = category === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setCategory(item.id)}
                            className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border-2 transition-all ${
                              isSelected 
                                ? 'bg-slate-900 border-slate-900 text-white shadow-md scale-[1.03]' 
                                : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <div className={`p-2 rounded-xl mb-1 ${isSelected ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 shadow-sm'}`}>
                              <Icon size={16} />
                            </div>
                            <span className="text-[9px] font-black tracking-tight uppercase">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200/40 rounded-2xl h-36 text-slate-400 text-center">
                      <span className="text-xl font-bold">💰 Entrada de Efectivo</span>
                      <span className="text-[10px] uppercase font-black tracking-wider mt-1 text-slate-400">Categoría asignada automáticamente</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Descripción</label>
                  <input required type="text" placeholder="e.g. Almuerzo con amigos" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Fecha & Hora</label>
                  <input required type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Boleta (opcional)</label>
                  <div className="relative border border-slate-200 border-dashed rounded-xl py-3 px-4 bg-slate-50 text-slate-400 text-sm flex items-center gap-2">
                    <FileText size={16} />
                    <span>{file ? file.name : "Adjuntar Archivo"}</span>
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 pt-4">
                <button type="submit" disabled={formLoading} className="w-full max-w-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md text-sm disabled:opacity-50">
                  {formLoading ? 'Guardando...' : 'Guardar movimiento'}
                </button>
                <button type="button" onClick={() => setIsCreating(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600 py-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}