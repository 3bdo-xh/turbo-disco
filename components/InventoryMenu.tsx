
import React from 'react';
import { ViewState } from '../types';
import { Package, ClipboardCheck } from 'lucide-react';

interface InventoryMenuProps {
  onNavigate: (view: ViewState) => void;
}

const InventoryMenu: React.FC<InventoryMenuProps> = ({ onNavigate }) => {
  const MenuButton = ({ label, icon: Icon, color, onClick, desc }: any) => (
    <button
      onClick={onClick}
      className={`${color} text-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-lg hover:opacity-95 transition-all transform hover:-translate-y-1 active:scale-95 w-full group relative overflow-hidden`}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm shadow-inner ring-1 ring-white/10">
        <Icon size={32} className="text-white" strokeWidth={2} />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold tracking-wide mb-1">{label}</h3>
        <p className="text-xs text-white/80 font-medium">{desc}</p>
      </div>
    </button>
  );

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] w-full max-w-md mx-auto px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">إدارة المخزون</h2>
      
      <div className="grid grid-cols-1 gap-4 w-full">
        <MenuButton 
          label="إدارة المنتجات" 
          desc="إضافة، تعديل، وحذف المنتجات"
          icon={Package} 
          color="bg-gradient-to-br from-teal-600 to-teal-800" 
          onClick={() => onNavigate('INVENTORY')} 
        />

        <MenuButton 
          label="جرد المخزون" 
          desc="مراجعة وتعديل الكميات بالباركود"
          icon={ClipboardCheck} 
          color="bg-gradient-to-br from-indigo-600 to-indigo-800" 
          onClick={() => onNavigate('STOCKTAKING')} 
        />
      </div>
    </div>
  );
};

export default InventoryMenu;
