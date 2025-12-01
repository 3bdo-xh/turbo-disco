
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { ScanBarcode, Camera, CheckCircle, AlertTriangle, ArrowRight, Save, Search, X } from 'lucide-react';

interface StocktakingProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
}

interface Discrepancy {
  id: string;
  name: string;
  sku: string;
  oldStock: number;
  newStock: number;
  diff: number;
}

const Stocktaking: React.FC<StocktakingProps> = ({ products, onUpdateProduct }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [actualStock, setActualStock] = useState<string>('');
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([]);
  
  // Scanner State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const scannerRef = useRef<any>(null);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().then(() => {
            scannerRef.current.clear();
          }).catch((err: any) => console.error(err));
        } catch (e) { }
      }
    };
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const product = products.find(p => p.sku === query);
    if (product) {
      setSelectedProduct(product);
      setActualStock(''); // Reset input
    }
  };

  const handleConfirmUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || actualStock === '') return;

    const newStockVal = parseInt(actualStock);
    const oldStockVal = selectedProduct.stock;
    const diff = newStockVal - oldStockVal;

    // Update the product in DB
    const updatedProduct = { ...selectedProduct, stock: newStockVal };
    onUpdateProduct(updatedProduct);

    // Add to session discrepancy report
    const newDiscrepancy: Discrepancy = {
      id: Date.now().toString(),
      name: selectedProduct.name,
      sku: selectedProduct.sku,
      oldStock: oldStockVal,
      newStock: newStockVal,
      diff: diff
    };

    setDiscrepancies(prev => [newDiscrepancy, ...prev]);
    
    // Play sound
    new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3').play().catch(() => {});

    // Reset
    setSelectedProduct(null);
    setSearchQuery('');
    setActualStock('');
  };

  const startScanner = () => {
    setIsScannerOpen(true);
    setTimeout(() => {
      const html5QrCode = new (window as any).Html5Qrcode("reader-stocktaking");
      scannerRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      html5QrCode.start(
        { facingMode: "environment" }, 
        config,
        (decodedText: string) => {
          handleSearch(decodedText);
          new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3').play().catch(() => {});
          stopScanner();
        },
        (errorMessage: any) => { }
      ).catch((err: any) => {
        setIsScannerOpen(false);
        alert("تعذر تشغيل الكاميرا.");
      });
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current.clear();
        setIsScannerOpen(false);
        scannerRef.current = null;
      });
    } else {
      setIsScannerOpen(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Input Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
           <ScanBarcode className="text-indigo-600" />
           جرد وتعديل الكميات
        </h2>

        {!selectedProduct ? (
          <div className="space-y-4">
            <div className="flex gap-2">
               <div className="relative flex-1">
                <Search className="absolute right-3 top-3 text-gray-400" size={20} />
                <input 
                  autoFocus
                  type="text"
                  placeholder="ادخل الباركود..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <button 
                onClick={startScanner}
                className="bg-indigo-50 text-indigo-600 p-3 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center"
              >
                <Camera size={24} />
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center">قم بمسح الباركود لإظهار تفاصيل المنتج وتعديل الكمية</p>
          </div>
        ) : (
          <form onSubmit={handleConfirmUpdate} className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
             <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="text-lg font-bold text-gray-800">{selectedProduct.name}</h3>
                   <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-indigo-200">{selectedProduct.sku}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-600">المخزون المسجل (الحالي):</span>
                   <span className="font-bold text-indigo-600 text-lg">{selectedProduct.stock}</span>
                </div>
             </div>

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الكمية الفعلية (الجديدة)</label>
                <input 
                  autoFocus
                  type="number" 
                  min="0"
                  required
                  value={actualStock}
                  onChange={(e) => setActualStock(e.target.value)}
                  className="w-full text-center text-3xl font-bold p-3 bg-white border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-gray-800"
                  placeholder="0"
                />
             </div>

             <div className="flex gap-3">
               <button 
                 type="button" 
                 onClick={() => { setSelectedProduct(null); setSearchQuery(''); setActualStock(''); }} 
                 className="flex-1 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
               >
                 إلغاء
               </button>
               <button 
                 type="submit" 
                 className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
               >
                 <Save size={18} />
                 حفظ التعديل
               </button>
             </div>
          </form>
        )}
      </div>

      {/* Discrepancy Report */}
      {discrepancies.length > 0 && (
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
               <AlertTriangle className="text-orange-500" size={20} />
               <h3 className="font-bold text-gray-800">تقرير الفروقات (الجلسة الحالية)</h3>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-right">
                  <thead className="bg-gray-50 text-gray-500">
                     <tr>
                        <th className="p-3">المنتج</th>
                        <th className="p-3 text-center">السابق</th>
                        <th className="p-3 text-center">الجديد</th>
                        <th className="p-3 text-center">الفرق</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {discrepancies.map(item => (
                        <tr key={item.id}>
                           <td className="p-3 font-medium text-gray-800">
                              {item.name}
                              <div className="text-[10px] text-gray-400">{item.sku}</div>
                           </td>
                           <td className="p-3 text-center text-gray-500">{item.oldStock}</td>
                           <td className="p-3 text-center font-bold text-gray-800">{item.newStock}</td>
                           <td className="p-3 text-center">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${item.diff > 0 ? 'bg-green-100 text-green-700' : (item.diff < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600')}`}>
                                 {item.diff > 0 ? `+${item.diff}` : item.diff}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl w-full max-w-sm p-4 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Camera size={20} />
                  مسح الباركود
                </h3>
                <button onClick={stopScanner} className="p-1 hover:bg-gray-100 rounded-full">
                  <X size={24} className="text-gray-600" />
                </button>
              </div>
              <div id="reader-stocktaking" className="w-full h-64 bg-black rounded-lg overflow-hidden"></div>
              <p className="text-center text-sm text-gray-500 mt-4">وجه الكاميرا نحو الباركود</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default Stocktaking;
