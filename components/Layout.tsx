
import React, { useState } from 'react';
import { ViewState, User, Product } from '../types';
import { ArrowRight, Home, LogOut, User as UserIcon, Bell, AlertTriangle, X } from 'lucide-react';

interface LayoutProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  children: React.ReactNode;
  currentUser: User | null;
  onLogout: () => void;
  products: Product[];
}

const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children, currentUser, onLogout, products }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const lowStockItems = products.filter(p => p.stock <= 5);

  const getTitle = (view: ViewState) => {
    switch (view) {
      case 'POS': return 'نقطة البيع';
      case 'INVENTORY': return 'إدارة المنتجات والمخزون';
      case 'REPORTS': return 'التقارير والإحصائيات';
      case 'RETURNS': return 'استرجاع المنتجات';
      case 'SETTINGS': return 'الإعدادات والتحكم';
      case 'USERS': return 'إدارة المستخدمين';
      default: return '';
    }
  };

  const NotificationsDropdown = () => (
    <div className="absolute top-12 left-4 md:left-auto md:right-0 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden transform transition-all duration-200 origin-top-right">
      <div className="p-3 border-b border-gray-50 flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-gray-800 text-sm">التنبيهات</h3>
        <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-red-500">
          <X size={16} />
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {lowStockItems.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {lowStockItems.map(item => (
              <div key={item.id} className="p-3 hover:bg-gray-50 flex items-start gap-3">
                <div className={`p-2 rounded-full ${item.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    الكمية المتبقية: <span className="font-bold text-red-600">{item.stock}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400 text-sm">
            لا توجد تنبيهات حالياً
          </div>
        )}
      </div>
      {lowStockItems.length > 0 && (
         <div className="p-2 bg-gray-50 text-center border-t border-gray-100">
            <button onClick={() => { onNavigate('INVENTORY'); setShowNotifications(false); }} className="text-xs text-primary font-bold hover:underline">
               إدارة المخزون
            </button>
         </div>
      )}
    </div>
  );

  const NotificationBell = () => (
    <div className="relative">
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        className="w-10 h-10 flex items-center justify-center bg-white text-gray-600 rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors relative"
        title="التنبيهات"
      >
        <Bell size={20} />
        {lowStockItems.length > 0 && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>
      {showNotifications && <NotificationsDropdown />}
    </div>
  );

  // Auth Views (Login/Setup)
  if (currentView === 'LOGIN' || currentView === 'SETUP') {
    return <>{children}</>;
  }

  // Dashboard View
  if (currentView === 'DASHBOARD') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
        {/* Dashboard Header */}
        <header className="w-full p-4 flex justify-between items-start z-40">
           {/* Left side (can be logo or empty) */}
           <div className="hidden md:block">
              {/* Optional Logo */}
           </div>

           {/* User Controls */}
           {currentUser && (
            <div className="flex items-center gap-2 w-full justify-between md:justify-end md:w-auto">
               <div className="relative">
                  <NotificationBell />
               </div>

               <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-white px-3 py-1 h-10 rounded-full shadow-sm border border-gray-100">
                     <div className="bg-primary/10 p-1.5 rounded-full text-primary"><UserIcon size={16} /></div>
                     <span className="text-sm font-bold text-gray-700 max-w-[100px] truncate">{currentUser.name}</span>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="w-10 h-10 flex items-center justify-center bg-white text-red-500 rounded-full shadow-sm border border-gray-100 hover:bg-red-50 transition-colors"
                    title="تسجيل الخروج"
                  >
                    <LogOut size={18} />
                  </button>
               </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center -mt-10 px-4">
           {children}
        </main>

        {/* Dashboard Footer */}
        <footer className="py-4 text-center text-gray-400 text-xs font-medium">
           تنفيذ 0928102731 © 2025
        </footer>
      </div>
    );
  }

  // Sub-pages View
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('DASHBOARD')}
              className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
            >
              <ArrowRight size={24} />
            </button>
            <h1 className="text-lg font-bold text-gray-800">{getTitle(currentView)}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button 
              onClick={() => onNavigate('DASHBOARD')}
              className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold hover:bg-primary hover:text-white transition-colors"
            >
              <Home size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-4 md:p-6 pb-20">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
