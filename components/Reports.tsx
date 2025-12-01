
import React, { useState } from 'react';
import { Sale, Product, ReturnRecord, PaymentMethod } from '../types';
import { DollarSign, TrendingUp, Coins, AlertTriangle, RotateCcw, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReportsProps {
  sales: Sale[];
  returns: ReturnRecord[];
  products: Product[];
}

const Reports: React.FC<ReportsProps> = ({ sales, returns, products }) => {
  const [filterMethod, setFilterMethod] = useState<PaymentMethod | 'All'>('All');

  // Filter Sales based on selected method
  const filteredSales = filterMethod === 'All' 
    ? sales 
    : sales.filter(s => s.paymentMethod === filterMethod);

  // 1. Gross Revenue
  const grossRevenue = filteredSales.reduce((acc, sale) => acc + sale.total, 0);
  
  // 2. Total Returns Value (Only subtract returns if we are looking at All, or if we tracked return method - simplistic view here subtracts all for now or logic needs to be deeper. Keeping simple.)
  const totalReturns = returns.reduce((acc, ret) => acc + ret.amount, 0);

  // 3. Net Revenue
  const netRevenue = grossRevenue - (filterMethod === 'All' ? totalReturns : 0); // Only subtract returns from total view to avoid confusion
  
  // 4. Low Stock
  const lowStockProducts = products.filter(p => p.stock < 5).length;

  // 5. Total Profit
  const grossProfit = filteredSales.reduce((acc, sale) => {
    const saleProfit = sale.items.reduce((itemAcc, item) => {
      const product = products.find(p => p.id === item.productId);
      const cost = product ? product.cost : 0;
      return itemAcc + ((item.price - cost) * item.quantity);
    }, 0);
    return acc + saleProfit;
  }, 0);

  const returnProfitLoss = returns.reduce((acc, ret) => {
    const product = products.find(p => p.id === ret.productId);
    const cost = product ? product.cost : 0;
    const profitLost = ret.amount - (cost * ret.quantity);
    return acc + profitLost;
  }, 0);

  const netProfit = grossProfit - (filterMethod === 'All' ? returnProfitLoss : 0);

  const now = Date.now();
  const thirtyDaysFromNow = now + (30 * 24 * 60 * 60 * 1000);
  const expiredProducts = products.filter(p => p.expiryDate && p.expiryDate < now);
  const expiringSoonProducts = products.filter(p => p.expiryDate && p.expiryDate >= now && p.expiryDate < thirtyDaysFromNow);

  const salesByDate = filteredSales.reduce((acc, sale) => {
    const date = new Date(sale.date).toLocaleDateString('ar-LY');
    acc[date] = (acc[date] || 0) + sale.total;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(salesByDate).map(date => ({ name: date, amount: salesByDate[date] })).slice(-7);

  const StatCard = ({ title, value, icon: Icon, color, subValue }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}><Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} /></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">التقارير والتحليلات</h2>
        <div className="flex items-center gap-2">
           <Filter size={18} className="text-gray-500" />
           <select 
             value={filterMethod} 
             onChange={(e) => setFilterMethod(e.target.value as any)}
             className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
           >
             <option value="All">جميع طرق الدفع</option>
             <option value="Cash">كاش (نقدي)</option>
             <option value="Bank Card">بطاقة مصرفية</option>
             <option value="MobiCash">موبي كاش</option>
             <option value="Yusur Pay">يسر باي</option>
             <option value="Masrafy Pay">مصرفي باي</option>
             <option value="Sahary Pay">صحاري باي</option>
             <option value="One Pay">وان باي</option>
             <option value="Transfer">تحويل مصرفي</option>
           </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="صافي المبيعات" 
          value={`${netRevenue.toLocaleString()} د.ل`} 
          subValue={`إجمالي: ${grossRevenue.toLocaleString()}`}
          icon={DollarSign} 
          color="text-green-600 bg-green-600" 
        />
        <StatCard 
          title="صافي الربح" 
          value={`${netProfit.toLocaleString()} د.ل`} 
          icon={Coins} 
          color="text-teal-600 bg-teal-600" 
        />
        <StatCard 
          title="المسترجعات" 
          value={`${totalReturns.toLocaleString()} د.ل`} 
          icon={RotateCcw} 
          color="text-orange-600 bg-orange-600" 
        />
        <StatCard 
          title="نواقص المخزون" 
          value={lowStockProducts} 
          icon={TrendingUp} 
          color="text-red-600 bg-red-600" 
        />
      </div>
      
      {(expiredProducts.length > 0 || expiringSoonProducts.length > 0) && (
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2"><AlertTriangle className="text-orange-500" />تنبيهات الصلاحية</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-right">
               <thead className="text-gray-500 border-b"><tr><th className="pb-2">المنتج</th><th className="pb-2">الباركود</th><th className="pb-2">تاريخ الانتهاء</th><th className="pb-2">الحالة</th></tr></thead>
               <tbody>
                 {expiredProducts.map(p => (<tr key={p.id} className="border-b bg-red-50/50"><td className="py-3 font-medium">{p.name}</td><td className="py-3">{p.sku}</td><td className="py-3 text-red-600" dir="ltr">{new Date(p.expiryDate!).toLocaleDateString('ar-LY')}</td><td className="py-3"><span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">منتهي</span></td></tr>))}
                 {expiringSoonProducts.map(p => (<tr key={p.id} className="border-b hover:bg-orange-50/50"><td className="py-3 font-medium">{p.name}</td><td className="py-3">{p.sku}</td><td className="py-3 text-orange-600" dir="ltr">{new Date(p.expiryDate!).toLocaleDateString('ar-LY')}</td><td className="py-3"><span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-bold">قريب الانتهاء</span></td></tr>))}
               </tbody>
             </table>
           </div>
         </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 text-gray-800">حركة المبيعات (آخر 7 أيام)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                <Bar dataKey="amount" fill="#0F766E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 text-gray-800">تفاصيل المعاملات</h3>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-sm text-right">
              <thead className="text-gray-500 border-b sticky top-0 bg-white">
                <tr>
                  <th className="pb-2">#</th>
                  <th className="pb-2">المبلغ</th>
                  <th className="pb-2">طريقة الدفع</th>
                  <th className="pb-2">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.slice().reverse().map(sale => (
                  <tr key={sale.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-medium text-xs">#{sale.id}</td>
                    <td className="py-3 text-green-600 font-bold">{sale.total} د.ل</td>
                    <td className="py-3 text-gray-500 text-xs">{sale.paymentMethod}</td>
                    <td className="py-3 text-gray-400 text-xs" dir="ltr">{new Date(sale.date).toLocaleDateString('ar-LY')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Reports;
