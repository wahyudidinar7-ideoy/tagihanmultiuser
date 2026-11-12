import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { createWhatsAppUrl } from '../utils/helpers';
import {
  History,
  Search,
  Phone,
  Send,
  CheckCircle2,
  Calendar,
  MessageSquare,
  X,
  ExternalLink,
} from 'lucide-react';
import { NotificationLog } from '../types';

export const NotificationHistoryView: React.FC = () => {
  const { currentSchool, notificationLogs } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('SEMUA');
  const [viewingLog, setViewingLog] = useState<NotificationLog | null>(null);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return notificationLogs.filter((log) => {
      const matchSearch =
        log.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.parentPhone.includes(searchQuery) ||
        log.grade.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = selectedType === 'SEMUA' || log.type === selectedType;

      return matchSearch && matchType;
    });
  }, [notificationLogs, searchQuery, selectedType]);

  const handleResend = (log: NotificationLog) => {
    const url = createWhatsAppUrl(log.parentPhone, log.message);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              Riwayat Pengiriman
            </span>
            <span className="text-xs text-slate-500">{currentSchool.name}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Riwayat Pesan & Pemberitahuan WA
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Daftar seluruh pesan tagihan, pengingat, tunggakan, dan kuitansi yang pernah dikirimkan
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama siswa, no WA, kelas..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500">Jenis Pesan:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-xl bg-white"
          >
            <option value="SEMUA">Semua Jenis ({notificationLogs.length})</option>
            <option value="Tagihan Baru">Tagihan Baru</option>
            <option value="Pengingat Jatuh Tempo">Pengingat Jatuh Tempo</option>
            <option value="Tunggakan">Tunggakan</option>
            <option value="Konfirmasi Pembayaran LUNAS">Konfirmasi Lunas</option>
            <option value="Kwitansi Digital">Kwitansi Digital</option>
            <option value="Pengumuman Keuangan Umum">Pengumuman</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Waktu Kirim</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-2">Kelas</th>
                <th className="py-3 px-4">No. WhatsApp</th>
                <th className="py-3 px-3">Jenis Pesan</th>
                <th className="py-3 px-4">Cuplikan Pesan</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-slate-500 font-mono text-xs whitespace-nowrap">
                      {log.sentAt}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900">{log.studentName}</td>

                    <td className="py-3 px-2">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 font-semibold text-xs">
                        {log.grade}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-xs text-slate-700">
                      {log.parentPhone}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          log.type === 'Tunggakan'
                            ? 'bg-red-100 text-red-800'
                            : log.type === 'Tagihan Baru'
                            ? 'bg-purple-100 text-purple-800'
                            : log.type.includes('LUNAS') || log.type.includes('Kwitansi')
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {log.type}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate text-xs text-slate-500">
                      {log.message}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                        {log.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setViewingLog(log)}
                        className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md font-medium"
                      >
                        Lihat Isi
                      </button>
                      <button
                        onClick={() => handleResend(log)}
                        className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs inline-flex items-center"
                      >
                        <Send className="w-3 h-3 mr-1" /> Kirim Ulang
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Belum ada riwayat pesan terkirim pada filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Detail Pesan Lengkap */}
      {viewingLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Detail Pesan: {viewingLog.studentName} ({viewingLog.grade})
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Waktu: {viewingLog.sentAt} • WA: {viewingLog.parentPhone}
                </p>
              </div>
              <button
                onClick={() => setViewingLog(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-4 bg-slate-100 rounded-xl text-xs font-sans whitespace-pre-wrap leading-relaxed border border-slate-200 text-slate-800 max-h-72 overflow-y-auto">
                {viewingLog.message}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(viewingLog.message);
                    alert('Pesan berhasil disalin ke clipboard!');
                  }}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                >
                  📋 Salin Pesan
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setViewingLog(null)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleResend(viewingLog);
                      setViewingLog(null);
                    }}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" /> Buka di WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
