"use client";

import { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X, MoreVertical } from "lucide-react";

export default function InstallAppModal() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  useEffect(() => {
    // التحقق مما إذا كان الجهاز آيفون/آيباد لمعرفة شكل القائمة
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // التثبيت المباشر للمتصفحات الداعمة
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else {
      // إظهار نافذة الشرح للمتصفحات التي تمنع التثبيت المباشر (مثل DuckDuckGo و Safari)
      setShowManualModal(true);
    }
  };

  return (
    <>
      {/* زر التثبيت في الصفحة */}
      <button 
        onClick={handleInstallClick} 
        className="bg-[#c29b57] w-full rounded-xl md:rounded-[1.5rem] py-3 md:py-4 px-2 flex items-center justify-center gap-2 shadow-sm hover:bg-[#b08945] transition"
      >
        <div className="text-right">
          <h3 className="font-bold text-[#0f172a] text-[10px] md:text-base mb-0.5">تثبيت التطبيق</h3>
          <p className="text-[#0f172a]/80 text-[7px] md:text-xs">ثبت ميثاق على جهازك</p>
        </div>
        <div className="shrink-0 text-[#0f172a]">
          <Download size={20} strokeWidth={2} />
        </div>
      </button>

      {/* النافذة المنبثقة الذكية للشرح اليدوي */}
      {showManualModal && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10" dir="rtl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[#0f172a] text-lg">خطوة بسيطة للتثبيت</h3>
              <button onClick={() => setShowManualModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition">
                <X size={18} />
              </button>
            </div>
            
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              لحماية خصوصيتك، يرجى إضافة <strong>ميثاق</strong> لشاشتك الرئيسية بخطوتين بسيطتين:
            </p>

            <div className="space-y-4">
              {isIOS ? (
                // شرح خاص بالآيفون (سفاري)
                <>
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                      <Share size={20} className="text-blue-500" />
                    </div>
                    <p className="text-sm text-slate-700 font-medium">1. اضغط على أيقونة <strong>المشاركة</strong> في أسفل المتصفح.</p>
                  </div>
                </>
              ) : (
                // شرح عام لباقي المتصفحات مثل (DuckDuckGo, Firefox)
                <>
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                      <MoreVertical size={20} className="text-slate-700" />
                    </div>
                    <p className="text-sm text-slate-700 font-medium">1. افتح <strong>قائمة المتصفح</strong> (الثلاث نقاط في الأعلى أو الأسفل).</p>
                  </div>
                </>
              )}

              {/* الخطوة الثانية مشتركة للجميع */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                  <PlusSquare size={20} className="text-slate-700" />
                </div>
                <p className="text-sm text-slate-700 font-medium">2. اختر <strong>إضافة للشاشة الرئيسية</strong> <br/><span className="text-xs text-slate-400" dir="ltr">(Add to Home Screen)</span></p>
              </div>
            </div>

            <button onClick={() => setShowManualModal(false)} className="w-full mt-6 bg-[#0f172a] text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition shadow-md">
              حسناً، فهمت
            </button>
          </div>
        </div>
      )}
    </>
  );
}
