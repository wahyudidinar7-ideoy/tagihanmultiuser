import React, { useState, useMemo, useEffect } from 'react';
import { Student, NotificationType, Invoice } from '../types';
import { useApp } from '../context/AppContext';
import { formatRupiah, createWhatsAppUrl, formatDateIndo } from '../utils/helpers';
import {
  Send,
  Copy,
  Printer,
  Edit3,
  CheckCircle2,
  Users,
  MessageSquare,
  Sparkles,
  RotateCcw,
  ExternalLink,
  Check,
  Building,
} from 'lucide-react';
import { OfficialLetterModal } from '../components/OfficialLetterModal';

interface NotificationSenderViewProps {
  initialStudentId?: string;
}

export const NotificationSenderView: React.FC<NotificationSenderViewProps> = ({
  initialStudentId,
}) => {
  const {
    currentSchool,
    schools,
    setCurrentSchoolId,
    students,
    invoices,
    addNotificationLog,
  } = useApp();

  // Selection states
  const [selectedGrade, setSelectedGrade] = useState<string>('SEMUA');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [notificationType, setNotificationType] =
    useState<NotificationType>('Tagihan Baru');

  // Customization options
  const [customBillName, setCustomBillName] = useState('SPP Bulanan');
  const [customPeriod, setCustomPeriod] = useState('November 2026');
  const [customDueDate, setCustomDueDate] = useState('10 November 2026');
  const [customAnnouncementTitle, setCustomAnnouncementTitle] = useState(
    'Pengumuman Pembayaran Administrasi'
  );
  const [customAnnouncementBody, setCustomAnnouncementBody] = useState(
    'Diberitahukan kepada seluruh wali santri bahwa batas akhir pembayaran diperpanjang sampai tanggal 15 bulan ini.'
  );

  // Message template & manual editor
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [customizedMessageText, setCustomizedMessageText] = useState('');
  const [copied, setCopied] = useState(false);

  // Mass Send Queue Tracker
  const [sentTracking, setSentTracking] = useState<Record<string, boolean>>({});

  // Official Letter Modal
  const [isOfficialLetterOpen, setIsOfficialLetterOpen] = useState(false);
  const [letterStudent, setLetterStudent] = useState<Student | null>(null);

  // Unique grades
  const gradesList = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.grade))).sort();
  }, [students]);

  // Filtered students by grade
  const availableStudents = useMemo(() => {
    return students.filter((s) => {
      if (s.status !== 'Aktif') return false;
      if (selectedGrade !== 'SEMUA' && s.grade !== selectedGrade) return false;
      return true;
    });
  }, [students, selectedGrade]);

  // Initial student select if provided via props
  useEffect(() => {
    if (initialStudentId && students.some((s) => s.id === initialStudentId)) {
      setSelectedStudentIds([initialStudentId]);
      const found = students.find((s) => s.id === initialStudentId);
      if (found) setSelectedGrade(found.grade);
    } else if (availableStudents.length > 0 && selectedStudentIds.length === 0) {
      setSelectedStudentIds([availableStudents[0].id]);
    }
  }, [initialStudentId, students]);

  // First selected student for single preview
  const primaryStudent = useMemo(() => {
    if (selectedStudentIds.length > 0) {
      return students.find((s) => s.id === selectedStudentIds[0]) || availableStudents[0];
    }
    return availableStudents[0] || null;
  }, [selectedStudentIds, students, availableStudents]);

  // Invoices for primary student to dynamically fill amounts
  const primaryStudentInvoices = useMemo(() => {
    if (!primaryStudent) return [];
    return invoices.filter((i) => i.studentId === primaryStudent.id);
  }, [primaryStudent, invoices]);

  const unpaidInvoices = useMemo(() => {
    return primaryStudentInvoices.filter(
      (i) => i.status === 'BELUM LUNAS' || i.status === 'SEBAGIAN'
    );
  }, [primaryStudentInvoices]);

  const totalPrimaryUnpaid = useMemo(() => {
    return unpaidInvoices.reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);
  }, [unpaidInvoices]);

  // Select / Deselect All
  const handleSelectAllInGrade = () => {
    if (selectedStudentIds.length === availableStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(availableStudents.map((s) => s.id));
    }
  };

  const handleToggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Helper to compile message for a given student
  const generateMessageForStudent = (student: Student) => {
    const sch = currentSchool;
    const stdInvoices = invoices.filter((i) => i.studentId === student.id);
    const stdUnpaid = stdInvoices.filter(
      (i) => i.status === 'BELUM LUNAS' || i.status === 'SEBAGIAN'
    );
    const sumUnpaid = stdUnpaid.reduce(
      (sum, inv) => sum + (inv.amount - inv.paidAmount),
      0
    );
    const invoiceSummaryList =
      stdUnpaid.length > 0
        ? stdUnpaid.map((i) => `- ${i.feeName}: ${formatRupiah(i.amount - i.paidAmount)}`).join('\n')
        : `- ${customBillName}: Rp 50.000`;

    const bankInfo = sch.bankAccount
      ? `Transfer ke ${sch.bankName} No. Rek: *${sch.bankAccount}* a.n *${sch.bankHolder}*`
      : `Tunai ke Bendahara`;

    switch (notificationType) {
      case 'Tagihan Baru':
        return `Assalamualaikum Wr. Wb.
Yth. Bapak/Ibu Orang Tua/Wali dari Ananda *${student.name}* (Kelas: *${student.grade}*) di *${sch.name}*.

Kami informasikan bahwa telah terbit tagihan *${customBillName}* (${customPeriod}) sebesar *${formatRupiah(sumUnpaid > 0 ? sumUnpaid : 50000)}* dengan jatuh tempo pembayaran *${customDueDate}*.

Pembayaran dapat dilakukan melalui:
1. Tunai ke Bendahara: *${sch.treasurer}*
2. ${bankInfo}

Mohon konfirmasi setelah melakukan pembayaran. Terima kasih atas perhatian dan kerja samanya.

Wassalamualaikum Wr. Wb.
- *Bendahara ${sch.name}* (${sch.treasurerPhone})`;

      case 'Pengingat Jatuh Tempo':
        return `Assalamualaikum Wr. Wb.
Yth. Bapak/Ibu Orang Tua/Wali dari Ananda *${student.name}* (Kelas: *${student.grade}*) *${sch.name}*.

Mengingatkan kembali bahwa tagihan *${customBillName}* sebesar *${formatRupiah(sumUnpaid > 0 ? sumUnpaid : 50000)}* akan jatuh tempo dalam *H-3* (pada tanggal *${customDueDate}*).

Rincian Kewajiban:
${invoiceSummaryList}

Mohon dapat diselesaikan sebelum tanggal jatuh tempo demi kelancaran kegiatan belajar santri/siswa. ${bankInfo}.

Terima kasih.
Wassalamualaikum Wr. Wb.
- *Bendahara ${sch.name}*`;

      case 'Tunggakan':
        return `Assalamualaikum Wr. Wb.
Yth. Bapak/Ibu Orang Tua/Wali dari Ananda *${student.name}* (Kelas: *${student.grade}*) di *${sch.name}*.

Berdasarkan pembukuan keuangan madrasah/sekolah, ananda tercatat memiliki *TUNGGAKAN KEWAJIBAN* yang telah melewati batas jatuh tempo dengan rincian:
${invoiceSummaryList}

*TOTAL TUNGGAKAN: ${formatRupiah(sumUnpaid > 0 ? sumUnpaid : 125000)}*

Kami mohon kesediaan Bapak/Ibu untuk segera menyelesaikan pembayaran tersebut atau menghubungi Bendahara jika memerlukan keringanan / sistem angsuran.

${bankInfo}
Konfirmasi & Info: *${sch.treasurer}* (${sch.treasurerPhone}).

Jazakumullahu khairan katsiran.
Wassalamualaikum Wr. Wb.`;

      case 'Konfirmasi Pembayaran LUNAS':
        return `Assalamualaikum Wr. Wb.
Alhamdulillah, kami sampaikan terima kasih banyak kepada Bapak/Ibu Wali dari Ananda *${student.name}* (Kelas: *${student.grade}*) *${sch.name}*.

Pembayaran *${customBillName}* sebesar *${formatRupiah(50000)}* telah kami terima dengan status *LUNAS*.

Semoga rezeki Bapak/Ibu senantiasa dilapangkan dan menjadi amal jariyah yang membawa keberkahan bagi pendidikan ananda tercinta. Aamiin.

Hormat kami,
- *Bendahara ${sch.name}* (${sch.treasurer})`;

      case 'Kwitansi Digital':
        return `*KUITANSI DIGITAL PEMBAYARAN*
*${sch.name.toUpperCase()}*
---------------------------------------
No. Kuitansi: KWT/${new Date().getFullYear()}/DIGITAL
Nama Siswa: *${student.name}* (${student.grade})
Wali Murid: ${student.fatherName || student.motherName || 'Wali'}
Untuk Pembayaran: *${customBillName} (${customPeriod})*
Status: *LUNAS (SAH)*
---------------------------------------
Terima kasih telah melakukan pembayaran tepat waktu. Bukti ini sah diterbitkan oleh Bendahara ${sch.name}.`;

      case 'Pengumuman Keuangan Umum':
      default:
        return `Assalamualaikum Wr. Wb.
Yth. Bapak/Ibu Wali Murid dari Ananda *${student.name}* (Kelas: *${student.grade}*) *${sch.name}*.

*${customAnnouncementTitle.toUpperCase()}*
${customAnnouncementBody}

Untuk informasi lebih lanjut, silakan menghubungi Bendahara Sekolah: *${sch.treasurer}* (${sch.treasurerPhone}).

Terima kasih atas perhatian dan kerja samanya.
Wassalamualaikum Wr. Wb.
- *Pengurus ${sch.name}*`;
    }
  };

  // Preview message text
  const currentPreviewMessage = useMemo(() => {
    if (isEditingTemplate && customizedMessageText) {
      return customizedMessageText;
    }
    if (!primaryStudent) {
      return 'Pilih siswa untuk melihat preview pesan WhatsApp.';
    }
    return generateMessageForStudent(primaryStudent);
  }, [
    isEditingTemplate,
    customizedMessageText,
    primaryStudent,
    notificationType,
    customBillName,
    customPeriod,
    customDueDate,
    customAnnouncementTitle,
    customAnnouncementBody,
    currentSchool,
  ]);

  // Send single WA
  const handleSendSingleWhatsApp = (student: Student) => {
    const text = isEditingTemplate && customizedMessageText
      ? customizedMessageText
      : generateMessageForStudent(student);

    const url = createWhatsAppUrl(student.parentPhone, text);

    // Record notification log
    addNotificationLog({
      schoolId: currentSchool.id,
      studentId: student.id,
      studentName: student.name,
      grade: student.grade,
      parentPhone: student.parentPhone,
      type: notificationType,
      message: text,
      status: 'Sudah Dikirim',
      channel: 'WhatsApp',
    });

    setSentTracking((prev) => ({ ...prev, [student.id]: true }));
    window.open(url, '_blank');
  };

  // Copy message
  const handleCopy = () => {
    navigator.clipboard.writeText(currentPreviewMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Open Official Letter Print
  const handleOpenOfficialLetter = (student: Student) => {
    setLetterStudent(student);
    setIsOfficialLetterOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              Fitur Inti WhatsApp
            </span>
            <span className="text-xs text-slate-500">Kirim Pemberitahuan Keuangan Otomatis</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Kirim Pemberitahuan ke Orang Tua
          </h2>
          <p className="text-xs text-slate-500">
            Kirim tagihan baru, pengingat jatuh tempo, tunggakan, kwitansi, atau cetak surat resmi berkop sekolah
          </p>
        </div>

        {/* School selector pill */}
        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
          <Building className="w-4 h-4 text-emerald-600" />
          <span className="text-xs text-slate-500">Sekolah:</span>
          <select
            value={currentSchool.id}
            onChange={(e) => setCurrentSchoolId(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
          >
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main 2-Column Split: Form Filters & Students on Left (45%), Live WhatsApp Preview on Right (55%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Filters, Notification Type & Student Selection (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Step 1: Jenis Pemberitahuan */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>1. Pilih Jenis Pemberitahuan</span>
              <span className="text-[11px] font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                6 Template Resmi
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  'Tagihan Baru',
                  'Pengingat Jatuh Tempo',
                  'Tunggakan',
                  'Konfirmasi Pembayaran LUNAS',
                  'Kwitansi Digital',
                  'Pengumuman Keuangan Umum',
                ] as NotificationType[]
              ).map((type) => {
                const isSelected = notificationType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setNotificationType(type);
                      setIsEditingTemplate(false);
                    }}
                    className={`p-2.5 rounded-xl text-left text-xs font-semibold transition border cursor-pointer ${
                      isSelected
                        ? type === 'Tunggakan'
                          ? 'bg-red-50 border-red-500 text-red-800 shadow-xs'
                          : 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{type}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Dynamic variable customizer depending on type */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs">
              {notificationType !== 'Pengumuman Keuangan Umum' ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Nama Tagihan
                      </label>
                      <input
                        type="text"
                        value={customBillName}
                        onChange={(e) => setCustomBillName(e.target.value)}
                        placeholder="SPP Bulanan"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Bulan / Periode
                      </label>
                      <input
                        type="text"
                        value={customPeriod}
                        onChange={(e) => setCustomPeriod(e.target.value)}
                        placeholder="November 2026"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Batas Jatuh Tempo
                    </label>
                    <input
                      type="text"
                      value={customDueDate}
                      onChange={(e) => setCustomDueDate(e.target.value)}
                      placeholder="10 November 2026"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Judul Pengumuman
                    </label>
                    <input
                      type="text"
                      value={customAnnouncementTitle}
                      onChange={(e) => setCustomAnnouncementTitle(e.target.value)}
                      placeholder="Judul Pengumuman Keuangan"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Isi Pesan Pengumuman
                    </label>
                    <textarea
                      rows={3}
                      value={customAnnouncementBody}
                      onChange={(e) => setCustomAnnouncementBody(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Step 2: Pilih Kelas & Siswa */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                2. Pilih Kelas & Siswa
              </span>
              <span className="text-xs font-bold text-slate-700">
                {selectedStudentIds.length} Siswa Terpilih
              </span>
            </div>

            {/* Grade Filter Row */}
            <div className="flex items-center space-x-2">
              <label className="text-xs font-semibold text-slate-600 shrink-0">Kelas:</label>
              <select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setSelectedStudentIds([]);
                }}
                className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-300 rounded-xl bg-white"
              >
                <option value="SEMUA">Semua Kelas ({students.filter((s) => s.status === 'Aktif').length} siswa)</option>
                {gradesList.map((g) => (
                  <option key={g} value={g}>
                    {g} ({students.filter((s) => s.grade === g && s.status === 'Aktif').length} siswa)
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleSelectAllInGrade}
                className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl whitespace-nowrap"
              >
                {selectedStudentIds.length === availableStudents.length
                  ? 'Batal Semua'
                  : 'Pilih Semua'}
              </button>
            </div>

            {/* Student Checklist Selection Container */}
            <div className="border border-slate-200 rounded-xl max-h-56 overflow-y-auto divide-y divide-slate-100">
              {availableStudents.map((std) => {
                const isChecked = selectedStudentIds.includes(std.id);
                const hasSent = sentTracking[std.id];
                const stdInvoices = invoices.filter((i) => i.studentId === std.id);
                const hasUnpaid = stdInvoices.some(
                  (i) => i.status === 'BELUM LUNAS' || i.status === 'SEBAGIAN'
                );

                return (
                  <label
                    key={std.id}
                    className={`flex items-center justify-between px-3 py-2 text-xs transition cursor-pointer hover:bg-slate-50 ${
                      isChecked ? 'bg-emerald-50/50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleStudent(std.id)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <div className="truncate">
                        <div className="font-semibold text-slate-900 truncate flex items-center space-x-1.5">
                          <span>{std.name}</span>
                          {hasUnpaid && (
                            <span className="w-2 h-2 rounded-full bg-red-500 inline-block shrink-0" title="Ada tunggakan" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono truncate">
                          {std.grade} • WA: {std.parentPhone}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center space-x-1.5">
                      {hasSent && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Terkirim
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WhatsApp Live Chat Preview & Multi-Action Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            {/* WhatsApp Header Simulation */}
            <div className="bg-[#075E54] text-white p-3 sm:p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  {primaryStudent?.name.slice(0, 2).toUpperCase() || 'WA'}
                </div>
                <div>
                  <div className="font-bold text-sm flex items-center space-x-1.5">
                    <span>
                      {primaryStudent
                        ? `${primaryStudent.fatherName || primaryStudent.motherName || 'Wali'} (${primaryStudent.name})`
                        : 'Orang Tua Siswa'}
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-100">
                    {primaryStudent?.parentPhone || '08xx-xxxx-xxxx'} • {primaryStudent?.grade || 'Kelas'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setIsEditingTemplate(!isEditingTemplate)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center transition ${
                    isEditingTemplate
                      ? 'bg-amber-400 text-slate-900'
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                  title="Edit isi teks secara bebas sebelum dikirim"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" />
                  {isEditingTemplate ? 'Selesai Edit' : 'Edit Pesan'}
                </button>
              </div>
            </div>

            {/* WhatsApp Chat Body Box */}
            <div
              className="p-4 sm:p-6 bg-[#efeae2] relative min-h-[260px] flex flex-col justify-end"
              style={{
                backgroundImage:
                  'radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(#cbd5e1 1px, #efeae2 1px)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 10px',
              }}
            >
              {/* WhatsApp Bubble */}
              <div className="bg-white p-4 rounded-2xl rounded-tl-xs shadow-md border border-slate-200 max-w-xl self-start text-xs sm:text-sm text-slate-800 leading-relaxed space-y-2 whitespace-pre-wrap">
                {isEditingTemplate ? (
                  <textarea
                    rows={10}
                    value={customizedMessageText || currentPreviewMessage}
                    onChange={(e) => setCustomizedMessageText(e.target.value)}
                    className="w-full p-2 border border-emerald-400 rounded-lg font-sans text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                ) : (
                  <div>{currentPreviewMessage}</div>
                )}
                <div className="text-[10px] text-slate-400 text-right pt-1 font-mono">
                  {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • ✓✓
                </div>
              </div>
            </div>

            {/* Bottom 4 Essential Actions */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 space-y-3">
              {/* If Single Student Selected */}
              {selectedStudentIds.length <= 1 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Action 1: Kirim WA */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!primaryStudent) {
                        alert('Pilih siswa terlebih dahulu!');
                        return;
                      }
                      handleSendSingleWhatsApp(primaryStudent);
                    }}
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>📱 Kirim via WhatsApp</span>
                  </button>

                  {/* Action 2: Salin Pesan */}
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="py-3 px-4 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm border border-slate-300 flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                    <span>{copied ? 'Tersalin!' : '📋 Salin Pesan'}</span>
                  </button>

                  {/* Action 3: Print Surat Resmi */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!primaryStudent) return;
                      handleOpenOfficialLetter(primaryStudent);
                    }}
                    className="py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold rounded-xl text-xs sm:text-sm border border-blue-200 flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-blue-600" />
                    <span>🖨️ Cetak Surat Resmi</span>
                  </button>
                </div>
              ) : (
                /* Multi Students Selected: Mass Queue List with Individual Click Buttons */
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>
                      Antrean Kirim WhatsApp ({selectedStudentIds.length} Siswa Terpilih)
                    </span>
                    <span className="text-emerald-700">
                      Klik tombol hijau satu per satu untuk kirim via wa.me:
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {selectedStudentIds.map((stdId, idx) => {
                      const std = students.find((s) => s.id === stdId);
                      if (!std) return null;
                      const isSent = sentTracking[std.id];

                      return (
                        <div
                          key={std.id}
                          className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-bold text-slate-900 truncate">
                              {idx + 1}. {std.name} <span className="font-normal text-slate-500">({std.grade})</span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              Wali: {std.fatherName || std.motherName} • {std.parentPhone}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenOfficialLetter(std)}
                              className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                              title="Print Surat Fisik"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSendSingleWhatsApp(std)}
                              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 text-xs transition cursor-pointer ${
                                isSent
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                              }`}
                            >
                              <Send className="w-3 h-3 mr-1" />
                              <span>{isSent ? 'Kirim Ulang' : 'Kirim WA'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reset to Default Template if customized */}
              {isEditingTemplate && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomizedMessageText('');
                      setIsEditingTemplate(false);
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline inline-flex items-center"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" /> Kembalikan ke Template Asli
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Official Letter Modal */}
      {isOfficialLetterOpen && letterStudent && (
        <OfficialLetterModal
          student={letterStudent}
          invoices={invoices.filter((i) => i.studentId === letterStudent.id)}
          letterType={notificationType}
          isOpen={isOfficialLetterOpen}
          onClose={() => setIsOfficialLetterOpen(false)}
        />
      )}
    </div>
  );
};
