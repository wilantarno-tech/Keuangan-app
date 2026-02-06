import * as XLSX from 'xlsx';
import db from '../db/database';

// Import from Excel
export const importFromExcel = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        let imported = {
          hutang: 0,
          pembayaranHutang: 0,
          piutang: 0,
          pembayaranPiutang: 0,
          pemasukan: 0,
          pengeluaran: 0,
          maintenance: 0
        };

        // Import Hutang
        if (workbook.SheetNames.includes('Hutang')) {
          try {
            const sheet = workbook.Sheets['Hutang'];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            
            for (const row of jsonData) {
              if (row['Nama']) {
                await db.hutang.add({
                  nama: row['Nama'],
                  tipe: row['Tipe'] || 'Lainnya',
                  jumlah: parseInt(row['Total Hutang']) || 0,
                  periode: parseInt(row['Periode (bulan)']) || 12,
                  tanggal: parseDateString(row['Tanggal']),
                  catatan: row['Catatan'] || ''
                });
                imported.hutang++;
              }
            }
          } catch (error) {
            console.warn('Error importing Hutang:', error);
          }
        }

        // Import Piutang
        if (workbook.SheetNames.includes('Piutang')) {
          try {
            const sheet = workbook.Sheets['Piutang'];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            
            for (const row of jsonData) {
              if (row['Nama Orang']) {
                await db.piutang.add({
                  namaOrang: row['Nama Orang'],
                  jumlah: parseInt(row['Total Piutang']) || 0,
                  tanggal: parseDateString(row['Tanggal Pinjam']),
                  jatuhTempo: row['Jatuh Tempo'] && row['Jatuh Tempo'] !== '-' ? parseDateString(row['Jatuh Tempo']) : '',
                  catatan: row['Catatan'] || ''
                });
                imported.piutang++;
              }
            }
          } catch (error) {
            console.warn('Error importing Piutang:', error);
          }
        }

        // Import Pemasukan
        if (workbook.SheetNames.includes('Pemasukan')) {
          try {
            const sheet = workbook.Sheets['Pemasukan'];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            
            for (const row of jsonData) {
              if (row['Sumber']) {
                await db.pemasukan.add({
                  sumber: row['Sumber'],
                  tipe: row['Tipe'] || 'Lainnya',
                  jumlah: parseInt(row['Jumlah']) || 0,
                  tanggal: parseDateString(row['Tanggal']),
                  catatan: row['Catatan'] || ''
                });
                imported.pemasukan++;
              }
            }
          } catch (error) {
            console.warn('Error importing Pemasukan:', error);
          }
        }

        // Import Pengeluaran
        if (workbook.SheetNames.includes('Pengeluaran')) {
          try {
            const sheet = workbook.Sheets['Pengeluaran'];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            
            for (const row of jsonData) {
              if (row['Kategori']) {
                await db.pengeluaran.add({
                  kategori: row['Kategori'],
                  jumlah: parseInt(row['Jumlah']) || 0,
                  tanggal: parseDateString(row['Tanggal']),
                  catatan: row['Catatan'] || ''
                });
                imported.pengeluaran++;
              }
            }
          } catch (error) {
            console.warn('Error importing Pengeluaran:', error);
          }
        }

        // Import Maintenance
        if (workbook.SheetNames.includes('Maintenance')) {
          try {
            const sheet = workbook.Sheets['Maintenance'];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            
            for (const row of jsonData) {
              if (row['Nama']) {
                await db.maintenance.add({
                  nama: row['Nama'],
                  tanggal: parseDateString(row['Tanggal']),
                  km_saat_ini: parseInt(row['KM Saat Ini']) || 0,
                  km_berikutnya: parseInt(row['KM Berikutnya']) || 0,
                  biaya: parseInt(row['Biaya']) || 0,
                  catatan: row['Catatan'] || ''
                });
                imported.maintenance++;
              }
            }
          } catch (error) {
            console.warn('Error importing Maintenance:', error);
          }
        }

        resolve(imported);
      } catch (error) {
        reject(new Error('Gagal membaca file Excel: ' + error.message));
      }
    };
    
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsArrayBuffer(file);
  });
};

