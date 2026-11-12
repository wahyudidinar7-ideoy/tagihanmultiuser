import React, { useState } from 'react';
import { FeeMaster, FeePeriod } from '../types';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/helpers';
import {
  Plus,
  Layers,
  Edit2,
  Trash2,
  SlidersHorizontal,
  X,
  Check,
  Zap,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export const MasterFeesView: React.FC = () => {
  const {
    currentSchool,
    feeMasters,
    students,
    invoices,
    addFeeMaster,
    updateFeeMaster,
    quickUpdateFeeAmount,
    deleteFeeMaster,
    generateBatchInvoices,
  } = useApp();

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeMaster | null>(null);
  const [quickAdjustFee, setQuickAdjustFee] = useState<FeeMaster | null>(null);
  const [newQuickAmount, setNewQuickAmount] = useState<number>(0);
  const [isBatchPublishModalOpen, setIsBatchPublishModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    amount: 50000,
    period: 'Bulanan' as FeePeriod,
    dueDayOrDate: 'Tiap tanggal 10',
    description: '',
  });

  // Batch Publish State
  const [selectedFeeIdForBatch, setSelectedFeeIdForBatch] = useState<string>('');
  const [batchPeriodMonthYear, setBatchPeriodMonthYear] = useState<string>('Desember 2026');
  const [batchDueDate, setBatchDueDate] = useState<string>('2026-12-10');
  const [batchTargetGrade, setBatchTargetGrade] = useState<string>('SEMUA');
  const [batchResult, setBatchResult] = useState<{ createdCount: number; skippedCount: number } | null>(null);

  // Unique grades for batch target
  const gradesList = Array.from(new Set(students.map((s) => s.grade))).sort();

  const handleOpenCreate = () => {
    setEditingFee(null);
    setFormData({
      name: '',
      amount: 50000,
      period: 'Bulanan',
      dueDayOrDate: 'Tiap tanggal 10',
      description: 'Iuran operasional sekolah',
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (fee: FeeMaster) => {
    setEditingFee(fee);
    setFormData({
      name: fee.name,
      amount: fee.amount,
      period: fee.period,
      dueDayOrDate: fee.dueDayOrDate,
      description: fee.description,
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama jenis tagihan wajib diisi!');
      return;
    }

    if (editingFee) {
      updateFeeMaster({
        ...editingFee,
        ...formData,
      });
    } else {
      addFeeMaster({
        schoolId: currentSchool.id,
        ...formData,
      });
    }

    setIsCreateModalOpen(false);
  };

  const handleQuickAdjustSave = () => {
    if (!quickAdjustFee) return;
    quickUpdateFeeAmount(quickAdjustFee.id, Number(newQuickAmount) || 0);
    setQuickAdjustFee(null);
  };

  const handleDelete = (fee: FeeMaster) => {
    if (
      confirm(
        `Yakin ingin menghapus jenis tagihan "${fee.name}"? Tagihan siswa yang sudah terbit sebelumnya tidak akan hilang.`
      )
    ) {
      deleteFeeMaster(fee.id);
    }
  };

  const handleRunBatchPublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeeIdForBatch) {
      alert('Pilih jenis tagihan terlebih dahulu!');
      return;
    }

    const result = generateBatchInvoices(
      selectedFeeIdForBatch,
      batchPeriodMonthYear,
      batchDueDate,
      batchTargetGrade
    );
    setBatchResult(result);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Master Jenis Tagihan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {currentSchool.name} • Sesuaikan nominal & terbitkan tagihan ke siswa
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Batch Generate Button */}
          <button
            onClick={() => {
              setSelectedFeeIdForBatch(feeMasters[0]?.id || '');
              setBatchResult(null);
              setIsBatchPublishModalOpen(true);
            }}
            className="px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded-xl text-xs sm:text-sm flex items-center transition cursor-pointer border border-purple-200"
          >
            <Zap className="w-4 h-4 mr-1.5 text-purple-600" />
            <span>⚡ Terbitkan Tagihan Massal</span>
          </button>

          {/* Add Master Fee Button */}
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>+ Buat Jenis Tagihan Baru</span>
          </button>
        </div>
      </div>

      {/* Info Card Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 flex items-start space-x-3">
        <Layers className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Ketentuan Pengaturan Nominal Tagihan:</p>
          <p className="text-emerald-800 mt-0.5">
            Jika bendahara mengubah nominal di Master Tagihan, tagihan lama yang sudah terbit / lunas <strong>TIDAK AKAN BERUBAH</strong>. Nominal baru hanya akan berlaku untuk tagihan baru yang diterbitkan selanjutnya.
          </p>
        </div>
      </div>

      {/* Fee Masters Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {feeMasters.map((fee) => {
          // Count how many active invoices use this master fee
          const countInvoices = invoices.filter((i) => i.feeMasterId === fee.id).length;

          return (
            <div
              key={fee.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                    {fee.period}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setQuickAdjustFee(fee);
                        setNewQuickAmount(fee.amount);
                      }}
                      className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                      title="Sesuaikan Nominal Cepat"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(fee)}
                      className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                      title="Edit Tagihan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(fee)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Hapus Tagihan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2">{fee.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {fee.description || 'Tidak ada keterangan tambahan.'}
                </p>

                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">
                    Nominal Standar
                  </div>
                  <div className="text-xl font-extrabold text-emerald-800 font-mono mt-0.5">
                    {formatRupiah(fee.amount)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Jatuh Tempo: <strong>{fee.dueDayOrDate}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{countInvoices} tagihan siswa terbit</span>
                <button
                  type="button"
                  onClick={() => {
                    setQuickAdjustFee(fee);
                    setNewQuickAmount(fee.amount);
                  }}
                  className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline"
                >
                  Sesuaikan Nominal →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Tambah / Edit Jenis Tagihan */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">
                {editingFee ? 'Edit Master Tagihan' : 'Buat Jenis Tagihan Baru'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFee} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Tagihan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: SPP Bulanan, Uang Komputer"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nominal (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Periode *</label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value as FeePeriod })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Bulanan">Bulanan</option>
                    <option value="Semester">Semester</option>
                    <option value="Tahunan">Tahunan</option>
                    <option value="Sekali Bayar">Sekali Bayar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jatuh Tempo Standar
                </label>
                <input
                  type="text"
                  value={formData.dueDayOrDate}
                  onChange={(e) => setFormData({ ...formData, dueDayOrDate: e.target.value })}
                  placeholder="Contoh: Tiap tanggal 10, atau Awal Semester"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Keterangan peruntukan iuran..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Simpan Jenis Tagihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Sesuaikan Nominal Cepat */}
      {quickAdjustFee && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Sesuaikan Nominal: {quickAdjustFee.name}
              </h3>
              <button
                onClick={() => setQuickAdjustFee(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Nominal saat ini: <strong className="font-mono">{formatRupiah(quickAdjustFee.amount)}</strong>.
              Ubah ke nilai baru di bawah ini:
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nominal Baru (Rp)</label>
              <input
                type="number"
                min={0}
                step={5000}
                autoFocus
                value={newQuickAmount}
                onChange={(e) => setNewQuickAmount(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 text-base font-mono font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                = {formatRupiah(newQuickAmount)}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setQuickAdjustFee(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleQuickAdjustSave}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Terbitkan Tagihan Massal Ke Siswa */}
      {isBatchPublishModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-purple-700" />
                <h3 className="text-base font-bold text-purple-900">
                  Terbitkan Tagihan Massal ke Siswa
                </h3>
              </div>
              <button
                onClick={() => setIsBatchPublishModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRunBatchPublish} className="p-5 space-y-4">
              <p className="text-xs text-slate-600">
                Fitur ini akan otomatis membuat tagihan untuk semua siswa aktif tanpa khawatir tagihan ganda (duplikat akan otomatis dilewati).
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Jenis Tagihan *
                </label>
                <select
                  value={selectedFeeIdForBatch}
                  onChange={(e) => setSelectedFeeIdForBatch(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {feeMasters.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} - {formatRupiah(f.amount)} ({f.period})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bulan / Periode Tagihan *
                  </label>
                  <input
                    type="text"
                    required
                    value={batchPeriodMonthYear}
                    onChange={(e) => setBatchPeriodMonthYear(e.target.value)}
                    placeholder="Desember 2026"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Jatuh Tempo *
                  </label>
                  <input
                    type="date"
                    required
                    value={batchDueDate}
                    onChange={(e) => setBatchDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Siswa / Rombel
                </label>
                <select
                  value={batchTargetGrade}
                  onChange={(e) => setBatchTargetGrade(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
                >
                  <option value="SEMUA">Semua Siswa Aktif ({students.filter((s) => s.status === 'Aktif').length} siswa)</option>
                  {gradesList.map((g) => (
                    <option key={g} value={g}>
                      Khusus {g}
                    </option>
                  ))}
                </select>
              </div>

              {batchResult && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-emerald-800 flex items-center">
                    <Check className="w-4 h-4 mr-1 text-emerald-600" />
                    Berhasil menerbitkan {batchResult.createdCount} tagihan baru!
                  </p>
                  {batchResult.skippedCount > 0 && (
                    <p className="text-slate-600">
                      ℹ️ {batchResult.skippedCount} siswa dilewati karena sudah memiliki tagihan ini di periode yang sama.
                    </p>
                  )}
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsBatchPublishModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs flex items-center"
                >
                  <Zap className="w-4 h-4 mr-1.5" /> Terbitkan Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
