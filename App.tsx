
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import POS from './components/POS';
import Reports from './components/Reports';
import Returns from './components/Returns';
import Settings from './components/Settings';
import Users from './components/Users';
import Setup from './components/Setup';
import Login from './components/Login';
import InstallPrompt from './components/InstallPrompt';
import { Product, Sale, ViewState, User, StoreSettings } from './types';
import { getStoreData, addData, deleteData } from './services/db';
import { Database, CheckCircle, Smartphone, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  
  // App Data
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Auth & Settings State
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initStep, setInitStep] = useState(0); // For Loading Screen Animation

  // Initialize System
  useEffect(() => {
    const initSystem = async () => {
      // Step 1: Request Persistence to prevent data loss
      setInitStep(1); 
      if (navigator.storage && navigator.storage.persist) {
        try {
          const isPersisted = await navigator.storage.persist();
          console.log(`Persisted storage granted: ${isPersisted}`);
        } catch (e) {
          console.warn("Could not request persistence", e);
        }
      }
      await new Promise(r => setTimeout(r, 600));
      
      try {
        setInitStep(2); // Connecting DB
        // Check DB connection
        await getStoreData<User>('users'); // Dummy call to open DB
        await new Promise(r => setTimeout(r, 400));

        setInitStep(3); // Loading Data
        const [loadedSettings, loadedUsers, loadedProducts, loadedSales] = await Promise.all([
          getStoreData<StoreSettings>('settings'),
          getStoreData<User>('users'),
          getStoreData<Product>('products'),
          getStoreData<Sale>('sales')
        ]);

        setProducts(loadedProducts);
        setSales(loadedSales);
        setUsers(loadedUsers);
        
        setInitStep(4); // Finalizing
        await new Promise(r => setTimeout(r, 800));

        if (loadedSettings.length === 0) {
          setCurrentView('SETUP');
        } else {
          setStoreSettings(loadedSettings[0]);
          setCurrentView('LOGIN');
        }
      } catch (err) {
        console.error("Failed to load data", err);
        alert("حدث خطأ أثناء تحميل البيانات. يرجى إعادة تشغيل التطبيق.");
      } finally {
        setLoading(false);
      }
    };
    initSystem();
  }, []);

  // Auth Handlers
  const handleSetupComplete = async (settings: StoreSettings, adminUser: User) => {
    await addData('settings', settings);
    await addData('users', adminUser);
    
    setStoreSettings(settings);
    setUsers([adminUser]);
    setCurrentView('LOGIN');
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('DASHBOARD');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('LOGIN');
  };

  // Data Handlers
  const handleAddProduct = async (product: Product) => {
    const plainProduct = { ...product };
    await addData('products', plainProduct);
    setProducts(prev => [...prev, plainProduct]);
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteData('products', id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleCompleteSale = async (sale: Sale) => {
    const saleData: Sale = { 
      ...sale, 
      items: sale.items.map(item => ({ ...item })),
      userName: currentUser?.name
    };
    
    await addData('sales', saleData);
    setSales(prev => [...prev, saleData]);

    const updatedProducts = [...products];
    for (const item of sale.items) {
      const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
      if (productIndex !== -1) {
        const updatedProduct = { ...updatedProducts[productIndex] };
        updatedProduct.stock -= item.quantity;
        await addData('products', updatedProduct);
        updatedProducts[productIndex] = updatedProduct;
      }
    }
    setProducts(updatedProducts);
  };

  const handleReturnProduct = async (productId: string, quantity: number, reason: string) => {
    const updatedProducts = [...products];
    const productIndex = updatedProducts.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      const updatedProduct = { ...updatedProducts[productIndex] };
      updatedProduct.stock += quantity;
      await addData('products', updatedProduct);
      updatedProducts[productIndex] = updatedProduct;
      setProducts(updatedProducts);
    }
  };

  const handleAddUser = async (user: User) => {
    await addData('users', user);
    setUsers(prev => [...prev, user]);
  };

  const handleDeleteUser = async (id: string) => {
    await deleteData('users', id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // Calculate Next Invoice ID
  const nextInvoiceId = (sales.length + 1).toString().padStart(4, '0');

  // Loading Screen (System Initialization)
  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-primary text-white p-4" dir="rtl">
        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 shadow-2xl animate-bounce">
           <Smartphone size={48} />
        </div>
        <h1 className="text-2xl font-bold mb-10">منظومة مبيعات نماء</h1>
        
        <div className="w-72 space-y-5">
           <div className="flex items-center gap-3 text-sm font-medium opacity-90 transition-all duration-500 transform translate-x-0">
             <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-white transition-colors duration-300 ${initStep >= 1 ? 'bg-white text-primary' : 'bg-transparent'}`}>
               {initStep >= 1 && <ShieldCheck size={14} />}
             </div>
             <span>حماية التخزين ومنع فقدان البيانات...</span>
           </div>

           <div className="flex items-center gap-3 text-sm font-medium opacity-90 transition-all duration-500 transform translate-x-0">
             <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-white transition-colors duration-300 ${initStep >= 2 ? 'bg-white text-primary' : 'bg-transparent'}`}>
               {initStep >= 2 && <CheckCircle size={14} />}
             </div>
             <span>الاتصال بقاعدة البيانات المحلية...</span>
           </div>
           
           <div className="flex items-center gap-3 text-sm font-medium opacity-90 transition-all duration-500 transform translate-x-0">
             <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-white transition-colors duration-300 ${initStep >= 3 ? 'bg-white text-primary' : 'bg-transparent'}`}>
               {initStep >= 3 && <CheckCircle size={14} />}
             </div>
             <span>تحميل سجلات المبيعات والمخزون...</span>
           </div>

           <div className="flex items-center gap-3 text-sm font-medium opacity-90 transition-all duration-500 transform translate-x-0">
             <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-white transition-colors duration-300 ${initStep >= 4 ? 'bg-white text-primary' : 'bg-transparent'}`}>
               {initStep >= 4 && <CheckCircle size={14} />}
             </div>
             <span>جاهز للعمل بدون إنترنت...</span>
           </div>
        </div>

        <div className="absolute bottom-8 text-xs opacity-60 font-light">
          يتم تخزين كافة البيانات محلياً على جهازك
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'SETUP':
        return <Setup onComplete={handleSetupComplete} />;
      case 'LOGIN':
        return <Login users={users} onLogin={handleLogin} storeName={storeSettings?.storeName || 'منظومة المبيعات'} />;
      case 'DASHBOARD':
        return <Dashboard onNavigate={setCurrentView} userRole={currentUser?.role} />;
      case 'INVENTORY':
        return <Inventory products={products} onAddProduct={handleAddProduct} onDeleteProduct={handleDeleteProduct} />;
      case 'USERS':
        return <Users users={users} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} currentUser={currentUser!} />;
      case 'POS':
        return <POS products={products} onCompleteSale={handleCompleteSale} storeSettings={storeSettings!} nextInvoiceId={nextInvoiceId} />;
      case 'REPORTS':
        return <Reports sales={sales} customers={[]} products={products} />;
      case 'RETURNS':
        return <Returns products={products} onReturnProduct={handleReturnProduct} />;
      case 'SETTINGS':
        return <Settings />;
      default:
        return <div>Not found</div>;
    }
  };

  return (
    <>
      <InstallPrompt />
      <Layout currentView={currentView} onNavigate={setCurrentView} currentUser={currentUser} onLogout={handleLogout} products={products}>
        {renderContent()}
      </Layout>
    </>
  );
};

export default App;
