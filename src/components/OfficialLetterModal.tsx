import React from 'react';
import { Student, Invoice } from '../types';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDateIndo } from '../utils/helpers';
import { Printer, X } from 'lucide-react';

interface OfficialLetterModalProps {
  student: Student;
  invoices: Invoice[];
  letterType: string;
  isOpen: boolean;
  onClose: () => void;
}

export const OfficialLetterModal: React.FC<OfficialLetterModalProps> = ({
  student,
  invoices,
  letterType,
  isOpen,
  onClose,
}) => {
  const { currentSchool } = useApp();

  if (!isOpen) return null;

  const totalUnpaid = invoices.reduce(
    (sum, inv) => sum + (inv.amount - inv.paidAmount),
    0
  );

  const handlePrint = () => {
    window.print();
  };

  const todayStr = formatDateIndo(new Date());

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 print:m-0 print:border-none print:shadow-none print:max-w-none print:w-full">
        {/* Controls Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold">Surat Pemberitahuan Resmi (Siap Cetak)</span>
            <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">
              Format A4
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Cetak Surat Fisik
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper */}
        <div className="p-8 sm:p-12 bg-white print:p-0 text-slate-900 leading-relaxed text-sm">
          {/* KOP SURAT RESMI */}
          <div className="text-center pb-3">
            <div className="flex items-center justify-center space-x-4 mb-2">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-black text-2xl print:text-black print:border-2 print:border-black shrink-0"
                style={{ backgroundColor: currentSchool.logoBgColor || '#059669' }}
              >
                {currentSchool.initial}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                  {currentSchool.name}
                </h1>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  LEMBAGA PENDIDIKAN JENJANG {currentSchool.level}
                </p>
                <p className="text-xs text-slate-600">
                  {currentSchool.address} • Kontak Bendahara: {currentSchool.treasurerPhone}
                </p>
              </div>
            </div>
            {/* Double Border Line */}
            <div className="border-t-2 border-b border-black h-1 my-2"></div>
          </div>

          {/* Letter Meta */}
          <div className="flex justify-between items-start text-xs sm:text-sm mt-4 mb-6">
            <div className="space-y-1">
              <p><span className="font-semibold inline-block w-20">Nomor</span>: 042/KEU/{currentSchool.level.replace(/[^a-zA-Z]/g, '')}/{new Date().getFullYear()}</p>
              <p><span className="font-semibold inline-block w-20">Lampiran</span>: -</p>
              <p><span className="font-semibold inline-block w-20">Perihal</span>: <strong>Pemberitahuan Kewajiban Keuangan Santri/Siswa</strong></p>
            </div>
            <div className="text-right">
              <p>Legokjawa, {todayStr}</p>
            </div>
          </div>

          {/* Destination */}
          <div className="mb-5 text-xs sm:text-sm">
            <p>Kepada Yth,</p>
            <p className="font-bold">Bapak / Ibu Orang Tua / Wali dari Ananda:</p>
            <div className="ml-4 mt-1 border-l-2 border-slate-300 pl-3 space-y-0.5">
              <p>Nama Siswa : <strong>{student.name}</strong></p>
              <p>Kelas : {student.grade}</p>
              <p>NIS : {student.nis}</p>
              <p>Alamat : {student.address}</p>
            </div>
            <p className="mt-1">di Tempat</p>
          </div>

          {/* Body */}
          <div className="space-y-3 text-xs sm:text-sm text-justify">
            <p>
              <em>Assalamu’alaikum Warahmatullahi Wabarakatuh,</em>
            </p>
            <p>
              Puji dan syukur senantiasa kita panjatkan ke hadirat Allah SWT atas limpahan rahmat dan karunia-Nya. Sholawat serta salam semoga tercurah kepada junjungan kita Nabi Muhammad SAW.
            </p>
            <p>
              Sehubungan dengan kelancaran kegiatan belajar mengajar dan operasional pendidikan di <strong>{currentSchool.name}</strong>, kami selaku pihak bendahara sekolah bermaksud menyampaikan informasi mengenai kewajiban administrasi keuangan ananda yang tercatat sampai dengan saat ini sebagai berikut:
            </p>

            {/* Table of Invoices */}
            <div className="my-4 overflow-hidden border border-slate-300 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2 px-3">No</th>
                    <th className="py-2 px-3">Nama Tagihan / Periode</th>
                    <th className="py-2 px-3">Jatuh Tempo</th>
                    <th className="py-2 px-3 text-right">Nominal Tagihan</th>
                    <th className="py-2 px-3 text-right">Sudah Dibayar</th>
                    <th className="py-2 px-3 text-right">Sisa Kewajiban</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoices.length > 0 ? (
                    invoices.map((inv, idx) => {
                      const remaining = inv.amount - inv.paidAmount;
                      return (
                        <tr key={inv.id}>
                          <td className="py-2 px-3">{idx + 1}</td>
                          <td className="py-2 px-3 font-semibold">{inv.feeName}</td>
                          <td className="py-2 px-3 text-slate-600">{inv.dueDate}</td>
                          <td className="py-2 px-3 text-right font-mono">{formatRupiah(inv.amount)}</td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-700">{formatRupiah(inv.paidAmount)}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-red-600">{formatRupiah(remaining)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-3 text-center text-slate-500">
                        Tidak ada tagihan tertunggak.
                      </td>
                    </tr>
                  )}
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={5} className="py-2.5 px-3 text-right uppercase">Total Kewajiban:</td>
                    <td className="py-2.5 px-3 text-right font-mono text-base text-red-700">
                      {formatRupiah(totalUnpaid)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment instructions */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <p className="font-bold text-slate-800">Tata Cara Pembayaran:</p>
              <p>1. <strong>Langsung Tunai</strong> di kantor bendahara sekolah pada jam kerja melalui Ustadzah/Ibu: <strong>{currentSchool.treasurer}</strong> ({currentSchool.treasurerPhone}).</p>
              {currentSchool.bankAccount && (
                <p>2. <strong>Transfer Bank</strong> ke Rekening <strong>{currentSchool.bankName}</strong> No. <strong>{currentSchool.bankAccount}</strong> a.n <strong>{currentSchool.bankHolder}</strong>. Mohon kirimkan bukti transfer melalui WhatsApp ke bendahara.</p>
              )}
            </div>

            <p>
              Demikian surat pemberitahuan ini kami sampaikan. Atas perhatian, kerja sama, dan komitmen Bapak/Ibu demi kemajuan pendidikan ananda, kami ucapkan terima kasih yang sebesar-besarnya. Jazakumullahu khairan katsiran.
            </p>
            <p>
              <em>Wassalamu’alaikum Warahmatullahi Wabarakatuh.</em>
            </p>
          </div>

          {/* Signatures */}
          <div className="mt-8 pt-4 grid grid-cols-2 text-center text-xs sm:text-sm">
            <div>
              <p className="text-slate-600">Mengetahui,</p>
              <p className="font-semibold">Kepala Sekolah,</p>
              <div className="h-20"></div>
              <p className="font-bold underline uppercase">{currentSchool.headmaster || 'Kepala Sekolah'}</p>
            </div>
            <div>
              <p className="text-slate-600">Legokjawa, {todayStr}</p>
              <p className="font-semibold">Bendahara Sekolah,</p>
              <div className="h-20"></div>
              <p className="font-bold underline uppercase">{currentSchool.treasurer}</p>
              <p className="text-xs text-slate-500 font-mono">No. WA: {currentSchool.treasurerPhone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
