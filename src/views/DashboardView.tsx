import React from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/helpers';
import {
  Users,
  Wallet,
  CheckCircle,
  AlertCircle,
  Send,
  UserPlus,
  CreditCard,
  PlusCircle,
  TrendingUp,
  Receipt,
  ArrowRight,
} from 'lucide-react';
import { ActiveTab } from '../components/Sidebar';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const { currentSchool, students, invoices, payments } = useApp();

  // Metrics calculation
  const activeStudents = students.filter((s) => s.status === 'Aktif');
  const totalStudentsCount = activeStudents.length;

  const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaidAmount = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalRemainingAmount = Math.max(0, totalInvoiceAmount - totalPaidAmount);

  const overdueInvoices = invoices.filter(
    (inv) => inv.status === 'BELUM LUNAS' || inv.status === 'SEBAGIAN'
  );

  // Unique students who have overdue invoices
  const studentsWithOverdue = new Set(overdueInvoices.map((inv) => inv.studentId));
  const countOverdueStudents = studentsWithOverdue.size;

  const collectionRate =
    totalInvoiceAmount > 0 ? Math.round((totalPaidAmount / totalInvoiceAmount) * 100) : 0;

  // Grade Breakdown for CSS Bar Chart
  const gradesList = Array.from(new Set(students.map((s) => s.grade))).sort();
  const gradeStats = gradesList.map((grade) => {
    const gradeStudents = students.filter((s) => s.grade === grade && s.status === 'Aktif');
    const gradeStudentIds = new Set(gradeStudents.map((s) => s.id));
    const gradeInvoices = invoices.filter((inv) => gradeStudentIds.has(inv.studentId));

    const billed = gradeInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paid = gradeInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const unpaid = Math.max(0, billed - paid);
    const percentage = billed > 0 ? Math.min(100, Math.round((paid / billed) * 100)) : 0;

    return {
      grade,
      studentCount: gradeStudents.length,
      billed,
      paid,
      unpaid,
      percentage,
    };
  });

  // Payment methods breakdown
  const methodStats = {
    Tunai: payments.filter((p) => p.method === 'Tunai').reduce((s, p) => s + p.amount, 0),
    Transfer: payments.filter((p) => p.method === 'Transfer').reduce((s, p) => s + p.amount, 0),
    QRIS: payments.filter((p) => p.method === 'QRIS').reduce((s, p) => s + p.amount, 0),
  };
  const totalPaymentSum = methodStats.Tunai + methodStats.Transfer + methodStats.QRIS;

  // Recent 5 payments
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
              {currentSchool.level}
            </span>
            <span className="text-emerald-100 text-xs">Pemberitahuan Keuangan Orang Tua</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mt-1 tracking-tight">
            {currentSchool.name}
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            Bendahara: <strong>{currentSchool.treasurer}</strong> ({currentSchool.treasurerPhone}) • Rek: {currentSchool.bankName} {currentSchool.bankAccount}
          </p>
        </div>

        {/* Quick Send WA Button */}
        <button
          onClick={() => setActiveTab('notifications')}
          className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md flex items-center space-x-2 transition cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>Kirim Notifikasi WA</span>
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Siswa */}
        <div
          onClick={() => setActiveTab('students')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Siswa Aktif</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {totalStudentsCount} <span className="text-xs font-normal text-slate-500">santri/siswa</span>
            </div>
            <div className="text-[11px] text-blue-600 font-medium mt-1 flex items-center">
              Lihat data siswa & wali <ArrowRight className="w-3 h-3 ml-0.5" />
            </div>
          </div>
        </div>

        {/* Card 2: Total Tagihan */}
        <div
          onClick={() => setActiveTab('fees')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Tagihan Terbit</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono">
              {formatRupiah(totalInvoiceAmount)}
            </div>
            <div className="text-[11px] text-purple-600 font-medium mt-1 flex items-center">
              {invoices.length} data tagihan terdaftar
            </div>
          </div>
        </div>

        {/* Card 3: Sudah Lunas */}
        <div
          onClick={() => setActiveTab('payments')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Sudah Dibayar (Lunas)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-mono">
              {formatRupiah(totalPaidAmount)}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center">
              Tingkat Kelunasan: {collectionRate}%
            </div>
          </div>
        </div>

        {/* Card 4: Tunggakan */}
        <div
          onClick={() => setActiveTab('overdue')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Tunggakan</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-extrabold text-red-600 font-mono">
              {formatRupiah(totalRemainingAmount)}
            </div>
            <div className="text-[11px] text-red-600 font-bold mt-1 flex items-center">
              {countOverdueStudents} siswa menunggak
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Aksi Cepat Bendahara
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => setActiveTab('notifications')}
            className="flex items-center justify-center space-x-2 py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Notifikasi WA</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className="flex items-center justify-center space-x-2 py-3 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Input Siswa Baru</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className="flex items-center justify-center space-x-2 py-3 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Catat Pembayaran</span>
          </button>

          <button
            onClick={() => setActiveTab('fees')}
            className="flex items-center justify-center space-x-2 py-3 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Terbitkan Tagihan</span>
          </button>
        </div>
      </div>

      {/* Main Content Split: Bar Chart Per Kelas & Metode Bayar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: CSS Bar Chart Kelunasan Per Kelas (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-emerald-600" />
                Persentase Kelunasan per Kelas
              </h3>
              <p className="text-xs text-slate-500">Perbandingan tagihan terbayar vs tunggakan per rombel</p>
            </div>
            <button
              onClick={() => setActiveTab('overdue')}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
            >
              Lihat Detail Tunggakan →
            </button>
          </div>

          <div className="space-y-4 pt-2">
            {gradeStats.length > 0 ? (
              gradeStats.map((item) => (
                <div key={item.grade} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 min-w-16">{item.grade}</span>
                      <span className="text-slate-400 font-normal">({item.studentCount} siswa)</span>
                    </div>
                    <div className="flex items-center space-x-3 text-right">
                      <span className="font-mono text-emerald-700">{formatRupiah(item.paid)}</span>
                      <span className="text-slate-400">/</span>
                      <span className="font-mono text-slate-500">{formatRupiah(item.billed)}</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        item.percentage >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.percentage >= 50
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* CSS Progress Bar */}
                  <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 transition-all duration-500 h-full rounded-l-full"
                      style={{ width: `${item.percentage}%` }}
                      title={`Lunas: ${item.percentage}%`}
                    />
                    <div
                      className="bg-red-300 transition-all duration-500 h-full"
                      style={{ width: `${100 - item.percentage}%` }}
                      title={`Belum Lunas: ${100 - item.percentage}%`}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                Belum ada data siswa atau tagihan di sekolah ini.
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center space-x-6 text-xs text-slate-500">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              <span>Sudah Lunas</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-red-300 inline-block"></span>
              <span>Tunggakan / Belum Bayar</span>
            </div>
          </div>
        </div>

        {/* Right: Payment Method Breakdown & Recent Payments */}
        <div className="space-y-6">
          {/* Payment Methods */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center">
              <Receipt className="w-4 h-4 mr-2 text-blue-600" />
              Metode Pembayaran
            </h3>
            <p className="text-xs text-slate-500 mb-4">Total penerimaan kas: {formatRupiah(totalPaymentSum)}</p>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Tunai (Cash Bendahara)</span>
                  <span className="font-mono text-slate-900">{formatRupiah(methodStats.Tunai)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: totalPaymentSum > 0 ? `${(methodStats.Tunai / totalPaymentSum) * 100}%` : '0%',
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Transfer Bank</span>
                  <span className="font-mono text-slate-900">{formatRupiah(methodStats.Transfer)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{
                      width: totalPaymentSum > 0 ? `${(methodStats.Transfer / totalPaymentSum) * 100}%` : '0%',
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>QRIS</span>
                  <span className="font-mono text-slate-900">{formatRupiah(methodStats.QRIS)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{
                      width: totalPaymentSum > 0 ? `${(methodStats.QRIS / totalPaymentSum) * 100}%` : '0%',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent 5 Receipts */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Pembayaran Terkini</h3>
              <button
                onClick={() => setActiveTab('payments')}
                className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold"
              >
                Lihat Semua
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentPayments.length > 0 ? (
                recentPayments.map((p) => {
                  const student = students.find((s) => s.id === p.studentId);
                  return (
                    <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-slate-800 truncate">
                          {student?.name || 'Siswa'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {p.receiptNumber} • {p.method}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-emerald-700">
                          {formatRupiah(p.amount)}
                        </div>
                        <div className="text-[10px] text-slate-400">{p.paymentDate}</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-4 text-center text-slate-400 text-xs">Belum ada pembayaran</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
