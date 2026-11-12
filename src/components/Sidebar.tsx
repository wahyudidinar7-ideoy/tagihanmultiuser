import React from 'react';
import {
  LayoutDashboard,
  Users,
  Layers,
  CreditCard,
  Send,
  AlertTriangle,
  FileSpreadsheet,
  History,
  Building,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type ActiveTab =
  | 'dashboard'
  | 'students'
  | 'fees'
  | 'payments'
  | 'notifications'
  | 'overdue'
  | 'reports'
  | 'history'
  | 'schools';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentSchool, students, invoices } = useApp();

  // Calculate badges
  const activeStudentCount = students.filter((s) => s.status === 'Aktif').length;
  const overdueCount = invoices.filter(
    (i) => i.status === 'BELUM LUNAS' || i.status === 'SEBAGIAN'
  ).length;

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard Utama',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'students' as ActiveTab,
      label: 'Data Siswa & Wali',
      icon: Users,
      badge: activeStudentCount > 0 ? activeStudentCount : null,
    },
    {
      id: 'fees' as ActiveTab,
      label: 'Master Tagihan',
      icon: Layers,
      badge: null,
    },
    {
      id: 'notifications' as ActiveTab,
      label: 'Kirim Pemberitahuan',
      icon: Send,
      badge: 'WA',
      badgeColor: 'bg-emerald-500 text-white',
      highlight: true,
    },
    {
      id: 'payments' as ActiveTab,
      label: 'Pembayaran & Kuitansi',
      icon: CreditCard,
      badge: null,
    },
    {
      id: 'overdue' as ActiveTab,
      label: 'Daftar Tunggakan',
      icon: AlertTriangle,
      badge: overdueCount > 0 ? overdueCount : null,
      badgeColor: 'bg-red-500 text-white',
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Laporan & Rekap',
      icon: FileSpreadsheet,
      badge: null,
    },
    {
      id: 'history' as ActiveTab,
      label: 'Riwayat Pesan WA',
      icon: History,
      badge: null,
    },
    {
      id: 'schools' as ActiveTab,
      label: 'Kelola Multi Sekolah',
      icon: Building,
      badge: null,
    },
  ];

  return (
    <aside className="w-full lg:w-72 xl:w-80 shrink-0 bg-white border-r border-slate-200 p-4 flex flex-col justify-between no-print h-[calc(100vh-4.5rem)] sticky top-18 overflow-y-auto">
      <div className="space-y-6">
        {/* Active School Mini Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0"
            style={{ backgroundColor: currentSchool.logoBgColor || '#059669' }}
          >
            {currentSchool.initial}
          </div>
          <div className="min-w-0 grow">
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
              {currentSchool.level}
            </span>
            <div className="text-xs font-bold text-slate-800 truncate mt-0.5">
              {currentSchool.name}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              Bendahara: {currentSchool.treasurer}
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Menu Keuangan
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs shadow-emerald-500/20'
                      : item.highlight
                      ? 'text-emerald-700 hover:bg-emerald-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? 'text-white'
                          : item.highlight
                          ? 'text-emerald-600'
                          : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== null && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isActive
                          ? 'bg-white text-emerald-800'
                          : item.badgeColor || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info in Sidebar */}
      <div className="pt-4 border-t border-slate-100 text-slate-400 text-[11px] space-y-1">
        <p className="font-semibold text-slate-600">Sistem Keuangan Multi Sekolah</p>
        <p>Pemberitahuan Orang Tua Otomatis</p>
        <p className="font-mono text-[10px] text-slate-400">Offline LocalStorage • v2.0</p>
      </div>
    </aside>
  );
};
