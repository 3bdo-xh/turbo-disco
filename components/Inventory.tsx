
import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { Plus, Search, Trash2, Edit2, Barcode, Camera, RefreshCw, X, Calendar, AlertCircle, AlertTriangle } from 'lucide-react';

interface InventoryProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, onAddProduct, onDeleteProduct }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Scanner State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanTarget, setScanTarget] = useState<'SEARCH' | 'SKU' | null>(null);
  const scannerRef = useRef<any>(null);

  // New Product Form State
  const [newProduct, setNewProduct] = useState<Partial<Product> & { expiryDateString?: string }>({
    name: '',
    sku: '',
    price: 0,
    cost: 0,
    stock: 0,
    category: '',
    expiryDateString: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProduct.name && newProduct.price) {
      onAddProduct({
        id: Date.now().toString(),
        name: newProduct.name!,
        sku: newProduct.sku || Math.floor(1000 + Math.random() * 9000).toString(), // Default 4-digit SKU if empty
        price: Number(newProduct.price),
        cost: Number(newProduct.cost || 0),
        stock: Number(newProduct.stock || 0),
        category: newProduct.category || 'عام',
        expiryDate: newProduct.expiryDateString ? new Date(newProduct.expiryDateString).getTime() : undefined
      });
      setIsModalOpen(false);
      setNewProduct({ name: '', sku: '', price: 0, cost: 0, stock: 0, category: '', expiryDateString: '' });
    }
  };

  const confirmDelete = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (productToDelete) {
      onDeleteProduct(productToDelete.id);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const generateBarcode = () => {
    let isUnique = false;
    let randomBarcode = '';
    let attempts = 0;

    // Try to generate a unique 4-digit barcode
    while (!isUnique && attempts < 1000) {
      randomBarcode = Math.floor(1000 + Math.random() * 9000).toString();
      // Check if this SKU already exists in the products list
      const exists = products.some(p => p.sku === randomBarcode);
      if (!exists) {
        isUnique = true;
      }
      attempts++;
    }

    if (isUnique) {
      setNewProduct({ ...newProduct, sku: randomBarcode });
    } else {
      alert("تعذر توليد باركود مميز (قد تكون الذاكرة ممتلئة)، يرجى الإدخال يدوياً");
    }
  };

  const startScanner = (target: 'SEARCH' | 'SKU') => {
    setScanTarget(target);
    setIsScannerOpen(true);
    setTimeout(() => {
      const html5QrcodeScanner = new (window as any).Html5QrcodeScanner(
        "reader-inventory",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      
      html5QrcodeScanner.render((decodedText: string) => {
        if (target === 'SEARCH') {
          setSearchQuery(decodedText);
        } else if (target === 'SKU') {
          setNewProduct(prev => ({ ...prev, sku: decodedText }));
        }
        
        // Audio feedback
        const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3');
        audio.play().catch(() => {});
        
        html5QrcodeScanner.clear();
        setIsScannerOpen(false);
        setScanTarget(null);
      }, (errorMessage: any) => {
        // ignore errors
      });

      scannerRef.current = html5QrcodeScanner;
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
    }
    setIsScannerOpen(false);
    setScanTarget(null);
  };

  const getExpiryStatus = (expiryDate?: number) => {
    if (!expiryDate) return null;
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    
    if (expiryDate < now) {
      return { label: 'منتهي', style: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500', text: 'text-red-600' };
    }
    if (expiryDate < now + thirtyDays) {
      return { label: 'قريب الانتهاء', style: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500', text: 'text-orange-600' };
    }
    return null;
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">المخزون والمنتجات</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-teal-800 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          <span>إضافة منتج</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-3 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="بحث عن منتج (الاسم أو الباركود)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button 
            onClick={() => startScanner('SEARCH')}
            className="bg-gray-100 text-gray-600 p-3 rounded-lg hover:bg-gray-200 hover:text-primary transition-colors flex items-center justify-center"
            title="مسح باركود للبحث"
          >
            <Camera size={24} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="p-4">المنتج / الباركود</th>
                <th className="p-4">التكلفة (شراء)</th>
                <th className="p-4">السعر (بيع)</th>
                <th className="p-4">المخزون</th>
                <th className="p-4">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map(product => {
                const expiryStatus = getExpiryStatus(product.expiryDate);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium text-gray-800 flex items-center gap-2">
                        {product.name}
                        {expiryStatus && (
                          <span className={`w-2.5 h-2.5 rounded-full ${expiryStatus.dot} animate-pulse`} title={expiryStatus.label}></span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Barcode size={12} />
                          {product.sku}
                        </div>
                        {product.expiryDate && (
                          <div className={`text-xs flex items-center gap-1.5 ${expiryStatus ? expiryStatus.text : 'text-gray-500'}`}>
                            <Calendar size={12} />
                            {new Date(product.expiryDate).toLocaleDateString('ar-LY')}
                            {expiryStatus && (
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${expiryStatus.style}`}>
                                {expiryStatus.label}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{product.cost} د.ل</td>
                    <td className="p-4 font-bold text-primary">{product.price} د.ل</td>
                    <td className={`p-4 font-medium ${product.stock < 5 ? 'text-red-600' : 'text-green-600'}`}>
                      {product.stock}
                    </td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => confirmDelete(product)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="حذف">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">لا توجد منتجات مطابقة</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200 h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-gray-800">إضافة منتج جديد</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج</label>
                <input 
                  required 
                  type="text" 
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={newProduct.name} 
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الباركود (SKU)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pl-10"
                      value={newProduct.sku} 
                      onChange={e => setNewProduct({...newProduct, sku: e.target.value})} 
                      placeholder="امسح او ادخل الكود"
                    />
                    <Barcode className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  </div>
                  <button 
                    type="button"
                    onClick={generateBarcode}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2.5 rounded-lg transition-colors"
                    title="توليد باركود (4 أرقام)"
                  >
                    <RefreshCw size={20} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => startScanner('SKU')}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2.5 rounded-lg transition-colors"
                    title="مسح بالكاميرا"
                  >
                    <Camera size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">سعر الشراء (التكلفة)</label>
                  <input 
                    required 
                    type="number" 
                    min="0" 
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={newProduct.cost || ''} 
                    onChange={e => setNewProduct({...newProduct, cost: Number(e.target.value)})} 
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">سعر البيع</label>
                  <input 
                    required 
                    type="number" 
                    min="0" 
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={newProduct.price || ''} 
                    onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} 
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الكمية</label>
                  <input 
                    required 
                    type="number" 
                    min="0" 
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={newProduct.stock || ''} 
                    onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} 
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
                   <input 
                    type="text" 
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={newProduct.category} 
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})} 
                    placeholder="عام" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الصلاحية (اختياري)</label>
                <div className="relative">
                   <Calendar className="absolute right-3 top-3 text-gray-400" size={18} />
                   <input 
                     type="date" 
                     className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 pr-10 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                     value={newProduct.expiryDateString} 
                     onChange={e => setNewProduct({...newProduct, expiryDateString: e.target.value})} 
                   />
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4 border border-red-100 shadow-sm">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">تأكيد الحذف</h3>
              <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                هل أنت متأكد من رغبتك في حذف المنتج <span className="font-bold text-gray-800">"{productToDelete.name}"</span>؟
                <br />
                <span className="text-red-500 font-medium">لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.</span>
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  onClick={executeDelete}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 transition-colors"
                >
                  نعم، احذف
                </button>
              </div>
            </div>
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
              <div id="reader-inventory" className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden"></div>
              <p className="text-center text-sm text-gray-500 mt-4">وجه الكاميرا نحو الباركود</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
