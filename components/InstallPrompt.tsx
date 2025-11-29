
import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Smartphone } from 'lucide-react';

const InstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already in standalone mode (app mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Handle Android install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show prompt for iOS users immediately (since there's no event)
    if (isIosDevice) {
      // Delay slightly for better UX
      setTimeout(() => setShowPrompt(true), 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
      });
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in slide-in-from-bottom-10 duration-500">
        <button 
          onClick={() => setShowPrompt(false)} 
          className="absolute left-4 top-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-primary/20">
            <Smartphone size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">تثبيت التطبيق</h3>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            لضمان عمل المنظومة بدون إنترنت وبأفضل كفاءة، يرجى تثبيتها على هاتفك الآن.
          </p>

          {isIOS ? (
            <div className="bg-gray-50 rounded-xl p-4 w-full text-right space-y-3 border border-gray-100">
              <div className="flex items-center gap-3 text-gray-700">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs shrink-0">1</span>
                <span>اضغط على زر المشاركة <Share className="inline mx-1" size={16} /> في الأسفل</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                 <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <span>اختر <strong>"إضافة إلى الشاشة الرئيسية"</strong></span>
              </div>
               <div className="flex items-center gap-3 text-gray-700">
                 <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <span>اضغط <strong>"إضافة"</strong> (Add)</span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleInstallClick}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-teal-800 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Download size={20} />
              تثبيت التطبيق الآن
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
