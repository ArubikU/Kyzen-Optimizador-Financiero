import React from 'react';
import { Home, ListOrdered, BarChart3, Target, User } from 'lucide-react';

export default function BottomNavbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'movements', label: 'Movimientos', icon: ListOrdered },
    { id: 'reports', label: 'Reportes', icon: BarChart3 },
    { id: 'goals', label: 'Metas', icon: Target },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    // Cambiamos fixed por sticky/relative controlado para que se acople al pie del monitor
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg px-6 py-3 z-50 w-full">
      {/* max-w-7xl expande de forma segura el orden de tus botones en monitores */}
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-colors ${
                isActive ? 'text-emerald-600 font-bold' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={24} className={isActive ? 'scale-110 transition-transform' : ''} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}