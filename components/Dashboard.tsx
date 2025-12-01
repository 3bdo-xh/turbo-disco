
import React from 'react';
import { ViewState, UserRole } from '../types';
import { Package, Users, FileText, Smartphone, RotateCcw, Settings, ShoppingCart } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: ViewState) => void;
  userRole?: UserRole;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, userRole }) => {
  const MenuButton = ({ label, icon: Icon, color, onClick }: any) => (
    <button
      onClick={onClick}
      className={`${color} text-white rounded-xl flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md hover:opacity-95 transition-all transform hover:-translate-y-1 active:scale-95 aspect-[4/3] w-full group relative overflow-hidden`}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm shadow-inner ring-1 ring-white/10">
        <Icon size={22} className="text-white" strokeWidth={2.5} />
      </div>
      <span className="text-sm font-bold tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="text-center mb-6 animate-in slide-in-from-top-4 duration-700">
        <div className="inline-flex items-center justify-center gap-3 mb-2 bg-white px-5 py-2 rounded-full shadow-sm border border-gray-100">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm transform -rotate-3">
            <ShoppingCart size={18} />
          </div>
          <h1 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight">منظومة المبيعات</h1>
        </div>
        <p className="text-gray-400 font-medium text-xs">إدارة ذكية لمشروعك</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-[320px] md:max-w-[500px]">
        {/* Available to Everyone */}
        <MenuButton 
          label="بيع مباشر" 
          icon={Smartphone} 
          color="bg-gradient-to-br from-indigo-600 to-indigo-800" 
          onClick={() => onNavigate('POS')} 
        />

        <MenuButton 
          label="المنتجات والمخزون" 
          icon={Package} 
          color="bg-gradient-to-br from-teal-600 to-teal-800" 
          onClick={() => onNavigate('INVENTORY_MENU')} 
        />

        <MenuButton 
          label="التقارير" 
          icon={FileText} 
          color="bg-gradient-to-br from-rose-500 to-rose-700" 
          onClick={() => onNavigate('REPORTS')} 
        />

        <MenuButton 
          label="استرجاع" 
          icon={RotateCcw} 
          color="bg-gradient-to-br from-cyan-600 to-cyan-800" 
          onClick={() => onNavigate('RETURNS')} 
        />

        {/* Admin Only */}
        {userRole === 'ADMIN' && (
          <>
            <MenuButton 
              label="المستخدمين" 
              icon={Users} 
              color="bg-gradient-to-br from-amber-500 to-amber-700" 
              onClick={() => onNavigate('USERS')} 
            />

            <MenuButton 
              label="الإعدادات" 
              icon={Settings} 
              color="bg-gradient-to-br from-slate-600 to-slate-800" 
              onClick={() => onNavigate('SETTINGS')} 
            />
          </>
        )}
      </div>
      
      <div className="mt-8 flex gap-2 justify-center opacity-20">
        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
      </div>
    </div>
  );
};

export default Dashboard;
