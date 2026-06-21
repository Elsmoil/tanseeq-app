// app/explore/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, MapPin, GraduationCap, Briefcase, Filter, ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import PlaceholderAvatar from "@/components/PlaceholderAvatar";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";

export default function ExplorePage() {
 const [activeTab, setActiveTab] = useState<"women" | "men">("women");
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // حالات الفلاتر الجديدة (تعمل تلقائياً)
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterAge, setFilterAge] = useState("");
  const [filterSocialStatus, setFilterSocialStatus] = useState("");
  const [filterMarriageType, setFilterMarriageType] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        if (!process.env.NEXT_PUBLIC_APPWRITE_DB_ID) throw new Error("Missing Env Variables");

        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DB_ID,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID as string,
          [Query.limit(100)] 
        );
        
        // جلب الطلبات المنشورة فقط
        const approvedDocs = response.documents.filter(doc => doc.status === "منشور" || doc.status === "مقبول");
        setRequests(approvedDocs);
      } catch (error: any) {
        console.error("Error fetching requests:", error);
        setErrorMsg("حدث خطأ في جلب البيانات، يرجى المحاولة لاحقاً.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

const filteredRequests = requests.filter(req => {
    // 1. فلتر التبويب (الرجال/النساء)
const matchesTab = activeTab === "men" ? (req.type === "men" || req.type === "رجال") : (req.type === "women" || req.type === "نساء");
    
    // 2. البحث بالكلمات (رقم الطلب، المدينة، النبذة)
    const matchesSearch = !searchQuery || 
      req.request_id?.toString().includes(searchQuery) || 
      req.city?.includes(searchQuery) || 
      (req.bio && req.bio.includes(searchQuery));

    // 3. فلتر المدينة
    const matchesCity = !filterCity || req.city === filterCity || req.region === filterCity;

    // 4. فلتر العمر
    let matchesAge = true;
    if (filterAge === "20-30") matchesAge = req.age >= 20 && req.age <= 30;
    else if (filterAge === "31-40") matchesAge = req.age >= 31 && req.age <= 40;
    else if (filterAge === "41-50") matchesAge = req.age >= 41 && req.age <= 50;
    else if (filterAge === "+50") matchesAge = req.age > 50;

    // 5. فلتر الحالة الاجتماعية
    const matchesSocialStatus = !filterSocialStatus || req.social_status === filterSocialStatus;

    // 6. فلتر نوع الزواج
    const matchesMarriageType = !filterMarriageType || req.marriage_type === filterMarriageType;

    return matchesTab && matchesSearch && matchesCity && matchesAge && matchesSocialStatus && matchesMarriageType;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#fbf9f8] font-sans w-full pb-20 md:pb-10" dir="rtl">
      
      {/* 1. الهيدر الكحلي الجديد */}
      <div className="bg-[#0f172a] pt-14 pb-28 px-6 text-center rounded-b-[3rem] relative shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 relative z-10">استكشف الطلبات</h1>
        <p className="text-sm text-[#c29b57] relative z-10">تصفح الملفات المعتمدة بكل سرية وموثوقية</p>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 -mt-16 relative z-20">
        
        {/* 2. نظام التبويب (حسب المخطط) */}
        <div className="bg-white p-1.5 rounded-full shadow-md flex mb-8 border border-slate-100 max-w-md mx-auto">
          <button 
            onClick={() => setActiveTab("women")}
            className={`flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === "women" ? "bg-[#c29b57] text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
          >
            استكشف طلبات النساء
          </button>
          <button 
            onClick={() => setActiveTab("men")}
            className={`flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === "men" ? "bg-[#0f172a] text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
          >
            استكشف طلبات الرجال
          </button>
        </div>

        {/* 3. شريط الفلاتر (يعمل تلقائياً) */}
        <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 mb-10">
          <div className="flex items-center gap-2 mb-4 text-[#0f172a] font-bold text-sm px-1">
            <Filter size={18} className="text-[#c29b57]" />
            <span>تصفية النتائج</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* البحث بالكلمات (مطلب العميل) */}
            <div className="relative">
              <Search size={16} className="absolute right-4 top-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="البحث بالكلمات..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200 text-sm rounded-xl pr-10 pl-4 py-3 outline-none focus:border-[#c29b57] transition text-[#0f172a]"
              />
            </div>

            <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="bg-[#f8fafc] border border-slate-200 text-sm rounded-xl px-4 py-3 outline-none focus:border-[#c29b57] transition text-[#0f172a]">
              <option value="">المدينة (الكل)</option>
              <option value="الرياض">الرياض</option>
              <option value="جدة">جدة</option>
              <option value="مكة المكرمة">مكة المكرمة</option>
              <option value="الدمام">الدمام</option>
            </select>

            <select value={filterAge} onChange={(e) => setFilterAge(e.target.value)} className="bg-[#f8fafc] border border-slate-200 text-sm rounded-xl px-4 py-3 outline-none focus:border-[#c29b57] transition text-[#0f172a]">
              <option value="">العمر (الكل)</option>
              <option value="20-30">20 - 30 سنة</option>
              <option value="31-40">31 - 40 سنة</option>
              <option value="41-50">41 - 50 سنة</option>
              <option value="+50">أكثر من 50 سنة</option>
            </select>

            <select value={filterSocialStatus} onChange={(e) => setFilterSocialStatus(e.target.value)} className="bg-[#f8fafc] border border-slate-200 text-sm rounded-xl px-4 py-3 outline-none focus:border-[#c29b57] transition text-[#0f172a]">
              <option value="">الحالة الاجتماعية (الكل)</option>
              <option value="أعزب">أعزب / عزباء</option>
              <option value="مطلق">مطلق / مطلقة</option>
              <option value="أرمل">أرمل / أرملة</option>
              <option value="متزوج">متزوج</option>
            </select>

            <select value={filterMarriageType} onChange={(e) => setFilterMarriageType(e.target.value)} className="bg-[#f8fafc] border border-slate-200 text-sm rounded-xl px-4 py-3 outline-none focus:border-[#c29b57] transition text-[#0f172a]">
              <option value="">نوع الزواج (الكل)</option>
             <option value="معلن">معلن</option>
              <option value="مسيار">مسيار</option>
              <option value="لا يوجد تفضيل">لا يوجد تفضيل</option>
            </select>
          </div>
        </div>
        {/* 4. عرض البطاقات */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-[#c29b57] animate-spin mb-4" />
            <p className="text-slate-500 font-medium text-sm">جاري جلب الطلبات المعتمدة...</p>
          </div>
        ) : errorMsg ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-red-100 shadow-sm text-center px-4">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-red-600 font-bold mb-2">عذراً، لم نتمكن من جلب البيانات</p>
            <p className="text-slate-500 text-sm">{errorMsg}</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 font-medium">لا توجد طلبات معتمدة مطابقة لبحثك حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((req) => (
              <div key={req.$id} className="bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm hover:shadow-lg transition-all flex flex-col group">
                
                <div className="flex justify-between items-start mb-5 border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-3">
                    <PlaceholderAvatar gender={req.type === "رجال" || req.gender === "ذكر" ? "men" : "women"} className="w-14 h-14" />
                    <div>
                      <h3 className="font-bold text-[#0f172a] text-lg" dir="ltr">{req.request_id || `#MTQ-${req.$id.substring(0,4)}`}</h3>
                      <div className="flex items-center text-xs text-slate-500 mt-1 font-medium">
                        <MapPin size={12} className="ml-1 text-[#c29b57]" /> {req.region || req.city} • {req.age} سنة
                      </div>
                    </div>
                  </div>
                  <span className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-full">
                    {req.marriage_type || req.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-4 mb-5 text-xs">
                  <div className="flex items-center text-slate-600 font-medium">
                    <GraduationCap size={16} className="ml-1.5 text-[#c29b57]" /> {req.education_level || "غير محدد"}
                  </div>
                  <div className="flex items-center text-slate-600 font-medium">
                    <Briefcase size={16} className="ml-1.5 text-[#c29b57]" /> {req.job || "غير محدد"}
                  </div>
                </div>

                <p className="text-sm text-slate-500 leading-relaxed mb-6 line-clamp-2 flex-1">
                  "{req.bio || "لا توجد نبذة مكتوبة حالياً في هذا الملف."}"
                </p>

                <Link href={`/explore/${req.$id}`} className="w-full py-3.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-all shadow-sm bg-[#0f172a] text-white hover:bg-[#1e293b]">
                  عرض التفاصيل <ChevronLeft size={16} />
                </Link>
                
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
