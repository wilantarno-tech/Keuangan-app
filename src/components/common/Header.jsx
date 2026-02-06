import { Download, Upload } from 'lucide-react';

const Header = ({ title, onExport }) => {
  return (
    <header className="bg-dark-card border-b border-dark-border p-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center p-1">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-lg font-bold">{title}</h1>
      </div>
      <button
        onClick={onExport}
        className="md:hidden flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
      >
        <Download size={16} />
        <Upload size={16} className="-ml-1" />
        <span>Kelola Data</span>
      </button>
    </header>
  );
};

export default Header;
