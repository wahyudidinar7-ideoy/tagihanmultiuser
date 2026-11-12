import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  School,
  Student,
  FeeMaster,
  Invoice,
  Payment,
  NotificationLog,
  PaymentMethod,
} from '../types';
import { generateInitialData } from '../utils/seedData';
import { getCurrentDateYMD } from '../utils/helpers';

const STORAGE_KEY = 'notif_keuangan_multi_sekolah_v2';
const AUTH_KEY = 'notif_keuangan_auth_session';

interface AppContextType {
  // Schools
  schools: School[];
  currentSchool: School;
  currentSchoolId: string;
  setCurrentSchoolId: (id: string) => void;
  addSchool: (school: Omit<School, 'id'>) => string;
  updateSchool: (school: School) => void;
  deleteSchool: (id: string) => void;

  // Students (scoped to current school)
  students: Student[];
  allStudents: Student[];
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>) => string;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  importStudents: (studentsList: Omit<Student, 'id' | 'createdAt'>[]) => number;

  // Master Fees (scoped to current school)
  feeMasters: FeeMaster[];
  addFeeMaster: (fee: Omit<FeeMaster, 'id'>) => string;
  updateFeeMaster: (fee: FeeMaster) => void;
  quickUpdateFeeAmount: (id: string, newAmount: number) => void;
  deleteFeeMaster: (id: string) => void;

  // Invoices (scoped to current school)
  invoices: Invoice[];
  allInvoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'paidAmount' | 'status'>) => string;
  generateBatchInvoices: (
    feeMasterId: string,
    periodMonthYear: string,
    dueDate: string,
    targetGrade?: string
  ) => { createdCount: number; skippedCount: number };
  deleteInvoice: (id: string) => void;

  // Payments (scoped to current school)
  payments: Payment[];
  allPayments: Payment[];
  recordPayment: (params: {
    studentId: string;
    invoiceIds: string[];
    amount: number;
    method: PaymentMethod;
    receiverName?: string;
    notes?: string;
    paymentDate?: string;
  }) => Payment;
  deletePayment: (paymentId: string) => void;

  // Notification Logs (scoped to current school)
  notificationLogs: NotificationLog[];
  addNotificationLog: (log: Omit<NotificationLog, 'id' | 'sentAt'>) => void;

  // Auth / Role
  isTreasurerLoggedIn: boolean;
  loginTreasurer: (password: string) => boolean;
  logoutTreasurer: () => void;

  // Global utilities
  resetData: () => void;
  exportBackupJson: () => string;
  importBackupJson: (jsonData: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial data from localStorage or seed
  const [schools, setSchools] = useState<School[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_schools`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    const seed = generateInitialData();
    return seed.schools;
  });

  const [currentSchoolId, setCurrentSchoolId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_currSchoolId`);
    if (saved && schools.some((s) => s.id === saved)) return saved;
    return schools[0]?.id || 'sch-1';
  });

  const [students, setAllStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return generateInitialData().students;
  });

  const [feeMasters, setFeeMasters] = useState<FeeMaster[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_feeMasters`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return generateInitialData().feeMasters;
  });

  const [invoices, setAllInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_invoices`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return generateInitialData().invoices;
  });

  const [payments, setAllPayments] = useState<Payment[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_payments`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return generateInitialData().payments;
  });

  const [notificationLogs, setAllNotificationLogs] = useState<NotificationLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_notifLogs`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return generateInitialData().notificationLogs;
  });

  const [isTreasurerLoggedIn, setIsTreasurerLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_schools`, JSON.stringify(schools));
  }, [schools]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_currSchoolId`, currentSchoolId);
  }, [currentSchoolId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_feeMasters`, JSON.stringify(feeMasters));
  }, [feeMasters]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifLogs`, JSON.stringify(notificationLogs));
  }, [notificationLogs]);

  // Current School object
  const currentSchool = useMemo(() => {
    const found = schools.find((s) => s.id === currentSchoolId);
    if (found) return found;
    return schools[0] || {
      id: 'sch-1',
      name: 'Sekolah Aktif',
      level: 'SD' as const,
      address: 'Legokjawa, Cimerak',
      headmaster: 'Kepala Sekolah',
      treasurer: 'Bendahara Sekolah',
      treasurerPhone: '081234567890',
      bankName: 'BRI',
      bankAccount: '123456789',
      bankHolder: 'Sekolah',
      initial: 'SA',
      logoBgColor: '#059669',
    };
  }, [schools, currentSchoolId]);

  // Scoped lists
  const currentStudents = useMemo(() => {
    return students.filter((s) => s.schoolId === currentSchoolId);
  }, [students, currentSchoolId]);

  const currentFeeMasters = useMemo(() => {
    return feeMasters.filter((f) => f.schoolId === currentSchoolId);
  }, [feeMasters, currentSchoolId]);

  const currentInvoices = useMemo(() => {
    return invoices.filter((i) => i.schoolId === currentSchoolId);
  }, [invoices, currentSchoolId]);

  const currentPayments = useMemo(() => {
    return payments.filter((p) => p.schoolId === currentSchoolId);
  }, [payments, currentSchoolId]);

  const currentNotifLogs = useMemo(() => {
    return notificationLogs.filter((n) => n.schoolId === currentSchoolId);
  }, [notificationLogs, currentSchoolId]);

  // School actions
  const addSchool = (schoolData: Omit<School, 'id'>) => {
    const newId = `sch-${Date.now()}`;
    const newSchool: School = {
      ...schoolData,
      id: newId,
    };
    setSchools((prev) => [...prev, newSchool]);

    // Also create 3 standard default master fees for this new school
    const defaultFees: FeeMaster[] = [
      {
        id: `fee-${newId}-1`,
        schoolId: newId,
        name: 'SPP Bulanan',
        amount: 50000,
        period: 'Bulanan',
        dueDayOrDate: 'Tiap tanggal 10',
        description: 'Iuran rutin pembelajaran bulanan',
      },
      {
        id: `fee-${newId}-2`,
        schoolId: newId,
        name: 'Uang Buku / LKPD',
        amount: 75000,
        period: 'Semester',
        dueDayOrDate: 'Awal Semester',
        description: 'Buku pegangan siswa per semester',
      },
      {
        id: `fee-${newId}-3`,
        schoolId: newId,
        name: 'Infaq Pembangunan',
        amount: 25000,
        period: 'Bulanan',
        dueDayOrDate: 'Tiap tanggal 10',
        description: 'Infaq perawatan fasilitas',
      },
    ];
    setFeeMasters((prev) => [...prev, ...defaultFees]);
    setCurrentSchoolId(newId);
    return newId;
  };

  const updateSchool = (school: School) => {
    setSchools((prev) => prev.map((s) => (s.id === school.id ? school : s)));
  };

  const deleteSchool = (id: string) => {
    if (schools.length <= 1) {
      alert('Tidak bisa menghapus sekolah terakhir!');
      return;
    }
    const remaining = schools.filter((s) => s.id !== id);
    setSchools(remaining);
    // Cleanup related data
    setAllStudents((prev) => prev.filter((s) => s.schoolId !== id));
    setFeeMasters((prev) => prev.filter((f) => f.schoolId !== id));
    setAllInvoices((prev) => prev.filter((i) => i.schoolId !== id));
    setAllPayments((prev) => prev.filter((p) => p.schoolId !== id));
    setAllNotificationLogs((prev) => prev.filter((n) => n.schoolId !== id));
    setCurrentSchoolId(remaining[0].id);
  };

  // Student actions
  const addStudent = (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    const newId = `std-${Date.now()}`;
    const newStudent: Student = {
      ...studentData,
      id: newId,
      createdAt: getCurrentDateYMD(),
    };
    setAllStudents((prev) => [...prev, newStudent]);
    return newId;
  };

  const updateStudent = (student: Student) => {
    setAllStudents((prev) => prev.map((s) => (s.id === student.id ? student : s)));
  };

  const deleteStudent = (id: string) => {
    setAllStudents((prev) => prev.filter((s) => s.id !== id));
    setAllInvoices((prev) => prev.filter((i) => i.studentId !== id));
    setAllPayments((prev) => prev.filter((p) => p.studentId !== id));
    setAllNotificationLogs((prev) => prev.filter((n) => n.studentId !== id));
  };

  const importStudents = (studentsList: Omit<Student, 'id' | 'createdAt'>[]) => {
    const today = getCurrentDateYMD();
    const newStudents: Student[] = studentsList.map((item, index) => ({
      ...item,
      id: `std-imp-${Date.now()}-${index}`,
      createdAt: today,
    }));
    setAllStudents((prev) => [...prev, ...newStudents]);
    return newStudents.length;
  };

  // Fee Master actions
  const addFeeMaster = (feeData: Omit<FeeMaster, 'id'>) => {
    const newId = `fee-${Date.now()}`;
    const newFee: FeeMaster = {
      ...feeData,
      id: newId,
    };
    setFeeMasters((prev) => [...prev, newFee]);
    return newId;
  };

  const updateFeeMaster = (fee: FeeMaster) => {
    setFeeMasters((prev) => prev.map((f) => (f.id === fee.id ? fee : f)));
  };

  const quickUpdateFeeAmount = (id: string, newAmount: number) => {
    setFeeMasters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, amount: newAmount } : f))
    );
  };

  const deleteFeeMaster = (id: string) => {
    setFeeMasters((prev) => prev.filter((f) => f.id !== id));
  };

  // Invoices actions
  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'paidAmount' | 'status'>) => {
    const newId = `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newInvoice: Invoice = {
      ...invoiceData,
      id: newId,
      paidAmount: 0,
      status: 'BELUM LUNAS',
      createdAt: getCurrentDateYMD(),
    };
    setAllInvoices((prev) => [newInvoice, ...prev]);
    return newId;
  };

  const generateBatchInvoices = (
    feeMasterId: string,
    periodMonthYear: string,
    dueDate: string,
    targetGrade?: string
  ) => {
    const fee = feeMasters.find((f) => f.id === feeMasterId);
    if (!fee) return { createdCount: 0, skippedCount: 0 };

    const targetStudents = currentStudents.filter((s) => {
      if (s.status !== 'Aktif') return false;
      if (targetGrade && targetGrade !== 'SEMUA' && s.grade !== targetGrade) return false;
      return true;
    });

    let createdCount = 0;
    let skippedCount = 0;
    const newInvoices: Invoice[] = [];
    const today = getCurrentDateYMD();

    targetStudents.forEach((std) => {
      // Check if duplicate invoice already exists for same fee & period
      const exists = invoices.some(
        (inv) =>
          inv.studentId === std.id &&
          inv.feeMasterId === feeMasterId &&
          inv.periodMonthYear === periodMonthYear
      );

      if (exists) {
        skippedCount++;
      } else {
        newInvoices.push({
          id: `inv-gen-${Date.now()}-${std.id}`,
          schoolId: currentSchoolId,
          studentId: std.id,
          feeMasterId: feeMasterId,
          feeName: `${fee.name} (${periodMonthYear})`,
          periodMonthYear,
          amount: fee.amount,
          paidAmount: 0,
          dueDate,
          status: 'BELUM LUNAS',
          createdAt: today,
        });
        createdCount++;
      }
    });

    if (newInvoices.length > 0) {
      setAllInvoices((prev) => [...newInvoices, ...prev]);
    }

    return { createdCount, skippedCount };
  };

  const deleteInvoice = (id: string) => {
    setAllInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  // Payments actions
  const recordPayment = ({
    studentId,
    invoiceIds,
    amount,
    method,
    receiverName,
    notes,
    paymentDate,
  }: {
    studentId: string;
    invoiceIds: string[];
    amount: number;
    method: PaymentMethod;
    receiverName?: string;
    notes?: string;
    paymentDate?: string;
  }) => {
    const today = paymentDate || getCurrentDateYMD();
    const student = students.find((s) => s.id === studentId);
    const sch = currentSchool;

    // Generate receipt number
    const count = payments.length + 1;
    const now = new Date();
    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const rMonth = romanMonths[now.getMonth()];
    const receiptNo = `KWT/${now.getFullYear()}/${rMonth}/${String(count).padStart(3, '0')}`;

    let remainingMoneyToAllocate = amount;
    const paymentDetails: Payment['details'] = [];

    // Update targeted invoices
    setAllInvoices((prev) => {
      return prev.map((inv) => {
        if (!invoiceIds.includes(inv.id)) return inv;
        if (remainingMoneyToAllocate <= 0) return inv;

        const unpaid = inv.amount - inv.paidAmount;
        if (unpaid <= 0) return inv;

        const allocation = Math.min(remainingMoneyToAllocate, unpaid);
        remainingMoneyToAllocate -= allocation;

        paymentDetails.push({
          invoiceId: inv.id,
          feeName: inv.feeName,
          period: inv.periodMonthYear,
          amountPaid: allocation,
        });

        const newPaidAmount = inv.paidAmount + allocation;
        const newStatus =
          newPaidAmount >= inv.amount ? 'LUNAS' : newPaidAmount > 0 ? 'SEBAGIAN' : 'BELUM LUNAS';

        return {
          ...inv,
          paidAmount: newPaidAmount,
          status: newStatus,
        };
      });
    });

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      schoolId: currentSchoolId,
      studentId,
      receiptNumber: receiptNo,
      paymentDate: today,
      amount,
      method,
      receiverName: receiverName || sch.treasurer,
      notes: notes || `Pembayaran oleh ${student?.fatherName || student?.motherName || 'Wali Murid'}`,
      details: paymentDetails,
      createdAt: `${today} ${new Date().toLocaleTimeString('id-ID')}`,
    };

    setAllPayments((prev) => [newPayment, ...prev]);
    return newPayment;
  };

  const deletePayment = (paymentId: string) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return;

    // Rollback invoice allocations
    if (payment.details && payment.details.length > 0) {
      setAllInvoices((prev) => {
        return prev.map((inv) => {
          const detail = payment.details.find((d) => d.invoiceId === inv.id);
          if (!detail) return inv;
          const restoredPaid = Math.max(0, inv.paidAmount - detail.amountPaid);
          const restoredStatus =
            restoredPaid >= inv.amount ? 'LUNAS' : restoredPaid > 0 ? 'SEBAGIAN' : 'BELUM LUNAS';
          return {
            ...inv,
            paidAmount: restoredPaid,
            status: restoredStatus,
          };
        });
      });
    }

    setAllPayments((prev) => prev.filter((p) => p.id !== paymentId));
  };

  // Notification logs
  const addNotificationLog = (logData: Omit<NotificationLog, 'id' | 'sentAt'>) => {
    const now = new Date();
    const timeStr = `${getCurrentDateYMD()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newLog: NotificationLog = {
      ...logData,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sentAt: timeStr,
    };
    setAllNotificationLogs((prev) => [newLog, ...prev]);
  };

  // Treasurer Auth
  const loginTreasurer = (password: string) => {
    if (password === 'bendahara123') {
      setIsTreasurerLoggedIn(true);
      localStorage.setItem(AUTH_KEY, 'true');
      return true;
    }
    return false;
  };

  const logoutTreasurer = () => {
    setIsTreasurerLoggedIn(false);
    localStorage.removeItem(AUTH_KEY);
  };

  // Reset and Backup
  const resetData = () => {
    localStorage.clear();
    const initial = generateInitialData();
    setSchools(initial.schools);
    setCurrentSchoolId(initial.schools[0].id);
    setAllStudents(initial.students);
    setFeeMasters(initial.feeMasters);
    setAllInvoices(initial.invoices);
    setAllPayments(initial.payments);
    setAllNotificationLogs(initial.notificationLogs);
  };

  const exportBackupJson = () => {
    const backup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      schools,
      students,
      feeMasters,
      invoices,
      payments,
      notificationLogs,
    };
    return JSON.stringify(backup, null, 2);
  };

  const importBackupJson = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.schools && parsed.students) {
        setSchools(parsed.schools);
        if (parsed.schools[0]?.id) {
          setCurrentSchoolId(parsed.schools[0].id);
        }
        if (parsed.students) setAllStudents(parsed.students);
        if (parsed.feeMasters) setFeeMasters(parsed.feeMasters);
        if (parsed.invoices) setAllInvoices(parsed.invoices);
        if (parsed.payments) setAllPayments(parsed.payments);
        if (parsed.notificationLogs) setAllNotificationLogs(parsed.notificationLogs);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        schools,
        currentSchool,
        currentSchoolId,
        setCurrentSchoolId,
        addSchool,
        updateSchool,
        deleteSchool,
        students: currentStudents,
        allStudents: students,
        addStudent,
        updateStudent,
        deleteStudent,
        importStudents,
        feeMasters: currentFeeMasters,
        addFeeMaster,
        updateFeeMaster,
        quickUpdateFeeAmount,
        deleteFeeMaster,
        invoices: currentInvoices,
        allInvoices: invoices,
        addInvoice,
        generateBatchInvoices,
        deleteInvoice,
        payments: currentPayments,
        allPayments: payments,
        recordPayment,
        deletePayment,
        notificationLogs: currentNotifLogs,
        addNotificationLog,
        isTreasurerLoggedIn,
        loginTreasurer,
        logoutTreasurer,
        resetData,
        exportBackupJson,
        importBackupJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
