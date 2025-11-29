
import React, { useState, useEffect } from 'react';
import { StoreSettings } from '../types';
import { Save, Info, ShieldCheck, Database, ShoppingCart, Store, Wifi, WifiOff, HardDrive, Activity } from 'lucide-react';
import { addData, getStoreData } from '../services/db';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [storageInfo, setStorageInfo] = useState<{usage: number, quota: number} | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getStoreData<StoreSettings>('settings');
        if (data.length > 0) {
          setSettings(data[0]);
        }
      } catch (error) {
        console.error("Failed to load settings", error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();

    // Monitor Network Status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check Storage
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(estimate => {
        if (estimate.usage && estimate.quota) {
          setStorageInfo({ usage: estimate.usage, quota: estimate.quota });
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings) {
      await addData('settings', settings);
      alert('تم حفظ الإعدادات بنجاح');
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div className="space-y-8 pb-10">
      
      {/* System Status Section (New) */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Activity className="text-primary" size={24} />
          حالة النظام
        </h2>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Connection Status */}
            <div className={`p-4 rounded-lg border flex items-center justify-between ${isOnline ? 'bg-green-50 border-green-100' : 'bg-gray-100 border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isOnline ? 'bg-white text-green-600' : 'bg-white text-gray-500'}`}>
                  {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">حالة الاتصال</h4>
                  <p className={`text-xs ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                    {isOnline ? 'متصل بالإنترنت (Online)' : 'يعمل بدون إنترنت (Offline)'}
                  </p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            </div>

            {/* Storage Status */}
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-white text-blue-600">
                  <HardDrive size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">التخزين المحلي</h4>
                  <p className="text-xs text-blue-600">
                    {storageInfo 
                      ? `${formatBytes(storageInfo.usage)} مستخدمة` 
                      : 'جاري الحساب...'}
                  </p>
                </div>
              </div>
              <ShieldCheck size={20} className="text-blue-500" title="محمي" />
            </div>

          </div>
          <div className="mt-4 text-xs text-gray-400 text-center">
             يتم تخزين كافة البيانات محلياً على هذا الجهاز لضمان عدم فقدانها
          </div>
        </div>
      </section>

      {/* Store Settings Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Store className="text-primary" size={24} />
          بيانات المتجر
        </h2>
        
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المتجر</label>
            <input 
              type="text" 
              value={settings?.storeName || ''}
              onChange={(e) => setSettings(prev => prev ? {...prev, storeName: e.target.value} : null)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">وصف النشاط (شعار أو نبذة)</label>
            <input 
              type="text" 
              value={settings?.description || ''}
              onChange={(e) => setSettings(prev => prev ? {...prev, description: e.target.value} : null)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
              <input 
                type="text" 
                value={settings?.address || ''}
                onChange={(e) => setSettings(prev => prev ? {...prev, address: e.target.value} : null)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
              <input 
                type="text" 
                value={settings?.phone || ''}
                onChange={(e) => setSettings(prev => prev ? {...prev, phone: e.target.value} : null)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          
          <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-teal-800 flex items-center gap-2">
            <Save size={18} />
            حفظ التغييرات
          </button>
        </form>
      </section>

      {/* About Section */}
      <section className="space-y-4 pt-4 border-t border-gray-200">
         <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Info className="text-gray-500" size={24} />
          حول المنظومة
        </h2>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
             <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/30">
              <ShoppingCart size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">منظومة المبيعات</h3>
              <p className="text-gray-500">الإصدار 2.1.0</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Database className="text-primary mt-1" size={18} />
              <div>
                <h4 className="font-bold text-gray-800 text-sm">تخزين محلي</h4>
                <p className="text-xs text-gray-500">البيانات محفوظة على جهازك</p>
              </div>
            </div>
             <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <ShieldCheck className="text-green-600 mt-1" size={18} />
              <div>
                <h4 className="font-bold text-gray-800 text-sm">خصوصية تامة</h4>
                <p className="text-xs text-gray-500">لا مشاركة للبيانات مع أطراف خارجية</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Settings;