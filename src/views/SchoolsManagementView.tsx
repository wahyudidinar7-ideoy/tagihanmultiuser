import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/helpers';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Users,
  Wallet,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { SchoolModal } from '../components/SchoolModal';
import { School } from '../types';

export const SchoolsManagementView: React.FC = () => {
  const {
    schools,
    currentSchoolId,
    setCurrentSchoolId,
    allStudents,
    allInvoices,
  } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Kelola Multi Sekolah & Madrasah
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Pengguna dapat mengelola banyak lembaga secara terpisah tanpa data tercampur
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>+ Tambah Sekolah Baru</span>
        </button>
      </div>

      {/* Grid of Schools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {schools.map((school) => {
          const isCurrent = school.id === currentSchoolId;
          const schoolStudents = allStudents.filter((s) => s.schoolId === school.id);
          const schoolInvoices = allInvoices.filter((i) => i.schoolId === school.id);
          const totalBilled = schoolInvoices.reduce((sum, i) => sum + i.amount, 0);
          const totalPaid = schoolInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
          const totalUnpaid = Math.max(0, totalBilled - totalPaid);

          return (
            <div
              key={school.id}
              className={`bg-white rounded-2xl border transition p-5 shadow-xs flex flex-col justify-between ${
                isCurrent
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div>
                {/* School Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-xs"
                      style={{ backgroundColor: school.logoBgColor || '#059669' }}
                    >
                      {school.initial}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {school.level}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1 line-clamp-1">
                        {school.name}
                      </h3>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                      <CheckCircle className="w-3 h-3 mr-0.5" /> Aktif
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-3 line-clamp-2">{school.address}</p>

                {/* Personnel Info */}
                <div className="mt-3 p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kepala Sekolah:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                      {school.headmaster}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bendahara:</span>
                    <span className="font-semibold text-emerald-800 truncate max-w-[150px]">
                      {school.treasurer}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">No. WA:</span>
                    <span className="text-slate-700">{school.treasurerPhone}</span>
                  </div>
                </div>

                {/* Quick Numbers */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-center text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <div className="text-[10px] text-slate-500">Total Siswa</div>
                    <div className="font-bold text-slate-900 font-mono text-sm">
                      {schoolStudents.length}
                    </div>
                  </div>
                  <div className="p-2 bg-red-50 rounded-lg">
                    <div className="text-[10px] text-red-600">Tunggakan</div>
                    <div className="font-bold text-red-700 font-mono text-xs">
                      {formatRupiah(totalUnpaid)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setEditingSchool(school)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit Data
                </button>

                {isCurrent ? (
                  <span className="text-xs font-bold text-emerald-700">Sedang Digunakan</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentSchoolId(school.id)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center cursor-pointer"
                  >
                    <span>Ganti ke Sekolah Ini</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add School Modal */}
      {isAddOpen && (
        <SchoolModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          mode="add"
        />
      )}

      {/* Edit School Modal */}
      {editingSchool && (
        <SchoolModal
          isOpen={!!editingSchool}
          onClose={() => setEditingSchool(null)}
          mode="edit"
          schoolToEdit={editingSchool}
        />
      )}
    </div>
  );
};
