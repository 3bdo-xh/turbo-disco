
import React, { useState } from 'react';
import { StoreSettings, User } from '../types';
import { ShoppingCart, Save } from 'lucide-react';

interface SetupProps {
  onComplete: (settings: StoreSettings, adminUser: User) => void;
}

const Setup: React.FC<SetupProps> = ({ onComplete }) => {
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (adminPassword.length !== 4) {
      alert("كلمة المرور يجب أن تتكون من 4 أرقام بالضبط");
      return;
    }

    const settings: StoreSettings = {
      id: 'settings',
      storeName,
      address,
      phone,
      description,
      isSetupComplete: true
    };

    const adminUser: User = {
      id: 'admin',
      name: 'مسؤول النظام',
      password: adminPassword,
      role: 'ADMIN',
      createdAt: Date.now()
    };

    onComplete(settings, adminUser);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and max 4 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setAdminPassword(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-500 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary mx-auto rounded-2xl flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg shadow-primary/30">
            <ShoppingCart size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">إعداد منظومة المبيعات</h1>
          <p className="text-gray-500 text-sm mt-2">يرجى إدخال بيانات النشاط التجاري وحساب المسؤول</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4 border-b border-gray-100 pb-5">
            <h3 className="font-bold text-gray-700 text-sm">بيانات المتجر</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم المتجر / النشاط</label>
              <input 
                required
                type="text" 
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="مثال: متجر طرابلس للملابس"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">وصف النشاط (اختياري)</label>
              <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="مثال: بيع الملابس والأحذية الرجالية"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
              <input 
                required
                type="text" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="مثال: طرابلس، شارع عمر المختار"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
              <input 
                required
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="09X XXXXXXX"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-700 text-sm">حساب المسؤول (Admin)</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور (4 أرقام)</label>
              <input 
                required
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={adminPassword}
                onChange={handlePasswordChange}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-center text-lg tracking-widest"
                placeholder="****"
              />
              <p className="text-xs text-gray-400 mt-1">تستخدم هذه الكلمة للدخول بصلاحيات كاملة</p>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-teal-800 shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
          >
            <Save size={20} />
            حفظ وبدء الاستخدام
          </button>
        </form>
      </div>
    </div>
  );
};

export default Setup;