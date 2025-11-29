
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Plus, Trash2, User as UserIcon, Shield, ShieldCheck } from 'lucide-react';

interface UsersProps {
  users: User[];
  onAddUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  currentUser: User;
}

const Users: React.FC<UsersProps> = ({ users, onAddUser, onDeleteUser, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', password: '', role: 'CASHIER' as UserRole });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newUser.password.length !== 4) {
        alert("كلمة المرور يجب أن تتكون من 4 أرقام بالضبط");
        return;
    }

    if (newUser.name && newUser.password) {
      onAddUser({
        id: Date.now().toString(),
        name: newUser.name,
        password: newUser.password,
        role: newUser.role,
        createdAt: Date.now()
      });
      setIsModalOpen(false);
      setNewUser({ name: '', password: '', role: 'CASHIER' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">المستخدمين والصلاحيات</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-teal-800 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          <span>إضافة مستخدم</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <div key={user.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                  {user.role === 'ADMIN' ? <ShieldCheck size={24} /> : <UserIcon size={24} />}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{user.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                    {user.role === 'ADMIN' ? 'مسؤول النظام' : 'كاشير / موظف'}
                  </span>
                </div>
              </div>
              
              {/* Prevent deleting self or the main admin if there's only one */}
              {user.id !== currentUser.id && (
                <button 
                  onClick={() => {
                    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
                      onDeleteUser(user.id);
                    }
                  }}
                  className="text-red-400 hover:bg-red-50 p-2 rounded-lg transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-50 text-sm text-gray-500">
               تم الإنشاء: {new Date(user.createdAt).toLocaleDateString('ar-LY')}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-4 text-gray-800">إضافة مستخدم جديد</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
                <input 
                  required 
                  type="text" 
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={newUser.name} 
                  onChange={e => setNewUser({...newUser, name: e.target.value})} 
                  placeholder="مثال: محمد"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور (4 أرقام)</label>
                <input 
                  required 
                  type="text" 
                  inputMode="numeric"
                  maxLength={4}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-center tracking-widest"
                  value={newUser.password} 
                  onChange={e => setNewUser({...newUser, password: e.target.value.replace(/\D/g, '').slice(0, 4)})} 
                  placeholder="****"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الصلاحية</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-200 has-[:checked]:text-blue-700">
                    <input 
                      type="radio" 
                      name="role" 
                      value="CASHIER" 
                      checked={newUser.role === 'CASHIER'}
                      onChange={() => setNewUser({...newUser, role: 'CASHIER'})}
                      className="hidden"
                    />
                    <UserIcon size={18} />
                    <span>كاشير</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 has-[:checked]:bg-purple-50 has-[:checked]:border-purple-200 has-[:checked]:text-purple-700">
                    <input 
                      type="radio" 
                      name="role" 
                      value="ADMIN" 
                      checked={newUser.role === 'ADMIN'}
                      onChange={() => setNewUser({...newUser, role: 'ADMIN'})}
                      className="hidden"
                    />
                    <Shield size={18} />
                    <span>مسؤول</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-teal-800 font-medium shadow-sm">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
