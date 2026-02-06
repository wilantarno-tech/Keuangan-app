import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../../db/database';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Calendar, Filter, X, DollarSign, Coins, TrendingUp, TrendingDown, Wrench, ChevronLeft, ChevronRight } from 'lucide-react';

const History = () => {
  const [filterType, setFilterType] = useState('all'); // all, hutang, piutang, pemasukan, pengeluaran, maintenance
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch all data
  const hutang = useLiveQuery(() => db.hutang.toArray()) || [];
  const piutang = useLiveQuery(() => db.piutang.toArray()) || [];
  const pemasukan = useLiveQuery(() => db.pemasukan.toArray()) || [];
  const pengeluaran = useLiveQuery(() => db.pengeluaran.toArray()) || [];
  const maintenance = useLiveQuery(() => db.maintenance.toArray()) || [];

  // Combine all data with type
  const allActivities = [
    ...hutang.map(item => ({ ...item, type: 'hutang', icon: DollarSign, color: 'red' })),
    ...piutang.map(item => ({ ...item, type: 'piutang', icon: Coins, color: 'green' })),
    ...pemasukan.map(item => ({ ...item, type: 'pemasukan', icon: TrendingUp, color: 'green' })),
    ...pengeluaran.map(item => ({ ...item, type: 'pengeluaran', icon: TrendingDown, color: 'orange' })),
    ...maintenance.map(item => ({ ...item, type: 'maintenance', icon: Wrench, color: 'blue' }))
  ];

  // Filter by type
  let filteredActivities = filterType === 'all' 
    ? allActivities 
    : allActivities.filter(item => item.type === filterType);

  // Filter by date
  if (startDate) {
    filteredActivities = filteredActivities.filter(item => 
      new Date(item.tanggal) >= new Date(startDate)
    );
  }
  if (endDate) {
    filteredActivities = filteredActivities.filter(item => 
      new Date(item.tanggal) <= new Date(endDate)
    );
  }

  // Sort by date (newest first)
  filteredActivities.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage);

  const handleClearFilters = () => {
    setFilterType('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const getActivityTitle = (activity) => {
    switch (activity.type) {
      case 'hutang': return activity.nama;
      case 'piutang': return activity.namaOrang;
      case 'pemasukan': return activity.sumber;
      case 'pengeluaran': return activity.kategori;
      case 'maintenance': return activity.nama;
      default: return 'Unknown';
    }
  };

  const getActivitySubtitle = (activity) => {
    switch (activity.type) {
      case 'hutang': return activity.tipe;
      case 'piutang': return `Jatuh Tempo: ${formatDate(activity.jatuhTempo)}`;
      case 'pemasukan': return activity.tipe;
      case 'pengeluaran': return activity.catatan || '-';
      case 'maintenance': return `KM: ${activity.km_saat_ini} → ${activity.km_berikutnya}`;
      default: return '';
    }
  };

  const getActivityAmount = (activity) => {
    if (activity.type === 'maintenance') {
      return activity.biaya ? formatCurrency(activity.biaya) : '-';
    }
    return formatCurrency(activity.jumlah);
  };

  const typeLabels = {
    all: 'Semua',
    hutang: 'Hutang',
    piutang: 'Piutang',
    pemasukan: 'Pemasukan',
    pengeluaran: 'Pengeluaran',
    maintenance: 'Perbaikan'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">📜 History</h2>
          <p className="text-sm text-gray-400 mt-1">
            Riwayat semua aktivitas keuangan
          </p>
        </div>
        <div className="text-sm text-gray-400">
          Total: <span className="font-semibold text-white">{filteredActivities.length}</span> aktivitas
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-blue-500" />
          <h3 className="font-semibold">Filter Data</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Jenis Transaksi</label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="input w-full"
            >
              {Object.entries(typeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="input w-full"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Tanggal Akhir</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="input w-full"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {(filterType !== 'all' || startDate || endDate) && (
          <button
            onClick={handleClearFilters}
            className="mt-4 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
            Hapus Filter
          </button>
        )}
      </div>

      {/* Activities List */}
      {paginatedActivities.length > 0 ? (
        <div className="space-y-4">
          {paginatedActivities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div
                key={`${activity.type}-${activity.id}-${index}`}
                className="card hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`bg-${activity.color}-500/10 p-3 rounded-lg flex-shrink-0`}>
                    <Icon className={`text-${activity.color}-500`} size={24} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{getActivityTitle(activity)}</h4>
                        <p className="text-sm text-gray-400 mt-1">{getActivitySubtitle(activity)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar size={14} className="text-gray-500" />
                          <span className="text-xs text-gray-500">{formatDate(activity.tanggal)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full bg-${activity.color}-500/10 text-${activity.color}-500`}>
                            {typeLabels[activity.type]}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className={`text-right flex-shrink-0 font-semibold text-${activity.color}-400`}>
                        {getActivityAmount(activity)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Calendar size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Tidak ada data yang sesuai dengan filter</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between card">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            Sebelumnya
          </button>

          <div className="text-sm text-gray-400">
            Halaman {currentPage} dari {totalPages}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Selanjutnya
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default History;
