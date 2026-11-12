import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDateIndo } from '../utils/helpers';
import {
  AlertTriangle,
  Printer,
  Send,
  Search,
  Filter,
  Phone,
  ArrowRight,
  DollarSign,
} from 'lucide-react';
import { ActiveTab } from '../components/Sidebar';

interface OverdueViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onSelectStudentForPayment?: (studentId: string) => void;
}

export const OverdueView: React.FC<OverdueViewProps> = ({
  setActiveTab,
  onSelectStudentForPayment,
}) => {
  const { currentSchool, students, invoices } = useApp();

  const [selectedGrade, setSelectedGrade] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Collect overdue details for all students
  const overdueRecords = useMemo(() => {
    return students
      .filter((s) => s.status === 'Aktif')
      .map((student) => {
        const studentInvoices = invoices.filter((i) => i.studentId === student.id);
        const unpaidList = studentInvoices.filter(
          (i) => i.status === 'BELUM LUNAS' || i.status === 'SEBAGIAN'
        );
        const totalUnpaid = unpaidList.reduce(
          (sum, i) => sum + (i.amount - i.paidAmount),
          0
        );

        return {
          student,
          unpaidList,
          totalUnpaid,
          count: unpaidList.length,
        };
      })
      .filter((record) => record.totalUnpaid > 0)
      .sort((a, b) => b.totalUnpaid - a.totalUnpaid);
  }, [students, invoices]);

  // Unique grades
  const gradesList = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.grade))).sort();
  }, [students]);

  // Filtered overdue list
  const filteredOverdue = useMemo(() => {
    return overdueRecords.filter((rec) => {
      const matchGrade = selectedGrade === 'SEMUA' || rec.student.grade === selectedGrade;
      const matchSearch =
        rec.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.student.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.student.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.student.parentPhone.includes(searchQuery);

      return matchGrade && matchSearch;
    });
  }, [overdueRecords, selectedGrade, searchQuery]);

  // Total school overdue sum
  const grandTotalOverdue = useMemo(() => {
    return overdueRecords.reduce((sum, r) => sum + r.totalUnpaid, 0);
  }, [overdueRecords]);

  // Breakdown per class
  const classBreakdown = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    gradesList.forEach((g) => {
      map[g] = { total: 0, count: 0 };
    });

    overdueRecords.forEach((rec) => {
      const g = rec.student.grade;
      if (!map[g]) map[g] = { total: 0, count: 0 };
      map[g].total += rec.totalUnpaid;
      map[g].count += 1;
    });

    return map;
  }, [overdueRecords, gradesList]);

  const handlePrint = () => {
    window.print();
  };

  const handleSendReminderToAll = () => {
    setActiveTab('notifications');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              Pengawasan Tunggakan
            </span>
            <span className="text-xs text-slate-500">{currentSchool.name}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Daftar Siswa Menunggak
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Total {overdueRecords.length} siswa dengan akumulasi tunggakan{' '}
            <strong className="text-red-600 font-mono">{formatRupiah(grandTotalOverdue)}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm border border-slate-300 flex items-center transition cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 mr-1.5 text-slate-500" />
            <span>🖨️ Cetak Daftar Tunggakan</span>
          </button>

          {/* Send Reminder to All Button */}
          <button
            onClick={handleSendReminderToAll}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center shadow-md transition cursor-pointer"
          >
            <Send className="w-4 h-4 mr-1.5" />
            <span>Kirim Pengingat Tunggakan ke Semua</span>
          </button>
        </div>
      </div>

      {/* Class Overdue Summary Cards (no-print) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 no-print">
        {gradesList.map((grade) => {
          const stats = classBreakdown[grade] || { total: 0, count: 0 };
          return (
            <div
              key={grade}
              onClick={() => setSelectedGrade(selectedGrade === grade ? 'SEMUA' : grade)}
              className={`p-3 rounded-2xl border transition cursor-pointer ${
                selectedGrade === grade
                  ? 'bg-red-50 border-red-400 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{grade}</span>
                <span className="text-[10px] text-slate-500">{stats.count} siswa</span>
              </div>
              <div className="text-sm font-extrabold text-red-600 font-mono mt-1">
                {formatRupiah(stats.total)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between no-print">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama siswa, NIS, kelas..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500">Filter Rombel:</span>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-xl bg-white"
          >
            <option value="SEMUA">Semua Kelas ({overdueRecords.length} siswa)</option>
            {gradesList.map((g) => (
              <option key={g} value={g}>
                {g} ({(classBreakdown[g]?.count || 0)} siswa)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PRINT-ONLY OFFICIAL KOP */}
      <div className="print-only text-center pb-4 mb-4 border-b-2 border-black">
        <h1 className="text-xl font-black uppercase">{currentSchool.name}</h1>
        <p className="text-xs font-semibold uppercase">DAFTAR REKAPITULASI TUNGGAKAN SISWA / SANTRI</p>
        <p className="text-xs">{currentSchool.address} • Kontak Bendahara: {currentSchool.treasurerPhone}</p>
        <p className="text-xs text-slate-600 mt-1">Per Tanggal: {formatDateIndo(new Date())}</p>
      </div>

      {/* Overdue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print:border-none print:shadow-none">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200 print:bg-transparent">
              <tr>
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Nama Siswa / NIS</th>
                <th className="py-3 px-3">Kelas</th>
                <th className="py-3 px-4">Orang Tua & Kontak</th>
                <th className="py-3 px-4">Rincian Tagihan Tertunggak</th>
                <th className="py-3 px-4 text-right">Total Tunggakan</th>
                <th className="py-3 px-4 text-right no-print">Aksi Bendahara</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOverdue.length > 0 ? (
                filteredOverdue.map((rec, idx) => {
                  const { student, unpaidList, totalUnpaid } = rec;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 text-slate-400 font-mono text-xs">{idx + 1}</td>

                      {/* Name & NIS */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{student.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">NIS: {student.nis}</div>
                      </td>

                      {/* Grade */}
                      <td className="py-3 px-3">
                        <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs">
                          {student.grade}
                        </span>
                      </td>

                      {/* Parent & Phone */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">
                          {student.fatherName || student.motherName || 'Wali'}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 flex items-center">
                          <Phone className="w-3 h-3 mr-1 text-emerald-600 inline" />
                          <span>{student.parentPhone}</span>
                        </div>
                      </td>

                      {/* Item Details */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {unpaidList.map((item) => (
                            <div key={item.id} className="text-[11px] text-slate-700 flex justify-between gap-2">
                              <span>• {item.feeName}</span>
                              <span className="font-mono text-red-600 font-semibold">
                                {formatRupiah(item.amount - item.paidAmount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 text-right font-mono font-black text-red-600 text-sm">
                        {formatRupiah(totalUnpaid)}
                      </td>

                      {/* Actions (hidden when printing) */}
                      <td className="py-3 px-4 text-right space-x-1.5 no-print whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectStudentForPayment) {
                              onSelectStudentForPayment(student.id);
                            }
                            setActiveTab('payments');
                          }}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs"
                          title="Lunasi Tunggakan"
                        >
                          💰 Bayar
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('notifications');
                          }}
                          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-xs"
                          title="Kirim Notifikasi WA Tunggakan"
                        >
                          <Send className="w-3.5 h-3.5 inline mr-1" />
                          Kirim WA
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Alhamdulillah, tidak ada siswa yang memiliki tunggakan pada filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary in Print and Screen */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs sm:text-sm font-bold">
          <span>TOTAL AKUMULASI TUNGGAKAN:</span>
          <span className="font-mono text-base sm:text-lg text-red-700 font-black">
            {formatRupiah(
              filteredOverdue.reduce((sum, r) => sum + r.totalUnpaid, 0)
            )}
          </span>
        </div>
      </div>

      {/* PRINT-ONLY SIGNATURE SECTION */}
      <div className="print-only pt-8 grid grid-cols-2 text-center text-xs">
        <div>
          <p>Mengetahui,</p>
          <p className="font-semibold">Kepala Sekolah,</p>
          <div className="h-20"></div>
          <p className="font-bold underline uppercase">{currentSchool.headmaster}</p>
        </div>
        <div>
          <p>Legokjawa, {formatDateIndo(new Date())}</p>
          <p className="font-semibold">Bendahara Sekolah,</p>
          <div className="h-20"></div>
          <p className="font-bold underline uppercase">{currentSchool.treasurer}</p>
          <p className="font-mono text-[10px]">No. WA: {currentSchool.treasurerPhone}</p>
        </div>
      </div>
    </div>
  );
};
