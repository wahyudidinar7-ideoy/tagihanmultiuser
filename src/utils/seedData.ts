import { School, Student, FeeMaster, Invoice, Payment, NotificationLog } from '../types';

export const INITIAL_SCHOOLS: School[] = [
  {
    id: 'sch-1',
    name: 'DTU Al Hidayah - Legokjawa',
    level: 'DTU/MDT Ula',
    address: 'Jl. Lapang Legokjawa No. 15, Kec. Cimerak, Kab. Pangandaran',
    headmaster: 'K.H. Mansyur Hidayat, S.Pd.I',
    treasurer: 'Ustadzah Siti Rohmah, S.Pd',
    treasurerPhone: '081234567890',
    bankName: 'BRI',
    bankAccount: '4012-01-009876-53-1',
    bankHolder: 'DTU Al Hidayah Legokjawa',
    initial: 'AH',
    logoBgColor: '#059669',
  },
  {
    id: 'sch-2',
    name: 'TK PGRI Putra Harapan - Legokjawa',
    level: 'TK',
    address: 'Blok Lapang Desa Legokjawa RT 04/02, Kec. Cimerak',
    headmaster: 'Hj. Nani Suryani, M.Pd',
    treasurer: 'Ibu Ratna Komalasari',
    treasurerPhone: '082198765432',
    bankName: 'Bank BJB',
    bankAccount: '0019283746501',
    bankHolder: 'TK PGRI Putra Harapan',
    initial: 'PH',
    logoBgColor: '#2563eb',
  },
  {
    id: 'sch-3',
    name: 'MDT Al Hidayah Wustha',
    level: 'MDT Wustha',
    address: 'Kompleks Ponpes Al Hidayah, Desa Legokjawa, Cimerak',
    headmaster: 'Ustadz M. Fauzi, M.Ag',
    treasurer: 'Ustadz Ahmad Fathoni, S.E',
    treasurerPhone: '085234567891',
    bankName: 'Bank Syariah Indonesia (BSI)',
    bankAccount: '7145239810',
    bankHolder: 'MDT Al Hidayah Wustha',
    initial: 'HW',
    logoBgColor: '#7c3aed',
  },
];

