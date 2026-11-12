import React, { useState, useMemo } from 'react';
import { Student, StudentStatus } from '../types';
import { useApp } from '../context/AppContext';
import { formatRupiah, parseExcelStudentImport, createWhatsAppUrl } from '../utils/helpers';
import {
  UserPlus,
  Upload,
  Search,
  Filter,
  Edit2,
  Trash2,
  FileText,
  Phone,
  X,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { ActiveTab } from '../components/Sidebar';

interface StudentsViewProps {
  onSelectStudentForPayment?: (studentId: string) => void;
  onSelectStudentForNotification?: (studentId: string) => void;
  setActiveTab?: (tab: ActiveTab) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  onSelectStudentForPayment,
  onSelectStudentForNotification,
  setActiveTab,
}) => {
  const {
    currentSchool,
    students,
    invoices,
    addStudent,
    updateStudent,
    deleteStudent,
    importStudents,
    isTreasurerLoggedIn,
  } = useApp();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('SEMUA');
  const [statusFilter, setStatusFilter] = useState('SEMUA');

  // Modals
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudentInvoices, setViewingStudentInvoices] = useState<Student | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    nis: '',
    grade: 'I',
    fatherName: '',
    motherName: '',
    parentPhone: '08',
    address: 'Desa Legokjawa, Cimerak',
    status: 'Aktif' as StudentStatus,
  });

  // Import State
  const [excelText, setExcelText] = useState('');
  const [importSummary, setImportSummary] = useState<{ parsedCount: number; errors: string[] } | null>(null);

  // Unique list of grades in this school
  const allGrades = useMemo(() => {
    const list = Array.from(new Set(students.map((s) => s.grade))).sort();
    return list.length > 0 ? list : ['I', 'II', 'III', 'IV', 'V', 'VI'];
  }, [students]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.fatherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.motherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.parentPhone.includes(searchQuery);

      const matchGrade = gradeFilter === 'SEMUA' || s.grade === gradeFilter;
      const matchStatus = statusFilter === 'SEMUA' || s.status === statusFilter;

      return matchSearch && matchGrade && matchStatus;
    });
  }, [students, searchQuery, gradeFilter, statusFilter]);

  // Open Form for Adding New Student
  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      nis: `NIS-${Math.floor(1000 + Math.random() * 9000)}`,
      grade: allGrades[0] || 'I',
      fatherName: '',
      motherName: '',
      parentPhone: '08',
      address: 'Desa Legokjawa, Cimerak',
      status: 'Aktif',
    });
    setIsInputModalOpen(true);
  };

  // Open Form for Editing Student
  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      nis: student.nis,
      grade: student.grade,
      fatherName: student.fatherName,
      motherName: student.motherName,
      parentPhone: student.parentPhone,
      address: student.address,
      status: student.status,
    });
    setIsInputModalOpen(true);
  };

  // Handle Save Student
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama siswa wajib diisi!');
      return;
    }

    if (editingStudent) {
      updateStudent({
        ...editingStudent,
        ...formData,
      });
    } else {
      addStudent({
        schoolId: currentSchool.id,
        ...formData,
      });
    }

    setIsInputModalOpen(false);
  };

  // Handle Delete Student
  const handleDeleteStudent = (student: Student) => {
    if (
      confirm(
        `Yakin ingin menghapus ${student.name} (${student.grade})? Semua data tagihan siswa ini akan ikut terhapus.`
      )
    ) {
      deleteStudent(student.id);
    }
  };

  // Handle Process Excel Import
  const handleProcessImport = () => {
    if (!excelText.trim()) {
      alert('Silakan tempel data dari Excel terlebih dahulu!');
      return;
    }

    const { parsed, errors } = parseExcelStudentImport(excelText, currentSchool.id);

    if (parsed.length > 0) {
      const count = importStudents(parsed);
      setImportSummary({
        parsedCount: count,
        errors,
      });
      setExcelText('');
    } else {
      alert('Tidak ada data siswa yang valid ditemukan. Periksa format teks tempelan Anda.');
    }
  };

  // Invoices for a selected student in view modal
  const selectedStudentInvoices = useMemo(() => {
    if (!viewingStudentInvoices) return [];
    return invoices.filter((i) => i.studentId === viewingStudentInvoices.id);
  }, [viewingStudentInvoices, invoices]);

  const totalStudentBilled = selectedStudentInvoices.reduce((s, i) => s + i.amount, 0);
  const totalStudentPaid = selectedStudentInvoices.reduce((s, i) => s + i.paidAmount, 0);
  const totalStudentUnpaid = Math.max(0, totalStudentBilled - totalStudentPaid);

  return (
    <div className="space-y-5">
      {/* Page Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Data Siswa & Wali Murid
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {currentSchool.name} • Total {filteredStudents.length} dari {students.length} siswa
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Import Excel Button */}
          <button
            onClick={() => {
              setImportSummary(null);
              setIsImportModalOpen(true);
            }}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm flex items-center transition cursor-pointer"
          >
            <Upload className="w-4 h-4 mr-1.5 text-slate-600" />
            <span>Import Siswa (Excel)</span>
          </button>

          {/* Add Student Button */}
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            <span>+ Input Siswa Baru</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, NIS, orang tua, no WA..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center space-x-1 shrink-0 text-xs text-slate-500 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Kelas:</span>
          </div>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="SEMUA">Semua Kelas</option>
            {allGrades.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <div className="flex items-center space-x-1 shrink-0 text-xs text-slate-500 ml-2 mr-1">
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="SEMUA">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Pindah">Pindah</option>
            <option value="Lulus">Lulus</option>
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Nama Siswa / NIS</th>
                <th className="py-3 px-3">Kelas</th>
                <th className="py-3 px-4">Orang Tua / Wali</th>
                <th className="py-3 px-4">No. WhatsApp Wali</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((std, idx) => {
                  const studentInvoices = invoices.filter((i) => i.studentId === std.id);
                  const hasUnpaid = studentInvoices.some(
                    (i) => i.status === 'BELUM LUNAS' || i.status === 'SEBAGIAN'
                  );

                  return (
                    <tr key={std.id} className="hover:bg-slate-50/80 transition group">
                      <td className="py-3 px-4 text-slate-400 font-mono text-xs">{idx + 1}</td>

                      {/* Name & NIS */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition">
                          {std.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">NIS: {std.nis}</div>
                      </td>

                      {/* Grade */}
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200">
                          {std.grade}
                        </span>
                      </td>

                      {/* Parent */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">
                          {std.fatherName || std.motherName || '-'}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {std.address}
                        </div>
                      </td>

                      {/* Phone WA */}
                      <td className="py-3 px-4 font-mono">
                        <a
                          href={createWhatsAppUrl(
                            std.parentPhone,
                            `Assalamualaikum Wr. Wb. Bapak/Ibu Wali dari ${std.name} (${std.grade}). Ini informasi dari Bendahara ${currentSchool.name}.`
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-emerald-700 hover:text-emerald-900 font-medium hover:underline"
                          title="Klik untuk chat WhatsApp"
                        >
                          <Phone className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          <span>{std.parentPhone}</span>
                        </a>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            std.status === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800'
                              : std.status === 'Lulus'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {std.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-1">
                        {/* Lihat Tagihan */}
                        <button
                          onClick={() => setViewingStudentInvoices(std)}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold inline-flex items-center transition ${
                            hasUnpaid
                              ? 'bg-red-50 text-red-700 hover:bg-red-100'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                          title="Lihat Rincian Tagihan & Tunggakan"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1" />
                          <span>Tagihan</span>
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(std)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                          title="Edit Siswa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteStudent(std)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    Tidak ditemukan data siswa yang cocok dengan pencarian atau filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Input / Edit Siswa */}
      {isInputModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">
                {editingStudent ? 'Edit Data Siswa' : 'Input Siswa Baru'}
              </h3>
              <button
                onClick={() => setIsInputModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap Siswa / Santri *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Muhammad Al-Fatih"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIS *</label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas *</label>
                  <input
                    type="text"
                    required
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="I, II, A, B, dll"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Siswa</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as StudentStatus })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Pindah">Pindah</option>
                    <option value="Lulus">Lulus</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Ayah</label>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    placeholder="Bpk. Hendra"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Ibu / Wali</label>
                  <input
                    type="text"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    placeholder="Ibu Siti"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp Orang Tua (Format: 08xx / 628xx) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  placeholder="081234567890"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Nomor ini wajib diisi valid untuk pengiriman link notifikasi tagihan via WA.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Contoh: Legokjawa, Cimerak"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsInputModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  {editingStudent ? 'Perbarui Data' : 'Simpan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Import Siswa dari Excel */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-800">
                  Import Siswa Sekaligus (Tempel dari Excel)
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs text-emerald-900 space-y-1">
                <p className="font-bold">📋 Petunjuk Format Salin Tempel:</p>
                <p>
                  Salin kolom dari Microsoft Excel atau Google Sheets, lalu tempel di kotak bawah.
                </p>
                <p className="font-mono bg-white/80 p-2 rounded border border-emerald-200 text-[11px] text-slate-800">
                  Nama Siswa | Kelas | Nama Orang Tua | No WhatsApp
                </p>
                <p className="text-[11px] text-emerald-700">
                  *Pemisah bisa menggunakan garis tegak (|), tab (langsung copy dari tabel Excel), titik koma (;), atau koma (,).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tempel Teks dari Excel di Sini:
                </label>
                <textarea
                  rows={6}
                  value={excelText}
                  onChange={(e) => setExcelText(e.target.value)}
                  placeholder={`Contoh:\nAhmad Albar | Kelas I | Bpk. Syarif | 081234567891\nNur Fatimah | Kelas I | Ibu Halimah | 081234567892\nZaki Mubarok | Kelas II | Bpk. Usman | 082198765431`}
                  className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Sample Data Fast Paste */}
              <button
                type="button"
                onClick={() => {
                  setExcelText(
                    `Fikri Ramadhan | Kelas I | Bpk. Hasan | 081234569001\nSalwa Zahira | Kelas I | Ibu Nina | 081234569002\nAdnan Karim | Kelas II | Bpk. Ridwan | 081234569003\nQonita Bilqis | Kelas II | Ibu Dewi | 081234569004`
                  );
                }}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline"
              >
                + Gunakan Contoh Teks Simulasi (4 Siswa)
              </button>

              {importSummary && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-emerald-700 flex items-center">
                    <Check className="w-4 h-4 mr-1" /> Berhasil mengimpor {importSummary.parsedCount} siswa baru!
                  </p>
                  {importSummary.errors.length > 0 && (
                    <div className="text-amber-700">
                      <p className="font-semibold">Peringatan baris:</p>
                      {importSummary.errors.map((err, i) => (
                        <p key={i} className="text-[11px]">• {err}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleProcessImport}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center"
                >
                  <Check className="w-4 h-4 mr-1.5" /> Proses Import Siswa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Lihat Rincian Tagihan Siswa */}
      {viewingStudentInvoices && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Status Tagihan: {viewingStudentInvoices.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Kelas {viewingStudentInvoices.grade} • NIS: {viewingStudentInvoices.nis} • Wali: {viewingStudentInvoices.fatherName || viewingStudentInvoices.motherName}
                </p>
              </div>
              <button
                onClick={() => setViewingStudentInvoices(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Financial Summary */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Tagihan</div>
                  <div className="text-sm font-bold font-mono text-slate-800">
                    {formatRupiah(totalStudentBilled)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Sudah Dibayar</div>
                  <div className="text-sm font-bold font-mono text-emerald-700">
                    {formatRupiah(totalStudentPaid)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Sisa Tunggakan</div>
                  <div className="text-sm font-bold font-mono text-red-600">
                    {formatRupiah(totalStudentUnpaid)}
                  </div>
                </div>
              </div>

              {/* Table of Invoices */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Nama Tagihan</th>
                      <th className="py-2.5 px-3">Jatuh Tempo</th>
                      <th className="py-2.5 px-3 text-right">Tagihan</th>
                      <th className="py-2.5 px-3 text-right">Dibayar</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedStudentInvoices.length > 0 ? (
                      selectedStudentInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{inv.feeName}</td>
                          <td className="py-2.5 px-3 text-slate-500">{inv.dueDate}</td>
                          <td className="py-2.5 px-3 text-right font-mono">{formatRupiah(inv.amount)}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-emerald-700">
                            {formatRupiah(inv.paidAmount)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                inv.status === 'LUNAS'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : inv.status === 'SEBAGIAN'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-400">
                          Belum ada data tagihan untuk siswa ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons inside Drawer */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const std = viewingStudentInvoices;
                    setViewingStudentInvoices(null);
                    if (onSelectStudentForNotification) {
                      onSelectStudentForNotification(std.id);
                    } else if (setActiveTab) {
                      setActiveTab('notifications');
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs flex items-center justify-center"
                >
                  <Phone className="w-3.5 h-3.5 mr-1.5" /> Kirim Tagihan via WA ke Siswa Ini
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const std = viewingStudentInvoices;
                    setViewingStudentInvoices(null);
                    if (onSelectStudentForPayment) {
                      onSelectStudentForPayment(std.id);
                    } else if (setActiveTab) {
                      setActiveTab('payments');
                    }
                  }}
                  className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  💰 Buka Menu Pembayaran Siswa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
