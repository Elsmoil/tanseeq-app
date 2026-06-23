"use client";

import { useEffect, useState } from "react";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { MapPin, Loader2, ShieldCheck, Heart } from "lucide-react"; // إضافة أيقونات جديدة
import Link from "next/link";

// أيقونة الخاتم
const RingIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8.5 7.5L12 3l3.5 4.5h-7z" />
    <circle cx="12" cy="15" r="5.5" />
  </svg>
);

export default function RecentRequestsSlider() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_APPWRITE_DB_ID) return;
        const res = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DB_ID,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID as string,
          [
            Query.equal("status", ["منشور", "مقبول"]), 
            Query.orderDesc("$createdAt"),             
            Query.limit(8)                             
          ]
        );
        setRequests(res.documents);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  if (loading) return <div className="flex justify-center items-center py-16"><Loader2 className="animate-spin text-[#c29b57] w-8 h-8" /></div>;
  if (requests.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto hide-scrollbar py-4" dir="rtl">
      {/* تم تعديل الحواف (px-6) لكي تظهر أطراف البطاقات الجانبية بشكل واضح */}
      <div className="flex gap-3 px-6 snap-x w-max pb-4">
        {requests.map(req => {
          const isMale = req.type === 'men' || req.type === 'رجل' || req.type === 'ذكر' || req.gender === 'ذكر';
          const bgImage = isMale ? "/men-card-bg.png" : "/women-card-bg.png";
          const genderText = isMale ? "ذكر" : "أنثى";

          return (
            <Link href={`/explore/${req.$id}`} key={req.$id} 
              // تم تصغير العرض والطول بنسبة 20% تقريباً
              className="relative w-[145px] md:w-[190px] shrink-0 h-[210px] md:h-[260px] rounded-[1.5rem] overflow-hidden shadow-lg snap-center border border-[#c29b57]/40 group block bg-[#0f172a]">
              
              <div className="absolute inset-0 pointer-events-none">
                <div 
                  className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-50"
                  style={{ backgroundImage: `url('${bgImage}')` }}
                ></div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/70 to-transparent pointer-events-none"></div>

              {/* شارة التحقق (تم تصغيرها ووضعها بشكل أنيق في الزاوية) */}
              <div className="absolute top-2.5 right-2.5 bg-[#dcb466] text-[#0f172a] text-[7px] md:text-[8px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md z-10">
                <ShieldCheck size={8} strokeWidth={2.5} /> تم التحقق
              </div>

              {/* البيانات المختصرة */}
              <div className="absolute bottom-0 left-0 w-full p-3 text-white text-center z-10">
                <h3 className="text-sm md:text-base font-black mb-2 text-[#c29b57]">
                  {genderText} • {req.age} سنة
                </h3>
                
                <div className="flex flex-col gap-1.5 items-center justify-center text-[9px] md:text-[10px] text-slate-300 font-medium">
                  <div className="flex items-center gap-1">
                    <MapPin size={10} className="text-[#c29b57]" /> {req.city || req.region || "غير محدد"}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1"><Heart size={10} className="text-[#c29b57]" /> {req.social_status || "عزباء"}</span>
                    <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                    <span className="flex items-center gap-1"><RingIcon size={10} className="text-[#c29b57]" /> {req.marriage_type || "معلن"}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
