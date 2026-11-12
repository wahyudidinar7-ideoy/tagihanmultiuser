import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDateIndo } from '../utils/helpers';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Filter,
  CheckCircle,
  Building,
  CreditCard,
  TrendingUp,
} from 'lucide-react';

type ReportPeriod = 'Semua' | 'Hari Ini' | '7 Hari Terakhir' | 'Bulan Ini' | 'Semester Ini';
type ReportTab = 'transaksi' | 'kepsek';

export const ReportsView: React.FC = () => {
  const { currentSchool, students, invoices, payments, feeMasters } = useApp();

  const [activeTab, setActiveTab] = useState<ReportTab>('transaksi');
  const [period, setPeriod] = useState<ReportPeriod>('Semua');
  const [selectedMethod, setSelectedMethod] = useState<string>('SEMUA');
  const [selectedGrade, setSelectedGrade] = useState<string>('SEMUA');

  // Unique grades
  const gradesList = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.grade))).sort();
  }, [students]);

  // Filter payments by selected criteria
  const filteredPayments = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    return payments.filter((p) => {
      // Period filter
      if (period === 'Hari Ini') {
        if (!p.paymentDate.startsWith(todayStr)) return false;
      } else if (period === '7 Hari Terakhir') {
        const pDate = new Date(p.paymentDate);
        const diffDays = (now.getTime() - pDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 7 || diffDays < 0) return false;
      } else if (period === 'Bulan Ini') {
        const curMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        if (!p.paymentDate.startsWith(curMonthYear)) return false;
      }

      // Method filter
      if (selectedMethod !== 'SEMUA' && p.method !== selectedMethod) {
        return false;
      }

      // Grade filter
      if (selectedGrade !== 'SEMUA') {
        const student = students.find((s) => s.id === p.studentId);
        if (!student || student.grade !== selectedGrade) return false;
      }

      return true;
    });
  }, [payments, period, selectedMethod, selectedGrade, students]);

  // Summary Metrics
  const totalIncome = useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  }, [filteredPayments]);

  const totalTransactions = filteredPayments.length;
  const avgTransaction = totalTransactions > 0 ? Math.round(totalIncome / totalTransactions) : 0;

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  // Download real CSV report
  const handleDownloadCsv = () => {
    const headers = ['No Kuitansi', 'Tanggal', 'Nama Siswa', 'NIS', 'Kelas', 'Untuk Pembayaran', 'Metode', 'Nominal (Rp)', 'Penerima'];
    const rows = filteredPayments.map((p) => {
      const student = students.find((s) => s.id === p.studentId);
      const detailStr = p.details && p.details.length > 0
        ? p.details.map((d) => d.feeName).join('; ')
        : (p.notes || '-');

      return [
        `"${p.receiptNumber}"`,
        `"${p.paymentDate}"`,
        `"${student?.name || '-'}"`,
        `"${student?.nis || '-'}"`,
        `"${student?.grade || '-'}"`,
        `"${detailStr.replace(/"/g, '""')}"`,
        `"${p.method}"`,
        p.amount,
        `"${p.receiverName || currentSchool.treasurer}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Keuangan_${currentSchool.name.replace(/\s+/g, '_')}_${period}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Executive summary data for Kepala Sekolah
  const kepsekGradeSummary = useMemo(() => {
    return gradesList.map((grade) => {
      const gradeStudents = students.filter((s) => s.grade === grade && s.status === 'Aktif');
      const studentIds = new Set(gradeStudents.map((s) => s.id));
      const gradeInvoices = invoices.filter((i) => studentIds.has(i.studentId));

      const billed = gradeInvoices.reduce((s, i) => s + i.amount, 0);
      const paid = gradeInvoices.reduce((s, i) => s + i.paidAmount, 0);
      const unpaid = Math.max(0, billed - paid);
      const compliance = billed > 0 ? Math.round((paid / billed) * 100) : 0;

      return {
        grade,
        studentsCount: gradeStudents.length,
        billed,
        paid,
        unpaid,
        compliance,
      };
    });
  }, [gradesList, students, invoices]);

  const kepsekFeeSummary = useMemo(() => {
    return feeMasters.map((fee) => {
      const feeInvoices = invoices.filter((i) => i.feeMasterId === fee.id);
      const billed = feeInvoices.reduce((s, i) => s + i.amount, 0);
      const paid = feeInvoices.reduce((s, i) => s + i.paidAmount, 0);
      const unpaid = Math.max(0, billed - paid);

      return {
        name: fee.name,
        period: fee.period,
        billed,
        paid,
        unpaid,
      };
    });
  }, [feeMasters, invoices]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Laporan & Rekap Keuangan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {currentSchool.name} • Laporan penerimaan kas, rekapitulasi, dan berkas eksekutif kepala sekolah
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* CSV Download Button */}
          <button
            onClick={handleDownloadCsv}
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs sm:text-sm border border-emerald-300 flex items-center transition cursor-pointer"
          >
            <Download className="w-4 h-4 mr-1.5 text-emerald-700" />
            <span>📥 Download CSV (Excel)</span>
          </button>

          {/* Print Report Button */}
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center shadow-md transition cursor-pointer"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            <span>🖨️ Cetak Laporan Resmi</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher: Transaksi Kas vs Laporan Kepala Sekolah (no-print) */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 no-print">
        <button
          onClick={() => setActiveTab('transaksi')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'transaksi'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tabel Pemasukan Kas
        </button>
        <button
          onClick={() => setActiveTab('kepsek')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'kepsek'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Laporan Rekap untuk Kepala Sekolah
        </button>
      </div>

      {/* Filter Row (no-print) */}
      {activeTab === 'transaksi' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center justify-between no-print">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Periode:</span>
            {(['Semua', 'Hari Ini', '7 Hari Terakhir', 'Bulan Ini'] as ReportPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  period === p
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1">
              <span className="text-slate-500">Metode:</span>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
              >
                <option value="SEMUA">Semua Metode</option>
                <option value="Tunai">Tunai</option>
                <option value="Transfer">Transfer</option>
                <option value="QRIS">QRIS</option>
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <span className="text-slate-500">Kelas:</span>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
              >
                <option value="SEMUA">Semua Kelas</option>
                {gradesList.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 3 Metric Cards for Filtered Range (no-print) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">Total Pemasukan Kas</div>
          <div className="text-2xl font-black text-emerald-800 font-mono mt-1">
            {formatRupiah(totalIncome)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Periode: {period}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">Jumlah Transaksi</div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {totalTransactions} <span className="text-xs font-normal text-slate-500">kuitansi</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Tercatat di pembukuan</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">Rata-rata Pembayaran</div>
          <div className="text-2xl font-black text-blue-700 font-mono mt-1">
            {formatRupiah(avgTransaction)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Per transaksi siswa</div>
        </div>
      </div>

      {/* PRINT-ONLY OFFICIAL KOP LAPORAN */}
      <div className="print-only text-center pb-4 mb-4 border-b-2 border-black">
        <h1 className="text-xl font-black uppercase">{currentSchool.name}</h1>
        <p className="text-xs font-semibold uppercase">
          LAPORAN REKAPITULASI KEUANGAN & PEMASUKAN KAS SEKOLAH
        </p>
        <p className="text-xs">{currentSchool.address} • Kontak Bendahara: {currentSchool.treasurerPhone}</p>
        <p className="text-xs font-semibold text-slate-700 mt-1">
          Periode: {period} • Tanggal Cetak: {formatDateIndo(new Date())}
        </p>
      </div>

      {/* TAB CONTENT 1: Transaksi Pemasukan Detail */}
      {activeTab === 'transaksi' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print:border-none print:shadow-none">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between no-print">
            <h3 className="text-sm font-bold text-slate-800">
              Rincian Transaksi Pembayaran ({filteredPayments.length})
            </h3>
            <span className="text-xs text-slate-500">
              Menampilkan {filteredPayments.length} bukti penerimaan
            </span>
          </div>

          <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200 print:bg-transparent">
                <tr>
                  <th className="py-3 px-3">No</th>
                  <th className="py-3 px-3">No. Kwitansi</th>
                  <th className="py-3 px-3">Tanggal</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-2">Kelas</th>
                  <th className="py-3 px-4">Untuk Pembayaran</th>
                  <th className="py-3 px-3">Metode</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((p, idx) => {
                    const student = students.find((s) => s.id === p.studentId);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-xs">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-xs">
                          {p.receiptNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap text-xs">
                          {formatDateIndo(p.paymentDate)}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">
                          {student?.name || 'Siswa'}
                        </td>
                        <td className="py-2.5 px-2">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 font-semibold text-xs">
                            {student?.grade || '-'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-xs text-slate-700">
                          {p.details && p.details.length > 0
                            ? p.details.map((d) => d.feeName).join(', ')
                            : p.notes}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-semibold">
                            {p.method}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-800">
                          {formatRupiah(p.amount)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Tidak ada transaksi pembayaran pada filter ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs sm:text-sm font-bold">
            <span className="uppercase tracking-wider">TOTAL PENERIMAAN KAS:</span>
            <span className="font-mono text-base sm:text-lg text-emerald-800 font-black">
              {formatRupiah(totalIncome)}
            </span>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: Laporan Rekap Kepala Sekolah */}
      {activeTab === 'kepsek' && (
        <div className="space-y-6">
          {/* Rekap Per Kelas */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 print:border-none print:shadow-none">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              1. Rekapitulasi Keuangan per Kelas / Rombel
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Tingkat kepatuhan pembayaran santri/siswa per kelas
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Kelas</th>
                    <th className="py-2.5 px-3">Jumlah Siswa</th>
                    <th className="py-2.5 px-3 text-right">Total Tagihan</th>
                    <th className="py-2.5 px-3 text-right">Sudah Diterima</th>
                    <th className="py-2.5 px-3 text-right">Tunggakan</th>
                    <th className="py-2.5 px-3 text-center">Persentase Lunas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kepsekGradeSummary.map((item) => (
                    <tr key={item.grade} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold">{item.grade}</td>
                      <td className="py-2.5 px-3">{item.studentsCount} siswa</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatRupiah(item.billed)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-semibold">
                        {formatRupiah(item.paid)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-red-600 font-semibold">
                        {formatRupiah(item.unpaid)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-xs ${
                            item.compliance >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.compliance >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.compliance}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rekap Per Jenis Tagihan */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 print:border-none print:shadow-none">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              2. Rekapitulasi Realisasi Penerimaan per Pos Tagihan
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Penerimaan SPP, Uang Buku, Kegiatan, Infaq dan Seragam
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Nama Pos Tagihan</th>
                    <th className="py-2.5 px-3">Periode</th>
                    <th className="py-2.5 px-3 text-right">Target Tagihan</th>
                    <th className="py-2.5 px-3 text-right">Realisasi Masuk</th>
                    <th className="py-2.5 px-3 text-right">Belum Terealisasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kepsekFeeSummary.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold">{item.name}</td>
                      <td className="py-2.5 px-3 text-slate-500">{item.period}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatRupiah(item.billed)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-bold">
                        {formatRupiah(item.paid)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-red-600 font-bold">
                        {formatRupiah(item.unpaid)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PRINT-ONLY SIGNATURE SECTION */}
      <div className="print-only pt-10 grid grid-cols-2 text-center text-xs">
        <div>
          <p>Mengetahui,</p>
          <p className="font-semibold">Kepala Sekolah,</p>
          <div className="h-24"></div>
          <p className="font-bold underline uppercase">{currentSchool.headmaster}</p>
        </div>
        <div>
          <p>Legokjawa, {formatDateIndo(new Date())}</p>
          <p className="font-semibold">Bendahara Sekolah,</p>
          <div className="h-24"></div>
          <p className="font-bold underline uppercase">{currentSchool.treasurer}</p>
          <p className="font-mono text-[10px]">No. WA: {currentSchool.treasurerPhone}</p>
        </div>
      </div>
    </div>
  );
};
