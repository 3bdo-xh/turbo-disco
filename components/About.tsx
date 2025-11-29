import React from 'react';
import { ShieldCheck, Database, Smartphone, Globe } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
        <div className="w-20 h-20 bg-primary mx-auto rounded-2xl flex items-center justify-center text-white text-4xl font-bold mb-6 shadow-lg shadow-primary/30">
          ن
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">نماء</h2>
        <p className="text-gray-500 text-lg mb-8">منظومة المبيعات الذكية للمشاريع الليبية</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
          <div className="bg-gray-50 p-4 rounded-lg flex gap-4 items-start">
            <div className="bg-white p-2 rounded-lg shadow-sm text-primary">
              <Database size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">تخزين محلي</h3>
              <p className="text-sm text-gray-500">تعمل المنظومة بدون إنترنت ويتم حفظ البيانات على جهازك مباشرة.</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg flex gap-4 items-start">
             <div className="bg-white p-2 rounded-lg shadow-sm text-secondary">
              <Smartphone size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">تصميم متجاوب</h3>
              <p className="text-sm text-gray-500">واجهة سهلة الاستخدام تعمل بكفاءة على الهواتف والأجهزة اللوحية.</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg flex gap-4 items-start">
             <div className="bg-white p-2 rounded-lg shadow-sm text-green-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">خصوصية البيانات</h3>
              <p className="text-sm text-gray-500">بياناتك ملك لك ولا يتم مشاركتها مع أي طرف ثالث.</p>
            </div>
          </div>
          
           <div className="bg-gray-50 p-4 rounded-lg flex gap-4 items-start">
             <div className="bg-white p-2 rounded-lg shadow-sm text-blue-600">
              <Globe size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">دعم محلي</h3>
              <p className="text-sm text-gray-500">مصممة خصيصاً لتناسب السوق الليبي واحتياجاته.</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 text-gray-400 text-sm">
          <p>الإصدار 1.0.0</p>
          <p className="mt-1">تم التطوير بواسطة فريق نماء © 2025</p>
        </div>
      </div>
    </div>
  );
};

export default About;