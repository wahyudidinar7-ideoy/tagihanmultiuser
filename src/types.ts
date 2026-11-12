export type SchoolLevel = 'TK' | 'DTU/MDT Ula' | 'MDT Wustha' | 'MI' | 'SD' | 'SMP' | 'SMA/SMK';

export interface School {
  id: string;
  name: string;
  level: SchoolLevel;
  address: string;
  headmaster: string;
  treasurer: string;
  treasurerPhone: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  initial: string;
  logoBgColor: string;
}

export type StudentStatus = 'Aktif' | 'Pindah' | 'Lulus';

export interface Student {
  id: string;
  schoolId: string;
  nis: string;
  name: string;
  grade: string;
  fatherName: string;
  motherName: string;
  parentPhone: string;
  address: string;
  status: StudentStatus;
  createdAt: string;
}

export type FeePeriod = 'Bulanan' | 'Semester' | 'Tahunan' | 'Sekali Bayar';

export interface FeeMaster {
  id: string;
  schoolId: string;
  name: string;
  amount: number;
  period: FeePeriod;
  dueDayOrDate: string;
  description: string;
}

export type InvoiceStatus = 'LUNAS' | 'BELUM LUNAS' | 'SEBAGIAN';

export interface Invoice {
  id: string;
  schoolId: string;
  studentId: string;
  feeMasterId: string;
  feeName: string;
  periodMonthYear: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: InvoiceStatus;
  createdAt: string;
}

export type PaymentMethod = 'Tunai' | 'Transfer' | 'QRIS';

export interface PaymentItemDetail {
  invoiceId: string;
  feeName: string;
  period: string;
  amountPaid: number;
}

export interface Payment {
  id: string;
  schoolId: string;
  studentId: string;
  receiptNumber: string;
  paymentDate: string;
  amount: number;
  method: PaymentMethod;
  receiverName: string;
  notes?: string;
  details: PaymentItemDetail[];
  createdAt: string;
}

export type NotificationType =
  | 'Tagihan Baru'
  | 'Pengingat Jatuh Tempo'
  | 'Tunggakan'
  | 'Konfirmasi Pembayaran LUNAS'
  | 'Kwitansi Digital'
  | 'Pengumuman Keuangan Umum';

export interface NotificationLog {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  grade: string;
  parentPhone: string;
  type: NotificationType;
  message: string;
  sentAt: string;
  status: 'Sudah Dikirim' | 'Belum Dikirim';
  channel: 'WhatsApp' | 'Surat Fisik';
}

export interface AppState {
  currentSchoolId: string;
  schools: School[];
  students: Student[];
  feeMasters: FeeMaster[];
  invoices: Invoice[];
  payments: Payment[];
  notificationLogs: NotificationLog[];
  isTreasurerLoggedIn: boolean;
}
