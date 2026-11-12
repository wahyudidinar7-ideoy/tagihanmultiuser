import React from 'react';
import { LayoutDashboard, Users, CreditCard, Send, FileSpreadsheet } from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const items = [
    { id: 'dashboard' as ActiveTab, label: 'Beranda', icon: LayoutDashboard },
    { id: 'students' as ActiveTab, label: 'Siswa', icon: Users },
    { id: 'payments' as ActiveTab, label: 'Bayar', icon: CreditCard },
    { id: 'notifications' as ActiveTab, label: 'Kirim WA', icon: Send, special: true },
    { id: 'reports' as ActiveTab, label: 'Laporan', icon: FileSpreadsheet },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 py-1 shadow-lg no-print">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] min-w-[56px] py-1 px-2 rounded-xl transition cursor-pointer ${
                isActive
                  ? 'text-emerald-600 font-bold'
                  : item.special
                  ? 'text-emerald-700 font-medium'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`p-1 rounded-lg ${
                  isActive && item.special
                    ? 'bg-emerald-600 text-white'
                    : isActive
                    ? 'bg-emerald-50 text-emerald-600'
                    : item.special
                    ? 'bg-emerald-50 text-emerald-700'
                    : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
