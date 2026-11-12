import React, { useState, useMemo, useEffect } from 'react';
import { Student, Invoice, Payment, PaymentMethod } from '../types';
import { useApp } from '../context/AppContext';
import {
  formatRupiah,
  getCurrentDateYMD,
  formatDateIndo,
  createWhatsAppUrl,
  terbilang,
} from '../utils/helpers';
import {
  CreditCard,
  Search,
  CheckCircle,
  AlertTriangle,
  Printer,
  Send,
  X,
  Check,
  Receipt,
  Trash2,
  Zap,
} from 'lucide-react';
import { ReceiptModal } from '../components/ReceiptModal';

interface PaymentsViewProps {
  initialStudentId?: string;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ initialStudentId }) => {
  const {
    currentSchool,
    students,
    invoices,
    payments,
    recordPayment,
    deletePayment,
  } = useApp();

  // Selected Student
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');

  // Payment Form Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Tunai');
  const [payDate, setPayDate] = useState<string>(getCurrentDateYMD());
  const [receiverName, setReceiverName] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');

  // Receipt Modal
  const [receiptToView, setReceiptToView] = useState<{
    payment: Payment;
    student: Student;
  } | null>(null);

  // Set default student
  useEffect(() => {
    if (initialStudentId && students.some((s) => s.id === initialStudentId)) {
      setSelectedStudentId(initialStudentId);
    } else if (!selectedStudentId && students.length > 0) {
      setSelectedStudentId(students[0].id);
    }
  }, [initialStudentId, students]);

  useEffect(() => {
    setReceiverName(currentSchool.treasurer);
  }, [currentSchool]);

  // Current selected student object
  const currentStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || students[0] || null;
  }, [students, selectedStudentId]);

  // Student invoices
  const studentInvoices = useMemo(() => {
    if (!currentStudent) return [];
    return invoices.filter((i) => i.studentId === currentStudent.id);
  }, [invoices, currentStudent]);

  // Total unpaid for this student
  const studentUnpaidInvoices = useMemo(() => {
    return studentInvoices.filter(
      (i) => i.status === 'BELUM LUNAS' || i.status === 'SEBAGIAN'
    );
  }, [studentInvoices]);

  const totalStudentUnpaid = useMemo(() => {
    return studentUnpaidInvoices.reduce(
      (sum, i) => sum + (i.amount - i.paidAmount),
      0
    );
  }, [studentUnpaidInvoices]);

  // Student payments history
  const studentPayments = useMemo(() => {
    if (!currentStudent) return [];
    return payments
      .filter((p) => p.studentId === currentStudent.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [payments, currentStudent]);

  // Filter students for search dropdown
  const filteredStudents = useMemo(() => {
    if (!studentSearch) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.grade.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.nis.toLowerCase().includes(studentSearch.toLowerCase())
    );
  }, [students, studentSearch]);

  // Open Pay Modal for Single Invoice
  const handleOpenPaySingle = (invoice: Invoice) => {
    const remaining = invoice.amount - invoice.paidAmount;
    setSelectedInvoiceIds([invoice.id]);
    setPayAmount(remaining);
    setPayNotes(`Pembayaran ${invoice.feeName}`);
    setIsPayModalOpen(true);
  };

  // Open Pay Modal for All Overdue (BAYAR SEMUA TUNGGAKAN)
  const handlePayAllOverdue = () => {
    if (studentUnpaidInvoices.length === 0) {
      alert('Siswa ini sudah melunasi semua tagihan!');
      return;
    }
    const allIds = studentUnpaidInvoices.map((i) => i.id);
    setSelectedInvoiceIds(allIds);
    setPayAmount(totalStudentUnpaid);
    setPayNotes(`Pelunasan semua tunggakan (${allIds.length} tagihan)`);
    setIsPayModalOpen(true);
  };

  // Submit Payment
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;
    if (payAmount <= 0) {
      alert('Jumlah pembayaran harus lebih dari Rp 0!');
      return;
    }

    const newPayment = recordPayment({
      studentId: currentStudent.id,
      invoiceIds: selectedInvoiceIds,
      amount: payAmount,
      method: payMethod,
      receiverName: receiverName || currentSchool.treasurer,
      notes: payNotes,
      paymentDate: payDate,
    });

    setIsPayModalOpen(false);

    // Prompt open official receipt
    setReceiptToView({
      payment: newPayment,
      student: currentStudent,
    });
  };

  // Send WhatsApp Receipt
  const handleSendWaReceipt = (payment: Payment) => {
    if (!currentStudent) return;
    const text = `*KUITANSI RESMI PEMBAYARAN*
*${currentSchool.name.toUpperCase()}*
----------------------------------------
No. Kuitansi: *${payment.receiptNumber}*
Tanggal: ${formatDateIndo(payment.paymentDate)}
Diterima Dari: ${currentStudent.fatherName || currentStudent.motherName || 'Wali Murid'}
Nama Siswa: *${currentStudent.name}* (${currentStudent.grade})
----------------------------------------
Jumlah Terbayar: *${formatRupiah(payment.amount)}*
Terbilang: _${terbilang(payment.amount)}_
Metode: ${payment.method}
Status: *LUNAS (SAH)*
Penerima: ${payment.receiverName}
----------------------------------------
Terima kasih atas pembayaran tepat waktu. - Bendahara ${currentSchool.name} (${currentSchool.treasurerPhone})`;

    const url = createWhatsAppUrl(currentStudent.parentPhone, text);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Kasir Pembayaran & Kuitansi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {currentSchool.name} • Catat penerimaan kas, cetak kuitansi dan kirim kuitansi via WhatsApp
          </p>
        </div>

        {/* Quick Settle All Overdue Button */}
        {currentStudent && totalStudentUnpaid > 0 && (
          <button
            onClick={handlePayAllOverdue}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md flex items-center space-x-2 transition cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Bayar Semua Tunggakan ({formatRupiah(totalStudentUnpaid)})</span>
          </button>
        )}
      </div>

      {/* Student Selector Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
            <Search className="w-4 h-4 mr-1.5 text-emerald-600" />
            Pilih Siswa / Santri yang Membayar:
          </label>
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Ketik cari nama / kelas..."
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1">
          {filteredStudents.map((std) => {
            const isSelected = std.id === selectedStudentId;
            const stdInvoices = invoices.filter((i) => i.studentId === std.id);
            const hasOverdue = stdInvoices.some(
              (i) => i.status === 'BELUM LUNAS' || i.status === 'SEBAGIAN'
            );

            return (
              <button
                key={std.id}
                type="button"
                onClick={() => setSelectedStudentId(std.id)}
                className={`p-2.5 rounded-xl text-left transition border cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-600 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 truncate">{std.name}</span>
                  {hasOverdue && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 ml-1" />}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {std.grade} • {std.nis}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {currentStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Student Invoices & Payment Action (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
              {/* Student Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      {currentStudent.grade}
                    </span>
                    <span className="text-xs font-mono text-slate-400">NIS: {currentStudent.nis}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{currentStudent.name}</h3>
                  <p className="text-xs text-slate-500">
                    Wali: {currentStudent.fatherName || currentStudent.motherName} • WA: {currentStudent.parentPhone}
                  </p>
                </div>

                <div className="text-right bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">
                    Total Belum Dibayar
                  </div>
                  <div className="text-lg font-extrabold text-red-600 font-mono">
                    {formatRupiah(totalStudentUnpaid)}
                  </div>
                </div>
              </div>

              {/* Invoices List */}
              <div className="mt-4 space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Daftar Tagihan Siswa Ini ({studentInvoices.length})
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                  {studentInvoices.length > 0 ? (
                    studentInvoices.map((inv) => {
                      const unpaid = inv.amount - inv.paidAmount;
                      const isLunas = inv.status === 'LUNAS';

                      return (
                        <div
                          key={inv.id}
                          className="p-3 flex items-center justify-between hover:bg-slate-50 transition"
                        >
                          <div className="min-w-0 pr-3">
                            <div className="font-bold text-slate-900 flex items-center space-x-2">
                              <span>{inv.feeName}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isLunas
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : inv.status === 'SEBAGIAN'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {inv.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Jatuh tempo: {inv.dueDate} • Terbayar:{' '}
                              <span className="font-mono text-emerald-700">
                                {formatRupiah(inv.paidAmount)}
                              </span>{' '}
                              dari{' '}
                              <span className="font-mono text-slate-700">
                                {formatRupiah(inv.amount)}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            {isLunas ? (
                              <div className="text-xs font-bold text-emerald-600 flex items-center justify-end">
                                <CheckCircle className="w-4 h-4 mr-1" /> Lunas
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenPaySingle(inv)}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition cursor-pointer"
                              >
                                💰 Bayar ({formatRupiah(unpaid)})
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-slate-400">
                      Belum ada tagihan untuk siswa ini.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Receipts History & Kuitansi (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Riwayat Kuitansi Siswa ({studentPayments.length})
                  </h3>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
                {studentPayments.length > 0 ? (
                  studentPayments.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 hover:bg-slate-100/60 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono font-bold text-emerald-800 text-xs">
                            {p.receiptNumber}
                          </span>
                          <div className="text-[11px] text-slate-500">
                            {formatDateIndo(p.paymentDate)} • Met: {p.method}
                          </div>
                        </div>
                        <div className="font-mono font-bold text-sm text-slate-900">
                          {formatRupiah(p.amount)}
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600">
                        {p.details && p.details.length > 0
                          ? p.details.map((d) => d.feeName).join(', ')
                          : p.notes}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Batalkan pembayaran ini? Tagihan siswa akan dikembalikan ke status belum lunas.')) {
                              deletePayment(p.id);
                            }
                          }}
                          className="text-[11px] text-red-500 hover:text-red-700 flex items-center"
                        >
                          <Trash2 className="w-3 h-3 mr-1" /> Batalkan
                        </button>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleSendWaReceipt(p)}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-md text-[11px] font-semibold flex items-center hover:bg-emerald-700"
                          >
                            <Send className="w-3 h-3 mr-1" /> Kirim WA
                          </button>
                          <button
                            type="button"
                            onClick={() => setReceiptToView({ payment: p, student: currentStudent })}
                            className="px-2.5 py-1 bg-blue-600 text-white rounded-md text-[11px] font-semibold flex items-center hover:bg-blue-700"
                          >
                            <Printer className="w-3 h-3 mr-1" /> Kuitansi
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Belum ada kuitansi pembayaran untuk siswa ini.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM: Catat Pembayaran */}
      {isPayModalOpen && currentStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-emerald-950">Catat Pembayaran Baru</h3>
                <p className="text-xs text-emerald-800">
                  {currentStudent.name} ({currentStudent.grade})
                </p>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-5 space-y-4">
              {/* Jumlah Bayar */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah yang Dibayarkan (Rp) *
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  step={1000}
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 text-lg font-mono font-bold text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs text-emerald-700 font-semibold mt-1">
                  = {formatRupiah(payAmount)}
                </p>
              </div>

              {/* Tanggal & Metode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Bayar *
                  </label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Metode Bayar *
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium"
                  >
                    <option value="Tunai">Tunai (Cash)</option>
                    <option value="Transfer">Transfer Bank</option>
                    <option value="QRIS">QRIS</option>
                  </select>
                </div>
              </div>

              {/* Penerima */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Penerima (Bendahara) *
                </label>
                <input
                  type="text"
                  required
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="Ustadzah Siti"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="Contoh: Titip melalui ananda di kelas"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center"
                >
                  <Check className="w-4 h-4 mr-1.5" /> Simpan & Terbitkan Kuitansi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Modal View */}
      {receiptToView && (
        <ReceiptModal
          payment={receiptToView.payment}
          student={receiptToView.student}
          isOpen={!!receiptToView}
          onClose={() => setReceiptToView(null)}
        />
      )}
    </div>
  );
};
