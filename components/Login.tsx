
import React, { useState } from 'react';
import { User } from '../types';
import { Lock, User as UserIcon, LogIn, ShoppingCart } from 'lucide-react';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
  storeName: string;
}

const Login: React.FC<LoginProps> = ({ users, onLogin, storeName }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(users.length > 0 ? users[0].id : '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.id === selectedUserId);
    
    if (user) {
      if (user.password === password) {
        onLogin(user);
      } else {
        setError('كلمة المرور غير صحيحة');
      }
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and max 4 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPassword(value);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary mx-auto rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-primary/20">
            <ShoppingCart size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{storeName}</h1>
          <p className="text-gray-500 text-sm mt-1">تسجيل الدخول للمنظومة</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اختر المستخدم</label>
              <div className="relative">
                <UserIcon className="absolute right-3 top-3 text-gray-400" size={20} />
                <select 
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-3 pr-10 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none text-gray-800"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role === 'ADMIN' ? 'مسؤول' : 'كاشير'})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 text-gray-400" size={20} />
                <input 
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  required
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-3 pr-10 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800 text-center tracking-widest text-lg"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="****"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-teal-800 shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <LogIn size={20} />
            دخول
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400">
          منظومة مبيعات © 2025
        </div>
      </div>
    </div>
  );
};

export default Login;
