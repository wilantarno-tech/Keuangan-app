import Dexie from 'dexie';

export const db = new Dexie('KeuanganApp');

// Version 3: Complete schema with proper indexing
db.version(3).stores({
  hutang: '++id, nama, tipe, tanggal',
  pembayaranHutang: '++id, hutangId, tanggal',
  piutang: '++id, namaOrang, tanggal',
  pembayaranPiutang: '++id, piutangId, tanggal',
  pemasukan: '++id, sumber, tipe, tanggal',
  pengeluaran: '++id, kategori, tanggal',
  maintenance: '++id, nama, tanggal',
  tipeHutang: '++id, nama',
  tipePemasukan: '++id, nama',
  kategoriPengeluaran: '++id, nama'
}).upgrade(async (tx) => {
  // Migration dari versi sebelumnya
  try {
    // Ensure all tables exist
    const tables = [
      'hutang', 'pembayaranHutang', 'piutang', 'pembayaranPiutang',
      'pemasukan', 'pengeluaran', 'maintenance',
      'tipeHutang', 'tipePemasukan', 'kategoriPengeluaran'
    ];
    
    for (const table of tables) {
      try {
        await tx.table(table).count();
      } catch (error) {
        console.warn(`Table ${table} will be recreated`);
      }
    }
  } catch (error) {
    console.warn('Upgrade migration issue:', error);
  }
});

// Initialize default data
db.on('populate', async (db) => {
  try {
    // Only populate if tables are empty
    const tipeHutangCount = await db.tipeHutang.count();
    
    if (tipeHutangCount === 0) {
      // Default tipe hutang
      await db.tipeHutang.bulkAdd([
        { nama: 'Pribadi' },
        { nama: 'Kredit' },
        { nama: 'Pinjaman Bank' },
        { nama: 'Cicilan' },
        { nama: 'Lainnya' }
      ]);
    }

    // Check if tipePemasukan is empty
    const tipePemasukanCount = await db.tipePemasukan.count();
    if (tipePemasukanCount === 0) {
      // Default tipe pemasukan
      await db.tipePemasukan.bulkAdd([
        { nama: 'Gaji' },
        { nama: 'Bonus' },
        { nama: 'Freelance' },
        { nama: 'Investasi' },
        { nama: 'Pembayaran Piutang' },
        { nama: 'Lainnya' }
      ]);
    }

    // Check if kategoriPengeluaran is empty
    const kategoriCount = await db.kategoriPengeluaran.count();
    if (kategoriCount === 0) {
      // Default kategori pengeluaran
      await db.kategoriPengeluaran.bulkAdd([
        { nama: 'Makanan & Minuman' },
        { nama: 'Transportasi' },
        { nama: 'Belanja' },
        { nama: 'Hiburan' },
        { nama: 'Tagihan' },
        { nama: 'Kesehatan' },
        { nama: 'Pendidikan' },
        { nama: 'Pembayaran Hutang' },
        { nama: 'Perbaikan Kendaraan' },
        { nama: 'Lainnya' }
      ]);
    }
  } catch (error) {
    console.error('Error during database population:', error);
  }
});

// Error handling middleware
db.on('error', (error) => {
  console.error('Database error:', error);
});

export default db;
