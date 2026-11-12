import React from 'react';
import { Payment, Student } from '../types';
import { useApp } from '../context/AppContext';
import { formatRupiah, terbilang, formatDateIndo, createWhatsAppUrl } from '../utils/helpers';
import { Printer, Send, X, Copy, Check } from 'lucide-react';

interface ReceiptModalProps {
  payment: Payment;
  student: Student;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  payment,
  student,
  isOpen,
  onClose,
}) => {
  const { currentSchool, addNotificationLog } = useApp();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Generate WhatsApp text for digital receipt
  const generateWaReceiptText = () => {
    const lines = [
      `*KUITANSI PEMBAYARAN DIGITAL*`,
      `*${currentSchool.name.toUpperCase()}*`,
      `Alamat: ${currentSchool.address}`,
      `--------------------------------`,
      `No. Kuitansi: *${payment.receiptNumber}*`,
      `Tanggal: ${formatDateIndo(payment.paymentDate)}`,
      `Diterima Dari: ${student.fatherName || student.motherName || 'Wali Murid'}`,
      `Nama Siswa: *${student.name}*`,
      `Kelas: ${student.grade}`,
      `--------------------------------`,
      `*RINCIAN PEMBAYARAN:*`,
    ];

    if (payment.details && payment.details.length > 0) {
      payment.details.forEach((d, idx) => {
        lines.push(`${idx + 1}. ${d.feeName}: ${formatRupiah(d.amountPaid)}`);
      });
    } else {
      lines.push(`- ${payment.notes || 'Pembayaran Tagihan Sekolah'}: ${formatRupiah(payment.amount)}`);
    }

    lines.push(`--------------------------------`);
    lines.push(`*TOTAL BAYAR: ${formatRupiah(payment.amount)}*`);
    lines.push(`_(${terbilang(payment.amount)})_`);
    lines.push(`Metode: *${payment.method}*`);
    lines.push(`Status: *LUNAS (SAH)*`);
    lines.push(`Penerima: ${payment.receiverName || currentSchool.treasurer}`);
    lines.push(``);
    lines.push(`Terima kasih atas pembayaran tepat waktu. Bukti kuitansi ini sah diterbitkan oleh Bendahara ${currentSchool.name}.`);
    lines.push(`Kontak Bendahara: ${currentSchool.treasurerPhone}`);

    return lines.join('\n');
  };

  const handleSendWa = () => {
    const text = generateWaReceiptText();
    const url = createWhatsAppUrl(student.parentPhone, text);
    
    // Log to notification history
    addNotificationLog({
      schoolId: currentSchool.id,
      studentId: student.id,
      studentName: student.name,
      grade: student.grade,
      parentPhone: student.parentPhone,
      type: 'Kwitansi Digital',
      message: text,
      status: 'Sudah Dikirim',
      channel: 'WhatsApp',
    });

    window.open(url, '_blank');
  };

  const handleCopy = () => {
    const text = generateWaReceiptText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 print:m-0 print:border-none print:shadow-none print:max-w-none print:w-full">
        {/* Modal Controls Bar (hidden when printing) */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono bg-emerald-600 px-2 py-0.5 rounded text-white font-bold">
              {payment.receiptNumber}
            </span>
            <span className="text-sm font-semibold">Kuitansi Pembayaran Sah</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition text-xs flex items-center"
              title="Salin Teks Kuitansi"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleSendWa}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 mr-1" /> Kirim via WA
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 mr-1" /> Cetak Kuitansi
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 sm:p-8 bg-white print:p-0">
          {/* Header Kop */}
          <div className="border-b-2 border-slate-800 pb-3 mb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl print:text-black print:border-2 print:border-black"
                  style={{ backgroundColor: currentSchool.logoBgColor || '#059669' }}
                >
                  {currentSchool.initial}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                    {currentSchool.name}
                  </h2>
                  <p className="text-xs text-slate-600">{currentSchool.address}</p>
                  <p className="text-[11px] text-slate-500">
                    Jenjang: {currentSchool.level} • Kontak Bendahara: {currentSchool.treasurerPhone}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300 px-3 py-1 rounded">
                  KUITANSI PEMBAYARAN
                </span>
                <p className="text-xs font-mono font-bold text-slate-800 mt-1">
                  {payment.receiptNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Receipt Body */}
          <div className="space-y-3.5 text-xs sm:text-sm text-slate-800">
            <div className="grid grid-cols-12 gap-2 py-1 border-b border-dashed border-slate-200">
              <div className="col-span-4 font-semibold text-slate-500">Telah Terima Dari:</div>
              <div className="col-span-8 font-bold">
                {student.fatherName || student.motherName || 'Orang Tua / Wali Murid'}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 py-1 border-b border-dashed border-slate-200">
              <div className="col-span-4 font-semibold text-slate-500">Nama Siswa / Santri:</div>
              <div className="col-span-8 font-bold text-emerald-800">
                {student.name} <span className="text-slate-500 font-normal">({student.grade} - NIS: {student.nis})</span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 py-1 border-b border-dashed border-slate-200">
              <div className="col-span-4 font-semibold text-slate-500">Uang Sejumlah:</div>
              <div className="col-span-8 font-bold italic bg-emerald-50/60 p-2 rounded border border-emerald-100 text-emerald-900 print:bg-transparent print:border-none print:p-0">
                "{terbilang(payment.amount)}"
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 py-1 border-b border-dashed border-slate-200">
              <div className="col-span-4 font-semibold text-slate-500">Untuk Pembayaran:</div>
              <div className="col-span-8 space-y-1">
                {payment.details && payment.details.length > 0 ? (
                  payment.details.map((item, i) => (
                    <div key={i} className="flex justify-between font-medium">
                      <span>• {item.feeName}</span>
                      <span className="font-mono">{formatRupiah(item.amountPaid)}</span>
                    </div>
                  ))
                ) : (
                  <p>{payment.notes || 'Pembayaran Tagihan Sekolah'}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 py-1 border-b border-dashed border-slate-200">
              <div className="col-span-4 font-semibold text-slate-500">Metode Pembayaran:</div>
              <div className="col-span-8">
                <span className="font-semibold bg-slate-100 px-2 py-0.5 rounded text-xs">
                  {payment.method}
                </span>
                {payment.notes && (
                  <span className="ml-2 text-slate-500 text-xs">Catatan: {payment.notes}</span>
                )}
              </div>
            </div>
          </div>

          {/* Amount Box & Signatures */}
          <div className="mt-6 pt-2 flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Big Amount Badge */}
            <div className="w-full sm:w-auto p-4 bg-emerald-50 border-2 border-emerald-600 rounded-2xl text-center sm:text-left print:border-black print:bg-transparent">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 print:text-black">
                Jumlah Terbayar (LUNAS):
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-900 print:text-black font-mono">
                {formatRupiah(payment.amount)}
              </div>
            </div>

            {/* Signature Block */}
            <div className="w-full sm:w-48 text-center text-xs text-slate-800">
              <p className="text-slate-500">
                Legokjawa, {formatDateIndo(payment.paymentDate)}
              </p>
              <p className="font-semibold mt-0.5">Bendahara Sekolah,</p>

              {/* Stamp simulation */}
              <div className="h-16 flex items-center justify-center my-1 relative">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-600/40 text-[9px] font-bold text-emerald-700/60 flex items-center justify-center uppercase rotate-[-12deg] select-none print:border-black print:text-black">
                  LUNAS • SAH
                </div>
              </div>

              <p className="font-bold underline text-slate-900 uppercase">
                {payment.receiverName || currentSchool.treasurer}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                WA: {currentSchool.treasurerPhone}
              </p>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400 print:text-black">
            Simpan kuitansi ini sebagai bukti pembayaran yang sah. Dicetak melalui Sistem Aplikasi Keuangan Sekolah.
          </div>
        </div>
      </div>
    </div>
  );
};