export function generateInitialData() {
  const schools = [...INITIAL_SCHOOLS];
  const feeMasters: FeeMaster[] = [];
  const students: Student[] = [];
  const invoices: Invoice[] = [];
  const payments: Payment[] = [];
  const notificationLogs: NotificationLog[] = [];

  // 1. Fee Masters for each school
  schools.forEach((sch) => {
    const isTk = sch.level === 'TK';
    const isWustha = sch.level === 'MDT Wustha';

    const baseFees = [
      {
        id: `fee-${sch.id}-1`,
        schoolId: sch.id,
        name: 'SPP Bulanan',
        amount: isTk ? 60000 : isWustha ? 75000 : 50000,
        period: 'Bulanan' as const,
        dueDayOrDate: 'Tiap tanggal 10',
        description: 'Iuran rutin operasional pembelajaran bulanan',
      },
      {
        id: `fee-${sch.id}-2`,
        schoolId: sch.id,
        name: isTk ? 'Majalah & Bahan Ajar TK' : 'Uang Buku / LKPD',
        amount: 75000,
        period: 'Semester' as const,
        dueDayOrDate: 'Awal Semester',
        description: 'Kitab / buku materi pegangan siswa per semester',
      },
      {
        id: `fee-${sch.id}-3`,
        schoolId: sch.id,
        name: isTk ? 'Pentas Seni & Outing Class' : 'Uang Kegiatan / P5',
        amount: 100000,
        period: 'Semester' as const,
        dueDayOrDate: 'Pertengahan Semester',
        description: 'Kegiatan luar kelas, rihlah santri, dan peringatan hari besar',
      },
      {
        id: `fee-${sch.id}-4`,
        schoolId: sch.id,
        name: 'Uang Seragam',
        amount: 150000,
        period: 'Sekali Bayar' as const,
        dueDayOrDate: 'Saat Masuk',
        description: 'Satu stel seragam batik madrasah / olahraga',
      },
      {
        id: `fee-${sch.id}-5`,
        schoolId: sch.id,
        name: 'Infaq Pembangunan',
        amount: 25000,
        period: 'Bulanan' as const,
        dueDayOrDate: 'Tiap tanggal 10',
        description: 'Pemeliharaan sarana kelas dan tempat wudhu santri',
      },
    ];
    feeMasters.push(...baseFees);
  });

  // 2. Students per school (10 each)
  const namesSchool1 = [
    { name: 'Muhammad Al-Fatih', grade: 'I', father: 'Bpk. Hendra Gunawan', mother: 'Ibu Eni S.', phone: '081223456001' },
    { name: 'Aisyah Putri Azzahra', grade: 'I', father: 'Bpk. Dedi Supardi', mother: 'Ibu Yulianingsih', phone: '081223456002' },
    { name: 'Ahmad Bilal Al-Habib', grade: 'II', father: 'Bpk. Rudi Hartono', mother: 'Ibu Nuraeni', phone: '081223456003' },
    { name: 'Fatimah Zahra', grade: 'II', father: 'Bpk. Ade Kurnia', mother: 'Ibu Siti Aminah', phone: '081223456004' },
    { name: 'Rizky Ramadhan', grade: 'III', father: 'Bpk. Wawan Hermawan', mother: 'Ibu Ida Farida', phone: '081223456005' },
    { name: 'Nabila Syakira', grade: 'III', father: 'Bpk. Agus Santoso', mother: 'Ibu Maryati', phone: '081223456006' },
    { name: 'Farhan Maulana', grade: 'IV', father: 'Bpk. Teten Sutisna', mother: 'Ibu Elis Rohani', phone: '081223456007' },
    { name: 'Zaskia Nurul Izzah', grade: 'IV', father: 'Bpk. Cecep Hidayat', mother: 'Ibu Rina Marlina', phone: '081223456008' },
    { name: 'Ilyas Pratama', grade: 'II', father: 'Bpk. Jajang Sujana', mother: 'Ibu Wiwin Winarti', phone: '081223456009' },
    { name: 'Salma Salsabila', grade: 'I', father: 'Bpk. Dudung Abdullah', mother: 'Ibu Komariah', phone: '081223456010' },
  ];

  const namesSchool2 = [
    { name: 'Kenzo Alfarizqy', grade: 'Kelas A', father: 'Bpk. Andri Permana', mother: 'Ibu Anita', phone: '082134567001' },
    { name: 'Mikayla Adiba', grade: 'Kelas A', father: 'Bpk. Deni Saputra', mother: 'Ibu Maya', phone: '082134567002' },
    { name: 'Arka Danendra', grade: 'Kelas A', father: 'Bpk. Yudi K.', mother: 'Ibu Lina Marlina', phone: '082134567003' },
    { name: 'Kirana Callysta', grade: 'Kelas B', father: 'Bpk. Eko Prasetyo', mother: 'Ibu Dian', phone: '082134567004' },
    { name: 'Rafa Azka Malik', grade: 'Kelas B', father: 'Bpk. Sugeng W.', mother: 'Ibu Siska', phone: '082134567005' },
    { name: 'Naura Humaira', grade: 'Kelas B', father: 'Bpk. Heri Siswanto', mother: 'Ibu Fitri', phone: '082134567006' },
    { name: 'Gibran Rakabumi', grade: 'Kelas A', father: 'Bpk. Bambang Irawan', mother: 'Ibu Ratna', phone: '082134567007' },
    { name: 'Alula Farzana', grade: 'Kelas A', father: 'Bpk. Rahmat Hidayat', mother: 'Ibu Yeti', phone: '082134567008' },
    { name: 'Zidane Al-Ghifari', grade: 'Kelas B', father: 'Bpk. Kuswara', mother: 'Ibu Nunung', phone: '082134567009' },
    { name: 'Khalisa Putri', grade: 'Kelas B', father: 'Bpk. Dodi Sudrajat', mother: 'Ibu Imas', phone: '082134567010' },
  ];

  const namesSchool3 = [
    { name: 'Syamil Basayev', grade: 'Kelas VII', father: 'Bpk. H. Sukirman', mother: 'Ibu Hj. Rosita', phone: '085234568001' },
    { name: 'Nurul Hidayati', grade: 'Kelas VII', father: 'Bpk. Rohmat', mother: 'Ibu Tarwiyah', phone: '085234568002' },
    { name: 'Wildan Mukhollad', grade: 'Kelas VII', father: 'Bpk. H. Zaenal', mother: 'Ibu Siti Munawaroh', phone: '085234568003' },
    { name: 'Hafizhah Khairunnisa', grade: 'Kelas VIII', father: 'Bpk. Lukman Hakim', mother: 'Ibu Sri Wahyuni', phone: '085234568004' },
    { name: 'Rian Maulana Yusuf', grade: 'Kelas VIII', father: 'Bpk. Mulyadi', mother: 'Ibu Cucu Hayati', phone: '085234568005' },
    { name: 'Dhiyaul Haq', grade: 'Kelas VIII', father: 'Bpk. K.H. Syamsul', mother: 'Ibu Umi Kulsum', phone: '085234568006' },
    { name: 'Anisa Rahmawati', grade: 'Kelas IX', father: 'Bpk. Dadang Kusnadi', mother: 'Ibu Lilis', phone: '085234568007' },
    { name: 'Fikri Haikal', grade: 'Kelas IX', father: 'Bpk. Omon Sutarman', mother: 'Ibu Casmini', phone: '085234568008' },
    { name: 'Zulfa Zakiyah', grade: 'Kelas IX', father: 'Bpk. Asep Saepudin', mother: 'Ibu Yayah Rokayah', phone: '085234568009' },
    { name: 'Bagas Aditya', grade: 'Kelas VII', father: 'Bpk. Agus Salim', mother: 'Ibu Eha Julaeha', phone: '085234568010' },
  ];

  const studentSources = [
    { schId: 'sch-1', list: namesSchool1, prefix: 'DTU' },
    { schId: 'sch-2', list: namesSchool2, prefix: 'TKP' },
    { schId: 'sch-3', list: namesSchool3, prefix: 'WST' },
  ];

  studentSources.forEach(({ schId, list, prefix }) => {
    list.forEach((item, idx) => {
      const studentId = `std-${schId}-${idx + 1}`;
      students.push({
        id: studentId,
        schoolId: schId,
        nis: `${prefix}-2026-${String(idx + 1).padStart(3, '0')}`,
        name: item.name,
        grade: item.grade,
        fatherName: item.father,
        motherName: item.mother,
        parentPhone: item.phone,
        address: 'Desa Legokjawa, Cimerak, Pangandaran',
        status: 'Aktif',
        createdAt: '2026-07-15',
      });
    });
  });

  // 3. Create Sample Invoices and Payments for students
  let kwtCounter = 1;

  students.forEach((std, idx) => {
    const schFees = feeMasters.filter((f) => f.schoolId === std.schoolId);
    const sppFee = schFees.find((f) => f.name.includes('SPP')) || schFees[0];
    const bukuFee = schFees.find((f) => f.name.includes('Buku') || f.name.includes('Bahan')) || schFees[1];
    const infaqFee = schFees.find((f) => f.name.includes('Infaq')) || schFees[4];

    // Status distributions:
    // Students 0, 1, 2, 3: Fully paid SPP Nov, Buku paid
    // Students 4, 5: Partially paid
    // Students 6, 7, 8: Unpaid (Tunggakan)
    // Student 9: Paid everything
    const isFullPaid = [0, 1, 2, 3, 9].includes(idx % 10);
    const isPartial = [4, 5].includes(idx % 10);
    const isUnpaid = [6, 7, 8].includes(idx % 10);

    // Invoice 1: SPP Bulan November 2026
    const inv1Id = `inv-${std.id}-spp-nov`;
    const inv1Amount = sppFee.amount;
    let inv1Paid = 0;
    let inv1Status: 'LUNAS' | 'BELUM LUNAS' | 'SEBAGIAN' = 'BELUM LUNAS';

    if (isFullPaid) {
      inv1Paid = inv1Amount;
      inv1Status = 'LUNAS';
    } else if (isPartial) {
      inv1Paid = Math.floor(inv1Amount / 2);
      inv1Status = 'SEBAGIAN';
    } else {
      inv1Paid = 0;
      inv1Status = 'BELUM LUNAS';
    }

    invoices.push({
      id: inv1Id,
      schoolId: std.schoolId,
      studentId: std.id,
      feeMasterId: sppFee.id,
      feeName: `${sppFee.name} (November 2026)`,
      periodMonthYear: 'November 2026',
      amount: inv1Amount,
      paidAmount: inv1Paid,
      dueDate: '2026-11-10',
      status: inv1Status,
      createdAt: '2026-11-01',
    });

    // Invoice 2: Buku / LKPD Semester Ganjil
    const inv2Id = `inv-${std.id}-buku`;
    const inv2Amount = bukuFee.amount;
    let inv2Paid = 0;
    let inv2Status: 'LUNAS' | 'BELUM LUNAS' | 'SEBAGIAN' = 'BELUM LUNAS';

    if (isFullPaid || isPartial) {
      inv2Paid = inv2Amount;
      inv2Status = 'LUNAS';
    } else {
      inv2Paid = 0;
      inv2Status = 'BELUM LUNAS';
    }

    invoices.push({
      id: inv2Id,
      schoolId: std.schoolId,
      studentId: std.id,
      feeMasterId: bukuFee.id,
      feeName: `${bukuFee.name} (Semester Ganjil 2026/2027)`,
      periodMonthYear: 'Semester Ganjil 2026/2027',
      amount: inv2Amount,
      paidAmount: inv2Paid,
      dueDate: '2026-08-20',
      status: inv2Status,
      createdAt: '2026-08-01',
    });

    // Invoice 3: Infaq Pembangunan November 2026
    const inv3Id = `inv-${std.id}-infaq-nov`;
    const inv3Amount = infaqFee.amount;
    const inv3Paid = isFullPaid ? inv3Amount : 0;
    const inv3Status = isFullPaid ? 'LUNAS' : 'BELUM LUNAS';

    invoices.push({
      id: inv3Id,
      schoolId: std.schoolId,
      studentId: std.id,
      feeMasterId: infaqFee.id,
      feeName: `${infaqFee.name} (November 2026)`,
      periodMonthYear: 'November 2026',
      amount: inv3Amount,
      paidAmount: inv3Paid,
      dueDate: '2026-11-10',
      status: inv3Status,
      createdAt: '2026-11-01',
    });

    // Record sample payment receipt for those who paid
    if (inv1Paid > 0) {
      const sch = schools.find((s) => s.id === std.schoolId)!;
      const kNo = `KWT/2026/XI/${String(kwtCounter++).padStart(3, '0')}`;
      payments.push({
        id: `pay-${std.id}-1`,
        schoolId: std.schoolId,
        studentId: std.id,
        receiptNumber: kNo,
        paymentDate: '2026-11-06',
        amount: inv1Paid,
        method: idx % 2 === 0 ? 'Tunai' : 'Transfer',
        receiverName: sch.treasurer,
        notes: `Pembayaran ${sppFee.name} November 2026`,
        details: [
          {
            invoiceId: inv1Id,
            feeName: `${sppFee.name} (November 2026)`,
            period: 'November 2026',
            amountPaid: inv1Paid,
          },
        ],
        createdAt: '2026-11-06 09:30:00',
      });
    }
  });

  // 4. Sample notification logs
  students.slice(0, 5).forEach((std) => {
    const sch = schools.find((s) => s.id === std.schoolId)!;
    notificationLogs.push({
      id: `notif-${std.id}-1`,
      schoolId: std.schoolId,
      studentId: std.id,
      studentName: std.name,
      grade: std.grade,
      parentPhone: std.parentPhone,
      type: 'Tagihan Baru',
      message: `Assalamualaikum Wr. Wb. Yth. Bapak/Ibu Wali dari Ananda ${std.name} (${std.grade}) ${sch.name}. Kami informasikan tagihan SPP Bulanan sebesar Rp 50.000 jatuh tempo 10 November 2026. Pembayaran dapat melalui Bendahara (${sch.treasurer}) atau transfer ke ${sch.bankName} ${sch.bankAccount} a.n ${sch.bankHolder}. Terima kasih.`,
      sentAt: '2026-11-02 08:15',
      status: 'Sudah Dikirim',
      channel: 'WhatsApp',
    });
  });

  // Add an overdue reminder log
  const overdueStudent = students[6];
  if (overdueStudent) {
    const sch = schools.find((s) => s.id === overdueStudent.schoolId)!;
    notificationLogs.push({
      id: `notif-${overdueStudent.id}-2`,
      schoolId: overdueStudent.schoolId,
      studentId: overdueStudent.id,
      studentName: overdueStudent.name,
      grade: overdueStudent.grade,
      parentPhone: overdueStudent.parentPhone,
      type: 'Tunggakan',
      message: `Assalamualaikum Wr. Wb. Yth. Bapak/Ibu Wali dari Ananda ${overdueStudent.name} (${overdueStudent.grade}) ${sch.name}. Mengingatkan kembali bahwa tagihan SPP & Buku dengan total tunggakan Rp 125.000 telah melewati batas jatuh tempo. Mohon kesediaannya untuk menyelesaikan kewajiban tersebut. Info: ${sch.treasurerPhone} (${sch.treasurer}).`,
      sentAt: '2026-11-11 10:20',
      status: 'Sudah Dikirim',
      channel: 'WhatsApp',
    });
  }

  return {
    schools,
    feeMasters,
    students,
    invoices,
    payments,
    notificationLogs,
  };
}
