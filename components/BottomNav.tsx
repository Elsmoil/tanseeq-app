"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, User, MoreHorizontal } from "lucide-react";

// أيقونة خاتم مخصصة لتتطابق مع التصميم بدقة
const RingIcon = ({ size = 24, strokeWidth = 2, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8.5 7.5L12 3l3.5 4.5h-7z" />
    <circle cx="12" cy="15" r="5.5" />
  </svg>
);

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "الرئيسية", href: "/", icon: Home, isSpecial: false },
    { name: "استكشف", href: "/explore", icon: Search, isSpecial: false },
    { name: "إنشاء ملفي", href: "/register", icon: User, isSpecial: true },
    { name: "خدمات الزواج", href: "/services", icon: RingIcon, isSpecial: false },
    { name: "المزيد", href: "/more", icon: MoreHorizontal, isSpecial: false },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 md:hidden font-sans">
      {/* حاوية الشريط الكحلية ذات الحواف الدائرية */}
      <div className="bg-[#0f172a] rounded-t-[2rem] flex justify-between items-center px-2 sm:px-4 h-[75px] shadow-[0_-10px_30px_rgba(0,0,0,0.15)] relative">
        
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          // 1. تصميم الدائرة الذهبية الطافية (إنشاء ملفي) - تم تصحيحها هنا
          if (item.isSpecial) {
            return (
              <div key={item.name} className="relative w-[75px] h-full flex items-start justify-center">
                <Link
                  href={item.href}
                  // الدائرة الآن مثالية (70x70) ومرفوعة للأعلى (-top-5) مع تدرج ذهبي أنيق
                  className="absolute -top-5 w-[70px] h-[70px] bg-gradient-to-b from-[#dcb466] to-[#b08836] rounded-full flex flex-col items-center justify-center text-[#0f172a] shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-transform hover:scale-105 z-20"
                >
                  <Icon size={24} strokeWidth={2} className="mb-0.5" />
                  <span className="text-[11px] font-bold mt-0.5">
                    {item.name}
                  </span>
                </Link>
              </div>
            );
          }

          // 2. تصميم الأزرار العادية الجانبية
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center h-full w-[16%] transition-colors duration-200 ${
                isActive ? "text-[#c29b57]" : "text-slate-300 hover:text-white"
              }`}
            >
              <Icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 1.5} 
                className={`mb-1.5 ${isActive ? "drop-shadow-md scale-110 text-[#c29b57]" : ""} transition-transform`} 
              />
              <span className={`text-[10px] whitespace-nowrap ${isActive ? "font-bold text-[#c29b57]" : "font-medium"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
        
      </div>
    </div>
  );
}
