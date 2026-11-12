/**
 * Utility functions for currency, Indonesian dates, Terbilang, WA link generator, and Excel importer.
 */

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  return 'Rp ' + amount.toLocaleString('id-ID');
}

export function cleanNumber(input: string | number): number {
  if (typeof input === 'number') return input;
  const cleaned = input.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

export function formatWaNumber(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('+62')) {
    cleaned = cleaned.replace('+', '');
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

export function createWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = formatWaNumber(phone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function formatDateIndo(dateStr?: string | Date): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export function getCurrentDateYMD(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function terbilang(n: number): string {
  const bilangan = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan',
    'Sepuluh', 'Sebelas'
  ];
  
  const num = Math.floor(Math.abs(n));
  if (num === 0) return 'Nol Rupiah';

  function sebut(x: number): string {
    if (x < 12) return ' ' + bilangan[x];
    if (x < 20) return sebut(x - 10) + ' Belas';
    if (x < 100) return sebut(Math.floor(x / 10)) + ' Puluh' + sebut(x % 10);
    if (x < 200) return ' Seratus' + sebut(x - 100);
    if (x < 1000) return sebut(Math.floor(x / 100)) + ' Ratus' + sebut(x % 100);
    if (x < 2000) return ' Seribu' + sebut(x - 1000);
    if (x < 1000000) return sebut(Math.floor(x / 1000)) + ' Ribu' + sebut(x % 1000);
    if (x < 1000000000) return sebut(Math.floor(x / 1000000)) + ' Juta' + sebut(x % 1000000);
    if (x < 1000000000000) return sebut(Math.floor(x / 1000000000)) + ' Milyar' + sebut(x % 1000000000);
    return '';
  }

  const result = sebut(num).trim() + ' Rupiah';
  return result.replace(/\s+/g, ' ');
}

export function parseExcelStudentImport(rawText: string, defaultSchoolId: string) {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const parsed = [];
  const errors = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // skip header line if present
    if (i === 0 && (line.toLowerCase().includes('nama') && line.toLowerCase().includes('kelas'))) {
      continue;
    }

    // Split by pipe '|', tab '\t', or semicolon ';'
    let parts: string[] = [];
    if (line.includes('|')) {
      parts = line.split('|').map(p => p.trim());
    } else if (line.includes('\t')) {
      parts = line.split('\t').map(p => p.trim());
    } else if (line.includes(';')) {
      parts = line.split(';').map(p => p.trim());
    } else if (line.includes(',')) {
      parts = line.split(',').map(p => p.trim());
    }

    if (parts.length >= 3) {
      const name = parts[0];
      const grade = parts[1];
      const parentName = parts[2];
      const rawPhone = parts[3] || '081234567890';
      const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

      parsed.push({
        name,
        grade,
        fatherName: parentName,
        motherName: parentName,
        parentPhone: cleanPhone.startsWith('0') ? cleanPhone : '0' + cleanPhone,
        address: 'Legokjawa, Cimerak',
        nis: `NIS-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'Aktif' as const,
        schoolId: defaultSchoolId,
      });
    } else if (line.trim().length > 0) {
      errors.push(`Baris ${i + 1} tidak valid: "${line}" (butuh format: Nama | Kelas | Nama Orang Tua | No WA)`);
    }
  }

  return { parsed, errors };
}
