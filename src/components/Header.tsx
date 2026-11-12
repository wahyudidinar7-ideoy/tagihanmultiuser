import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  School as SchoolIcon,
  ChevronDown,
  Plus,
  Lock,
  Unlock,
  Building2,
  RefreshCw,
  Download,
  Upload,
} from 'lucide-react';
import { SchoolModal } from './SchoolModal';
import { TreasurerAuthModal } from './TreasurerAuthModal';

export const Header: React.FC = () => {
  const {
    currentSchool,
    schools,
    setCurrentSchoolId,
    isTreasurerLoggedIn,
    logoutTreasurer,
    resetData,
    exportBackupJson,
    importBackupJson,
  } = useApp();

  const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState(false);
  const [isAddSchoolOpen, setIsAddSchoolOpen] = useState(false);
  const [isEditSchoolOpen, setIsEditSchoolOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportBackup = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_keuangan_sekolah_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Data berhasil diekspor sebagai JSON');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importBackupJson(content);
        if (ok) {
          showToast('Data berhasil dipulihkan dari cadangan!');
        } else {
          alert('Format file JSON cadangan tidak valid!');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Left: School Selector & Name */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* School Logo Avatar */}
              <div
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-sm"
                style={{ backgroundColor: currentSchool.logoBgColor || '#059669' }}
              >
                {currentSchool.initial || 'SK'}
              </div>

              {/* School Details & Dropdown Trigger */}
              <div className="relative">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {currentSchool.level}
                  </span>
                  <span className="text-xs text-slate-500 hidden md:inline">
                    Aplikasi Keuangan Sekolah
                  </span>
                </div>
                
                <button
                  type="button"
                  onClick={() => setIsSchoolDropdownOpen(!isSchoolDropdownOpen)}
                  className="flex items-center space-x-1.5 text-left group pt-0.5"
                  title="Klik untuk ganti sekolah aktif"
                >
                  <h1 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                    {currentSchool.name}
                  </h1>
                  <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-emerald-700 transition shrink-0" />
                </button>

                {/* School Switcher Dropdown Menu */}
                {isSchoolDropdownOpen && (
                  <div
                    className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setIsSchoolDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase">
                        Pilih Sekolah Aktif ({schools.length})
                      </span>
                      <button
                        onClick={() => {
                          setIsSchoolDropdownOpen(false);
                          setIsAddSchoolOpen(true);
                        }}
                        className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold flex items-center"
                      >
                        <Plus className="w-3.5 h-3.5 mr-0.5" /> Tambah
                      </button>
                    </div>

                    <div className="max-h-64 overflow-y-auto py-1">
                      {schools.map((school) => {
                        const isCurrent = school.id === currentSchool.id;
                        return (
                          <button
                            key={school.id}
                            onClick={() => {
                              setCurrentSchoolId(school.id);
                              setIsSchoolDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 flex items-center justify-between transition hover:bg-slate-50 ${
                              isCurrent ? 'bg-emerald-50/70 border-l-4 border-emerald-600' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <div
                                className="w-7 h-7 rounded-lg text-white flex items-center justify-center text-xs font-bold shrink-0"
                                style={{ backgroundColor: school.logoBgColor || '#059669' }}
                              >
                                {school.initial}
                              </div>
                              <div className="truncate">
                                <div className="text-xs font-semibold text-slate-800 truncate">
                                  {school.name}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">
                                  Bendahara: {school.treasurer}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono shrink-0 ml-1">
                              {school.level}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setIsSchoolDropdownOpen(false);
                          setIsEditSchoolOpen(true);
                        }}
                        className="text-xs text-slate-700 hover:text-emerald-700 font-medium"
                      >
                        ✏️ Edit Data Sekolah Ini
                      </button>
                      <button
                        onClick={() => {
                          setIsSchoolDropdownOpen(false);
                          setIsAddSchoolOpen(true);
                        }}
                        className="text-xs bg-emerald-600 text-white px-2.5 py-1 rounded-md font-medium hover:bg-emerald-700"
                      >
                        + Sekolah Baru
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Actions, Treasurer Mode & Settings */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Change School Quick Button */}
              <button
                type="button"
                onClick={() => setIsSchoolDropdownOpen(!isSchoolDropdownOpen)}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Ganti Sekolah</span>
              </button>

              {/* Treasurer Auth Status Badge */}
              {isTreasurerLoggedIn ? (
                <div className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 px-2.5 py-1 rounded-lg text-xs font-medium">
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden md:inline">Mode Bendahara</span>
                  <button
                    onClick={logoutTreasurer}
                    className="ml-1 text-slate-400 hover:text-red-600 text-[11px] underline"
                    title="Kunci Akses"
                  >
                    Keluar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center space-x-1.5 bg-amber-50 border border-amber-300 hover:bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer"
                  title="Klik untuk membuka akses penuh bendahara (password: bendahara123)"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Mode Baca (Tamu)</span>
                  <span className="bg-amber-200 text-amber-900 text-[10px] px-1 rounded font-bold">
                    Buka
                  </span>
                </button>
              )}

              {/* Data Backup & Reset Menu */}
              <div className="relative group">
                <button
                  type="button"
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                  title="Pengaturan Data & Cadangan"
                >
                  <Download className="w-4 h-4" />
                </button>
                <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 hidden group-hover:block z-50 text-xs">
                  <div className="px-3 py-1 text-slate-400 font-semibold uppercase text-[10px]">
                    Cadangan Data
                  </div>
                  <button
                    onClick={handleExportBackup}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center"
                  >
                    <Download className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Ekspor JSON Backup
                  </button>
                  <label className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center cursor-pointer">
                    <Upload className="w-3.5 h-3.5 mr-2 text-blue-600" /> Pulihkan dari JSON
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImportBackup}
                    />
                  </label>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          'Kembalikan ke data awal bawaan (3 sekolah, 10 siswa masing-masing)? Semua perubahan Anda akan di-reset.'
                        )
                      ) {
                        resetData();
                        showToast('Data telah direset ke setelan awal');
                      }
                    }}
                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-2" /> Reset Data Awal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toast alert */}
        {toastMessage && (
          <div className="fixed bottom-18 right-4 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl z-50 flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2">
            <span>✅ {toastMessage}</span>
          </div>
        )}
      </header>

      {/* Add School Modal */}
      {isAddSchoolOpen && (
        <SchoolModal
          isOpen={isAddSchoolOpen}
          onClose={() => setIsAddSchoolOpen(false)}
          mode="add"
        />
      )}

      {/* Edit School Modal */}
      {isEditSchoolOpen && (
        <SchoolModal
          isOpen={isEditSchoolOpen}
          onClose={() => setIsEditSchoolOpen(false)}
          mode="edit"
          schoolToEdit={currentSchool}
        />
      )}

      {/* Treasurer Auth Modal */}
      {isAuthModalOpen && (
        <TreasurerAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </>
  );
};
