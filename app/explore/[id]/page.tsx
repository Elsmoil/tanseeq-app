// app/explore/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, MapPin, ShieldCheck, HeartHandshake, Info, Loader2 } from "lucide-react";
import PlaceholderAvatar from "@/components/PlaceholderAvatar";
import { databases } from "@/lib/appwrite";

export default function RequestDetails() {
  const params = useParams();
  const router = useRouter();
  const reqId = params.id as string;

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!reqId) return;

    const fetchRequestDetails = async () => {
      try {
        const doc = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DB_ID as string,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID as string,
          reqId
        );
        setRequest(doc);
      } catch (err) {
        console.error("Error fetching request:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [reqId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f8fafc]">
        <Loader2 className="w-12 h-12 text-[#c29b57] animate-spin mb-4" />
        <h2 className="text-xl font-bold text-[#0f172a]">جاري تحميل تفاصيل الطلب...</h2>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f8fafc]">
        <h2 className="text-xl font-bold text-[#0f172a] mb-4">الطلب غير موجود أو تم حذفه</h2>
        <button onClick={() => router.back()} className="px-8 py-3 bg-[#0f172a] text-white rounded-full font-bold hover:bg-[#1e293b] transition">
          العودة للاستكشاف
        </button>
      </div>
    );
  }

  const isMen = request.type === "men" || request.type === "رجال" || request.gender === "ذكر";
  const originDisplay = request.origin === "قبلي" && request.tribe_name 
    ? `قبلي (${request.tribe_name})` 
    : request.origin;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 md:pb-10 pt-4 md:pt-10 px-4 flex justify-center" dir="rtl">
      <div className="max-w-2xl w-full">
        
        {/* شريط التنقل العلوي */}
        <div className="flex justify-between items-center mb-6 px-2">
          <button onClick={() => router.back()} className="w-10 h-10 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center text-[#0f172a] hover:bg-slate-50 transition">
            <ChevronRight size={20} />
          </button>
          <span className="font-bold text-[#0f172a]" dir="ltr">
            طلب {request.request_id || `#${request.$id.substring(0,5)}`}
          </span>
          <div className="w-10"></div>
        </div>

        {/* الكرت الرئيسي */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className={`h-24 ${isMen ? 'bg-[#0f172a]/5' : 'bg-[#c29b57]/10'} flex items-center justify-center relative border-b border-slate-100`}>
             <div className="absolute -bottom-10 w-20 h-20 bg-white rounded-full p-1.5 shadow-sm border border-slate-100">
                <PlaceholderAvatar gender={isMen ? "men" : "women"} className="w-full h-full" />
             </div>
          </div>
          
          <div className="pt-14 pb-8 px-6 text-center border-b border-slate-50">
            <h2 className="text-xl font-bold text-[#0f172a] mb-1">{request.age} سنة</h2>
            <div className="flex items-center justify-center text-sm text-slate-500 gap-2 font-medium">
              <MapPin size={14} className="text-[#c29b57]" /> {request.region || request.city}
            </div>
          </div>

          <div className="p-6 md:p-8">
            <h3 className="font-bold text-[#0f172a] mb-5 flex items-center gap-2">
              <Info size={18} className="text-[#c29b57]" /> المعلومات الأساسية
            </h3>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8 text-sm">
              <div>
                <span className="block text-slate-400 text-xs mb-1.5">المستوى التعليمي</span>
                <span className="font-bold text-slate-700">{request.education_level || "غير محدد"}</span>
              </div>
              <div>
                <span className="block text-slate-400 text-xs mb-1.5">المهنة</span>
                <span className="font-bold text-slate-700">{request.job || "غير محدد"}</span>
              </div>
              <div>
                <span className="block text-slate-400 text-xs mb-1.5">الحالة الاجتماعية</span>
                <span className="font-bold text-slate-700">{request.social_status || "غير محدد"}</span>
              </div>
              <div>
                <span className="block text-slate-400 text-xs mb-1.5">نوع الزواج</span>
                <span className="font-bold text-slate-700">{request.marriage_type || "غير محدد"}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-slate-400 text-xs mb-1.5">القبيلة / الأصل</span>
                <span className="font-bold text-slate-700">{originDisplay || "غير محدد"}</span>
              </div>
            </div>

            <h3 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#c29b57]" /> النبذة الشخصية
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">
              {request.bio || "لا توجد نبذة مكتوبة حالياً في هذا الملف."}
            </p>
          </div>
        </div>

        {/* رسالة التنبيه */}
        <div className="bg-yellow-50/50 border border-yellow-100 rounded-2xl p-5 mb-6 text-center">
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            المعلومات المعروضة هي جزء من البيانات المسموح بنشرها، أما بقية التفاصيل والاستفسارات فتتم عبر الوسائل الخاصة المعتمدة حفاظاً على خصوصية أصحاب الملفات.
          </p>
        </div>

        {/* زر التواصل */}
        <a 
          href={`https://wa.me/966527585083?text=السلام عليكم، مهتم بفتح تواصل بخصوص الطلب رقم ${request.request_id || request.$id} وأرغب بمعرفة التفاصيل.`}
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full bg-[#0f172a] text-white py-4 rounded-xl font-bold hover:bg-[#1e293b] transition-colors shadow-lg shadow-[#0f172a]/10 flex items-center justify-center gap-2 text-base"
        >
          <HeartHandshake size={20} />
          طلب فتح تواصل
        </a>
        <p className="text-center text-xs text-slate-400 mt-4 mb-8 font-medium">
          يتم التنسيق والترتيب عبر الوسائل المعتمدة من المنصة حفاظاً على الخصوصية والجدية.
        </p>

      </div>
    </div>
  );
}
