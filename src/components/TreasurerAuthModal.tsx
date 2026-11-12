import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, X, KeyRound, CheckCircle2 } from 'lucide-react';

interface TreasurerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TreasurerAuthModal: React.FC<TreasurerAuthModalProps> = ({ isOpen, onClose }) => {
  const { loginTreasurer, isTreasurerLoggedIn, logoutTreasurer } = useApp();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginTreasurer(password);
    if (success) {
      setError(false);
      setPassword('');
      onClose();
    } else {
      setError(true);
    }
  };

  const handleQuickUnlock = () => {
    setPassword('bendahara123');
    loginTreasurer('bendahara123');
    setError(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Otorisasi Mode Bendahara</h3>
              <p className="text-xs text-slate-500">Akses penuh input, edit, pembayaran & kelola data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isTreasurerLoggedIn ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Mode Bendahara Aktif</h4>
              <p className="text-xs text-slate-500 mt-1">
                Anda memiliki hak akses penuh untuk membuat tagihan, mencatat pembayaran, dan mengedit data.
              </p>
            </div>
            <div className="pt-2 flex justify-center space-x-3">
              <button
                type="button"
                onClick={() => {
                  logoutTreasurer();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl"
              >
                Kunci Akses / Mode Baca
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
              <p className="font-semibold mb-0.5">ℹ️ Kata Sandi Bendahara:</p>
              <p>
                Gunakan sandi default: <code className="font-mono font-bold bg-amber-200/70 px-1.5 py-0.5 rounded text-amber-900">bendahara123</code>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Masukkan Kata Sandi
              </label>
              <div className="relative">
                <input
                  type="password"
                  autoFocus
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  placeholder="Ketik bendahara123..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
              {error && (
                <p className="text-xs text-red-600 mt-1.5">
                  ❌ Kata sandi salah. Gunakan sandi: bendahara123
                </p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleQuickUnlock}
                className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold"
              >
                ⚡ Isi Cepat & Buka Akses
              </button>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center"
                >
                  <Lock className="w-3.5 h-3.5 mr-1.5" /> Buka Akses
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
