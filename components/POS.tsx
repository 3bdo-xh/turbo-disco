
import React, { useState, useRef, useEffect } from 'react';
import { Product, CartItem, Sale, PaymentMethod, StoreSettings } from '../types';
import { ShoppingCart, Plus, Minus, Printer, Check, ArrowRight, Search, X, ScanBarcode, Camera, Store, FileText, Calendar, Clock, User, Phone, MapPin, Banknote } from 'lucide-react';

interface POSProps {
  products: Product[];
  onCompleteSale: (sale: Sale) => void;
  storeSettings?: StoreSettings;
  nextInvoiceId: string;
}

const POS: React.FC<POSProps> = ({ products, onCompleteSale, storeSettings, nextInvoiceId }) => {
  const [viewMode, setViewMode] = useState<'METHOD_SELECTION' | 'POS' | 'RECEIPT'>('METHOD_SELECTION');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  // Cash Payment Modal State
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [cashAmountPaid, setCashAmountPaid] = useState<string>('');
  
  const scannerRef = useRef<any>(null);

  const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; imageUrls: string[]; bg: string }[] = [
    { 
      id: 'Cash', 
      label: 'كاش (نقدي)', 
      imageUrls: ['https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/ff3809145240381.629a6c2486a84.png'],
      bg: 'hover:bg-green-50 hover:border-green-200'
    },
    { 
      id: 'Bank Card', 
      label: 'بطاقة مصرفية', 
      imageUrls: ['https://merchant.moamalat.net/images/logo.png'],
      bg: 'hover:bg-purple-50 hover:border-purple-200'
    },
    { 
      id: 'MobiCash', 
      label: 'موبي كاش', 
      imageUrls: ['https://masarat.ly/ms_uploads/2025/11/Asset-20.svg'],
      bg: 'hover:bg-teal-50 hover:border-teal-200'
    },
    { 
      id: 'Yusur Pay', 
      label: 'يُسر باي', 
      imageUrls: ['https://masarat.ly/ms_uploads/2025/11/Asset-3-1.svg'],
      bg: 'hover:bg-blue-50 hover:border-blue-200'
    },
    { 
      id: 'Masrafy Pay', 
      label: 'مصرفي باي', 
      imageUrls: ['https://masarat.ly/ms_uploads/2025/10/MAsrafy-Pay-Icon.svg'],
      bg: 'hover:bg-indigo-50 hover:border-indigo-200'
    },
    { 
      id: 'Sahary Pay', 
      label: 'الصحاري باي', 
      imageUrls: ['https://masarat.ly/ms_uploads/2025/11/Asset-6-1.svg'],
      bg: 'hover:bg-yellow-50 hover:border-yellow-200'
    },
    { 
      id: 'One Pay', 
      label: 'وان باي (QR)', 
      imageUrls: ['https://masarat.ly/ms_uploads/2025/10/OnePay-Full-Logo.svg'],
      bg: 'hover:bg-red-50 hover:border-red-200'
    },
    { 
      id: 'Transfer', 
      label: 'تحويل مصرفي', 
      imageUrls: ['https://a.top4top.io/p_3619krjt10.jpeg', 'https://b.top4top.io/p_3619vif531.jpeg'],
      bg: 'hover:bg-gray-50 hover:border-gray-200'
    }
  ];

  // Cleanup scanner
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().then(() => {
            scannerRef.current.clear();
          }).catch((err: any) => console.error(err));
        } catch (e) {}
      }
    };
  }, []);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert("عذراً، هذا المنتج نفذ من المخزون.");
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
           alert("لا تتوفر كمية إضافية في المخزون لهذا المنتج.");
           return prev;
        }
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId: product.id, productName: product.name, price: product.price, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const product = products.find(p => p.id === productId);
        const maxStock = product ? product.stock : 0;
        if (delta > 0 && item.quantity >= maxStock) {
           alert("لقد وصلت للحد الأقصى المتوفر في المخزون.");
           return item;
        }
        return { ...item, quantity: Math.max(1, Math.min(item.quantity + delta, maxStock)) };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const initiateCheckout = () => {
    if (cart.length === 0 || !selectedPaymentMethod) return;

    // Check Stock
    const outOfStockItems = cart.filter(item => {
      const product = products.find(p => p.id === item.productId);
      return !product || product.stock < item.quantity;
    });
    if (outOfStockItems.length > 0) {
      alert(`عذراً، الكمية المطلوبة غير متوفرة: ${outOfStockItems.map(i => i.productName).join(', ')}`);
      return;
    }

    // If Cash, open modal
    if (selectedPaymentMethod === 'Cash') {
      setIsCashModalOpen(true);
      setCashAmountPaid('');
    } else {
      finalizeSale();
    }
  };

  const finalizeSale = (amountPaid?: number, change?: number) => {
    if (!selectedPaymentMethod) return;

    const newSale: Sale = {
      id: nextInvoiceId,
      items: [...cart],
      total: cartTotal,
      date: Date.now(),
      paymentMethod: selectedPaymentMethod,
      amountPaid: amountPaid,
      change: change
    };

    onCompleteSale(newSale);
    setLastSale(newSale);
    setCart([]);
    setViewMode('RECEIPT');
    setIsCashModalOpen(false);
  };

  const handleCashConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const paid = Number(cashAmountPaid);
    if (paid < cartTotal) {
      alert("المبلغ المدفوع أقل من إجمالي الفاتورة");
      return;
    }
    const change = paid - cartTotal;
    finalizeSale(paid, change);
  };

  const startScanner = () => {
    setIsScannerOpen(true);
    setTimeout(() => {
      const html5QrCode = new (window as any).Html5Qrcode("reader-pos");
      scannerRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      html5QrCode.start(
        { facingMode: "environment" }, 
        config,
        (decodedText: string) => {
          const product = products.find(p => p.sku === decodedText);
          if (product && product.stock > 0) {
             addToCart(product);
             new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3').play().catch(() => {});
             stopScanner();
          } else {
             alert(product ? 'المنتج نفذ من المخزون' : 'المنتج غير موجود');
             // Don't stop scanner, let user try another
          }
        },
        () => {}
      ).catch((err: any) => {
        console.error("Scanner Error", err);
        alert("تعذر تشغيل الكاميرا");
        setIsScannerOpen(false);
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

  const renderPaymentLogo = (urls: string[]) => {
    if (urls.length === 0) return null;
    if (urls.length === 1) return <img src={urls[0]} alt="Logo" className="h-8 md:h-12 w-auto object-contain" />;
    return (
      <div className="flex items-center justify-center gap-1 h-8 md:h-12 w-full">
         <img src={urls[0]} alt="Logo 1" className="h-full w-1/2 object-contain" />
         <div className="w-px h-6 bg-gray-300 mx-1"></div>
         <img src={urls[1]} alt="Logo 2" className="h-full w-1/2 object-contain" />
      </div>
    );
  };

  const selectedOption = PAYMENT_OPTIONS.find(opt => opt.id === selectedPaymentMethod);

  // Receipt View
  if (viewMode === 'RECEIPT' && lastSale) {
    const saleDate = new Date(lastSale.date);
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] py-8 bg-gray-50">
        <style>
          {`
            @media print {
              body * { visibility: hidden; }
              #receipt-content, #receipt-content * { visibility: visible; }
              #receipt-content { 
                position: absolute; 
                left: 0; 
                top: 0; 
                width: 100%; 
                margin: 0;
                padding: 0;
                background: white;
                color: black;
                border: none;
                box-shadow: none;
              }
              .no-print { display: none !important; }
              @page { margin: 0; size: auto; }
            }
          `}
        </style>

        <div id="receipt-content" className="bg-white w-[380px] p-4 shadow-xl border border-gray-100 relative text-gray-900 text-sm font-sans">
          
          {/* Header */}
          <div className="text-center mb-4">
             <div className="flex justify-center mb-2">
                <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center">
                   <ShoppingCart size={24} />
                </div>
             </div>
            <h1 className="text-xl font-bold mb-1 text-black">{storeSettings?.storeName || 'اسم المتجر'}</h1>
            {storeSettings?.description && (
               <p className="text-gray-600 text-xs mb-1 font-medium">{storeSettings.description}</p>
            )}
            
            <div className="flex flex-col items-center text-xs text-gray-500 gap-0.5 mt-2">
               {storeSettings?.address && (
                  <span className="flex items-center gap-1"><MapPin size={10} /> {storeSettings.address}</span>
               )}
               {storeSettings?.phone && (
                  <span className="flex items-center gap-1" dir="ltr"><Phone size={10} /> {storeSettings.phone}</span>
               )}
            </div>
          </div>

          <div className="border-b-2 border-dashed border-gray-300 my-2"></div>

          {/* Meta Data */}
          <div className="grid grid-cols-2 gap-y-1 text-xs text-gray-600 mb-3">
             <div className="flex items-center gap-1"><Calendar size={12}/> {saleDate.toLocaleDateString('ar-LY')}</div>
             <div className="flex items-center gap-1 justify-end"><Clock size={12}/> {saleDate.toLocaleTimeString('ar-LY', {hour: '2-digit', minute:'2-digit'})}</div>
             <div className="flex items-center gap-1"><FileText size={12}/> فاتورة #{lastSale.id}</div>
             {lastSale.userName && <div className="flex items-center gap-1 justify-end"><User size={12}/> {lastSale.userName}</div>}
          </div>

          <div className="border-b border-gray-200 mb-2"></div>

          {/* Items Table */}
          <div className="mb-4">
             <table className="w-full text-right">
                <thead>
                   <tr className="text-[10px] font-bold text-gray-800 border-b border-gray-300">
                      <th className="pb-1 w-[45%]">الصنف</th>
                      <th className="pb-1 text-center">الكمية</th>
                      <th className="pb-1 text-center">السعر</th>
                      <th className="pb-1 text-left">المجموع</th>
                   </tr>
                </thead>
                <tbody className="text-gray-900 text-xs">
                   {lastSale.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 last:border-0">
                         <td className="py-2 align-top font-medium">
                            {item.productName}
                         </td>
                         <td className="py-2 text-center align-top">{item.quantity}</td>
                         <td className="py-2 text-center align-top">{item.price}</td>
                         <td className="py-2 text-left font-bold align-top">{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>

          <div className="border-b-2 border-dashed border-gray-300 mb-3"></div>

          {/* Totals */}
          <div className="space-y-1 mb-6">
             <div className="flex justify-between items-center text-lg font-bold text-black bg-gray-100 p-2 rounded">
                <span>الإجمالي</span>
                <span>{lastSale.total.toFixed(2)} د.ل</span>
             </div>
             
             {/* Cash Details */}
             {lastSale.paymentMethod === 'Cash' && lastSale.amountPaid !== undefined && (
               <div className="flex flex-col gap-1 px-2 pt-1 border-b border-gray-200 pb-2 mb-2">
                 <div className="flex justify-between text-xs">
                    <span>المدفوع (نقداً)</span>
                    <span className="font-bold">{lastSale.amountPaid.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span>الباقي</span>
                    <span className="font-bold">{lastSale.change?.toFixed(2)}</span>
                 </div>
               </div>
             )}

             <div className="flex justify-between items-center text-xs text-gray-600 px-2 mt-2">
                <span>طريقة الدفع</span>
                <span className="font-bold border border-gray-300 px-2 rounded">{PAYMENT_OPTIONS.find(opt => opt.id === lastSale.paymentMethod)?.label}</span>
             </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-2 pt-2">
             <div className="flex justify-center mb-2">
                {/* Simulated Barcode */}
                <div className="flex gap-0.5 h-8 items-end opacity-80">
                   {[...Array(25)].map((_, i) => (
                      <div key={i} className={`w-${Math.random() > 0.5 ? '1' : '0.5'} bg-black h-${Math.random() > 0.5 ? 'full' : '3/4'}`}></div>
                   ))}
                </div>
             </div>
             <p className="font-bold text-gray-800 text-sm">شكراً لزيارتكم!</p>
             <p className="text-[10px] text-gray-400">سياسة الاسترجاع: خلال 3 أيام مع إبراز الفاتورة</p>
          </div>
          
          {/* Jagged Bottom Effect (Visual only) */}
          <div className="absolute -bottom-1.5 left-0 w-full h-2 bg-transparent no-print" style={{backgroundImage: 'radial-gradient(circle, transparent 50%, white 50%)', backgroundSize: '10px 10px', transform: 'rotate(180deg)'}}></div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-3 w-[380px] no-print">
          <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 border border-gray-300 py-3 rounded-xl font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all">
            <Printer size={18} /> طباعة
          </button>
          <button onClick={() => { setViewMode('METHOD_SELECTION'); setSelectedPaymentMethod(null); }} className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold hover:bg-teal-800 shadow-lg shadow-primary/20 transition-all">
            <Plus size={18} /> بيع جديد
          </button>
        </div>
      </div>
    );
  }

  // Payment Selection View
  if (viewMode === 'METHOD_SELECTION') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-4xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">اختر طريقة الدفع</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
          {PAYMENT_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => { setSelectedPaymentMethod(option.id); setViewMode('POS'); }}
              className={`flex flex-col items-center justify-center p-6 bg-white border-2 border-gray-100 rounded-2xl shadow-sm transition-all active:scale-95 ${option.bg} group h-32 md:h-40`}
            >
              <div className="h-14 w-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                 {renderPaymentLogo(option.imageUrls)}
              </div>
              <span className="font-bold text-gray-700 text-sm md:text-base text-center">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Main POS View
  return (
    <div className="flex flex-col h-[calc(100vh-70px)] md:h-[calc(100vh-100px)] overflow-hidden">
      <div className="flex flex-col items-center justify-center py-2 mb-2 bg-white rounded-xl shadow-sm border border-gray-100 shrink-0">
          <div className="h-10 mb-1">{selectedOption && renderPaymentLogo(selectedOption.imageUrls)}</div>
          <button onClick={() => setViewMode('METHOD_SELECTION')} className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-gray-200">
             {selectedOption?.label} <span className="text-gray-400 text-[10px]">(تغيير)</span>
          </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 shrink-0 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" placeholder="بحث عن منتج..." value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <button onClick={startScanner} className="bg-gray-100 text-gray-600 p-3 rounded-lg hover:bg-gray-200 hover:text-primary transition-colors flex items-center justify-center">
                <ScanBarcode size={24} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.includes(productSearch)).map(product => (
                  <button key={product.id} onClick={() => addToCart(product)} disabled={product.stock <= 0}
                    className={`flex flex-col items-start p-3 rounded-xl border transition-all text-right ${product.stock > 0 ? 'bg-white border-gray-100 hover:border-primary hover:shadow-md active:scale-95' : 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed'}`}>
                    <span className="font-bold text-gray-800 line-clamp-1">{product.name}</span>
                    <span className="text-xs text-gray-500 mb-2">{product.category}</span>
                    <div className="mt-auto w-full flex justify-between items-end">
                       <span className="font-bold text-primary">{product.price} د.ل</span>
                       <span className={`text-xs px-1.5 py-0.5 rounded ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{product.stock}</span>
                    </div>
                  </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-sm border-t md:border border-gray-100 w-full md:w-96 shrink-0 flex flex-col md:rounded-xl md:h-full fixed bottom-0 left-0 right-0 z-20 md:static md:z-0 max-h-[50vh] md:max-h-none">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
            <div className="flex items-center gap-2"><ShoppingCart className="text-primary" size={20} /><h3 className="font-bold text-gray-800">سلة المشتريات</h3></div>
            <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">{cart.reduce((a,c) => a + c.quantity, 0)}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[120px]">
            {cart.map(item => (
                <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex-1"><div className="font-bold text-gray-800 text-sm line-clamp-1">{item.productName}</div><div className="text-primary text-sm font-bold">{item.price * item.quantity} د.ل</div></div>
                  <div className="flex items-center gap-3 bg-white rounded-lg px-2 py-1 shadow-sm border border-gray-100">
                    <button onClick={() => updateQuantity(item.productId, -1)} className="text-gray-500 hover:text-red-500 p-1"><Minus size={14} /></button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, 1)} className="text-gray-500 hover:text-green-500 p-1"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)} className="mr-3 text-red-400 hover:text-red-600"><X size={16} /></button>
                </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-100 pb-safe md:pb-4 rounded-b-xl">
            <div className="flex justify-between items-center mb-4"><span className="text-gray-600">المجموع الكلي</span><span className="text-2xl font-bold text-primary">{cartTotal.toFixed(2)} د.ل</span></div>
            <button onClick={initiateCheckout} disabled={cart.length === 0} className={`w-full py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all ${cart.length > 0 ? 'bg-primary text-white hover:bg-teal-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
              <span>إتمام البيع</span><ArrowRight size={20} className="rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl w-full max-w-sm p-4"><div id="reader-pos" className="w-full h-64 bg-black rounded-lg overflow-hidden"></div><button onClick={stopScanner} className="mt-4 w-full bg-red-100 text-red-600 py-2 rounded-lg">إغلاق</button></div>
        </div>
      )}

      {/* Cash Payment Modal */}
      {isCashModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95">
             <div className="flex justify-between items-start mb-6">
               <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Banknote className="text-green-600" />
                    دفع نقدي
                  </h3>
                  <p className="text-sm text-gray-500">الرجاء إدخال المبلغ المستلم</p>
               </div>
               <button onClick={() => setIsCashModalOpen(false)} className="text-gray-400 hover:text-red-500"><X size={24} /></button>
             </div>

             <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                <div className="flex justify-between text-lg font-bold">
                   <span className="text-gray-600">المطلوب:</span>
                   <span className="text-primary">{cartTotal.toFixed(2)} د.ل</span>
                </div>
             </div>

             <form onSubmit={handleCashConfirm} className="space-y-6">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المبلغ المدفوع</label>
                  <input 
                    autoFocus
                    type="number"
                    step="any"
                    min={cartTotal}
                    required
                    value={cashAmountPaid}
                    onChange={(e) => setCashAmountPaid(e.target.value)}
                    className="w-full text-center text-3xl font-bold p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none transition-all text-gray-800"
                    placeholder="0.00"
                  />
               </div>

               {Number(cashAmountPaid) >= cartTotal && (
                 <div className="text-center animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm text-gray-500 mb-1">الباقي (المرتجع)</p>
                    <p className="text-3xl font-bold text-green-600">{(Number(cashAmountPaid) - cartTotal).toFixed(2)} د.ل</p>
                 </div>
               )}

               <button 
                  type="submit"
                  disabled={Number(cashAmountPaid) < cartTotal}
                  className={`w-full py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all ${Number(cashAmountPaid) >= cartTotal ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  <Check size={20} />
                  تأكيد وطباعة
                </button>
             </form>
          </div>
        </div>
      )}

      <div className="h-[350px] md:hidden shrink-0"></div> 
    </div>
  );
};
export default POS;
