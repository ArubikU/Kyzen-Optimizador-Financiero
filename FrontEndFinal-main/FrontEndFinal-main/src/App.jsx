import React, { useState } from 'react';
import { useFinancial } from './context/AuthContext'; 
import WelcomePage from './pages/WelcomePage';
import DashboardPage from './pages/DashboardPage';
import MovementsPage from './pages/MovementsPage';
import ReportsPage from './pages/ReportsPage';
import GoalsPage from './pages/GoalsPage';
import ProfilePage from './pages/ProfilePage';
import AiHubPage from './pages/AiHubPage'; // 🚀 1. IMPORTAMOS LA NUEVA PÁGINA DEL HUB DE IA
import { Bell, Wallet, ListOrdered, BarChart3, Target, User, LogOut, ArrowLeftRight } from 'lucide-react';
// --- IMPORTAMOS TU LOGO REAL ---
import logoKyzen from './img/logo.jpg';

function MainWebLayout() {
  const { logout, user } = useFinancial();
  const [activeTab, setActiveTab] = useState('home');
  
  // Controla si la vista de MovementsPage inicia directo en el formulario del círculo (true) o en la tabla (false)
  const [forceCreateTx, setForceCreateTx] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'home': 
        // 🚀 2. PASAMOS EL CONTROLADOR PARA QUE EL BOTÓN "VER MÁS" CAMBIE DE PANTALLA
        return <DashboardPage onNavigateToAiHub={() => setActiveTab('ai-hub')} />;
      case 'ai-hub': 
        // 🚀 3. RENDERIZAMOS EL HUB DE CONSULTORÍA PASANDO EL RETORNO AL PANEL PRINCIPAL
        return <AiHubPage onBackToDashboard={() => setActiveTab('home')} />;
      case 'movements': 
        return <MovementsPage isCreating={forceCreateTx} setIsCreating={setForceCreateTx} />;
      case 'reports': 
        return <ReportsPage />;
      case 'goals': 
        return <GoalsPage />;
      case 'profile': 
        return <ProfilePage />;
      default: 
        return <DashboardPage onNavigateToAiHub={() => setActiveTab('ai-hub')} />;
    }
  };

  // 🌟 NOMBRES INTEGRALES RESTAURADOS: Legibles y profesionales
  const navItems = [
    { id: 'home', label: 'Panel Principal', icon: Wallet },
    { id: 'transacciones', label: 'Transacciones', icon: ArrowLeftRight },
    { id: 'movements', label: 'Historial de Movimientos', icon: ListOrdered },
    { id: 'reports', label: 'Reportes Analíticos', icon: BarChart3 },
    { id: 'goals', label: 'Objetivos de Ahorro', icon: Target },
    { id: 'profile', label: 'Mi Perfil', icon: User },
  ];

  // Manejo de clicks en el menú horizontal
  const handleNavClick = (itemId) => {
    if (itemId === 'transacciones') {
      setForceCreateTx(true);   // Abre directo el formulario del círculo verde y microbloques
      setActiveTab('movements'); // Comparte la misma pantalla base de movimientos
    } else {
      if (itemId === 'movements') {
        setForceCreateTx(false); // Si da clic a Historial, fuerza a que renderice la tabla cronológica
      }
      setActiveTab(itemId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* 💻 BARRA DE NAVEGACIÓN SUPERIOR GLOBAL LÍQUIDA (Ocupa todo el ancho sin scrolls artificiales) */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 h-20 z-50 shadow-sm backdrop-blur-md bg-white/95 w-full">
        <div className="w-full h-full px-8 flex justify-between items-center gap-4">
          
          {/* Bloque Izquierdo: Isotipo de Kyzen */}
          <div className="flex items-center shrink-0">
            <div 
              className="w-11 h-11 rounded-xl overflow-hidden shadow-md border border-slate-100 cursor-pointer select-none transition-transform active:scale-95" 
              onClick={() => { setForceCreateTx(false); setActiveTab('home'); }}
            >
              <img src={logoKyzen} alt="Kyzen Logo" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* 🌟 BARRA CENTRAL CALIBRADA: Texto intermedio premium (text-[11px]) y espaciado orgánico */}
          <nav className="hidden lg:flex items-center gap-2 mx-4 flex-1 justify-center overflow-hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              
              const isActive = (activeTab === item.id && !forceCreateTx) || 
                               (item.id === 'transacciones' && activeTab === 'movements' && forceCreateTx);

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={15} className="shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* 🌟 BLOQUE DERECHO PROTEGIDO: Con un min-width seguro para asegurar que tu nombre nunca colisione ni se achique */}
          <div className="flex items-center gap-4 shrink-0 justify-end min-w-[280px]">
            {/* Campanita Notificaciones */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors shrink-0">
              <Bell size={21} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Texto de Identidad Fijo, Nítido y Expandido */}
            <div className="text-right select-none border-l border-gray-100 pl-4 whitespace-nowrap">
              <p className="text-sm font-black text-gray-950 tracking-tight leading-none pb-0.5">
                {user?.name || 'Rodrigo Raúl Quicaño Alcantara'}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Estudiante Ulima
              </p>
            </div>

            {/* Botón Salir */}
            <button 
              onClick={logout}
              title="Cerrar Sesión" 
              className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shrink-0"
            >
              <LogOut size={18} />
            </button>
          </div>

        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-8 pt-32 pb-16">
        <div className="bg-white border border-slate-200/80 shadow-xl shadow-slate-100/40 rounded-[32px] p-8 md:p-10 min-h-[calc(100vh-12rem)]">
          {renderContent()}
        </div>
      </main>

    </div>
  );
}

export default function App() {
  const { token } = useFinancial();

  if (!token) {
    return <WelcomePage />;
  }

  return <MainWebLayout />;
}