// Import from TXT
export const importFromTXT = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        let imported = {
          hutang: 0,
          piutang: 0,
          pemasukan: 0,
          pengeluaran: 0,
          maintenance: 0
        };

        // Parse sections
        const sections = {
          hutang: extractSection(text, '📋 DATA HUTANG'),
          piutang: extractSection(text, '💰 DATA PIUTANG'),
          pemasukan: extractSection(text, '💰 DATA PEMASUKAN'),
          pengeluaran: extractSection(text, '💸 DATA PENGELUARAN'),
          maintenance: extractSection(text, '🔧 DATA MAINTENANCE') || extractSection(text, '🔧 DATA PERBAIKAN')
        };

        // Import hutang
        if (sections.hutang) {
          try {
            const items = parseItems(sections.hutang);
            for (const item of items) {
              if (item.nama) {
                await db.hutang.add({
                  nama: item.nama,
                  tipe: item.tipe || 'Lainnya',
                  jumlah: parseAmount(item.jumlah) || 0,
                  periode: parseInt(item.periode) || 12,
                  tanggal: item.tanggal || new Date().toISOString().split('T')[0],
                  catatan: item.catatan || ''
                });
                imported.hutang++;
              }
            }
          } catch (error) {
            console.warn('Error parsing hutang:', error);
          }
        }

        // Import piutang
        if (sections.piutang) {
          try {
            const items = parseItemsPiutang(sections.piutang);
            for (const item of items) {
              if (item.namaOrang) {
                await db.piutang.add({
                  namaOrang: item.namaOrang,
                  jumlah: parseAmount(item.jumlah) || 0,
                  tanggal: item.tanggal || new Date().toISOString().split('T')[0],
                  jatuhTempo: item.jatuhTempo || '',
                  catatan: item.catatan || ''
                });
                imported.piutang++;
              }
            }
          } catch (error) {
            console.warn('Error parsing piutang:', error);
          }
        }

        // Import pemasukan
        if (sections.pemasukan) {
          try {
            const items = parseItemsPemasukan(sections.pemasukan);
            for (const item of items) {
              if (item.sumber) {
                await db.pemasukan.add({
                  sumber: item.sumber,
                  tipe: item.tipe || 'Lainnya',
                  jumlah: parseAmount(item.jumlah) || 0,
                  tanggal: item.tanggal || new Date().toISOString().split('T')[0],
                  catatan: item.catatan || ''
                });
                imported.pemasukan++;
              }
            }
          } catch (error) {
            console.warn('Error parsing pemasukan:', error);
          }
        }

        // Import pengeluaran
        if (sections.pengeluaran) {
          try {
            const items = parseItemsPengeluaran(sections.pengeluaran);
            for (const item of items) {
              if (item.kategori) {
                await db.pengeluaran.add({
                  kategori: item.kategori,
                  jumlah: parseAmount(item.jumlah) || 0,
                  tanggal: item.tanggal || new Date().toISOString().split('T')[0],
                  catatan: item.catatan || ''
                });
                imported.pengeluaran++;
              }
            }
          } catch (error) {
            console.warn('Error parsing pengeluaran:', error);
          }
        }

        // Import maintenance
        if (sections.maintenance) {
          try {
            const items = parseItemsMaintenance(sections.maintenance);
            for (const item of items) {
              if (item.nama) {
                await db.maintenance.add({
                  nama: item.nama,
                  tanggal: item.tanggal || new Date().toISOString().split('T')[0],
                  km_saat_ini: parseInt(item.km_saat_ini) || 0,
                  km_berikutnya: parseInt(item.km_berikutnya) || 0,
                  catatan: item.catatan || ''
                });
                imported.maintenance++;
              }
            }
          } catch (error) {
            console.warn('Error parsing maintenance:', error);
          }
        }

        resolve(imported);
      } catch (error) {
        reject(new Error('Gagal membaca file TXT: ' + error.message));
      }
    };
    
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsText(file, 'UTF-8');
  });
};

// Helper functions
const parseDateString = (dateStr) => {
  if (!dateStr || dateStr === '-' || dateStr === 'undefined') {
    return new Date().toISOString().split('T')[0];
  }
  
  // Try to parse Indonesian date format: "3 Februari 2026"
  const months = {
    'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
    'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08',
    'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
  };
  
  const parts = dateStr.trim().split(' ');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = months[parts[1]];
    const year = parts[2];
    if (month) return `${year}-${month}-${day}`;
  }
  
  // Try YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
    return dateStr.trim();
  }
  
  return new Date().toISOString().split('T')[0];
};

const parseAmount = (amountStr) => {
  if (!amountStr || amountStr === '-') return 0;
  // Remove "Rp", dots, spaces, and other non-numeric characters
  const cleaned = amountStr.toString().replace(/[^\d]/g, '');
  return parseInt(cleaned) || 0;
};

const extractSection = (text, marker) => {
  const start = text.indexOf(marker);
  if (start === -1) return null;
  
  const restOfText = text.substring(start);
  const nextMarkerIndex = restOfText.search(/\n(📋|💰|💸|🔧)/);
  
  if (nextMarkerIndex === -1) {
    return restOfText;
  }
  
  return restOfText.substring(0, nextMarkerIndex);
};

