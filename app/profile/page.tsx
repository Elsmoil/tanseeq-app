// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { User, MapPin, Calendar, LogOut, Loader2, ShieldCheck, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";
import PlaceholderAvatar from "@/components/PlaceholderAvatar";

export default function ProfilePage() {
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyRequest = async () => {
      try {
        // جلب رقم الطلب المحفوظ في جهاز المستخدم
        const localReqId = localStorage.getItem("mithaq_req_id");
        
        if (!localReqId) {
          setError("لا يوجد طلب مسجل في هذا الجهاز.");
          setLoading(false);
          return;
        }

        // البحث عن الطلب في قاعدة البيانات
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DB_ID as string,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID as string,
          [Query.equal("request_id", localReqId)]
        );

        if (response.documents.length > 0) {
          setRequest(response.documents[0]);
        } else {
          setError("لم يتم العثور على بيانات الطلب، ربما تم حذفه.");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("حدث خطأ أثناء جلب البيانات.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyRequest();
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("هل أنت متأكد من رغبتك في تسجيل الخروج؟");
    if (confirmLogout) {
      localStorage.removeItem("mithaq_submitted");
      localStorage.removeItem("mithaq_req_id");
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f8fafc]">
        <Loader2 className="w-12 h-12 text-[#c29b57] animate-spin mb-4" />
        <h2 className="text-xl font-bold text-[#0f172a]">جاري تحميل ملفك...</h2>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f8fafc] text-center" dir="rtl">
        <h2 className="text-2xl font-bold text-[#0f172a] mb-4">{error}</h2>
        <p className="text-slate-500 mb-8">إذا كنت قد سجلت مسبقاً من جهاز آخر، لا يمكنك الوصول لملفك من هنا حالياً حفاظاً على الخصوصية.</p>
        <Link href="/" className="px-8 py-3 bg-[#0f172a] text-white rounded-full font-bold hover:bg-[#1e293b] transition">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const isMen = request.type === "men" || request.type === "رجال" || request.gender === "ذكر";
  const statusColor = request.status === "منشور" || request.status === "مقبول" ? "bg-green-50 text-green-600 border-green-200" : 
                      request.status === "مرفوض" ? "bg-red-50 text-red-600 border-red-200" : 
                      "bg-yellow-50 text-yellow-600 border-yellow-200";

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 md:pb-10 pt-4 md:pt-10 px-4 flex justify-center" dir="rtl">
      <div className="max-w-2xl w-full">
        
        {/* شريط التنقل العلوي */}
        <div className="flex justify-between items-center mb-6 px-2">
          <Link href="/" className="w-10 h-10 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center text-[#0f172a] hover:bg-slate-50 transition">
            <ChevronRight size={20} />
          </Link>
          <span className="font-bold text-[#0f172a]">حسابي وطلبي</span>
          <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition" title="تسجيل الخروج">
            <LogOut size={20} />
          </button>
        </div>

        {/* كرت الملف الشخصي */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="bg-[#0f172a] pt-8 pb-16 px-6 text-center relative">
             <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-white rounded-full p-1.5 shadow-md border border-slate-100">
                <PlaceholderAvatar gender={isMen ? "men" : "women"} className="w-full h-full" />
             </div>
          </div>
          
          <div className="pt-14 pb-8 px-6 text-center border-b border-slate-50">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-2">{request.first_name || "مستخدم ميثاق"}</h2>
            <div className="flex items-center justify-center gap-4 text-sm font-medium">
              <span className="flex items-center gap-1 text-slate-500"><MapPin size={14} className="text-[#c29b57]" /> {request.region || request.city}</span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1 text-[#0f172a]" dir="ltr"> {request.request_id} <User size={14} className="text-[#c29b57]" /></span>
            </div>
            
            <div className="mt-6 flex justify-center">
               <span className={`px-5 py-2 rounded-full text-xs font-bold border ${statusColor}`}>
                 حالة الطلب: {request.status || "قيد المراجعة"}
               </span>
            </div>
          </div>

          {/* تفاصيل البيانات المُدخلة */}
          <div className="p-6 md:p-8">
            <h3 className="font-bold text-[#0f172a] mb-5 flex items-center gap-2">
              <FileText size={18} className="text-[#c29b57]" /> البيانات المسجلة
            </h3>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8 text-sm bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div>
                <span className="block text-slate-400 text-xs mb-1.5">العمر</span>
                <span className="font-bold text-slate-700">{request.age} سنة</span>
              </div>
              <div>
                <span className="block text-slate-400 text-xs mb-1.5">الحالة الاجتماعية</span>
                <span className="font-bold text-slate-700">{request.social_status || "غير محدد"}</span>
              </div>
              <div>
                <span className="block text-slate-400 text-xs mb-1.5">المهنة</span>
                <span className="font-bold text-slate-700">{request.job || "غير محدد"}</span>
              </div>
              <div>
                <span className="block text-slate-400 text-xs mb-1.5">نوع الزواج</span>
                <span className="font-bold text-slate-700">{request.marriage_type || "غير محدد"}</span>
              </div>
            </div>

            <h3 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#c29b57]" /> نبذتي
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6">
              {request.bio || "لم يتم كتابة نبذة."}
            </p>

            <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-4 border-t border-slate-100">
               <span className="flex items-center gap-1.5"><Calendar size={14} /> تاريخ التسجيل:</span>
               <span dir="ltr">{new Date(request.$createdAt).toLocaleDateString('en-GB')}</span>
            </div>
          </div>
        </div>

        {/* زر التعديل (معطل حالياً حسب طلب الإدارة) */}
        <button disabled className="w-full bg-white border border-slate-200 text-slate-400 py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-sm cursor-not-allowed">
          تعديل البيانات (مغلق من قبل الإدارة)
        </button>

      </div>
    </div>
  );
}
