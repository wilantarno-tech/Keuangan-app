import { Home, DollarSign, TrendingDown, TrendingUp, Coins, Wrench, History } from 'lucide-react';

const BottomNav = ({ currentPage, onNavigate, onHistory }) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Beranda' },
    { id: 'hutang', icon: DollarSign, label: 'Hutang' },
    { id: 'piutang', icon: Coins, label: 'Piutang' },
    { id: 'pemasukan', icon: TrendingUp, label: 'Masuk' },
    { id: 'pengeluaran', icon: TrendingDown, label: 'Keluar' },
    { id: 'perbaikan', icon: Wrench, label: 'Perbaiki' },
  ];

  const historyItem = { id: 'history', icon: History, label: 'History' };
  const allItems = [...navItems, historyItem];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border z-50 md:hidden safe-bottom">
      <div className="grid grid-cols-7 h-14">
        {allItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          const handleClick = () => {
            if (item.id === 'history') {
              onHistory?.();
              return;
            }
            onNavigate(item.id);
          };

          return (
            <button
              key={item.id}
              onClick={handleClick}
              className={`flex flex-col items-center justify-center transition-colors ${
                isActive
                  ? 'text-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Icon size={18} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
