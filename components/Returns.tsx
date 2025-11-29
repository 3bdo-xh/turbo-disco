
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { Search, RotateCcw, CheckCircle, Camera, X } from 'lucide-react';

interface ReturnsProps {
  products: Product[];
  onReturnProduct: (productId: string, quantity: number, reason: string) => void;
}

const Returns: React.FC<ReturnsProps> = ({ products, onReturnProduct }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
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
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.includes(searchQuery)
  );

  const handleReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProduct && quantity > 0) {
      onReturnProduct(selectedProduct.id, quantity, reason);
      
      // Reset and show success
      setSuccessMsg(`تم استرجاع ${quantity} قطعة من ${selectedProduct.name} إلى المخزون.`);
      setSelectedProduct(null);
      setQuantity(1);
      setReason('');
      setSearchQuery('');

      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const startScanner = () => {
    setIsScannerOpen(true);
    setTimeout(() => {
      const html5QrCode = new (window as any).Html5Qrcode("reader-returns");
      scannerRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      html5QrCode.start(
        { facingMode: "environment" }, 
        config,
        (decodedText: string) => {
          setSearchQuery(decodedText);
          
          // Audio feedback
          const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3');
          audio.play().catch(() => {});
          
          stopScanner();
        },
        (errorMessage: any) => {
          // ignore
        }
      ).catch((err: any) => {
        console.error("Error starting scanner", err);
        setIsScannerOpen(false);
        alert("تعذر تشغيل الكاميرا. يرجى التأكد من منح الصلاحيات.");
      });
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current.clear();
        setIsScannerOpen(false);
        scannerRef.current = null;
      }).catch((err: any) => {
        console.error("Failed to stop scanner", err);
        setIsScannerOpen(false);
      });
    } else {
      setIsScannerOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <RotateCcw className="text-red-500" />
          استرجاع منتج للمخزون
        </h2>
        
        {successMsg && (
          <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6 flex items-center gap-2">
            <CheckCircle size={20} />
            {successMsg}
          </div>
        )}

        {!selectedProduct ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-3 text-gray-400" size={20} />
                <input 
                  type="text"
                  placeholder="ابحث عن المنتج (الاسم أو الباركود)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                />
              </div>
              <button 
                onClick={startScanner}
                className="bg-gray-100 text-gray-600 p-3 rounded-lg hover:bg-gray-200 hover:text-red-500 transition-colors flex items-center justify-center"
                title="مسح باركود"
              >
                <Camera size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all text-right group bg-white"
                >
                  <div>
                    <div className="font-bold text-gray-800 group-hover:text-red-700">{product.name}</div>
                    <div className="text-sm text-gray-500">الحالي: {product.stock} قطعة</div>
                    <div className="text-xs text-gray-400 mt-1">{product.sku}</div>
                  </div>
                  <div className="text-primary font-bold">{product.price} د.ل</div>
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center text-gray-400 py-4">لا توجد نتائج</div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleReturn} className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">المنتج المحدد</div>
              <div className="text-lg font-bold text-gray-800">{selectedProduct.name}</div>
              <div className="text-sm text-gray-600">المخزون الحالي: {selectedProduct.stock}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الكمية المسترجعة</label>
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-xl font-bold text-gray-700 transition-colors">-</button>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="flex-1 h-12 text-center text-xl font-bold bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-gray-800"
                />
                <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-xl font-bold text-gray-700 transition-colors">+</button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">سبب الاسترجاع (اختياري)</label>
              <textarea 
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-gray-800 transition-all"
                placeholder="مثال: المنتج تالف، الزبون غير رأيه..."
              />
            </div>

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setSelectedProduct(null)} 
                className="flex-1 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                إلغاء
              </button>
              <button 
                type="submit" 
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg shadow-red-600/20 transition-all active:scale-95"
              >
                تأكيد الاسترجاع
              </button>
            </div>
          </form>
        )}
      </div>

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
              <div id="reader-returns" className="w-full h-64 bg-black rounded-lg overflow-hidden"></div>
              <p className="text-center text-sm text-gray-500 mt-4">وجه الكاميرا نحو الباركود</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default Returns;
