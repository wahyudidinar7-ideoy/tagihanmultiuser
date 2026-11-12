import React, { useState } from 'react';
import { School, SchoolLevel } from '../types';
import { useApp } from '../context/AppContext';
import { X, Building2, Check, Trash2 } from 'lucide-react';

interface SchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  schoolToEdit?: School;
}

const PRESET_COLORS = [
  '#059669', // Emerald
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#ea580c', // Orange
  '#0d9488', // Teal
  '#db2777', // Pink
  '#4f46e5', // Indigo
];

export const SchoolModal: React.FC<SchoolModalProps> = ({
  isOpen,
  onClose,
  mode,
  schoolToEdit,
}) => {
  const { addSchool, updateSchool, deleteSchool } = useApp();

  const [name, setName] = useState(schoolToEdit?.name || '');
  const [level, setLevel] = useState<SchoolLevel>(schoolToEdit?.level || 'SD');
  const [address, setAddress] = useState(
    schoolToEdit?.address || 'Desa Legokjawa, Cimerak, Pangandaran'
  );
  const [headmaster, setHeadmaster] = useState(schoolToEdit?.headmaster || '');
  const [treasurer, setTreasurer] = useState(schoolToEdit?.treasurer || '');
  const [treasurerPhone, setTreasurerPhone] = useState(schoolToEdit?.treasurerPhone || '08');
  const [bankName, setBankName] = useState(schoolToEdit?.bankName || 'BRI');
  const [bankAccount, setBankAccount] = useState(schoolToEdit?.bankAccount || '');
  const [bankHolder, setBankHolder] = useState(schoolToEdit?.bankHolder || '');
  const [initial, setInitial] = useState(schoolToEdit?.initial || '');
  const [logoBgColor, setLogoBgColor] = useState(schoolToEdit?.logoBgColor || PRESET_COLORS[0]);

  if (!isOpen) return null;

  // Auto generate initial when typing name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!initial || mode === 'add') {
      const parts = val.trim().split(/\s+/);
      if (parts.length >= 2) {
        setInitial((parts[0][0] + parts[1][0]).toUpperCase());
      } else if (parts.length === 1 && parts[0].length > 0) {
        setInitial(parts[0].slice(0, 2).toUpperCase());
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama sekolah wajib diisi!');
      return;
    }

    const schoolPayload = {
      name: name.trim(),
      level,
      address: address.trim(),
      headmaster: headmaster.trim() || 'Kepala Sekolah',
      treasurer: treasurer.trim() || 'Bendahara',
      treasurerPhone: treasurerPhone.trim() || '081234567890',
      bankName: bankName.trim(),
      bankAccount: bankAccount.trim(),
      bankHolder: bankHolder.trim() || name.trim(),
      initial: (initial.trim() || name.slice(0, 2)).toUpperCase(),
      logoBgColor,
    };

    if (mode === 'add') {
      addSchool(schoolPayload);
    } else if (mode === 'edit' && schoolToEdit) {
      updateSchool({
        ...schoolPayload,
        id: schoolToEdit.id,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (!schoolToEdit) return;
    if (
      confirm(
        `Yakin ingin menghapus ${schoolToEdit.name}? Semua data siswa, tagihan, dan riwayat pembayaran sekolah ini akan ikut terhapus.`
      )
    ) {
      deleteSchool(schoolToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-800">
              {mode === 'add' ? 'Tambah Sekolah Baru' : 'Edit Data Sekolah'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Logo Initial & Color Picker */}
          <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-sm shrink-0"
              style={{ backgroundColor: logoBgColor }}
            >
              {initial || 'SK'}
            </div>
            <div className="space-y-1.5 grow">
              <label className="text-xs font-semibold text-slate-700">Inisial Logo (1-3 Huruf)</label>
              <input
                type="text"
                maxLength={3}
                value={initial}
                onChange={(e) => setInitial(e.target.value.toUpperCase())}
                placeholder="AH"
                className="w-20 px-2.5 py-1 text-sm uppercase font-mono font-bold border border-slate-300 rounded-lg text-center"
              />
              <div className="flex items-center space-x-1.5 pt-1">
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setLogoBgColor(col)}
                    className="w-5 h-5 rounded-full border-2 transition"
                    style={{
                      backgroundColor: col,
                      borderColor: logoBgColor === col ? '#0f172a' : 'transparent',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Nama Sekolah & Jenjang */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Sekolah / Lembaga *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="Contoh: DTU Al Hidayah - Legokjawa"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jenjang *</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as SchoolLevel)}
                className="w-full px-2.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="TK">TK</option>
                <option value="DTU/MDT Ula">DTU/MDT Ula</option>
                <option value="MDT Wustha">MDT Wustha</option>
                <option value="MI">MI</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA/SMK">SMA/SMK</option>
              </select>
            </div>
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Lengkap (Ditampilkan di Kop Surat & Kuitansi)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Contoh: Jl. Raya Legokjawa No. 15, Cimerak, Pangandaran"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Kepala Sekolah & Bendahara */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Kepala Sekolah
              </label>
              <input
                type="text"
                value={headmaster}
                onChange={(e) => setHeadmaster(e.target.value)}
                placeholder="Nama Kepala Sekolah beserta gelar"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Bendahara *
              </label>
              <input
                type="text"
                required
                value={treasurer}
                onChange={(e) => setTreasurer(e.target.value)}
                placeholder="Contoh: Ustadzah Siti"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* No WA Bendahara */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              No WhatsApp Bendahara (Dicantumkan di pesan tagihan & kuitansi) *
            </label>
            <input
              type="text"
              required
              value={treasurerPhone}
              onChange={(e) => setTreasurerPhone(e.target.value)}
              placeholder="081234567890"
              className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Info Rekening Bank */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Rekening Bank untuk Pembayaran Transfer
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Nama Bank (BRI/BSI)"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="Nomor Rekening"
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>
            <div>
              <input
                type="text"
                value={bankHolder}
                onChange={(e) => setBankHolder(e.target.value)}
                placeholder="Atas Nama Rekening (a.n Madrasah/Sekolah)"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            {mode === 'edit' ? (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus Sekolah
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs flex items-center"
              >
                <Check className="w-4 h-4 mr-1.5" />
                {mode === 'add' ? 'Simpan Sekolah' : 'Perbarui Sekolah'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