const parseItems = (section) => {
  const items = [];
  const lines = section.split('\n');
  let currentItem = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (/^\d+\./.test(trimmed)) {
      if (currentItem) items.push(currentItem);
      currentItem = { nama: trimmed.replace(/^\d+\.\s*/, '') };
    } else if (currentItem && trimmed) {
      if (trimmed.startsWith('Tipe:')) currentItem.tipe = trimmed.split(':')[1]?.trim();
      if (trimmed.startsWith('Total Hutang:')) currentItem.jumlah = trimmed.split(':')[1]?.trim();
      if (trimmed.startsWith('Periode:')) currentItem.periode = trimmed.match(/\d+/)?.[0];
      if (trimmed.startsWith('Tanggal:')) currentItem.tanggal = trimmed.split('Tanggal:')[1]?.trim();
      if (trimmed.startsWith('Catatan:')) currentItem.catatan = trimmed.split('Catatan:')[1]?.trim();
    }
  }
  
  if (currentItem) items.push(currentItem);
  return items.filter(item => item.nama);
};

const parseItemsPiutang = (section) => {
  const items = [];
  const lines = section.split('\n');
  let currentItem = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (/^\d+\./.test(trimmed)) {
      if (currentItem) items.push(currentItem);
      currentItem = { namaOrang: trimmed.replace(/^\d+\.\s*/, '') };
    } else if (currentItem && trimmed) {
      if (trimmed.startsWith('Total Piutang:')) currentItem.jumlah = trimmed.split(':')[1]?.trim();
      if (trimmed.startsWith('Tanggal Pinjam:') || trimmed.startsWith('Tanggal:')) {
        currentItem.tanggal = trimmed.split(':')[1]?.trim();
      }
      if (trimmed.startsWith('Jatuh Tempo:')) currentItem.jatuhTempo = trimmed.split(':')[1]?.trim();
      if (trimmed.startsWith('Catatan:')) currentItem.catatan = trimmed.split('Catatan:')[1]?.trim();
    }
  }
  
  if (currentItem) items.push(currentItem);
  return items.filter(item => item.namaOrang);
};

const parseItemsPemasukan = (section) => {
  const items = [];
  const lines = section.split('\n');
  let currentItem = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (/^\d+\./.test(trimmed)) {
      if (currentItem) items.push(currentItem);
      currentItem = { sumber: trimmed.replace(/^\d+\.\s*/, '') };
    } else if (currentItem && trimmed) {
      if (trimmed.startsWith('Tipe:')) currentItem.tipe = trimmed.split(':')[1]?.trim();
      if (trimmed.startsWith('Jumlah:')) currentItem.jumlah = trimmed.split(':')[1]?.trim();
      if (trimmed.startsWith('Tanggal:')) currentItem.tanggal = trimmed.split(':')[1]?.trim();
      if (trimmed.startsWith('Catatan:')) currentItem.catatan = trimmed.split('Catatan:')[1]?.trim();
    }
  }
  
  if (currentItem) items.push(currentItem);
  return items.filter(item => item.sumber);
};

const parseItemsPengeluaran = (section) => {
  const items = [];
  const lines = section.split('\n');
  let currentItem = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (/^\d+\./.test(trimmed)) {
      if (currentItem) items.push(currentItem);
      currentItem = { kategori: trimmed.replace(/^\d+\.\s*/, '') };
    } else if (currentItem && trimmed) {
      if (trimmed.startsWith('Jumlah:')) currentItem.jumlah = trimmed.split(':')[1]?.trim();
      if (trimmed.startsWith('Tanggal:')) currentItem.tanggal = trimmed.split(':')[1]?.trim();
      if (trimmed.startsWith('Catatan:')) currentItem.catatan = trimmed.split('Catatan:')[1]?.trim();
    }
  }
  
  if (currentItem) items.push(currentItem);
  return items.filter(item => item.kategori);
};

const parseItemsMaintenance = (section) => {
  const items = [];
  const lines = section.split('\n');
  let currentItem = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (/^\d+\./.test(trimmed)) {
      if (currentItem) items.push(currentItem);
      currentItem = { nama: trimmed.replace(/^\d+\.\s*/, '') };
    } else if (currentItem && trimmed) {
      if (trimmed.startsWith('Tanggal:')) currentItem.tanggal = trimmed.split(':')[1]?.trim();
      if (trimmed.startsWith('KM Saat Ini:')) {
        const match = trimmed.match(/\d+/);
        if (match) currentItem.km_saat_ini = match[0];
      }
      if (trimmed.startsWith('KM Berikutnya:')) {
        const match = trimmed.match(/\d+/);
        if (match) currentItem.km_berikutnya = match[0];
      }
      if (trimmed.startsWith('Catatan:')) currentItem.catatan = trimmed.split('Catatan:')[1]?.trim();
    }
  }
  
  if (currentItem) items.push(currentItem);
  return items.filter(item => item.nama);
};
